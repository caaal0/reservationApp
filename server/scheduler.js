// const { CronJob } = require('cron');
// const admin = require('firebase-admin');
// const { firestore } = require('./firebase'); // Ensure Firebase is initialized here

import { CronJob } from 'cron';
import { admin } from 'firebase-admin';
import db from './firebase.js';

// This function checks reservations and updates seat availability.
async function updateSeatAvailability() {
  const seatsRef = db.collection('seats');
  const currentTime = new Date();

  try {
    const seatsSnapshot = await seatsRef.get();

    seatsSnapshot.forEach(async (seatDoc) => {
      const seatData = seatDoc.data();
      const approvedReservations = seatData.approvedReservations || [];

      let isSeatAvailable = true;

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

      // Update the seat's availability
      await seatDoc.ref.update({ available: isSeatAvailable });
      console.log(`Seat ${seatDoc.id} updated to available: ${isSeatAvailable}`);
    });
  } catch (error) {
    console.error('Error updating seat availability:', error);
  }
}

// Create a new CronJob to run every minute (adjustable schedule)
const job = new CronJob('* * * * *', () => {
  console.log('Checking seat availability...');
  updateSeatAvailability();
});

// Start the job
job.start();
