"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReceiveMessage = exports.VerifiedToken = void 0;
function VerifiedToken(req, res) {
    res.send({ message: "Hola, este es el metodo Verified Token!" });
}
exports.VerifiedToken = VerifiedToken;
function ReceiveMessage(req, res) {
    res.send({ message: "Hola, este es la funcion Receive Message" });
}
exports.ReceiveMessage = ReceiveMessage;
