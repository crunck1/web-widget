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
        prePostData: Function
      ) => {
        // Se prePostData è definita, chiamala con il testo
        if (prePostData) {
          prePostData(text);
        }
      
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
        };
      
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
                var text = '';
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
                
                // Verifica se chunk è una stringa e inizia con "data: "
                if (typeof chunk === 'string' && chunk.indexOf("data: ") === 0) {
                  const jsonString = chunk.slice(6); // Rimuove "data: "
                  try {
                    const parsedData = JSON.parse(jsonString); // Esegue il parsing del JSON
                    text +=  parsedData.content
                    const msg =  {
                        id: BotMan.generateUuid(),
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
                }
      
                // Continua a leggere lo stream
                read();
              });
            }
      
            read(); // Avvia la lettura dello stream
          })
          .catch((error) => {
            console.error('Errore nella chiamata API:', error);
          });
      };
      
      static generateUuid = ()=> {
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

    callAPI_old = (text: string, interactive = false, attachment: IAttachment = null, perMessageCallback: Function, callback: Function, prePostData: Function) => {

        if (prePostData) {
            prePostData(text);
        }
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

/*         axios.post(this.chatServer, data).then(response => {
            const messages = response.data.messages || [];

            if (perMessageCallback) {
                messages.forEach((msg: IMessage) => {
                    perMessageCallback(msg);
                });
            }

            if (callback) {
                callback(response.data);
            }
        }); */

        const url = 'http://localhost/stream';

        // Dati JSON da inviare
        let n = {
            "message" : "prova"
        }

        // Invia la richiesta POST e gestisci lo streaming
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(n) // Converti il JSON in stringa
        })
            .then(response => {
                const reader = response.body.getReader();
                const decoder = new TextDecoder("utf-8");

                // Funzione ricorsiva per leggere il flusso
                function read() {
                    reader.read().then(({ done, value }) => {
                        if (done) {
                            console.log("Stream completato");
                            return;
                        }

                        // Decodifica il chunk e loggalo nella console
                        const chunk = decoder.decode(value, { stream: true });
         /*                if(chunk.type == 'token')
                        perMessageCallback(chunk,content); */
                        console.log(chunk);

                        // Continua a leggere il flusso
                        read();
                    });
                }

                read(); // Avvia la lettura dello stream
            })
            .catch(error => {
                console.error("Errore durante la lettura dello stream:", error);
            });


    };

}

export let botman = new BotMan();
