// // src/Components/InvoiceModal.jsx
// // Reusable invoice viewer used in UserDashboardNew, AdminDashboard, SubAdminPanel.
// // Pass any visaApplication or policy Firestore doc as `record`.

// import React from 'react';
// import { motion } from 'framer-motion';
// import { MdClose, MdPrint, MdReceipt } from 'react-icons/md';

// // ── helpers ──────────────────────────────────────────────────────────────────
// const fmt = (n) => Number(n || 0).toLocaleString('en-PK');
// const fmtDate = (val) => {
//     if (!val) return 'N/A';
//     const d = val?.toDate ? val.toDate() : new Date(val);
//     return d.toLocaleString('en-PK', { dateStyle: 'long', timeStyle: 'short' });
// };

// // ── main component ────────────────────────────────────────────────────────────
// /**
//  * Props:
//  *  record        – Firestore doc data (visaApplication or policy)
//  *  recordType    – 'visa' | 'insurance'
//  *  onClose       – () => void
//  */
// export default function InvoiceModal({ record, recordType = 'visa', onClose }) {
//     if (!record) return null;

//     const isVisa = recordType === 'visa';

//     // ── derive invoice fields ──────────────────────────────────────────────
//     const invoiceNumber = record.invoiceNumber
//         || record.applicationNumber
//         || record.policyNumber
//         || record.orderId
//         || '—';

//     const applicantName  = record.applicantName || record.customerName || record.travelerName || '—';
//     const email          = record.email || record.customerEmail || '—';
//     const phone          = record.phone || record.customerMobile || '—';
//     const serviceType    = isVisa ? 'Visa Application' : 'Travel Insurance';
//     const country        = record.country || '—';
//     const visaType       = record.visaType || '';
//     const amountPaid     = record.amountPaid || record.totalFee || record.amount || 0;
//     const transactionId  = record.transactionId || '—';
//     const transactionRef = record.transactionRef || '—';
//     const paymentMethod  = record.paymentMethod || 'Bank Alfalah';
//     const paymentStatus  = record.paymentStatus || 'PAID';
//     const paidAt         = record.paymentDateTime || record.applicationDate || record.createdAt || null;

//     // fee breakdown
//     const breakdown = isVisa
//         ? [
//             { label: 'Visa Fee',            amount: record.visaFee || 0 },
//             record.urgentProcessing && { label: 'Urgent Processing Fee', amount: record.urgentFee || 0 },
//         ].filter(Boolean)
//         : [
//             { label: 'Insurance Premium', amount: amountPaid },
//         ];

//     // ── print handler ──────────────────────────────────────────────────────
//     const handlePrint = () => {
//         const printContent = document.getElementById('invoice-print-area').innerHTML;
//         const w = window.open('', '_blank');
//         w.document.write(`
//             <html><head><title>Invoice #${invoiceNumber}</title>
//             <style>
//                 body { font-family: Arial, sans-serif; margin: 0; padding: 24px; color: #1a1a1a; }
//                 table { width: 100%; border-collapse: collapse; }
//                 td, th { padding: 8px 12px; }
//                 .total-row td { background: #0f172a; color: #fff; font-weight: bold; }
//                 @media print { button { display: none; } }
//             </style></head>
//             <body>${printContent}</body></html>
//         `);
//         w.document.close();
//         w.focus();
//         w.print();
//         w.close();
//     };

//     return (
//         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
//             <motion.div
//                 initial={{ opacity: 0, scale: 0.95 }}
//                 animate={{ opacity: 1, scale: 1 }}
//                 exit={{ opacity: 0, scale: 0.95 }}
//                 className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto"
//             >
//                 {/* ── Modal header ── */}
//                 <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-6 py-4 border-b border-slate-200">
//                     <div className="flex items-center gap-3">
//                         <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
//                             <MdReceipt className="text-blue-600 text-xl" />
//                         </div>
//                         <div>
//                             <h2 className="text-lg font-bold text-slate-900">Payment Invoice</h2>
//                             <p className="text-xs text-slate-500">#{invoiceNumber}</p>
//                         </div>
//                     </div>
//                     <div className="flex items-center gap-2">
//                         <button
//                             onClick={handlePrint}
//                             className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
//                         >
//                             <MdPrint className="text-base" /> Print
//                         </button>
//                         <button
//                             onClick={onClose}
//                             className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 transition text-slate-500"
//                         >
//                             <MdClose className="text-xl" />
//                         </button>
//                     </div>
//                 </div>

