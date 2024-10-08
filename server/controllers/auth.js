import admin from 'firebase-admin';
import db from '../firebase.js';

// Collection references
const CUSTOMERSREF = db.collection('customers');

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
            userID: userRecord.uid,
            name: name,
            email: email,
            contactNo: '',
            currentReservation: '',
            pastReservations: [],
        };
        const response = await CUSTOMERSREF.doc(userRecord.uid).set(newUser);

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
        res.status(200).send({ success: true, user: user });
      } catch (err) {
        res.status(500).send({ success: false, msg: 'Unable to login', error: err.message });
      }
}

export default {
    verifyUserToken,
    signup,
    login
    // Other functions...
};