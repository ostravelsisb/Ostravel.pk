# Payment Bypass for Testing - Quick Guide

## 🚀 Quick Commands

### Method 1: Browser Console (Easiest)
1. Fill out the visa application form
2. When you reach the payment page, press `F12` to open Developer Console
3. Paste this command:
```javascript
window.location.href = '/payment-return?O=VISA-TEST-' + Date.now() + '&TS=SUCCESS&RC=00';
```
4. Press Enter

---

### Method 2: PowerShell Command
Open PowerShell and run:
```powershell
$timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
Start-Process "http://localhost:5173/payment-return?O=VISA-TEST-$timestamp&TS=SUCCESS&RC=00"
```

---

### Method 3: CMD Command
Open Command Prompt and run:
```cmd
start http://localhost:5173/payment-return?O=VISA-TEST-1234567890^&TS=SUCCESS^&RC=00
```

---

### Method 4: Direct URL (Simplest)
After filling the visa form, just paste this URL in your browser:
```
http://localhost:5173/payment-return?O=VISA-TEST-1234567890&TS=SUCCESS&RC=00
```

---

## 📋 Complete Test Flow

1. **Start the application**
   ```bash
   npm run dev
   ```

2. **Navigate to visa application**
   - Go to `http://localhost:5173`
   - Click the green "Apply for Visa" floating button

3. **Fill the form**
   - Select country (e.g., Thailand)
   - Choose visa type
   - Fill personal details
   - Upload documents (any image/PDF files)
   - Click "Proceed to Payment"

4. **Bypass payment** (use any method above)
   - Browser Console method is recommended
   - Or just paste the direct URL

5. **See confirmation**
   - You'll be redirected to the confirmation page
   - Application will be saved to Firestore
   - Application number will be generated

---

## ⚠️ Important Notes

- **Port**: Make sure your dev server is running on port `5173` (default Vite port)
- **Session Data**: The visa application data must be in sessionStorage (filled from the form)
- **Development Only**: This bypass only works in development mode
- **Production**: In production, you MUST use the actual Bank Alfalah payment gateway

---

## 🔧 Troubleshooting

**If the bypass doesn't work:**

1. Make sure you filled the visa application form first
2. Check that sessionStorage has `pending_visa_application` data:
   ```javascript
   // In browser console:
   console.log(sessionStorage.getItem('pending_visa_application'));
   ```
3. Verify your dev server is running on the correct port
4. Clear browser cache and try again

---

## 🎯 Alternative: Add Test Button to Payment Page

For easier testing, you can add a test button directly to the payment page.

Open `src/Pages/VisaPayment.jsx` and add this button before the "Pay Securely Now" button:

```jsx
{/* TEST BUTTON - Remove in production */}
{import.meta.env.DEV && (
  <button
    onClick={() => {
      const orderId = `VISA-TEST-${Date.now()}`;
      window.location.href = `/payment-return?O=${orderId}&TS=SUCCESS&RC=00`;
    }}
    className="w-full bg-yellow-500 text-black py-4 rounded-xl font-bold mb-4 hover:bg-yellow-600"
  >
    🧪 TEST MODE: Skip Payment
  </button>
)}
```

This will show a yellow "Skip Payment" button only in development mode!
