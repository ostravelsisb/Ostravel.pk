/**
 * OsTravels Firestore Cleanup Script (CLIENT SDK version)
 * ---------------------------------------------------------
 * Uses the same firebase config your app already uses (from .env) --
 * no service account key file needed. Logs in as your admin account,
 * then deletes data via the normal Firestore client SDK, same as
 * your app does.
 *
 * IMPORTANT: your Firestore Security Rules must allow the logged-in
 * admin to read/write all the collections below (they almost certainly
 * already do, since AdminDashboard.jsx already reads/writes all of these).
 *
 * SETUP:
 * 1. Copy this file into your OsTravels project root (same level as .env),
 *    OR keep it separate and copy your .env values into the CONFIG block
 *    below directly.
 * 2. npm install firebase dotenv   (if not already installed -- firebase
 *    almost certainly already is, since it's your app's dependency)
 * 3. Fill in ADMIN_EMAIL / ADMIN_PASSWORD below (an account whose email
 *    is in VITE_ADMIN_EMAILS, or logs in via /admin/login).
 * 4. node cleanupFirestoreClient.mjs
 *
 * SAFETY: DRY_RUN = true by default. Review the console output, then
 * set DRY_RUN = false and run again to actually delete.
 */

import "dotenv/config";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import {
  getFirestore,
  collection,
  getDocs,
  writeBatch,
  doc,
} from "firebase/firestore";

// ─────────────────────────────────────────────────────────────
// CONFIG -- reuse your app's .env values (Vite prefixes stripped)
// If running this OUTSIDE the Vite project (no import.meta.env access),
// just paste the literal values here instead of using process.env.
// ─────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

// Must be an admin account: its email should be listed in VITE_ADMIN_EMAILS,
// or a user doc with role "subAdmin" (subAdmins may be blocked by rules
// depending on what your rules allow -- use the main admin account to be safe).
const ADMIN_EMAIL = "golden2@gmail.com";
const ADMIN_PASSWORD = "123abc123";

const DRY_RUN = true; // <-- set to false to actually delete

const KEEP_EMAILS = [
  "obaid.ob1984@gmail.com",
  "ammadsajjad055@gmail.com",
].map((e) => e.toLowerCase());

const USER_LINKED_COLLECTIONS = {
  visaApplications: ["email", "userEmail"],
  policies: ["email", "userEmail", "customerEmail", "Email"],
  insurancesCustumer: ["email", "userEmail", "customerEmail", "Email"],
  liveChats: ["userEmail"],
  umardet: ["email", "userEmail", "formData.user.email"],
};

const WIPE_COLLECTIONS = ["contact_messages", "activityLogs"];

// ─────────────────────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────────────────────
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

function getNested(obj, path) {
  return path.split(".").reduce((o, k) => (o && o[k] !== undefined ? o[k] : undefined), obj);
}

function docMatchesKeepEmail(data, fields) {
  for (const field of fields) {
    const val = field.includes(".") ? getNested(data, field) : data[field];
    if (typeof val === "string" && KEEP_EMAILS.includes(val.toLowerCase())) {
      return true;
    }
  }
  return false;
}

// Client SDK batch limit is 500 writes per batch
async function deleteRefsInBatches(refs) {
  const BATCH_SIZE = 450;
  for (let i = 0; i < refs.length; i += BATCH_SIZE) {
    const chunk = refs.slice(i, i + BATCH_SIZE);
    if (!DRY_RUN) {
      const batch = writeBatch(db);
      chunk.forEach((ref) => batch.delete(ref));
      await batch.commit();
    }
  }
}

async function cleanUsers() {
  console.log("\n=== users collection ===");
  const snap = await getDocs(collection(db, "users"));
  const toDelete = [];
  const kept = [];

  snap.forEach((d) => {
    const data = d.data();
    const email = (data.email || "").toLowerCase();
    const isSubAdmin = data.role === "subAdmin";
    const isAdmin = data.role === "admin";
    const isKeptUser = KEEP_EMAILS.includes(email);

    if (isSubAdmin || isAdmin || isKeptUser) {
      kept.push({ id: d.id, email: data.email, role: data.role });
    } else {
      toDelete.push(doc(db, "users", d.id));
    }
  });

  console.log(`Keeping ${kept.length} docs:`, kept);
  console.log(`${DRY_RUN ? "Would delete" : "Deleting"} ${toDelete.length} user docs.`);
  await deleteRefsInBatches(toDelete);
}

async function cleanUserLinkedCollection(collectionName, fields) {
  console.log(`\n=== ${collectionName} collection ===`);
  const snap = await getDocs(collection(db, collectionName));
  const toDelete = [];
  let keptCount = 0;

  snap.forEach((d) => {
    const data = d.data();
    if (docMatchesKeepEmail(data, fields)) {
      keptCount++;
    } else {
      toDelete.push(doc(db, collectionName, d.id));
    }
  });

  console.log(`Keeping ${keptCount} docs.`);
  console.log(`${DRY_RUN ? "Would delete" : "Deleting"} ${toDelete.length} docs.`);
  await deleteRefsInBatches(toDelete);
}

async function wipeCollection(collectionName) {
  console.log(`\n=== ${collectionName} collection (full wipe) ===`);
  const snap = await getDocs(collection(db, collectionName));
  const toDelete = snap.docs.map((d) => doc(db, collectionName, d.id));
  console.log(`${DRY_RUN ? "Would delete" : "Deleting"} ${toDelete.length} docs.`);
  await deleteRefsInBatches(toDelete);
}

(async () => {
  console.log(`\n>>> RUNNING IN ${DRY_RUN ? "DRY RUN (no deletes)" : "LIVE MODE (deleting for real)"} <<<\n`);

  console.log("Signing in as admin...");
  await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
  console.log("Signed in.");

  await cleanUsers();

  for (const [collectionName, fields] of Object.entries(USER_LINKED_COLLECTIONS)) {
    await cleanUserLinkedCollection(collectionName, fields);
  }

  for (const collectionName of WIPE_COLLECTIONS) {
    await wipeCollection(collectionName);
  }

  console.log("\nDone.");
  if (DRY_RUN) {
    console.log("This was a DRY RUN. Review counts above, then set DRY_RUN = false and run again.");
  }
  process.exit(0);
})().catch((err) => {
  console.error("Cleanup failed:", err);
  process.exit(1);
});
