"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Conversation = exports.Questionnaire = void 0;
class Questionnaire {
    constructor(coll_name) {
        this._id = undefined;
        this._rev = undefined;
        this.collection_name = coll_name;
        this.title = '';
        this.goodbye_message = '';
        this.questions = [];
        this.status = 'Active';
    }
    processAPIResponse(response) {
        if (response.ok === true) {
            this._id = response.id;
            this._rev = response.rev;
        }
    }
}
exports.Questionnaire = Questionnaire;
class Conversation {
    constructor(id) {
        this._id = id;
        this._rev = undefined;
        this.started_at = Date.now().toString();
        this.replies = [];
        this.status = "Started";
        this.progress = 0;
        this.collection_name = "CONVERSATION";
    }
}
exports.Conversation = Conversation;
