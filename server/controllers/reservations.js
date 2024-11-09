import db from '../firebase.js';
import Firestore from '@google-cloud/firestore';
const RESERVATIONSREF = db.collection('reservations');

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

const getReservations = async (req, res) => {

	try{
		// const reservationsRef = db.collection('reservations');
		const response = await RESERVATIONSREF.get();
		let reservationsArr = [];

		response.forEach(doc => {
			//convert Firestore Timestamp to Date object before storing it in the latest element of the array
			let startTime = formatDate(doc.data().startTime.toDate());
			let endTime = formatDate(doc.data().endTime.toDate());
			let createdAt = formatDate(doc.data().createdAt.toDate());

			reservationsArr.push(doc.data());

			let latestAdded = reservationsArr.length - 1;

			reservationsArr[latestAdded].startTime = startTime;
			reservationsArr[latestAdded].endTime = endTime;
			reservationsArr[latestAdded].createdAt = createdAt;
			reservationsArr[latestAdded].reservationId = doc.id;
		});

		res.send({ success: true, data: reservationsArr });
	}catch (error){
		res.send({ success: false, msg: 'Unable to get reservations', error: error.message });
	}

}

const getReservation = async (req, res) => {

	try{
		const { id: reservationId } = req.params;
		
		if(!reservationId) {
			throw new Error('Invalid id');
		}

		const reservationRef = db.collection('reservations').doc(reservationId);
		const response = await reservationRef.get();

		if(!response.exists){
			throw new Error('Reservation not found');
		}

		const reservation = response.data();

		reservation.startTime = formatDate(response.data().startTime.toDate());
		reservation.endTime = formatDate(response.data().endTime.toDate());
		reservation.createdAt = formatDate(response.data().createdAt.toDate());

		res.status(200).send({ success: true, data: reservation });

	}catch (err){
		res.send({ success: false, msg: 'Unable to get reservation', error: err.message });
	}
}
//TODO: validate reservation, to not bump to other reservations
const createReservation = async (req, res) => {

	try{
		const {userId, name, seatNo, startTime, endTime, status, actionBy, createdAt, cancelRequest} = req.body;
		const startTimetoDate = new Date(startTime);
		const endTimetoDate = new Date(endTime);
		const createdAttoDate = new Date(createdAt);
		const newReservation = {
			userId: userId,
			name: name,
			seatNo: seatNo,
			startTime: Firestore.Timestamp.fromDate(startTimetoDate),
			endTime: Firestore.Timestamp.fromDate(endTimetoDate),
			status: status,
			actionBy: actionBy,
			createdAt: Firestore.Timestamp.fromDate(createdAttoDate),
			cancelRequest: cancelRequest
		}
		if(!newReservation.userId || !newReservation.seatNo || !newReservation.startTime || !newReservation.endTime){
			throw new Error('Invalid reservation');
		}
		// console.log('newReservation:', newReservation);
		const response = await db.collection("reservations").add(newReservation); //auto-id
		// const response = await db.collection("reservations").doc("1").set(newReservation); //custom-id
		//add the reservation id as the currentReservation of the user
		const userRef = db.collection('customers').doc(userId);
		userRef.update({ currentReservation: response.id });
		newReservation.reservationId = response.id;
		res.status(201).send({ success: true, msg: 'Reservation created', data: newReservation });

	}catch (err){
		res.send({ success: false, msg: 'Unable to create reservation', error: err.message });
	}

}
//TODO: handle when changes are made, what changes can be made
const updateReservation = async (req, res) => {

	try {
		const reservationId = req.params.id;
		const { userId, seatNo, startTime, endTime, status, actionBy } = req.body;

		const reservationRef = await db.collection('reservations').doc(reservationId);
		const reservation = await reservationRef.get();

		if(!reservation.exists){
			throw new Error('Reservation not found');
		}

		const updatedReservation = {
			userId: userId,
			seatNo: seatNo,
			startTime: new Date(startTime),
			endTime: new Date(endTime),
			status: status,
			actionBy: actionBy
		}

		reservationRef.update({
			userId: userId,
			seatNo: seatNo,
			startTime: Firestore.Timestamp.fromDate(new Date(startTime)),
			endTime: Firestore.Timestamp.fromDate(new Date(endTime)),
			status: status,
			actionBy: actionBy
		});
		res.send({ success: true, msg: 'Reservation updated', data: updatedReservation});

	}catch (err){
		res.send({ success: false, msg: 'Unable to update reservation', error: err.message });
	}
}
//TODO: validate the given id, it still deletes even if id is non-existent
const deleteReservation = async (req, res) => {

	try{
		const { id } = req.params;
		
		if(!id) {
			throw new Error('Invalid id');
		}

		const response = await db.collection('reservations').doc(id).delete();

		if(!response){
			throw new Error('Unable to find the given reservation');
		}

		res.send(response);

	}catch (err){
		res.send({ success: false, msg: 'Unable to delete the given reservation', error: err.message });
	}
}

