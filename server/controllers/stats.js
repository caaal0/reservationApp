import db from '../firebase.js';
import Firestore from '@google-cloud/firestore';
const USERSTATSREF = db.collection('userStats');
const RESERVATIONSTATSREF = db.collection('reservationStats');

function formatDate(date) {
	const dateObj = new Date(date);
	const localTime = new Date(dateObj.getTime() + (8 * 60 * 60 * 1000)); // add 8 hours for UTC+8
	// const localTime = new Date(dateObj.getTime());
	const options = {
	  year: 'numeric',
	  month: 'short',
	  day: 'numeric',
	  hour: '2-digit',
	  minute: '2-digit',
	  hour12: true,
	};
  
	return localTime.toLocaleString('en-US', options);
  }

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

            let latestAdded = reservationStatsList.length - 1;
            //iterate through the requestedTime array and convert to Date object
            reservationStatsList[latestAdded].requestedTime.forEach((time, index) => {
                reservationStatsList[latestAdded].requestedTime[index] = formatDate(new Firestore.Timestamp(time._seconds, time._nanoseconds).toDate());
            });
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