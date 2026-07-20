import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../firbase';
import { doc, updateDoc } from 'firebase/firestore';
import { sendUmrahStatusEmail } from '../Utils/emailService';
import {
    FaKaaba, FaHotel, FaCar, FaUser, FaPhone, FaEnvelope, FaMoneyBillWave,
    FaSearch, FaTimes, FaCheckCircle, FaFileUpload, FaFileAlt, FaPlus,
    FaExternalLinkAlt, FaTrash, FaClock
} from 'react-icons/fa';

// Statuses an Umrah request can move through. "Documents Required" reveals
// the document-request tools; "Payment Requested" is the trigger that shows
// a Pay Now card on the user's dashboard.
const STATUSES = ["Pending Review", "Processing", "Documents Required", "Payment Requested", "Paid", "Completed", "Rejected"];

const statusColor = (status) => ({
    "Pending Review": "bg-amber-50 text-amber-700 border-amber-200",
    "Processing": "bg-blue-50 text-blue-700 border-blue-200",
    "Documents Required": "bg-orange-50 text-orange-700 border-orange-200",
    "Payment Requested": "bg-purple-50 text-purple-700 border-purple-200",
    "Paid": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Completed": "bg-teal-50 text-teal-700 border-teal-200",
    "Rejected": "bg-red-50 text-red-600 border-red-200",
}[status] || "bg-gray-50 text-gray-600 border-gray-200");

const docStatusColor = (status) => ({
    "Requested": "bg-orange-50 text-orange-700 border-orange-200",
    "Uploaded": "bg-blue-50 text-blue-700 border-blue-200",
    "Verified": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Rejected": "bg-red-50 text-red-600 border-red-200",
}[status] || "bg-gray-50 text-gray-600 border-gray-200");

/**
 * Reusable Umrah request queue. Used by both AdminDashboard and
 * SubAdminPanel — the caller just passes in the live `requests` array
 * (from an onSnapshot listener on the `umrahApplications` collection)
 * and who is acting (`actorRole`, `actorName`) for the status-history log.
 */
