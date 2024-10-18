import { defineStore } from 'pinia';
import { ref, onUnmounted } from 'vue';
import { db } from '../firebase/firebase';  // Import your Firestore config
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export const useSeatsStore = defineStore('seats', {
  state: () => ({
    seats: [],       // Holds the list of seats
    loading: true,   // Indicates when seats data is being loaded
  }),

  actions: {
    listenToSeats() {
      // Reference to the seats collection in Firestore
      const seatsCollectionRef = collection(db, 'seats');

      // Firestore snapshot listener for real-time updates
      onSnapshot(seatsCollectionRef, (snapshot) => {
        // Map through Firestore docs to get seat data
        const seatsData = snapshot.docs.map(doc => ({
          id: doc.id,   // Seat document ID
          ...doc.data() // Spread operator to get the seat data (e.g., available, approvedReservations)
        }));

        // Update the store state
        this.seats = seatsData;
        this.loading = false; // Set loading to false when data is fetched
        // console.log(this.seats);
      }, (error) => {
        console.error('Error fetching seats data:', error);
      });
    },
  },
});
