
import express, {Express } from "express"
import { whatsAppRouter } from "./src/routes/whatsapp";
const dotenv = require('dotenv');

dotenv.config();
import "./src/db/couch";

const app: Express = express();
const port = process.env.PORT || 3001;

app.use(whatsAppRouter);


app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
  });