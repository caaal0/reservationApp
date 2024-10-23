// const { CronJob } = require('cron');
// const admin = require('firebase-admin');
// const { firestore } = require('./firebase'); // Ensure Firebase is initialized here

import { CronJob } from 'cron';
import admin from 'firebase-admin';
import db from './firebase.js';
import Firestore from '@google-cloud/firestore';

// This function checks reservations and updates seat availability.
async function updateSeatAvailability() {
  const seatsRef = db.collection('seats');
  const currentTime = new Date();

  try {
    const seatsSnapshot = await seatsRef.get();

    seatsSnapshot.forEach(async (seatDoc) => {
      const seatData = seatDoc.data();
      // console.log('seatData:', seatDoc.id, seatData);
      const approvedReservations = seatData.approvedReservations || [];

      let isSeatAvailable = true;

      if (approvedReservations.length === 0) {
        console.log(`No approved reservations for seat ${seatDoc.id}`);
        // If there are no approved reservations, the seat is available
        // await seatDoc.ref.update({ available: true });
        // console.log(`Seat ${seatDoc.id} updated to available: true`);
        // return;
      }else{
        // Loop through the approved reservations to check if they overlap with current time
        for (const reservationId of approvedReservations) {
          const reservationRef = db.collection('reservations').doc(reservationId);
          //TODO: try to use multiple conditions of where() to get the reservation that is approved and the current time is between the start and end time
          const reservationDoc = await reservationRef.get();
  
          if (reservationDoc.exists) {
            const reservationData = reservationDoc.data();
            const startTime = reservationData.startTime.toDate();
            const endTime = reservationData.endTime.toDate();
  
            // Check if the current time falls within the reservation's time range
            if (currentTime >= startTime && currentTime <= endTime) {
              isSeatAvailable = false;
              break; // No need to continue if the seat is occupied
            }
          }
        }
      }


      // Update the seat's availability
      await seatDoc.ref.update({ available: isSeatAvailable });
      console.log(`Seat ${seatDoc.id} updated to available: ${isSeatAvailable}`);
    });
  } catch (error) {
    console.error('Error updating seat availability:', error);
  }
}

// Function to reset customer's current reservation after reservation ends
async function clearCustomerCurrentReservation() {
  const reservationsRef = db.collection('reservations');
  const customerRef = db.collection('customers');
  const currentTime = new Date();

  try {
    const reservationsSnapshot = await reservationsRef.where('status', '==', 'approved').get();
    // console.log('reservationsSnapshot:', reservationsSnapshot);

    reservationsSnapshot.forEach(async (reservationDoc) => {
      const reservationData = reservationDoc.data();
      const endTime = reservationData.endTime.toDate();

      // Check if the current time is past the reservation's end time
      if (currentTime > endTime) {
        const userId = reservationData.userId;
        // console.log(`Reservation ${reservationDoc.id} has ended for user ${userId}`);
        const userRef = db.collection('customers').doc(userId);
        const user = (await userRef.get()).data();

        if(user.currentReservation === reservationDoc.id){
          await userRef.update({ currentReservation: '', pastReservations: Firestore.FieldValue.arrayUnion(reservationDoc.id) });
          // console.log(reservationData);
          // console.log(user);
          console.log(`Cleared current reservation for user ${userId} with reservationId ${reservationDoc.id}`);
          //also move the cleared reservation to the past reservation of the seat
          const seatRef = db.collection('seats').doc(reservationData.seatNo);
          await seatRef.update({ pastReservations: Firestore.FieldValue.arrayUnion(reservationDoc.id) });
          //also remove the reservation from the seat's approvedReservations
          await seatRef.update({ approvedReservations: Firestore.FieldValue.arrayRemove(reservationDoc.id) });
        }
      }
    });
  } catch (error) {
    console.error('Error clearing current reservation:', error);
  }
}

// Cron job for seat availability (runs every minute)
const updateSeatAvailabilityJob = new CronJob('* * * * *', () => {
  console.log('Checking seat availability...');
  updateSeatAvailability();
});

// Cron job for clearing current reservations (runs every minute)
const clearCurrentReservationJob = new CronJob('0 0 * * *', () => {
  console.log('Checking reservations to clear currentReservation...');
  clearCustomerCurrentReservation();
});

// Export both jobs
export { updateSeatAvailabilityJob, clearCurrentReservationJob };
