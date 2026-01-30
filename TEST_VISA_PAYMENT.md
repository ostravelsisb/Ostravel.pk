# Test Visa Payment Success Flow

## Quick Test Instructions

1. **Make sure you are logged in first!**
2. Open your browser to `http://localhost:5173`
3. Open DevTools (F12) and go to Console tab
4. Paste this code and press Enter:

```javascript
// IMPORTANT: You must be logged in first!
// This script automatically detects your logged-in user UID

// Helper function to get current user from AuthContext
const getCurrentUserUID = () => {
  // Try to get from React DevTools or window object
  const reactRoot = document.querySelector('#root')?._reactRootContainer?._internalRoot?.current;
  
  // Fallback: Check localStorage/sessionStorage for user data
  const checkStorage = (key) => {
    try {
      const data = localStorage.getItem(key) || sessionStorage.getItem(key);
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed.uid) return parsed;
      }
    } catch (e) {}
    return null;
  };
  
  // Try common storage keys
  const user = checkStorage('user') || 
               checkStorage('currentUser') || 
               checkStorage('authUser');
  
  if (user && user.uid) {
    return user;
  }
  
  // Last resort: prompt user to enter UID manually
  console.error('❌ Could not auto-detect user UID');
  console.log('💡 Please check your Firebase Console > Authentication to find your UID');
  console.log('💡 Or check: localStorage or sessionStorage for user data');
  return null;
};

const currentUser = getCurrentUserUID();

if (!currentUser) {
  alert('❌ Could not detect logged-in user!\n\nPlease:\n1. Make sure you are logged in\n2. Check browser console for your UID\n3. Update the script manually with your UID');
  throw new Error('User not logged in or UID not found');
}

console.log('✅ Using logged-in user:', currentUser);

// Create mock visa application data with REAL user UID
const mockVisaData = {
  applicantName: currentUser.displayName || currentUser.name || "Test User",
  age: 30,
  email: currentUser.email || "test@example.com",
  phone: "+92-300-1234567",
  cnic: "12345-1234567-1",
  country: "Thailand",
  visaType: "Tourist Visa",
  visaFee: 15000,
  urgentProcessing: false,
  urgentFee: 0,
  totalFee: 15000,
  processingTime: "5-7 Business Days",
  validity: "90 Days",
  stayDuration: "30 Days",
  category: "Tourism",
  uid: currentUser.uid,  // ✅ Using REAL user UID
  userEmail: currentUser.email || "test@example.com",
  userName: currentUser.displayName || currentUser.name || "Test User",
  files: {}
};

sessionStorage.setItem('pending_visa_application', JSON.stringify(mockVisaData));
console.log('✅ Mock visa data created with UID:', currentUser.uid);
window.location.href = '/payment-return?O=VISA-TEST-' + Date.now() + '&TS=SUCCESS&RC=00';
```

**Alternative: Manual UID Entry**

If the auto-detection doesn't work, find your UID and use this script:

```javascript
// REPLACE 'YOUR_ACTUAL_UID_HERE' with your real Firebase Auth UID
const YOUR_UID = 'YOUR_ACTUAL_UID_HERE';  // ⚠️ CHANGE THIS!

const mockVisaData = {
  applicantName: "Test User",
  age: 30,
  email: "test@example.com",
  phone: "+92-300-1234567",
  cnic: "12345-1234567-1",
  country: "Thailand",
  visaType: "Tourist Visa",
  visaFee: 15000,
  urgentProcessing: false,
  urgentFee: 0,
  totalFee: 15000,
  processingTime: "5-7 Business Days",
  validity: "90 Days",
  stayDuration: "30 Days",
  category: "Tourism",
  uid: YOUR_UID,  // ✅ Your real UID
  userEmail: "test@example.com",
  userName: "Test User",
  files: {}
};

sessionStorage.setItem('pending_visa_application', JSON.stringify(mockVisaData));
window.location.href = '/payment-return?O=VISA-TEST-' + Date.now() + '&TS=SUCCESS&RC=00';
```

