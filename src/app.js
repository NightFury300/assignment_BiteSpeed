import express, { json } from 'express';

const app = express();

app.use(json());

import userRouter from './routes/userRouter.routes.js';
import { Contact } from './models/contact.model.js';

app.use("/",userRouter);
//console.log(await Contact.findAll({}));

export { app };
