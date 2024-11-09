import db from '../firebase.js';
import Firestore from '@google-cloud/firestore';
const USERSTATSREF = db.collection('userStats');
const RESERVATIONSTATSREF = db.collection('reservationStats');

const getUserStats = async (req, res) => {
    try {
        const userStats = await USERSTATSREF.get();
        const userStatsList = [];
        userStats.forEach((doc) => {
            userStatsList.push(doc.data());
        });
        return res.status(200).send({ success: true, data: userStatsList });
    } catch (error) {
        return res.status(500).send({ success: false, error: error.message });
    }
};

const getReservationStats = async (req, res) => {
    try {
        const reservationStats = await RESERVATIONSTATSREF.get();
        const reservationStatsList = [];
        reservationStats.forEach((doc) => {
            reservationStatsList.push(doc.data());
        });
        return res.status(200).send({ success: true, data: reservationStatsList });
    } catch (error) {
        return res.status(500).send({ success: false, error: error.message });
    }
};

export default {
    getUserStats,
    getReservationStats,
}