const getPendingReservations = async (req, res) => {

	try{
		let today = new Date();	
		today.setHours(0, 0, 0, 0);
		const pendingSnapshots = await RESERVATIONSREF
			.where('status', '==', 'pending')
			.where('startTime', '>=', Firestore.Timestamp.fromDate(today))
			.get();

		if(pendingSnapshots.empty){
			throw new Error('No pending reservations');
		}

		let pendingArr = [];

		pendingSnapshots.forEach(doc => {
			//convert Firestore Timestamp to Date object before storing it in the latest element of the array
			let startTime = doc.data().startTime.toDate();
			let endTime = doc.data().endTime.toDate();
			let createdAt = doc.data().createdAt.toDate();

			pendingArr.push(doc.data());

			let latestAdded = pendingArr.length - 1;

			pendingArr[latestAdded].startTime = startTime;
			pendingArr[latestAdded].endTime = endTime;
			pendingArr[latestAdded].createdAt = createdAt;
		});

		res.send({ success: true, data: pendingArr });

	}catch (err){
		res.send({ success: false, msg: 'Unable to get pending reservations', error: err.message });
	}
}

const getMyPendingReservations = async (req, res) => {

	try{
		const userId = req.params.id;
		let today = new Date();	
		today.setHours(0, 0, 0, 0);
		const pendingSnapshots = await RESERVATIONSREF
			.where('userId', '==', userId)
			.where('status', '==', 'pending')
			.where('startTime', '>=', Firestore.Timestamp.fromDate(today))
			.get();

		if(pendingSnapshots.empty){
			throw new Error('No pending reservations');
		}

		let pendingArr = [];

		pendingSnapshots.forEach(doc => {
			//convert Firestore Timestamp to Date object before storing it in the latest element of the array
			let startTime = doc.data().startTime.toDate();
			let endTime = doc.data().endTime.toDate();
			let createdAt = doc.data().createdAt.toDate();

			pendingArr.push(doc.data());

			let latestAdded = pendingArr.length - 1;

			pendingArr[latestAdded].startTime = startTime;
			pendingArr[latestAdded].endTime = endTime;
			pendingArr[latestAdded].createdAt = createdAt;
		});

		res.send({ success: true, data: pendingArr });

	}catch (err){
		res.send({ success: false, msg: 'Unable to get pending reservations', error: err.message });
	}
}

const getApprovedReservations = async (req, res) => {

	try{
		const approvedSnapshots = await RESERVATIONSREF.where('status', '==', 'approved').get();

		if(approvedSnapshots.empty){
			throw new Error('No approved reservations');
		}

		let approvedArr = [];

		approvedSnapshots.forEach(doc => {
			//convert Firestore Timestamp to Date object before storing it in the latest element of the array
			let startTime = doc.data().startTime.toDate();
			let endTime = doc.data().endTime.toDate();
			let createdAt = doc.data().createdAt.toDate();

			approvedArr.push(doc.data());

			let latestAdded = approvedArr.length - 1;

			approvedArr[latestAdded].startTime = startTime;
			approvedArr[latestAdded].endTime = endTime;
			approvedArr[latestAdded].createdAt = createdAt;
		});

		res.send({ success: true, data: approvedArr });

	}catch (err){
		res.send({ success: false, msg: 'Unable to get approved reservations', error: err.message });
	}
}

const getMyCurrentReservation = async (req, res) => {
	
	try{
		const { userId } = req.body;
		const userRef = db.collection('customers').doc(userId);
		const user = await userRef.get();

		if(!user.exists){
			throw new Error('User not found');
		}

		const currentReservationId = user.data().currentReservation;
		if(currentReservationId == ''){
			throw new Error('No current reservation');
		}
		const reservationRef = db.collection('reservations').doc(currentReservationId);
		const reservation = await reservationRef.get();

		if(!reservation.exists){
			throw new Error('Reservation not found');
		}

		const currentReservation = reservation.data();

		currentReservation.startTime = reservation.data().startTime.toDate();
		currentReservation.endTime = reservation.data().endTime.toDate();
		currentReservation.createdAt = reservation.data().createdAt.toDate();

		res.send({ success: true, data: currentReservation });

	}catch (err){
		res.send({ success: false, msg: 'Unable to get current reservation', error: err.message });
	}
}

