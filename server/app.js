import express from 'express';
import bodyParser from 'body-parser';
import routes from './routes.js';

const app = express();

app.use(express.json());
app.use(bodyParser.json({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(routes)

export default app;