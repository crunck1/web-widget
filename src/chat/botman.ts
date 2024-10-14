import axios from 'axios';
import { IAttachment, IMessage } from './../typings';

class BotMan {

  userId: string;
  userFirstName: string;
  userLastName: string;
  userEmail: string;
  chatServer: string;
  localeNew: string;

  setLocale(localeNew: string) {
    this.localeNew = localeNew;
  }

  setUserId(userId: string) {
    this.userId = userId;
  }

  setUserName(userFirstName: string, userLastName: string, userEmail: string) {
    this.userFirstName = userFirstName;
    this.userLastName = userLastName;
    this.userEmail = userEmail;
  }

  setChatServer(chatServer: string) {
    this.chatServer = chatServer;
  }

  callAPI = (
    text: string,
    interactive = false,
    attachment: IAttachment = null,
    perMessageCallback: Function,
    callback: Function,
    prePostData: Function,
    channel: string = null
  ) => {
    // Se prePostData è definita, chiamala con il testo
    if (prePostData) {
      prePostData(text);
    }

    if (channel == 'stream')
      this.callAPI_Stream(
        text,
        interactive,
        attachment,
        perMessageCallback,
        callback)
    else
      this.callAPI_Buffer(
        text,
        interactive,
        attachment,
        perMessageCallback,
        callback
      )

  };

  callAPI_Stream = (
    text: string,
    interactive = false,
    attachment: IAttachment = null,
    perMessageCallback: Function,
    callback: Function
  ) => {

    // Prepara i dati da inviare
    const postData = {
      driver: 'web',
      userId: this.userId,
      userFirstName: this.userFirstName,
      userLastName: this.userLastName,
      userEmail: this.userEmail,
      message: text,
      attachment: attachment, // Se c'è un allegato
      interactive: interactive ? '1' : '0',
      localeNew: this.localeNew || '',
      agent_id: "c639a2e9-952d-4ef2-8f7e-fe5673f871c9"
    };

    var id = BotMan.generateUuid();
    // Effettua la richiesta con fetch per supportare lo streaming
    fetch(this.chatServer, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    })
      .then((response) => {
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');

        // Funzione per leggere i chunk di dati dallo stream
        function read() {
          reader.read().then(({ done, value }) => {
            if (done) {
              console.log('Stream completato');
              if (callback) {
                callback(); // Chiama callback quando lo stream è completato
              }
              return;
            }

            // Decodifica il chunk
            const chunk = decoder.decode(value, { stream: true }).trim();

            const chunks = chunk.split('\ndata: ')
              .map(c => c.replace(/^data: /, ''))
              .filter(c => c.trim() !== "" && c.trim() !== "[DONE]"); // Rimuove "data: " usando una regex


            chunks.forEach(jsonChunk => {
              // console.log("jsonChunk", jsonChunk)
              try {
                const parsedData = JSON.parse(jsonChunk.trim());
                console.log("parsedData.content,", parsedData.content)
                // Gestisci i dati come desiderato
                try {
                  const msg = {
                    id: id,
                    text: parsedData.content,
                    type: "text",
                    from: 'chatbot'
                  }

                  // Se il tipo è 'token', gestisci il frammento di testo
                  if (parsedData.type === 'token') {
                    if (perMessageCallback) {

                      perMessageCallback(msg); // Passa il contenuto al callback
                    }
                    // Gestisci il messaggio finale
                    if (callback) {
                      callback(msg);
                    }
                  }
                } catch (error) {
                  console.error('Errore nel parsing del JSON:', error);
                }
              } catch (error) {
                console.error('Errore nel parsing del JSON:', error);
              }
            });
            // Continua a leggere lo stream
            read();
          });
        }

        read(); // Avvia la lettura dello stream
      })
      .catch((error) => {
        console.error('Errore nella chiamata API:', error);
      });
  }

  static generateUuid = () => {
    let uuid = '', ii;
    for (ii = 0; ii < 32; ii += 1) {
      switch (ii) {
        case 8:
        case 20:
          uuid += '-';
          uuid += (Math.random() * 16 | 0).toString(16);
          break;
        case 12:
          uuid += '-';
          uuid += '4';
          break;
        case 16:
          uuid += '-';
          uuid += (Math.random() * 4 | 8).toString(16);
          break;
        default:
          uuid += (Math.random() * 16 | 0).toString(16);
      }
    }
    return uuid;
  }

  callAPI_Buffer = (
    text: string,
    interactive = false,
    attachment: IAttachment = null,
    perMessageCallback: Function,
    callback: Function
  ) => {

    let data = new FormData();
    let newlocale = typeof this.localeNew === 'undefined' ? '' : this.localeNew;
    const postData: { [index: string]: string | Blob } = {
      driver: 'web',
      userId: this.userId,
      userFirstName: this.userFirstName,
      userLastName: this.userLastName,
      userEmail: this.userEmail,
      message: text,
      attachment: attachment as Blob,
      interactive: interactive ? '1' : '0',
      localeNew: newlocale
    };

    Object.keys(postData).forEach(key => data.append(key, postData[key]));

    axios.post(this.chatServer, data).then(response => {
      const messages = response.data.messages || [];

      if (perMessageCallback) {
        messages.forEach((msg: IMessage) => {
          perMessageCallback(msg);
        });
      }

      if (callback) {
        callback(response.data);
      }
    });

  }
}

export let botman = new BotMan();
