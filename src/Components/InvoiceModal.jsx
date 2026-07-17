// src/Components/InvoiceModal.jsx
// Reusable professional invoice viewer. Used in UserDashboard (and can be
// reused in Admin/SubAdmin panels). Pass any visaApplication or policy
// Firestore doc as `record`.

import React from 'react';
import { motion } from 'framer-motion';
import { MdClose, MdPrint, MdReceipt } from 'react-icons/md';

// helpers
const fmt = (n) => Number(n || 0).toLocaleString('en-PK');
const fmtDate = (val) => {
    if (!val) return 'N/A';
    const d = val?.toDate ? val.toDate() : new Date(val);
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleString('en-PK', { dateStyle: 'long', timeStyle: 'short' });
};

// Standalone CSS injected into the print popup. The popup window has no
// Tailwind stylesheet, so the printable invoice is styled entirely with
// this dedicated stylesheet, keyed off the `inv-*` class names below.
const PRINT_CSS = `
    @page { margin: 0; }
    * { box-sizing: border-box; }
    body {
        font-family: 'Segoe UI', Arial, sans-serif;
        margin: 0;
        padding: 0;
        color: #1e293b;
        background: #ffffff;
    }
    .inv-sheet { max-width: 780px; margin: 0 auto; padding: 40px 48px 56px; }

    .inv-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        background: #0f172a;
        border-radius: 14px;
        padding: 28px 32px;
        margin-bottom: 28px;
    }
    .inv-brand-name { color: #ffffff; font-size: 22px; font-weight: 800; margin: 0; letter-spacing: 0.2px; }
    .inv-brand-url { color: #94a3b8; font-size: 11px; margin: 4px 0 0; }
    .inv-header-right { text-align: right; }
    .inv-label { color: #94a3b8; font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; margin: 0; }
    .inv-number { color: #ffffff; font-size: 15px; font-weight: 700; margin: 4px 0 0; font-family: 'Courier New', monospace; }
    .inv-date { color: #94a3b8; font-size: 11px; margin: 4px 0 0; }

    .inv-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
    .inv-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px 20px; }
    .inv-card-title { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #64748b; margin: 0 0 10px; }
    .inv-card-name { font-size: 15px; font-weight: 700; color: #0f172a; margin: 0 0 4px; }
    .inv-card-line { font-size: 12.5px; color: #475569; margin: 2px 0; }

    .inv-table { width: 100%; border-collapse: collapse; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin-bottom: 20px; }
    .inv-table thead th {
        background: #f1f5f9; text-align: left; font-size: 10.5px; font-weight: 700;
        text-transform: uppercase; letter-spacing: 0.8px; color: #64748b; padding: 12px 18px; border-bottom: 1px solid #e2e8f0;
    }
    .inv-table thead th.right, .inv-table td.right { text-align: right; }
    .inv-table tbody td { padding: 12px 18px; font-size: 13.5px; color: #334155; border-bottom: 1px solid #f1f5f9; }
    .inv-table tfoot td { padding: 15px 18px; background: #0f172a; color: #ffffff; font-weight: 700; font-size: 14.5px; }
    .inv-table tfoot td.right { color: #34d399; font-size: 16px; }

    .inv-paid-box {
        background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px;
        padding: 16px 20px; margin-bottom: 24px; display: flex; gap: 12px; align-items: flex-start;
    }
    .inv-paid-icon { font-size: 20px; line-height: 1; margin-top: 1px; }
    .inv-paid-title { color: #065f46; font-weight: 700; font-size: 14px; margin: 0 0 6px; }
    .inv-paid-line { color: #047857; font-size: 12px; margin: 2px 0; }
    .inv-paid-line b { color: #065f46; }

    .inv-footer { text-align: center; font-size: 11px; color: #94a3b8; margin-top: 8px; }
    .inv-footer a { color: #2563eb; text-decoration: none; }

    @media print { .inv-sheet { padding: 24px 32px; } }
`;

/**
 * Props:
 *  record        - Firestore doc data (visaApplication or policy)
 *  recordType    - 'visa' | 'insurance'
 *  onClose       - () => void
 */
