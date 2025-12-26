import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// --- FIREBASE ---
import { db } from '../firbase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../Context/AuthContext';

import {
  HiCheckCircle,
  HiArrowDownTray,
  HiHome,
  HiUser,
  HiCreditCard,
  HiDocumentText,
  HiIdentification,
  HiClock
} from 'react-icons/hi2';

import { useCurrency } from '../Context/CurrencyContext'; // Added

const BookingConfirmation = () => {
  const { convertPrice } = useCurrency(); // Added
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [isRecordSaved, setIsRecordSaved] = useState(false);

  // 1. DATA EXTRACTION
  const { policyNo, policyData, transactionData, customerName } = location.state || {};

  // 2. ROUTE PROTECTION
  useEffect(() => {
    if (!policyNo || !policyData) {
      console.error("Missing critical data. Redirecting.");
      navigate('/');
    }
  }, [policyNo, policyData, navigate]);

  if (!policyNo) return null;

  // 3. ROBUST VALUE MAPPING (Fixes the "PKR 0" issue)
  // We check multiple common keys returned by the UIC / Travel API
  const travelerName = policyData?.TravelerName || policyData?.Name || customerName || "Traveler";
  const travelerEmail = policyData?.Email || policyData?.TravelerEmail || "N/A";

  // Premium mapping
  const rawPremium = policyData?.TotalPayablePremium || policyData?.Premium || policyData?.Amount || 0;
  const premium = parseFloat(rawPremium);

  // Tax mapping
  const rawTax = policyData?.AdvanceTax || policyData?.Tax || 0;
  const tax = parseFloat(rawTax);

  // Total Calculation (Fallback to bank transaction amount if API calculation fails)
  const totalValue = (premium + tax) > 0
    ? (premium + tax)
    : (parseFloat(transactionData?.transaction_amount) || 0);

  const formattedTotal = totalValue.toLocaleString();

  // Extract Cnic
  const cnic = policyData?.Cnic || policyData?.CNIC || policyData?.cnic || "N/A";

  // --- HANDLER: SAVE TO FIREBASE + OPEN PDF ---
  const handleAction = async () => {
    if (isRecordSaved) {
      if (policyData.PolicyPrintUrl) window.open(policyData.PolicyPrintUrl, '_blank');
      return;
    }

    try {
      const finalRecord = {
        // 1. Core Identification
        uid: currentUser?.uid || "guest",
        policyNumber: policyNo,
        status: "ISSUED",
        purchaseDate: serverTimestamp(),
        source: "web_app",

        // 2. Computed Financials (Consistent with UI)
        amount: totalValue,
        premium: premium,
        tax: tax,

        // 3. User & Transaction Info
        travelerName: travelerName,
        userEmail: travelerEmail,
        cnic: cnic, // Explicitly saved for search
        bankTransactionId: transactionData?.unique_tran_id || "N/A",
        paidAt: transactionData?.paid_datetime || new Date().toISOString(),

        // 4. FULL API RESPONSE DUMP (Saves everything from UIC)
        // We spread policyData at the end to ensure we capture every single field 
        // returned by the backend (Coverage, Exclusions, etc.)
        ...policyData,

        // 5. Overrides (ensure critical fields aren't overwritten by raw data if needed)
        pdfLink: policyData?.PolicyPrintUrl || null,
        planName: policyData?.PlanName || policyData?.Plan || "Standard Plan",
      };

      await addDoc(collection(db, "insurancesCustumer"), finalRecord);
      setIsRecordSaved(true);

      if (policyData.PolicyPrintUrl) {
        window.open(policyData.PolicyPrintUrl, '_blank');
      }

    } catch (error) {
      console.error("Firestore Save Error:", error);
      if (policyData.PolicyPrintUrl) window.open(policyData.PolicyPrintUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 font-sans">
      <motion.div
        className="max-w-3xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >

        {/* --- Header Section --- */}
        <div className="text-center mb-10">
          <motion.div
            className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6 shadow-inner"
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 12 }}
          >
            <HiCheckCircle className="h-12 w-12 text-green-600" />
          </motion.div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Policy Issued!</h2>
          <p className="mt-3 text-slate-500">Transaction ID: <span className="font-bold text-slate-700">{transactionData?.unique_tran_id}</span></p>
        </div>

        {/* --- Main Receipt Card --- */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-green-400 to-blue-500"></div>

          <div className="p-8 md:p-12">

            <div className="flex flex-col md:flex-row justify-between border-b border-slate-100 pb-8 mb-8 gap-6">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Policy Number</p>
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-mono font-bold text-slate-800">{policyNo}</span>
                  <span className="bg-green-100 text-green-700 text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-tighter">Verified</span>
                </div>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 min-w-[200px]">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                <p className="text-sm font-bold text-green-600 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
                  Payment Confirmed
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-12 mb-12">
              <div className="space-y-6">
                <div>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <HiUser className="text-blue-500" /> Traveler Info
                  </h3>
                  <p className="text-xl font-bold text-slate-900">{travelerName}</p>
                  <p className="text-sm text-slate-500">{travelerEmail}</p>
                </div>
                <div>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <HiClock className="text-blue-500" /> Payment Date
                  </h3>
                  <p className="text-sm font-medium text-slate-700">{transactionData?.paid_datetime || "Processed Today"}</p>
                </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <HiCreditCard className="text-purple-500" /> Payment Breakdown
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Policy Premium</span>
                    <span className="font-bold text-slate-800">{convertPrice(premium)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Government Taxes</span>
                    <span className="font-bold text-slate-800">{convertPrice(tax)}</span>
                  </div>
                  <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                    <span className="font-black text-slate-900">Total Paid</span>
                    <span className="text-xl font-black text-green-600 tracking-tight">{convertPrice(totalValue)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleAction}
                className="w-full group flex items-center justify-center gap-3 bg-slate-900 hover:bg-black text-white py-5 rounded-2xl font-bold transition-all shadow-xl shadow-slate-200"
              >
                <HiArrowDownTray className="text-xl group-hover:animate-bounce" />
                {isRecordSaved ? "Download E-Policy PDF" : "Secure Record & Download"}
              </button>

              <button
                onClick={() => navigate('/')}
                className="w-full flex items-center justify-center gap-2 text-slate-400 hover:text-slate-600 font-bold py-2 transition-colors"
              >
                <HiHome /> Back to Dashboard
              </button>
            </div>

          </div>
        </div>

        <p className="mt-8 text-center text-[10px] text-slate-400 font-mono uppercase tracking-[0.3em]">
          This is an electronically generated certificate
        </p>
      </motion.div>
    </div>
  );
};

export default BookingConfirmation;