### Option 2: Complete Flow Test

1. Navigate to `http://localhost:5173/apply-visa`
2. Fill out the visa application form completely
3. Click "Proceed to Payment"
4. On the payment page, open DevTools Console (F12)
5. Run this command:

```javascript
window.location.href = '/payment-return?O=VISA-TEST-' + Date.now() + '&TS=SUCCESS&RC=00';
```

## What Should Happen

✅ **Test mode activated** - Console shows: `🧪 TEST MODE: Bypassing payment verification`  
✅ **Payment verified** - Mock payment data created  
✅ **Documents uploaded** - (If files were provided)  
✅ **Firestore save** - Application saved to `visaApplications` collection  
✅ **Success screen** - Shows application number (format: `VA-{timestamp}-{random}`)  
✅ **Redirect** - Navigates to `/visa-confirmation` after 3 seconds  

## Verify Success

### Check Browser Console
Look for these messages:
- `🧪 TEST MODE: Bypassing payment verification for test order: VISA-TEST-...`
- `Visa application saved to Firestore: {docId}`

### Check sessionStorage
```javascript
// View stored application
console.log(JSON.parse(sessionStorage.getItem('confirmed_visa_application')));
```

### Check localStorage
```javascript
// View complete transaction
console.log(JSON.parse(localStorage.getItem('latest_visa_application')));
```

### Check Firestore
1. Go to Firebase Console
2. Navigate to Firestore Database
3. Check `visaApplications` collection
4. Look for the newest document with:
   - `status: "Pending"`
   - `paymentStatus: "PAID"`
   - Your test data

## Expected Data Structure

The successful visa application will contain:

```javascript
{
  applicationNumber: "VA-1737458490176-ABC123XYZ",
  applicationDate: Timestamp,
  orderId: "VISA-TEST-1737458490176",
  paymentStatus: "PAID",
  paymentMethod: "Bank Alfalah",
  transactionId: "VISA-TEST-1737458490176",
  amountPaid: 15000,
  applicantName: "Test User",
  country: "Thailand",
  visaType: "Tourist Visa",
  status: "Pending",
  documentURLs: {},
  // ... other fields
}
```

## Troubleshooting

### Error: "No pending application found"
**Solution:** Make sure you run the mock data script (Option 1) OR fill out the visa form first (Option 2)

### Error: "auth/invalid-api-key"
**Solution:** Check your `.env` file has valid Firebase credentials

### Documents not uploading
**Solution:** This is normal for test mode with empty files. Real documents require actual file uploads from the form.

### Not redirecting to confirmation page
**Solution:** Check browser console for errors. The redirect happens after 3 seconds automatically.

## Testing Different Scenarios

### Test Urgent Processing
```javascript
const mockVisaData = {
  // ... other fields
  urgentProcessing: true,
  urgentFee: 5000,
  totalFee: 20000,
  processingTime: "24-48 Hours"
};
```

### Test Different Countries
```javascript
const mockVisaData = {
  // ... other fields
  country: "Malaysia",
  visaType: "Business Visa",
  visaFee: 20000,
  totalFee: 20000
};
```

### Test Payment Failure
```javascript
// Navigate with failed status
window.location.href = '/payment-return?O=VISA-TEST-' + Date.now() + '&TS=FAILED&RC=99';
```

## Production vs Test Mode

**Test Mode** (Order ID starts with `VISA-TEST-`):
- ✅ Skips Bank Alfalah verification
- ✅ Uses mock payment data
- ✅ Still saves to Firestore
- ✅ Still uploads documents

**Production Mode** (Real Order ID):
- ✅ Verifies with Bank Alfalah backend
- ✅ Uses real payment data
- ✅ Requires backend server running on port 5000
- ✅ Full payment gateway integration