export default function UmrahProcessList({ requests, actorRole = 'admin', actorName = 'Admin' }) {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [selected, setSelected] = useState(null);
    const [paymentModal, setPaymentModal] = useState(null); // request being sent a payment request
    const [amountInput, setAmountInput] = useState('');
    const [noteInput, setNoteInput] = useState('');
    const [docsModal, setDocsModal] = useState(null); // request being managed for documents
    const [newDocName, setNewDocName] = useState('');
    const [rejectDocId, setRejectDocId] = useState(null); // doc awaiting a rejection reason
    const [rejectReason, setRejectReason] = useState('');
    const [saving, setSaving] = useState(false);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return (requests || []).filter(r => {
            const matchStatus = statusFilter === 'All' || r.status === statusFilter;
            const matchSearch = !q ||
                (r.user?.name || '').toLowerCase().includes(q) ||
                (r.requestNumber || '').toLowerCase().includes(q) ||
                (r.user?.contact || '').toLowerCase().includes(q) ||
                (r.userEmail || '').toLowerCase().includes(q);
            return matchStatus && matchSearch;
        });
    }, [requests, search, statusFilter]);

    const stats = useMemo(() => ({
        total: (requests || []).length,
        pending: (requests || []).filter(r => r.status === 'Pending Review').length,
        awaitingPayment: (requests || []).filter(r => r.status === 'Payment Requested').length,
        paid: (requests || []).filter(r => r.status === 'Paid' || r.status === 'Completed').length,
    }), [requests]);

    const docsModalLive = useMemo(
        () => (docsModal ? (requests || []).find(r => r.id === docsModal.id) || docsModal : null),
        [docsModal, requests]
    );

    const updateStatus = async (id, newStatus) => {
        setSaving(true);
        try {
            const target = requests.find(r => r.id === id);
            const oldStatus = target?.status || 'Pending Review';
            await updateDoc(doc(db, 'umrahApplications', id), {
                status: newStatus,
                updatedAt: new Date().toISOString(),
                statusHistory: [
                    ...(target?.statusHistory || []),
                    { status: newStatus, timestamp: new Date().toISOString(), updatedBy: `${actorRole}:${actorName}` }
                ]
            });
            sendUmrahStatusEmail({
                to: target?.userEmail || target?.user?.email,
                applicantName: target?.user?.name,
                hotel: target?.makkah?.hotel,
                checkIn: target?.makkah?.checkIn,
                checkOut: target?.makkah?.checkOut,
                oldStatus,
                newStatus,
            });
        } catch (err) {
            console.error('Failed to update umrah status', err);
            alert('Failed to update status. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const sendPaymentRequest = async () => {
        if (!paymentModal) return;
        const amount = Number(amountInput);
        if (!amount || amount <= 0) {
            alert('Enter a valid amount.');
            return;
        }
        setSaving(true);
        try {
            await updateDoc(doc(db, 'umrahApplications', paymentModal.id), {
                status: 'Payment Requested',
                paymentRequested: true,
                paymentAmount: amount,
                paymentNote: noteInput || '',
                paymentStatus: 'Unpaid',
                updatedAt: new Date().toISOString(),
                statusHistory: [
                    ...(paymentModal.statusHistory || []),
                    { status: 'Payment Requested', timestamp: new Date().toISOString(), updatedBy: `${actorRole}:${actorName}`, amount }
                ]
            });
            sendUmrahStatusEmail({
                to: paymentModal.userEmail || paymentModal.user?.email,
                applicantName: paymentModal.user?.name,
                hotel: paymentModal.makkah?.hotel,
                checkIn: paymentModal.makkah?.checkIn,
                checkOut: paymentModal.makkah?.checkOut,
                oldStatus: paymentModal.status,
                newStatus: `Payment Requested — PKR ${amount.toLocaleString()} due`,
            });
            setPaymentModal(null);
            setAmountInput('');
            setNoteInput('');
        } catch (err) {
            console.error('Failed to send payment request', err);
            alert('Failed to send payment notification. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    // Admin/sub-admin asks the applicant for a specific document (e.g. "CNIC Front").
    // Appends to documentRequests[]; the user sees it instantly and gets an upload slot.
    const addDocumentRequest = async () => {
        if (!docsModalLive) return;
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
            const updatedDocs = [...(docsModalLive.documentRequests || []), newDoc];
            const patch = { documentRequests: updatedDocs, updatedAt: new Date().toISOString() };
            // Auto-flip status to "Documents Required" so the applicant notices,
            // unless the request has already moved past that stage.
            if (!['Payment Requested', 'Paid', 'Completed', 'Rejected'].includes(docsModalLive.status)) {
                patch.status = 'Documents Required';
            }
            await updateDoc(doc(db, 'umrahApplications', docsModalLive.id), patch);
            sendUmrahStatusEmail({
                to: docsModalLive.userEmail || docsModalLive.user?.email,
                applicantName: docsModalLive.user?.name,
                hotel: docsModalLive.makkah?.hotel,
                checkIn: docsModalLive.makkah?.checkIn,
                checkOut: docsModalLive.makkah?.checkOut,
                oldStatus: docsModalLive.status,
                newStatus: `Document Requested — please upload "${name}"`,
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
        if (!docsModalLive) return;
        if (!confirm('Remove this document request?')) return;
        setSaving(true);
        try {
            const updatedDocs = (docsModalLive.documentRequests || []).filter(d => d.id !== docId);
            await updateDoc(doc(db, 'umrahApplications', docsModalLive.id), {
                documentRequests: updatedDocs,
                updatedAt: new Date().toISOString(),
            });
        } catch (err) {
            console.error('Failed to remove document request', err);
            alert('Failed to remove document request.');
        } finally {
            setSaving(false);
        }
    };

    // Admin reviews an uploaded document — Verify or Reject (with a reason,
    // which flips the doc back to needing a re-upload).
    const reviewDocument = async (docId, newDocStatus, reason = '') => {
        if (!docsModalLive) return;
        setSaving(true);
        try {
            const updatedDocs = (docsModalLive.documentRequests || []).map(d =>
                d.id === docId
                    ? { ...d, status: newDocStatus, note: reason, reviewedAt: new Date().toISOString() }
                    : d
            );
            await updateDoc(doc(db, 'umrahApplications', docsModalLive.id), {
                documentRequests: updatedDocs,
                updatedAt: new Date().toISOString(),
            });
            const target = updatedDocs.find(d => d.id === docId);
            sendUmrahStatusEmail({
                to: docsModalLive.userEmail || docsModalLive.user?.email,
                applicantName: docsModalLive.user?.name,
                hotel: docsModalLive.makkah?.hotel,
                checkIn: docsModalLive.makkah?.checkIn,
                checkOut: docsModalLive.makkah?.checkOut,
                oldStatus: docsModalLive.status,
                newStatus: newDocStatus === 'Verified'
                    ? `Document "${target?.name}" verified ✓`
                    : `Document "${target?.name}" rejected — please re-upload${reason ? `: ${reason}` : ''}`,
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
        <div className="space-y-5">
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: 'Total Requests', value: stats.total, color: 'from-blue-500 to-blue-600' },
                    { label: 'Pending Review', value: stats.pending, color: 'from-amber-500 to-amber-600' },
                    { label: 'Awaiting Payment', value: stats.awaitingPayment, color: 'from-purple-500 to-purple-600' },
                    { label: 'Paid / Completed', value: stats.paid, color: 'from-emerald-500 to-emerald-600' },
                ].map((s, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">{s.label}</p>
                        <p className={`text-2xl font-black mt-1 bg-gradient-to-r ${s.color} bg-clip-text text-transparent`}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 min-w-[200px]">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search name, request #, phone, email..."
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    {['All', ...STATUSES].map(s => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition ${statusFilter === s ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                {filtered.length === 0 ? (
                    <div className="p-10 text-center text-gray-400">
                        <FaKaaba className="text-4xl mx-auto mb-3 opacity-30" />
                        <p className="font-bold">No Umrah requests found</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {filtered.map(r => (
                            <div key={r.id} className="p-5 flex flex-col md:flex-row md:items-center gap-4 hover:bg-gray-50/60 transition">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <p className="font-black text-gray-800">{r.user?.name || r.userName || 'Unnamed'}</p>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColor(r.status)}`}>
                                            {r.status || 'Pending Review'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-400 font-mono mt-0.5">{r.requestNumber}</p>
                                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
                                        <span className="flex items-center gap-1"><FaPhone className="text-gray-300" /> {r.user?.contact || '—'}</span>
                                        <span className="flex items-center gap-1"><FaEnvelope className="text-gray-300" /> {r.userEmail || r.user?.email || '—'}</span>
                                        <span className="flex items-center gap-1"><FaHotel className="text-gray-300" /> {r.makkah?.nights || 0} nights · {r.makkah?.rooms || 1} room(s)</span>
                                        <span className="flex items-center gap-1"><FaCar className="text-gray-300" /> {r.transport?.vehicleType || '—'}</span>
                                        {r.paymentAmount ? (
                                            <span className="flex items-center gap-1 font-bold text-purple-600"><FaMoneyBillWave /> PKR {Number(r.paymentAmount).toLocaleString()} {r.paymentStatus === 'Paid' && '(Paid)'}</span>
                                        ) : null}
                                        {r.documentRequests?.length > 0 && (
                                            <span className="flex items-center gap-1 font-bold text-orange-600">
                                                <FaFileAlt />
                                                {r.documentRequests.filter(d => d.status === 'Verified').length}/{r.documentRequests.length} docs verified
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    <button
                                        onClick={() => setSelected(r)}
                                        className="px-3 py-2 rounded-xl text-xs font-bold border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600 transition"
                                    >
                                        View Details
                                    </button>

                                    <select
                                        value={r.status || 'Pending Review'}
                                        disabled={saving}
                                        onChange={(e) => updateStatus(r.id, e.target.value)}
                                        className="px-3 py-2 rounded-xl text-xs font-bold border border-gray-200 outline-none focus:ring-2 focus:ring-blue-400"
                                    >
                                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>

                                    <button
                                        onClick={() => setDocsModal(r)}
                                        className="px-3 py-2 rounded-xl text-xs font-black bg-orange-500 text-white hover:bg-orange-600 transition flex items-center gap-1.5"
                                    >
                                        <FaFileUpload /> Documents{r.documentRequests?.length ? ` (${r.documentRequests.length})` : ''}
                                    </button>

                                    <button
                                        onClick={() => { setPaymentModal(r); setAmountInput(r.paymentAmount || ''); setNoteInput(r.paymentNote || ''); }}
                                        disabled={r.paymentStatus === 'Paid'}
                                        className="px-3 py-2 rounded-xl text-xs font-black bg-purple-600 text-white hover:bg-purple-700 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                                    >
                                        <FaMoneyBillWave /> {r.paymentStatus === 'Paid' ? 'Paid' : r.paymentRequested ? 'Update Payment' : 'Request Payment'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Details Modal */}
            <AnimatePresence>
                {selected && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[80] bg-black/50 flex items-center justify-center p-4"
                        onClick={() => setSelected(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="bg-blue-600 p-6 text-white flex items-center justify-between">
                                <div>
                                    <p className="text-blue-200 text-xs font-bold uppercase">Umrah Request</p>
                                    <h3 className="text-xl font-black font-mono">{selected.requestNumber}</h3>
                                </div>
                                <button onClick={() => setSelected(null)}><FaTimes /></button>
                            </div>
                            <div className="p-6 space-y-4 text-sm">
                                <Row label="Applicant" value={selected.user?.name} icon={<FaUser />} />
                                <Row label="Contact" value={selected.user?.contact} icon={<FaPhone />} />
                                <Row label="Email" value={selected.userEmail || selected.user?.email} icon={<FaEnvelope />} />
                                <Row label="CNIC" value={selected.user?.cnic} />
                                <Row label="Passport #" value={selected.user?.passportNumber} />
                                <Row label="Pilgrims" value={selected.user?.travelers} />
                                <Row label="Hotel" value={selected.makkah?.hotel} icon={<FaHotel />} />
                                <Row label="Check In / Out" value={`${selected.makkah?.checkIn || '—'} → ${selected.makkah?.checkOut || '—'} (${selected.makkah?.nights || 0} nights)`} />
                                <Row label="Rooms" value={selected.makkah?.rooms} />
                                <Row label="Transport" value={selected.transport?.vehicleType} icon={<FaCar />} />
                                <Row label="Services" value={Object.entries(selected.services || {}).filter(([, v]) => v).map(([k]) => k).join(', ') || 'None selected'} />
                                {selected.user?.notes && <Row label="Notes" value={selected.user.notes} />}
                                {selected.paymentAmount && (
                                    <Row label="Payment" value={`PKR ${Number(selected.paymentAmount).toLocaleString()} — ${selected.paymentStatus}`} icon={<FaMoneyBillWave />} />
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Payment Request Modal */}
            <AnimatePresence>
                {paymentModal && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[80] bg-black/50 flex items-center justify-center p-4"
                        onClick={() => setPaymentModal(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-lg font-black text-gray-800 flex items-center gap-2 mb-1">
                                <FaMoneyBillWave className="text-purple-600" /> Send Payment Request
                            </h3>
                            <p className="text-xs text-gray-400 mb-4">
                                This will appear on {paymentModal.user?.name || 'the applicant'}'s dashboard with a Pay Now button.
                            </p>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Amount (PKR)</label>
                            <input
                                type="number"
                                value={amountInput}
                                onChange={(e) => setAmountInput(e.target.value)}
                                placeholder="e.g. 185000"
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 mb-4 outline-none focus:ring-2 focus:ring-purple-400"
                            />
                            <label className="block text-xs font-bold text-gray-500 mb-1">Note to applicant (optional)</label>
                            <textarea
                                value={noteInput}
                                onChange={(e) => setNoteInput(e.target.value)}
                                rows={3}
                                placeholder="e.g. Covers 5-night double room + visa + transport"
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 mb-5 outline-none focus:ring-2 focus:ring-purple-400"
                            />
                            <div className="flex gap-3">
                                <button onClick={() => setPaymentModal(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 font-bold text-gray-500 hover:bg-gray-50">Cancel</button>
                                <button
                                    onClick={sendPaymentRequest}
                                    disabled={saving}
                                    className="flex-1 py-2.5 rounded-xl bg-purple-600 text-white font-black hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    <FaCheckCircle /> {saving ? 'Sending...' : 'Send Request'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Document Requests Modal */}
            <AnimatePresence>
                {docsModalLive && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[80] bg-black/50 flex items-center justify-center p-4"
                        onClick={() => { setDocsModal(null); setNewDocName(''); setRejectDocId(null); }}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="bg-orange-500 p-6 text-white flex items-center justify-between sticky top-0">
                                <div>
                                    <p className="text-orange-100 text-xs font-bold uppercase">Documents — {docsModalLive.user?.name}</p>
                                    <h3 className="text-lg font-black font-mono">{docsModalLive.requestNumber}</h3>
                                </div>
                                <button onClick={() => { setDocsModal(null); setNewDocName(''); setRejectDocId(null); }}><FaTimes /></button>
                            </div>

                            <div className="p-6 space-y-4">
                                {/* Add new document request */}
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

                                {/* List of requested documents */}
                                {(docsModalLive.documentRequests || []).length === 0 ? (
                                    <div className="text-center py-8 text-gray-400">
                                        <FaFileAlt className="text-3xl mx-auto mb-2 opacity-30" />
                                        <p className="text-sm font-bold">No documents requested yet</p>
                                        <p className="text-xs mt-1">Add one above — the applicant will see an upload slot on their dashboard instantly.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {docsModalLive.documentRequests.map(d => (
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
        </div>
    );
}

const Row = ({ label, value, icon }) => (
    <div className="flex justify-between items-start gap-4 pb-3 border-b border-gray-50">
        <span className="text-gray-400 font-bold text-xs uppercase tracking-wide flex items-center gap-1.5 shrink-0">{icon} {label}</span>
        <span className="text-gray-800 font-semibold text-right">{value || '—'}</span>
    </div>
);