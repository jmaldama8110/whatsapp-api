"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const whatsapp_1 = require("./src/routes/whatsapp");
const dotenv = require('dotenv');
dotenv.config();
require("./src/db/couch");
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
app.use(whatsapp_1.whatsAppRouter);
app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
