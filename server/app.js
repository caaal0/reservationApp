import express from 'express';
import bodyParser from 'body-parser';
import routes from './routes.js';
import cors from 'cors';
import { updateSeatAvailabilityJob, clearCurrentReservationJob } from './scheduler.js';

const app = express();
// app.use(cors());
app.use(function(req, res, next) {
    // res.header("Access-Control-Allow-Origin", "*");
    res.set({ "Access-Control-Expose-Headers": "[Content-Type, Authorization]" });
    const allowedOrigins = ['https://localhost:3000', 'https://seated.vercel.app'];
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
         res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-credentials", true);
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, UPDATE, OPTIONS");
    next();
  });
app.use(express.json());
app.use(bodyParser.json({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(routes)
updateSeatAvailabilityJob.start();
clearCurrentReservationJob.start();

export default app;