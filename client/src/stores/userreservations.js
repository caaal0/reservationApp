import { defineStore } from 'pinia';
import { ref, onUnmounted } from 'vue';
import { db } from '../firebase/firebase';  // Import your Firestore config
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useAuthStore } from './auth';  // Import the auth store

export const useUserReservationsStore = defineStore('userreservations', {
  state: () => ({
    currentReservation: {},  // Holds the current reservation
    pastReservations: [],       // Holds the list of user reservations
    loading: true,   // Indicates when user reservations data is being loaded
  }),
  actions:{
    listenCustomerReservations(){
      const authStore = useAuthStore();
      if(authStore.userRole !== 'customer'){
        console.error('User is not a customer');
        return;
      }
      //listen to the current reservation of customer in firestore

    },
  }
});
