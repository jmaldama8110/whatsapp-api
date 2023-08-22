"use strict";
// const nano = require("nano")(`${process.env.COUCHDB_PROTOCOL}://${process.env.COUCHDB_USER}:${process.env.COUCHDB_PASS}@${process.env.COUCHDB_HOST}:${process.env.COUCHDB_PORT}`);
// async function Connect () {
//     try {
//         const dbName = process.env.COUCHDB_NAME;
//         const dbs = await nano.db.list();
//         if (!dbs.includes(dbName)) {
//             await nano.db.create(dbName);
//           }
//         console.log(`Apache couchdb connected...`)
//     }
//     catch(error){
//         console.log(`ERROR: Apache couchdb connection not found...`)
//     }
// }
// Connect();
