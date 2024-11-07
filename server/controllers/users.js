import db from '../firebase.js';
import admin from 'firebase-admin';
const CUSTOMERSREF = db.collection('customers');
const STAFFSREF = db.collection('staffs');

//this is for creating a doc for users who signed in with google
const createCustomerDoc = async (req, res) => {
    const { customerID } = req.params;
    const { userRecord } = req.body;

    try{
        const userDoc = await CUSTOMERSREF.doc(customerID).get();

        if(userDoc.exists){
            throw new Error('User already exists in the collection');
        }

        if(!customerID) {
            throw new Error('Invalid customerID');
        }

        if(!userRecord) {
            throw new Error('Invalid userRecord');
        }
        // const userRecord = await admin.auth().getUser(customerID);
        const newUser = {
            userId: userRecord.uid,
            name: userRecord.displayName,
            email: userRecord.email,
            contactNo: '',
            currentReservation: '',
            pastReservations: [],
        };
        const response = await CUSTOMERSREF.doc(userRecord.uid).set(newUser);

        res.status(201).send({ success: true, user: newUser });
    }catch (err){
        res.send({ success: false, msg: 'Unable to create user doc', error: err.message });
    }
}

const getCustomers = async (req, res) => {
    try{
        const response = await CUSTOMERSREF.get();
        let usersArr = [];

        response.forEach(doc => {
            usersArr.push(doc.data());
        });

        res.send({ success: true, data: usersArr });
    }catch (err){
        res.send({ success: false, msg: 'Unable to get users', error: err.message });
    }
}
//TODO: validate if such id exists
const deleteCustomer = async (req, res) => {
    try{
        const { customerID } = req.params;

        if(!customerID) {
            throw new Error('Invalid customerID');
        }
        await admin.auth().deleteUser(customerID);

        const response = await CUSTOMERSREF.doc(customerID).delete();

        res.send({ success: true, msg: 'User deleted successfully', data: response });
    }catch (err){
        res.send({ success: false, msg: 'Unable to delete user', error: err.message });
    }
}

const createStaff = async (req, res) => {

    try{
        const {name, email, contactNo, password } = req.body;
        const staffRecord = await admin.auth().createUser({
            email,
            password,
            displayName: name,
        });
        const newStaff = {
            staffId: staffRecord.uid,
            name: name,
            email: email,
            contactNo: contactNo
        }

        // console.log(newStaff);
        const response = await STAFFSREF.doc(staffRecord.uid).set(newStaff);
        res.status(201).send({ success: true, staff: newStaff });
    }catch (err) {
        res.send({ success: false, msg: 'Unable to create staff', error: err.message });
    }   
}

//TODO: validate if such id exists
const deleteStaff = async (req, res) => {
    try{
        const { staffID } = req.params;

        if(!staffID) {
            throw new Error('Invalid staffID');
        }
        await admin.auth().deleteUser(staffID);
        const response = await STAFFSREF.doc(staffID).delete();

        res.send({ success: true, msg: 'Staff deleted successfully', data: response });
    }catch (err){
        res.send({ success: false, msg: 'Unable to delete staff', error: err.message });
    }
}

const getCustomer = async (req, res) => {
    try{
        const userId = req.params.customerID;
        
        if(!userId) {
            throw new Error('Invalid customerID');
        }
        const response = await CUSTOMERSREF.doc(userId).get();

        if(!response.exists){
            throw new Error('User not found');
        }

        res.send({ success: true, data: response.data() });
    }catch (err){
        res.send({ success: false, msg: 'Unable to get user', error: err.message });
    }
}

const getStaffs = async (req, res) => {
    try{
        const response = await STAFFSREF.get();
        let staffArr = [];

        response.forEach(doc => {
            staffArr.push(doc.data());
        });

        res.send({ success: true, data: staffArr });
    }catch (err){
        res.send({ success: false, msg: 'Unable to get staffs', error: err.message });
    }
}

const getStaff = async (req, res) => {
    try{
        console.log('----------test');
        const staffId = req.params.staffID;
        
        if(!staffId) {
            throw new Error('Invalid staffID');
        }
        const response = await STAFFSREF.doc(staffId).get();

        if(!response.exists){
            throw new Error('Staff not found');
        }
        console.log(response.data());

        res.send({ success: true, data: response.data() });
    }catch (err){
        res.send({ success: false, msg: 'Unable to get staff', error: err.message });
    }
}

export default{
    createCustomerDoc,
    getCustomers,
    deleteCustomer,
    createStaff,
    deleteStaff,
    getCustomer,
    getStaffs,
    getStaff,
}