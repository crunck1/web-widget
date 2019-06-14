import Widget from './widget';
import {IMessage} from "../typings";

export default class Api {

    widget: Widget;

    constructor(widget: Widget) {
        this.widget = widget;
    }

    open() {
        this.widget.open();
    }

    close() {
        this.widget.close();
    }

    toggle() {
        this.widget.toggle();
    }

    isOpen() {
        return this.widget.state.isChatOpen === true;
    }


    setLocale(text: string){
        this.callChatWidget({
            method: 'setLocale',
            params: [
                text
            ]
        })
    }

    setBubbleAvatarUrl(text: string){
        this.widget.setbubbleAvatarUrl(text);
    }
    initBot(text: string){
        console.log("chiamo initBot sull api con messaggio="+text);
        this.callChatWidget({
            method: 'initBot',
            params: [
                text
            ]
        })
    }

    callChatWidget(payload: Object) {
        if (this.isOpen()) {
            console.log("la chat è aperta");
            (document.getElementById('chatBotManFrame') as HTMLIFrameElement).contentWindow.postMessage(payload, '*');
        } else {
            try {
                console.log("la chat NON è aperta");
                this.open();
                setTimeout(() => {
                    (document.getElementById('chatBotManFrame') as HTMLIFrameElement).contentWindow.postMessage(payload, '*');
                }, 750);
            } catch (e) {
                console.error(e);
            }
        }
    }

    writeToMessages(message: IMessage) {
        this.callChatWidget({
            method: 'writeToMessages',
            params: [
                message
            ]
        })
    }

    sayAsBot(text: string) {
        this.callChatWidget({
            method: 'sayAsBot',
            params: [
                text
            ]
        });
    }

    say(text: string) {
        this.callChatWidget({
            method: 'say',
            params: [
                text
            ]
        });
    }

    pseudosay(text: string) {
        this.callChatWidget({
            method: 'pseudosay',
            params: [
                text
            ]
        });
    }

    whisper(text: string) {
        this.callChatWidget({
            method: 'whisper',
            params: [
                text
            ]
        });
    }

}