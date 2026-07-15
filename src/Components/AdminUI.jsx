// import React from "react";
// import {
//     HiOutlineMagnifyingGlassCircle, HiOutlineInboxStack, HiOutlineCalendarDays,
//     HiOutlineXMark,
// } from "react-icons/hi2";
// import {
//     MdOutlineCheckCircle, MdOutlineCancel, MdOutlineHourglassTop,
//     MdOutlineDescription, MdOutlinePendingActions,
// } from "react-icons/md";

// /* =========================================================
//    OSTRAVEL "CONTROL DECK" — shared admin design system
//    Used by AdminDashboard.jsx and SubAdminPanel.jsx
//    ========================================================= */

// /* ---------- Sidebar nav item ---------- */
// export function NavItem({ active, icon, label, badge, onClick }) {
//     return (
//         <button
//             data-active={active}
//             onClick={onClick}
//             className={`deck-nav-item w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-semibold ${
//                 active
//                     ? "bg-white/10 text-white shadow-inner"
//                     : "text-slate-300/70 hover:bg-white/5 hover:text-white"
//             }`}
//         >
//             <span className={`text-lg ${active ? "text-[var(--deck-gold-light)]" : "text-slate-400"}`}>{icon}</span>
//             <span className="flex-1 text-left tracking-wide">{label}</span>
//             {badge ? (
//                 <span className="text-[10px] font-black bg-[var(--deck-gold)] text-[#231704] px-2 py-0.5 rounded-full">
//                     {badge}
//                 </span>
//             ) : null}
//         </button>
//     );
// }

// /* ---------- KPI / Stat card ---------- */
// const toneMap = {
//     gold: { bg: "bg-[#FBF2DF]", text: "text-[#9A7420]", ring: "ring-[#F0DDAF]" },
//     teal: { bg: "bg-[#E4F5F4]", text: "text-[#0F8B8D]", ring: "ring-[#BFE7E5]" },
//     success: { bg: "bg-emerald-50", text: "text-emerald-700", ring: "ring-emerald-100" },
//     danger: { bg: "bg-rose-50", text: "text-rose-700", ring: "ring-rose-100" },
//     navy: { bg: "bg-[#EAEEF6]", text: "text-[var(--deck-navy)]", ring: "ring-[#D8DFEE]" },
//     warning: { bg: "bg-amber-50", text: "text-amber-700", ring: "ring-amber-100" },
// };

// export function StatCard({ icon, label, value, sub, tone = "navy" }) {
//     const t = toneMap[tone] || toneMap.navy;
//     return (
//         <div className="bg-white rounded-2xl border border-[var(--deck-line)] p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] hover:shadow-[0_4px_16px_rgba(16,24,40,0.06)] transition-shadow">
//             <div className="flex items-start justify-between mb-4">
//                 <span className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl ring-1 ${t.bg} ${t.text} ${t.ring}`}>
//                     {icon}
//                 </span>
//                 {sub ? (
//                     <span className="text-[10px] font-bold text-[var(--deck-muted)] bg-slate-50 border border-[var(--deck-line)] px-2 py-1 rounded-full">
//                         {sub}
//                     </span>
//                 ) : null}
//             </div>
//             <p className="text-[11px] font-bold text-[var(--deck-muted)] uppercase tracking-widest">{label}</p>
//             <h3 className="font-display text-[28px] leading-tight font-extrabold text-[var(--deck-ink)] mt-1">{value}</h3>
//         </div>
//     );
// }

// /* ---------- Section card wrapper ---------- */
// export function SectionCard({ title, icon, action, children, className = "" }) {
//     return (
//         <div className={`bg-white rounded-2xl border border-[var(--deck-line)] shadow-[0_1px_2px_rgba(16,24,40,0.04)] p-6 ${className}`}>
//             {(title || action) && (
//                 <div className="flex items-center justify-between mb-5">
//                     {title && (
//                         <h3 className="font-display text-[15px] font-extrabold text-[var(--deck-ink)] flex items-center gap-2">
//                             {icon && <span className="text-[var(--deck-gold)] text-lg">{icon}</span>}
//                             {title}
//                         </h3>
//                     )}
//                     {action}
//                 </div>
//             )}
//             {children}
//         </div>
//     );
// }

