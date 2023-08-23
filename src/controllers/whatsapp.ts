import  { Request, Response} from "express";
import * as Nano from 'nano';
let nano = Nano.default(`${process.env.COUCHDB_PROTOCOL}://${process.env.COUCHDB_USER}:${process.env.COUCHDB_PASS}@${process.env.COUCHDB_HOST}:${process.env.COUCHDB_PORT}`);

export function VerifiedToken ( req:Request, res: Response ) {

    try {
        const accessToken = "ksXrsT8pO0QYiy8M2MsqBdQLCQb0Cc0wYllC2kif";
        const token = req.query["hub.verify_token"];
        const challenge = req.query["hub.challenge"];
        
        if( !challenge || !token || token != accessToken ){
            throw new Error('Invalid query params...');
        } else {
            res.send(challenge);
        }
        
    }
    catch(e){
        res.status(400).send();
    }
    
}

type CouchDBDocumentType = "PERSON" | "MESSAGE";

interface iPerson extends Nano.MaybeDocument {
    name: string,
    dob: string,
    collection_name: CouchDBDocumentType
}

class Person implements iPerson {
    _id: string | undefined
    _rev: string | undefined
    name: string
    dob: string
    messages: any[]
    collection_name: CouchDBDocumentType
  
    constructor(name: string, dob: string, messages: any[], coll_name: CouchDBDocumentType ) {
      this._id = undefined
      this._rev = undefined
      this.name = name
      this.dob = dob
      this.messages = messages;
      this.collection_name = coll_name;
    }
  
    processAPIResponse(response: Nano.DocumentInsertResponse) {
      if (response.ok === true) {
        this._id = response.id
        this._rev = response.rev
      }
    }
  }


function getMessageInfo( messageResp:any[]){
 

    if( !messageResp ) return undefined;

    if( messageResp.length > 0 ){

        const itemWithMsg = messageResp.find( (i:any) => i.type == 'text' )
        if( itemWithMsg )
         return { type: 'text', value: itemWithMsg.text.body, id: '' }

        const itemReplyButton = messageResp.find( (i:any) => i.type == 'interactive')
        if( itemReplyButton ){
            if(itemReplyButton.interactive.type == 'button_reply'){
                return { type: 'button_reply', value: itemReplyButton.interactive.button_reply.title, id: itemReplyButton.interactive.button_reply.id}
            }
        }
    }


    return undefined;
}

export async function ReceiveMessage (req: Request, res: Response) {
    


    try {
        const db = nano.use(process.env.COUCHDB_NAME!); 

        const entry = req.body.entry[0];
        const changes = entry.changes[0];
        const value = changes.value;
        const messageObject = value.messages;
        
        // console.log(getMessageInfo(messageObject) );

  
        let p = new Person('Bob', '2015-02-04',req.body, "MESSAGE",);

        const resp = await db.insert(p);
        p.processAPIResponse(resp);
        
      
        res.send("EVENT_RECEIVED")
    }
    catch(e){
        console.log(e);
        res.send("EVENT_RECEIVED");
    }
}