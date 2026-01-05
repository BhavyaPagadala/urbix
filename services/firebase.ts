import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Use Vite env vars (VITE_*). These will be replaced at build time.
// The provided literal values are fallbacks for quick local testing only;
// for production, put them in an .env.local file and DO NOT commit secrets.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBT4oJ9RJQ24P6aBJt06Q4TPQvpV9T1gDc",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "urbix-9179c.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "urbix-9179c",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "urbix-9179c.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1029938733920",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1029938733920:web:5f1d271b6077aba009f405",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-M7E8VZSFCV"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Analytics should only run in the browser
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : undefined;

// Common exports you'll likely use in the app
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
