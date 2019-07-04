import {h, render} from 'preact';
import Widget from './widget';
import {defaultConfiguration} from './configuration';
import {IConfiguration} from "../typings";
import 'preact/devtools';

if (window.attachEvent) {
    window.attachEvent('onload', injectChat);
} else {
    window.addEventListener('load', injectChat, false);
}

function getUrlParameter(name: string, defaults = '') {
    name = name.replace(/[[]/, '\\[').replace(/[]]/, '\\]');
    let regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    let results = regex.exec(document.getElementById('botWidget').getAttribute('src'));
    return results === null ? defaults : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

function getUserId(conf: IConfiguration) {
    if(conf.userId)
        return conf.userId;
    let userId  = window.localStorage.getItem("userId");
    if(userId)
        return userId;
    return generateRandomId();
}

function getUserFirstName(conf: IConfiguration) {
    return conf.userFirstName || '';
}

function getUserLastName(conf: IConfiguration) {
    return conf.userLastName || '';
}

function getUserEmail(conf: IConfiguration) {
    return conf.userEmail || '';
}


function generateRandomId() {
    let userId = Math.random().toString(36).substr(2, 9);
    window.localStorage.setItem("userId",userId);        
    return userId;
}

function injectChat() {
    let root = document.createElement('div');
    root.id = 'botWidgetRoot';
    //root.setAttribute("style", "color:red; height:100%;");
    document.getElementsByTagName('body')[0].appendChild(root);

    let settings = {};
    try {
        settings = JSON.parse(getUrlParameter('settings', '{}'));
    } catch (e) { }

    const dynamicConf = window.botWidget || {} as IConfiguration; // these configuration are loaded when the chat frame is opened

    dynamicConf.userId = getUserId({...defaultConfiguration, ...dynamicConf});
    
    dynamicConf.userFirstName = getUserFirstName({...defaultConfiguration, ...dynamicConf});
    
    dynamicConf.userLastName = getUserLastName({...defaultConfiguration, ...dynamicConf});
    
    dynamicConf.userEmail = getUserEmail({...defaultConfiguration, ...dynamicConf});

    if (typeof dynamicConf.echoChannel === 'function') {
        dynamicConf.echoChannel = dynamicConf.echoChannel(dynamicConf.userId);
    }

    const conf = {...defaultConfiguration, ...settings, ...dynamicConf};

    const iFrameSrc = conf.frameEndpoint;
    const baloonSrc = conf.bubbleAvatarUrl;

    render(
        <Widget
            isMobile={window.screen.width < 500}
            iFrameSrc={iFrameSrc}
            baloonSrc={baloonSrc}
            conf={conf}
        />,
        root
    );

}

declare global {
    interface Window { attachEvent: Function, botWidget: IConfiguration }
}
