
import express, {Express } from "express"
import { whatsAppRouter } from "./src/routes/whatsapp";

const dotenv = require('dotenv');

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

app.use(whatsAppRouter);


app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
  });