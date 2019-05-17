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
    
    setUserName(userFirstName: string,userLastName: string,userEmail: string) {
        this.userFirstName = userFirstName;
        this.userLastName  = userLastName;
        this.userEmail  = userEmail;
    }

    setChatServer(chatServer: string) {
        this.chatServer = chatServer;
    }

    callAPI = (text: string, interactive = false, attachment: IAttachment = null, perMessageCallback: Function, callback: Function,  prePostData: Function) => {
   
        if (prePostData) {
                prePostData(text);
        }
        let data = new FormData();
        let newlocale = typeof this.localeNew === 'undefined' ? '' : this.localeNew;
    	const postData: { [index: string] : string|Blob } = {
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

    };

}

export let botman = new BotMan();
