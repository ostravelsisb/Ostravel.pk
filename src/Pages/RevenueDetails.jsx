import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db, signOut } from "../firbase";
import { useAuth } from "../Context/AuthContext";
import { motion } from "framer-motion";
import {
    MdSearch, MdClear, MdReceipt, MdCalendarToday,
    MdLogout, MdMenu, MdArrowBack, MdPerson, MdEmail,
    MdVerifiedUser, MdOutlineContentCopy, MdCheck
} from "react-icons/md";
import { FaUserShield, FaRegPaperPlane, FaPassport, FaKaaba } from "react-icons/fa";
import LoadingSpinner from "../Components/LoadingSpinner";
import InvoiceModal from "../Components/InvoiceModal";

// ── Constants (mirror visa-section pattern) ───────────────────────────────────
const ITEMS_PER_PAGE = 10;

const SOURCE_STYLES = {
    Insurance: "bg-sky-50 text-sky-700 border-sky-200",
    Umrah: "bg-purple-50 text-purple-700 border-purple-200",
    Visa: "bg-orange-50 text-orange-700 border-orange-200",
};
const STATUS_STYLES = {
    PAID: "bg-emerald-50 text-emerald-600 border-emerald-100",
    ISSUED: "bg-sky-50 text-sky-600 border-sky-100",
    ACTIVE: "bg-emerald-50 text-emerald-600 border-emerald-100",
    PENDING: "bg-amber-50 text-amber-600 border-amber-100",
    DEFAULT: "bg-gray-100 text-gray-500 border-gray-200",
};

