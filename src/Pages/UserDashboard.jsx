import React, { useState, useEffect } from 'react';
import { db } from '../firbase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { useAuth } from '../Context/AuthContext';
import { motion } from 'framer-motion';
import { HiMagnifyingGlass, HiDocumentText, HiArrowDownTray, HiClock, HiCurrencyDollar, HiUser } from 'react-icons/hi2';

import { useCurrency } from '../Context/CurrencyContext'; // Added

const UserDashboard = () => {
    const { currentUser } = useAuth();
    const { convertPrice } = useCurrency(); // Added
    const [searchTerm, setSearchTerm] = useState('');
    const [policies, setPolicies] = useState([]);
    const [filteredPolicies, setFilteredPolicies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPolicies = async () => {
            if (!currentUser) return;

            try {
                // Fetch all policies for the current user
                const q = query(
                    collection(db, 'insurancesCustumer'),
                    where('uid', '==', currentUser.uid)
                    // Note: orderBy might require a composite index if mixed with where clause on different field.
                    // For now, we'll sort client-side if needed or simple queries.
                    // If policies grow large, we should add an index in Firebase console.
                );

                const querySnapshot = await getDocs(q);
                const policiesData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    // Convert Firestore timestamp to Date object if needed for sorting locally
                    purchaseDate: doc.data().purchaseDate?.toDate()
                }));

                // Sort by purchaseDate descending (newest first)
                policiesData.sort((a, b) => b.purchaseDate - a.purchaseDate);

                setPolicies(policiesData);
                setFilteredPolicies(policiesData);
            } catch (error) {
                console.error("Error fetching policies:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPolicies();
    }, [currentUser]);

    // Handle Search
    useEffect(() => {
        if (!searchTerm) {
            setFilteredPolicies(policies);
            return;
        }

        const lowerTerm = searchTerm.toLowerCase();
        const filtered = policies.filter(policy =>
            policy.policyNumber?.toLowerCase().includes(lowerTerm) ||
            policy.cnic?.toLowerCase().includes(lowerTerm)
        );
        setFilteredPolicies(filtered);
    }, [searchTerm, policies]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 font-sans">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Policies</h1>
                        <p className="text-slate-500 mt-1">Manage and view your insurance policies</p>
                    </div>

                    {/* Search Bar */}
                    <div className="relative w-full md:w-96">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <HiMagnifyingGlass className="text-slate-400 text-xl" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by Policy Number or CNIC..."
                            className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm shadow-sm transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Policies Grid */}
                {filteredPolicies.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="text-center py-20 bg-white rounded-[2rem] shadow-sm border border-slate-100"
                    >
                        <div className="mx-auto h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <HiDocumentText className="text-3xl text-slate-300" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">No policies found</h3>
                        <p className="text-slate-500 mt-2">Try adjusting your search criteria or buy a new policy.</p>
                    </motion.div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {filteredPolicies.map((policy) => (
                            <motion.div
                                key={policy.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 overflow-hidden hover:shadow-xl transition-shadow"
                            >
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <span className="inline-block px-2 py-1 rounded-md bg-green-50 text-green-700 text-[10px] font-black uppercase tracking-wider mb-2">
                                                {policy.status}
                                            </span>
                                            <h3 className="text-lg font-bold text-slate-900 font-mono tracking-tight">
                                                {policy.policyNumber}
                                            </h3>
                                        </div>
                                        <div className="h-10 w-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
                                            <HiDocumentText className="text-xl" />
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-6">
                                        <div className="flex items-center gap-3 text-sm text-slate-600">
                                            <HiUser className="text-slate-400" />
                                            <span className="font-medium">{policy.travelerName}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-slate-600">
                                            <HiClock className="text-slate-400" />
                                            <span>
                                                {policy.purchaseDate
                                                    ? policy.purchaseDate.toLocaleDateString(undefined, {
                                                        year: 'numeric', month: 'short', day: 'numeric'
                                                    })
                                                    : "Date N/A"
                                                }
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-slate-600">
                                            <HiCurrencyDollar className="text-slate-400" />
                                            <span className="font-bold">{convertPrice(policy.amount)}</span>
                                        </div>
                                        {policy.cnic && (
                                            <div className="flex items-center gap-3 text-sm text-slate-600">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-1 rounded">CNIC</span>
                                                <span className="font-mono">{policy.cnic}</span>
                                            </div>
                                        )}
                                    </div>

                                    {policy.pdfLink ? (
                                        <a
                                            href={policy.pdfLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block w-full text-center bg-slate-900 hover:bg-black text-white py-3 rounded-xl font-bold transition-colors text-sm flex items-center justify-center gap-2"
                                        >
                                            <HiArrowDownTray /> Download Policy
                                        </a>
                                    ) : (
                                        <button disabled className="block w-full text-center bg-slate-100 text-slate-400 py-3 rounded-xl font-bold text-sm cursor-not-allowed">
                                            PDF Not Available
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserDashboard;
