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
export const updateApplicationData = async (docId, collectionName, updates, trackChanges = false) => {
    try {
        const docRef = doc(db, collectionName, docId);

        if (trackChanges) {
            console.log('🔍 Starting tracked update for document:', docId);

            // Get current document data to compare changes
            const docSnap = await getDoc(docRef);
            if (!docSnap.exists()) {
                throw new Error('Document not found');
            }

            const oldData = docSnap.data();
            const changes = detectChanges(oldData, updates);

            console.log('📝 Detected', changes.length, 'field changes');
            console.log('🔒 Setting editApproved=false, userConfirmed=true');

            // Update with comprehensive tracking
            await updateDoc(docRef, {
                ...updates,
                lastEditedAt: new Date().toISOString(),
                // Remove edit access after user saves
                editApproved: false,
                // Mark as user confirmed
                userConfirmed: true,
                userConfirmedAt: new Date().toISOString(),
                // Track what was changed
                editHistory: arrayUnion({
                    changes: changes,
                    editedAt: new Date().toISOString(),
                    changesCount: changes.length
                })
            });

            console.log('✅ Update completed successfully');
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