// ── Shared pagination (taken from AdminDashboard so visuals are identical) ────
function Pagination({ total, page, onChange }) {
    const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
    if (totalPages <= 1) return null;
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    return (
        <div className="flex items-center justify-center gap-1.5 pt-4 mt-2">
            <button onClick={() => onChange(page - 1)} disabled={page === 1}
                className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-orange-50 hover:text-orange-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-bold text-base">‹</button>
            {pages.map(p => (
                <button key={p} onClick={() => onChange(p)}
                    className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-bold border transition-all ${
                        p === page ? "bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-200" : "border-gray-200 text-gray-500 hover:bg-orange-50 hover:text-orange-500"
                    }`}>{p}</button>
            ))}
            <button onClick={() => onChange(page + 1)} disabled={page === totalPages}
                className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-orange-50 hover:text-orange-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-bold text-base">›</button>
            <span className="ml-3 text-[12px] font-bold text-gray-400">
                Page {page} of {totalPages} · {total} total
            </span>
        </div>
    );
}

// ── Sidebar (matches admin/sub-admin panel chrome) ────────────────────────────
function Sidebar({ sidebarCollapsed, setSidebarCollapsed, mobileOpen, setMobileOpen, onBack, backLabel, isSubAdmin }) {
    const navItems = [{ id: "back", label: backLabel || "Dashboard", icon: <FaRegPaperPlane /> }];

    return (
        <>
            {mobileOpen && (
                <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
            )}
            <aside className={`${sidebarCollapsed ? "lg:w-[70px]" : "lg:w-[200px]"} w-[220px] fixed lg:static inset-y-0 left-0 z-50 bg-white flex flex-col border-r border-gray-200 transition-all duration-300 shrink-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`} style={{ minHeight: "100vh" }}>
                <div className={`flex items-center gap-2 px-4 py-5 border-b border-gray-100 ${sidebarCollapsed ? "justify-center" : ""}`}>
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-400 rounded-lg flex items-center justify-center shrink-0 shadow shadow-orange-200">
                        <FaUserShield className="text-white text-base" />
                    </div>
                    {!sidebarCollapsed && (
                        <div>
                            <p className="text-base font-bold text-slate-800 leading-none">{isSubAdmin ? "Sub-Admin" : "OS Admin"}</p>
                            <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Travel Agency</p>
                        </div>
                    )}
                </div>

                <div className="flex-1 px-3 py-4 overflow-y-auto">
                    {!sidebarCollapsed && <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-3 px-2">Main</p>}
                    <nav className="space-y-0.5">
                        {navItems.map(item => (
                            <button key={item.id} onClick={onBack} title={sidebarCollapsed ? item.label : ""}
                                className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-base transition-colors text-gray-500 hover:bg-gray-50 hover:text-gray-700 font-medium ${sidebarCollapsed ? "justify-center" : ""}`}>
                                <span className="text-lg shrink-0 text-gray-400">{item.icon}</span>
                                {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                            </button>
                        ))}
                    </nav>
                    {!sidebarCollapsed && <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mt-6 mb-3 px-2">Account</p>}
                    <div className="space-y-0.5">
                        <button onClick={() => signOut()} title={sidebarCollapsed ? "Log out" : ""}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-base text-gray-500 hover:bg-gray-50 hover:text-gray-700 font-medium transition-all ${sidebarCollapsed ? "justify-center" : ""}`}>
                            <MdLogout className="text-lg shrink-0 text-gray-400" />
                            {!sidebarCollapsed && <span>Log out</span>}
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}

// ── Transaction card (mirrors VisaProcessList card aesthetic) ─────────────────
function TransactionCard({ tx, showEmail = true, onViewInvoice }) {
    const [copied, setCopied] = useState(false);
    const amount = Number(tx?.amount ?? tx?.amountPaid ?? 0) || 0;
    const date = tx?.purchaseDate?.toDate?.() || tx?.purchaseDate
        || tx?.orderDate?.toDate?.() || tx?.orderDate
        || tx?.createdAt?.toDate?.() || tx?.createdAt
        || tx?.applicationDate?.toDate?.() || tx?.applicationDate
        || null;
    const name = tx?.travelerName || tx?.customerName || tx?.userName || tx?.applicantName || tx?.Name || "Unknown";
    const email = tx?.userEmail || tx?.customerEmail || tx?.email || tx?.Email || "—";
    const policyNo = tx?.policyNumber || tx?.orderId || tx?.applicationNumber || tx?.requestNumber || "—";
    const planName = tx?.planName || tx?.planDetails?.PlanName
        || (tx?._source === "Visa" ? (tx?.visaType || "Visa Application")
        : tx?._source === "Umrah" ? (tx?.makkah?.hotel || "Umrah Package")
        : "Standard Plan");
    const source = tx?._source || "Insurance";
    const status = tx?.status || tx?.paymentStatus || "PAID";
    const statusKey = STATUS_STYLES[status?.toUpperCase?.()] ? status.toUpperCase() : "DEFAULT";

    const handleCopy = () => {
        navigator.clipboard?.writeText(policyNo);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}
            className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5 md:p-6 grid gap-4 md:grid-cols-[2.4fr_1fr_1fr_0.9fr] items-center">
            {/* Applicant + meta */}
            <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-3xl bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center text-orange-600 text-2xl font-black shadow-sm">
                    {name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="min-w-0">
                    <p className="text-lg font-bold text-slate-900 truncate">{name}</p>
                    {showEmail && <p className="text-sm text-slate-500 truncate">{email}</p>}
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] border ${
                            SOURCE_STYLES[source] || SOURCE_STYLES.Insurance
                        }`}>
                            <span className="w-2 h-2 rounded-full bg-current opacity-70" />
                            {source}
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 text-slate-700 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] border border-slate-200">
                            <span className="w-2 h-2 rounded-full bg-slate-400" />
                            {planName}
                        </span>
                    </div>
                </div>
            </div>

            {/* Policy details */}
            <div className="space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    {source === "Visa" ? "Order Ref" : source === "Umrah" ? "Request #" : "Policy"}
                </div>
                <button onClick={handleCopy} title="Copy to clipboard"
                    className="flex items-center gap-2 text-left group/copy">
                    {copied
                        ? <MdCheck className="text-emerald-500 shrink-0" />
                        : <MdOutlineContentCopy className="text-orange-400 shrink-0 group-hover/copy:text-orange-600 transition-colors" />}
                    <span className={`text-sm font-bold truncate transition-colors ${copied ? "text-emerald-600" : "text-slate-800 group-hover/copy:text-orange-600"}`}>
                        {copied ? "Copied!" : policyNo}
                    </span>
                </button>
                {tx?.transactionRef && tx.transactionRef !== policyNo && (
                    <div className="text-[11px] text-slate-400 truncate" title={tx.transactionRef}>Ref: {tx.transactionRef}</div>
                )}
            </div>

            {/* Amount */}
            <div className="space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Amount</div>
                <div className="flex items-center gap-2">
                    <MdReceipt className="text-emerald-500" />
                    <span className="text-lg font-bold text-slate-900">PKR {amount.toLocaleString()}</span>
                </div>
                {date && (
                    <div className="flex items-center gap-1 text-[11px] text-slate-400">
                        <MdCalendarToday className="text-[12px]" />
                        {date.toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" })}
                    </div>
                )}
            </div>

            {/* Status */}
            <div className="flex flex-col items-end justify-between gap-2">
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${STATUS_STYLES[statusKey]}`}>
                    {status}
                </span>
                <button onClick={() => onViewInvoice?.(tx)} title="View invoice"
                    className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 hover:bg-orange-500 hover:text-white transition-all shadow-sm">
                    <FaPassport className="text-base" />
                </button>
            </div>
        </motion.div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function RevenueDetails() {
    const navigate = useNavigate();
    const { userRole, userData, currentUser } = useAuth();
    const isSubAdmin = userRole === "subAdmin";
    const assignedCountries = userData?.assignedCountries || [];
    const backPath = isSubAdmin ? "/subadmin/dashboard" : "/admin/dashboard";

    const [policies, setPolicies] = useState([]);
    const [umrahPayments, setUmrahPayments] = useState([]);
    const [visaPayments, setVisaPayments] = useState([]);
    const [search, setSearch] = useState("");
    const [sourceFilter, setSourceFilter] = useState("All");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [invoiceRecord, setInvoiceRecord] = useState(null);

    // Realtime listeners
    useEffect(() => {
        const insuranceUnsub = onSnapshot(
            query(collection(db, "insurancesCustumer"), orderBy("purchaseDate", "desc")),
            (snap) => {
                const data = snap.docs.map(d => ({ id: d.id, _source: "Insurance", ...d.data() }));
                setPolicies(data);
                setLoading(false);
            },
            (e) => { console.error("insurancesCustumer onSnapshot error:", e); setLoading(false); }
        );
        // Umrah requests that have actually been paid (status: "Paid",
        // set by PaymentReturn.jsx once the gateway confirms the transaction).
        const umrahUnsub = onSnapshot(
            query(collection(db, "umrahApplications"), orderBy("applicationDate", "desc")),
            (snap) => {
                const data = snap.docs
                    .map(d => ({ id: d.id, _source: "Umrah", ...d.data() }))
                    .filter(u => (Number(u.amountPaid) || 0) > 0);
                setUmrahPayments(data);
            },
            (e) => { console.error("umrahApplications onSnapshot error:", e); }
        );
        // Visa applications that were actually paid for via the gateway
        // (PaymentReturn.jsx writes these straight into visaApplications,
        // not into the `policies` collection — so they need their own feed).
        const visaUnsub = onSnapshot(
            query(collection(db, "visaApplications"), orderBy("applicationDate", "desc")),
            (snap) => {
                const data = snap.docs
                    .map(d => ({ id: d.id, _source: "Visa", ...d.data() }))
                    .filter(v => (Number(v.amountPaid) || 0) > 0);
                setVisaPayments(data);
            },
            (e) => { console.error("visaApplications onSnapshot error:", e); }
        );
        return () => { insuranceUnsub(); umrahUnsub(); visaUnsub(); };
    }, []);

    // Helpers — read across both schemas
    const getCountry = (r) =>
        r?.country || r?.destinationCountry || r?.destination
        || r?.planDetails?.Country || r?.PlanDetails?.Country
        || r?.planDetails?.country
        || null;

    // Combine + (sub-admin) country filter
    const transactions = useMemo(() => {
        // Drop dev-only bypass test records (order IDs starting VISA-TEST-) —
        // these were never real payments, see PaymentReturn.jsx verifyPayment().
        const isRealPayment = (t) => !String(t?.orderId || "").startsWith("VISA-TEST-");
        const realPolicies = policies.filter(isRealPayment);
        const realUmrah = umrahPayments.filter(isRealPayment);
        const realVisas = visaPayments.filter(isRealPayment);
        if (!isSubAdmin) return [...realPolicies, ...realUmrah, ...realVisas];
        if (assignedCountries.length === 0) return [];
        // Sub-admins only see Insurance/Visa transactions for their assigned
        // countries — those records carry a country field. Umrah packages are
        // NOT country-scoped (no country field on umrahApplications docs), so
        // filtering them by country always produced zero results; instead gate
        // Umrah visibility by the same umrahAccess flag used everywhere else.
        const lower = assignedCountries.map(c => c.toLowerCase());
        const byCountry = (t) => {
            const c = getCountry(t);
            return c && lower.includes(String(c).toLowerCase());
        };
        return [
            ...realPolicies.filter(byCountry),
            ...(userData?.umrahAccess ? realUmrah : []),
            ...realVisas.filter(byCountry),
        ];
    }, [policies, umrahPayments, visaPayments, isSubAdmin, assignedCountries, userData?.umrahAccess]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return transactions.filter(t => {
            if (sourceFilter !== "All" && t._source !== sourceFilter) return false;
            const name = (t?.travelerName || t?.customerName || t?.userName || t?.applicantName || t?.Name || "").toLowerCase();
            const email = (t?.userEmail || t?.customerEmail || t?.email || t?.Email || "").toLowerCase();
            const pn = (t?.policyNumber || t?.orderId || t?.applicationNumber || "").toLowerCase();
            const plan = (t?.planName || t?.planDetails?.PlanName || "").toLowerCase();
            const matchSearch = !q || name.includes(q) || email.includes(q) || pn.includes(q) || plan.includes(q);
            if (!matchSearch) return false;
            const d = t?.purchaseDate?.toDate?.() || t?.purchaseDate
                || t?.orderDate?.toDate?.() || t?.orderDate
                || t?.createdAt?.toDate?.() || t?.createdAt
                || t?.applicationDate?.toDate?.() || t?.applicationDate;
            if (!d) return !startDate && !endDate;
            if (startDate && new Date(startDate) > d) return false;
            if (endDate) {
                const end = new Date(endDate); end.setHours(23, 59, 59);
                if (end < d) return false;
            }
            return true;
        });
    }, [transactions, search, sourceFilter, startDate, endDate]);

    const sortedFiltered = useMemo(() => {
        const getDate = (r) => r?.purchaseDate?.toDate?.() || r?.purchaseDate
            || r?.orderDate?.toDate?.() || r?.orderDate
            || r?.createdAt?.toDate?.() || r?.createdAt
            || r?.applicationDate?.toDate?.() || r?.applicationDate;
        return [...filtered].sort((a, b) => {
            const da = getDate(a); const dbb = getDate(b);
            if (!da && !dbb) return 0;
            if (!da) return 1;
            if (!dbb) return -1;
            return dbb - da;
        });
    }, [filtered]);

    const paginated = sortedFiltered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    // KPI row
    const totalRevenue = sortedFiltered.reduce((a, t) => a + (Number(t?.amount ?? t?.amountPaid ?? 0) || 0), 0);
    const sourceCounts = useMemo(() => {
        const c = { All: sortedFiltered.length, Insurance: 0, Umrah: 0, Visa: 0 };
        sortedFiltered.forEach(t => { c[t._source] = (c[t._source] || 0) + 1; });
        return c;
    }, [sortedFiltered]);

    useEffect(() => { setPage(1); }, [search, sourceFilter, startDate, endDate]);

    if (loading) return <LoadingSpinner />;

    const sourceOptions = ["All", "Insurance", "Umrah", "Visa"];

    return (
        <div className="flex h-screen bg-[#f5f5f5] overflow-hidden"
            style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif" }}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');`}</style>

            <Sidebar
                sidebarCollapsed={sidebarCollapsed}
                setSidebarCollapsed={setSidebarCollapsed}
                mobileOpen={mobileSidebarOpen}
                setMobileOpen={setMobileSidebarOpen}
                onBack={() => navigate(backPath)}
                backLabel="← Back to Dashboard"
                isSubAdmin={isSubAdmin}
            />

            <div className="flex-1 flex flex-col overflow-hidden">
                {/* TOP BAR */}
                <header className="h-[56px] bg-white border-b border-gray-200 flex items-center px-3 sm:px-6 shrink-0">
                    <button onClick={() => setMobileSidebarOpen(p => !p)}
                        className="w-8 h-8 flex lg:hidden items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors mr-2">
                        <MdMenu className="text-xl" />
                    </button>
                    <button onClick={() => setSidebarCollapsed(p => !p)}
                        className="w-8 h-8 hidden lg:flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors mr-4">
                        <MdMenu className="text-xl" />
                    </button>
                    <button onClick={() => navigate(backPath)}
                        className="flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-orange-500 transition-colors">
                        <MdArrowBack /> Back
                    </button>
                    <div className="flex-1" />
                    {isSubAdmin && (
                        <span className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 mr-2">
                            <MdVerifiedUser className="text-base" /> {assignedCountries.length} countries assigned
                        </span>
                    )}
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-base shadow shadow-orange-200">
                        {(currentUser?.email || "U")[0].toUpperCase()}
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#f7f8fa]">
                    {/* Page heading */}
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-7">
                        <h1 className="text-4xl font-bold text-slate-800 capitalize tracking-tight">
                            Revenue Details
                        </h1>
                        <p className="text-base text-gray-500 font-medium mt-1">
                            {isSubAdmin
                                ? `Showing purchases ${
                                    assignedCountries.length > 0
                                        ? `for your ${assignedCountries.length} assigned ${assignedCountries.length === 1 ? "country" : "countries"}`
                                        : "— no countries assigned yet"
                                }`
                                : "All purchases from insurance bookings, visa applications, and Umrah payments"}
                        </p>
                    </motion.div>

                    {/* KPI strip */}
                    <motion.div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-5"
                        initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}>
                        <motion.div variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
                            className="bg-[#FEE8E0] rounded-2xl p-5 border border-black/5">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-[#F97B4F] flex items-center justify-center text-white text-xl shadow-sm shadow-orange-300"><MdReceipt /></div>
                                <p className="text-base font-bold text-gray-600">Filtered Total</p>
                            </div>
                            <h3 className="text-3xl font-bold text-gray-800 mb-1">PKR {totalRevenue.toLocaleString()}</h3>
                            <p className="text-[13px] font-bold text-orange-600">of {sourceCounts.All} transactions</p>
                        </motion.div>
                        <motion.div variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
                            className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center text-sky-600 text-xl"><MdPerson /></div>
                                <p className="text-base font-bold text-gray-600">Insurance</p>
                            </div>
                            <h3 className="text-3xl font-bold text-gray-800 mb-1">{sourceCounts.Insurance || 0}</h3>
                            <p className="text-[13px] font-bold text-sky-600">Insurance bookings</p>
                        </motion.div>
                        <motion.div variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
                            className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 text-xl"><FaKaaba /></div>
                                <p className="text-base font-bold text-gray-600">Umrah</p>
                            </div>
                            <h3 className="text-3xl font-bold text-gray-800 mb-1">{sourceCounts.Umrah || 0}</h3>
                            <p className="text-[13px] font-bold text-purple-600">Umrah fees paid via gateway</p>
                        </motion.div>
                        <motion.div variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
                            className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 text-xl"><FaPassport /></div>
                                <p className="text-base font-bold text-gray-600">Visa</p>
                            </div>
                            <h3 className="text-3xl font-bold text-gray-800 mb-1">{sourceCounts.Visa || 0}</h3>
                            <p className="text-[13px] font-bold text-orange-600">Visa fees paid via gateway</p>
                        </motion.div>
                        <motion.div variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
                            className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 text-xl"><MdCalendarToday /></div>
                                <p className="text-base font-bold text-gray-600">Showing</p>
                            </div>
                            <h3 className="text-3xl font-bold text-gray-800 mb-1">{sortedFiltered.length}</h3>
                            <p className="text-[13px] font-bold text-slate-600">matching filters</p>
                        </motion.div>
                    </motion.div>

                    {/* Date Filters */}
                    <div className="mt-6 flex flex-wrap items-end gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <div>
                            <label className="block text-sm font-bold text-slate-500 mb-1">Start Date</label>
                            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                                className="px-3 py-2 border border-slate-200 rounded-lg text-base font-medium focus:ring-2 focus:ring-orange-400 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-500 mb-1">End Date</label>
                            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                                className="px-3 py-2 border border-slate-200 rounded-lg text-base font-medium focus:ring-2 focus:ring-orange-400 outline-none" />
                        </div>
                        {(startDate || endDate) && (
                            <button onClick={() => { setStartDate(''); setEndDate(''); }}
                                className="px-3 py-2 bg-slate-100 text-slate-600 rounded-lg text-base font-bold hover:bg-slate-200 transition-colors">
                                Clear Filters
                            </button>
                        )}
                    </div>

                    {/* Search */}
                    <div className="mt-4 flex items-center gap-2 bg-white px-4 py-3 rounded-2xl border border-gray-200 shadow-sm focus-within:ring-2 focus-within:ring-orange-400/40 focus-within:border-orange-300 transition-all">
                        <MdSearch className="text-gray-400 text-xl" />
                        <input value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Search by name, email, policy #, or plan..."
                            className="flex-1 text-base outline-none placeholder:text-gray-400 bg-transparent text-gray-700" />
                        {search && <button onClick={() => setSearch("")} className="text-gray-400 hover:text-orange-500"><MdClear /></button>}
                    </div>

                    {/* Source filter pills (visa-section style) */}
                    <div className="mt-4 bg-white rounded-2xl border border-gray-200 shadow-sm p-2 inline-flex gap-1.5 flex-wrap">
                        {sourceOptions.map(src => (
                            <button key={src} onClick={() => setSourceFilter(src)}
                                className={`px-4 py-2 text-sm font-bold rounded-xl transition-all ${
                                    sourceFilter === src
                                        ? "bg-orange-500 text-white shadow-md shadow-orange-200"
                                        : "hover:bg-gray-50 text-gray-500"
                                }`}>
                                {src}
                                <span className={`ml-1.5 text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                                    sourceFilter === src ? "bg-white/20 text-white" : "bg-gray-100 text-gray-400"
                                }`}>
                                    {sourceCounts[src] || 0}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Cards */}
                    <div className="mt-6 space-y-4">
                        {sortedFiltered.length === 0 ? (
                            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-14 text-center">
                                <div className="w-16 h-16 rounded-3xl bg-orange-50 flex items-center justify-center mx-auto mb-4">
                                    <MdReceipt className="text-orange-300 text-4xl" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">No purchases found</h3>
                                <p className="text-sm text-slate-500">
                                    {isSubAdmin && assignedCountries.length === 0
                                        ? "You have no countries assigned yet."
                                        : "Try clearing filters or broadening the date range."}
                                </p>
                            </div>
                        ) : paginated.map(tx => <TransactionCard key={tx._source + tx.id} tx={tx} showEmail={!isSubAdmin} onViewInvoice={setInvoiceRecord} />)}
                    </div>

                    <Pagination total={sortedFiltered.length} page={page} onChange={setPage} />
                </main>
            </div>

            {invoiceRecord && (
                <InvoiceModal
                    record={invoiceRecord}
                    recordType={invoiceRecord._source === "Visa" ? "visa" : invoiceRecord._source === "Umrah" ? "umrah" : "insurance"}
                    onClose={() => setInvoiceRecord(null)}
                />
            )}
        </div>
    );
}