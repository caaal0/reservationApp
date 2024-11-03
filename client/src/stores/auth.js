import { defineStore } from 'pinia';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase/firebase';  // Your Firebase setup
import { getDoc, doc } from 'firebase/firestore';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,  // To store Firebase authenticated user
    userRole: null, // To store user role
    currentReservation: null, // To store user's current reservation
  }),
  actions: {
     async setUser(user) {
      this.user = user;  // Set the user in the state
      // Fetch the user role from Firestore
      if(this.user){
        const userDoc = await getDoc(doc(db, 'customers', this.user.uid));
        if (userDoc.exists()) {
          this.userRole = 'customer';
          this.currentReservation = userDoc.data().currentReservation;
        }else{
          // console.log('not a customer, checking staff collection with uid: ', this.user.uid);
          const staffDoc = await getDoc(doc(db, 'staffs', this.user.uid));
          if (staffDoc.exists()) {
            this.userRole = 'staff';
          }else{
            this.userRole = 'admin';
          }
        }
      }
    },
    clearUser() {
      this.user = null;  // Clear the user on sign-out
      this.userRole = null; // Clear the user role on sign-out
    },
     fetchCurrentUser() {
      // Listen to auth state changes and set the user in the store
      onAuthStateChanged(auth, (user) => {
        if (user) {
          this.setUser(user);
          //just to check who the user is in console
          // console.log('User currently logged in:', user.displayName);
          // console.log('User role: ', this.userRole);
        } else {
          this.clearUser();
        }
      });
    },
    isAuthenticated() {
      return !!this.user;
    },

    isAdmin() {
      return this.userRole === 'admin';
    },
  },
});
