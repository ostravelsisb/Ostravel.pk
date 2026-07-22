import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, storage } from "../firbase"; // Import storage
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { sendInvoiceEmail } from '../Utils/emailService';

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

    // HARD GATE: trust the bank's own redirect params first.
    // ResponseCode '00' / TransactionStatus 'SUCCESS' is Bank Alfalah's
    // convention for an approved transaction — anything else (declined,
    // cancelled, timed out) must stop here and never reach Firestore.
    if (responseCode && responseCode !== '00') {
      setPaymentStatus('failed');
      setError('Payment was not successful. Please try again.');
      setLoading(false);
      return;
    }
    if (transactionStatus && transactionStatus.toUpperCase() !== 'SUCCESS' && transactionStatus.toUpperCase() !== 'PAID') {
      setPaymentStatus('failed');
      setError('Payment was not successful. Please try again.');
      setLoading(false);
      return;
    }

    // Start the payment verification and policy creation flow
    processPaymentAndPolicy(orderId);
  }, []);

  // Determine payment type (insurance or visa).
  // Primary signal: the order ID itself always carries the type prefix
  // (VisaPayment.jsx sends transactionId `VISA-${Date.now()}`), so this works
  // even if sessionStorage didn't survive the bank redirect (e.g. it opened
  // in a new tab/browsing context, which drops sessionStorage).
  const getPaymentType = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('O') || '';
    // Order-ID prefix is checked first and is authoritative — this is what
    // stopped Umrah payments (orderId "UMRAH-...") from falling through to
    // stale leftover localStorage data (e.g. an old pending_visa_application)
    // and being wrongly saved as a Visa Application.
    if (orderId.toUpperCase().startsWith('UMRAH')) return 'umrah';
    if (orderId.toUpperCase().startsWith('VISA')) return 'visa';

    const umrahData = localStorage.getItem('pending_umrah_payment');
    const visaData = localStorage.getItem('pending_visa_application');
    const insuranceData = sessionStorage.getItem('pending_policy');

    if (umrahData) return 'umrah';
    if (visaData) return 'visa';
    if (insuranceData) return 'insurance';
    return null;
  };

  const processPaymentAndPolicy = async (orderId) => {
    try {
      // PREVENT DUPLICATE: Check if already processed for this order
      const paymentType = getPaymentType();
      const storageKey = paymentType === 'visa' ? 'latest_visa_application' : paymentType === 'umrah' ? 'latest_umrah_payment' : 'latest_policy';
      const existingRecord = localStorage.getItem(storageKey);

      // Unique deduplication key for this specific order attempt
      const DEDUPE_KEY = `processed_${orderId}`;
      if (localStorage.getItem(DEDUPE_KEY)) {
        console.log('Duplicate processing attempt detected for:', orderId);
        setLoading(false);
        // Attempt to recover state if available, else standard redirect
        const previousState = existingRecord ? JSON.parse(existingRecord) : null;

        if (previousState && previousState.orderId === orderId) {
          setPaymentStatus('success');
          setPolicyDetails(previousState.policyData || previousState.applicationData);
          setTimeout(() => {
            const redirectPath = paymentType === 'visa' ? '/visa-confirmation' : paymentType === 'umrah' ? '/dashboard' : '/bookingconfirmation';
            navigate(redirectPath, { state: previousState });
          }, 1000);
        } else {
          // Fallback if no local record matches but we have the dedupe key
          navigate('/');
        }
        return;
      }

      // Mark as processing IMMEDIATELY
      localStorage.setItem(DEDUPE_KEY, 'true');

      if (existingRecord) {
        try {
          const parsed = JSON.parse(existingRecord);
          if (parsed.orderId === orderId) {
            console.log(`${paymentType} already processed for this order, redirecting...`);
            setPaymentStatus('success');
            setPolicyDetails(parsed.policyData || parsed.applicationData);
            setLoading(false);

            setTimeout(() => {
              const redirectPath = paymentType === 'visa' ? '/visa-confirmation' : paymentType === 'umrah' ? '/dashboard' : '/bookingconfirmation';
              navigate(redirectPath, {
                state: parsed
              });
            }, 2000);
            return;
          }
        } catch (e) {
          console.error('Error parsing existing record:', e);
        }
      }

      // STEP 1: Verify Payment with Bank
      setProcessingStage('Verifying payment with bank...');
      const paymentVerification = await verifyPayment(orderId);

      if (!paymentVerification.success) {
        setPaymentStatus('failed');
        setError(paymentVerification.message || 'Payment verification failed');
        setLoading(false);
        return;
      }

      // STEP 2: Determine payment type and retrieve data
      setProcessingStage('Retrieving application data...');
      // paymentType already declared above

      if (!paymentType) {
        throw new Error('No pending application found. Please restart the process.');
      }

      if (paymentType === 'visa') {
        await processVisaApplication(orderId, paymentVerification);
      } else if (paymentType === 'umrah') {
        await processUmrahPayment(orderId, paymentVerification);
      } else {
        await processInsurancePolicy(orderId, paymentVerification);
      }

    } catch (err) {
      console.error('Process Error:', err);
      setError(err.message || 'An error occurred during processing');
      setPaymentStatus('failed');
      setLoading(false);
    }
  };

  // NOTE: Document upload now happens in ApplyVisa.jsx before payment
  // Files are uploaded to Firebase Storage there, and URLs are passed via sessionStorage

  // Process Visa Application
  const processVisaApplication = async (orderId, paymentVerification) => {
    try {
      const visaData = localStorage.getItem('pending_visa_application');
      if (!visaData) {
        throw new Error('Visa application data not found');
      }

      const parsedVisaData = JSON.parse(visaData);
      // Don't clear sessionStorage yet - wait until after successful save

      // Generate application number
      const applicationNumber = `VA-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // STEP 3: Use already-uploaded document URLs from ApplyVisa
      // Files were already uploaded to Firebase Storage in ApplyVisa.jsx
      const documentURLs = parsedVisaData.documentURLs || {};
      console.log('📎 Document URLs from ApplyVisa:', documentURLs);

      // STEP 4: Save to Firestore with document URLs
      setProcessingStage('Saving visa application...');
      await saveVisaToFirestore({
        applicationNumber,
        visaData: { ...parsedVisaData, documentURLs },
        paymentDetails: paymentVerification.data,
        orderId
      });

      // STEP 5: Store in localStorage
      const completeApplicationData = {
        orderId: orderId,
        applicationNumber: applicationNumber,
        applicationData: {
          ...parsedVisaData,
          applicationNumber,
          documentURLs,
          status: 'Pending'
        },
        transactionData: paymentVerification.data,
        transactionId: paymentVerification.data?.TransactionId || orderId,
        timestamp: new Date().toISOString()
      };

      localStorage.setItem('latest_visa_application', JSON.stringify(completeApplicationData));
      localStorage.setItem('confirmed_visa_application', JSON.stringify(completeApplicationData.applicationData));

      // Now safe to clear pending data after successful save
      localStorage.removeItem('pending_visa_application');
      localStorage.removeItem('visa_form_draft'); // application done, no need to keep the form draft anymore

      // Fire-and-forget invoice email (PDF attached) - never blocks the UI flow
      sendInvoiceEmail({
        to: parsedVisaData.email,
        recordType: 'visa',
        invoiceNumber: applicationNumber,
        applicantName: parsedVisaData.applicantName,
        email: parsedVisaData.email,
        phone: parsedVisaData.phone,
        country: parsedVisaData.country,
        visaType: parsedVisaData.visaType,
        amountPaid: parseFloat(paymentVerification.data?.TransactionAmount || parsedVisaData.totalFee || 0),
        visaFee: parsedVisaData.visaFee,
        urgentFee: parsedVisaData.urgentFee,
        urgentProcessing: parsedVisaData.urgentProcessing,
        transactionId: paymentVerification.data?.TransactionId || orderId,
        transactionRef: orderId,
        paymentMethod: 'Bank Alfalah',
        paidAt: new Date().toISOString(),
      });

      setPaymentStatus('success');
      setPolicyDetails(completeApplicationData.applicationData);
      setLoading(false);

      // Redirect to visa confirmation
      setTimeout(() => {
        navigate('/visa-confirmation');
      }, 3000);

    } catch (err) {
      throw err;
    }
  };

  // Process Umrah Payment
  // Unlike visa/insurance, an Umrah request already exists in Firestore
  // (created when the applicant submitted the request, quoted by admin) —
  // payment just needs to mark that same doc Paid, not create a new record.
  const processUmrahPayment = async (orderId, paymentVerification) => {
    try {
      const umrahData = localStorage.getItem('pending_umrah_payment');
      if (!umrahData) {
        throw new Error('Umrah payment data not found. Please restart the process.');
      }
      const parsedUmrahData = JSON.parse(umrahData);
      const { umrahDocId } = parsedUmrahData;
      if (!umrahDocId) {
        throw new Error('Umrah request reference not found. Please restart the process.');
      }

      setProcessingStage('Confirming your Umrah payment...');

      const amountPaid = parseFloat(paymentVerification.data?.TransactionAmount || parsedUmrahData.paymentAmount || 0);
      const { doc, updateDoc, serverTimestamp: sts } = await import('firebase/firestore');

      await updateDoc(doc(db, 'umrahApplications', umrahDocId), {
        status: 'Paid',
        paymentStatus: 'Paid',
        amountPaid,
        transactionId: paymentVerification.data?.TransactionId || orderId,
        transactionRef: paymentVerification.data?.TransactionReferenceNumber || orderId,
        paymentMethod: 'Bank Alfalah',
        paidAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        statusHistory: [
          ...(parsedUmrahData.statusHistory || []),
          { status: 'Paid', timestamp: new Date().toISOString(), updatedBy: 'system' }
        ]
      });

      const completePaymentData = {
        orderId,
        umrahDocId,
        requestNumber: parsedUmrahData.requestNumber,
        applicantName: parsedUmrahData.applicantName,
        amountPaid,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('latest_umrah_payment', JSON.stringify(completePaymentData));
      localStorage.removeItem('pending_umrah_payment');

      // Fire-and-forget invoice email — never blocks the UI flow
      sendInvoiceEmail({
        to: parsedUmrahData.email,
        recordType: 'umrah',
        invoiceNumber: parsedUmrahData.requestNumber,
        applicantName: parsedUmrahData.applicantName,
        email: parsedUmrahData.email,
        phone: parsedUmrahData.phone,
        amountPaid,
        transactionId: paymentVerification.data?.TransactionId || orderId,
        transactionRef: orderId,
        paymentMethod: 'Bank Alfalah',
        paidAt: new Date().toISOString(),
      });

      setPaymentStatus('success');
      setPolicyDetails({ policyNumber: parsedUmrahData.requestNumber });
      setLoading(false);

      setTimeout(() => {
        navigate('/dashboard', { state: { activeTab: 'umrah' } });
      }, 2000);

    } catch (err) {
      throw err;
    }
  };

  // Process Insurance Policy (existing logic)
  const processInsurancePolicy = async (orderId, paymentVerification) => {
    try {
      const policyData = sessionStorage.getItem('pending_policy');
      const customerInfo = sessionStorage.getItem('customer_info');

      if (!policyData) {
        throw new Error('Policy data not found. Please restart the process.');
      }

      const parsedPolicyData = JSON.parse(policyData);
      const parsedCustomerInfo = JSON.parse(customerInfo);

      // Clear session storage immediately after reading to prevent reuse
      sessionStorage.removeItem('pending_policy');
      sessionStorage.removeItem('customer_info');

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

      // STEP 5: Store policy data in localStorage for persistence
      const completePolicyData = {
        orderId: orderId,
        policyNo: policyCreation.data.policyNumber,
        policyData: policyCreation.data,
        transactionData: paymentVerification.data,
        customerName: parsedCustomerInfo.name,
        timestamp: new Date().toISOString()
      };

      localStorage.setItem('latest_policy', JSON.stringify(completePolicyData));

      // Fire-and-forget invoice email (PDF attached) - never blocks the UI flow
      sendInvoiceEmail({
        to: parsedCustomerInfo.email,
        recordType: 'insurance',
        invoiceNumber: policyCreation.data.policyNumber,
        applicantName: parsedCustomerInfo.name,
        email: parsedCustomerInfo.email,
        phone: parsedCustomerInfo.mobile,
        planName: parsedPolicyData.planName,
        amountPaid: parseFloat(paymentVerification.data?.TransactionAmount || parsedCustomerInfo.amount || 0),
        transactionId: paymentVerification.data?.TransactionId,
        transactionRef: paymentVerification.data?.TransactionReferenceNumber || orderId,
        paymentMethod: 'Bank Alfalah',
        paidAt: paymentVerification.data?.TransactionDateTime || new Date().toISOString(),
      });

      setPaymentStatus('success');
      setPolicyDetails(policyCreation.data);
      setLoading(false);

      // Redirect to booking confirmation page after 3 seconds
      setTimeout(() => {
        navigate('/bookingconfirmation', {
          state: {
            policyNo: policyCreation.data.policyNumber,
            policyData: policyCreation.data,
            transactionData: paymentVerification.data,
            customerName: parsedCustomerInfo.name
          }
        });
      }, 3000);

    } catch (err) {
      throw err;
    }
  };

  // Verify payment with your backend
  const verifyPayment = async (orderId) => {
    try {
      // DEVELOPMENT ONLY: Handle test order IDs. Gated behind import.meta.env.DEV
      // so this bypass can never run in a production build — previously it was
      // unconditional, meaning anyone could visit
      // /payment-return?O=VISA-TEST-x&TS=SUCCESS&RC=00 live and get a fake "PAID"
      // record with zero real payment, and any real failed transaction that
      // happened to reuse a VISA-TEST- id would be recorded as paid too.
      if (import.meta.env.DEV && orderId && orderId.startsWith('VISA-TEST-')) {
        console.log('🧪 TEST MODE: Bypassing payment verification for test order:', orderId);
        return {
          success: true,
          data: {
            TransactionId: orderId,
            TransactionReferenceNumber: `REF-${orderId}`,
            TransactionAmount: localStorage.getItem('pending_visa_application')
              ? JSON.parse(localStorage.getItem('pending_visa_application')).totalFee
              : '0',
            TransactionDateTime: new Date().toISOString(),
            TransactionStatus: 'SUCCESS',
            ResponseCode: '00'
          },
          message: 'Test payment verified successfully'
        };
      }

      const response = await fetch('https://alfalahpayemnt-production.up.railway.app/api/alfa/check-payment-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId })
      });

      if (!response.ok) {
        throw new Error('Payment verification request failed');
      }

      const data = await response.json();

      // Don't just trust data.success (that only means the status-check
      // call itself worked). Confirm the underlying transaction actually
      // succeeded before letting the caller proceed.
      const ts = data.transactionStatus || {};
      const txnOk =
        data.success &&
        (ts.ResponseCode === '00' || String(ts.TransactionStatus).toUpperCase() === 'SUCCESS');

      return {
        success: txnOk,
        data: data.transactionStatus,
        message: txnOk ? data.message : (data.message || 'Payment was not successful')
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
      const response = await fetch('https://uicbackend-production.up.railway.app/api/uic/create-policy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(policyData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Policy creation failed');
      }

      const apiResponse = await response.json();
      console.log('UIC API Response:', apiResponse);

      // UIC API returns: { status: 200, data: [{ PolicyNo, PolicyPrintUrl, ... }] }
      const policyInfo = apiResponse.data && apiResponse.data[0] ? apiResponse.data[0] : apiResponse;

      // Extract policy number from various possible fields
      const policyNumber = policyInfo.PolicyNo || policyInfo.PolicyNumber || policyInfo.policyNumber;
      const certificateUrl = policyInfo.PolicyPrintUrl || policyInfo.certificateUrl;

      if (!policyNumber) {
        console.error('No policy number found in response:', apiResponse);
        throw new Error('No policy number in response');
      }

      // Return the complete response data
      return {
        success: true,
        data: {
          policyNumber: policyNumber,
          certificateUrl: certificateUrl,
          PolicyPrintUrl: certificateUrl,
          ...policyInfo // Include all fields from the response
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
        // Sender's bank details — only present if Bank Alfalah's response actually
        // includes them (field names guessed since the gateway payload isn't
        // documented here; harmless if these all come back undefined).
        payerAccountTitle: paymentDetails?.AccountTitle || paymentDetails?.PayerName || paymentDetails?.CardHolderName || null,
        payerAccountNumber: paymentDetails?.AccountNumber || paymentDetails?.MaskedAccountNumber || paymentDetails?.MaskedCardNumber || paymentDetails?.IBAN || null,
        payerBankName: paymentDetails?.BankName || paymentDetails?.IssuerBank || null,

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

  // Save visa application to Firestore
  const saveVisaToFirestore = async ({ applicationNumber, visaData, paymentDetails, orderId }) => {
    try {
      const applicationData = {
        // Application Info
        applicationNumber: applicationNumber,
        applicationDate: serverTimestamp(),
        orderId: orderId,

        // Payment Info
        paymentStatus: 'PAID',
        paymentMethod: 'Bank Alfalah',
        transactionId: paymentDetails?.TransactionId || orderId,
        transactionRef: paymentDetails?.TransactionReferenceNumber,
        amountPaid: parseFloat(paymentDetails?.TransactionAmount || visaData.totalFee),
        paymentDateTime: paymentDetails?.TransactionDateTime,
        // Sender's bank details — only present if Bank Alfalah's response actually
        // includes them (field names guessed since the gateway payload isn't
        // documented here; harmless if these all come back undefined).
        payerAccountTitle: paymentDetails?.AccountTitle || paymentDetails?.PayerName || paymentDetails?.CardHolderName || null,
        payerAccountNumber: paymentDetails?.AccountNumber || paymentDetails?.MaskedAccountNumber || paymentDetails?.MaskedCardNumber || paymentDetails?.IBAN || null,
        payerBankName: paymentDetails?.BankName || paymentDetails?.IssuerBank || null,

        // Visa Application Details
        applicantName: visaData.applicantName || '',
        age: visaData.age || 0, // Default to 0 if missing
        email: visaData.email || '',
        phone: visaData.phone || '',
        cnic: visaData.cnic || '',
        passportNumber: visaData.passportNumber || '',
        country: visaData.country || '',
        visaType: visaData.visaType || '',
        visaFee: visaData.visaFee || 0,
        urgentProcessing: visaData.urgentProcessing || false,
        urgentFee: visaData.urgentFee || 0,
        totalFee: visaData.totalFee || 0,
        processingTime: visaData.processingTime || '',
        validity: visaData.validity || '',
        stayDuration: visaData.stayDuration || '',
        category: visaData.category || '',

        // Document URLs (Firebase Storage)
        documentURLs: visaData.documentURLs || {},

        // Status
        status: 'Pending',

        // User Info
        uid: visaData.uid || '',
        userEmail: visaData.userEmail || '',
        userName: visaData.userName || '',

        // Metadata
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        source: 'web',
        processed: true,

        // Status History
        statusHistory: [
          {
            status: 'Pending',
            timestamp: new Date().toISOString(),
            updatedBy: 'system'
          }
        ]
      };

      const docRef = await addDoc(collection(db, 'visaApplications'), applicationData);

      console.log('Visa application saved to Firestore:', docRef.id);
      return { success: true, docId: docRef.id };

    } catch (err) {
      console.error('Firestore save error:', err);
      // Don't fail the entire process if Firestore fails
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
            onClick={() => {
              const paymentType = getPaymentType();
              navigate(paymentType === 'visa' ? '/apply-visa' : paymentType === 'umrah' ? '/dashboard' : '/packages');
            }}
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
          onClick={() => navigate('/bookingconfirmation', {
            state: {
              policyNo: policyDetails?.policyNumber,
              policyData: policyDetails
            }
          })}
          className="w-full text-slate-600 py-2 text-sm font-medium hover:text-slate-900 transition"
        >
          View Details Now →
        </button>
      </div>
    </div>
  );
}