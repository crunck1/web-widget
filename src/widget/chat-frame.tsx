import { h, Component } from 'preact';
import { IConfiguration } from '../typings';

export default class ChatFrame extends Component<any, any> {

    shouldComponentUpdate() {
        // do not re-render via diff:
        return false;
    }

    render({iFrameSrc, isMobile, conf}: IChatFrameProps,{}) {
        console.log('chatBackgroundColor='+conf.chatBackgroundColor);
        let dynamicConf = window.botWidget || {} as IConfiguration; // these configuration are loaded when the chat frame is opened
        let encodedConf = encodeURIComponent(JSON.stringify({...conf, ...dynamicConf}));
        return (
            <iframe id="chatBotManFrame" src={iFrameSrc + '?conf=' + encodedConf}
                width='100%'
                height={isMobile ? '94%' : '100%'}
                frameBorder='0'
                allowTransparency
                style={dynamicConf.chatBackgroundColor?'background-color:'+dynamicConf.chatBackgroundColor:'  background: #f9f9f9'} />
        );
    }
}

interface IChatFrameProps {
    iFrameSrc: string,
    conf: IConfiguration,
    isMobile: boolean,
}