// src/Utils/emailService.js
// Calls the standalone "os-travel-email-service" backend (separate from
// AutoEmail and Alfahlah Payment), which sends the actual email via SMTP2GO.
// Fire-and-forget: failures are logged but never block the UI action
// (status change / edit toggle still succeeds even if the email fails).

const EMAIL_API_BASE = "https://ostravelpkemailservice-production.up.railway.app/api/email";

export const sendStatusChangeEmail = async ({
    to,
    applicantName,
    applicationNumber,
    country,
    visaType,
    oldStatus,
    newStatus,
}) => {
    if (!to) return;
    try {
        await fetch(`${EMAIL_API_BASE}/status-update`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                to,
                applicantName,
                applicationNumber,
                country,
                visaType,
                oldStatus,
                newStatus,
            }),
        });
    } catch (err) {
        console.error("Failed to send status-change email:", err);
    }
};

export const sendEditAccessEmail = async ({
    to,
    applicantName,
    applicationNumber,
    country,
    editEnabled,
    reason,
}) => {
    if (!to) return;
    try {
        await fetch(`${EMAIL_API_BASE}/edit-access`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                to,
                applicantName,
                applicationNumber,
                country,
                editEnabled,
                reason,
            }),
        });
    } catch (err) {
        console.error("Failed to send edit-access email:", err);
    }
};

export const sendAdminMessageEmail = async ({
    to,
    applicantName,
    applicationNumber,
    country,
    message,
}) => {
    if (!to) return;
    try {
        await fetch(`${EMAIL_API_BASE}/application-message`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                to,
                applicantName,
                applicationNumber,
                country,
                message,
            }),
        });
    } catch (err) {
        console.error("Failed to send admin-message email:", err);
    }
};

export const sendUmrahStatusEmail = async ({
    to,
    applicantName,
    hotel,
    checkIn,
    checkOut,
    oldStatus,
    newStatus,
}) => {
    if (!to) return;
    try {
        await fetch(`${EMAIL_API_BASE}/umrah-status-update`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                to,
                applicantName,
                hotel,
                checkIn,
                checkOut,
                oldStatus,
                newStatus,
            }),
        });
    } catch (err) {
        console.error("Failed to send umrah status-change email:", err);
    }
};

export const sendUmrahMessageEmail = async ({
    to,
    applicantName,
    hotel,
    message,
}) => {
    if (!to) return;
    try {
        await fetch(`${EMAIL_API_BASE}/umrah-message`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                to,
                applicantName,
                hotel,
                message,
            }),
        });
    } catch (err) {
        console.error("Failed to send umrah message email:", err);
    }
};
export const sendDocumentVerifiedEmail = async ({
    to,
    applicantName,
    applicationNumber,
    country,
    docLabel,
    allVerified,
}) => {
    if (!to) return;
    try {
        await fetch(`${EMAIL_API_BASE}/verify-document`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                to,
                applicantName,
                applicationNumber,
                country,
                docLabel,
                allVerified,
            }),
        });
    } catch (err) {
        console.error("Failed to send document-verified email:", err);
    }
};

// ─── NEW: interview documents email ──────────────────────────────────────────
// Fired only while a visa is in the "Interview" status. Sends one or more
// admin-uploaded files straight to the applicant's inbox as attachments,
// each labeled with the name the admin gave it.
export const sendInterviewDocumentsEmail = async ({
    to,
    applicantName,
    applicationNumber,
    country,
    visaType,
    note,        // string | null — optional details from admin
    documents,   // [{ name, url, fileName }] — required, at least 1
}) => {
    if (!to || !documents || documents.length === 0) return { skipped: true };
    try {
        const res = await fetch(`${EMAIL_API_BASE}/interview-documents`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                to,
                applicantName,
                applicationNumber,
                country,
                visaType,
                note: note || null,
                documents,
            }),
        });
        return { ok: res.ok };
    } catch (err) {
        console.error("Failed to send interview-documents email:", err);
        return { ok: false, error: err };
    }
};

