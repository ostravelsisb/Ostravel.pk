import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  
} from "firebase/auth";

// 1. IMPORT FIRESTORE
import { getFirestore } from "firebase/firestore"; 

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);

// analytics only in browser & when supported
let analytics = null;
if (typeof window !== "undefined") {
  isSupported().then((yes) => yes && (analytics = getAnalytics(app)));
}

// Auth instance
const auth = getAuth(app);

// 2. INITIALIZE FIRESTORE
const db = getFirestore(app); 

// --- Auth Helpers ---

const signUp = (email, password, displayName) =>
  createUserWithEmailAndPassword(auth, email, password).then((userCred) => {
    if (displayName) {
      return updateProfile(userCred.user, { displayName }).then(() => userCred);
    }
    return userCred;
  });

const signIn = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

const googleProvider = new GoogleAuthProvider();
const signInWithGoogle = () => signInWithPopup(auth, googleProvider);

const signOut = () => firebaseSignOut(auth);

const onAuthStateChanged = (cb) => firebaseOnAuthStateChanged(auth, cb);

const sendResetEmail = (email) => sendPasswordResetEmail(auth, email);

// 3. EXPORT DB
export { 
  app, 
  analytics, 
  auth, 
  db, // <--- Add this here
  signUp, 
  signIn, 
  signInWithGoogle,
  signOut, 
  onAuthStateChanged, 
  sendResetEmail 
};