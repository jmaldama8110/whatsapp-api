
import express, {Express } from "express"

import { whatsAppRouter } from "./src/routes/whatsapp";

const app: Express = express();
const port = process.env.PORT || 3001;

app.use(express.json())
app.use(whatsAppRouter);

app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at port:${port} `);
  });