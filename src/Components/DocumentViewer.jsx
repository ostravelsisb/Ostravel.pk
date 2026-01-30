import React, { useState, useEffect } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { MdClose, MdZoomIn, MdZoomOut, MdRefresh, MdDownload, MdCheckCircle, MdErrorOutline, MdDelete, MdWarning } from 'react-icons/md';
import { FaPassport } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { ref, listAll, getDownloadURL, deleteObject } from "firebase/storage";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { storage, db } from "../firbase";

const DocumentViewer = ({ visa, onClose, onVerifyDocument }) => {
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [verifiedDocs, setVerifiedDocs] = useState(visa.documentVerification || {});
    const [dynamicDocs, setDynamicDocs] = useState({});
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(null);
    const [requesting, setRequesting] = useState(null);

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

    const activeURLs = visa.documentURLs || dynamicDocs;

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

    const handleVerifyDocument = (docKey) => {
        const newVerifiedDocs = {
            ...verifiedDocs,
            [docKey]: !verifiedDocs[docKey]
        };
        setVerifiedDocs(newVerifiedDocs);
        if (onVerifyDocument) onVerifyDocument(visa.id, newVerifiedDocs);
    };

    const handleDeleteDocument = async (docKey) => {
        if (!window.confirm(`Are you sure you want to delete ${docKey}? This action cannot be undone.`)) return;

        setDeleting(docKey);
        try {
            // Delete from storage
            const folderPath = `visa-documents/${visa.userId}/${visa.applicationNumber}`;
            const folderRef = ref(storage, folderPath);
            const res = await listAll(folderRef);

            // Find and delete the file
            const fileToDelete = res.items.find(item => item.name.includes(docKey));
            if (fileToDelete) {
                await deleteObject(fileToDelete);
            }

            // Update Firestore - remove URL
            const updatedURLs = { ...activeURLs };
            delete updatedURLs[docKey];

            const updatedVerification = { ...verifiedDocs };
            delete updatedVerification[docKey];

            await updateDoc(doc(db, "visaApplications", visa.id), {
                documentURLs: updatedURLs,
                documentVerification: updatedVerification,
                updatedAt: serverTimestamp()
            });

            // Update local state
            setDynamicDocs(updatedURLs);
            setVerifiedDocs(updatedVerification);
            setSelectedDoc(null);

            alert('Document deleted successfully');
        } catch (error) {
            console.error("Delete error:", error);
            alert('Failed to delete document: ' + error.message);
        } finally {
            setDeleting(null);
        }
    };

    const handleRequestReupload = async (docKey, docLabel) => {
        const message = prompt(`Enter message to user about why ${docLabel} needs to be re-uploaded:`, `Please re-upload your ${docLabel}. The current document is not clear/valid.`);
        if (!message) return;

        setRequesting(docKey);
        try {
            // Unverify the document
            const updatedVerification = {
                ...verifiedDocs,
                [docKey]: false
            };

            // Update Firestore
            await updateDoc(doc(db, "visaApplications", visa.id), {
                documentVerification: updatedVerification,
                adminMessage: message,
                adminMessageAt: serverTimestamp(),
                editApproved: true, // Enable editing so user can re-upload
                updatedAt: serverTimestamp()
            });

            setVerifiedDocs(updatedVerification);
            alert('Re-upload request sent to user dashboard');
        } catch (error) {
            console.error("Request error:", error);
            alert('Failed to send request: ' + error.message);
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
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-7xl h-[95vh] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="bg-emerald-500 p-3 rounded-xl shadow-lg"><FaPassport className="text-2xl" /></div>
                        <div>
                            <h2 className="text-2xl font-black tracking-tight">Admin Document Review</h2>
                            <p className="text-slate-300 text-sm font-mono mt-1">{visa.applicationNumber} • {visa.applicantName}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-full transition"><MdClose className="text-2xl" /></button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar */}
                    <div className="w-80 bg-slate-50 border-r border-slate-200 overflow-y-auto">
                        <div className="p-4">
                            <button
                                onClick={() => setSelectedDoc(null)}
                                className={`w-full text-left p-4 rounded-xl border-2 mb-4 transition-all ${!selectedDoc ? 'border-emerald-600 bg-white shadow-md' : 'border-transparent bg-slate-100 hover:bg-slate-200'}`}
                            >
                                <p className="font-black text-slate-800 text-sm">📋 Application Details</p>
                            </button>

                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-2">Uploaded Documents</p>

                            {loading ? (
                                <div className="p-4 text-center animate-pulse text-slate-400 text-xs">Loading documents...</div>
                            ) : docCategories.length === 0 ? (
                                <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 text-xs font-bold">
                                    <MdErrorOutline /> No documents found
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {docCategories.map((doc) => (
                                        <div
                                            key={doc.key}
                                            className={`rounded-xl border-2 transition-all ${selectedDoc?.key === doc.key ? 'border-emerald-500 bg-white shadow-md' : 'border-transparent hover:bg-slate-200'}`}
                                        >
                                            <div
                                                onClick={() => setSelectedDoc(doc)}
                                                className="p-3 cursor-pointer"
                                            >
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-sm font-bold text-slate-700">{doc.icon} {doc.label}</span>
                                                    {verifiedDocs[doc.key] && <MdCheckCircle className="text-emerald-500 text-lg" />}
                                                </div>
                                            </div>

                                            <div className="px-3 pb-3 space-y-1">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleVerifyDocument(doc.key); }}
                                                    className={`w-full text-[10px] font-black py-1.5 rounded-lg transition-all ${verifiedDocs[doc.key] ? 'bg-emerald-500 text-white shadow-sm' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
                                                >
                                                    {verifiedDocs[doc.key] ? '✓ VERIFIED' : 'MARK AS VERIFIED'}
                                                </button>

                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleRequestReupload(doc.key, doc.label); }}
                                                    disabled={requesting === doc.key}
                                                    className="w-full text-[10px] font-black py-1.5 rounded-lg bg-amber-100 text-amber-700 hover:bg-amber-200 transition-all disabled:opacity-50"
                                                >
                                                    {requesting === doc.key ? 'SENDING...' : '⚠ REQUEST RE-UPLOAD'}
                                                </button>

                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteDocument(doc.key); }}
                                                    disabled={deleting === doc.key}
                                                    className="w-full text-[10px] font-black py-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-all disabled:opacity-50"
                                                >
                                                    {deleting === doc.key ? 'DELETING...' : '🗑 DELETE DOCUMENT'}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Viewer Area */}
                    <div className="flex-1 bg-slate-100 flex flex-col relative overflow-hidden">
                        {selectedDoc ? (
                            <div className="h-full flex flex-col">
                                <div className="p-4 bg-white border-b border-slate-200 flex justify-between items-center">
                                    <span className="font-black text-slate-800 uppercase text-sm tracking-widest">{selectedDoc.icon} {selectedDoc.label}</span>
                                    <a href={activeURLs[selectedDoc.key]} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-lg hover:bg-slate-800 transition">
                                        <MdDownload /> Download Original
                                    </a>
                                </div>
                                <div className="flex-1 p-4 flex items-center justify-center overflow-hidden bg-slate-200">
                                    {isPDF(activeURLs[selectedDoc.key]) ? (
                                        <iframe src={activeURLs[selectedDoc.key]} className="w-full h-full rounded-xl shadow-2xl bg-white" title="pdf-viewer" />
                                    ) : (
                                        <TransformWrapper>
                                            <TransformComponent wrapperClass="w-full h-full" contentClass="w-full h-full flex items-center justify-center">
                                                <img src={activeURLs[selectedDoc.key]} alt="document" className="max-w-full max-h-full object-contain shadow-2xl rounded-lg" />
                                            </TransformComponent>
                                        </TransformWrapper>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 bg-white p-8 overflow-y-auto">
                                <h3 className="text-3xl font-black text-slate-900 mb-8 border-b-4 border-emerald-500 inline-block pb-2">Complete Application Review</h3>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    {/* Personal Information */}
                                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 border border-slate-200">
                                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                            <div className="w-8 h-0.5 bg-emerald-500"></div>
                                            Personal Info
                                        </h4>
                                        <div className="space-y-4">
                                            <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</label><p className="text-lg font-bold text-slate-800 mt-1">{visa.applicantName || 'N/A'}</p></div>
                                            <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</label><p className="text-sm font-medium text-blue-600 mt-1 break-all">{visa.email || 'N/A'}</p></div>
                                            <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone</label><p className="text-sm font-medium text-slate-700 mt-1">{visa.phone || 'N/A'}</p></div>
                                            <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CNIC</label><p className="text-sm font-mono font-bold text-slate-700 mt-1">{visa.cnic || 'N/A'}</p></div>
                                            <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Age</label><p className="text-sm font-medium text-slate-700 mt-1">{visa.age || 'N/A'}</p></div>
                                            <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Passport #</label><p className="text-sm font-mono font-bold text-slate-700 mt-1">{visa.passportNumber || 'N/A'}</p></div>
                                        </div>
                                    </div>

                                    {/* Travel Details */}
                                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                                        <h4 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                            <div className="w-8 h-0.5 bg-blue-500"></div>
                                            Travel Details
                                        </h4>
                                        <div className="space-y-4">
                                            <div><label className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Destination</label><p className="text-xl font-bold text-blue-900 mt-1">{visa.country || 'N/A'}</p></div>
                                            <div><label className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Visa Type</label><p className="text-sm font-bold text-blue-800 mt-1">{visa.visaType || 'N/A'}</p></div>
                                            <div><label className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Processing Time</label><p className="text-sm font-medium text-blue-700 mt-1">{visa.processingTime || 'N/A'}</p></div>
                                            <div><label className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Validity</label><p className="text-sm font-medium text-blue-700 mt-1">{visa.validity || 'N/A'}</p></div>
                                            <div><label className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Stay Duration</label><p className="text-sm font-medium text-blue-700 mt-1">{visa.stayDuration || 'N/A'}</p></div>
                                            <div><label className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Urgent Processing</label><p className="text-sm font-bold text-blue-700 mt-1">{visa.urgentProcessing ? 'YES' : 'NO'}</p></div>
                                        </div>
                                    </div>

                                    {/* Payment & Status */}
                                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-200">
                                        <h4 className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                            <div className="w-8 h-0.5 bg-emerald-500"></div>
                                            Payment & Status
                                        </h4>
                                        <div className="space-y-4">
                                            <div><label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Total Fee</label><p className="text-2xl font-black text-emerald-700 mt-1">PKR {visa.totalFee?.toLocaleString() || '0'}</p></div>
                                            <div><label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Visa Fee</label><p className="text-sm font-medium text-emerald-700 mt-1">PKR {visa.visaFee?.toLocaleString() || '0'}</p></div>
                                            {visa.urgentFee && <div><label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Urgent Fee</label><p className="text-sm font-medium text-emerald-700 mt-1">PKR {visa.urgentFee?.toLocaleString() || '0'}</p></div>}
                                            <div><label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Application Status</label><p className="text-sm font-bold text-emerald-700 mt-1">{visa.status || 'Pending'}</p></div>
                                            <div><label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Payment Status</label><p className="text-sm font-medium text-emerald-700 mt-1">{visa.paymentStatus || 'Completed'}</p></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Application Metadata */}
                                <div className="mt-8 bg-slate-50 rounded-2xl p-6 border border-slate-200">
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Application Metadata</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div><label className="text-[10px] font-black text-slate-400 uppercase">Application Date</label><p className="font-medium text-slate-700 mt-1">{formatDate(visa.applicationDate)}</p></div>
                                        <div><label className="text-[10px] font-black text-slate-400 uppercase">User ID</label><p className="font-mono text-xs text-slate-600 mt-1">{visa.userId || visa.uid || 'N/A'}</p></div>
                                        <div><label className="text-[10px] font-black text-slate-400 uppercase">User Email</label><p className="text-xs text-slate-600 mt-1 break-all">{visa.userEmail || visa.email || 'N/A'}</p></div>
                                        <div><label className="text-[10px] font-black text-slate-400 uppercase">Category</label><p className="font-medium text-slate-700 mt-1">{visa.category || 'N/A'}</p></div>
                                    </div>
                                </div>

                                {/* Admin Message Display */}
                                {visa.adminMessage && (
                                    <div className="mt-6 bg-amber-50 border-l-4 border-amber-500 p-5 rounded-r-xl">
                                        <h4 className="text-sm font-bold text-amber-900 mb-2">Current Admin Message to User:</h4>
                                        <p className="text-sm text-amber-800">{visa.adminMessage}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default DocumentViewer;