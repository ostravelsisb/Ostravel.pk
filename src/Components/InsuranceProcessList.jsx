import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaTimes, FaFileInvoiceDollar, FaFilePdf, FaShieldAlt } from 'react-icons/fa';
import { HiEye, HiReceiptTax } from 'react-icons/hi';
import InvoiceModal from './InvoiceModal';

// Normalizes a record from either the `insurancesCustumer` collection
// (BookingConfirmation.jsx — fields: travelerName/userEmail/amount/purchaseDate)
// or the `policies` payment-gateway collection (PaymentReturn.jsx — fields:
// customerName/customerEmail/amountPaid/orderDate) into one common shape so
// the table doesn't need to branch on source everywhere.
function normalize(r) {
    const name = r.travelerName || r.customerName || 'N/A';
    const email = r.userEmail || r.customerEmail || r.email || 'N/A';
    const phone = r.phone || r.mobileNumber || r.customerMobile || 'N/A';
    const cnic = r.cnic || r.Cnic || r.CNIC || 'N/A';
    const amount = Number(r.amount ?? r.amountPaid ?? r.premium ?? 0) || 0;
    const planName = r.planName || r.PlanName || r.Plan || 'Standard Plan';
    const policyNumber = r.policyNumber || r.orderId || r.id;
    const date = r.purchaseDate?.toDate?.() || r.purchaseDate
        || r.orderDate?.toDate?.() || r.orderDate
        || r.createdAt?.toDate?.() || r.createdAt || null;
    const status = r.status || r.paymentStatus || 'PAID';
    const transactionId = r.bankTransactionId || r.transactionId || r.unique_tran_id || 'N/A';
    const pdfLink = r.pdfLink || r.certificateUrl || r.PolicyPrintUrl || null;
    return { name, email, phone, cnic, amount, planName, policyNumber, date, status, transactionId, pdfLink };
}

export default function InsuranceProcessList({ policies = [] }) {
    const [search, setSearch] = useState('');
    const [invoiceRecord, setInvoiceRecord] = useState(null);
    const [detailRecord, setDetailRecord] = useState(null);

    const rows = useMemo(() => {
        return policies
            .map(r => ({ raw: r, n: normalize(r) }))
            .filter(({ n }) => {
                if (!search.trim()) return true;
                const q = search.toLowerCase();
                return n.name.toLowerCase().includes(q)
                    || n.email.toLowerCase().includes(q)
                    || n.cnic.toLowerCase().includes(q)
                    || String(n.policyNumber || '').toLowerCase().includes(q);
            })
            .sort((a, b) => {
                const da = a.n.date ? new Date(a.n.date).getTime() : 0;
                const db_ = b.n.date ? new Date(b.n.date).getTime() : 0;
                return db_ - da;
            });
    }, [policies, search]);

    const totalAmount = rows.reduce((sum, { n }) => sum + n.amount, 0);

    return (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Header stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase">Total Policies</p>
                    <p className="text-2xl font-black text-slate-900 mt-1">{rows.length}</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase">Total Revenue</p>
                    <p className="text-2xl font-black text-emerald-600 mt-1">PKR {totalAmount.toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <FaShieldAlt />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase">Insurance Records</p>
                        <p className="text-sm font-bold text-slate-700">All customer policies</p>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                <div className="relative max-w-md">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-sm" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name, email, CNIC, or policy #"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-emerald-300"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Traveler</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Policy</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {rows.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-bold">No insurance records found</td></tr>
                            ) : rows.map(({ raw, n }) => (
                                <tr key={raw.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-900">{n.name}</div>
                                        <div className="text-sm text-slate-500">{n.email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-900">{n.planName}</div>
                                        <div className="text-xs text-slate-500 font-mono mt-0.5">{n.policyNumber}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-900">PKR {n.amount.toLocaleString()}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-slate-500">{n.date ? new Date(n.date).toLocaleDateString() : 'N/A'}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">{n.status}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => setDetailRecord({ raw, n })}
                                                className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-xs font-bold"
                                            >
                                                <HiEye className="w-4 h-4" /> View
                                            </button>
                                            <button
                                                onClick={() => setInvoiceRecord(raw)}
                                                className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors text-xs font-bold"
                                            >
                                                <HiReceiptTax className="w-4 h-4" /> Invoice
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detail modal — all required details for the user's record */}
            <AnimatePresence>
                {detailRecord && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[80] bg-black/50 flex items-center justify-center p-4"
                        onClick={() => setDetailRecord(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="bg-emerald-600 p-6 text-white flex items-center justify-between sticky top-0">
                                <div>
                                    <p className="text-emerald-100 text-xs font-bold uppercase">Insurance Record — {detailRecord.n.name}</p>
                                    <h3 className="text-lg font-black font-mono">{detailRecord.n.policyNumber}</h3>
                                </div>
                                <button onClick={() => setDetailRecord(null)}><FaTimes /></button>
                            </div>
                            <div className="p-6 space-y-3 text-sm">
                                {[
                                    ['Traveler Name', detailRecord.n.name],
                                    ['Email', detailRecord.n.email],
                                    ['Phone', detailRecord.n.phone],
                                    ['CNIC', detailRecord.n.cnic],
                                    ['Plan', detailRecord.n.planName],
                                    ['Policy Number', detailRecord.n.policyNumber],
                                    ['Amount Paid', `PKR ${detailRecord.n.amount.toLocaleString()}`],
                                    ['Transaction ID', detailRecord.n.transactionId],
                                    ['Purchase Date', detailRecord.n.date ? new Date(detailRecord.n.date).toLocaleString() : 'N/A'],
                                    ['Status', detailRecord.n.status],
                                ].map(([label, value]) => (
                                    <div key={label} className="flex items-center justify-between border-b border-slate-100 pb-2">
                                        <span className="text-slate-400 font-bold text-xs uppercase">{label}</span>
                                        <span className="text-slate-800 font-medium text-right">{value || 'N/A'}</span>
                                    </div>
                                ))}
                                <div className="flex gap-2 pt-2">
                                    {detailRecord.n.pdfLink && (
                                        <a
                                            href={detailRecord.n.pdfLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-100 text-slate-700 font-black text-sm hover:bg-slate-200"
                                        >
                                            <FaFilePdf /> Policy Certificate
                                        </a>
                                    )}
                                    <button
                                        onClick={() => { setInvoiceRecord(detailRecord.raw); setDetailRecord(null); }}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 text-white font-black text-sm hover:bg-emerald-700"
                                    >
                                        <FaFileInvoiceDollar /> View Invoice
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {invoiceRecord && (
                <InvoiceModal record={invoiceRecord} recordType="insurance" onClose={() => setInvoiceRecord(null)} />
            )}
        </motion.div>
    );
}
