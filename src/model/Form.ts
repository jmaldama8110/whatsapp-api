import * as Nano from 'nano';

type DocumentCollectionType = "FORM" | "CONVERSATION";
type QuestionnaireStatus = "Active" | "Inactive";
type QuestionType = "free" | "button_reply"

export interface iQuestionElement {
    order: number;
    question_title: string;
    type: QuestionType
}
export interface iReplyElement extends iQuestionElement {
  reply: {
    text: string;
    id: string;
  }
}

interface iForm extends Nano.MaybeDocument {
    title: string,
    goodbye_message: string,
    collection_name: DocumentCollectionType,
    questions: iQuestionElement[]
    status: QuestionnaireStatus
}

export class Form implements iForm {
    _id: string | undefined
    _rev: string | undefined

    title: string
    goodbye_message: string
    collection_name: DocumentCollectionType
    questions: iQuestionElement[]
    status: QuestionnaireStatus

    constructor() {
      this._id = undefined
      this._rev = undefined
      this.collection_name = "FORM";
      this.title = ''
      this.goodbye_message = ''
      this.questions = []
      this.status = 'Active'
    }
  
    static populateForm( response: Form ){

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

  type ConversationStatusType = "Started" | "Pending" | "Done"

  interface iConversation extends Nano.MaybeDocument {
    started_at: string;  // timestamp  
    status: ConversationStatusType,
    progress: number,
    replies: iReplyElement[]
    collection_name: DocumentCollectionType;
  }

  export class Conversation implements iConversation {
    _id: string | undefined;
    _rev: string | undefined;

    started_at: string;
    status: ConversationStatusType
    progress: number;
    replies: iReplyElement[];
    collection_name: DocumentCollectionType;

    constructor( id:string, replies: iReplyElement[]){
        this._id = id;
        this._rev = undefined;
        this.started_at = Date.now().toString();
        this.replies = replies
        this.status = "Started"
        this.progress = -1
        this.collection_name = "CONVERSATION"
    }

    processNewConversationResponse( response: Nano.DocumentInsertResponse){
      if( response.ok){
        this._id = response.id;
        this._rev = response.rev;
      }
    }

    

    static populateConversation( response: Conversation){
        const newData = new Conversation('',[]);
        newData._id = response._id;
        newData._rev = response._rev;
        newData.started_at = response.started_at;
        newData.status = response.status;
        newData.progress = response.progress;
        newData.replies = response.replies;
        return newData;
    }
  }