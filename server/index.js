import app from './app.js';
import dotenv from 'dotenv';
import db from './firebase.js';

dotenv.config();

app.listen( process.env.PORT || 3000 , () => {
    console.log('Server is running on http://localhost:3000');
});