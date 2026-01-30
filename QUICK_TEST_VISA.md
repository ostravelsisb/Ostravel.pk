# 🚀 Quick Test Script - Copy & Paste This!

## ⚠️ IMPORTANT: Login First!

Before running the test, make sure you are **logged in** to the application.

---

## 📋 Step-by-Step Instructions

### Step 1: Find Your User UID

Open browser console (F12) and run:

```javascript
// Check if you're logged in and get your UID
console.log('Checking login status...');

// Method 1: Check React Fiber (most reliable)
const root = document.querySelector('#root');
let foundUser = null;

if (root && root._reactRootContainer) {
  const fiber = root._reactRootContainer._internalRoot.current;
  // Search through React Fiber tree for AuthContext
  const searchFiber = (node, depth = 0) => {
    if (depth > 50) return null; // Prevent infinite loops
    if (node?.memoizedState?.currentUser) {
      return node.memoizedState.currentUser;
    }
    if (node?.child) {
      const result = searchFiber(node.child, depth + 1);
      if (result) return result;
    }
    if (node?.sibling) {
      return searchFiber(node.sibling, depth + 1);
    }
    return null;
  };
  foundUser = searchFiber(fiber);
}

if (foundUser && foundUser.uid) {
  console.log('✅ Found logged-in user!');
  console.log('📧 Email:', foundUser.email);
  console.log('🆔 UID:', foundUser.uid);
  console.log('\n📝 Copy this UID for the next step:', foundUser.uid);
} else {
  console.error('❌ No user found. Please make sure you are logged in!');
  console.log('💡 Try logging in and running this script again.');
}
```

### Step 2: Run the Test

**Copy your UID from Step 1** and paste it in the script below:

```javascript
// ⚠️ REPLACE THIS with your actual UID from Step 1
const YOUR_UID = 'PASTE_YOUR_UID_HERE';

// Verify UID is set
if (YOUR_UID === 'PASTE_YOUR_UID_HERE') {
  alert('⚠️ Please update YOUR_UID with your actual UID from Step 1!');
  throw new Error('UID not set');
}

// Create mock visa application data
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
console.log('✅ Mock visa data created with UID:', YOUR_UID);
window.location.href = '/payment-return?O=VISA-TEST-' + Date.now() + '&TS=SUCCESS&RC=00';
```

---

## ✅ What Should Happen

1. **Payment processing** - You'll see test mode activated
2. **Firestore save** - Application saved with your real UID
3. **Success screen** - Shows application number
4. **Redirect** - Goes to `/visa-confirmation`
5. **Dashboard** - **Application now appears in your user dashboard!** 🎉

---

## 🔍 Verify It Worked

### Check User Dashboard
1. Navigate to `/user-dashboard`
2. Click "Visa Applications" tab
3. You should see your test application!

### Check Firestore
1. Go to Firebase Console
2. Open `visaApplications` collection
3. Find the latest document
4. Verify `uid` matches your UID from Step 1

---

## 🐛 Troubleshooting

**"No user found" in Step 1?**
- Make sure you're logged in
- Refresh the page and try again
- Check if you can see your profile/name in the header

**Application still not showing in dashboard?**
- Double-check the UID you copied is correct
- Make sure you're logged in with the same account
- Check browser console for errors
