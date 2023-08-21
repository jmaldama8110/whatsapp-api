import  { Request, Response} from "express";

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

export function ReceiveMessage (req: Request, res: Response) {
    res.send({ message: "Hola, este es la funcion Receive Message"})
}