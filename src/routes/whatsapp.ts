
import express from "express";
import { VerifiedToken, ReceiveMessage } from "../controllers/whatsapp";

export const whatsAppRouter = express.Router();

whatsAppRouter.get('/whatsapp',  
    VerifiedToken
)

whatsAppRouter.post('/whatapp',
    ReceiveMessage
)