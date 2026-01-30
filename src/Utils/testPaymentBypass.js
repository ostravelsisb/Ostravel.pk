/**
 * TEST UTILITY - Payment Bypass for Development
 * 
 * This script simulates a successful payment return for testing visa applications
 * without going through the actual Bank Alfalah payment gateway.
 * 
 * USAGE:
 * 1. Fill out the visa application form
 * 2. When you reach the payment page, open browser console
 * 3. Run: localStorage.setItem('bypass_payment', 'true')
 * 4. Or use the PowerShell command below to navigate directly
 * 
 * WARNING: FOR DEVELOPMENT/TESTING ONLY - DO NOT USE IN PRODUCTION
 */

// Browser Console Method
// ======================
// After filling the visa form, run this in browser console:
/*
localStorage.setItem('bypass_payment', 'true');
window.location.href = '/payment-return?O=VISA-TEST-' + Date.now() + '&TS=SUCCESS&RC=00';
*/

// PowerShell/CMD Commands
// =======================

// Method 1: Direct URL Navigation (copy and paste in browser)
// After filling the visa application form, navigate to:
// http://localhost:5173/payment-return?O=VISA-TEST-1234567890&TS=SUCCESS&RC=00

// Method 2: Using PowerShell to open browser with bypass URL
// Run this in PowerShell:
/*
$timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
$url = "http://localhost:5173/payment-return?O=VISA-TEST-$timestamp&TS=SUCCESS&RC=00"
Start-Process $url
*/

// Method 3: Using CMD to open browser with bypass URL
// Run this in CMD:
/*
start http://localhost:5173/payment-return?O=VISA-TEST-1234567890^&TS=SUCCESS^&RC=00
*/

// Method 4: Create a test button in the payment page
// Add this to VisaPayment.jsx for development:
/*
{process.env.NODE_ENV === 'development' && (
  <button
    onClick={() => {
      const orderId = `VISA-TEST-${Date.now()}`;
      window.location.href = `/payment-return?O=${orderId}&TS=SUCCESS&RC=00`;
    }}
    className="mt-4 w-full bg-yellow-500 text-black py-2 rounded-xl font-bold"
  >
    🧪 TEST: Bypass Payment
  </button>
)}
*/

// Complete Test Flow
// ==================

/*
STEP 1: Fill the visa application form at /apply-visa
- Select a country
- Choose visa type
- Fill all required fields
- Upload documents (or use dummy files)
- Click "Proceed to Payment"

STEP 2: On the payment page, instead of paying, run ONE of these:

Option A - Browser Console:
---------------------------
localStorage.setItem('bypass_payment', 'true');
window.location.href = '/payment-return?O=VISA-TEST-' + Date.now() + '&TS=SUCCESS&RC=00';

Option B - PowerShell:
---------------------
$timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
Start-Process "http://localhost:5173/payment-return?O=VISA-TEST-$timestamp&TS=SUCCESS&RC=00"

Option C - CMD:
--------------
start http://localhost:5173/payment-return?O=VISA-TEST-1234567890^&TS=SUCCESS^&RC=00

Option D - Direct URL (paste in browser):
-----------------------------------------
http://localhost:5173/payment-return?O=VISA-TEST-1234567890&TS=SUCCESS&RC=00

STEP 3: The system will:
- Detect the test order ID
- Skip actual payment verification
- Generate application number
- Save to Firestore
- Redirect to confirmation page

STEP 4: You'll see the confirmation page with your application number!
*/

// URL Parameters Explained
// ========================
// O  = Order ID (must start with VISA-TEST- for bypass)
// TS = Transaction Status (SUCCESS for successful payment)
// RC = Response Code (00 = success)

// Notes
// =====
// 1. Make sure your dev server is running on port 5173 (or update the URL)
// 2. The visa application data must be in sessionStorage
// 3. This only works in development mode
// 4. For production, you MUST use the actual payment gateway

export const bypassPaymentForTesting = () => {
    const orderId = `VISA-TEST-${Date.now()}`;
    const url = `/payment-return?O=${orderId}&TS=SUCCESS&RC=00`;
    window.location.href = url;
};

// Export for use in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    window.bypassVisaPayment = bypassPaymentForTesting;
    console.log('💡 Test utility loaded! Run: window.bypassVisaPayment()');
}
