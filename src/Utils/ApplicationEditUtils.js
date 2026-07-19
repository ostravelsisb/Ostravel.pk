import { doc, updateDoc, getDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firbase';

/**
 * Toggle edit approval for an application
 * @param {string} docId - Document ID
 * @param {string} collectionName - Collection name ('insurancesCustumer' or 'visaApplications')
 * @param {boolean} approved - Whether to approve or revoke edit access
 * @param {string} adminEmail - Email of admin making the change
 * @returns {Promise<void>}
 */
export const toggleEditApproval = async (docId, collectionName, approved, adminEmail) => {
    try {
        const docRef = doc(db, collectionName, docId);
        await updateDoc(docRef, {
            editApproved: approved,
            editApprovedAt: new Date().toISOString(),
            editApprovedBy: adminEmail,
            // Clear user confirmation when admin changes approval
            userConfirmed: false,
            userConfirmedAt: null
        });
        return { success: true };
    } catch (error) {
        console.error('Error toggling edit approval:', error);
        throw error;
    }
};

/**
 * Save a message from the USER to the admin/subadmin for an application.
 * Tracked separately from admin->user messages so both sides get their
 * own unseen-badge state.
 * @param {string} docId - Document ID
 * @param {string} collectionName - Collection name
 * @param {string} message - Message from the user
 * @returns {Promise<void>}
 */
export const saveUserMessage = async (docId, collectionName, message) => {
    try {
        const docRef = doc(db, collectionName, docId);
        const messageEntry = {
            message: message,
            sentAt: new Date().toISOString(),
            sentBy: 'user'
        };

        await updateDoc(docRef, {
            userMessage: message,
            userMessageAt: new Date().toISOString(),
            // Add to the same shared message history array
            messageHistory: arrayUnion(messageEntry)
        });
        return { success: true };
    } catch (error) {
        console.error('Error saving user message:', error);
        throw error;
    }
};

/**
 * Mark the latest user->admin message as seen (called when admin/subadmin
 * dismisses the "Msg from User" badge).
 * @param {string} docId
 * @param {string} collectionName
 * @param {string} userMessageAt - timestamp of the message being acknowledged
 */
export const markUserMessageSeen = async (docId, collectionName, userMessageAt) => {
    try {
        const docRef = doc(db, collectionName, docId);
        await updateDoc(docRef, {
            userMessageSeenAt: userMessageAt ?? null
        });
        return { success: true };
    } catch (error) {
        console.error('Error marking user message seen:', error);
        throw error;
    }
};

/**
 * Whether there is a user->admin message the admin/subadmin hasn't seen yet.
 * @param {object} application
 */
export const hasUnseenUserMessage = (application) => {
    if (!application?.userMessage) return false;
    return toMillis(application.userMessageAt) !== toMillis(application.userMessageSeenAt);
};

/**
 * Save admin message for an application and track in message history
 * @param {string} docId - Document ID
 * @param {string} collectionName - Collection name
 * @param {string} message - Message from admin
 * @returns {Promise<void>}
 */
export const saveAdminMessage = async (docId, collectionName, message) => {
    try {
        const docRef = doc(db, collectionName, docId);
        const messageEntry = {
            message: message,
            sentAt: new Date().toISOString(),
            sentBy: 'admin' // You can pass this as a parameter if needed
        };

        await updateDoc(docRef, {
            adminMessage: message,
            adminMessageAt: new Date().toISOString(),
            // Add to message history array
            messageHistory: arrayUnion(messageEntry)
        });
        return { success: true };
    } catch (error) {
        console.error('Error saving admin message:', error);
        throw error;
    }
};

/**
 * User confirms they have completed required changes
 * @param {string} docId - Document ID
 * @param {string} collectionName - Collection name
 * @returns {Promise<void>}
 */
export const confirmUserChanges = async (docId, collectionName) => {
    try {
        const docRef = doc(db, collectionName, docId);
        await updateDoc(docRef, {
            userConfirmed: true,
            userConfirmedAt: new Date().toISOString()
        });
        return { success: true };
    } catch (error) {
        console.error('Error confirming user changes:', error);
        throw error;
    }
};

/**
 * Clear user confirmation (admin has reviewed the changes)
 * @param {string} docId - Document ID
 * @param {string} collectionName - Collection name
 * @returns {Promise<void>}
 */
export const clearUserConfirmation = async (docId, collectionName) => {
    try {
        const docRef = doc(db, collectionName, docId);
        await updateDoc(docRef, {
            userConfirmed: false,
            userConfirmedAt: null
        });
        return { success: true };
    } catch (error) {
        console.error('Error clearing user confirmation:', error);
        throw error;
    }
};

/**
 * Mark the current admin message as seen by the user. We copy the exact
 * `adminMessageAt` value of the message being dismissed into `messageSeenAt`
 * (instead of stamping "now"), so the comparison is immune to clock skew —
 * a message is "unseen" only when adminMessageAt !== messageSeenAt.
 * @param {string} docId
 * @param {string} collectionName
 * @param {*} adminMessageAt - the adminMessageAt value currently on the doc
 */
export const markMessageSeen = async (docId, collectionName, adminMessageAt) => {
    try {
        const docRef = doc(db, collectionName, docId);
        await updateDoc(docRef, {
            messageSeenAt: adminMessageAt ?? null
        });
        return { success: true };
    } catch (error) {
        console.error('Error marking message seen:', error);
        throw error;
    }
};

/**
 * Convert a Firestore Timestamp / ISO string / millis into a comparable
 * number of milliseconds. Returns 0 for null/undefined.
 */
export const toMillis = (value) => {
    if (!value) return 0;
    if (typeof value.toDate === 'function') return value.toDate().getTime();
    if (typeof value.seconds === 'number') return value.seconds * 1000;
    if (typeof value === 'string') return new Date(value).getTime() || 0;
    if (typeof value === 'number') return value;
    return 0;
};

/**
 * True when there is an admin message the user hasn't dismissed yet.
 */
export const hasUnseenMessage = (application) => {
    if (!application?.adminMessage) return false;
    return toMillis(application.adminMessageAt) !== toMillis(application.messageSeenAt);
};

/**
 * Dismiss the "Re-uploaded — Review" highlight on an application. Called
 * when admin/subadmin clicks the card badge directly (without opening the
 * full Document Viewer). Clears all pending resubmission flags so the
 * highlight/badge disappears immediately and won't reappear until the user
 * re-uploads something new.
 * @param {string} docId
 * @param {string} collectionName
 */
export const dismissResubmissionHighlight = async (docId, collectionName) => {
    try {
        const docRef = doc(db, collectionName, docId);
        await updateDoc(docRef, {
            resubmittedDocs: {}
        });
        return { success: true };
    } catch (error) {
        console.error('Error dismissing resubmission highlight:', error);
        throw error;
    }
};

// ImgBB config — same host already used app-wide for document uploads,
// since Firebase Storage direct uploads return 403 Forbidden in this project.
const IMGBB_API_KEY = "339913c8ca610122063ecd903404baa0";

/**
 * Upload an approval/rejection decision letter to ImgBB and save the
 * resulting URL onto the visa application doc. Works for image files
 * (JPG/PNG) — the same constraint already used everywhere else documents
 * are uploaded in this app.
 * @param {File} file - the letter file selected by admin/subadmin
 * @param {string} docId - visa application doc id
 * @param {string} collectionName - usually 'visaApplications'
 * @param {string} statusLabel - 'Approve' | 'Reject' (used to name the file)
 * @returns {Promise<{decisionDocURL: string, decisionDocName: string}>}
 */
export const uploadDecisionLetter = (file, docId, collectionName, statusLabel) => {
    return new Promise((resolve, reject) => {
        const form = new FormData();
        form.append('image', file);
        form.append('name', `${docId}_${statusLabel === 'Approve' ? 'approved' : 'rejected'}_${Date.now()}`);

        const xhr = new XMLHttpRequest();
        xhr.open('POST', `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`);
        xhr.onload = async () => {
            try {
                const res = JSON.parse(xhr.responseText);
                if (!res.success) {
                    reject(new Error(res.error?.message || 'Upload failed'));
                    return;
                }
                const decisionDocURL = res.data.url;
                const decisionDocName = file.name;
                const docRef = doc(db, collectionName, docId);
                await updateDoc(docRef, { decisionDocURL, decisionDocName });
                resolve({ decisionDocURL, decisionDocName });
            } catch (err) {
                reject(err);
            }
        };
        xhr.onerror = () => reject(new Error('Network error during upload'));
        xhr.send(form);
    });
};

/**
 * Compare two objects and return the fields that changed
 * @param {object} oldData - Original data
 * @param {object} newData - Updated data
 * @returns {Array} Array of change objects
 */
const detectChanges = (oldData, newData) => {
    const changes = [];
    const fieldsToTrack = [
        'applicantName', 'email', 'phone', 'passportNumber', 'dateOfBirth',
        'nationality', 'country', 'visaType', 'travelDate', 'returnDate',
        'purposeOfVisit', 'address', 'emergencyContact', 'emergencyPhone'
    ];

    fieldsToTrack.forEach(field => {
        if (newData[field] !== undefined && oldData[field] !== newData[field]) {
            changes.push({
                field: field,
                oldValue: oldData[field] || 'N/A',
                newValue: newData[field],
                changedAt: new Date().toISOString()
            });
        }
    });

    return changes;
};

/**
 * Update application data with comprehensive tracking (for user edits)
 * @param {string} docId - Document ID
 * @param {string} collectionName - Collection name
 * @param {object} updates - Object containing fields to update
 * @param {boolean} trackChanges - Whether to track changes and remove edit access
 * @returns {Promise<void>}
 */
export const updateApplicationData = async (docId, collectionName, updates, trackChanges = false, uploadedKeys = []) => {
    try {
        const docRef = doc(db, collectionName, docId);

        if (trackChanges) {
            // Get current document data to compare changes
            const docSnap = await getDoc(docRef);
            if (!docSnap.exists()) {
                throw new Error('Document not found');
            }

            const oldData = docSnap.data();
            const changes = detectChanges(oldData, updates);
            const nowIso = new Date().toISOString();

            // ── Per-document edit tracking (Issue #4) ──────────────────────
            // Only the documents actually uploaded in THIS save get locked +
            // marked as re-uploaded. Any other document the admin flagged
            // for re-upload stays open until the user completes it too.
            const currentEditApprovedDocs = oldData.editApprovedDocs || {};
            const currentResubmittedDocs = oldData.resubmittedDocs || {};

            const updatedEditApprovedDocs = { ...currentEditApprovedDocs };
            const updatedResubmittedDocs = { ...currentResubmittedDocs };

            uploadedKeys.forEach((key) => {
                updatedEditApprovedDocs[key] = false; // lock this specific doc
                updatedResubmittedDocs[key] = nowIso;  // mark re-uploaded, pending admin review
            });

            // The edit session for the whole application only finishes once
            // EVERY requested document has been completed.
            const stillPending = Object.values(updatedEditApprovedDocs).some(Boolean);

            // Update with comprehensive tracking
            await updateDoc(docRef, {
                ...updates,
                lastEditedAt: nowIso,
                editApprovedDocs: updatedEditApprovedDocs,
                resubmittedDocs: updatedResubmittedDocs,
                // Legacy global flag kept in sync — only clears once nothing is pending
                editApproved: stillPending,
                // Mark as user confirmed
                userConfirmed: true,
                userConfirmedAt: nowIso,
                // Track what was changed
                editHistory: arrayUnion({
                    changes: changes,
                    uploadedKeys,
                    editedAt: nowIso,
                    changesCount: changes.length
                })
            });
        } else {
            // Simple update without tracking
            await updateDoc(docRef, {
                ...updates,
                lastEditedAt: new Date().toISOString()
            });
        }

        return { success: true };
    } catch (error) {
        console.error('Error updating application data:', error);
        throw error;
    }
};