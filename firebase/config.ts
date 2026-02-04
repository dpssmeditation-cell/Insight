import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';
import { getDatabase } from 'firebase/database';

// Firebase configuration
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAgAni6KooBSSOKs_wedlVosVSXz98xWSo",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "insight-sharing-a16eb.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "insight-sharing-a16eb",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "insight-sharing-a16eb.firebasestorage.app",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "28555261482",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:28555261482:web:6dff42dadd8e8c8545f553",
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-Z8KKLY2TVY",
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://insight-sharing-a16eb-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Realtime Database
export const rtdb = getDatabase(app);

// Initialize Analytics (optional, only in production)
let analytics;
if (typeof window !== 'undefined' && import.meta.env.PROD) {
    analytics = getAnalytics(app);
}

export { analytics };
export default app;
