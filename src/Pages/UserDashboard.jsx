import React, { useState, useEffect } from 'react';
import { db, storage } from '../firbase';
import { collection, query, getDocs, orderBy, doc, updateDoc, where, getDoc } from 'firebase/firestore'; // Added where, getDoc
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // Added storage imports
import { useAuth } from '../Context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { HiEye, HiPencil, HiX, HiPrinter, HiUpload, HiDocument, HiChatAlt } from 'react-icons/hi'; // Added HiChatAlt
import { updateApplicationData } from '../Utils/ApplicationEditUtils';
import { getCachedData, setCachedData } from '../Utils/cacheUtils';
import { getAllCountryNames, getVisaDataByCountry } from '../Data/visaData'; // Import country data

const UserDashboard = () => {
    const { currentUser } = useAuth();
    const [activeTab, setActiveTab] = useState('visa');
    const [visaApplications, setVisaApplications] = useState([]);
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(true);

    // View States
    const [viewingVisa, setViewingVisa] = useState(null);
    const [viewingPolicy, setViewingPolicy] = useState(null);

    // Edit States
    const [editingVisa, setEditingVisa] = useState(null);
    const [editingPolicy, setEditingPolicy] = useState(null);
    const [editFormData, setEditFormData] = useState({});

    // NEW: File Upload States
    const [uploadingFiles, setUploadingFiles] = useState(false);
    const [fileInputs, setFileInputs] = useState({}); // { passport: File, photo: File, ... }

    const [saving, setSaving] = useState(false);

    // Date Filters
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [availableCountries] = useState(getAllCountryNames());
    const [availableVisaTypes, setAvailableVisaTypes] = useState([]);

    // Update available visa types when country changes in edit mode
    useEffect(() => {
        if (editFormData.country) {
            const countryData = getVisaDataByCountry(editFormData.country);
            if (countryData && countryData.visaTypes) {
                setAvailableVisaTypes(countryData.visaTypes);
            } else {
                setAvailableVisaTypes([]);
            }
        }
    }, [editFormData.country]);

    // Derived filtered data
    const filteredVisas = visaApplications.filter(v => {
        if (!startDate && !endDate) return true;
        const appDate = new Date(v.applicationDate);
        const start = startDate ? new Date(startDate) : new Date('1970-01-01');
        const end = endDate ? new Date(endDate) : new Date();
        end.setHours(23, 59, 59); // End of day
        return appDate >= start && appDate <= end;
    });

    const filteredPolicies = policies.filter(p => {
        if (!startDate && !endDate) return true;
        const purchDate = new Date(p.purchaseDate);
        const start = startDate ? new Date(startDate) : new Date('1970-01-01');
        const end = endDate ? new Date(endDate) : new Date();
        end.setHours(23, 59, 59);
        return purchDate >= start && purchDate <= end;
    });

    useEffect(() => {
        const fetchData = async () => {
            if (!currentUser) {
                console.log('⏸️ No user logged in, skipping data fetch');
                setLoading(false);
                return;
            }

            console.log('🔍 Fetching data for user:', currentUser.email);

            try {

                // 1. Try to load from cache first
                const cachedVisas = getCachedData(`visas_${currentUser.uid}`);
                const cachedPolicies = getCachedData(`policies_${currentUser.uid}`);

                if (cachedVisas) {
                    console.log('⚡ Loaded visas from cache');
                    setVisaApplications(cachedVisas);
                }

                if (cachedPolicies) {
                    console.log('⚡ Loaded policies from cache');
                    setPolicies(cachedPolicies);
                }

                // If we have both cached, we can stop loading (background refresh will continue)
                if (cachedVisas && cachedPolicies) {
                    setLoading(false);
                }

                // 2. Fetch fresh data from Firestore
                // Fetch ONLY current user's visa applications
                // Filter by email (primary) and uid (fallback)
                const visasQ = query(
                    collection(db, 'visaApplications'),
                    where('email', '==', currentUser.email),
                    orderBy('applicationDate', 'desc')
                );

                console.log('📥 Fetching visa applications...');
                const visasSnapshot = await getDocs(visasQ);
                const visasData = visasSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    applicationDate: doc.data().applicationDate?.toDate()
                }));

                console.log(`✅ Found ${visasData.length} visa application(s)`);
                setVisaApplications(visasData);
                setCachedData(`visas_${currentUser.uid}`, visasData); // Update cache

                // Fetch ONLY current user's insurance policies
                // Try email first, fallback to other fields if needed
                const policiesQ = query(
                    collection(db, 'insurancesCustumer'),
                    where('userEmail', '==', currentUser.email),
                    orderBy('purchaseDate', 'desc')
                );

                console.log('📥 Fetching insurance policies...');
                const policiesSnapshot = await getDocs(policiesQ);
                const policiesData = policiesSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    purchaseDate: doc.data().purchaseDate?.toDate()
                }));

                console.log(`✅ Found ${policiesData.length} insurance polic(ies)`);
                setPolicies(policiesData);

            } catch (error) {
                console.error("❌ Error fetching data:", error);

                // Handle specific error types
                if (error.code === 'permission-denied') {
                    alert('⚠️ Access denied. Please contact support.\n\nError: You do not have permission to view this data.');
                } else if (error.code === 'failed-precondition') {
                    console.error('🔍 Missing Firestore index. Creating index required.');
                    alert('⚠️ Database configuration needed.\n\nPlease contact support to set up required indexes.');
                } else if (error.code === 'unavailable') {
                    alert('⚠️ Network error. Please check your internet connection and try again.');
                } else {
                    alert('⚠️ Failed to load your applications.\n\nPlease refresh the page or contact support if the issue persists.');
                }

                // Set empty arrays on error
                setVisaApplications([]);
                setPolicies([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentUser]);

    const getStatusBadge = (status) => {
        const statusColors = {
            'Pending': 'bg-yellow-100 text-yellow-800',
            'Processing': 'bg-blue-100 text-blue-800',
            'Under Processing': 'bg-blue-100 text-blue-800',
            'Approved': 'bg-green-100 text-green-800',
            'Rejected': 'bg-red-100 text-red-800',
            'Doc Received': 'bg-purple-100 text-purple-800',
            'Unpaid': 'bg-orange-100 text-orange-800',
        };
        return statusColors[status] || 'bg-gray-100 text-gray-800';
    };

    const handleEditVisa = (visa) => {
        setEditingVisa(visa);
        setEditFormData({
            applicantName: visa.applicantName || '',
            email: visa.email || '',
            phone: visa.phone || '',
            cnic: visa.cnic || '',
            age: visa.age || '',
            country: visa.country || '',
            visaType: visa.visaType || ''
        });
        setFileInputs({}); // Reset files
    };

    const handleEditPolicy = (policy) => {
        setEditingPolicy(policy);
        setEditFormData({
            travelerName: policy.travelerName || '',
            cnic: policy.cnic || '',
            policyNumber: policy.policyNumber || ''
        });
    };

    // Helper: Upload a single file
    const uploadFile = async (file, path) => {
        const storageRef = ref(storage, path);
        await uploadBytes(storageRef, file);
        return await getDownloadURL(storageRef);
    };

    const handleSaveVisa = async () => {
        console.log('🚀 handleSaveVisa CALLED!');

        if (!editingVisa) {
            console.error('❌ No editing visa found!');
            return;
        }

        console.log('📋 Editing visa ID:', editingVisa.id);
        console.log('📝 Form data:', editFormData);
        console.log('📁 File inputs:', Object.keys(fileInputs));

        setSaving(true);
        try {
            let updatedData = { ...editFormData };
            let updatedDocumentURLs = { ...(editingVisa.documentURLs || {}) };
            let hasNewFiles = Object.keys(fileInputs).length > 0;

            // Handle File Uploads
            if (hasNewFiles) {
                console.log('📤 Uploading', Object.keys(fileInputs).length, 'files...');
                setUploadingFiles(true);
                const fileKeys = ['passport', 'photo', 'cnicFront', 'cnicBack', 'bankStatement', 'nicScan', 'bForm', 'frc'];

                for (const key of fileKeys) {
                    if (fileInputs[key]) {
                        const path = `visa_documents/${currentUser.uid}/${editingVisa.applicationNumber}/${key}_${Date.now()}`;
                        const url = await uploadFile(fileInputs[key], path);
                        updatedDocumentURLs[key] = url;
                        console.log(`✅ Uploaded ${key}`);
                    }
                }
                updatedData.documentURLs = updatedDocumentURLs;
                setUploadingFiles(false);
            }

            console.log('💾 Calling updateApplicationData with trackChanges=TRUE');

            // Use updateApplicationData with tracking enabled
            await updateApplicationData(editingVisa.id, 'visaApplications', updatedData, true);

            console.log('✅ Update completed successfully');

            // VERIFICATION: Read back from Firestore
            console.log('🔍 Verifying update...');
            const { doc: firestoreDoc, getDoc } = await import('firebase/firestore');
            const docRef = firestoreDoc(db, 'visaApplications', editingVisa.id);
            const verifySnap = await getDoc(docRef);
            const verifyData = verifySnap.data();

            console.log('📊 VERIFICATION RESULTS:', {
                editApproved: verifyData.editApproved,
                userConfirmed: verifyData.userConfirmed,
                userConfirmedAt: verifyData.userConfirmedAt,
                hasEditHistory: !!verifyData.editHistory
            });

            if (verifyData.editApproved !== false) {
                console.error('⚠️ WARNING: editApproved is NOT false!');
            } else {
                console.log('✅ editApproved = false (correct)');
            }

            if (verifyData.userConfirmed !== true) {
                console.error('⚠️ WARNING: userConfirmed is NOT true!');
            } else {
                console.log('✅ userConfirmed = true (correct)');
            }

            alert('✅ Visa application updated successfully!\n\nYour changes have been submitted for review.\nEdit access has been automatically locked.\n\nThe page will reload in 2 seconds.');

            console.log('⏳ Waiting 2 seconds before reload...');
            await new Promise(resolve => setTimeout(resolve, 2000));

            setEditingVisa(null);
            console.log('🔄 Reloading page...');
            window.location.reload();
        } catch (error) {
            console.error("❌ Update error:", error);
            console.error('Error details:', {
                message: error.message,
                code: error.code,
                stack: error.stack
            });
            alert('Failed to update visa application: ' + error.message);
        } finally {
            setSaving(false);
            setUploadingFiles(false);
        }
    };

    const handleSavePolicy = async () => {
        if (!editingPolicy) return;
        setSaving(true);
        try {
            await updateApplicationData(editingPolicy.id, 'insurancesCustumer', editFormData);
            alert('Policy updated successfully');
            setEditingPolicy(null);
            window.location.reload();
        } catch (error) {
            alert('Failed to update policy');
        } finally {
            setSaving(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    // File Input Helper
    const handleFileSelect = (key, e) => {
        if (e.target.files[0]) {
            setFileInputs({ ...fileInputs, [key]: e.target.files[0] });
        }
    };

    // Render Image Preview or Link
    const renderDocument = (url, label, isVerified) => {
        if (!url) return null;
        return (
            <div className={`mb-4 break-inside-avoid relative ${isVerified ? 'order-first' : ''}`}>
                <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</p>
                    {isVerified && (
                        <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                            ✓ Verified
                        </span>
                    )}
                </div>
                <a href={url} target="_blank" rel="noopener noreferrer"
                    className={`block group relative overflow-hidden rounded-lg border bg-slate-50 transition-all ${isVerified ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm' : 'border-slate-200'}`}>
                    <img src={url} alt={label} className="w-full h-48 object-cover transition-transform group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <span className="bg-white/90 text-slate-900 px-3 py-1 rounded-full text-xs font-bold shadow-sm">View Full</span>
                    </div>
                </a>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto"></div>
                    <p className="mt-4 text-slate-600 font-medium">Loading your applications...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4 font-sans">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">My Applications</h1>
                        <p className="text-slate-500 mt-1">Manage your visa applications and insurance policies</p>
                    </div>
                </div>

                {/* Date Filters */}
                <div className="mb-6 flex flex-wrap items-end gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Start Date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">End Date</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                    </div>
                    {(startDate || endDate) && (
                        <button
                            onClick={() => { setStartDate(''); setEndDate(''); }}
                            className="px-3 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex space-x-1 bg-white p-1 rounded-xl shadow-sm border border-slate-200 mb-6 w-fit">
                    <button onClick={() => setActiveTab('visa')} className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'visa' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}>
                        Visa Applications ({filteredVisas.length})
                    </button>
                    <button onClick={() => setActiveTab('insurance')} className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'insurance' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}>
                        Insurance Policies ({filteredPolicies.length})
                    </button>
                </div>

                {/* Content Area */}
                <AnimatePresence mode="wait">
                    {activeTab === 'visa' ? (
                        <motion.div key="visa" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Applicant</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Details</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredVisas.map((visa) => (
                                            <tr key={visa.id} className="hover:bg-slate-50 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-slate-900">{visa.applicantName || 'N/A'}</div>
                                                    <div className="text-sm text-slate-500">{visa.email}</div>
                                                    {/* Admin Message Indicator */}
                                                    {visa.adminMessage && (
                                                        <div className="mt-1 flex items-center gap-1 text-xs text-amber-600 font-bold bg-amber-50 px-2 py-1 rounded border border-amber-200 w-fit">
                                                            <HiChatAlt /> Msg from Admin
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-slate-900">{visa.country} - {visa.visaType}</div>
                                                    <div className="text-xs text-slate-500 font-mono mt-0.5">{visa.applicationNumber}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-slate-500">{visa.applicationDate ? new Date(visa.applicationDate).toLocaleDateString() : 'N/A'}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${getStatusBadge(visa.status)}`}>{visa.status || 'Pending'}</span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => setViewingVisa(visa)}
                                                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-xs font-bold"
                                                        >
                                                            <HiEye className="w-4 h-4" /> View
                                                        </button>
                                                        {visa.editApproved && (
                                                            <button
                                                                onClick={() => handleEditVisa(visa)}
                                                                className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors text-xs font-bold"
                                                            >
                                                                <HiPencil className="w-4 h-4" /> Edit
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div key="insurance" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                            {/* Insurance Table (Same as before) */}
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Traveler</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Plan</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredPolicies.map((policy) => (
                                            <tr key={policy.id} className="hover:bg-slate-50 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-slate-900">{policy.travelerName || 'N/A'}</div>
                                                    <div className="text-sm text-slate-500">{policy.cnic}</div>
                                                </td>
                                                <td className="px-6 py-4"><div className="font-medium text-slate-900">{policy.planName}</div></td>
                                                <td className="px-6 py-4"><div className="text-sm text-slate-500">{policy.purchaseDate ? new Date(policy.purchaseDate).toLocaleDateString() : 'N/A'}</div></td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => setViewingPolicy(policy)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"><HiEye className="w-5 h-5" /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* View Visa Modal - PROFESSIONAL REDESIGN */}
            <AnimatePresence>
                {viewingVisa && (
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white w-full max-w-6xl max-h-[95vh] shadow-2xl relative rounded-3xl overflow-hidden print:shadow-none print:w-full print:max-w-none flex flex-col"
                        >
                            {/* Header Section with Gradient */}
                            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-6 relative print:hidden">
                                <button
                                    onClick={() => setViewingVisa(null)}
                                    className="absolute top-4 right-4 p-2.5 bg-white/90 hover:bg-white rounded-full transition-all shadow-lg hover:shadow-xl z-50 group"
                                >
                                    <HiX className="w-6 h-6 text-slate-700 group-hover:text-slate-900 transition-colors" />
                                </button>

                                <div className="flex items-center gap-4">
                                    <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                                        <HiDocument className="w-8 h-8 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">Visa Application Details</h2>
                                        <p className="text-emerald-50 text-sm mt-1 font-mono">{viewingVisa.applicationNumber}</p>
                                    </div>
                                </div>

                                {/* Status Badge in Header */}
                                <div className="mt-4 flex items-center gap-3">
                                    <span className={`inline-flex px-4 py-2 rounded-full text-sm font-bold shadow-lg ${getStatusBadge(viewingVisa.status)}`}>
                                        {viewingVisa.status || 'Pending'}
                                    </span>
                                    <span className="text-emerald-50 text-sm">
                                        Applied: {viewingVisa.applicationDate ? new Date(viewingVisa.applicationDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'}
                                    </span>
                                </div>
                            </div>

                            {/* ADMIN MESSAGE ALERT */}
                            {viewingVisa.adminMessage && (
                                <div className="mx-8 mt-6 bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 p-5 rounded-r-xl shadow-sm">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-amber-500 p-2 rounded-lg shrink-0">
                                            <HiChatAlt className="text-xl text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-amber-900 text-lg">Message from Admin</h3>
                                            <p className="text-amber-800 mt-2 leading-relaxed">{viewingVisa.adminMessage}</p>
                                            <p className="text-xs text-amber-600/70 mt-3 flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 bg-amber-600/70 rounded-full"></span>
                                                Received: {viewingVisa.adminMessageAt ? (() => { const t = viewingVisa.adminMessageAt; try { return new Date(t?.toDate ? t.toDate() : t).toLocaleString(); } catch { return 'Recently'; } })() : 'Recently'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Scrollable Content Wrapper */}
                            <div className="overflow-y-auto flex-1">
                                {/* Main Content Grid */}
                                <div className="p-8">
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                        {/* Left Column: Personal Information */}
                                        <div className="lg:col-span-1 space-y-6">
                                            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 border border-slate-200">
                                                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                                    <div className="w-8 h-0.5 bg-emerald-500"></div>
                                                    Personal Info
                                                </h3>
                                                <div className="space-y-5">
                                                    <div>
                                                        <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Full Name</p>
                                                        <p className="text-lg font-bold text-slate-900">{viewingVisa.applicantName}</p>
                                                    </div>
                                                    <div className="border-t border-slate-200 pt-4">
                                                        <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Email Address</p>
                                                        <p className="text-sm font-medium text-slate-700 break-all">{viewingVisa.email}</p>
                                                    </div>
                                                    <div className="border-t border-slate-200 pt-4">
                                                        <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Phone Number</p>
                                                        <p className="text-sm font-medium text-slate-700">{viewingVisa.phone || 'N/A'}</p>
                                                    </div>
                                                    <div className="border-t border-slate-200 pt-4">
                                                        <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">CNIC</p>
                                                        <p className="text-sm font-mono font-medium text-slate-700">{viewingVisa.cnic || 'N/A'}</p>
                                                    </div>
                                                    <div className="border-t border-slate-200 pt-4">
                                                        <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Passport Number</p>
                                                        <p className="text-sm font-mono font-medium text-slate-700">{viewingVisa.passportNumber || 'N/A'}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Travel Details Card */}
                                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                                                <h3 className="text-sm font-black text-blue-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                                    <div className="w-8 h-0.5 bg-blue-500"></div>
                                                    Travel Details
                                                </h3>
                                                <div className="space-y-5">
                                                    <div>
                                                        <p className="text-xs text-blue-600 uppercase tracking-wide mb-1">Destination</p>
                                                        <p className="text-lg font-bold text-blue-900">{viewingVisa.country}</p>
                                                    </div>
                                                    <div className="border-t border-blue-200 pt-4">
                                                        <p className="text-xs text-blue-600 uppercase tracking-wide mb-1">Visa Type</p>
                                                        <p className="text-sm font-medium text-blue-800">{viewingVisa.visaType}</p>
                                                    </div>
                                                    <div className="border-t border-blue-200 pt-4">
                                                        <p className="text-xs text-blue-600 uppercase tracking-wide mb-1">Total Fee</p>
                                                        <p className="text-2xl font-bold text-emerald-600">PKR {viewingVisa.totalFee?.toLocaleString() || '0'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Column: Documents */}
                                        <div className="lg:col-span-2">
                                            <div className="bg-white rounded-2xl border border-slate-200 p-6">
                                                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                                    <div className="w-8 h-0.5 bg-purple-500"></div>
                                                    Submitted Documents
                                                </h3>

                                                {viewingVisa.documentURLs && Object.keys(viewingVisa.documentURLs).length > 0 ? (
                                                    <div className="grid grid-cols-2 gap-4">
                                                        {renderDocument(viewingVisa.documentURLs?.personalPhoto, 'Personal Photo', viewingVisa.documentVerification?.personalPhoto)}
                                                        {renderDocument(viewingVisa.documentURLs?.passport, 'Passport', viewingVisa.documentVerification?.passport)}
                                                        {renderDocument(viewingVisa.documentURLs?.cnicFront, 'CNIC Front', viewingVisa.documentVerification?.cnicFront)}
                                                        {renderDocument(viewingVisa.documentURLs?.cnicBack, 'CNIC Back', viewingVisa.documentVerification?.cnicBack)}
                                                        {renderDocument(viewingVisa.documentURLs?.bankStatement, 'Bank Statement', viewingVisa.documentVerification?.bankStatement)}
                                                        {renderDocument(viewingVisa.documentURLs?.nicScan, 'NIC Scan', viewingVisa.documentVerification?.nicScan)}
                                                        {renderDocument(viewingVisa.documentURLs?.bForm, 'B-Form', viewingVisa.documentVerification?.bForm)}
                                                        {renderDocument(viewingVisa.documentURLs?.frc, 'FRC', viewingVisa.documentVerification?.frc)}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-12">
                                                        <HiDocument className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                                        <p className="text-slate-400 font-medium">No documents uploaded yet</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* End Scrollable Content Wrapper */}

                            {/* Footer Actions */}
                            <div className="border-t border-slate-200 px-8 py-5 bg-slate-50 flex items-center justify-between print:hidden">
                                <p className="text-sm text-slate-500">
                                    Need help? Contact support at <span className="font-medium text-emerald-600">support@ostravel.pk</span>
                                </p>
                                <button
                                    onClick={handlePrint}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-bold text-sm rounded-xl hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl"
                                >
                                    <HiPrinter className="w-5 h-5" />
                                    Print / Save PDF
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Edit Visa Modal - PRODUCTION READY */}
            {editingVisa && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-6 relative">
                            <button
                                onClick={() => setEditingVisa(null)}
                                className="absolute top-4 right-4 p-2.5 bg-white/90 hover:bg-white rounded-full transition-all shadow-lg hover:shadow-xl z-50 group"
                            >
                                <HiX className="w-6 h-6 text-slate-700 group-hover:text-slate-900 transition-colors" />
                            </button>

                            <div className="flex items-center gap-4">
                                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                                    <HiPencil className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">Edit Application</h2>
                                    <p className="text-emerald-50 text-sm mt-1">Update your visa application details</p>
                                </div>
                            </div>
                        </div>

                        {/* ADMIN MESSAGE ALERT in Edit Modal */}
                        {editingVisa.adminMessage && (
                            <div className="mx-8 mt-6 bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 p-5 rounded-r-xl shadow-sm">
                                <div className="flex items-start gap-4">
                                    <div className="bg-amber-500 p-2 rounded-lg shrink-0">
                                        <HiChatAlt className="text-xl text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-amber-900 text-lg">Action Required from Admin</h3>
                                        <p className="text-amber-800 mt-2 leading-relaxed">{editingVisa.adminMessage}</p>
                                        <p className="text-xs text-amber-600/70 mt-3">Please update the requested information below</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Scrollable Content */}
                        <div className="overflow-y-auto flex-1 p-8">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Left Column: Text Inputs */}
                                <div className="space-y-6">
                                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                            <div className="w-8 h-0.5 bg-emerald-500"></div>
                                            Application Details
                                        </h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">Destination Country</label>
                                                <select
                                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-white"
                                                    value={editFormData.country || ''}
                                                    onChange={e => {
                                                        const newCountry = e.target.value;
                                                        setEditFormData(prev => ({
                                                            ...prev,
                                                            country: newCountry,
                                                            visaType: '' // Reset visa type when country changes
                                                        }));
                                                    }}
                                                >
                                                    <option value="">Select Country</option>
                                                    {availableCountries.map(c => (
                                                        <option key={c.key} value={c.key}>{c.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">Visa Type</label>
                                                <select
                                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-white"
                                                    value={editFormData.visaType || ''}
                                                    onChange={e => setEditFormData({ ...editFormData, visaType: e.target.value })}
                                                    disabled={!editFormData.country}
                                                >
                                                    <option value="">Select Visa Type</option>
                                                    {availableVisaTypes.map((vt, idx) => (
                                                        <option key={idx} value={vt.type}>{vt.type} ({vt.category})</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">Applicant Name</label>
                                                <input
                                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                                                    value={editFormData.applicantName || ''}
                                                    onChange={e => setEditFormData({ ...editFormData, applicantName: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">Phone Number</label>
                                                <input
                                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                                                    value={editFormData.phone || ''}
                                                    onChange={e => setEditFormData({ ...editFormData, phone: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">Email Address</label>
                                                <input
                                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                                                    value={editFormData.email || ''}
                                                    onChange={e => setEditFormData({ ...editFormData, email: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">CNIC</label>
                                                <input
                                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-mono"
                                                    value={editFormData.cnic || ''}
                                                    onChange={e => setEditFormData({ ...editFormData, cnic: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Document Uploads */}
                                <div className="space-y-4">
                                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                            <div className="w-8 h-0.5 bg-purple-500"></div>
                                            Documents
                                        </h3>
                                        <div className="space-y-3">
                                            {[
                                                { key: 'personalPhoto', label: 'Personal Photo' },
                                                { key: 'passport', label: 'Passport' },
                                                { key: 'cnicFront', label: 'CNIC Front' },
                                                { key: 'cnicBack', label: 'CNIC Back' },
                                                { key: 'bankStatement', label: 'Bank Statement' },
                                                { key: 'nicScan', label: 'NIC Scan' },
                                                { key: 'bForm', label: 'B-Form' },
                                                { key: 'frc', label: 'FRC' }
                                            ].map(doc => {
                                                const isVerified = editingVisa.documentVerification?.[doc.key];
                                                const hasDocument = editingVisa.documentURLs?.[doc.key];

                                                return (
                                                    <div key={doc.key} className={`rounded-lg border p-4 transition-all ${isVerified ? 'bg-emerald-50 border-emerald-300' : 'bg-white border-slate-200'}`}>
                                                        <div className="flex items-center justify-between mb-2">
                                                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">{doc.label}</label>
                                                            {isVerified && (
                                                                <span className="bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                                                                    ✓ Verified
                                                                </span>
                                                            )}
                                                        </div>

                                                        {isVerified ? (
                                                            <div className="flex items-center gap-2 text-sm text-emerald-700">
                                                                <HiDocument className="w-4 h-4" />
                                                                <span className="font-medium">Document verified by admin</span>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <input
                                                                    type="file"
                                                                    onChange={(e) => handleFileSelect(doc.key, e)}
                                                                    className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-500 file:text-white hover:file:bg-emerald-600 file:cursor-pointer file:transition-colors"
                                                                    accept="image/*,.pdf"
                                                                />
                                                                {fileInputs[doc.key] && (
                                                                    <p className="text-xs text-emerald-600 mt-2 font-medium flex items-center gap-1">
                                                                        <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></span>
                                                                        New file selected: {fileInputs[doc.key].name}
                                                                    </p>
                                                                )}
                                                                {!fileInputs[doc.key] && hasDocument && (
                                                                    <p className="text-xs text-amber-600 mt-2 font-medium">
                                                                        ⚠ Not verified - please re-upload
                                                                    </p>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="border-t border-slate-200 px-8 py-5 bg-slate-50 flex items-center justify-between">
                            <p className="text-sm text-slate-500">
                                <span className="font-medium text-emerald-600">Tip:</span> Only unverified documents can be updated
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setEditingVisa(null)}
                                    className="px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl font-bold hover:bg-slate-100 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveVisa}
                                    disabled={saving || uploadingFiles}
                                    className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {uploadingFiles ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/50 border-b-white"></div>
                                            Uploading Files...
                                        </>
                                    ) : saving ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/50 border-b-white"></div>
                                            Saving Changes...
                                        </>
                                    ) : (
                                        <>
                                            <HiUpload className="w-5 h-5" />
                                            Save & Update
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* View Policy Modal placeholder for completeness */}
            {
                viewingPolicy && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-white p-6 rounded-lg max-w-lg w-full">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold">Policy Details</h2>
                                <button onClick={() => setViewingPolicy(null)}><HiX className="w-6 h-6" /></button>
                            </div>
                            <p>Policy Number: <span className="font-mono bg-slate-100 px-2 py-1 rounded">{viewingPolicy.policyNumber}</span></p>
                            <p className="mt-2">Traveler: {viewingPolicy.travelerName}</p>
                            <p className="mt-2">Plan: {viewingPolicy.planName}</p>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default UserDashboard;