// ─── NEW: single consolidated email ──────────────────────────────────────────
// Bundles status change + edit-access + admin message + all document actions
// (verify / reupload-request / delete) into ONE email. Fired only from the
// per-row "Save" button — never automatically by individual actions.
export const sendConsolidatedUpdateEmail = async ({
    to,
    applicantName,
    applicationNumber,
    country,
    visaType,
    statusChange,     // { oldStatus, newStatus } | null
    editAccess,       // { enabled, reason } | null
    message,          // string | null
    documentActions,  // [{ docLabel, action: 'verified'|'reupload_requested'|'deleted', message? }]
    reuploadDocs,     // string[] | null — list of doc labels user is allowed to re-upload
    decisionDocURL,   // string | null — URL of approved visa / rejection letter to attach
    decisionDocName,  // string | null — filename for attachment
}) => {
    if (!to) return { skipped: true };
    try {
        const res = await fetch(`${EMAIL_API_BASE}/consolidated-update`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                to,
                applicantName,
                applicationNumber,
                country,
                visaType,
                statusChange: statusChange || null,
                editAccess: editAccess || null,
                message: message || null,
                documentActions: documentActions || [],
                reuploadDocs: reuploadDocs || null,
                decisionDocURL: decisionDocURL || null,
                decisionDocName: decisionDocName || null,
            }),
        });
        return { ok: res.ok };
    } catch (err) {
        console.error("Failed to send consolidated-update email:", err);
        return { ok: false, error: err };
    }
};

// ─── NEW: single consolidated email for Umrah ────────────────────────────────
// Mirrors sendConsolidatedUpdateEmail but for the Umrah field shape. Bundles
// status change + document actions + payment request into ONE email, fired
// only from the per-row "Notify" button — never automatically.
export const sendUmrahConsolidatedEmail = async ({
    to,
    applicantName,
    requestNumber,
    hotel,
    checkIn,
    checkOut,
    statusChange,     // { oldStatus, newStatus } | null
    documentActions,  // [{ docLabel, action: 'requested'|'verified'|'rejected'|'removed', message? }]
    paymentChange,    // { amount, note } | null — set when a payment request was (re)sent
}) => {
    if (!to) return { skipped: true };
    try {
        const res = await fetch(`${EMAIL_API_BASE}/umrah-consolidated-update`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                to,
                applicantName,
                requestNumber,
                hotel,
                checkIn,
                checkOut,
                statusChange: statusChange || null,
                documentActions: documentActions || [],
                paymentChange: paymentChange || null,
            }),
        });
        return { ok: res.ok };
    } catch (err) {
        console.error("Failed to send umrah consolidated-update email:", err);
        return { ok: false, error: err };
    }
};

// ─── NEW: invoice email (PDF attached) ───────────────────────────────────────
// Fired right after a visa/insurance payment is saved to Firestore in
// PaymentReturn.jsx. Backend builds a proper PDF invoice and attaches it.
export const sendInvoiceEmail = async ({
    to,
    recordType,        // 'visa' | 'insurance'
    invoiceNumber,
    applicantName,
    email,
    phone,
    country,
    visaType,
    planName,
    amountPaid,
    visaFee,
    urgentFee,
    urgentProcessing,
    transactionId,
    transactionRef,
    paymentMethod,
    paidAt,
}) => {
    if (!to) return { skipped: true };
    try {
        const res = await fetch(`${EMAIL_API_BASE}/invoice`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                to,
                recordType,
                invoiceNumber,
                applicantName,
                email,
                phone,
                country,
                visaType,
                planName,
                amountPaid,
                visaFee,
                urgentFee,
                urgentProcessing,
                transactionId,
                transactionRef,
                paymentMethod,
                paidAt,
            }),
        });
        return { ok: res.ok };
    } catch (err) {
        console.error("Failed to send invoice email:", err);
        return { ok: false, error: err };
    }
};