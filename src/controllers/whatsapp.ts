import  { Request, Response} from "express";

export function VerifiedToken ( req:Request, res: Response ) {
    res.send({ message: "Hola, este es el metodo Verified Token!"});
}

export function ReceiveMessage (req: Request, res: Response) {
    res.send({ message: "Hola, este es la funcion Receive Message"})
}