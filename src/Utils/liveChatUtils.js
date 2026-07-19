import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    onSnapshot,
    collection,
    serverTimestamp,
    Timestamp,
} from "firebase/firestore";
import { db } from "../firbase";

// Firestore layout:
//   liveChats/{userUid}  -> { userId, userEmail, userName, messages: [...], adminUnread, userUnread, updatedAt }
// messages[]: { id, sender: "user" | "admin", senderName, text, createdAt (client Date), readByUser, readByAdmin }

const genId = () =>
    `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

// --- Listen to the full list of chats (admin/subadmin inbox) ---
export function listenToAllChats(callback) {
    const chatsRef = collection(db, "liveChats");
    return onSnapshot(chatsRef, (snap) => {
        const chats = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        chats.sort((a, b) => {
            const at = a.updatedAt?.toMillis ? a.updatedAt.toMillis() : 0;
            const bt = b.updatedAt?.toMillis ? b.updatedAt.toMillis() : 0;
            return bt - at;
        });
        callback(chats);
    });
}

// --- Listen to a single conversation (user widget, or admin thread view) ---
export function listenToChat(userUid, callback) {
    const chatRef = doc(db, "liveChats", userUid);
    return onSnapshot(chatRef, (snap) => {
        if (snap.exists()) {
            callback({ id: snap.id, ...snap.data() });
        } else {
            callback(null);
        }
    });
}

// --- Ensure the chat doc exists (called when user opens widget) ---
export async function ensureChatDoc(userUid, userEmail, userName) {
    const chatRef = doc(db, "liveChats", userUid);
    const snap = await getDoc(chatRef);
    if (!snap.exists()) {
        await setDoc(chatRef, {
            userId: userUid,
            userEmail: userEmail || "",
            userName: userName || (userEmail ? userEmail.split("@")[0] : "User"),
            messages: [],
            adminUnread: false,
            userUnread: false,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
    }
    return chatRef;
}

// --- Send a message from user side ---
export async function sendUserMessage(userUid, userEmail, userName, text) {
    if (!text?.trim()) return;
    const chatRef = doc(db, "liveChats", userUid);
    const snap = await getDoc(chatRef);

    const newMsg = {
        id: genId(),
        sender: "user",
        senderName: userName || (userEmail ? userEmail.split("@")[0] : "User"),
        text: text.trim(),
        createdAt: Timestamp.now(),
        readByUser: true,
        readByAdmin: false,
    };

    if (!snap.exists()) {
        await setDoc(chatRef, {
            userId: userUid,
            userEmail: userEmail || "",
            userName: userName || (userEmail ? userEmail.split("@")[0] : "User"),
            messages: [newMsg],
            adminUnread: true,
            userUnread: false,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
    } else {
        const existing = snap.data().messages || [];
        await updateDoc(chatRef, {
            messages: [...existing, newMsg],
            adminUnread: true,
            updatedAt: serverTimestamp(),
        });
    }
}

// --- Send a message from admin/subadmin side ---
export async function sendAdminMessage(userUid, adminName, text) {
    if (!text?.trim()) return;
    const chatRef = doc(db, "liveChats", userUid);
    const snap = await getDoc(chatRef);
    if (!snap.exists()) return; // shouldn't happen, chat starts from user side

    const newMsg = {
        id: genId(),
        sender: "admin",
        senderName: adminName || "O.S Support",
        text: text.trim(),
        createdAt: Timestamp.now(),
        readByAdmin: true,
        readByUser: false,
    };

    const existing = snap.data().messages || [];
    await updateDoc(chatRef, {
        messages: [...existing, newMsg],
        userUnread: true,
        updatedAt: serverTimestamp(),
    });
}

// --- Mark all messages as read by admin (single blue-tick flip) ---
export async function markChatReadByAdmin(userUid) {
    const chatRef = doc(db, "liveChats", userUid);
    const snap = await getDoc(chatRef);
    if (!snap.exists()) return;
    const messages = (snap.data().messages || []).map((m) =>
        m.sender === "user" ? { ...m, readByAdmin: true } : m
    );
    await updateDoc(chatRef, { messages, adminUnread: false });
}

// --- Mark all messages as read by the user ---
export async function markChatReadByUser(userUid) {
    const chatRef = doc(db, "liveChats", userUid);
    const snap = await getDoc(chatRef);
    if (!snap.exists()) return;
    const messages = (snap.data().messages || []).map((m) =>
        m.sender === "admin" ? { ...m, readByUser: true } : m
    );
    await updateDoc(chatRef, { messages, userUnread: false });
}