export default function InvoiceModal({ record, recordType = 'visa', onClose }) {
    if (!record) return null;

    const isVisa = recordType === 'visa';

    const invoiceNumber = record.invoiceNumber
        || record.applicationNumber
        || record.policyNumber
        || record.orderId
        || '-';

    const applicantName  = record.applicantName || record.customerName || record.travelerName || '-';
    const email          = record.email || record.customerEmail || '-';
    const phone          = record.phone || record.customerMobile || record.mobileNumber || '-';
    const serviceType    = isVisa ? 'Visa Application' : 'Travel Insurance';
    const country        = record.country || '-';
    const visaType       = record.visaType || '';
    const amountPaid     = record.amountPaid || record.totalFee || record.amount || record.premium || 0;
    const transactionId  = record.transactionId || '-';
    const transactionRef = record.transactionRef || record.orderId || '-';
    const paymentMethod  = record.paymentMethod || 'Bank Alfalah';
    const paymentStatus  = record.paymentStatus || 'PAID';
    const paidAt         = record.paymentDateTime || record.applicationDate || record.purchaseDate || record.createdAt || null;

    const breakdown = isVisa
        ? [
            { label: 'Visa Fee', amount: record.visaFee || (amountPaid - (record.urgentFee || 0)) },
            record.urgentProcessing && { label: 'Urgent Processing Fee', amount: record.urgentFee || 0 },
        ].filter(Boolean)
        : [
            { label: record.planName ? `Insurance Premium - ${record.planName}` : 'Insurance Premium', amount: amountPaid },
        ];

    const handlePrint = () => {
        const printContent = document.getElementById('invoice-print-area').innerHTML;
        const w = window.open('', '_blank');
        w.document.write(`
            <html>
            <head>
                <title>Invoice #${invoiceNumber}</title>
                <style>${PRINT_CSS}</style>
            </head>
            <body>
                <div class="inv-sheet">${printContent}</div>
            </body>
            </html>
        `);
        w.document.close();
        w.focus();
        setTimeout(() => { w.print(); w.close(); }, 200);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto"
            >
                <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-6 py-4 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                            <MdReceipt className="text-blue-600 text-xl" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Payment Invoice</h2>
                            <p className="text-xs text-slate-500">#{invoiceNumber}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                        >
                            <MdPrint className="text-base" /> Print
                        </button>
                        <button
                            onClick={onClose}
                            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 transition text-slate-500"
                        >
                            <MdClose className="text-xl" />
                        </button>
                    </div>
                </div>

                {/* Screen view: Tailwind. Print view: rebuilt with inv-* classes by PRINT_CSS above. */}
                <div id="invoice-print-area" className="p-6 space-y-5">

                    <div className="inv-header bg-slate-900 rounded-xl p-5 flex items-center justify-between">
                        <div>
                            <p className="inv-brand-name text-white font-bold text-lg">O.S Travel &amp; Tours</p>
                            <p className="inv-brand-url text-slate-400 text-xs mt-0.5">www.ostravel.pk</p>
                        </div>
                        <div className="inv-header-right text-right">
                            <p className="inv-label text-slate-400 text-xs uppercase tracking-widest">Invoice</p>
                            <p className="inv-number text-white font-bold text-sm mt-0.5">#{invoiceNumber}</p>
                            <p className="inv-date text-slate-400 text-xs mt-0.5">{fmtDate(paidAt)}</p>
                        </div>
                    </div>

                    <div className="inv-grid grid grid-cols-2 gap-4">
                        <div className="inv-card bg-slate-50 rounded-xl p-4 border border-slate-100">
                            <p className="inv-card-title text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Billed To</p>
                            <p className="inv-card-name font-bold text-slate-900">{applicantName}</p>
                            <p className="inv-card-line text-sm text-slate-600 mt-0.5">{email}</p>
                            <p className="inv-card-line text-sm text-slate-600">{phone}</p>
                        </div>
                        <div className="inv-card bg-slate-50 rounded-xl p-4 border border-slate-100">
                            <p className="inv-card-title text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Service Details</p>
                            <p className="inv-card-name font-bold text-slate-900">{serviceType}</p>
                            {country && country !== '-' && <p className="inv-card-line text-sm text-slate-600 mt-0.5">Country: {country}</p>}
                            {visaType && <p className="inv-card-line text-sm text-slate-600">Type: {visaType}</p>}
                        </div>
                    </div>

                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                        <table className="inv-table w-full text-sm">
                            <thead className="bg-slate-100">
                                <tr>
                                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">Description</th>
                                    <th className="right text-right px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {breakdown.map((row, i) => (
                                    <tr key={i} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 text-slate-700">{row.label}</td>
                                        <td className="right px-4 py-3 text-right text-slate-700">PKR {fmt(row.amount)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="bg-slate-900">
                                    <td className="px-4 py-3.5 text-white font-bold">Total Paid</td>
                                    <td className="right px-4 py-3.5 text-right text-emerald-400 font-bold text-base">PKR {fmt(amountPaid)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    <div className="inv-paid-box bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
                        <span className="inv-paid-icon text-emerald-600 text-xl mt-0.5">&#10003;</span>
                        <div className="flex-1 min-w-0">
                            <p className="inv-paid-title font-bold text-emerald-800 text-sm">Payment {paymentStatus}</p>
                            <div className="mt-1.5 grid grid-cols-1 gap-0.5">
                                {transactionId && transactionId !== '-' && (
                                    <p className="inv-paid-line text-xs text-emerald-700"><b>Transaction ID:</b> {transactionId}</p>
                                )}
                                {transactionRef && transactionRef !== '-' && (
                                    <p className="inv-paid-line text-xs text-emerald-700"><b>Reference:</b> {transactionRef}</p>
                                )}
                                <p className="inv-paid-line text-xs text-emerald-700"><b>Method:</b> {paymentMethod}</p>
                            </div>
                        </div>
                    </div>

                    <p className="inv-footer text-center text-xs text-slate-400">
                        This is an automated invoice from O.S Travel &amp; Tours - <a href="https://www.ostravel.pk" className="text-blue-500 hover:underline">www.ostravel.pk</a>
                    </p>
                </div>

                <div className="px-6 py-4 border-t border-slate-200 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                    >
                        Close
                    </button>
                </div>
            </motion.div>
        </div>
    );
}