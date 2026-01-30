// Read admins from environment variable (comma-separated)
const envAdmins = import.meta.env.VITE_ADMIN_EMAILS || "";
export const ADMIN_EMAILS = envAdmins.split(",").map(email => email.trim()).filter(Boolean);
