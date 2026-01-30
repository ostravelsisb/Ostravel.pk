import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaPassport, FaCalendarAlt, FaClock, FaDownload, FaHome } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';

function VisaConfirmation() {
    const navigate = useNavigate();
    const [visaApplication, setVisaApplication] = useState(null);

    useEffect(() => {
        const savedApplication = sessionStorage.getItem('confirmed_visa_application');

        if (!savedApplication) {
            navigate('/');
            return;
        }

        setVisaApplication(JSON.parse(savedApplication));
    }, [navigate]);

    if (!visaApplication) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-slate-100 py-12 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Success Animation */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", duration: 0.6 }}
                    className="text-center mb-8"
                >
                    <div className="inline-block p-6 bg-emerald-100 rounded-full mb-4">
                        <FaCheckCircle className="text-7xl text-emerald-600" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-3">
                        Payment Successful!
                    </h1>
                    <p className="text-lg text-slate-600">
                        Your visa application has been submitted successfully
                    </p>
                </motion.div>

                {/* Application Details Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-6"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-8 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-emerald-200 text-xs font-bold uppercase tracking-wider mb-1">
                                    Application Number
                                </p>
                                <p className="text-3xl font-black font-mono">
                                    {visaApplication.applicationNumber}
                                </p>
                            </div>
                            <FaPassport className="text-6xl opacity-20" />
                        </div>
                    </div>

                    {/* Details */}
                    <div className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <DetailItem
                                icon={<FaPassport className="text-emerald-600" />}
                                label="Country"
                                value={visaApplication.country}
                            />
                            <DetailItem
                                icon={<FaPassport className="text-blue-600" />}
                                label="Visa Type"
                                value={visaApplication.visaType}
                            />
                            <DetailItem
                                icon={<FaClock className="text-amber-600" />}
                                label="Processing Time"
                                value={visaApplication.processingTime}
                            />
                            <DetailItem
                                icon={<FaCalendarAlt className="text-purple-600" />}
                                label="Validity"
                                value={visaApplication.validity}
                            />
                        </div>

                        <div className="border-t-2 border-slate-100 pt-6">
                            <div className="bg-emerald-50 rounded-2xl p-6 text-center">
                                <p className="text-emerald-600 text-sm font-bold uppercase tracking-wider mb-1">
                                    Amount Paid
                                </p>
                                <p className="text-4xl font-black text-emerald-700">
                                    PKR {visaApplication.totalFee.toLocaleString()}
                                </p>
                                <p className="text-xs text-slate-500 mt-2">
                                    Transaction ID: {visaApplication.transactionId}
                                </p>
                            </div>
                        </div>

                        {visaApplication.urgentProcessing && (
                            <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
                                <p className="text-amber-800 font-bold text-sm flex items-center gap-2">
                                    <span className="text-xl">⚡</span> Urgent Processing Selected
                                </p>
                                <p className="text-amber-700 text-xs mt-1">
                                    Your application will be processed on priority
                                </p>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Next Steps */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white rounded-3xl shadow-xl p-8 mb-6"
                >
                    <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                        <MdEmail className="text-emerald-600" />
                        What Happens Next?
                    </h2>
                    <div className="space-y-4">
                        <StepItem
                            number="1"
                            title="Email Confirmation"
                            description="You will receive a confirmation email with your application details within 5 minutes."
                        />
                        <StepItem
                            number="2"
                            title="Document Verification"
                            description="Our team will verify your submitted documents within 24 hours."
                        />
                        <StepItem
                            number="3"
                            title="Processing"
                            description={`Your visa application will be processed within ${visaApplication.processingTime}.`}
                        />
                        <StepItem
                            number="4"
                            title="Status Updates"
                            description="Track your application status in your dashboard. You'll be notified via email for any updates."
                        />
                    </div>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-4 rounded-xl font-bold text-lg hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-lg hover:shadow-xl"
                    >
                        <FaHome />
                        Go to Dashboard
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="flex items-center justify-center gap-3 bg-white text-slate-700 py-4 rounded-xl font-bold text-lg border-2 border-slate-200 hover:border-emerald-500 hover:text-emerald-600 transition-all"
                    >
                        <FaDownload />
                        Download Receipt
                    </button>
                </motion.div>

                {/* Support Info */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 }}
                    className="text-center mt-8 text-sm text-slate-500"
                >
                    <p>
                        Need help? Contact us at{' '}
                        <a href="tel:+92512120700" className="text-emerald-600 font-bold hover:underline">
                            +92 51 2120700
                        </a>
                        {' '}or{' '}
                        <a href="mailto:info@ostravels.com" className="text-emerald-600 font-bold hover:underline">
                            info@ostravels.com
                        </a>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}

// Detail Item Component
const DetailItem = ({ icon, label, value }) => (
    <div className="flex items-start gap-3">
        <div className="text-2xl mt-1">{icon}</div>
        <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</p>
            <p className="text-lg font-black text-slate-900 mt-0.5">{value}</p>
        </div>
    </div>
);

// Step Item Component
const StepItem = ({ number, title, description }) => (
    <div className="flex gap-4">
        <div className="flex-shrink-0 w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center font-black text-sm">
            {number}
        </div>
        <div className="flex-1">
            <h3 className="font-bold text-slate-900">{title}</h3>
            <p className="text-sm text-slate-600 mt-1">{description}</p>
        </div>
    </div>
);

export default VisaConfirmation;
