"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReceiveMessage = exports.VerifiedToken = void 0;
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
function ReceiveMessage(req, res) {
    res.send({ message: "Hola, este es la funcion Receive Message" });
}
exports.ReceiveMessage = ReceiveMessage;
