import  { Request, Response} from "express";
import * as Nano from 'nano';
import { sendMessage } from "../services/whatsappService";
import { Conversation, Questionnaire } from "../model/Form";
import { ConfigDocument } from "../model/Config";

let nano = Nano.default(`${process.env.COUCHDB_PROTOCOL}://${process.env.COUCHDB_USER}:${process.env.COUCHDB_PASS}@${process.env.COUCHDB_HOST}:${process.env.COUCHDB_PORT}`);

interface iMessageBodyFromUser {
    profile_name: string;
    phone_number: string;
    response_id: string | undefined,
    type: string,
    value: string | undefined,
    hashTagStarter: boolean
}

export function VerifiedToken ( req:Request, res: Response ) {

    try {
        const accessToken = "ksXrsT8pO0QYiy8M2MsqBdQLCQb0Cc0wYllC2kif";
        const token = req.query["hub.verify_token"];
        const challenge = req.query["hub.challenge"];
        
        if( !challenge || !token || token != accessToken ){
            throw new Error('Invalid query params...');
        } else {
            res.send(challenge);
        }
        
    }
    catch(e){
        res.status(400).send();
    }
    
}

function getMessageInfo ( reqBody: any) : (iMessageBodyFromUser | undefined)  {

    try {
        const entry = reqBody.entry[0];
        const changes = entry.changes[0];
        const value = changes.value;
        const contact = value.contacts[0];
        const messageResp = value.messages;
    
        if( !messageResp ) return undefined;

        if( messageResp.length > 0 ){
            const itemWithMsg = messageResp.find( (i:any) => i.type == 'text' )
            if( itemWithMsg )
            return {   
                profile_name: contact.profile.name,
                phone_number: messageResp[0].from,
                type: 'text',
                value: itemWithMsg.text.body,
                response_id: '',
                hashTagStarter: itemWithMsg.text.body[0] == '#'
            }

            const itemReplyButton = messageResp.find( (i:any) => i.type == 'interactive')
            if( itemReplyButton ){
                if(itemReplyButton.interactive.type == 'button_reply'){
                    return { 
                        profile_name: contact.profile.name,
                        phone_number: messageResp[0].from,
                        type: 'button_reply',
                        value: itemReplyButton.interactive.button_reply.title,
                        response_id: itemReplyButton.interactive.button_reply.id,
                        hashTagStarter: false 
                    }
                }
            }
        }
    }
    catch(e){
        return undefined;
    }
}



export async function ReceiveMessage (req: Request, res: Response) {
    
    try {

        
        const messageInfo = getMessageInfo ( req.body );
        
        if( !!messageInfo ){

            if( messageInfo.type == 'text' ){

                const db = nano.use(process.env.COUCHDB_NAME!); 
                const welcomeMsg:ConfigDocument =  await db.get('config');
                await sendMessage(welcomeMsg.welcome_message!);
    
            }

        }

        

        /**
         * 1) Determine User Message Type
         * -> Start a conversacion using keywords
         * -> Response to a form question
         * 
         * 
         * 2) Determine Bot response
         * -> Overall menu (when no conversation started)
         * -> One of N question (based on conversation history)
         * -> 
         */

        /**Necesitamos saber si este usuario ya tiene una conversacion iniciada 
         * 
         * Si la conversacion ya esta iniciada, necesitamos saber en donde se quedo
         * Una conversacion debe guardarse solo una vez al detectar el #holaclau
         * Una vez guardada, las siguientes veces que usuario introduce un #holaclau simplemente
         * el robor respondera con la ultima pregunta en la que se quedo
        */



        // const messageInfo = getMessageInfo ( req.body );
        
        // if( !!messageInfo ){

        //     /** search the Questionnaire by the #keyword */
        //     if( messageInfo.hashTagStarter ){
        //         const searchFormId = messageInfo.value?.slice(1);
        //         if( !!searchFormId ){ // search keyword not empty
        //             try {
        //                 // Questionnaire exist!
        //                 const formInfo = await db.get(searchFormId!);
        //                 /** Check if conversation already exist  */
        //                 const conversationId = `${searchFormId}|${messageInfo.phone_number}`
        //                 try{
        //                     await db.get(conversationId);
        //                     /** If exist, Must continue with the fillup */
        //                 }
        //                 catch(e){
        //                     /** When does not exist, must create it and start filling up */
        //                     const conversationDoc = new Conversation(conversationId);
        //                     /** Based on the Form, build the replay data array */
                            

        //                     await db.insert(conversationDoc);

        //                 }
        //             }   
        //             catch(e){
        //                 // Questionnaire does not exist
        //                 console.log('Form does not exist')
        //             }

        //         }
        //     }


        // }
 
        res.send("EVENT_RECEIVED")
    }
    catch(e){
        console.log(e);
        res.send("EVENT_RECEIVED");
    }
}

export async function SendTextMessage(req: Request, res: Response ){

    try {

        await sendMessage(req.body.text);
        res.send('Ok')
    }
    catch(e){
        console.log(e);
        res.status(400).send(e)
    }
}