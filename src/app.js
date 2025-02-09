import express, { json } from 'express';

const app = express();

app.use(json());

import userRouter from './routes/userRouter.routes.js';

app.use("/",userRouter);

export { app };
