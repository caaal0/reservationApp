import admin from 'firebase-admin';
import serviceAccount from './creds.json' assert { type: "json" };

// Initialize Firebase Admin SDK only if it hasn't been initialized already
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log('Firebase Admin initialized');
} else {
  console.log('Firebase Admin already initialized');
}

// Explicit Firestore instance creation
const db = admin.firestore();

// Optional: Log to verify Firestore instance
if (db) {
  console.log('Firestore initialized successfully');
} else {
  console.log('Firestore initialization failed');
}

// Export Firestore instance
export default db;
