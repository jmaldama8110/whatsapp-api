"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const connString = `${process.env.COUCHDB_PROTOCOL}://
${process.env.COUCHDB_USER}:
${process.env.COUCHDB_PASS}@
${process.env.COUCHDB_HOST}:
${process.env.COUCHDB_PORT}`;
function Connect() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const nano = require("nano")(connString);
            const dbName = process.env.COUCHDB_NAME;
            const dbs = yield nano.db.list();
            if (!dbs.includes(dbName)) {
                yield nano.db.create(dbName);
            }
            console.log(`Apache couchdb connected...`);
        }
        catch (error) {
            console.log(`ERROR: Apache couchdb connection not found...`);
        }
    });
}
Connect();
