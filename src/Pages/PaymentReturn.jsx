import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from "../firbase"; // Your Firebase config
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function PaymentReturn() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [processingStage, setProcessingStage] = useState('Verifying payment...');
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [policyDetails, setPolicyDetails] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('O');
    const transactionStatus = urlParams.get('TS');
    const responseCode = urlParams.get('RC');

    console.log('Bank Alfalah Return:', { orderId, transactionStatus, responseCode });

    if (!orderId) {
      setError('No order ID found');
      setLoading(false);
      return;
    }

    // Start the payment verification and policy creation flow
    processPaymentAndPolicy(orderId);
  }, []);

  const processPaymentAndPolicy = async (orderId) => {
    try {
      // STEP 1: Verify Payment with Bank
      setProcessingStage('Verifying payment with bank...');
      const paymentVerification = await verifyPayment(orderId);
      
      if (!paymentVerification.success) {
        setPaymentStatus('failed');
        setError(paymentVerification.message || 'Payment verification failed');
        setLoading(false);
        return;
      }

      // STEP 2: Retrieve Policy Data from SessionStorage
      setProcessingStage('Retrieving policy data...');
      const policyData = sessionStorage.getItem('pending_policy');
      const customerInfo = sessionStorage.getItem('customer_info');
      
      if (!policyData) {
        throw new Error('Policy data not found. Please restart the process.');
      }

      const parsedPolicyData = JSON.parse(policyData);
      const parsedCustomerInfo = JSON.parse(customerInfo);

      // STEP 3: Create Policy via UIC API
      setProcessingStage('Creating your insurance policy...');
      const policyCreation = await createUICPolicy(parsedPolicyData);
      
      if (!policyCreation.success) {
        throw new Error(policyCreation.message || 'Policy creation failed');
      }

      // STEP 4: Save Complete Transaction to Firestore
      setProcessingStage('Saving transaction records...');
      await saveToFirestore({
        paymentDetails: paymentVerification.data,
        policyDetails: policyCreation.data,
        customerInfo: parsedCustomerInfo,
        orderId
      });

      // STEP 5: Clean up and show success
      sessionStorage.removeItem('pending_policy');
      sessionStorage.removeItem('customer_info');
      
      setPaymentStatus('success');
      setPolicyDetails(policyCreation.data);
      setLoading(false);

      // Redirect to success page after 3 seconds
      setTimeout(() => {
        navigate('/booking-success', { 
          state: { 
            policyNumber: policyCreation.data.policyNumber,
            orderId: orderId 
          } 
        });
      }, 3000);

    } catch (err) {
      console.error('Process Error:', err);
      setError(err.message || 'An error occurred during processing');
      setPaymentStatus('failed');
      setLoading(false);
    }
  };

  // Verify payment with your backend
  const verifyPayment = async (orderId) => {
    try {
      const response = await fetch('https://alfalahpayemnt-production.up.railway.app/api/alfa/check-payment-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId })
      });

      if (!response.ok) {
        throw new Error('Payment verification request failed');
      }

      const data = await response.json();
      
      return {
        success: data.success,
        data: data.transactionStatus,
        message: data.message
      };
    } catch (err) {
      console.error('Payment verification error:', err);
      return {
        success: false,
        message: 'Could not verify payment. Please contact support.'
      };
    }
  };

  // Call UIC API to create policy
  const createUICPolicy = async (policyData) => {
    try {
      const response = await fetch('http://localhost:3004/api/uic/create-policy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(policyData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Policy creation failed');
      }

      const data = await response.json();
      
      // Expecting response like: { success: true, policyNumber: "POL123", data: {...} }
      if (!data.success || !data.policyNumber) {
        throw new Error('Invalid response from UIC API');
      }

      return {
        success: true,
        data: {
          policyNumber: data.policyNumber,
          certificateUrl: data.certificateUrl,
          ...data.data
        }
      };
    } catch (err) {
      console.error('UIC API Error:', err);
      return {
        success: false,
        message: err.message || 'Failed to create policy with insurance provider'
      };
    }
  };

  // Save complete transaction to Firestore
  const saveToFirestore = async ({ paymentDetails, policyDetails, customerInfo, orderId }) => {
    try {
      const transactionData = {
        // Order Info
        orderId: orderId,
        orderDate: serverTimestamp(),
        
        // Payment Info
        paymentStatus: 'PAID',
        paymentMethod: 'Bank Alfalah',
        transactionId: paymentDetails?.TransactionId,
        transactionRef: paymentDetails?.TransactionReferenceNumber,
        amountPaid: parseFloat(paymentDetails?.TransactionAmount || customerInfo.amount),
        paymentDateTime: paymentDetails?.TransactionDateTime,
        
        // Policy Info
        policyNumber: policyDetails.policyNumber,
        policyStatus: 'ACTIVE',
        certificateUrl: policyDetails.certificateUrl,
        
        // Customer Info
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
        customerMobile: customerInfo.mobile,
        
        // Additional Details
        planDetails: policyDetails,
        
        // Metadata
        createdAt: serverTimestamp(),
        source: 'web',
        processed: true
      };

      const docRef = await addDoc(collection(db, 'policies'), transactionData);
      
      console.log('Transaction saved to Firestore:', docRef.id);
      return { success: true, docId: docRef.id };
      
    } catch (err) {
      console.error('Firestore save error:', err);
      // Don't fail the entire process if Firestore fails
      // Log this to your error monitoring system
      return { success: false, error: err.message };
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="inline-block w-16 h-16 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
          <p className="text-lg text-slate-800 font-bold mb-2">{processingStage}</p>
          <p className="text-sm text-slate-500">Please do not close this window</p>
          
          {/* Progress Indicator */}
          <div className="mt-6 bg-white rounded-xl p-4 shadow-sm">
            <div className="space-y-2 text-left text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-slate-600">Payment verified</span>
              </div>
              {processingStage.includes('policy') && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-slate-600">Creating policy...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || paymentStatus === 'failed') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Payment Failed</h2>
          <p className="text-slate-600 mb-6">{error || 'Your payment could not be processed'}</p>
          <div className="bg-red-50 rounded-xl p-4 mb-6 text-left text-sm">
            <p className="text-red-800 font-medium">What to do next:</p>
            <ul className="mt-2 space-y-1 text-red-700">
              <li>• Check your card details</li>
              <li>• Ensure sufficient balance</li>
              <li>• Contact your bank if issue persists</li>
            </ul>
          </div>
          <button
            onClick={() => navigate('/packages')}
            className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-black transition mb-3"
          >
            Try Again
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full text-slate-600 py-2 font-medium hover:text-slate-900 transition"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  // Success state
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Policy Created Successfully!</h2>
        <p className="text-slate-600 mb-6">Your travel insurance is now active</p>
        
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 text-left border border-blue-100">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-slate-600">Policy Number</span>
            <span className="text-lg font-bold text-blue-600">{policyDetails?.policyNumber}</span>
          </div>
          <div className="text-xs text-slate-500 text-center pt-4 border-t border-blue-100">
            Certificate will be sent to your email
          </div>
        </div>

        <p className="text-sm text-blue-600 font-medium mb-4">
          Redirecting to confirmation page...
        </p>
        
        <button
          onClick={() => navigate('/booking-success', { 
            state: { policyNumber: policyDetails?.policyNumber } 
          })}
          className="w-full text-slate-600 py-2 text-sm font-medium hover:text-slate-900 transition"
        >
          View Details Now →
        </button>
      </div>
    </div>
  );
}