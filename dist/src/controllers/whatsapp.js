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
class Person {
    constructor(name, dob, messages, coll_name) {
        this._id = undefined;
        this._rev = undefined;
        this.name = name;
        this.dob = dob;
        this.messages = messages;
        this.collection_name = coll_name;
    }
    processAPIResponse(response) {
        if (response.ok === true) {
            this._id = response.id;
            this._rev = response.rev;
        }
    }
}
function ReceiveMessage(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const db = nano.use(process.env.COUCHDB_NAME);
            const entry = req.body.entry[0];
            const changes = entry.changes[0];
            const value = changes.value;
            const messageObject = value.messages;
            let p = new Person('Bob', '2015-02-04', messageObject, "MESSAGE");
            const resp = yield db.insert(p);
            p.processAPIResponse(resp);
            res.send("EVENT_RECEIVED");
        }
        catch (e) {
            console.log(e);
            res.send("EVENT_RECEIVED");
        }
    });
}
exports.ReceiveMessage = ReceiveMessage;
