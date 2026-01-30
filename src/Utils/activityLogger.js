import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firbase";

/**
 * Log an activity to Firestore activityLogs collection
 * @param {string} action - Action type: "created" | "edited" | "statusChanged" | "documentVerified" | "documentDeleted"
 * @param {string} targetType - Target type: "visaApplication" | "insurance" | "umrah"
 * @param {string} targetId - Document ID of the target
 * @param {Array} changes - Array of change objects with field, oldValue, newValue
 * @param {Object} performedBy - User object with uid, email, role, displayName
 * @param {string|null} targetCountry - Country name for filtering (optional)
 * @returns {Promise<void>}
 */
export const logActivity = async (action, targetType, targetId, changes, performedBy, targetCountry = null) => {
    try {
        await addDoc(collection(db, "activityLogs"), {
            timestamp: serverTimestamp(),
            performedBy: {
                uid: performedBy.uid,
                email: performedBy.email,
                role: performedBy.role,
                displayName: performedBy.displayName || performedBy.email
            },
            action,
            targetType,
            targetId,
            targetCountry,
            changes: changes || []
        });
    } catch (error) {
        console.error("Failed to log activity:", error);
        // Don't throw - logging failure shouldn't break the main operation
    }
};

/**
 * Log visa application edit
 * @param {string} visaId - Visa application ID
 * @param {string} country - Country name
 * @param {Array} changes - Array of changes
 * @param {Object} performedBy - User object
 */
export const logVisaEdit = async (visaId, country, changes, performedBy) => {
    await logActivity("edited", "visaApplication", visaId, changes, performedBy, country);
};

/**
 * Log status change
 * @param {string} visaId - Visa application ID
 * @param {string} country - Country name
 * @param {string} oldStatus - Previous status
 * @param {string} newStatus - New status
 * @param {Object} performedBy - User object
 */
export const logStatusChange = async (visaId, country, oldStatus, newStatus, performedBy) => {
    await logActivity("statusChanged", "visaApplication", visaId, [
        { field: "status", oldValue: oldStatus, newValue: newStatus }
    ], performedBy, country);
};

/**
 * Log document verification
 * @param {string} visaId - Visa application ID
 * @param {string} country - Country name
 * @param {string} documentType - Type of document verified
 * @param {Object} performedBy - User object
 */
export const logDocumentVerification = async (visaId, country, documentType, performedBy) => {
    await logActivity("documentVerified", "visaApplication", visaId, [
        { field: "documentVerification", oldValue: null, newValue: documentType }
    ], performedBy, country);
};

/**
 * Log document deletion
 * @param {string} visaId - Visa application ID
 * @param {string} country - Country name
 * @param {string} documentType - Type of document deleted
 * @param {Object} performedBy - User object
 */
export const logDocumentDeletion = async (visaId, country, documentType, performedBy) => {
    await logActivity("documentDeleted", "visaApplication", visaId, [
        { field: "documentDeletion", oldValue: documentType, newValue: null }
    ], performedBy, country);
};

/**
 * Log sub-admin creation
 * @param {string} subAdminId - Sub-admin user ID
 * @param {string} subAdminEmail - Sub-admin email
 * @param {Array} assignedCountries - Assigned countries
 * @param {Object} performedBy - User object (main admin)
 */
export const logSubAdminCreation = async (subAdminId, subAdminEmail, assignedCountries, performedBy) => {
    await logActivity("created", "subAdmin", subAdminId, [
        { field: "email", oldValue: null, newValue: subAdminEmail },
        { field: "assignedCountries", oldValue: null, newValue: assignedCountries.join(", ") }
    ], performedBy, null);
};

/**
 * Log sub-admin update
 * @param {string} subAdminId - Sub-admin user ID
 * @param {Array} changes - Array of changes
 * @param {Object} performedBy - User object (main admin)
 */
export const logSubAdminUpdate = async (subAdminId, changes, performedBy) => {
    await logActivity("edited", "subAdmin", subAdminId, changes, performedBy, null);
};
