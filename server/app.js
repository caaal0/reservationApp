import express from 'express';
import bodyParser from 'body-parser';
import routes from './routes.js';
import cors from 'cors';
import { updateSeatAvailabilityJob, clearCurrentReservationJob } from './scheduler.js';

const app = express();
app.use(cors());
// app.use((req, res, next) => {
//     console.log(`Request Method: ${req.method}, Request URL: ${req.url}`);
//     next();
// });
app.use(express.json());
app.use(bodyParser.json({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(routes)
updateSeatAvailabilityJob.start();
clearCurrentReservationJob.start();

export default app;