import { defineStore } from 'pinia';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/firebase';  // Your Firebase setup

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,  // To store Firebase authenticated user
  }),
  actions: {
    setUser(user) {
      this.user = user;  // Set the user in the state
    },
    clearUser() {
      this.user = null;  // Clear the user on sign-out
    },
    fetchCurrentUser() {
      // Listen to auth state changes and set the user in the store
      onAuthStateChanged(auth, (user) => {
        if (user) {
          this.setUser(user);
          //just to check who the user is in console
          // console.log('User currently logged in:', user.displayName);
        } else {
          this.clearUser();
        }
      });
    },
  },
});
