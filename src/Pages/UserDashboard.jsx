import React, { useState, useEffect } from 'react';
import { db } from '../firbase';
import { collection, query, getDocs, orderBy, doc, updateDoc, where, getDoc, onSnapshot } from 'firebase/firestore';

// ImgBB — same key used in ApplyVisa.jsx
const IMGBB_API_KEY = "339913c8ca610122063ecd903404baa0";
import { useAuth } from '../Context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { HiEye, HiPencil, HiX, HiPrinter, HiUpload, HiDocument, HiChatAlt, HiReceiptTax, HiCreditCard, HiClock } from 'react-icons/hi'; // Added HiChatAlt, HiReceiptTax, HiCreditCard, HiClock
import { updateApplicationData, markMessageSeen, hasUnseenMessage, saveUserMessage, markBadgeSeen, hasUnseenBadge } from '../Utils/ApplicationEditUtils';
import { getCachedData, setCachedData } from '../Utils/cacheUtils';
import { getAllCountryNames, getVisaDataByCountry } from '../Data/visaData'; // Import country data
import InvoiceModal from '../Components/InvoiceModal';
import ToastContainer, { notify } from '../Components/Toast';

const UserDashboard = () => {
    const { currentUser } = useAuth();
    const [activeTab, setActiveTab] = useState('visa');
    const [uploadingDocId, setUploadingDocId] = useState(null);

    // Applicant uploads a document an admin/subadmin requested for an Umrah
    // booking. Writes straight into that request's documentRequests[] array —
    // the admin panel's live listener picks it up instantly, no refresh needed.
    const handleUmrahDocUpload = async (umrahRequest, docEntry, file) => {
        if (!file || !currentUser) return;

        if (file.size < 10 * 1024 || file.size > 10 * 1024 * 1024) {
            alert('File size must be between 10KB and 10MB.');
            return;
        }
        if (!['image/jpeg', 'image/png'].includes(file.type)) {
            alert('Only JPG or PNG images are accepted.');
            return;
        }

        setUploadingDocId(docEntry.id);
        try {
            const fileUrl = await uploadFile(file, `${umrahRequest.requestNumber}_${docEntry.id}`);

            const updatedDocs = (umrahRequest.documentRequests || []).map(d =>
                d.id === docEntry.id
                    ? { ...d, status: 'Uploaded', fileUrl, fileName: file.name, uploadedAt: new Date().toISOString(), note: '' }
                    : d
            );

            await updateDoc(doc(db, 'umrahApplications', umrahRequest.id), {
                documentRequests: updatedDocs,
                updatedAt: new Date().toISOString(),
            });
        } catch (err) {
            console.error('Failed to upload umrah document:', err);
            alert('Upload failed. Please try again.');
        } finally {
            setUploadingDocId(null);
        }
    };
    const [visaApplications, setVisaApplications] = useState([]);
    const [umrahRequests, setUmrahRequests] = useState([]);
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(true);

    // View States
    const [viewingVisa, setViewingVisa] = useState(null);
    const [viewingPolicy, setViewingPolicy] = useState(null);
    // Message-to-admin box (per application)
    const [userMsgText, setUserMsgText] = useState('');
    const [sendingUserMsg, setSendingUserMsg] = useState(false);
    const [invoiceRecord, setInvoiceRecord] = useState(null); // { record, recordType }

    // Edit States
    const [editingVisa, setEditingVisa] = useState(null);
    const [editingPolicy, setEditingPolicy] = useState(null);
    const [editFormData, setEditFormData] = useState({});

    // NEW: File Upload States
    const [uploadingFiles, setUploadingFiles] = useState(false);
    const [fileInputs, setFileInputs] = useState({}); // { passport: File, photo: File, ... }

    const [saving, setSaving] = useState(false);

    // Ticks once a minute so the Umrah "Pay Now" 24h expiry countdown/cutoff
    // below stays accurate without needing a page refresh.
    const [nowTick, setNowTick] = useState(() => Date.now());
    useEffect(() => {
        const id = setInterval(() => setNowTick(Date.now()), 60 * 1000);
        return () => clearInterval(id);
    }, []);

    const PAYMENT_WINDOW_MS = 24 * 60 * 60 * 1000;
    // Falls back to the "Payment Requested" statusHistory entry, then
    // updatedAt, for requests created before paymentRequestedAt existed.
    const getPaymentRequestedAt = (r) => {
        const raw = r.paymentRequestedAt
            || (r.statusHistory || []).slice().reverse().find(h => h.status === 'Payment Requested')?.timestamp
            || r.updatedAt
            || null;
        return raw ? new Date(raw).getTime() : null;
    };
    const getPaymentDeadline = (r) => {
        const requestedAt = getPaymentRequestedAt(r);
        return requestedAt ? requestedAt + PAYMENT_WINDOW_MS : null;
    };
    const formatRemaining = (ms) => {
        const totalMinutes = Math.max(0, Math.floor(ms / 60000));
        const h = Math.floor(totalMinutes / 60);
        const m = totalMinutes % 60;
        return `${h}h ${m}m left`;
    };

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
        if (!currentUser) {
            console.log('⏸️ No user logged in, skipping data fetch');
            setLoading(false);
            return;
        }

        // 1. Load from cache first for instant paint
        const cachedVisas = getCachedData(`visas_${currentUser.uid}`);
        const cachedPolicies = getCachedData(`policies_${currentUser.uid}`);
        if (cachedVisas) setVisaApplications(cachedVisas);
        if (cachedPolicies) setPolicies(cachedPolicies);
        if (cachedVisas && cachedPolicies) setLoading(false);

        // 2. Realtime listener for visa applications — so admin/subadmin actions
        // (reupload requests, status changes, verifications) appear instantly
        // without the user needing to refresh the page.
        const visasQ = query(
            collection(db, 'visaApplications'),
            where('email', '==', currentUser.email),
            orderBy('applicationDate', 'desc')
        );

        const visasUnsub = onSnapshot(
            visasQ,
            (snapshot) => {
                const visasData = snapshot.docs.map(d => ({
                    id: d.id,
                    ...d.data(),
                    applicationDate: d.data().applicationDate?.toDate()
                }));
                setVisaApplications(visasData);
                setCachedData(`visas_${currentUser.uid}`, visasData);

                // Keep the currently open modals in sync with live data too,
                // so a re-upload request or status change shows up immediately
                // even while the user has a modal open.
                setViewingVisa(prev => prev ? (visasData.find(v => v.id === prev.id) || prev) : prev);
                setEditingVisa(prev => prev ? (visasData.find(v => v.id === prev.id) || prev) : prev);

                setLoading(false);
            },
            (error) => {
                console.error("❌ Error listening to visa applications:", error);
                if (error.code === 'permission-denied') {
                    alert('⚠️ Access denied. Please contact support.\n\nError: You do not have permission to view this data.');
                } else if (error.code === 'failed-precondition') {
                    console.error('🔍 Missing Firestore index. Creating index required.');
                    alert('⚠️ Database configuration needed.\n\nPlease contact support to set up required indexes.');
                } else if (error.code === 'unavailable') {
                    alert('⚠️ Network error. Please check your internet connection and try again.');
                }
                setLoading(false);
            }
        );

        // 3. Insurance policies (one-time fetch — no reupload flow involved here)
        const fetchPolicies = async () => {
            try {
                const policiesQ = query(
                    collection(db, 'insurancesCustumer'),
                    where('userEmail', '==', currentUser.email),
                    orderBy('purchaseDate', 'desc')
                );
                const policiesSnapshot = await getDocs(policiesQ);
                const policiesData = policiesSnapshot.docs.map(d => ({
                    id: d.id,
                    ...d.data(),
                    purchaseDate: d.data().purchaseDate?.toDate()
                }));
                setPolicies(policiesData);
                setCachedData(`policies_${currentUser.uid}`, policiesData);
            } catch (error) {
                console.error("❌ Error fetching policies:", error);
            }
        };
        fetchPolicies();

        // 4. Umrah requests — realtime, so a payment request from admin/subadmin
        // shows up instantly with a Pay Now button.
        const umrahQ = query(
            collection(db, 'umrahApplications'),
            where('uid', '==', currentUser.uid),
            orderBy('applicationDate', 'desc')
        );
        const umrahUnsub = onSnapshot(
            umrahQ,
            (snapshot) => {
                setUmrahRequests(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
            },
            (error) => console.error("❌ Error listening to umrah requests:", error)
        );

        return () => { visasUnsub(); umrahUnsub(); };
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

    const handleSendUserMessage = async (visa) => {
        const text = userMsgText.trim();
        if (!text) return;
        setSendingUserMsg(true);
        try {
            await saveUserMessage(visa.id, 'visaApplications', text);
            setUserMsgText('');
            notify.success('Message sent to our team');
        } catch (err) {
            console.error('Error sending message to admin:', err);
            notify.error('Failed to send message — try again');
        } finally {
            setSendingUserMsg(false);
        }
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
    // Upload to imgBB (same as ApplyVisa.jsx)
    const uploadFile = (file, name) => {
        return new Promise((resolve, reject) => {
            const form = new FormData();
            form.append("image", file);
            form.append("name", name);
            const xhr = new XMLHttpRequest();
            xhr.open("POST", `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`);
            xhr.onload = () => {
                try {
                    const res = JSON.parse(xhr.responseText);
                    if (res.success) resolve(res.data.url);
                    else reject(new Error(res.error?.message || 'ImgBB upload failed'));
                } catch {
                    reject(new Error('Invalid response from ImgBB'));
                }
            };
            xhr.onerror = () => reject(new Error('Network error during upload'));
            xhr.send(form);
        });
    };

    const handleSaveVisa = async () => {
        if (!editingVisa) return;

        setSaving(true);
        try {
            let updatedData = { ...editFormData };
            let updatedDocumentURLs = { ...(editingVisa.documentURLs || {}) };
            const fileKeys = ['personalPhoto', 'passport', 'cnicFront', 'cnicBack', 'bankStatement', 'nicScan', 'bForm', 'frc'];
            // Only the keys the user actually selected a file for get locked +
            // marked as re-uploaded — any other requested doc stays open
            // (Issue #4: partial re-upload no longer closes the whole session).
            const uploadedKeys = fileKeys.filter((key) => !!fileInputs[key]);
            const hasNewFiles = uploadedKeys.length > 0;

            if (hasNewFiles) {
                setUploadingFiles(true);
                for (const key of uploadedKeys) {
                    const path = `${editingVisa.applicationNumber}_${key}_${Date.now()}`;
                    const url = await uploadFile(fileInputs[key], path);
                    updatedDocumentURLs[key] = url;
                }
                updatedData.documentURLs = updatedDocumentURLs;
                setUploadingFiles(false);
            }

            await updateApplicationData(editingVisa.id, 'visaApplications', updatedData, true, uploadedKeys);

            // Upload any files selected for admin-named ("CNIC Front" style)
            // document requests, and flip their status to Uploaded.
            const pendingCustomDocs = (editingVisa.documentRequests || []).filter(
                (d) => fileInputs[`custom_${d.id}`]
            );
            if (pendingCustomDocs.length > 0) {
                setUploadingFiles(true);
                const updatedRequests = [...(editingVisa.documentRequests || [])];
                for (const docItem of pendingCustomDocs) {
                    const file = fileInputs[`custom_${docItem.id}`];
                    const path = `${editingVisa.applicationNumber}_${docItem.name}_${Date.now()}`;
                    const url = await uploadFile(file, path);
                    const idx = updatedRequests.findIndex((d) => d.id === docItem.id);
                    if (idx !== -1) {
                        updatedRequests[idx] = {
                            ...updatedRequests[idx],
                            status: 'Uploaded',
                            fileUrl: url,
                            fileName: file.name,
                            uploadedAt: new Date().toISOString(),
                        };
                    }
                }
                await updateApplicationData(editingVisa.id, 'visaApplications', { documentRequests: updatedRequests });
                setUploadingFiles(false);
            }

            // Clear only the files that were just uploaded — if other
            // requested documents are still pending, the modal stays open
            // and (thanks to the realtime listener) will re-filter itself
            // down to just what's left.
            setFileInputs((prev) => {
                const next = { ...prev };
                uploadedKeys.forEach((key) => delete next[key]);
                pendingCustomDocs.forEach((d) => delete next[`custom_${d.id}`]);
                return next;
            });

            const remainingPending = Object.entries(editingVisa.editApprovedDocs || {})
                .some(([key, val]) => val && !uploadedKeys.includes(key));

            if (remainingPending) {
                notify.info('Saved! Other requested documents are still pending — keep going.');
            } else {
                notify.success('Application updated successfully. Edit access is now locked.');
                setEditingVisa(null);
            }
        } catch (error) {
            console.error("Update error:", error);
            notify.error('Failed to update visa application: ' + error.message);
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

    // Selecting a file for a dynamically admin-named document request
    // (e.g. "CNIC Front" typed in by admin) — keyed by request id, uploaded
    // and saved separately from the fixed document set on Save.
    const handleCustomDocFileSelect = (docId, e) => {
        if (e.target.files[0]) {
            setFileInputs((prev) => ({ ...prev, [`custom_${docId}`]: e.target.files[0] }));
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
                <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
                    <div className="flex space-x-1 bg-white p-1 rounded-xl shadow-sm border border-slate-200 w-fit">
                        <button onClick={() => setActiveTab('visa')} className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'visa' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}>
                            Visa Applications ({filteredVisas.length})
                        </button>
                        <button onClick={() => setActiveTab('insurance')} className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'insurance' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}>
                            Insurance Policies ({filteredPolicies.length})
                        </button>
                        <button onClick={() => setActiveTab('umrah')} className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all relative ${activeTab === 'umrah' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}>
                            Umrah Requests ({umrahRequests.length})
                            {umrahRequests.some(r => r.status === 'Payment Requested') && (
                                <span className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full border-2 border-white animate-pulse" />
                            )}
                        </button>
                    </div>

                    {/* Quick Pay Now — only shown while on the Umrah Requests tab,
                        for the nearest unpaid, unexpired payment request. */}
                    {activeTab === 'umrah' && (() => {
                        const payable = umrahRequests
                            .filter(r => r.status === 'Payment Requested' && r.paymentStatus !== 'Paid')
                            .filter(r => {
                                const deadline = getPaymentDeadline(r);
                                return deadline === null || nowTick < deadline;
                            })
                            .sort((a, b) => (getPaymentDeadline(a) || Infinity) - (getPaymentDeadline(b) || Infinity))[0];
                        if (!payable) return null;
                        const deadline = getPaymentDeadline(payable);
                        const urgent = deadline && (deadline - nowTick) < 60 * 60 * 1000; // < 1h left
                        return (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                    localStorage.setItem('pending_umrah_payment', JSON.stringify({
                                        umrahDocId: payable.id,
                                        requestNumber: payable.requestNumber,
                                        applicantName: payable.user?.name || payable.userName,
                                        email: payable.userEmail || payable.user?.email || currentUser?.email,
                                        phone: payable.user?.contact,
                                        hotel: payable.makkah?.hotel,
                                        checkIn: payable.makkah?.checkIn,
                                        checkOut: payable.makkah?.checkOut,
                                        paymentAmount: payable.paymentAmount,
                                        paymentNote: payable.paymentNote,
                                    }));
                                    window.location.href = '/umrah-payment';
                                }}
                                className="group relative flex items-center gap-3 pl-5 pr-4 py-2.5 rounded-xl font-black text-sm text-white overflow-hidden bg-gradient-to-r from-purple-600 via-purple-600 to-fuchsia-600 shadow-lg shadow-purple-300/50 transition-shadow hover:shadow-xl hover:shadow-purple-300/60"
                            >
                                {/* Subtle animated sheen */}
                                <span className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                                <HiCreditCard className="w-5 h-5 relative shrink-0" />
                                <span className="relative flex flex-col items-start leading-tight">
                                    <span className="text-[10px] font-bold uppercase tracking-wide text-purple-100">Pay Now</span>
                                    <span className="text-sm font-black">PKR {Number(payable.paymentAmount || 0).toLocaleString()}</span>
                                </span>
                                {deadline && (
                                    <span className={`relative text-[11px] font-bold px-2 py-1 rounded-full ml-1 flex items-center gap-1 ${urgent ? 'bg-red-500/90 animate-pulse' : 'bg-white/20'}`}>
                                        <HiClock className="w-3 h-3" /> {formatRemaining(deadline - nowTick)}
                                    </span>
                                )}
                            </motion.button>
                        );
                    })()}
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
                                                    {/* Admin Message Indicator — only shown until the user dismisses this exact message */}
                                                    {hasUnseenBadge(visa) && (
                                                        <button
                                                            onClick={() => {
                                                                setViewingVisa(visa);
                                                                markBadgeSeen(visa.id, 'visaApplications', visa.adminMessageAt || null);
                                                            }}
                                                            title="Click to view message"
                                                            className="mt-1 flex items-center gap-1 text-xs text-amber-600 font-bold bg-amber-50 px-2 py-1 rounded border border-amber-200 w-fit hover:bg-amber-100 transition-colors"
                                                        >
                                                            <HiChatAlt /> Msg from Admin
                                                        </button>
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
                                                    {(visa.interviewDocuments || []).length > 0 && (
                                                        <div className="mt-2 space-y-1">
                                                            <p className="text-[10px] font-bold text-purple-500 uppercase tracking-wide">Interview Documents</p>
                                                            {visa.interviewDocuments.map((d) => (
                                                                <a
                                                                    key={d.id}
                                                                    href={d.url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    className="flex items-center gap-1 text-[11px] font-bold text-purple-600 hover:text-purple-800 w-fit"
                                                                >
                                                                    📎 {d.name}
                                                                </a>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {visa.decisionDocURL && (
                                                        <a
                                                            href={visa.decisionDocURL}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="mt-1 flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 w-fit"
                                                        >
                                                            📄 {visa.status === 'Approve' ? 'Visa Letter' : visa.status === 'Reject' ? 'Rejection Letter' : 'Letter'}
                                                        </a>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => setViewingVisa(visa)}
                                                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-xs font-bold"
                                                        >
                                                            <HiEye className="w-4 h-4" /> View
                                                        </button>
                                                        <button
                                                            onClick={() => setInvoiceRecord({ record: visa, recordType: 'visa' })}
                                                            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors text-xs font-bold"
                                                        >
                                                            <HiReceiptTax className="w-4 h-4" /> Invoice
                                                        </button>
                                                        {(visa.editApproved || (visa.documentRequests || []).some(d => d.status === 'Requested' || d.status === 'Rejected')) && (
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
                    ) : activeTab === 'insurance' ? (
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
                                                        <button onClick={() => setInvoiceRecord({ record: policy, recordType: 'insurance' })} className="p-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100"><HiReceiptTax className="w-5 h-5" /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div key="umrah" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                            {umrahRequests.length === 0 ? (
                                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-12 text-center">
                                    <p className="text-slate-500 font-bold">No Umrah requests yet</p>
                                    <p className="text-sm text-slate-400 mt-1">Submit a request from the Hajj & Umrah page to get a custom quote.</p>
                                </div>
                            ) : (
                                umrahRequests.map((r) => (
                                    <div key={r.id} className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className="font-black text-slate-900">{r.makkah?.hotel}</p>
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                                        r.status === 'Payment Requested' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                                        r.status === 'Documents Required' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                                        r.status === 'Paid' || r.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                        r.status === 'Rejected' ? 'bg-red-50 text-red-600 border-red-200' :
                                                        r.status === 'Processing' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                        'bg-amber-50 text-amber-700 border-amber-200'
                                                    }`}>
                                                        {r.status || 'Pending Review'}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-400 font-mono mt-0.5">{r.requestNumber}</p>
                                                <p className="text-sm text-slate-500 mt-2">
                                                    {r.makkah?.checkIn} → {r.makkah?.checkOut} · {r.makkah?.nights || 0} nights · {r.makkah?.rooms || 1} room(s)
                                                </p>
                                                {r.paymentNote && r.status === 'Payment Requested' && (
                                                    <p className="text-sm text-purple-700 bg-purple-50 border border-purple-100 rounded-lg px-3 py-2 mt-3 max-w-md">{r.paymentNote}</p>
                                                )}

                                                {r.documentRequests?.length > 0 && (
                                                    <div className="mt-4 space-y-2 max-w-md">
                                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Documents Requested</p>
                                                        {r.documentRequests.map((d) => (
                                                            <div key={d.id} className="border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-3">
                                                                <div className="min-w-0">
                                                                    <p className="font-bold text-slate-800 text-sm truncate">{d.name}</p>
                                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                                                        d.status === 'Verified' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                                        d.status === 'Uploaded' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                                        d.status === 'Rejected' ? 'bg-red-50 text-red-600 border-red-200' :
                                                                        'bg-orange-50 text-orange-700 border-orange-200'
                                                                    }`}>
                                                                        {d.status}
                                                                    </span>
                                                                    {d.status === 'Rejected' && d.note && (
                                                                        <p className="text-xs text-red-600 mt-1">Reason: {d.note}</p>
                                                                    )}
                                                                </div>
                                                                <div className="shrink-0">
                                                                    {(d.status === 'Requested' || d.status === 'Rejected') ? (
                                                                        <label className={`px-3 py-2 rounded-lg text-xs font-black cursor-pointer flex items-center gap-1.5 transition ${uploadingDocId === d.id ? 'bg-slate-200 text-slate-400' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}>
                                                                            <HiUpload className="w-4 h-4" />
                                                                            {uploadingDocId === d.id ? 'Uploading...' : d.status === 'Rejected' ? 'Re-upload' : 'Upload'}
                                                                            <input
                                                                                type="file"
                                                                                accept="image/jpeg,image/png"
                                                                                className="hidden"
                                                                                disabled={uploadingDocId === d.id}
                                                                                onChange={(e) => e.target.files?.[0] && handleUmrahDocUpload(r, d, e.target.files[0])}
                                                                            />
                                                                        </label>
                                                                    ) : d.fileUrl ? (
                                                                        <a href={d.fileUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-2 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center gap-1.5">
                                                                            <HiEye className="w-4 h-4" /> View
                                                                        </a>
                                                                    ) : null}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="text-right shrink-0">
                                                {r.status === 'Payment Requested' && r.paymentStatus !== 'Paid' ? (
                                                    (() => {
                                                        const deadline = getPaymentDeadline(r);
                                                        const expired = deadline !== null && nowTick >= deadline;
                                                        // return (
                                                        //     <>
                                                        //         <p className="text-xs text-slate-400 font-bold uppercase mb-1">Amount Due</p>
                                                        //         <p className="text-2xl font-black text-purple-700 mb-1">PKR {Number(r.paymentAmount || 0).toLocaleString()}</p>
                                                        //         {expired ? (
                                                        //             <>
                                                        //                 <p className="text-xs text-red-500 font-bold">Payment window expired</p>
                                                        //                 <p className="text-[11px] text-slate-400 mt-1 max-w-[170px]">Contact our team to request a new payment link.</p>
                                                        //             </>
                                                        //         ) : (
                                                        //             <>
                                                        //                 {deadline && (
                                                        //                     <p className="text-[11px] text-amber-600 font-bold mb-1">{formatRemaining(deadline - nowTick)}</p>
                                                        //                 )}
                                                        //                 <p className="text-[11px] text-purple-500 font-bold flex items-center justify-end gap-1">
                                                        //                     <HiCreditCard className="w-3.5 h-3.5" /> Use "Pay Now" above ↑
                                                        //                 </p>
                                                        //             </>
                                                        //         )}
                                                        //     </>
                                                        // );
                                                    })()
                                                ) : r.paymentAmount ? (
                                                    <p className="text-sm font-bold text-emerald-600">PKR {Number(r.paymentAmount).toLocaleString()} — {r.paymentStatus}</p>
                                                ) : (
                                                    <p className="text-xs text-slate-400 font-medium max-w-[160px]">Awaiting quote from our team</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
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

                            {/* DECISION LETTER — approval or rejection document attached by admin */}
                            {viewingVisa.decisionDocURL && (
                                <div className={`mx-8 mt-6 p-5 rounded-xl shadow-sm border-l-4 flex items-center justify-between gap-4 ${
                                    viewingVisa.status === 'Approve'
                                        ? 'bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-500'
                                        : viewingVisa.status === 'Reject'
                                        ? 'bg-gradient-to-r from-red-50 to-rose-50 border-red-500'
                                        : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-500'
                                }`}>
                                    <div>
                                        <h3 className={`font-bold text-lg ${viewingVisa.status === 'Approve' ? 'text-emerald-900' : viewingVisa.status === 'Reject' ? 'text-red-900' : 'text-blue-900'}`}>
                                            {viewingVisa.status === 'Approve' ? '✅ Approved Visa Letter' : viewingVisa.status === 'Reject' ? '❌ Rejection Letter' : '📄 Decision Document'}
                                        </h3>
                                        <p className="text-sm text-slate-600 mt-1">{viewingVisa.decisionDocName || 'Document attached by admin'}</p>
                                    </div>
                                    <a
                                        href={viewingVisa.decisionDocURL}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`shrink-0 px-5 py-2.5 rounded-xl font-bold text-sm text-white shadow-lg transition-all ${
                                            viewingVisa.status === 'Approve' ? 'bg-emerald-600 hover:bg-emerald-700' : viewingVisa.status === 'Reject' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
                                        }`}
                                    >
                                        Download
                                    </a>
                                </div>
                            )}

                            {/* ADMIN MESSAGE ALERT — shown only until dismissed/seen once, then gone for good */}
                            {hasUnseenMessage(viewingVisa) && (
                                <div className="mx-8 mt-6 bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 p-5 rounded-r-xl shadow-sm">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-amber-500 p-2 rounded-lg shrink-0">
                                            <HiChatAlt className="text-xl text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between gap-3">
                                                <h3 className="font-bold text-amber-900 text-lg">Message from Admin</h3>
                                                <button
                                                    onClick={() => markMessageSeen(viewingVisa.id, 'visaApplications', viewingVisa.adminMessageAt || null)}
                                                    className="text-xs font-bold text-amber-700 hover:text-amber-900 underline underline-offset-2 shrink-0"
                                                >
                                                    Dismiss
                                                </button>
                                            </div>
                                            <p className="text-amber-800 mt-2 leading-relaxed">{viewingVisa.adminMessage}</p>
                                            <p className="text-xs text-amber-600/70 mt-3 flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 bg-amber-600/70 rounded-full"></span>
                                                Received: {viewingVisa.adminMessageAt ? (() => { const t = viewingVisa.adminMessageAt; try { return new Date(t?.toDate ? t.toDate() : t).toLocaleString(); } catch { return 'Recently'; } })() : 'Recently'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* MESSAGE THE ADMIN — user can send a message about this application */}
                            <div className="mx-8 mt-6 bg-slate-50 border border-slate-200 p-5 rounded-xl">
                                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                    <HiChatAlt className="text-lg text-blue-600" /> Message Our Team
                                </h3>
                                <p className="text-xs text-slate-500 mt-1">Have a question about this application? Send a message and our team will get back to you.</p>
                                <div className="mt-3 flex items-end gap-2">
                                    <textarea
                                        value={userMsgText}
                                        onChange={(e) => setUserMsgText(e.target.value)}
                                        placeholder="Type your message..."
                                        rows={2}
                                        className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                    />
                                    <button
                                        onClick={() => handleSendUserMessage(viewingVisa)}
                                        disabled={sendingUserMsg || !userMsgText.trim()}
                                        className="shrink-0 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {sendingUserMsg ? 'Sending...' : 'Send'}
                                    </button>
                                </div>
                                {viewingVisa.userMessage && (
                                    <p className="text-xs text-slate-500 mt-3">
                                        Last message sent: <span className="italic">"{viewingVisa.userMessage}"</span>
                                    </p>
                                )}
                            </div>

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
                                                        <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Age</p>
                                                        <p className="text-sm font-medium text-slate-700">{viewingVisa.age || 'N/A'}</p>
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

                        {/* ADMIN MESSAGE ALERT in Edit Modal — disappears once dismissed, never resurfaces for the same message */}
                        {hasUnseenMessage(editingVisa) && (
                            <div className="mx-8 mt-6 bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 p-5 rounded-r-xl shadow-sm">
                                <div className="flex items-start gap-4">
                                    <div className="bg-amber-500 p-2 rounded-lg shrink-0">
                                        <HiChatAlt className="text-xl text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between gap-3">
                                            <h3 className="font-bold text-amber-900 text-lg">Action Required from Admin</h3>
                                            <button
                                                onClick={() => markMessageSeen(editingVisa.id, 'visaApplications', editingVisa.adminMessageAt || null)}
                                                className="text-xs font-bold text-amber-700 hover:text-amber-900 underline underline-offset-2 shrink-0"
                                            >
                                                Dismiss
                                            </button>
                                        </div>
                                        <p className="text-amber-800 mt-2 leading-relaxed">{editingVisa.adminMessage}</p>
                                        <p className="text-xs text-amber-600/70 mt-3">Please update the requested information below</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Scrollable Content — only the document(s) admin flagged for
                            re-upload are shown. No text fields, no locked/verified
                            docs — nothing extra. */}
                        <div className="overflow-y-auto flex-1 p-8">
                            {(() => {
                                const allDocs = [
                                    { key: 'personalPhoto', label: 'Personal Photo' },
                                    { key: 'passport', label: 'Passport' },
                                    { key: 'cnicFront', label: 'CNIC Front' },
                                    { key: 'cnicBack', label: 'CNIC Back' },
                                    { key: 'bankStatement', label: 'Bank Statement' },
                                    { key: 'nicScan', label: 'NIC Scan' },
                                    { key: 'bForm', label: 'B-Form' },
                                    { key: 'frc', label: 'FRC' }
                                ];
                                const editApprovedDocs = editingVisa.editApprovedDocs || {};
                                // Only docs the admin has explicitly flagged for re-upload
                                // (via the "Re-upload" action) show up here.
                                const editableDocs = allDocs.filter(d => !!editApprovedDocs[d.key]);
                                // Admin-named document requests (e.g. "CNIC Front" typed
                                // in by admin) that are still awaiting an upload/re-upload.
                                const customDocs = (editingVisa.documentRequests || []).filter(
                                    d => d.status === 'Requested' || d.status === 'Rejected'
                                );

                                if (editableDocs.length === 0 && customDocs.length === 0) {
                                    return (
                                        <div className="flex flex-col items-center justify-center py-16 text-center">
                                            <HiDocument className="w-10 h-10 text-slate-300 mb-3" />
                                            <p className="text-slate-500 font-medium">No documents are open for re-upload right now.</p>
                                            <p className="text-slate-400 text-sm mt-1">Your admin will flag a document if one needs to be re-uploaded.</p>
                                        </div>
                                    );
                                }

                                return (
                                    <div className="max-w-xl mx-auto space-y-4">
                                        {editableDocs.map(docItem => {
                                            const hasDocument = editingVisa.documentURLs?.[docItem.key];
                                            return (
                                                <div key={docItem.key} className="rounded-lg border p-4 bg-white border-slate-200">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">{docItem.label}</label>
                                                        <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                                                            ⚠ Re-upload Requested
                                                        </span>
                                                    </div>
                                                    <input
                                                        type="file"
                                                        onChange={(e) => handleFileSelect(docItem.key, e)}
                                                        className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-500 file:text-white hover:file:bg-emerald-600 file:cursor-pointer file:transition-colors"
                                                        accept="image/*,.pdf"
                                                    />
                                                    {fileInputs[docItem.key] ? (
                                                        <p className="text-xs text-emerald-600 mt-2 font-medium flex items-center gap-1">
                                                            <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></span>
                                                            New file selected: {fileInputs[docItem.key].name}
                                                        </p>
                                                    ) : hasDocument ? (
                                                        <p className="text-xs text-amber-600 mt-2 font-medium">
                                                            ⚠ Current file is not valid/clear - please re-upload
                                                        </p>
                                                    ) : null}
                                                </div>
                                            );
                                        })}
                                        {customDocs.map(docItem => (
                                            <div key={docItem.id} className="rounded-lg border p-4 bg-white border-slate-200">
                                                <div className="flex items-center justify-between mb-2">
                                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">{docItem.name}</label>
                                                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${docItem.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                                        {docItem.status === 'Rejected' ? '✕ Rejected — Re-upload' : '⚠ Upload Requested'}
                                                    </span>
                                                </div>
                                                <input
                                                    type="file"
                                                    onChange={(e) => handleCustomDocFileSelect(docItem.id, e)}
                                                    className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-500 file:text-white hover:file:bg-emerald-600 file:cursor-pointer file:transition-colors"
                                                    accept="image/*,.pdf"
                                                />
                                                {fileInputs[`custom_${docItem.id}`] ? (
                                                    <p className="text-xs text-emerald-600 mt-2 font-medium flex items-center gap-1">
                                                        <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></span>
                                                        New file selected: {fileInputs[`custom_${docItem.id}`].name}
                                                    </p>
                                                ) : docItem.status === 'Rejected' && docItem.note ? (
                                                    <p className="text-xs text-red-600 mt-2 font-medium">
                                                        Reason: {docItem.note}
                                                    </p>
                                                ) : null}
                                            </div>
                                        ))}
                                    </div>
                                );
                            })()}
                        </div>

                        {/* Footer Actions */}
                        <div className="border-t border-slate-200 px-8 py-5 bg-slate-50 flex items-center justify-between">
                            <p className="text-sm text-slate-500">
                                <span className="font-medium text-emerald-600">Tip:</span> Only documents flagged for re-upload above can be updated
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

            {invoiceRecord && (
                <InvoiceModal
                    record={invoiceRecord.record}
                    recordType={invoiceRecord.recordType}
                    onClose={() => setInvoiceRecord(null)}
                />
            )}

            <ToastContainer />
        </div >
    );
};

export default UserDashboard;