import { Request, Response } from "express";
import * as Nano from "nano";
import { sendMessage } from "../services/whatsappService";
import { Conversation, Form, iQuestionElement, iReplyElement } from "../model/Form";


let nano = Nano.default(
  `${process.env.COUCHDB_PROTOCOL}://${process.env.COUCHDB_USER}:${process.env.COUCHDB_PASS}@${process.env.COUCHDB_HOST}:${process.env.COUCHDB_PORT}`
);

interface iMessageBodyFromUser {
  profile_name: string;
  phone_number: string;
  response_id: string | undefined;
  type: string;
  value: string | undefined;
  hashTagStarter: boolean;
}

export function VerifiedToken(req: Request, res: Response) {
  try {
    const accessToken = "ksXrsT8pO0QYiy8M2MsqBdQLCQb0Cc0wYllC2kif";
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (!challenge || !token || token != accessToken) {
      throw new Error("Invalid query params...");
    } else {
      res.send(challenge);
    }
  } catch (e) {
    res.status(400).send();
  }
}

function getMessageInfo(reqBody: any): iMessageBodyFromUser | undefined {
  try {
    const entry = reqBody.entry[0];
    const changes = entry.changes[0];
    const value = changes.value;
    const contact = value.contacts[0];
    const messageResp = value.messages;

    if (!messageResp) return undefined;

    if (messageResp.length > 0) {
      const itemWithMsg = messageResp.find((i: any) => i.type == "text");
      console.log(entry);
      if (itemWithMsg)
        return {
          profile_name: contact.profile.name,
          phone_number: messageResp[0].from,
          type: "text",
          value: itemWithMsg.text.body,
          response_id: "",
          hashTagStarter: itemWithMsg.text.body[0] == "#",
        };

      const itemReplyButton = messageResp.find(
        (i: any) => i.type == "interactive"
      );
      if (itemReplyButton) {
        if (itemReplyButton.interactive.type == "button_reply") {
          return {
            profile_name: contact.profile.name,
            phone_number: messageResp[0].from,
            type: "button_reply",
            value: itemReplyButton.interactive.button_reply.title,
            response_id: itemReplyButton.interactive.button_reply.id,
            hashTagStarter: false,
          };
        }
      }
    }
  } catch (e) {
    return undefined;
  }
}

async function getCreateConversation( conversationId:string ) {

    const db = nano.use(process.env.COUCHDB_NAME!);
    const splitId = conversationId.split("|"); // split[0]: formId, split[1]:phoneNumber

    try {
        // Questionnaire exist!
        if( !(splitId.length > 0) ) throw new Error()
        const respFind: Nano.DocumentGetResponse = await db.get(splitId[0]);
        const newForm = Form.populateForm(respFind as Form);

        // Extracts list of questions from Form and post it at thew new record
        const repliesNew = newForm.questions.map( (i:iQuestionElement) => ({
          order: i.order,
          question_title: i.question_title,
          type: i.type,
          reply: {
            text: '',
            id: ''
          }
        }))
        
        try {
          return await db.get(conversationId) as Conversation;
        } catch (e) {
          /** When does not exist, must create it and start filling up */
          const conversationDoc = new Conversation( conversationId,repliesNew);
          const resp: Nano.DocumentInsertResponse = await db.insert(conversationDoc);
          //// this parts adds the flag for what conversation is active
          await db.insert({
              _id: splitId[1],
              collection_name: "CONTACT",
              forms: [{ id: splitId[0], active: true }] } as any );

          conversationDoc.processNewConversationResponse( resp );
          return conversationDoc as Conversation;
        }

      } 
      catch (e) {
          // Questionnaire does not exist
          return undefined;
      }
}

async function getWelcomeMessage(){

  try {
    const db = nano.use(process.env.COUCHDB_NAME!);
    const configDoc:any = await db.get('config');
    return configDoc.welcome_message;
  }
  catch(e){
    return undefined
  }
}

async function updateConversation( data: Conversation ){
      try {
        const db = nano.use(process.env.COUCHDB_NAME!);
        const response = await db.insert(data);
        data.processNewConversationResponse(response);
      }
      catch(e){
        return undefined
      }
}

async function checkActiveConversation (phoneNumber: string) {
  
  if( !phoneNumber) 
    return undefined;

  try {
      /// check if the user has an started conversation
      const db = nano.use(process.env.COUCHDB_NAME!);
      const conversationsData: any = await db.get(phoneNumber);
      const activeConversation = conversationsData.forms.find( (i:any) => (i.active))
      if( !activeConversation ) return undefined;
      return `${activeConversation.id}|${phoneNumber}` ;
  }
  catch(e){
    return undefined
  }

}

export async function ReceiveMessage(req: any, res: Response) {
  try {
    const messageInfo = getMessageInfo(req.body);

    if (!!messageInfo) {
      
      
      const conversationId = await checkActiveConversation(messageInfo.phone_number);

      if( messageInfo.type == 'text' && !messageInfo.hashTagStarter ){
        // console.log("User: ",messageInfo.value);
        
        if( conversationId ){
          // here save the response message and increment progress flag on conversation document
          const conversationDoc = await getCreateConversation( conversationId );
            if( conversationDoc ){
              /// updates the Reply element of an reply array
              conversationDoc.progress = conversationDoc.progress + 1;              

              const replyUpdate: iReplyElement = {
                order: conversationDoc.progress,
                question_title: '',
                type: 'free',
                reply: {
                  text: messageInfo.value ? messageInfo.value : '',
                  id: ''
                }
              }
              const replsNew = conversationDoc.replies.map( (i:any)=>(
                  i.order != replyUpdate.order ?{...i} :  {...i, reply: replyUpdate.reply }
              ))
              
              conversationDoc.replies = replsNew;
              updateConversation(conversationDoc);

              if ( conversationDoc.replies.length > (conversationDoc.progress + 1) )
              {
                sendMessage(conversationDoc.replies[conversationDoc.progress + 1].question_title, )
                // console.log("Bot: ",conversationDoc.replies[conversationDoc.progress + 1].question_title);
              } else {
                // console.log("Bot: El formulario ha terminado, muchas gracias por tus respuestas! Hasta luego");
                sendMessage("El formulario ha terminado, muchas gracias por tus respuestas! Hasta luego");
              }
              
              
            } 
           
        }
        else {
          // User send a message to the bot, but hast not started a conversation
          const welcomeMsg = await getWelcomeMessage();
          // console.log("Bot: ",welcomeMsg);
          sendMessage(welcomeMsg)
        }
      }

      if( messageInfo.hashTagStarter && !conversationId ){
        // When user enter #, searchs for a conversation, if does not exist it creates it.
        // returns undefined when #form does not exist
        const newConversationId = `${messageInfo.value?.slice(1)}|${messageInfo.phone_number}`;
        
        const conversationDoc = await getCreateConversation( newConversationId ) ;
        if( conversationDoc){
          // console.log("User:" , messageInfo.value);
          // console.log("Bot:", conversationDoc.replies[conversationDoc.progress+1].question_title)
          sendMessage(conversationDoc.replies[conversationDoc.progress+1].question_title)
        }

      }
      
    }

    res.send("EVENT_RECEIVED");
  } catch (e) {
    console.log(e);
    res.send("EVENT_RECEIVED");
  }
}

export async function SendTextMessage(req: Request, res: Response) {
  try {
    await sendMessage(req.body.text);
    res.send("Ok");
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
}
