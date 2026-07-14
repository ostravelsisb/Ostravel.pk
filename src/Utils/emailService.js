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