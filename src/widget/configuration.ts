import { IConfiguration } from "../typings";

export const defaultConfiguration: IConfiguration = {
    chatServer: '/botman',
    frameEndpoint: '/botman/chat',
    timeFormat: 'HH:MM',
    dateTimeFormat: 'm/d/yy HH:MM',
    title: 'BotMan Widget',
    cookieValidInDays: 1,
    introMessage: '',
    placeholderText: 'Send a message...',
    displayMessageTime: true,
    sendWidgetOpenedEvent: false,
    widgetOpenedEventData: '',
    mainColor: '#408591',
    headerTextColor: '#333',
    bubbleBackground: '#408591',
    chatBackground: '',
    chatBackgroundColor: '#f9f9f9',
    visitorMessageBackgroundColor: '',
    chatbotMessageBackgroundColor: '',
    bubbleAvatarUrl: '',
    desktopHeight: 450,
    desktopWidth: 370,
    mobileHeight: '100%',
    mobileWidth: '300px',
    videoHeight: 160,
    aboutLink: 'https://www.botsolver.com',
    aboutText: '⚡ Powered by Botsolver',
    chatId: '',
    userId: '',
    userFirstName: '',
    userLastName: '',
    userEmail: '',
    alwaysUseFloatingButton: false,
    useEcho: false,
    echoChannel: (userId: string) => '',
    echoConfiguration: {},
    echoEventName: '.message.created',
    echoChannelType: 'private',
    changeLanguage: false
    
};
