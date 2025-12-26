import React, { useState, useEffect } from "react";
import { db } from "../firbase"; // Note the typo in filename 'firbase.js' matches existing project
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { FaCheckCircle, FaCalendarAlt, FaHotel, FaCar, FaUser, FaEnvelope, FaPhone } from "react-icons/fa";

export default function UmrahBookingForm() {
    // --- Form State ---
    const [formData, setFormData] = useState({
        services: {
            visa: false,
            transport: false,
            airFare: false,
        },
        makkah: {
            checkIn: "",
            checkOut: "",
            hotel: "Movenpick Hotel & Residence Hajar Tower Makkah 5 Star", // Default
            rooms: 1,
            nights: 0,
        },
        transport: {
            vehicleType: "Car",
            travelers: 1,
        },
        user: {
            name: "",
            email: "",
            contact: "",
        },
    });

    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    // --- Auto-Calculate Nights ---
    useEffect(() => {
        const { checkIn, checkOut } = formData.makkah;
        if (checkIn && checkOut) {
            const start = new Date(checkIn);
            const end = new Date(checkOut);
            if (!isNaN(start) && !isNaN(end) && end > start) {
                const diffTime = Math.abs(end - start);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                setFormData((prev) => ({
                    ...prev,
                    makkah: { ...prev.makkah, nights: diffDays },
                }));
            } else {
                setFormData((prev) => ({
                    ...prev,
                    makkah: { ...prev.makkah, nights: 0 },
                }));
            }
        }
    }, [formData.makkah.checkIn, formData.makkah.checkOut]);

    // --- Handlers ---
    const handleServiceChange = (e) => {
        const { name, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            services: { ...prev.services, [name]: checked },
        }));
    };

    const handleMakkahChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            makkah: { ...prev.makkah, [name]: value },
        }));
    };

    const handleTransportChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            transport: { ...prev.transport, [name]: value },
        }));
    };

    const handleUserChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            user: { ...prev.user, [name]: value },
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg("");

        // Basic Validation
        if (!formData.user.name || !formData.user.contact) {
            setErrorMsg("Please provide your Name and Contact Number.");
            setLoading(false);
            return;
        }

        try {
            await addDoc(collection(db, "umardet"), {
                ...formData,
                createdAt: serverTimestamp(),
                status: "Pending", // For Admin tracking
            });
            setShowSuccess(true);
            // Reset form (optional, keeping it filled might be better for user reference, but standard is reset)
            // setFormData({...initialState}) 
        } catch (err) {
            console.error("Error submitting form: ", err);
            setErrorMsg("Something went wrong. Please try again or contact us directly.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
            <div className="bg-blue-600 p-6 text-white text-center">
                <h2 className="text-2xl font-bold">Build Your Custom Package</h2>
                <p className="opacity-90 text-sm">Select your preferences and get a quote</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">

                {/* 1. Services Selection */}
                <section>
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <FaCheckCircle className="text-blue-500" /> Select Services
                    </h3>
                    <div className="flex flex-wrap gap-4">
                        <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-4 py-2 rounded-lg border border-slate-200 hover:border-blue-300 transition">
                            <input
                                type="checkbox"
                                name="visa"
                                checked={formData.services.visa}
                                onChange={handleServiceChange}
                                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <span className="text-gray-700 font-medium">Umrah Visa</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-4 py-2 rounded-lg border border-slate-200 hover:border-blue-300 transition">
                            <input
                                type="checkbox"
                                name="transport"
                                checked={formData.services.transport}
                                onChange={handleServiceChange}
                                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <span className="text-gray-700 font-medium">Transport</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-4 py-2 rounded-lg border border-slate-200 hover:border-blue-300 transition">
                            <input
                                type="checkbox"
                                name="airFare"
                                checked={formData.services.airFare}
                                onChange={handleServiceChange}
                                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <span className="text-gray-700 font-medium">Add Air Fare</span>
                        </label>
                    </div>
                </section>

                <hr />

                {/* 2. Accommodation (Makkah) */}
                <section>
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <FaHotel className="text-blue-500" /> Accommodation (Makkah)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">Check In</label>
                            <div className="relative">
                                <FaCalendarAlt className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    type="date"
                                    name="checkIn"
                                    value={formData.makkah.checkIn}
                                    onChange={handleMakkahChange}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">Check Out</label>
                            <div className="relative">
                                <FaCalendarAlt className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    type="date"
                                    name="checkOut"
                                    value={formData.makkah.checkOut}
                                    onChange={handleMakkahChange}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-600 mb-1">Select Hotel</label>
                            <select
                                name="hotel"
                                value={formData.makkah.hotel}
                                onChange={handleMakkahChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            >
                                <option>Movenpick Hotel & Residence Hajar Tower Makkah 5 Star</option>
                                <option>Swissotel Al Maqam Makkah 5 Star</option>
                                <option>Pullman ZamZam Makkah 5 Star</option>
                                <option>Anjum Hotel Makkah 4 Star</option>
                                <option>Emaar Grand Hotel 4 Star</option>
                                <option>Economy Hotel (Shuttle Service)</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-1">Rooms</label>
                                <input
                                    type="number"
                                    min="1"
                                    name="rooms"
                                    value={formData.makkah.rooms}
                                    onChange={handleMakkahChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-1">Nights</label>
                                <input
                                    type="text"
                                    readOnly
                                    value={formData.makkah.nights}
                                    className="w-full px-4 py-2 border border-gray-300 bg-gray-100 rounded-lg text-gray-600"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                <hr />

                {/* 3. Transport */}
                <section>
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <FaCar className="text-blue-500" /> Transport
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">Vehicle Type</label>
                            <select
                                name="vehicleType"
                                value={formData.transport.vehicleType}
                                onChange={handleTransportChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            >
                                <option>Car (Sedan)</option>
                                <option>SUV / GMC</option>
                                <option>Hi-Ace</option>
                                <option>Coaster (Bus)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">Select Travelers</label>
                            <input
                                type="number"
                                min="1"
                                name="travelers"
                                value={formData.transport.travelers}
                                onChange={handleTransportChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </section>

                <hr />

                {/* 4. User Info */}
                <section className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <FaUser className="text-blue-500" /> Contact Details
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">Your Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.user.name}
                                onChange={handleUserChange}
                                placeholder="e.g. Ali Khan"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">Emails</label>
                            <div className="relative">
                                <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.user.email}
                                    onChange={handleUserChange}
                                    placeholder="e.g. ali@example.com"
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">Contact Number <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <FaPhone className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    type="tel"
                                    name="contact"
                                    value={formData.user.contact}
                                    onChange={handleUserChange}
                                    placeholder="e.g. 0336 5555666"
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {errorMsg && (
                    <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                        {errorMsg}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-xl py-4 shadow-lg shadow-blue-500/30 transition-all transform hover:scale-[1.01] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? "Submitting Request..." : "Start Booking / Get Quote"}
                </button>

            </form>

            {/* Success Modal */}
            <AnimatePresence>
                {showSuccess && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center relative"
                        >
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <FaCheckCircle className="text-5xl text-green-500" />
                            </div>
                            <h3 className="text-2xl font-extrabold text-gray-900 mb-2">Request Received!</h3>
                            <p className="text-gray-600 mb-6">
                                Thanks for choosing us. We will calculate the best price and send the details to your email and phone number shortly.
                            </p>
                            <button
                                onClick={() => setShowSuccess(false)}
                                className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition"
                            >
                                Close
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
