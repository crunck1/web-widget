import { h, Component } from 'preact';
import {botman} from '../botman';
import MessageType from "./messagetype";
import { IButton, IMessage, IMessageTypeProps } from '../../typings';
import * as $ from "jquery";
import Chat from "../chat";

export default class ListType extends MessageType {

     imageContainer: any;
     div: any;

    constructor(){ 
      super();
      this.scroll = this.scroll.bind(this);

    }

    guidGenerator() {
        var S4 = function() {
           return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
        };
        return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
    }
    scroll(event : MouseEvent,direction: number){
       this.div = event.target; 
       let far= this.imageContainer.offsetWidth/2*direction;
       let id = this.imageContainer.id;     
       let pos = this.imageContainer.scrollLeft + far;
       this.setState({position: pos});
       
       $('#'+id).animate( { scrollLeft: pos }, 1000);

    }

    getButton(button: IButton) {
        if (button.type === 'postback') {
            return <div class="btn" onClick={() => this.performAction(button)}>
                {button.title}
            </div>;
        }
        if (button.type === 'web_url') {
            return <a class="btn" href={button.url} target="_blank">{button.title}</a>;
        }
    }
    componentDidMount() {
        setTimeout(() => {
    	             this.setState({
                        imgContainerDimensions: {
                            offsetWidth: this.imageContainer.offsetWidth,
                            scrollWidth: this.imageContainer.scrollWidth,
                        },
                    });
                }, 50);
        super.componentDidMount();
        console.log("finito componentDidMount");
          
    }

    setLeftArrowDisplay(){
        console.log("faccio setLeftArrowDisplay");
        console.log("imgContainer/2="+(this.state.imgContainerDimensions.offsetWidth/2));
        if(this.state.position+15>this.state.imgContainerDimensions.offsetWidth/2){
           console.log("mostro previous arrow");
           return 'display:inline';
        } 
        return 'display:none';
        
    }


    setRightArrowDisplay(){
            console.log("scrollWidth="+this.state.imgContainerDimensions.scrollWidth);
            console.log("offsetWidth="+this.state.imgContainerDimensions.offsetWidth);
            console.log("position="+this.state.position);
            if(this.state.imgContainerDimensions.scrollWidth-this.state.position>this.state.imgContainerDimensions.offsetWidth){
                    console.log("mostro next arrow");
                    return 'display:inline';
                }
        
        return 'display:none';
    }

    render(props: IMessageTypeProps) {
        const message = props.message;
        const imgContainerDimensions  = this.state.imgContainerDimensions;

        console.log(message.globalButtons.length );
        const globalButtons = (message.globalButtons != null && message.globalButtons.length >1) ? message.globalButtons.map((button: IButton) => {
            return this.getButton(button);
        }):'';



        const lists = message.elements.map((element) => {
            const elementButtons = (element.buttons != null && element.buttons.length >1) ? element.buttons.map((button: IButton) => {
                return this.getButton(button);
            }):'';
       
            return  (<li class="wc-carousel-item Scenario">
                        <section class="cards  Scenario"  onClick={()=>this.say(element.item_payload)}>
                            <section class="sectiontxt" style="height: 81px;">
                               
                                    {element.image_url ? 
                                    <img src={element.image_url}/> :
                                    <svg width="64" height="85" xmlns="http://www.w3.org/2000/svg">

                                    <g>
                                     <title>Layer 1</title>
                                    </g>
                                    <g>
                                     <title>background</title>
                                     <rect fill="none" id="canvas_background" height="402" width="582" y="-1" x="-1"/>
                                    </g> 
                                   </svg>}
                                 
                                <h1>{element.title}</h1>
                                <p>{element.subtitle}</p>
                            </section>
                        </section>
                    </li>);
        });

        
        return (
            <div>
                <div class="wc-carousel web">
                    <div>
                        <button class="scroll previous" style={this.state.imgContainerDimensions.offsetWidth && this.setLeftArrowDisplay() } id="test" onClick={((e) => this.scroll(e, -1))}><svg><path d="M 16.5 22 L 19 19.5 L 13.5 14 L 19 8.5 L 16.5 6 L 8.5 14 L 16.5 22 Z"></path></svg></button>
                            <div class="wc-hscroll-outer">
                                <div 
                                    class="wc-hscroll image-container"
                                    ref={imageContainer => {
                                            this.imageContainer = imageContainer ;
                                        }} 
                                    id={this.guidGenerator()} style="margin-bottom: -15px;" >
                                    <ul>
                                        {lists}
                                    </ul>
                                </div>
                            </div>
                        <button class="scroll next" style={this.state.imgContainerDimensions.offsetWidth && this.setRightArrowDisplay()} onClick={((e) => this.scroll(e, 1))}><svg><path d="M 12.5 22 L 10 19.5 L 15.5 14 L 10 8.5 L 12.5 6 L 20.5 14 L 12.5 22 Z"></path></svg></button>
                    </div>
                </div>
                {globalButtons}
            </div>
        ); 
    }
    say(text: string) {

            botman.callAPI(text, true, null, (msg: IMessage) => {
                this.props.messageHandler({
                    text: msg.text,
                    type: msg.type,
                    actions: msg.actions,
                    attachment: msg.attachment,
                    additionalParameters: msg.additionalParameters,
                    from: 'chatbot'
                });
            },null,(msg: IMessage) => {
                this.props.messageHandler({
                    text: text,
                    type: text,
                    from: 'visitor'
                });
            });
    }
    performAction(button: IButton) {
        botman.callAPI(button.payload, true, null, (msg: IMessage) => {
            this.props.messageHandler({
                text: msg.text,
                type: msg.type,
                actions: msg.actions,
                attachment: msg.attachment,
                additionalParameters: msg.additionalParameters,
                from: 'chatbot'
            });
        },null,null );
    }
}