//                 {/* ── Printable area ── */}
//                 <div id="invoice-print-area" className="p-6 space-y-5">

//                     {/* Company header */}
//                     <div className="bg-slate-900 rounded-xl p-5 flex items-center justify-between">
//                         <div>
//                             <p className="text-white font-bold text-lg">O.S Travel &amp; Tours</p>
//                             <p className="text-slate-400 text-xs mt-0.5">www.ostravel.pk</p>
//                         </div>
//                         <div className="text-right">
//                             <p className="text-slate-400 text-xs uppercase tracking-widest">Invoice</p>
//                             <p className="text-white font-bold text-sm mt-0.5">#{invoiceNumber}</p>
//                             <p className="text-slate-400 text-xs mt-0.5">{fmtDate(paidAt)}</p>
//                         </div>
//                     </div>

//                     {/* Billed to + service */}
//                     <div className="grid grid-cols-2 gap-4">
//                         <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
//                             <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Billed To</p>
//                             <p className="font-bold text-slate-900">{applicantName}</p>
//                             <p className="text-sm text-slate-600 mt-0.5">{email}</p>
//                             <p className="text-sm text-slate-600">{phone}</p>
//                         </div>
//                         <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
//                             <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Service Details</p>
//                             <p className="font-bold text-slate-900">{serviceType}</p>
//                             {country && country !== '—' && <p className="text-sm text-slate-600 mt-0.5">Country: {country}</p>}
//                             {visaType && <p className="text-sm text-slate-600">Type: {visaType}</p>}
//                         </div>
//                     </div>

//                     {/* Fee breakdown */}
//                     <div className="border border-slate-200 rounded-xl overflow-hidden">
//                         <table className="w-full text-sm">
//                             <thead className="bg-slate-100">
//                                 <tr>
//                                     <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">Description</th>
//                                     <th className="text-right px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">Amount</th>
//                                 </tr>
//                             </thead>
//                             <tbody className="divide-y divide-slate-100">
//                                 {breakdown.map((row, i) => (
//                                     <tr key={i} className="hover:bg-slate-50">
//                                         <td className="px-4 py-3 text-slate-700">{row.label}</td>
//                                         <td className="px-4 py-3 text-right text-slate-700">PKR {fmt(row.amount)}</td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                             <tfoot>
//                                 <tr className="bg-slate-900">
//                                     <td className="px-4 py-3.5 text-white font-bold">Total Paid</td>
//                                     <td className="px-4 py-3.5 text-right text-emerald-400 font-bold text-base">PKR {fmt(amountPaid)}</td>
//                                 </tr>
//                             </tfoot>
//                         </table>
//                     </div>

//                     {/* Payment confirmation */}
//                     <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
//                         <span className="text-emerald-600 text-xl mt-0.5">✅</span>
//                         <div className="flex-1 min-w-0">
//                             <p className="font-bold text-emerald-800 text-sm">Payment {paymentStatus}</p>
//                             <div className="mt-1.5 grid grid-cols-1 gap-0.5">
//                                 {transactionId && transactionId !== '—' && (
//                                     <p className="text-xs text-emerald-700"><span className="font-semibold">Transaction ID:</span> {transactionId}</p>
//                                 )}
//                                 {transactionRef && transactionRef !== '—' && (
//                                     <p className="text-xs text-emerald-700"><span className="font-semibold">Reference:</span> {transactionRef}</p>
//                                 )}
//                                 <p className="text-xs text-emerald-700"><span className="font-semibold">Method:</span> {paymentMethod}</p>
//                             </div>
//                         </div>
//                     </div>

//                     {/* Footer note */}
//                     <p className="text-center text-xs text-slate-400">
//                         This is an automated invoice from O.S Travel &amp; Tours · <a href="https://www.ostravel.pk" className="text-blue-500 hover:underline">www.ostravel.pk</a>
//                     </p>
//                 </div>

//                 {/* ── Modal footer ── */}
//                 <div className="px-6 py-4 border-t border-slate-200 flex justify-end">
//                     <button
//                         onClick={onClose}
//                         className="px-5 py-2 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
//                     >
//                         Close
//                     </button>
//                 </div>
//             </motion.div>
//         </div>
//     );
// }
