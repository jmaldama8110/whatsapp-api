"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessage = void 0;
const axios_1 = __importDefault(require("axios"));
function sendMessage(textMsg, phoneNumber) {
    return __awaiter(this, void 0, void 0, function* () {
        const waApiVersion = process.env.WHATSAPP_API_VERSION;
        const waPhoneNumberId = process.env.WHATSAPP_API_PHONE_NUMBER_ID;
        const waToken = process.env.WHATSAPP_ADMIN_USER_TOKEN;
        const url = `/${waApiVersion}/${waPhoneNumberId}/messages`;
        const api = axios_1.default.create({
            method: "post",
            url,
            baseURL: process.env.WHATSAPP_API_URL,
            headers: {
                "content-type": "application/json",
                Authorization: `Bearer ${waToken}`,
            },
        });
        const waApiRes = yield api.post(url, {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": phoneNumber,
            "type": "text",
            "text": {
                "preview_url": false,
                "body": textMsg
            }
        });
    });
}
exports.sendMessage = sendMessage;
