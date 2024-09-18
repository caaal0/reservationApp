import db from '../firebase.js';
const CUSTOMERSREF = db.collection('customers');
const STAFFSREF = db.collection('staffs');

const users = [
    {
        userID: '1',
        name: 'John Doe',
        email: 'a@a.com',
        contactNo: '123456789',
        currentReservation: '3',
        pastReservations: ['1', '2']
    },
    {
        userID: '2',
        name: 'Jane Doe',
        email: 'b@b.com',
        contactNo: '987654321',
        currentReservation: '6',
        pastReservations: ['4', '5']
    }
]

const staffs = [
    {
        staffID: '1',
        name: 'John Doe',
        email: 'c@c.com',
        contactNo: '123456789'
    }
]
//TODO: connect to db
const getCustomers = async (req, res) => {
    try{
        const response = await CUSTOMERSREF.get();
        let usersArr = [];

        response.forEach(doc => {
            usersArr.push(doc.data());
        });

        res.send(usersArr);
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

        const response = await CUSTOMERSREF.doc(customerID).delete();

        res.send(response);
    }catch (err){
        res.send({ success: false, msg: 'Unable to delete user', error: err.message });
    }
}

const createStaff = async (req, res) => {

    try{
        const { staffID, name, email, contactNo } = req.body;
        const newStaff = {
            staffID: staffID,
            name: name,
            email: email,
            contactNo: contactNo
        }

        console.log(newStaff);
        const response = await STAFFSREF.add(newStaff);
        res.status(201).send(response);
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

        const response = await STAFFSREF.doc(staffID).delete();

        res.send(response);
    }catch (err){
        res.send({ success: false, msg: 'Unable to delete staff', error: err.message });
    }
}

export default{
    getCustomers,
    deleteCustomer,
    createStaff,
    deleteStaff
}