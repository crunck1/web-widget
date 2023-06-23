import axios from 'axios';
import {h, Component} from 'preact';
import ChatFrame from './chat-frame';
import ChatFloatingButton from './chat-floating-button';
import ChatTitleMsg from './chat-title-msg';
import ArrowIcon from './arrow-icon';
import Api from './api';
import {
    desktopTitleStyle,
    desktopWrapperStyle,
    mobileOpenWrapperStyle,
    mobileClosedWrapperStyle,
    desktopClosedWrapperStyleChat
} from './style';
import {IConfiguration, IMessage} from '../typings';
import Echo from "laravel-echo";

export default class Widget extends Component<any, IWidgetState> {

    Echo: Echo;

    state: IWidgetState;

    constructor() {
        super();
        this.state.isChatOpen = false;
        this.state.pristine = true;
        this.state.wasChatOpened = false;
        this.state.baloonSrc='';
        this.state.iframeReady=false;
        this.state.locale='';
    }

    componentDidMount() {
        window.botmanChatWidget = new Api(this);

        this.setupEcho();

        if (typeof this.props.conf.init === 'function') {
            this.props.conf.init(window.botmanChatWidget);
        }
        window.addEventListener("message", (event: MessageEvent) => {
            if(event.data.message=='ready')
                try {
                    this.setState({
                         iframeReady: true
                     });
                } catch (e) {
                    console.log(e);
                }
        });
    }

    private setupEcho() {
        if (this.props.conf.useEcho === true) {

            this.Echo = new Echo(this.props.conf.echoConfiguration);
            // Join channel
            let channel;
            if (this.props.conf.echoChannelType === 'private') {
                channel = this.Echo.private(this.props.conf.echoChannel);
            } else {
                channel = this.Echo.channel(this.props.conf.echoChannel);
            }

            channel.listen(this.props.conf.echoEventName, (message: IMessage) => {
                window.botmanChatWidget.writeToMessages(message);
            });
        }
    }

    render(props: IWidgetProps, state: IWidgetState) {


        const {conf, isMobile} = props;
        const params = conf && conf.chatServer? (new URL(conf.chatServer)).searchParams : null;
        const loc = params ? params.get("locale") : null;
        if(loc && this.state.locale == '') {
            this.setState({
                locale: loc
            });
        }
        const {isChatOpen, pristine, baloonSrc} = state;
        const wrapperWidth = {width: isMobile ? conf.mobileWidth : conf.desktopWidth};
        const desktopHeight = (window.innerHeight - 100 < conf.desktopHeight) ? window.innerHeight - 90 : conf.desktopHeight;
        conf.wrapperHeight = desktopHeight;
        const changeLanguage = conf.changeLanguage;

        let wrapperStyle;

        if (!isChatOpen && (isMobile || conf.alwaysUseFloatingButton)) {
            wrapperStyle = { ...mobileClosedWrapperStyle}; // closed mobile floating button
        } else if (!isMobile){
            wrapperStyle = (isChatOpen || this.state.wasChatOpened) ?
                (isChatOpen) ?
                    { ...desktopWrapperStyle, ...wrapperWidth} // desktop mode, button style
                    :
                    { ...desktopClosedWrapperStyleChat}
                :
                { ...desktopClosedWrapperStyleChat}; // desktop mode, chat style
        } else {
            wrapperStyle = mobileOpenWrapperStyle; // open mobile wrapper should have no border
        }



        return (

            <div style={wrapperStyle}>

                {/* Open/close button */}
                {(isMobile || conf.alwaysUseFloatingButton) && !isChatOpen ?

                    <ChatFloatingButton onClick={this.toggle} conf={conf} />

                    :

                    (isChatOpen || this.state.wasChatOpened) ?
                        (isChatOpen ?
                            <div style={{background: conf.mainColor, ...desktopTitleStyle}} >
                                <div style={{
                                    display: 'flex', alignItems: 'center', padding: '0px 30px 0px 0px',
                                    fontSize: '15px', fontWeight: 'normal', color: conf.headerTextColor
                                }}>
                                    {conf.title}
                                    {(changeLanguage === true) ?
                                    [
                                     <div style={ this.state.locale == 'it' || this.state.locale == '' ? {paddingLeft:10, fontWeight: 'bold', color:conf.headerTextColor} : {paddingLeft:10,  fontWeight: 'normal',color:conf.headerTextColor } } onClick={() =>this.setLocale('it')}>ITA</div>,
                                     <div style={{color:conf.headerTextColor,paddingLeft:2,paddingRight:2}}>|</div>,
                                     <div style={ this.state.locale == 'en' ? { fontWeight: 'bold', color:conf.headerTextColor} : { fontWeight: 'normal',color:conf.headerTextColor } } onClick={() => this.setLocale('en')}>ENG</div>,
                                     <div style={{color:conf.headerTextColor,paddingLeft:2,paddingRight:2}}>|</div>,
                                     <div style={ this.state.locale == 'fr' ? { fontWeight: 'bold', color:conf.headerTextColor} : { fontWeight: 'normal',color:conf.headerTextColor } } onClick={() => this.setLocale('fr')}>FR</div>
                                    ]
                                    :''}
                                </div>
                                <div onClick={this.toggle}>
                                    <ArrowIcon isOpened={isChatOpen}/>
                                </div>
                            </div> : <ChatTitleMsg onClick={this.toggle} conf={conf}  baloonSrc={baloonSrc}/>)
                        :
                        <ChatTitleMsg onClick={this.toggle} conf={conf} baloonSrc={baloonSrc}/>
                }

                {/*Chat IFrame*/}
                <div key='chatframe' style={{
                    display: isChatOpen ? 'block' : 'none',
                    height: isMobile ? conf.mobileHeight : desktopHeight
                }}>
                    {pristine ? null : <ChatFrame {...this.props} />}
                </div>

            </div>
        );
    }

