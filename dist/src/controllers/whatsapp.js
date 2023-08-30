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
exports.ReceiveMessage = exports.VerifiedToken = void 0;
const Nano = __importStar(require("nano"));
const whatsappService_1 = require("../services/whatsappService");
const Form_1 = require("../model/Form");
let nano = Nano.default(`${process.env.COUCHDB_PROTOCOL}://${process.env.COUCHDB_USER}:${process.env.COUCHDB_PASS}@${process.env.COUCHDB_HOST}:${process.env.COUCHDB_PORT}`);
function VerifiedToken(req, res) {
    try {
        const accessToken = "ksXrsT8pO0QYiy8M2MsqBdQLCQb0Cc0wYllC2kif";
        const token = req.query["hub.verify_token"];
        const challenge = req.query["hub.challenge"];
        if (!challenge || !token || token != accessToken) {
            throw new Error("Invalid query params...");
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
    try {
        const entry = reqBody.entry[0];
        const changes = entry.changes[0];
        const value = changes.value;
        const contact = value.contacts[0];
        const messageResp = value.messages;
        if (!messageResp)
            return undefined;
        if (messageResp.length > 0) {
            const itemWithMsg = messageResp.find((i) => i.type == "text");
            if (itemWithMsg)
                return {
                    profile_name: contact.profile.name,
                    phone_number: messageResp[0].from,
                    type: "text",
                    value: itemWithMsg.text.body,
                    response_id: "",
                    hashTagStarter: itemWithMsg.text.body[0] == "#",
                };
            const itemReplyButton = messageResp.find((i) => i.type == "interactive");
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
    }
    catch (e) {
        return undefined;
    }
}
function getCreateConversation(conversationId) {
    return __awaiter(this, void 0, void 0, function* () {
        const db = nano.use(process.env.COUCHDB_NAME);
        const splitId = conversationId.split("|"); // split[0]: formId, split[1]:phoneNumber
        try {
            // Questionnaire exist!
            if (!(splitId.length > 0))
                throw new Error();
            const respFind = yield db.get(splitId[0]);
            const newForm = Form_1.Form.populateForm(respFind);
            // Extracts list of questions from Form and post it at thew new record
            const repliesNew = newForm.questions.map((i) => ({
                order: i.order,
                question_title: i.question_title,
                type: i.type,
                reply: {
                    text: '',
                    id: ''
                }
            }));
            try {
                return yield db.get(conversationId);
            }
            catch (e) {
                /** When does not exist, must create it and start filling up */
                const conversationDoc = new Form_1.Conversation(conversationId, repliesNew);
                const resp = yield db.insert(conversationDoc);
                //// this parts adds the flag for what conversation is active
                yield db.insert({
                    _id: splitId[1],
                    collection_name: "CONTACT",
                    forms: [{ id: splitId[0], active: true }]
                });
                conversationDoc.processNewConversationResponse(resp);
                return conversationDoc;
            }
        }
        catch (e) {
            // Questionnaire does not exist
            return undefined;
        }
    });
}
function getWelcomeMessage() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const db = nano.use(process.env.COUCHDB_NAME);
            const configDoc = yield db.get('config');
            return configDoc.welcome_message;
        }
        catch (e) {
            return undefined;
        }
    });
}
function updateConversation(data) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const db = nano.use(process.env.COUCHDB_NAME);
            const response = yield db.insert(data);
            data.processNewConversationResponse(response);
        }
        catch (e) {
            return undefined;
        }
    });
}
function checkActiveConversation(phoneNumber) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!phoneNumber)
            return undefined;
        try {
            /// check if the user has an started conversation
            const db = nano.use(process.env.COUCHDB_NAME);
            const conversationsData = yield db.get(phoneNumber);
            const activeConversation = conversationsData.forms.find((i) => (i.active));
            if (!activeConversation)
                return undefined;
            return `${activeConversation.id}|${phoneNumber}`;
        }
        catch (e) {
            return undefined;
        }
    });
}
function ReceiveMessage(req, res) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const messageInfo = getMessageInfo(req.body);
            if (!!messageInfo) {
                const conversationId = yield checkActiveConversation(messageInfo.phone_number);
                if (messageInfo.type == 'text' && !messageInfo.hashTagStarter) {
                    // console.log("User: ",messageInfo.value);
                    if (conversationId) {
                        // here save the response message and increment progress flag on conversation document
                        const conversationDoc = yield getCreateConversation(conversationId);
                        if (conversationDoc) {
                            /// updates the Reply element of an reply array
                            conversationDoc.progress = conversationDoc.progress + 1;
                            const replyUpdate = {
                                order: conversationDoc.progress,
                                question_title: '',
                                type: 'free',
                                reply: {
                                    text: messageInfo.value ? messageInfo.value : '',
                                    id: ''
                                }
                            };
                            const replsNew = conversationDoc.replies.map((i) => (i.order != replyUpdate.order ? Object.assign({}, i) : Object.assign(Object.assign({}, i), { reply: replyUpdate.reply })));
                            conversationDoc.replies = replsNew;
                            updateConversation(conversationDoc);
                            if (conversationDoc.replies.length > (conversationDoc.progress + 1)) {
                                (0, whatsappService_1.sendMessage)(conversationDoc.replies[conversationDoc.progress + 1].question_title, messageInfo.phone_number);
                                // console.log("Bot: ",conversationDoc.replies[conversationDoc.progress + 1].question_title);
                            }
                            else {
                                // console.log("Bot: El formulario ha terminado, muchas gracias por tus respuestas! Hasta luego");
                                (0, whatsappService_1.sendMessage)("El formulario ha terminado, muchas gracias por tus respuestas! Hasta luego", messageInfo.phone_number);
                            }
                        }
                    }
                    else {
                        // User send a message to the bot, but hast not started a conversation
                        const welcomeMsg = yield getWelcomeMessage();
                        // console.log("Bot: ",welcomeMsg);
                        (0, whatsappService_1.sendMessage)(welcomeMsg, messageInfo.phone_number);
                    }
                }
                if (messageInfo.hashTagStarter && !conversationId) {
                    // When user enter #, searchs for a conversation, if does not exist it creates it.
                    // returns undefined when #form does not exist
                    const newConversationId = `${(_a = messageInfo.value) === null || _a === void 0 ? void 0 : _a.slice(1)}|${messageInfo.phone_number}`;
                    const conversationDoc = yield getCreateConversation(newConversationId);
                    if (conversationDoc) {
                        // console.log("User:" , messageInfo.value);
                        // console.log("Bot:", conversationDoc.replies[conversationDoc.progress+1].question_title)
                        (0, whatsappService_1.sendMessage)(conversationDoc.replies[conversationDoc.progress + 1].question_title, messageInfo.phone_number);
                    }
                }
            }
            res.send("EVENT_RECEIVED");
        }
        catch (e) {
            console.log(e);
            res.send("EVENT_RECEIVED");
        }
    });
}
exports.ReceiveMessage = ReceiveMessage;
