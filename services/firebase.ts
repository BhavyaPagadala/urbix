import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Use Vite env vars (VITE_*). These will be replaced at build time.
// The provided literal values are fallbacks for quick local testing only;
// for production, put them in an .env.local file and DO NOT commit secrets.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDwRc0MaYiVakBvwhwlB2DWASL4fj89zMI",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "urbix-bc57b.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "urbix-bc57b",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "urbix-bc57b.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "511523341952",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:511523341952:web:dde627c459eddbeaa3c865",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-5W6X8LPC8N"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Analytics should only run in the browser
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : undefined;

// Common exports you'll likely use in the app
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