const actionReservation = async (req, res) => {
	
	const { action } = req.params;
	const { reservationId, actionById, actionByName } = req.body;
	try{
		const validActions = ['approved', 'rejected', 'cancelled'];
		const reservation = await db.collection('reservations').doc(reservationId).get();
		
		if(!reservation.exists){
			throw new Error('Reservation not found');
		}
		
		if(!validActions.includes(action)){
			throw new Error('Invalid action');
		}

		// Before approving, check for overlapping reservations first
		if (action == 'approved') {
			const approvedReservations = await db.collection('seats').doc(reservation.data().seatNo).get();
			// Iterate through the approved reservations of the seat
			for (const approvedReservationId of approvedReservations.data().approvedReservations) {
				const approvedReservation = await db.collection('reservations').doc(approvedReservationId).get();
				if (approvedReservation.data().status == 'approved') {
					let event = { start: approvedReservation.data().startTime.toDate(), end: approvedReservation.data().endTime.toDate() };
					let startTime = new Date(reservation.data().startTime.toDate());
					let endTime = new Date(reservation.data().endTime.toDate());
					let overlap = false;

					if (event.start <= startTime && event.end >= startTime) {
						overlap = true;
					}
					if (event.start <= endTime && event.end >= endTime) {
						overlap = true;
					}
					if (event.start >= startTime && event.end <= endTime) {
						overlap = true;
					}
					if (event.start <= startTime && event.end >= endTime) {
						overlap = true;
					}
					if (event.start >= startTime && event.end <= endTime) {
						overlap = true;
					}
					if (overlap) {
						console.log('Overlapping reservations');
						throw new Error('Overlapping reservations');
					}
				}
			}
		}
		
		reservation.ref.update({ status: action, actionBy: actionByName, actionById: actionById });
		
		const userRef = db.collection('customers').doc(reservation.data().userId);
		if(action == 'approved') {
			//add the reservation id to the seat
			const seatRef = db.collection('seats').doc(reservation.data().seatNo);
			seatRef.update({ approvedReservations: Firestore.FieldValue.arrayUnion(reservationId) });
			userRef.update({ reservationAlertMsg: `Your reservation has been approved`, reservationAlert: true });
		}else if(action == 'rejected' || action == 'cancelled'){
			//remove the reservation id from user's currentReservation
			userRef.update({ currentReservation: '', pastReservations: Firestore.FieldValue.arrayUnion(reservationId), reservationAlertMsg: `Your reservation has been ${action}`, reservationAlert: true });
			//if cancelled while approved, remove it from the seat detail as well
			if(reservation.data().status == 'approved'){
				const seatRef = db.collection('seats').doc(reservation.data().seatNo);
				seatRef.update({ approvedReservations: Firestore.FieldValue.arrayRemove(reservationId) });
			}
		}
		res.status(200).send({ success: true, msg: `Reservation ${action} successfully` , data: reservation.data() });

	}catch (error){
		res.status(400).send({ success: false, msg: `Unable to perform ${action} on reservation ${reservationId}`, error: error.message });
	}
}

const requestCancelReservation = async (req, res) => {
	
	const { id } = req.params;
	try{
		const reservation = await db.collection('reservations').doc(id).get();
		
		if(!reservation.exists){
			throw new Error('Reservation not found');
		}
		
		if(reservation.data().status != 'approved'){
			throw new Error('Reservation is not approved');
		}
		
		reservation.ref.update({ cancelRequest: true });
		res.status(200).send({ success: true, msg: 'Cancellation request sent', data: reservation.data() });

	}catch (err){
		res.send({ success: false, msg: 'Unable to request cancellation', error: err.message });
	}
}

const getBatchReservations = async (req, res) => {
	try {
	  const { reservationIds } = req.body; // Get array of reservation IDs from request body
  
	  if (!Array.isArray(reservationIds) || reservationIds.length === 0) {
		return res.status(400).send({ success: false, msg: 'No reservation IDs provided' });
	  }
  
	  const reservationsRef = db.collection('reservations');
	  const reservationPromises = reservationIds.map(async (reservationId) => {
		const resDoc = await reservationsRef.doc(reservationId).get();
		if (resDoc.exists) {
		  const reservationData = resDoc.data();
		  return {
			id: reservationId,
			...reservationData,
			startTime: formatDate(reservationData.startTime.toDate()),
			endTime: formatDate(reservationData.endTime.toDate()),
			createdAt: formatDate(reservationData.createdAt.toDate()),
		  };
		}
		return null; // In case a reservation document does not exist
	  });
  
	  const reservations = (await Promise.all(reservationPromises)).filter(Boolean);
  
	  res.status(200).send({ success: true, data: reservations });
	} catch (err) {
	  res.status(500).send({ success: false, msg: 'Unable to get batch reservations', error: err.message });
	}
}

export default {
	getReservations,
	getReservation,
	createReservation,
	updateReservation,
	deleteReservation,
	getPendingReservations,
	getMyPendingReservations,
	getApprovedReservations,
	getMyCurrentReservation,
	actionReservation,
	requestCancelReservation,
	getBatchReservations,
};