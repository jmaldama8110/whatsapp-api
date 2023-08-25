import * as Nano from 'nano';

type DocumentCollectionType = "FORM" | "CONVERSATION";
type QuestionnaireStatus = "Active" | "Inactive";
type QuestionType = "free" | "button_reply"

interface iQuestionElement {
    order: number;
    question_title: string;
    type: QuestionType
}


interface iQuestionnaire extends Nano.MaybeDocument {
    title: string,
    goodbye_message: string,
    collection_name: DocumentCollectionType,
    questions: iQuestionElement[]
    status: QuestionnaireStatus
}

export class Questionnaire implements iQuestionnaire {
    _id: string | undefined
    _rev: string | undefined
    title: string
    goodbye_message: string
    collection_name: DocumentCollectionType
    questions: iQuestionElement[]
    status: QuestionnaireStatus

    constructor(coll_name: DocumentCollectionType ) {
      this._id = undefined
      this._rev = undefined
      this.collection_name = coll_name;
      this.title = ''
      this.goodbye_message = ''
      this.questions = []
      this.status = 'Active'
    }
  
    processAPIResponse(response: Nano.DocumentInsertResponse) {
      if (response.ok === true) {
        this._id = response.id
        this._rev = response.rev
      }
    }
  }

  type ConversationStatusType = "Started" | "Pending" | "Done"


  interface iConversation extends Nano.MaybeDocument {
    started_at: string;  // timestamp  
    status: ConversationStatusType,
    progress: number,
    replies: any[]
    collection_name: DocumentCollectionType;
  }

  export class Conversation implements iConversation {
    _id: string | undefined;
    _rev: string | undefined;
    started_at: string;
    progress: number;
    replies: any[];
    status: ConversationStatusType
    collection_name: DocumentCollectionType;

    constructor( id: string){
        this._id = id;
        this._rev = undefined;
        this.started_at = Date.now().toString();
        this.replies = []
        this.status = "Started"
        this.progress = 0
        this.collection_name = "CONVERSATION"
    }   
  }