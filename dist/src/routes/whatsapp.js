"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.whatsAppRouter = void 0;
const express_1 = __importDefault(require("express"));
const whatsapp_1 = require("../controllers/whatsapp");
exports.whatsAppRouter = express_1.default.Router();
exports.whatsAppRouter.get('/', whatsapp_1.VerifiedToken);
exports.whatsAppRouter.post('/', whatsapp_1.ReceiveMessage);
