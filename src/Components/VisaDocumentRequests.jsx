import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../firbase';
import { doc, updateDoc } from 'firebase/firestore';
import {
    FaFileUpload, FaTimes, FaPlus, FaFileAlt, FaTrash,
    FaExternalLinkAlt, FaClock
} from 'react-icons/fa';

const docStatusColor = (status) => ({
    "Requested": "bg-orange-50 text-orange-700 border-orange-200",
    "Uploaded": "bg-blue-50 text-blue-700 border-blue-200",
    "Verified": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Rejected": "bg-red-50 text-red-600 border-red-200",
}[status] || "bg-gray-50 text-gray-600 border-gray-200");

/**
 * "Documents (n)" button + modal for a single visa application. Lets
 * admin/subadmin type a free-form document name (e.g. "CNIC Front") and
 * ask the user to upload it. Same UX as the Umrah document-request tool.
 * Sets editApproved=true so the user's "Edit" button appears on their
 * dashboard, where a matching upload slot shows for each Requested item.
 */
export default function VisaDocumentRequests({ visa }) {
    const [open, setOpen] = useState(false);
    const [newDocName, setNewDocName] = useState('');
    const [rejectDocId, setRejectDocId] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [saving, setSaving] = useState(false);

    const requests = useMemo(() => visa.documentRequests || [], [visa.documentRequests]);

    // Only show this action once the applicant has actually been asked for
    // a document ("Req Document" status), or if there are already requests
    // on file that still need review — otherwise it clutters every row
    // regardless of status.
    const shouldShow = visa.status === 'Req Document' || requests.length > 0;
    if (!shouldShow) return null;

    const addDocumentRequest = async () => {
        const name = newDocName.trim();
        if (!name) return;
        setSaving(true);
        try {
            const newDoc = {
                id: `doc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                name,
                status: 'Requested',
                fileUrl: null,
                fileName: null,
                note: '',
                requestedAt: new Date().toISOString(),
                uploadedAt: null,
                reviewedAt: null,
            };
            await updateDoc(doc(db, 'visaApplications', visa.id), {
                documentRequests: [...requests, newDoc],
                editApproved: true, // surface the Edit button on the user's dashboard
                updatedAt: new Date().toISOString(),
            });
            setNewDocName('');
        } catch (err) {
            console.error('Failed to add document request', err);
            alert('Failed to add document request. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const removeDocumentRequest = async (docId) => {
        if (!confirm('Remove this document request?')) return;
        setSaving(true);
        try {
            await updateDoc(doc(db, 'visaApplications', visa.id), {
                documentRequests: requests.filter(d => d.id !== docId),
                updatedAt: new Date().toISOString(),
            });
        } catch (err) {
            console.error('Failed to remove document request', err);
            alert('Failed to remove document request.');
        } finally {
            setSaving(false);
        }
    };

    const reviewDocument = async (docId, newStatus, reason = '') => {
        setSaving(true);
        try {
            const updated = requests.map(d =>
                d.id === docId ? { ...d, status: newStatus, note: reason, reviewedAt: new Date().toISOString() } : d
            );
            await updateDoc(doc(db, 'visaApplications', visa.id), {
                documentRequests: updated,
                updatedAt: new Date().toISOString(),
            });
            setRejectDocId(null);
            setRejectReason('');
        } catch (err) {
            console.error('Failed to review document', err);
            alert('Failed to update document review.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="px-3 py-2 rounded-xl text-xs font-black bg-orange-500 text-white hover:bg-orange-600 transition flex items-center gap-1.5"
            >
                <FaFileUpload /> Documents{requests.length ? ` (${requests.length})` : ''}
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[80] bg-black/50 flex items-center justify-center p-4"
                        onClick={() => { setOpen(false); setNewDocName(''); setRejectDocId(null); }}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="bg-orange-500 p-6 text-white flex items-center justify-between sticky top-0">
                                <div>
                                    <p className="text-orange-100 text-xs font-bold uppercase">Documents — {visa.applicantName}</p>
                                    <h3 className="text-lg font-black font-mono">{visa.applicationNumber}</h3>
                                </div>
                                <button onClick={() => { setOpen(false); setNewDocName(''); setRejectDocId(null); }}><FaTimes /></button>
                            </div>

                            <div className="p-6 space-y-4">
                                <div className="flex gap-2">
                                    <input
                                        value={newDocName}
                                        onChange={(e) => setNewDocName(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && addDocumentRequest()}
                                        placeholder="e.g. CNIC Front"
                                        className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-orange-400 text-sm"
                                    />
                                    <button
                                        onClick={addDocumentRequest}
                                        disabled={saving || !newDocName.trim()}
                                        className="px-4 py-2.5 rounded-xl bg-orange-500 text-white font-black text-sm hover:bg-orange-600 disabled:opacity-40 flex items-center gap-1.5 shrink-0"
                                    >
                                        <FaPlus /> Add Document
                                    </button>
                                </div>

                                {requests.length === 0 ? (
                                    <div className="text-center py-8 text-gray-400">
                                        <FaFileAlt className="text-3xl mx-auto mb-2 opacity-30" />
                                        <p className="text-sm font-bold">No documents requested yet</p>
                                        <p className="text-xs mt-1">Add one above — the applicant will see an upload slot on their dashboard instantly.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {requests.map(d => (
                                            <div key={d.id} className="border border-gray-200 rounded-2xl p-4">
                                                <div className="flex items-center justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-gray-800 truncate">{d.name}</p>
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${docStatusColor(d.status)}`}>
                                                            {d.status}
                                                        </span>
                                                    </div>
                                                    {d.status === 'Requested' && (
                                                        <button
                                                            onClick={() => removeDocumentRequest(d.id)}
                                                            title="Remove request"
                                                            className="text-gray-300 hover:text-red-500 transition shrink-0"
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    )}
                                                </div>

                                                {d.status === 'Requested' && (
                                                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-2"><FaClock /> Waiting for applicant to upload</p>
                                                )}

                                                {d.fileUrl && (
                                                    <div className="mt-3 flex items-center justify-between gap-3 bg-gray-50 rounded-xl p-3">
                                                        <a
                                                            href={d.fileUrl} target="_blank" rel="noopener noreferrer"
                                                            className="flex items-center gap-2 text-blue-600 font-bold text-sm truncate hover:underline"
                                                        >
                                                            <FaExternalLinkAlt className="shrink-0" /> <span className="truncate">{d.fileName || 'View uploaded file'}</span>
                                                        </a>
                                                        {d.status === 'Uploaded' && (
                                                            <div className="flex gap-2 shrink-0">
                                                                <button
                                                                    onClick={() => reviewDocument(d.id, 'Verified')}
                                                                    className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700"
                                                                >
                                                                    Verify
                                                                </button>
                                                                <button
                                                                    onClick={() => setRejectDocId(rejectDocId === d.id ? null : d.id)}
                                                                    className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-bold hover:bg-red-100"
                                                                >
                                                                    Reject
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {d.status === 'Rejected' && d.note && (
                                                    <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mt-2">Reason: {d.note}</p>
                                                )}

                                                {rejectDocId === d.id && (
                                                    <div className="mt-3 flex gap-2">
                                                        <input
                                                            value={rejectReason}
                                                            onChange={(e) => setRejectReason(e.target.value)}
                                                            placeholder="Why is this being rejected? (shown to applicant)"
                                                            className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-xs outline-none focus:ring-2 focus:ring-red-300"
                                                        />
                                                        <button
                                                            onClick={() => reviewDocument(d.id, 'Rejected', rejectReason)}
                                                            className="px-3 py-2 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 shrink-0"
                                                        >
                                                            Confirm
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}