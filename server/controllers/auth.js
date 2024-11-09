import admin from 'firebase-admin';
import db from '../firebase.js';

// Collection references
const CUSTOMERSREF = db.collection('customers');
const USERSTATSREF = db.collection('userStats');

// Example function to verify a user token using Firebase Authentication
const verifyUserToken = async (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).send({ success: false, msg: 'No token provided' });
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken; // Attach the decoded user info to the request
        next(); // Proceed to the next middleware or controller
    } catch (err) {
        return res.status(403).send({ success: false, msg: 'Unauthorized', error: err.message });
    }
};

//TODO: ready if librarycardnumber will be used
//TODO: validate if email is unique (middleware)
const signup = async (req, res) => {

    try {
        const { email, password, name } = req.body;
        const userRecord = await admin.auth().createUser({
            email,
            password,
            displayName: name,
        });
        const newUser = {
            userId: userRecord.uid,
            name: name,
            email: email,
            contactNo: '',
            currentReservation: '',
            pastReservations: [],
        };
        const response = await CUSTOMERSREF.doc(userRecord.uid).set(newUser);

        //if successful, check if a userStats doc exists for this month format: YYYY-MM
        const currentDate = new Date();
        const currentMonth = currentDate.toISOString().slice(0, 7);
        const userStatsDoc = await USERSTATSREF.doc(currentMonth).get();
        if (!userStatsDoc.exists) {
            const newUserStats = {
                signUpCount: 1,
                logInCount: 0,
                logInDays: [],
                signUpDays: [currentDate.toISOString().slice(8, 10)],
            };
            await USERSTATSREF.doc(currentMonth).set(newUserStats);
        } else {
            const userStatsData = userStatsDoc.data();
            const updatedUserStats = {
                signUpCount: userStatsData.signUpCount + 1,
                signUpDays: [...userStatsData.signUpDays, currentDate.toISOString().slice(8, 10)],
            };
            await USERSTATSREF.doc(currentMonth).update(updatedUserStats);
        }
        res.status(201).send({ success: true, user: newUser });
    } catch (err) {
        res.status(500).send({ success: false, msg: 'Unable to create user', error: err.message });
    }
};

const login = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1]; // Extract token from the header
    
        if (!token) {
          return res.status(401).send({ success: false, msg: 'No token provided' });
        }
    
        // Verify the token using Firebase Admin SDK
        const decodedToken = await admin.auth().verifyIdToken(token);
        
        const user = await admin.auth().getUser(decodedToken.uid); // Get the user data
        // console.log(user);
        //if successful, check if a userStats doc exists for this month format: YYYY-MM
        const currentDate = new Date();
        const currentMonth = currentDate.toISOString().slice(0, 7);
        const userStatsDoc = await USERSTATSREF.doc(currentMonth).get();
        if (!userStatsDoc.exists) {
            const newUserStats = {
                signUpCount: 0,
                logInCount: 1,
                logInDays: [currentDate.toISOString().slice(8, 10)],
                signUpDays: [],
            };
            await USERSTATSREF.doc(currentMonth).set(newUserStats);
        } else {
            const userStatsData = userStatsDoc.data();
            const updatedUserStats = {
                logInCount: userStatsData.logInCount + 1,
                logInDays: [...userStatsData.logInDays, currentDate.toISOString().slice(8, 10)],
            };
            await USERSTATSREF.doc(currentMonth).update(updatedUserStats);
        }
        res.status(200).send({ success: true, user: user });
      } catch (err) {
        res.status(500).send({ success: false, msg: 'Unable to login', error: err.message });
      }
}

export default {
    verifyUserToken,
    signup,
    login
};