    toggle = () => {
    	let stateData = {
            pristine: false,
            isChatOpen: !this.state.isChatOpen,
            wasChatOpened: this.state.wasChatOpened
    	};

    	if (!this.state.isChatOpen && !this.state.wasChatOpened) {
    	    if (this.props.conf.sendWidgetOpenedEvent) {
    	        this.sendOpenEvent();
            }
    		stateData.wasChatOpened = true;
    	}
    	this.setState(stateData);
        this.dispatch_event();

    };
    dispatch_event(){
        if(this.state.isChatOpen){
            const event = new Event('chat_opened');
            window.dispatchEvent(event);
        }
        else{
            const event = new Event('chat_closed');
            window.dispatchEvent(event);
        }
    }

    open() {
    	let stateData = {
            pristine: false,
            isChatOpen: true,
            wasChatOpened: true
    	};

    	if (!this.state.isChatOpen && !this.state.wasChatOpened) {
    	    if (this.props.conf.sendWidgetOpenedEvent) {
    	        this.sendOpenEvent();
            }
    	    stateData.wasChatOpened = true;
    	}
        this.setState(stateData);
        this.dispatch_event();
    }

    close() {
        this.setState({
            pristine: false,
            isChatOpen: false
        });
        this.dispatch_event();
    }
    initBot(text: string){
        window.botmanChatWidget.initBot(text);
    }
    setLocale(text: string) {
        this.setState({
            locale: text
        });
        window.botmanChatWidget.setLocale(text);
    }

    setbubbleAvatarUrl(url: string) {
        this.setState({
            baloonSrc: url
        });
    }

    private sendOpenEvent() {
        let data = new FormData();
        let intro = this.props.conf.introMessage || '';
        data.append('driver', 'web');
        data.append('eventName', 'widgetOpened');
        data.append('eventData', this.props.conf.widgetOpenedEventData);
       /*  console.log("chiamo initBot con messaggio="+intro); */
        window.botmanChatWidget.initBot(intro);

        if(this.props.conf.widgetOpenedEventData!='')
            axios.post(this.props.conf.chatServer, data).then(response => {
                const messages = response.data.messages || [];

                messages.forEach((message : IMessage) => {
                    window.botmanChatWidget.writeToMessages(message);
                });
            });
    }
}

interface IWidgetState {
    isChatOpen: boolean,
    pristine: boolean,
    wasChatOpened: boolean,
    baloonSrc: string,
    iframeReady: boolean,
    locale: string,
}


interface IWidgetProps {
    iFrameSrc: string,
    conf: IConfiguration,
    isMobile: boolean,
    baloonSrc: string,
}

declare global {
    interface Window { attachEvent: Function, botmanChatWidget: Api }
}

// FIXME: toGMTString is deprecated
interface IDate extends Date {
  toUTCString(): string;
}
