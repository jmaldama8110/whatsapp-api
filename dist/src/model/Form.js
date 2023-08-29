"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Conversation = exports.Form = void 0;
class Form {
    constructor() {
        this._id = undefined;
        this._rev = undefined;
        this.collection_name = "FORM";
        this.title = '';
        this.goodbye_message = '';
        this.questions = [];
        this.status = 'Active';
    }
    static populateForm(response) {
        const data = new Form();
        data._id = response._id;
        data._rev = response._rev;
        data.title = response.title;
        data.goodbye_message = response.goodbye_message;
        data.questions = response.questions;
        data.status = response.status;
        return data;
    }
}
exports.Form = Form;
class Conversation {
    constructor(id, replies) {
        this._id = id;
        this._rev = undefined;
        this.started_at = Date.now().toString();
        this.replies = replies;
        this.status = "Started";
        this.progress = 0;
        this.collection_name = "CONVERSATION";
    }
    processNewConversationResponse(response) {
        if (response.ok) {
            this._id = response.id;
            this._rev = response.rev;
        }
    }
    static populateConversation(response) {
        const newData = new Conversation('', []);
        newData._id = response._id;
        newData._rev = response._rev;
        newData.started_at = response.started_at;
        newData.status = response.status;
        newData.progress = response.progress;
        newData.replies = response.replies;
        return newData;
    }
}
exports.Conversation = Conversation;
