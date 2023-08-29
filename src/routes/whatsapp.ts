
import express from "express";
import { VerifiedToken, ReceiveMessage, SendTextMessage } from "../controllers/whatsapp";
export const whatsAppRouter = express.Router();

whatsAppRouter.get('/whatsapp',  
    VerifiedToken
)

whatsAppRouter.post('/whatsapp', 
    ReceiveMessage
)

whatsAppRouter.post('/send-text-message',SendTextMessage)