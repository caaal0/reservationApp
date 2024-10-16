import { useAuthStore } from '../stores/auth.js';
import { auth } from './firebase.js'; // Import Firebase auth from your config
import { signInWithEmailAndPassword } from 'firebase/auth';

export async function loginHelper(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const token = await userCredential.user.getIdToken();
    const authStore = useAuthStore();

    // Send token to backend
    const response = await fetch('http://localhost:8080/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      // console.log('Login successful:', data);
      // setPersistence(auth, browserLocalPersistence);
      // emit('login-success');
      authStore.fetchCurrentUser();
      return data;
    } else {
      console.error('Login failed');
      alert('Login failed');
      return {success: false};
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Login error.');
    return {success: false, error};
  }
};
