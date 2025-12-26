import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MdAccountBalanceWallet, MdAccountBalance, MdCreditCard, 
  MdArrowForward, MdVerifiedUser, MdInfo, MdErrorOutline, 
  MdCheckCircle, MdLock, MdShield, MdArrowBack
} from 'react-icons/md';
import { FaSpinner } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

export default function PayPage() {
  const navigate = useNavigate();
  const [paymentType, setPaymentType] = useState('3'); // Default to Card
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [redirectForm, setRedirectForm] = useState(null);
  
  // Data from Session
  const [policyData, setPolicyData] = useState(null);
  const [customerData, setCustomerData] = useState(null);

  useEffect(() => {
    const savedPolicy = sessionStorage.getItem('pending_policy');
    const savedCustomer = sessionStorage.getItem('customer_info');
    
    if (!savedPolicy || !savedCustomer) {
      navigate('/'); // Redirect back if data is missing
      return;
    }
    
    setPolicyData(JSON.parse(savedPolicy));
    setCustomerData(JSON.parse(savedCustomer));
  }, [navigate]);

  // Handle Alfalah Redirection
  useEffect(() => {
    if (redirectForm) {
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = redirectForm.action;
      Object.entries(redirectForm.fields).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });
      document.body.appendChild(form);
      form.submit();
    }
  }, [redirectForm]);

  const handlePayment = async () => {
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await fetch('https://alfalahpayemnt-production.up.railway.app/api/alfa/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            amount: customerData.amount, 
            type: paymentType 
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setStatus({ type: 'success', message: 'Redirecting to secure gateway...' });
        setRedirectForm(data.redirectForm);
      } else {
        setStatus({ type: 'error', message: data.message || 'Payment initiation failed' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Connection Error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (!customerData) return null;

  const methods = [
    { id: '1', label: 'Alfa Wallet', icon: MdAccountBalanceWallet, desc: 'Instant mobile app payment' },
    { id: '2', label: 'Bank Account', icon: MdAccountBalance, desc: 'Direct Alfalah account transfer' },
    { id: '3', label: 'Credit/Debit Card', icon: MdCreditCard, desc: 'Visa, Mastercard & UnionPay' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 font-sans antialiased selection:bg-blue-100">
      
      {/* Top Navigation */}
      <div className="w-full max-w-6xl mb-8 flex justify-between items-center">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-slate-500 font-bold hover:text-blue-600 transition-colors"
        >
          <MdArrowBack size={20} /> Back to Details
        </button>
        <div className="flex items-center gap-2 text-emerald-600 font-bold bg-emerald-50 px-4 py-2 rounded-full text-sm">
          <MdShield /> 256-bit Secure
        </div>
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT SIDE: SUMMARY CARD (Desktop Optimization) */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-5 space-y-6"
        >
          <div className="bg-white rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
            <div className="bg-slate-900 p-8 text-white">
                <p className="text-blue-400 text-xs font-black uppercase tracking-[0.2em] mb-2">Policy Summary</p>
                <h3 className="text-2xl font-black">{policyData?.PlanName} Plan</h3>
            </div>
            <div className="p-8 space-y-5">
                <div className="flex justify-between items-center pb-4 border-b border-slate-50">
                    <span className="text-slate-400 text-sm font-bold uppercase tracking-wider">Insured Person</span>
                    <span className="text-slate-800 font-black">{customerData.name}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-slate-50">
                    <span className="text-slate-400 text-sm font-bold uppercase tracking-wider">Coverage</span>
                    <span className="text-slate-800 font-black">{policyData?.TravelDays} Days</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-slate-50">
                    <span className="text-slate-400 text-sm font-bold uppercase tracking-wider">Trip Start</span>
                    <span className="text-slate-800 font-black">{policyData?.StartDate}</span>
                </div>
                
                <div className="mt-8 pt-6">
                    <div className="bg-blue-50 rounded-2xl p-6 text-center">
                        <p className="text-blue-500 text-xs font-black uppercase tracking-widest mb-1">Total Premium</p>
                        <p className="text-4xl font-black text-blue-700">PKR {customerData.amount.toLocaleString()}</p>
                    </div>
                </div>
            </div>
          </div>

          <div className="bg-emerald-600 rounded-3xl p-6 text-white flex items-center gap-4 shadow-lg shadow-emerald-200">
             <div className="bg-emerald-500 p-3 rounded-2xl"><MdVerifiedUser size={30}/></div>
             <div>
                <p className="font-black text-lg">Guaranteed Safe</p>
                <p className="text-emerald-100 text-sm">Your information is fully encrypted.</p>
             </div>
          </div>
        </motion.div>

        {/* RIGHT SIDE: PAYMENT ACTIONS */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-7 space-y-6"
        >
          <div className="bg-white rounded-[32px] shadow-2xl shadow-blue-900/10 border border-slate-100 overflow-hidden">
            
            {/* Payment Header */}
            <div className="bg-[#0052CC] p-10 text-white relative overflow-hidden">
               <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 0.1 }}
                className="absolute -right-10 -bottom-10"
               >
                 <MdLock size={200} />
               </motion.div>
               <div className="relative z-10">
                 <h2 className="text-3xl font-black tracking-tight">Select Payment Method</h2>
                 <p className="text-blue-100/70 font-medium">Choose your preferred way to pay</p>
               </div>
            </div>

            <div className="p-10 space-y-8">
              {/* Method Selection */}
              <div className="grid grid-cols-1 gap-4">
                {methods.map((m) => {
                  const active = paymentType === m.id;
                  return (
                    <motion.button
                      key={m.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setPaymentType(m.id)}
                      className={`flex items-center gap-5 p-6 rounded-2xl border-2 transition-all text-left ${
                        active ? 'border-[#0052CC] bg-blue-50/30' : 'border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      <div className={`p-4 rounded-2xl ${active ? 'bg-[#0052CC] text-white' : 'bg-slate-50 text-slate-400'}`}>
                        <m.icon size={28} />
                      </div>
                      <div className="flex-1">
                        <p className={`text-lg font-black ${active ? 'text-[#0052CC]' : 'text-slate-700'}`}>{m.label}</p>
                        <p className="text-sm text-slate-400 font-medium">{m.desc}</p>
                      </div>
                      {active && <MdCheckCircle size={28} className="text-[#0052CC]" />}
                    </motion.button>
                  );
                })}
              </div>

              {/* Amount Display (NON-EDITABLE) */}
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                 <span className="font-bold text-slate-400 uppercase tracking-widest text-xs">Processing Amount</span>
                 <span className="text-xl font-black text-slate-800">PKR {customerData.amount.toLocaleString()}</span>
              </div>

              {/* Submit Action */}
              <motion.button
                whileHover={{ y: -4, shadow: "0 20px 40px -10px rgba(0, 82, 204, 0.4)" }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePayment}
                disabled={loading}
                className="w-full bg-[#0052CC] text-white py-6 rounded-[24px] font-black text-xl flex items-center justify-center gap-4 shadow-xl shadow-blue-500/20 disabled:bg-slate-200 transition-all group"
              >
                {loading ? (
                  <FaSpinner className="animate-spin" size={24} />
                ) : (
                  <>
                    <span>Pay Securely Now</span>
                    <MdArrowForward size={24} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </motion.button>

              {/* Status Feedback */}
              <AnimatePresence>
                {status.message && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`p-5 rounded-2xl flex items-center gap-4 font-bold border ${
                      status.type === 'error' ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                    }`}
                  >
                    {status.type === 'error' ? <MdErrorOutline size={24} /> : <MdCheckCircle size={24} />}
                    {status.message}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Security Badge */}
              <div className="flex justify-center items-center gap-8 pt-4 opacity-40 grayscale">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-8" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/c/cb/UnionPay_logo.svg" alt="UnionPay" className="h-6" />
              </div>

            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}