// /* ---------- Status stamp badge ---------- */
// const statusStyles = {
//     "Doc Received": { text: "text-sky-700", border: "border-sky-300", bg: "bg-sky-50", icon: <MdOutlineDescription /> },
//     "Analyzing": { text: "text-amber-700", border: "border-amber-300", bg: "bg-amber-50", icon: <MdOutlineHourglassTop /> },
//     "Approved": { text: "text-emerald-700", border: "border-emerald-300", bg: "bg-emerald-50", icon: <MdOutlineCheckCircle /> },
//     "Rejected": { text: "text-rose-700", border: "border-rose-300", bg: "bg-rose-50", icon: <MdOutlineCancel /> },
//     "Pending": { text: "text-slate-600", border: "border-slate-300", bg: "bg-slate-50", icon: <MdOutlinePendingActions /> },
//     "Investigating": { text: "text-amber-700", border: "border-amber-300", bg: "bg-amber-50", icon: <HiOutlineMagnifyingGlassCircle /> },
//     "Processing": { text: "text-sky-700", border: "border-sky-300", bg: "bg-sky-50", icon: <MdOutlineHourglassTop /> },
//     "Completed": { text: "text-emerald-700", border: "border-emerald-300", bg: "bg-emerald-50", icon: <MdOutlineCheckCircle /> },
//     "Cancelled": { text: "text-rose-700", border: "border-rose-300", bg: "bg-rose-50", icon: <MdOutlineCancel /> },
// };

// export function StatusStamp({ status }) {
//     const s = statusStyles[status] || statusStyles["Pending"];
//     return (
//         <span className={`deck-stamp inline-flex items-center gap-1.5 border-2 ${s.border} ${s.bg} ${s.text} text-[10px] font-extrabold uppercase px-3 py-1 rounded-lg`}>
//             {s.icon} {status || "Pending"}
//         </span>
//     );
// }

// /* ---------- Table shell ---------- */
// export function DeckTable({ head, children }) {
//     return (
//         <div className="overflow-x-auto">
//             <table className="w-full text-left border-collapse">
//                 <thead>
//                     <tr className="bg-[var(--deck-bg)]">
//                         {head.map((h) => (
//                             <th key={h} className="p-4 text-[10px] font-black text-[var(--deck-muted)] uppercase tracking-widest border-b border-[var(--deck-line)]">
//                                 {h}
//                             </th>
//                         ))}
//                     </tr>
//                 </thead>
//                 <tbody>{children}</tbody>
//             </table>
//         </div>
//     );
// }

// /* ---------- Empty state ---------- */
// export function EmptyState({ icon, title, subtitle }) {
//     return (
//         <div className="flex flex-col items-center justify-center text-center py-14 px-6 border-2 border-dashed border-[var(--deck-line)] rounded-2xl bg-slate-50/50">
//             <span className="text-4xl text-slate-300 mb-3">{icon || <HiOutlineInboxStack />}</span>
//             <p className="text-[var(--deck-ink)] font-bold">{title}</p>
//             {subtitle && <p className="text-sm text-[var(--deck-muted)] mt-1 max-w-sm">{subtitle}</p>}
//         </div>
//     );
// }

// /* ---------- Date range filter bar ---------- */
// export function DateRangeBar({ startDate, endDate, setStartDate, setEndDate }) {
//     return (
//         <div className="mb-6 flex flex-wrap items-end gap-4 bg-white p-4 rounded-2xl border border-[var(--deck-line)] shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
//             <div className="flex items-center gap-2 text-[var(--deck-navy)] pr-2">
//                 <HiOutlineCalendarDays className="text-xl text-[var(--deck-gold)]" />
//                 <span className="text-xs font-black uppercase tracking-wider text-[var(--deck-muted)]">Date range</span>
//             </div>
//             <div>
//                 <label className="block text-[10px] font-bold text-[var(--deck-muted)] uppercase tracking-wide mb-1">From</label>
//                 <input
//                     type="date"
//                     value={startDate}
//                     onChange={(e) => setStartDate(e.target.value)}
//                     className="px-3 py-2 border border-[var(--deck-line)] rounded-lg text-sm font-medium focus:ring-2 focus:ring-[var(--deck-gold)] outline-none"
//                 />
//             </div>
//             <div>
//                 <label className="block text-[10px] font-bold text-[var(--deck-muted)] uppercase tracking-wide mb-1">To</label>
//                 <input
//                     type="date"
//                     value={endDate}
//                     onChange={(e) => setEndDate(e.target.value)}
//                     className="px-3 py-2 border border-[var(--deck-line)] rounded-lg text-sm font-medium focus:ring-2 focus:ring-[var(--deck-gold)] outline-none"
//                 />
//             </div>
//             {(startDate || endDate) && (
//                 <button
//                     onClick={() => { setStartDate(''); setEndDate(''); }}
//                     className="flex items-center gap-1 px-3 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors"
//                 >
//                     <HiOutlineXMark /> Clear
//                 </button>
//             )}
//             <span className="ml-auto text-xs font-semibold text-[var(--deck-muted)] self-center">
//                 Showing {startDate || 'the start'} → {endDate || 'today'}
//             </span>
//         </div>
//     );
// }