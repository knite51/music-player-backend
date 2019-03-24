import dotenv from 'dotenv';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import { homeRouter, userRouter } from './routes';
import { routesErrorHandler, allPurposeErrorHandler } from './middlewares';

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: 'false' }));
app.use(morgan('dev'));
app.use(cors());

const baseRoute = '/api';

// Mount the routers on the app object
app.use(`${baseRoute}/`, homeRouter);
app.use(`${baseRoute}/users`, userRouter);

// Unknown Route Error Handler
app.use(routesErrorHandler);
app.use(allPurposeErrorHandler);

export default app;
