import React, { useState, useEffect } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { MdClose, MdZoomIn, MdZoomOut, MdRefresh, MdDownload, MdCheckCircle, MdErrorOutline, MdDelete, MdWarning } from 'react-icons/md';
import { FaPassport } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { ref, listAll, getDownloadURL, deleteObject } from "firebase/storage";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { storage, db } from "../firbase";
import { notify } from "./Toast";
import { sendAdminMessageEmail, sendDocumentVerifiedEmail } from "../Utils/emailService";

const DocumentViewer = ({ visa, onClose, onVerifyDocument }) => {
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [verifiedDocs, setVerifiedDocs] = useState(visa.documentVerification || {});
    const [dynamicDocs, setDynamicDocs] = useState({});
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(null);
    const [requesting, setRequesting] = useState(null);

    // Modal states
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, docKey: '', docLabel: '' });
    const [reuploadModal, setReuploadModal] = useState({ isOpen: false, docKey: '', docLabel: '', message: '' });
    
    // Refresh trigger for document list
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => {
        const fetchStorageDocs = async () => {
            if (!visa?.userId || !visa?.applicationNumber) {
                setLoading(false);
                return;
            }

            try {
                const folderPath = `visa-documents/${visa.userId}/${visa.applicationNumber}`;
                const folderRef = ref(storage, folderPath);
                const res = await listAll(folderRef);

                const urls = {};
                await Promise.all(res.items.map(async (item) => {
                    const url = await getDownloadURL(item);
                    // Map storage filenames to keys
                    if (item.name.includes('passport')) urls.passport = url;
                    if (item.name.includes('personalPhoto') || item.name.includes('photo')) urls.personalPhoto = url;
                    if (item.name.includes('cnicFront') || item.name.includes('cnic_front')) urls.cnicFront = url;
                    if (item.name.includes('cnicBack') || item.name.includes('cnic_back')) urls.cnicBack = url;
                    if (item.name.includes('bankStatement') || item.name.includes('bank_statement')) urls.bankStatement = url;
                    if (item.name.includes('nicScan') || item.name.includes('nic_scan')) urls.nicScan = url;
                    if (item.name.includes('bForm')) urls.bForm = url;
                    if (item.name.includes('frc')) urls.frc = url;
                }));

                setDynamicDocs(urls);
            } catch (error) {
                console.error("Error fetching from storage:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStorageDocs();
    }, [visa]);

    const activeURLs = Object.keys(dynamicDocs).length > 0 ? dynamicDocs : visa.documentURLs;

    const docCategories = [
        { key: 'personalPhoto', label: 'Personal Photo', icon: '📸' },
        { key: 'passport', label: 'Passport', icon: '🛂' },
        { key: 'cnicFront', label: 'CNIC Front', icon: '🪪' },
        { key: 'cnicBack', label: 'CNIC Back', icon: '🪪' },
        { key: 'bankStatement', label: 'Bank Statement', icon: '🏦' },
        { key: 'nicScan', label: 'NIC Scan', icon: '📇' },
        { key: 'bForm', label: 'B-Form', icon: '📄' },
        { key: 'frc', label: 'FRC', icon: '📋' },
    ].filter(doc => activeURLs[doc.key]);

    const verifiedCount = docCategories.filter(d => verifiedDocs[d.key]).length;

    const handleVerifyDocument = (docKey) => {
        const isNowVerified = !verifiedDocs[docKey];
        const newVerifiedDocs = {
            ...verifiedDocs,
            [docKey]: isNowVerified
        };
        setVerifiedDocs(newVerifiedDocs);
        if (onVerifyDocument) onVerifyDocument(visa.id, newVerifiedDocs);

        // Only send email when marking as verified (not when un-verifying)
        if (isNowVerified && visa.email) {
            const docItem = docCategories.find(d => d.key === docKey);
            const allVerified = docCategories.every(d => d.key === docKey ? true : newVerifiedDocs[d.key]);
            sendDocumentVerifiedEmail({
                to: visa.email,
                applicantName: visa.applicantName,
                applicationNumber: visa.applicationNumber,
                country: visa.country,
                docLabel: docItem?.label || docKey,
                allVerified,
            });
        }
    };

    const handleDeleteDocument = async (docKey) => {
        // Find the doc label
        const docItem = docCategories.find(d => d.key === docKey);
        const docLabel = docItem?.label || docKey;
        setDeleteModal({ isOpen: true, docKey, docLabel });
    };

    const confirmDelete = async () => {
        const { docKey } = deleteModal;
        setDeleteModal({ isOpen: false, docKey: '', docLabel: '' });
        setDeleting(docKey);

        try {
            // Check if URL is from imgbb (don't try to delete from Firebase)
            const docUrl = activeURLs[docKey];
            const isImgbb = docUrl && docUrl.includes('ibb.co');

            // Only attempt Firebase deletion if URL is not from imgbb and userId exists
            if (!isImgbb && visa.userId) {
                try {
                    const folderPath = `visa-documents/${visa.userId}/${visa.applicationNumber}`;
                    const folderRef = ref(storage, folderPath);
                    const res = await listAll(folderRef);

                    const fileToDelete = res.items.find(item => item.name.includes(docKey));
                    if (fileToDelete) {
                        await deleteObject(fileToDelete);
                    }
                } catch (storageError) {
                    console.warn("Storage deletion warning:", storageError);
                    // Continue with Firestore deletion even if storage deletion fails
                }
            }

            // Remove URL from Firestore and local state
            const updatedURLs = { ...activeURLs };
            delete updatedURLs[docKey];

            const updatedVerification = { ...verifiedDocs };
            delete updatedVerification[docKey];

            await updateDoc(doc(db, "visaApplications", visa.id), {
                documentURLs: updatedURLs,
                documentVerification: updatedVerification,
                updatedAt: serverTimestamp()
            });

            // Update local state and clear selected document
            setDynamicDocs(updatedURLs);
            setVerifiedDocs(updatedVerification);
            setSelectedDoc(null);
            
            // Trigger refresh of document list
            setRefreshTrigger(prev => prev + 1);

            setTimeout(() => {
                notify.success('Document deleted successfully');
            }, 300);
        } catch (error) {
            console.error("Delete error:", error);
            notify.error('Failed to delete document: ' + error.message);
        } finally {
            setDeleting(null);
        }
    };

    const handleRequestReupload = (docKey, docLabel) => {
        setReuploadModal({ 
            isOpen: true, 
            docKey, 
            docLabel, 
            message: `Please re-upload your ${docLabel}. The current document is not clear/valid.` 
        });
    };

    const confirmReupload = async () => {
        const { docKey, docLabel, message } = reuploadModal;

        if (!message.trim()) {
            notify.error('Please enter a message');
            return;
        }

        setReuploadModal({ isOpen: false, docKey: '', docLabel: '', message: '' });
        setRequesting(docKey);

        try {
            const updatedVerification = {
                ...verifiedDocs,
                [docKey]: false
            };

            await updateDoc(doc(db, "visaApplications", visa.id), {
                documentVerification: updatedVerification,
                adminMessage: message,
                adminMessageAt: serverTimestamp(),
                editApproved: true,
                updatedAt: serverTimestamp()
            });

            sendAdminMessageEmail({
                to: visa.email,
                applicantName: visa.applicantName,
                applicationNumber: visa.applicationNumber,
                country: visa.country,
                message,
            });

            setVerifiedDocs(updatedVerification);
            setRefreshTrigger(prev => prev + 1);

            setTimeout(() => {
                notify.success(visa.email ? 'Re-upload request sent & emailed to client' : 'Re-upload request sent to user dashboard');
            }, 300);
        } catch (error) {
            console.error("Request error:", error);
            notify.error('Failed to send request: ' + error.message);
        } finally {
            setRequesting(null);
        }
    };

    const isPDF = (url) => url?.toLowerCase().includes('.pdf') || url?.includes('octet-stream');

    const formatDate = (date) => {
        if (!date) return 'N/A';
        if (date.toDate) return date.toDate().toLocaleDateString();
        return new Date(date).toLocaleDateString();
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-3 backdrop-blur-md" onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.96 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="bg-white rounded-2xl shadow-[0_32px_64px_rgba(0,0,0,0.15)] w-full max-w-[1500px] h-[96vh] overflow-hidden flex flex-col border border-slate-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-slate-50 via-slate-100 to-slate-50 px-8 py-5 flex justify-between items-center shrink-0 border-b border-slate-300">
                    <div className="flex items-center gap-5">
                        <motion.div
                            initial={{ scale: 0.6, rotate: -8, opacity: 0 }}
                            animate={{ scale: 1, rotate: 0, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 300, damping: 18 }}
                            className="bg-gradient-to-br from-amber-500 to-orange-600 p-3.5 rounded-xl shadow-lg shadow-amber-500/20"
                        >
                            <FaPassport className="text-2xl text-white" />
                        </motion.div>
                        <div>
                            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                Document Review
                            </h2>
                            <div className="flex items-center gap-3 mt-1.5">
                                <span className="text-amber-600 text-sm font-semibold tracking-wide">{visa.applicationNumber}</span>
                                <span className="w-1 h-1 rounded-full bg-slate-400"></span>
                                <span className="text-slate-600 text-sm font-medium">{visa.applicantName}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        {/* Verification Progress */}
                        {docCategories.length > 0 && (
                            <div className="hidden md:flex items-center gap-3 bg-slate-100 border border-slate-300 rounded-xl px-5 py-2.5">
                                <div className="flex items-center gap-1.5">
                                    {docCategories.map((d, i) => (
                                        <div key={i} className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${verifiedDocs[d.key] ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-slate-300'}`} />
                                    ))}
                                </div>
                                <span className="text-sm font-semibold text-slate-700">
                                    {verifiedCount}/{docCategories.length}
                                </span>
                            </div>
                        )}
                        <motion.button
                            whileHover={{ scale: 1.05, backgroundColor: 'rgba(0,0,0,0.05)' }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onClose}
                            className="p-2.5 rounded-xl border border-slate-300 text-slate-600 hover:text-slate-900 transition-colors"
                        >
                            <MdClose className="text-xl" />
                        </motion.button>
                    </div>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar */}
                    <div className="w-[320px] bg-slate-50 border-r border-slate-200 overflow-y-auto flex flex-col"
                        style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 #f1f5f9' }}
                    >
                        <div className="p-5 flex-1">
                            {/* Application Details Button */}
                            <motion.button
                                onClick={() => setSelectedDoc(null)}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                className={`w-full text-left px-5 py-4 rounded-xl mb-5 transition-all duration-200 ${
                                    !selectedDoc
                                        ? 'bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-300 shadow-lg shadow-amber-200'
                                        : 'bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">📋</span>
                                    <span className={`text-[15px] font-bold tracking-wide ${!selectedDoc ? 'text-amber-700' : 'text-slate-600'}`}>
                                        Application Details
                                    </span>
                                </div>
                            </motion.button>

                            <div className="flex items-center gap-2 mb-4 px-1">
                                <div className="w-6 h-[2px] bg-gradient-to-r from-amber-500 to-transparent rounded-full"></div>
                                <p className="text-xs font-bold text-slate-600 uppercase tracking-[0.2em]">Documents</p>
                            </div>

                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-12 gap-3">
                                    <div className="w-8 h-8 border-2 border-amber-300 border-t-amber-500 rounded-full animate-spin"></div>
                                    <p className="text-sm text-slate-600 font-medium">Loading documents...</p>
                                </div>
                            ) : docCategories.length === 0 ? (
                                <div className="p-5 bg-red-100 border border-red-300 text-red-700 rounded-xl flex items-center gap-3 text-sm font-semibold">
                                    <MdErrorOutline className="text-xl flex-shrink-0" /> No documents found
                                </div>
                            ) : (
                                <motion.div
                                    className="space-y-2"
                                    initial="hidden"
                                    animate="show"
                                    variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
                                >
                                    {docCategories.map((docItem) => {
                                        const isSelected = selectedDoc?.key === docItem.key;
                                        const isVerified = verifiedDocs[docItem.key];

                                        return (
                                            <motion.div
                                                key={docItem.key}
                                                variants={{ hidden: { opacity: 0, x: -12 }, show: { opacity: 1, x: 0 } }}
                                                className={`rounded-xl transition-all duration-200 overflow-hidden ${
                                                    isSelected
                                                        ? 'bg-amber-50 border border-amber-300 shadow-lg shadow-amber-200'
                                                        : 'bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                                                }`}
                                            >
                                                <div
                                                    onClick={() => setSelectedDoc(docItem)}
                                                    className="px-4 py-3.5 cursor-pointer"
                                                >
                                                    <div className="flex justify-between items-center">
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-lg">{docItem.icon}</span>
                                                            <span className={`text-[15px] font-semibold ${isSelected ? 'text-amber-900' : 'text-slate-700'}`}>
                                                                {docItem.label}
                                                            </span>
                                                        </div>
                                                        {isVerified ? (
                                                            <div className="flex items-center gap-1.5 bg-emerald-100 px-2.5 py-1 rounded-full">
                                                                <MdCheckCircle className="text-emerald-600 text-sm" />
                                                                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Verified</span>
                                                            </div>
                                                        ) : (
                                                            <div className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-amber-300"></div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="px-4 pb-3 flex gap-1.5">
                                                    <motion.button
                                                        whileHover={{ scale: 1.03 }}
                                                        whileTap={{ scale: 0.97 }}
                                                        onClick={(e) => { e.stopPropagation(); handleVerifyDocument(docItem.key); }}
                                                        className={`flex-1 text-xs font-bold py-2 rounded-lg transition-all duration-200 ${
                                                            isVerified
                                                                ? 'bg-emerald-100 text-emerald-700 border border-emerald-300 hover:bg-emerald-200'
                                                                : 'bg-slate-100 text-slate-600 border border-slate-300 hover:bg-slate-200 hover:text-slate-900'
                                                        }`}
                                                    >
                                                        {isVerified ? '✓ Verified' : 'Verify'}
                                                    </motion.button>

                                                    <motion.button
                                                        whileHover={{ scale: 1.03 }}
                                                        whileTap={{ scale: 0.97 }}
                                                        onClick={(e) => { e.stopPropagation(); handleRequestReupload(docItem.key, docItem.label); }}
                                                        disabled={requesting === docItem.key}
                                                        className="flex-1 text-xs font-bold py-2 rounded-lg bg-amber-100 text-amber-700 border border-amber-300 hover:bg-amber-200 transition-all duration-200 disabled:opacity-40"
                                                    >
                                                        {requesting === docItem.key ? '...' : 'Re-upload'}
                                                    </motion.button>

                                                    <motion.button
                                                        whileHover={{ scale: 1.03 }}
                                                        whileTap={{ scale: 0.97 }}
                                                        onClick={(e) => { e.stopPropagation(); handleDeleteDocument(docItem.key); }}
                                                        disabled={deleting === docItem.key}
                                                        className="px-2.5 text-xs font-bold py-2 rounded-lg bg-red-100 text-red-700 border border-red-300 hover:bg-red-200 transition-all duration-200 disabled:opacity-40"
                                                    >
                                                        {deleting === docItem.key ? '...' : <MdDelete className="text-sm" />}
                                                    </motion.button>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </motion.div>
                            )}
                        </div>
                    </div>

                    {/* Viewer Area */}
                    <div className="flex-1 bg-white flex flex-col relative overflow-hidden">
                        {selectedDoc ? (
                            <div className="h-full flex flex-col">
                                {/* Document Toolbar */}
                                <div className="px-8 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{selectedDoc.icon}</span>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900 tracking-wide" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                                {selectedDoc.label}
                                            </h3>
                                            <p className="text-xs text-slate-600 font-medium mt-0.5">Pinch or scroll to zoom • Click and drag to pan</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {verifiedDocs[selectedDoc.key] && (
                                            <div className="flex items-center gap-2 bg-emerald-100 border border-emerald-300 px-4 py-2 rounded-lg">
                                                <MdCheckCircle className="text-emerald-600" />
                                                <span className="text-sm font-bold text-emerald-700">Verified</span>
                                            </div>
                                        )}
                                        <a
                                            href={activeURLs[selectedDoc.key]}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 hover:from-amber-400 hover:to-orange-400 transition-all duration-200"
                                        >
                                            <MdDownload className="text-lg" /> Download
                                        </a>
                                    </div>
                                </div>

                                {/* Document Viewer */}
                                <div className="flex-1 p-6 flex items-center justify-center overflow-hidden bg-slate-100">
                                    <div className="w-full h-full rounded-xl overflow-hidden border border-slate-300 bg-white shadow-inner">
                                        {isPDF(activeURLs[selectedDoc.key]) ? (
                                            <iframe
                                                src={activeURLs[selectedDoc.key]}
                                                className="w-full h-full bg-white"
                                                title="pdf-viewer"
                                            />
                                        ) : (
                                            <TransformWrapper
                                                initialScale={1}
                                                minScale={0.5}
                                                maxScale={5}
                                            >
                                                {({ zoomIn, zoomOut, resetTransform }) => (
                                                    <>
                                                        {/* Floating Zoom Controls */}
                                                        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 bg-white/90 backdrop-blur-xl border border-slate-300 rounded-xl px-2 py-1.5 shadow-2xl">
                                                            <button onClick={() => zoomOut()} className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors">
                                                                <MdZoomOut className="text-xl" />
                                                            </button>
                                                            <div className="w-px h-6 bg-slate-300"></div>
                                                            <button onClick={() => resetTransform()} className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors">
                                                                <MdRefresh className="text-xl" />
                                                            </button>
                                                            <div className="w-px h-6 bg-slate-300"></div>
                                                            <button onClick={() => zoomIn()} className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors">
                                                                <MdZoomIn className="text-xl" />
                                                            </button>
                                                        </div>
                                                        <TransformComponent
                                                            wrapperStyle={{ width: '100%', height: '100%' }}
                                                            contentStyle={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                        >
                                                            <img
                                                                src={activeURLs[selectedDoc.key]}
                                                                alt="document"
                                                                className="max-w-full max-h-full object-contain rounded-lg"
                                                                style={{ filter: 'drop-shadow(0 4px 24px rgba(0,0,0,0.4))' }}
                                                            />
                                                        </TransformComponent>
                                                    </>
                                                )}
                                            </TransformWrapper>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* Application Details View */
                            <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 #f1f5f9' }}>
                                <div className="p-10">
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mb-10"
                                    >
                                        <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                            Application Review
                                        </h3>
                                        <div className="w-16 h-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full mt-3"></div>
                                    </motion.div>

                                    <motion.div
                                        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                                        initial="hidden"
                                        animate="show"
                                        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } }}
                                    >
                                        {/* Personal Information */}
                                        <motion.div
                                            variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                                            whileHover={{ y: -4, transition: { duration: 0.2 } }}
                                            className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-7 border border-violet-200 backdrop-blur-sm hover:border-violet-300 transition-all duration-300 shadow-sm"
                                        >
                                            <div className="flex items-center gap-3 mb-7">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-200 to-purple-200 border border-violet-300 flex items-center justify-center">
                                                    <span className="text-lg">👤</span>
                                                </div>
                                                <h4 className="text-sm font-bold text-violet-700 uppercase tracking-[0.15em]" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                                    Personal Info
                                                </h4>
                                            </div>
                                            <div className="space-y-5">
                                                <div>
                                                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Full Name</label>
                                                    <p className="text-xl font-bold text-slate-900 mt-1.5" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                                        {visa.applicantName || 'N/A'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Email</label>
                                                    <p className="text-base font-medium text-blue-600 mt-1.5 break-all">{visa.email || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Phone</label>
                                                    <p className="text-base font-medium text-slate-700 mt-1.5">{visa.phone || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">CNIC</label>
                                                    <p className="text-base font-mono font-bold text-slate-700 mt-1.5 bg-slate-100 inline-block px-3 py-1 rounded-lg">{visa.cnic || 'N/A'}</p>
                                                </div>
                                                <div className="flex gap-6">
                                                    <div>
                                                        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Age</label>
                                                        <p className="text-base font-medium text-slate-700 mt-1.5">{visa.age || 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Passport #</label>
                                                        <p className="text-base font-mono font-bold text-slate-700 mt-1.5">{visa.passportNumber || 'N/A'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>

                                        {/* Travel Details */}
                                        <motion.div
                                            variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                                            whileHover={{ y: -4, transition: { duration: 0.2 } }}
                                            className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-7 border border-blue-200 backdrop-blur-sm hover:border-blue-300 transition-all duration-300 shadow-sm"
                                        >
                                            <div className="flex items-center gap-3 mb-7">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-200 to-cyan-200 border border-blue-300 flex items-center justify-center">
                                                    <span className="text-lg">✈️</span>
                                                </div>
                                                <h4 className="text-sm font-bold text-blue-700 uppercase tracking-[0.15em]" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                                    Travel Details
                                                </h4>
                                            </div>
                                            <div className="space-y-5">
                                                <div>
                                                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Destination</label>
                                                    <p className="text-2xl font-extrabold text-slate-900 mt-1.5" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                                        {visa.country || 'N/A'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Visa Type</label>
                                                    <p className="text-base font-bold text-blue-600 mt-1.5">{visa.visaType || 'N/A'}</p>
                                                </div>
                                                <div className="flex gap-6">
                                                    <div className="flex-1">
                                                        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Processing</label>
                                                        <p className="text-base font-medium text-slate-700 mt-1.5">{visa.processingTime || 'N/A'}</p>
                                                    </div>
                                                    <div className="flex-1">
                                                        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Validity</label>
                                                        <p className="text-base font-medium text-slate-700 mt-1.5">{visa.validity || 'N/A'}</p>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Stay Duration</label>
                                                    <p className="text-base font-medium text-slate-700 mt-1.5">{visa.stayDuration || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Urgent Processing</label>
                                                    <p className="mt-1.5">
                                                        {visa.urgentProcessing ? (
                                                            <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-700 border border-amber-300 px-3 py-1 rounded-full text-sm font-bold">
                                                                ⚡ YES
                                                            </span>
                                                        ) : (
                                                            <span className="text-base font-medium text-slate-600">NO</span>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>

                                        {/* Payment & Status */}
                                        <motion.div
                                            variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                                            whileHover={{ y: -4, transition: { duration: 0.2 } }}
                                            className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-7 border border-emerald-200 backdrop-blur-sm hover:border-emerald-300 transition-all duration-300 shadow-sm"
                                        >
                                            <div className="flex items-center gap-3 mb-7">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-200 to-teal-200 border border-emerald-300 flex items-center justify-center">
                                                    <span className="text-lg">💰</span>
                                                </div>
                                                <h4 className="text-sm font-bold text-emerald-700 uppercase tracking-[0.15em]" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                                    Payment & Status
                                                </h4>
                                            </div>
                                            <div className="space-y-5">
                                                <div>
                                                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Total Fee</label>
                                                    <p className="text-3xl font-extrabold text-emerald-600 mt-1.5" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                                        PKR {visa.totalFee?.toLocaleString() || '0'}
                                                    </p>
                                                </div>
                                                <div className="flex gap-6">
                                                    <div className="flex-1">
                                                        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Visa Fee</label>
                                                        <p className="text-base font-medium text-slate-700 mt-1.5">PKR {visa.visaFee?.toLocaleString() || '0'}</p>
                                                    </div>
                                                    {visa.urgentFee && (
                                                        <div className="flex-1">
                                                            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Urgent Fee</label>
                                                            <p className="text-base font-medium text-amber-600 mt-1.5">PKR {visa.urgentFee?.toLocaleString() || '0'}</p>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="pt-2 border-t border-emerald-300">
                                                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Application Status</label>
                                                    <p className="mt-2">
                                                        <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold ${
                                                            visa.status === 'approved' ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' :
                                                            visa.status === 'rejected' ? 'bg-red-100 text-red-700 border border-red-300' :
                                                            'bg-amber-100 text-amber-700 border border-amber-300'
                                                        }`}>
                                                            {visa.status || 'Pending'}
                                                        </span>
                                                    </p>
                                                </div>
                                                <div>
                                                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Payment Status</label>
                                                    <p className="text-base font-medium text-emerald-600 mt-1.5">{visa.paymentStatus || 'Completed'}</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </motion.div>

                                    {/* Application Metadata */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 }}
                                        className="mt-8 bg-slate-50 rounded-2xl p-7 border border-slate-200 shadow-sm"
                                    >
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center">
                                                <span className="text-sm">🗂️</span>
                                            </div>
                                            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-[0.15em]" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                                Application Metadata
                                            </h4>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                            <div>
                                                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Application Date</label>
                                                <p className="text-base font-medium text-slate-700 mt-1.5">{formatDate(visa.applicationDate)}</p>
                                            </div>
                                            <div>
                                                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">User ID</label>
                                                <p className="text-sm font-mono text-slate-600 mt-1.5 bg-slate-100 inline-block px-2 py-0.5 rounded">{visa.userId || visa.uid || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">User Email</label>
                                                <p className="text-sm text-slate-600 mt-1.5 break-all">{visa.userEmail || visa.email || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Category</label>
                                                <p className="text-base font-medium text-slate-700 mt-1.5">{visa.category || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </motion.div>

                                    {/* Admin Message Display */}
                                    {visa.adminMessage && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 12 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.5 }}
                                            className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-6 flex gap-4 shadow-sm"
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                                                <MdWarning className="text-xl text-amber-600" />
                                            </div>
                                            <div>
                                                <h4 className="text-base font-bold text-amber-700 mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                                    Admin Message to User
                                                </h4>
                                                <p className="text-[15px] text-amber-900 leading-relaxed">{visa.adminMessage}</p>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteModal.isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4 backdrop-blur-sm"
                        onClick={() => setDeleteModal({ isOpen: false, docKey: '', docLabel: '' })}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-8">
                                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-5 bg-red-100 rounded-full">
                                    <MdDelete className="text-2xl text-red-600" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 text-center mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                    Delete Document
                                </h3>
                                <p className="text-slate-600 text-center mb-8">
                                    Are you sure you want to permanently delete <span className="font-semibold text-slate-900">{deleteModal.docLabel}</span>? This action cannot be undone.
                                </p>
                                <div className="flex gap-3">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setDeleteModal({ isOpen: false, docKey: '', docLabel: '' })}
                                        className="flex-1 px-4 py-3 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
                                    >
                                        Cancel
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={confirmDelete}
                                        disabled={deleting}
                                        className="flex-1 px-4 py-3 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {deleting ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                Deleting...
                                            </>
                                        ) : (
                                            'Delete'
                                        )}
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Re-upload Message Modal */}
            <AnimatePresence>
                {reuploadModal.isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4 backdrop-blur-sm"
                        onClick={() => setReuploadModal({ isOpen: false, docKey: '', docLabel: '', message: '' })}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-8">
                                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-5 bg-amber-100 rounded-full">
                                    <MdWarning className="text-2xl text-amber-600" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 text-center mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                    Request Re-upload
                                </h3>
                                <p className="text-slate-600 text-center mb-5 text-sm">
                                    Send a message to the user about why <span className="font-semibold text-slate-900">{reuploadModal.docLabel}</span> needs to be re-uploaded.
                                </p>
                                <textarea
                                    value={reuploadModal.message}
                                    onChange={(e) => setReuploadModal({ ...reuploadModal, message: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                                    rows="4"
                                    placeholder="Enter message to user..."
                                />
                                <div className="flex gap-3 mt-6">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setReuploadModal({ isOpen: false, docKey: '', docLabel: '', message: '' })}
                                        className="flex-1 px-4 py-3 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
                                    >
                                        Cancel
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={confirmReupload}
                                        disabled={requesting}
                                        className="flex-1 px-4 py-3 rounded-lg bg-amber-500 text-white font-semibold hover:bg-amber-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {requesting ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                Sending...
                                            </>
                                        ) : (
                                            'Send Request'
                                        )}
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DocumentViewer;