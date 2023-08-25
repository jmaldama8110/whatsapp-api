"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendTextMessage = exports.ReceiveMessage = exports.VerifiedToken = void 0;
const Nano = __importStar(require("nano"));
const whatsappService_1 = require("../services/whatsappService");
let nano = Nano.default(`${process.env.COUCHDB_PROTOCOL}://${process.env.COUCHDB_USER}:${process.env.COUCHDB_PASS}@${process.env.COUCHDB_HOST}:${process.env.COUCHDB_PORT}`);
function VerifiedToken(req, res) {
    try {
        const accessToken = "ksXrsT8pO0QYiy8M2MsqBdQLCQb0Cc0wYllC2kif";
        const token = req.query["hub.verify_token"];
        const challenge = req.query["hub.challenge"];
        if (!challenge || !token || token != accessToken) {
            throw new Error('Invalid query params...');
        }
        else {
            res.send(challenge);
        }
    }
    catch (e) {
        res.status(400).send();
    }
}
exports.VerifiedToken = VerifiedToken;
function getMessageInfo(reqBody) {
    const entry = reqBody.entry[0];
    const changes = entry.changes[0];
    const value = changes.value;
    const contact = value.contacts[0];
    const messageResp = value.messages;
    if (!messageResp)
        return undefined;
    if (messageResp.length > 0) {
        const itemWithMsg = messageResp.find((i) => i.type == 'text');
        if (itemWithMsg)
            return {
                profile_name: contact.profile.name,
                phone_number: messageResp[0].from,
                type: 'text',
                value: itemWithMsg.text.body,
                response_id: '',
                hashTagStarter: itemWithMsg.text.body[0] == '#'
            };
        const itemReplyButton = messageResp.find((i) => i.type == 'interactive');
        if (itemReplyButton) {
            if (itemReplyButton.interactive.type == 'button_reply') {
                return {
                    profile_name: contact.profile.name,
                    phone_number: messageResp[0].from,
                    type: 'button_reply',
                    value: itemReplyButton.interactive.button_reply.title,
                    response_id: itemReplyButton.interactive.button_reply.id,
                    hashTagStarter: false
                };
            }
        }
    }
    return undefined;
}
function ReceiveMessage(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const db = nano.use(process.env.COUCHDB_NAME);
            const welcomeMsg = yield db.get('config');
            yield (0, whatsappService_1.sendMessage)(welcomeMsg.welcome_message);
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
            res.send("EVENT_RECEIVED");
        }
        catch (e) {
            console.log(e);
            res.send("EVENT_RECEIVED");
        }
    });
}
exports.ReceiveMessage = ReceiveMessage;
function SendTextMessage(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield (0, whatsappService_1.sendMessage)(req.body.text);
            res.send('Ok');
        }
        catch (e) {
            console.log(e);
            res.status(400).send(e);
        }
    });
}
exports.SendTextMessage = SendTextMessage;
