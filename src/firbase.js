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

// 2. IMPORT FIREBASE STORAGE
import { getStorage } from "firebase/storage";

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

// 3. INITIALIZE STORAGE
const storage = getStorage(app);

// --- Auth Helpers ---

import { doc, setDoc, getDoc } from "firebase/firestore"; // Import setDoc, getDoc

const signUp = async (email, password, displayName) => {
  const userCred = await createUserWithEmailAndPassword(auth, email, password);

  // 1. Update Display Name
  if (displayName) {
    await updateProfile(userCred.user, { displayName });
  }

  // 2. Create User Document in Firestore
  // This is CRITICAL for security rules to work (checking role)
  try {
    await setDoc(doc(db, "users", userCred.user.uid), {
      uid: userCred.user.uid,
      email: email,
      displayName: displayName || "",
      role: "user", // Default role
      createdAt: new Date().toISOString(),
      isActive: true
    });
  } catch (error) {
    console.error("Error creating user document:", error);
    // We don't throw here to avoid blocking the auth flow, 
    // but in a real app you might want to handle this.
  }

  return userCred;
};

/**
 * Ensure a Firestore "users" document exists for a given Firebase Auth user.
 * Used for Google sign-in/sign-up, since that flow does not go through signUp().
 * Will NOT overwrite an existing document (so logging in again won't reset role/isActive).
 * @param {import("firebase/auth").User} user - Firebase Auth user object
 * @param {string} [displayNameOverride] - Optional display name to use if creating a new doc
 * @returns {Promise<boolean>} true if a new document was created, false if one already existed
 */
const ensureUserDocument = async (user, displayNameOverride) => {
  if (!user) return false;

  try {
    const userDocRef = doc(db, "users", user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      return false; // Already has a document, don't overwrite
    }

    await setDoc(userDocRef, {
      uid: user.uid,
      email: user.email || "",
      displayName: displayNameOverride || user.displayName || "",
      role: "user", // Default role
      createdAt: new Date().toISOString(),
      isActive: true
    });

    return true;
  } catch (error) {
    console.error("Error ensuring user document:", error);
    throw error; // Let the caller decide how to surface this
  }
};

/**
 * Create a sub-admin account (Main Admin only)
 * @param {string} email - Sub-admin email
 * @param {string} password - Sub-admin password
 * @param {string} displayName - Sub-admin display name
 * @param {string[]} assignedCountries - Array of country names
 * @param {string} createdByUid - UID of the admin creating this sub-admin
 * @returns {Promise} User credential
 */
const createSubAdmin = async (email, password, displayName, assignedCountries = [], createdByUid, umrahAccess = false) => {
  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);

    // Update Display Name
    if (displayName) {
      await updateProfile(userCred.user, { displayName });
    }

    // Create Sub-Admin Document in Firestore
    await setDoc(doc(db, "users", userCred.user.uid), {
      uid: userCred.user.uid,
      email: email,
      displayName: displayName || "",
      role: "subAdmin",
      assignedCountries: assignedCountries,
      umrahAccess: !!umrahAccess,
      createdBy: createdByUid,
      createdAt: new Date().toISOString(),
      isActive: true,
      permissions: {
        canEditApplications: true,
        canChangeStatus: true,
        canViewDocuments: true
      }
    });

    return userCred;
  } catch (error) {
    console.error("Error creating sub-admin:", error);
    throw error;
  }
};

const signIn = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

const googleProvider = new GoogleAuthProvider();
const signInWithGoogle = () => signInWithPopup(auth, googleProvider);

const signOut = () => firebaseSignOut(auth);

const onAuthStateChanged = (cb) => firebaseOnAuthStateChanged(auth, cb);

const sendResetEmail = (email) => sendPasswordResetEmail(auth, email);

// 3. EXPORT DB AND STORAGE
export {
  app,
  analytics,
  auth,
  db, // <--- Add this here
  storage, // <--- Firebase Storage
  signUp,
  signIn,
  signInWithGoogle,
  signOut,
  onAuthStateChanged,
  sendResetEmail,
  createSubAdmin, // <--- Sub-admin creation
  ensureUserDocument // <--- Creates Firestore user doc for Google sign-in/sign-up
};