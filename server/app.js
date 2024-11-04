import express from 'express';
import bodyParser from 'body-parser';
import routes from './routes.js';
import cors from 'cors';
import { updateSeatAvailabilityJob, clearCurrentReservationJob } from './scheduler.js';

const app = express();
// app.use(cors());
app.use(cors({
    origin: ['https://seated-qoy8viylm-justin-carl-saguns-projects.vercel.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(express.json());
app.use(bodyParser.json({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(routes)
updateSeatAvailabilityJob.start();
clearCurrentReservationJob.start();

export default app;