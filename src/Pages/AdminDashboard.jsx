import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    MdDashboard, MdSecurity, MdMessage, MdLogout, MdMenu, MdClose,
    MdSearch, MdClear, MdChevronLeft, MdChevronRight, MdAnalytics,
    MdVisibility, MdCheckCircle, MdInfoOutline, MdLockOutline, MdLockOpen,
    MdFileDownload, MdNotificationsNone, MdSwapHoriz, MdReceipt,
    MdKeyboardArrowDown, MdOutlineContentCopy, MdOutlineCreditCard,
    MdInventory2, MdAddBox, MdBarChart, MdError, MdDescription,
    MdLogin, MdPersonAdd, MdPhone, MdEmail, MdHotel, MdAirplaneTicket,
    MdDirectionsBus, MdPerson, MdCalendarToday, MdSubject, MdChat,
    MdAdminPanelSettings, MdVerifiedUser, MdShield, MdDelete, MdEdit,
    MdMoreVert, MdFilterList, MdOpenInNew
} from "react-icons/md";
import { FaUserShield, FaKaaba, FaPassport, FaRegPaperPlane, FaUsersCog, FaMosque, FaBed, FaCar, FaEnvelope } from "react-icons/fa";
import { collection, query, getDocs, orderBy, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db, signOut } from "../firbase";
import { useAuth } from "../Context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
    RadialBarChart, RadialBar
} from "recharts";

// External Components
import DocumentViewer from "../Components/DocumentViewer";
import VisaAnalytics from "../Components/VisaAnalytics";
import SubAdminManagement from "../Components/SubAdminManagement";
import SubAdminActivityLog from "../Components/SubAdminActivityLog";
import EditHistoryModal from "../Components/EditHistoryModal";
import { toggleEditApproval, saveAdminMessage } from "../Utils/ApplicationEditUtils";
import { sendStatusChangeEmail, sendEditAccessEmail } from "../Utils/emailService";

// ─── MODERN STATUS DROPDOWN ──────────────────────────────────────────────────
const ModernStatusDropdown = ({ currentStatus, onChange, loading, isVisa = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = React.useRef(null);
    const options = isVisa
        ? ["Doc Received", "Analyzing", "Approved", "Rejected"]
        : ["Pending", "Investigating", "Processing", "Completed", "Cancelled"];

    const statusColors = isVisa ? {
        "Doc Received": { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200", dot: "bg-sky-500" },
        "Analyzing": { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-500" },
        "Approved": { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" },
        "Rejected": { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", dot: "bg-red-500" },
    } : {
        "Pending": { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-500" },
        "Investigating": { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", dot: "bg-blue-500" },
        "Processing": { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", dot: "bg-purple-500" },
        "Completed": { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" },
        "Cancelled": { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", dot: "bg-red-500" },
    };

    const currentColor = statusColors[currentStatus || (isVisa ? "Doc Received" : "Pending")];

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => !loading && setIsOpen(!isOpen)}
                disabled={loading}
                className={`appearance-none bg-gradient-to-r from-white to-gray-50 border-2 ${currentColor.border} rounded-xl px-4 py-1.5 text-[13px] font-bold ${currentColor.text} outline-none cursor-pointer transition-all duration-200 flex items-center gap-2 min-w-[140px] justify-between shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed`}
            >
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${currentColor.dot}`} />
                    <span>{currentStatus || (isVisa ? "Doc Received" : "Pending")}</span>
                </div>
                <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    {loading ? (
                        <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-current border-t-transparent" />
                    ) : (
                        <MdKeyboardArrowDown className="text-base" />
                    )}
                </motion.div>
            </motion.button>

            <AnimatePresence>
                {isOpen && !loading && (
                    <motion.div
                        initial={{ opacity: 0, y: -12, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -12, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden"
                    >
                        <div className="p-1.5 space-y-0.5">
                            {options.map(status => {
                                const colors = statusColors[status];
                                const isActive = currentStatus === status;
                                return (
                                    <motion.button
                                        key={status}
                                        whileHover={{ backgroundColor: isActive ? undefined : colors.bg }}
                                        onClick={() => {
                                            onChange({ target: { value: status } });
                                            setIsOpen(false);
                                        }}
                                        className={`w-full text-left px-4 py-2.5 rounded-lg text-[13px] font-bold transition-colors ${
                                            isActive
                                                ? `${colors.bg} ${colors.text} border-2 ${colors.border} shadow-md`
                                                : `text-gray-700 hover:${colors.bg}`
                                        }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2.5 h-2.5 rounded-full ${colors.dot}`} />
                                            {status}
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ─── ANIMATION VARIANTS ───────────────────────────────────────────────────────
const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } }
};
const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.07 } }
};

// ─── STATUS CONFIG ────────────────────────────────────────────────────────────
const UMRAH_STATUS_STYLES = {
    "Pending":       { dot: "bg-amber-400",   pill: "bg-amber-50 text-amber-600 border-amber-200" },
    "Investigating": { dot: "bg-blue-400",    pill: "bg-blue-50 text-blue-600 border-blue-200" },
    "Processing":    { dot: "bg-purple-400",  pill: "bg-purple-50 text-purple-600 border-purple-200" },
    "Completed":     { dot: "bg-emerald-400", pill: "bg-emerald-50 text-emerald-600 border-emerald-200" },
    "Cancelled":     { dot: "bg-red-400",     pill: "bg-red-50 text-red-500 border-red-200" },
};

// ─── SUB-COMPONENT: LIVE ACTION PANEL ────────────────────────────────────────
const LiveActionPanel = ({ item, collectionName, onLocalUpdate }) => {
    const [msg, setMsg] = useState(item.adminMessage || "");
    const [isSending, setIsSending] = useState(false);
    const [isToggling, setIsToggling] = useState(false);

    const handleToggle = async () => {
        const nextState = !item.editApproved;
        setIsToggling(true);
        try {
            await toggleEditApproval(item.id, collectionName, nextState, 'admin@ostravels.com');
            onLocalUpdate(item.id, { editApproved: nextState });
            if (collectionName === "visaApplications") {
                sendEditAccessEmail({
                    to: item.email,
                    applicantName: item.applicantName,
                    applicationNumber: item.applicationNumber,
                    country: item.country,
                    editEnabled: nextState,
                    reason: msg,
                });
            }
        } catch (e) { alert("Toggle failed"); }
        setIsToggling(false);
    };

    const handleSendMessage = async () => {
        if (!msg.trim()) return;
        setIsSending(true);
        try {
            await saveAdminMessage(item.id, collectionName, msg);
            onLocalUpdate(item.id, { adminMessage: msg });
            alert("Instruction sent to user dashboard");
        } catch (e) { alert("Message failed"); }
        setIsSending(false);
    };

    return (
        <div className="flex flex-col gap-2 min-w-[220px]">
            <div className="flex items-center justify-between bg-slate-50 p-1 rounded-lg border border-slate-200">
                <button
                    onClick={handleToggle}
                    disabled={isToggling}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-bold transition-all ${item.editApproved ? "bg-emerald-500 text-white shadow-md" : "bg-slate-200 text-slate-500"} ${isToggling ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {isToggling ? <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
                        : (item.editApproved ? <MdLockOpen className="text-base" /> : <MdLockOutline className="text-base" />)}
                    {isToggling ? "UPDATING..." : (item.editApproved ? "EDIT ENABLED" : "EDIT LOCKED")}
                </button>
                {item.userConfirmed && (
                    <span className="text-[11px] font-bold text-blue-600 animate-bounce pr-2">RE-SUBMITTED</span>
                )}
            </div>
            <div className="relative">
                <input
                    type="text"
                    placeholder="Why enable edit? (e.g. Invalid Passport)"
                    value={msg}
                    onChange={(e) => setMsg(e.target.value)}
                    disabled={isSending}
                    className="w-full pl-3 pr-9 py-2 text-[13px] border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
                />
                <button
                    onClick={handleSendMessage}
                    disabled={isSending || !msg.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSending ? <div className="animate-spin rounded-full h-3 w-3 border-2 border-blue-600 border-t-transparent"></div>
                        : <FaRegPaperPlane />}
                </button>
            </div>
        </div>
    );
};

// ─── SUB-COMPONENT: STATUS DROPDOWN ──────────────────────────────────────────
const StatusDropdown = ({ id, currentStatus, collectionName, onUpdate, isVisa = false, applicant }) => {
    const [loading, setLoading] = useState(false);

    const handleChange = async (e) => {
        const val = e.target.value;
        const oldStatus = currentStatus;
        setLoading(true);
        try {
            await updateDoc(doc(db, collectionName, id), { status: val, updatedAt: serverTimestamp() });
            onUpdate(id, { status: val });
            if (isVisa && applicant) {
                sendStatusChangeEmail({
                    to: applicant.email,
                    applicantName: applicant.applicantName,
                    applicationNumber: applicant.applicationNumber,
                    country: applicant.country,
                    visaType: applicant.visaType,
                    oldStatus,
                    newStatus: val,
                });
            }
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    return (
        <ModernStatusDropdown 
            currentStatus={currentStatus}
            onChange={handleChange}
            loading={loading}
            isVisa={isVisa}
        />
    );
};

// ─── UMRAH QUERIES TAB ────────────────────────────────────────────────────────
function UmrahQueriesTab({ inquiries, updateLocal }) {
    const [search, setSearch] = useState("");
    const [expandedId, setExpandedId] = useState(null);
    const [filterStatus, setFilterStatus] = useState("All");

    const statuses = ["All", "Pending", "Investigating", "Processing", "Completed", "Cancelled"];

    const filtered = useMemo(() => {
        return inquiries.filter(u => {
            const q = search.toLowerCase();
            const matchSearch = !q ||
                (u.user?.name || "").toLowerCase().includes(q) ||
                (u.user?.contact || "").toLowerCase().includes(q) ||
                (u.makkah?.hotel || "").toLowerCase().includes(q);
            const matchStatus = filterStatus === "All" || (u.status || "Pending") === filterStatus;
            return matchSearch && matchStatus;
        });
    }, [inquiries, search, filterStatus]);

    const counts = useMemo(() => {
        const c = { All: inquiries.length };
        ["Pending", "Investigating", "Processing", "Completed", "Cancelled"].forEach(s => {
            c[s] = inquiries.filter(u => (u.status || "Pending") === s).length;
        });
        return c;
    }, [inquiries]);

    return (
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-5">

            {/* Stats Row */}
            <motion.div variants={stagger} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: "Total Queries", value: inquiries.length, color: "bg-sky-50 text-sky-600", icon: <FaKaaba /> },
                    { label: "Pending", value: counts["Pending"] || 0, color: "bg-amber-50 text-amber-600", icon: <MdCalendarToday /> },
                    { label: "Processing", value: counts["Processing"] || 0, color: "bg-purple-50 text-purple-600", icon: <MdAirplaneTicket /> },
                    { label: "Completed", value: counts["Completed"] || 0, color: "bg-emerald-50 text-emerald-600", icon: <MdCheckCircle /> },
                ].map((s, i) => (
                    <motion.div key={i} variants={fadeUp}
                        whileHover={{ y: -3, boxShadow: "0 12px 24px -8px rgba(0,0,0,0.12)" }}
                        className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${s.color}`}>{s.icon}</span>
                            <span className="text-3xl font-bold text-gray-800">{s.value}</span>
                        </div>
                        <p className="text-sm font-semibold text-gray-400">{s.label}</p>
                    </motion.div>
                ))}
            </motion.div>

            {/* Search + Filter */}
            <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex items-center gap-2 flex-1 px-3 py-2.5 border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-orange-400/40 focus-within:border-orange-300 transition-all">
                        <MdSearch className="text-gray-400 text-xl shrink-0" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search by name, contact, hotel..."
                            className="flex-1 text-sm outline-none placeholder:text-gray-400 bg-transparent text-gray-700"
                        />
                        {search && <button onClick={() => setSearch("")} className="text-gray-400 hover:text-orange-500"><MdClear /></button>}
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {statuses.map(s => (
                            <button key={s}
                                onClick={() => setFilterStatus(s)}
                                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${filterStatus === s
                                    ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                                    : "bg-white text-gray-500 border-gray-200 hover:border-orange-300 hover:text-orange-500"}`}
                            >
                                {s} {counts[s] !== undefined ? `(${counts[s]})` : ""}
                            </button>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Cards */}
            <motion.div variants={stagger} className="space-y-3">
                {filtered.length === 0 ? (
                    <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-16 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-sky-50 flex items-center justify-center mx-auto mb-3">
                            <FaKaaba className="text-sky-300 text-2xl" />
                        </div>
                        <p className="text-gray-500 font-bold">No queries found</p>
                        <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filter</p>
                    </motion.div>
                ) : filtered.map((u, idx) => {
                    const isOpen = expandedId === u.id;
                    const statusStyle = UMRAH_STATUS_STYLES[u.status || "Pending"] || UMRAH_STATUS_STYLES["Pending"];

                    return (
                        <motion.div key={u.id} variants={fadeUp} layout
                            className={`bg-white rounded-2xl border transition-all duration-200 shadow-sm overflow-hidden ${isOpen ? "border-orange-200 shadow-orange-100/60 shadow-md" : "border-gray-200 hover:border-gray-300 hover:shadow-md"}`}
                        >
                            {/* Card Header */}
                            <div className="flex items-stretch">
                                {/* Color accent bar */}
                                <div className={`w-1 shrink-0 rounded-l-2xl ${isOpen ? "bg-orange-400" : "bg-transparent"} transition-colors`} />

                                <div className="flex-1 p-5">
                                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">

                                        {/* Index + Client */}
                                        <div className="flex items-center gap-3 lg:w-52 shrink-0">
                                            <span className="w-8 h-8 rounded-xl bg-sky-50 text-sky-500 text-sm font-bold flex items-center justify-center shrink-0">
                                                {idx + 1}
                                            </span>
                                            <div className="min-w-0">
                                                <p className="font-bold text-gray-800 truncate">{u.user?.name || "Unknown Client"}</p>
                                                <p className="text-xs text-gray-400 font-medium flex items-center gap-1 mt-0.5">
                                                    <MdPhone className="text-gray-300" /> {u.user?.contact || "—"}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Hotel Info */}
                                        <div className="flex items-center gap-2 lg:w-52 shrink-0 min-w-0">
                                            <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                                                <MdHotel className="text-orange-400 text-base" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-gray-700 truncate">{u.makkah?.hotel || "—"}</p>
                                                <p className="text-xs text-blue-500 font-semibold mt-0.5">{u.makkah?.checkIn} → {u.makkah?.checkOut}</p>
                                            </div>
                                        </div>

                                        {/* Details chips */}
                                        <div className="flex flex-wrap gap-2 flex-1">
                                            {u.transport?.vehicleType && (
                                                <span className="flex items-center gap-1 text-xs font-bold text-gray-500 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-full">
                                                    <MdDirectionsBus className="text-gray-400" /> {u.transport.vehicleType}
                                                </span>
                                            )}
                                            {u.makkah?.rooms && (
                                                <span className="flex items-center gap-1 text-xs font-bold text-gray-500 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-full">
                                                    <FaBed className="text-gray-400" /> {u.makkah.rooms} Rooms
                                                </span>
                                            )}
                                            {u.makkah?.guests && (
                                                <span className="flex items-center gap-1 text-xs font-bold text-gray-500 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-full">
                                                    <MdPerson className="text-gray-400" /> {u.makkah.guests} Guests
                                                </span>
                                            )}
                                        </div>

                                        {/* Status + Toggle */}
                                        <div className="flex items-center gap-3 shrink-0">
                                            <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${statusStyle.pill}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`}></span>
                                                {u.status || "Pending"}
                                            </span>
                                            <button
                                                onClick={() => setExpandedId(isOpen ? null : u.id)}
                                                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all ${isOpen
                                                    ? "bg-orange-500 text-white"
                                                    : "border border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-500"}`}
                                            >
                                                <MdEdit className="text-base" />
                                                {isOpen ? "Close" : "Update"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Expandable Update Panel */}
                            <AnimatePresence>
                                {isOpen && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.25 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-5 pb-5 pt-3 bg-orange-50/40 border-t border-orange-100 flex flex-col sm:flex-row sm:items-center gap-4">
                                            <div className="flex items-center gap-3">
                                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Status</label>
                                                <StatusDropdown
                                                    id={u.id}
                                                    currentStatus={u.status}
                                                    collectionName="umardet"
                                                    onUpdate={(id, up) => updateLocal('umrah', id, up)}
                                                />
                                            </div>
                                            <div className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-400">
                                                <MdChat className="shrink-0 text-orange-300" />
                                                <span className="italic">Client notes / admin memo area</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}
            </motion.div>
        </motion.div>
    );
}

// ─── MESSAGES TAB ─────────────────────────────────────────────────────────────
function MessagesTab({ messages }) {
    const [search, setSearch] = useState("");
    const [selectedMsg, setSelectedMsg] = useState(null);

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        if (!q) return messages;
        return messages.filter(m =>
            (m.name || "").toLowerCase().includes(q) ||
            (m.email || "").toLowerCase().includes(q) ||
            (m.subject || "").toLowerCase().includes(q) ||
            (m.message || "").toLowerCase().includes(q)
        );
    }, [messages, search]);

    const formatDate = (ts) => {
        if (!ts) return "—";
        const d = ts.toDate ? ts.toDate() : new Date(ts);
        return d.toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" });
    };

    const formatTime = (ts) => {
        if (!ts) return "";
        const d = ts.toDate ? ts.toDate() : new Date(ts);
        return d.toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" });
    };

    return (
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-5">

            {/* Stats */}
            <motion.div variants={stagger} className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                    { label: "Total Messages", value: messages.length, bg: "bg-amber-50", icon: <MdMessage className="text-amber-500" /> },
                    { label: "This Week", value: messages.filter(m => { const d = m.createdAt?.toDate ? m.createdAt.toDate() : new Date(m.createdAt); return (Date.now() - d) < 7 * 86400000; }).length, bg: "bg-blue-50", icon: <MdCalendarToday className="text-blue-400" /> },
                    { label: "Unread", value: messages.filter(m => !m.read).length, bg: "bg-orange-50", icon: <FaEnvelope className="text-orange-400" /> },
                ].map((s, i) => (
                    <motion.div key={i} variants={fadeUp}
                        whileHover={{ y: -3, boxShadow: "0 12px 24px -8px rgba(0,0,0,0.12)" }}
                        className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${s.bg}`}>{s.icon}</span>
                            <span className="text-3xl font-bold text-gray-800">{s.value}</span>
                        </div>
                        <p className="text-sm font-semibold text-gray-400">{s.label}</p>
                    </motion.div>
                ))}
            </motion.div>

            {/* Search */}
            <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
                <div className="flex items-center gap-2 px-3 py-2.5 border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-orange-400/40 focus-within:border-orange-300 transition-all">
                    <MdSearch className="text-gray-400 text-xl shrink-0" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search by name, email, subject or message..."
                        className="flex-1 text-sm outline-none placeholder:text-gray-400 bg-transparent text-gray-700"
                    />
                    {search && <button onClick={() => setSearch("")} className="text-gray-400 hover:text-orange-500"><MdClear /></button>}
                </div>
            </motion.div>

            {/* Two-column layout: list + detail */}
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">

                {/* Message List */}
                <motion.div variants={stagger} className="xl:col-span-2 space-y-2">
                    {filtered.length === 0 ? (
                        <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
                            <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-3">
                                <MdMessage className="text-amber-300 text-2xl" />
                            </div>
                            <p className="text-gray-500 font-bold">No messages found</p>
                        </motion.div>
                    ) : filtered.map((m, idx) => (
                        <motion.button
                            key={m.id}
                            variants={fadeUp}
                            layout
                            onClick={() => setSelectedMsg(selectedMsg?.id === m.id ? null : m)}
                            whileHover={{ x: 2 }}
                            whileTap={{ scale: 0.98 }}
                            className={`w-full text-left rounded-2xl border p-4 transition-all shadow-sm ${selectedMsg?.id === m.id
                                ? "bg-orange-50 border-orange-300 shadow-orange-100/60"
                                : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-md"}`}
                        >
                            <div className="flex items-start gap-3">
                                {/* Avatar initial */}
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm">
                                    {(m.name || "?")[0].toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="font-bold text-gray-800 truncate text-sm">{m.name || "Unknown"}</p>
                                        <span className="text-[11px] text-gray-400 font-medium shrink-0">{formatDate(m.createdAt)}</span>
                                    </div>
                                    <p className="text-xs text-blue-500 font-semibold truncate mt-0.5">{m.email}</p>
                                    <p className="text-xs font-bold text-gray-600 truncate mt-1">{m.subject || "No Subject"}</p>
                                    <p className="text-xs text-gray-400 truncate mt-0.5 leading-relaxed">{m.message}</p>
                                </div>
                            </div>
                        </motion.button>
                    ))}
                </motion.div>

                {/* Detail Panel */}
                <div className="xl:col-span-3">
                    <AnimatePresence mode="wait">
                        {selectedMsg ? (
                            <motion.div
                                key={selectedMsg.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.25 }}
                                className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden h-full"
                            >
                                {/* Header */}
                                <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-orange-50">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                                                {(selectedMsg.name || "?")[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800 text-lg">{selectedMsg.name}</p>
                                                <p className="text-sm text-blue-500 font-semibold">{selectedMsg.email}</p>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-xs font-bold text-gray-400">{formatDate(selectedMsg.createdAt)}</p>
                                            <p className="text-xs text-gray-300 mt-0.5">{formatTime(selectedMsg.createdAt)}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Subject */}
                                <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Subject</p>
                                    <p className="font-bold text-gray-800">{selectedMsg.subject || "No Subject"}</p>
                                </div>

                                {/* Message Body */}
                                <div className="p-6">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Message</p>
                                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{selectedMsg.message}</p>
                                    </div>
                                </div>

                                {/* Reply CTA */}
                                <div className="px-6 pb-6">
                                    <a
                                        href={`mailto:${selectedMsg.email}?subject=Re: ${selectedMsg.subject || ''}`}
                                        className="flex items-center justify-center gap-2 w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors shadow-sm shadow-orange-200"
                                    >
                                        <FaRegPaperPlane /> Reply via Email
                                    </a>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="bg-white rounded-2xl border border-dashed border-gray-200 h-full min-h-[300px] flex flex-col items-center justify-center p-10 text-center"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-3">
                                    <MdMessage className="text-amber-300 text-2xl" />
                                </div>
                                <p className="font-bold text-gray-500">Select a message to read</p>
                                <p className="text-sm text-gray-400 mt-1">Click any message on the left to view details</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
}

// ─── SUB-ADMINS TAB ───────────────────────────────────────────────────────────
function SubAdminsTab() {
    // Uses the external SubAdminManagement component but wraps it in our design system
    return (
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-5">

            {/* Header Card */}
            <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-md shadow-orange-200">
                            <FaUsersCog className="text-white text-xl" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Sub-Admin Management</h2>
                            <p className="text-sm text-gray-400 font-medium mt-0.5">Manage team access and permissions</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                            <MdVerifiedUser className="text-base" /> Secured Panel
                        </div>
                    </div>
                </div>

                {/* Permission legend */}
                <div className="mt-5 pt-5 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { label: "View Only", icon: <MdVisibility />, color: "text-blue-400 bg-blue-50" },
                        { label: "Edit Access", icon: <MdEdit />, color: "text-amber-400 bg-amber-50" },
                        { label: "Full Access", icon: <MdAdminPanelSettings />, color: "text-orange-400 bg-orange-50" },
                        { label: "Super Admin", icon: <MdShield />, color: "text-purple-400 bg-purple-50" },
                    ].map((p, i) => (
                        <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 border border-gray-100">
                            <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-base ${p.color}`}>{p.icon}</span>
                            <span className="text-xs font-bold text-gray-600">{p.label}</span>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* SubAdminManagement component wrapped in card */}
            <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <SubAdminManagement />
            </motion.div>
        </motion.div>
    );
}

// ─── MAIN ADMIN DASHBOARD ─────────────────────────────────────────────────────
export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState("overview");
    const [visas, setVisas] = useState([]);
    const [policies, setPolicies] = useState([]);
    const [messages, setMessages] = useState([]);
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [historyVisa, setHistoryVisa] = useState(null);
    const [visaQuickFilter, setVisaQuickFilter] = useState("");
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [showNotifDropdown, setShowNotifDropdown] = useState(false);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const notifRef = React.useRef(null);
    const profileRef = React.useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifDropdown(false);
            if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfileDropdown(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [v, p, m, i] = await Promise.all([
                    getDocs(query(collection(db, "visaApplications"), orderBy("applicationDate", "desc"))),
                    getDocs(query(collection(db, "insurancesCustumer"), orderBy("purchaseDate", "desc"))),
                    getDocs(query(collection(db, "contact_messages"), orderBy("createdAt", "desc"))),
                    getDocs(query(collection(db, "umardet"), orderBy("createdAt", "desc")))
                ]);
                setVisas(v.docs.map(d => ({ id: d.id, ...d.data() })));
                setPolicies(p.docs.map(d => ({ id: d.id, ...d.data() })));
                setMessages(m.docs.map(d => ({ id: d.id, ...d.data() })));
                setInquiries(i.docs.map(d => ({ id: d.id, ...d.data() })));
            } catch (e) { console.error(e); }
            setLoading(false);
        };
        fetchData();
    }, []);

    const updateLocal = (type, id, updates) => {
        if (type === 'visa') setVisas(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));
        if (type === 'policy') setPolicies(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
        if (type === 'umrah') setInquiries(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
    };

    const stats = useMemo(() => ({
        revenue: policies.reduce((a, b) => a + (Number(b.amount) || 0), 0),
        pending: visas.filter(v => v.status === "Doc Received").length,
        approved: visas.filter(v => v.status === "Approved").length,
        rejected: visas.filter(v => v.status === "Rejected").length,
    }), [visas, policies]);

    const parseDate = (d) => {
        if (!d) return null;
        if (d.toDate) return d.toDate();
        return new Date(d);
    };

    const isWithinDateRange = (dateObj) => {
        if (!startDate && !endDate) return true;
        const d = parseDate(dateObj);
        if (!d) return false;
        const start = startDate ? new Date(startDate) : new Date('1970-01-01');
        const end = endDate ? new Date(endDate) : new Date();
        end.setHours(23, 59, 59);
        return d >= start && d <= end;
    };

    const filteredVisas = useMemo(() => visas.filter(v => isWithinDateRange(v.applicationDate)), [visas, startDate, endDate]);
    const filteredInquiries = useMemo(() => inquiries.filter(i => isWithinDateRange(i.createdAt)), [inquiries, startDate, endDate]);
    const filteredMessages = useMemo(() => messages.filter(m => isWithinDateRange(m.createdAt)), [messages, startDate, endDate]);

    const weeklyOverview = useMemo(() => {
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const totals = days.map(d => ({ day: d, applications: 0, revenue: 0 }));
        visas.forEach(v => { const d = parseDate(v.applicationDate); if (d) totals[d.getDay()].applications += 1; });
        policies.forEach(p => { const d = parseDate(p.purchaseDate); if (d) totals[d.getDay()].revenue += (Number(p.amount) || 0) / 1000; });
        return totals;
    }, [visas, policies]);

    const donutData = useMemo(() => {
        const approved = visas.filter(v => v.status === "Approved").length;
        const pending = visas.filter(v => v.status === "Doc Received" || v.status === "Analyzing").length;
        const rejected = visas.filter(v => v.status === "Rejected").length;
        const total = approved + pending + rejected;
        return {
            total, approved, pending, rejected,
            approvedPct: total ? Math.round((approved / total) * 100) : 0,
            pendingPct: total ? Math.round((pending / total) * 100) : 0,
            chart: [
                { name: "Approved", value: approved || 0.0001, color: "#22C55E" },
                { name: "Pending", value: pending || 0.0001, color: "#F97316" },
                { name: "Rejected", value: rejected || 0.0001, color: "#E2E8F0" },
            ],
        };
    }, [visas]);

    const recentActivity = useMemo(() => {
        const items = [
            ...visas.map(v => ({ id: v.id, type: "visa", title: v.applicantName, sub: `${v.country} • ${v.visaType}`, date: v.applicationDate, status: v.status })),
            ...inquiries.map(u => ({ id: u.id, type: "umrah", title: u.user?.name, sub: u.makkah?.hotel, date: u.createdAt, status: u.status })),
        ];
        return items.filter(i => parseDate(i.date)).sort((a, b) => parseDate(b.date) - parseDate(a.date)).slice(0, 6);
    }, [visas, inquiries]);

    const goToVisas = (statusText = "") => { setVisaQuickFilter(statusText); setActiveTab("visas"); };

    const navItems = [
        { id: "overview", label: "Dashboard", icon: <MdDashboard /> },
        { id: "visas", label: "Visas", icon: <FaPassport /> },
        { id: "inquiries", label: "Umrah Queries", icon: <FaKaaba /> },
        { id: "messages", label: "Messages", icon: <MdMessage /> },
        { id: "subadmins", label: "Sub-Admins", icon: <FaUsersCog /> },
    ];

    const pageTitle = activeTab === "overview" ? "Dashboard" : navItems.find(n => n.id === activeTab)?.label || activeTab;
    const pageSubtitle = {
        overview: "Your travel agency overview",
        visas: "Manage and process all visa applications",
        inquiries: "Track Umrah package inquiries and bookings",
        messages: "Customer messages and support requests",
        subadmins: "Team access control and permissions",
    }[activeTab] || "\u00A0";

    return (
        <div className="flex h-screen bg-[#f5f5f5] overflow-hidden"
            style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif" }}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');`}</style>

            {/* ─── SIDEBAR ─────────────────────────────────────────── */}
            <aside className={`${sidebarCollapsed ? "w-[70px]" : "w-[200px]"} bg-white flex flex-col border-r border-gray-200 transition-all duration-300 shrink-0`} style={{ minHeight: "100vh" }}>
                <div className={`flex items-center gap-2 px-4 py-5 border-b border-gray-100 ${sidebarCollapsed ? "justify-center" : ""}`}>
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-400 rounded-lg flex items-center justify-center shrink-0 shadow shadow-orange-200">
                        <FaUserShield className="text-white text-base" />
                    </div>
                    {!sidebarCollapsed && (
                        <div>
                            <p className="text-base font-bold text-slate-800 leading-none">OS Admin</p>
                            <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Travel Agency</p>
                        </div>
                    )}
                </div>

                <div className="flex-1 px-3 py-4 overflow-y-auto">
                    {!sidebarCollapsed && <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-3 px-2">Main</p>}
                    <nav className="space-y-0.5">
                        {navItems.map(item => {
                            const isActive = activeTab === item.id;
                            return (
                                <motion.button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    title={sidebarCollapsed ? item.label : ""}
                                    whileHover={{ x: sidebarCollapsed ? 0 : 3 }}
                                    whileTap={{ scale: 0.97 }}
                                    className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-base transition-colors group ${isActive ? "bg-orange-50 text-orange-500 font-bold" : "text-gray-500 hover:bg-gray-50 hover:text-gray-700 font-medium"} ${sidebarCollapsed ? "justify-center" : ""}`}
                                >
                                    {isActive && (
                                        <motion.span layoutId="admin-nav-indicator"
                                            className="absolute left-0 top-1 bottom-1 w-1 rounded-full bg-orange-500"
                                            transition={{ type: "spring", stiffness: 400, damping: 30 }} />
                                    )}
                                    <span className={`text-lg shrink-0 ${isActive ? "text-orange-500" : "text-gray-400 group-hover:text-gray-600"}`}>{item.icon}</span>
                                    {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                                </motion.button>
                            );
                        })}
                    </nav>

                    {!sidebarCollapsed && <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mt-6 mb-3 px-2">Account</p>}
                    {sidebarCollapsed && <div className="my-4 border-t border-gray-100" />}
                    <div className="space-y-0.5">
                        <button onClick={() => signOut()} title={sidebarCollapsed ? "Log out" : ""}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-base text-gray-500 hover:bg-gray-50 hover:text-gray-700 font-medium transition-all ${sidebarCollapsed ? "justify-center" : ""}`}>
                            <MdLogout className="text-lg shrink-0 text-gray-400" />
                            {!sidebarCollapsed && <span>Log out</span>}
                        </button>
                    </div>
                </div>
            </aside>

            {/* ─── MAIN AREA ───────────────────────────────────────── */}
            <div className="flex-1 flex flex-col overflow-hidden">

                {/* TOP BAR */}
                <header className="h-[56px] bg-white border-b border-gray-200 flex items-center px-6 shrink-0">
                    <button onClick={() => setSidebarCollapsed(p => !p)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors mr-4">
                        <MdMenu className="text-xl" />
                    </button>
                    <div className="flex-1" />
                    <div className="flex items-center gap-3">
                        {/* Bell */}
                        <div className="relative" ref={notifRef}>
                            <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
                                onClick={() => { setShowNotifDropdown(p => !p); setShowProfileDropdown(false); }}
                                className="relative w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 transition-colors">
                                <MdNotificationsNone className="text-2xl" />
                                {visas.filter(v => v.userConfirmed).length > 0 && (
                                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, delay: 0.3 }}
                                        className="absolute -top-1 -right-1 bg-red-500 text-white text-[11px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                        {visas.filter(v => v.userConfirmed).length > 9 ? "9+" : visas.filter(v => v.userConfirmed).length}
                                    </motion.span>
                                )}
                            </motion.button>
                            <AnimatePresence>
                                {showNotifDropdown && (
                                    <motion.div initial={{ opacity: 0, y: -8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -8, scale: 0.97 }} transition={{ duration: 0.15 }}
                                        className="absolute right-0 top-11 w-80 bg-white rounded-2xl border border-gray-200 shadow-xl z-50 overflow-hidden">
                                        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                                            <h4 className="text-base font-bold text-gray-800">Notifications</h4>
                                            <span className="text-[12px] font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">{visas.filter(v => v.userConfirmed).length} New</span>
                                        </div>
                                        <div className="max-h-80 overflow-y-auto">
                                            {visas.filter(v => v.userConfirmed).length === 0 ? (
                                                <div className="p-6 text-center">
                                                    <MdNotificationsNone className="text-gray-200 text-4xl mx-auto mb-2" />
                                                    <p className="text-sm text-gray-400 font-bold">No new notifications</p>
                                                </div>
                                            ) : visas.filter(v => v.userConfirmed).slice(0, 8).map(v => (
                                                <button key={v.id} onClick={() => { setSelectedDoc(v); setShowNotifDropdown(false); }}
                                                    className="w-full text-left px-4 py-3 hover:bg-orange-50 transition-colors border-b border-gray-50 last:border-0 flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0"><FaPassport className="text-orange-500 text-sm" /></div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-bold text-gray-800 truncate">{v.applicantName || "Applicant"}</p>
                                                        <p className="text-[12px] text-gray-400 truncate">{v.country} • Re-submitted for review</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                        {visas.filter(v => v.userConfirmed).length > 0 && (
                                            <button onClick={() => { setActiveTab("visas"); setShowNotifDropdown(false); }}
                                                className="w-full text-center text-sm font-bold text-orange-500 py-2.5 border-t border-gray-100 hover:bg-orange-50 transition-colors">
                                                View All Applications
                                            </button>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Avatar */}
                        <div className="relative" ref={profileRef}>
                            <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
                                onClick={() => { setShowProfileDropdown(p => !p); setShowNotifDropdown(false); }}
                                className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-base shadow shadow-orange-200 cursor-pointer overflow-hidden">
                                {(currentUser?.email || "A")[0].toUpperCase()}
                            </motion.button>
                            <AnimatePresence>
                                {showProfileDropdown && (
                                    <motion.div initial={{ opacity: 0, y: -8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -8, scale: 0.97 }} transition={{ duration: 0.15 }}
                                        className="absolute right-0 top-11 w-64 bg-white rounded-2xl border border-gray-200 shadow-xl z-50 overflow-hidden">
                                        <div className="p-4 border-b border-gray-100 bg-gradient-to-br from-orange-50 to-amber-50 flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-base shrink-0">
                                                {(currentUser?.email || "A")[0].toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-base font-bold text-gray-800 truncate">Admin</p>
                                                <p className="text-[12px] text-gray-500 truncate">{currentUser?.email}</p>
                                            </div>
                                        </div>
                                        <div className="p-2">
                                            {navItems.map(item => (
                                                <button key={item.id} onClick={() => { setActiveTab(item.id); setShowProfileDropdown(false); }}
                                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-medium text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-colors">
                                                    <span className="text-lg text-gray-400">{item.icon}</span> {item.label}
                                                </button>
                                            ))}
                                            <div className="my-1 border-t border-gray-100" />
                                            <button onClick={() => signOut()} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-bold text-red-500 hover:bg-red-50 transition-colors">
                                                <MdLogout className="text-lg" /> Log out
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </header>

                {/* ─── SCROLLABLE CONTENT ──────────────────────────── */}
                <main className="flex-1 overflow-y-auto p-8 bg-[#f7f8fa]">

                    {/* Page heading */}
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mb-7"
                    >
                        <h1 className="text-4xl font-bold text-slate-800 capitalize tracking-tight">{pageTitle}</h1>
                        <p className="text-base text-gray-500 font-medium mt-1">{pageSubtitle}</p>
                    </motion.div>

                    {/* Date Filters — only for visas tab */}
                    {activeTab === "visas" && (
                        <div className="mb-6 flex flex-wrap items-end gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <div>
                                <label className="block text-sm font-bold text-slate-500 mb-1">Start Date</label>
                                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                                    className="px-3 py-2 border border-slate-200 rounded-lg text-base font-medium focus:ring-2 focus:ring-orange-400 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-500 mb-1">End Date</label>
                                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                                    className="px-3 py-2 border border-slate-200 rounded-lg text-base font-medium focus:ring-2 focus:ring-orange-400 outline-none" />
                            </div>
                            {(startDate || endDate) && (
                                <button onClick={() => { setStartDate(''); setEndDate(''); }}
                                    className="px-3 py-2 bg-slate-100 text-slate-600 rounded-lg text-base font-bold hover:bg-slate-200 transition-colors">
                                    Clear Filters
                                </button>
                            )}
                            <span className="ml-auto text-sm font-bold text-slate-400 self-center">
                                Showing {startDate || 'Start'} to {endDate || 'Now'}
                            </span>
                        </div>
                    )}

                    {/* ════ OVERVIEW TAB ════ */}
                    {activeTab === "overview" && (
                        <div className="space-y-6">
                            {/* KPI Cards */}
                            <motion.div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5" initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}>
                                <motion.div variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
                                    whileHover={{ y: -4, boxShadow: "0 12px 24px -8px rgba(249,123,79,0.25)" }} transition={{ duration: 0.35, ease: "easeOut" }}
                                    className="bg-[#FEE8E0] rounded-2xl p-5 border border-black/5 cursor-default">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-[#F97B4F] flex items-center justify-center text-white text-xl shadow-sm shadow-orange-300"><MdReceipt /></div>
                                        <p className="text-base font-bold text-gray-600">Total Revenue</p>
                                    </div>
                                    <h3 className="text-3xl font-bold text-gray-800 mb-1">PKR {stats.revenue.toLocaleString()}</h3>
                                    <p className="text-[13px] font-bold text-orange-600">+5% since last month</p>
                                </motion.div>

                                <motion.div variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
                                    whileHover={{ y: -4, boxShadow: "0 12px 24px -8px rgba(40,199,111,0.25)" }} transition={{ duration: 0.35, ease: "easeOut" }}
                                    onClick={() => setActiveTab("visas")} whileTap={{ scale: 0.97 }}
                                    className="bg-[#E6F9F0] rounded-2xl p-5 border border-black/5 cursor-pointer">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-[#28C76F] flex items-center justify-center text-white text-xl shadow-sm shadow-green-300"><MdSwapHoriz /></div>
                                        <p className="text-base font-bold text-gray-600">Visa Applications</p>
                                    </div>
                                    <h3 className="text-3xl font-bold text-gray-800 mb-1">{visas.length}</h3>
                                    <p className="text-[13px] font-bold text-emerald-600">+22% since last month</p>
                                </motion.div>

                                <motion.div variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
                                    whileHover={{ y: -4, boxShadow: "0 12px 24px -8px rgba(0,180,216,0.25)" }} transition={{ duration: 0.35, ease: "easeOut" }}
                                    onClick={() => setActiveTab("inquiries")} whileTap={{ scale: 0.97 }}
                                    className="bg-[#E0F3FE] rounded-2xl p-5 border border-black/5 cursor-pointer">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-[#00B4D8] flex items-center justify-center text-white text-xl shadow-sm shadow-sky-300"><FaKaaba /></div>
                                        <p className="text-base font-bold text-gray-600">Umrah Queries</p>
                                    </div>
                                    <h3 className="text-3xl font-bold text-gray-800 mb-1">{inquiries.length}</h3>
                                    <p className="text-[13px] font-bold text-sky-600">+10% since last month</p>
                                </motion.div>

                                <motion.div variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
                                    whileHover={{ y: -4, boxShadow: "0 12px 24px -8px rgba(255,179,0,0.25)" }} transition={{ duration: 0.35, ease: "easeOut" }}
                                    onClick={() => setActiveTab("messages")} whileTap={{ scale: 0.97 }}
                                    className="bg-[#FFF8E1] rounded-2xl p-5 border border-black/5 cursor-pointer">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-[#FFB300] flex items-center justify-center text-white text-xl shadow-sm shadow-amber-300"><MdMessage /></div>
                                        <p className="text-base font-bold text-gray-600">Messages</p>
                                    </div>
                                    <h3 className="text-3xl font-bold text-gray-800 mb-1">{messages.length}</h3>
                                    <p className="text-[13px] font-bold text-amber-600">+35% since last month</p>
                                </motion.div>
                            </motion.div>

                            {/* Secondary Stats */}
                            <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-5" initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } }}>
                                {[
                                    { label: "Total Approved Visas", value: stats.approved, trend: "+35% vs Last Month", trendColor: "text-emerald-600", action: () => goToVisas("Approved"), icon: <MdOutlineContentCopy className="text-orange-500 text-2xl" />, iconBg: "bg-orange-50" },
                                    { label: "Docs Awaiting Review", value: stats.pending, trend: "-20% vs Last Month", trendColor: "text-red-500", action: () => goToVisas("Doc Received"), icon: <MdOutlineCreditCard className="text-orange-500 text-2xl" />, iconBg: "bg-orange-50" },
                                    { label: "Rejected Applications", value: stats.rejected, trend: "-20% vs Last Month", trendColor: "text-red-500", action: () => goToVisas("Rejected"), icon: <MdReceipt className="text-amber-500 text-2xl" />, iconBg: "bg-amber-50" },
                                ].map((c, i) => (
                                    <motion.div key={i} variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
                                        whileHover={{ y: -3, boxShadow: "0 14px 28px -12px rgba(15,23,42,0.14)" }} transition={{ duration: 0.35, ease: "easeOut" }}
                                        className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm cursor-default">
                                        <div className="flex items-start justify-between mb-1">
                                            <div>
                                                <h3 className="text-4xl font-bold text-gray-800">{c.value}</h3>
                                                <p className="text-base font-semibold text-gray-400 mt-1">{c.label}</p>
                                            </div>
                                            <div className={`w-11 h-11 rounded-xl ${c.iconBg} flex items-center justify-center shrink-0`}>{c.icon}</div>
                                        </div>
                                        <div className="flex items-center justify-between pt-4 mt-3 border-t border-gray-100">
                                            <span className={`text-[13px] font-bold ${c.trendColor}`}>{c.trend}</span>
                                            <button onClick={c.action} className="text-[13px] font-bold text-orange-500 underline hover:text-orange-600">View</button>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>

                            {/* Charts */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                                    <div className="flex items-center justify-between mb-5">
                                        <h3 className="text-lg font-bold text-gray-800">Sales vs Purchase</h3>
                                        <button className="flex items-center gap-1.5 text-sm font-bold text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors">This Year <MdKeyboardArrowDown /></button>
                                    </div>
                                    <ResponsiveContainer width="100%" height={280}>
                                        <BarChart data={weeklyOverview} margin={{ top: 10, right: 10, left: -10, bottom: 0 }} barGap={2} barCategoryGap="25%" barSize={22}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                                            <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={v => `${v}k`} domain={[0, 'dataMax + 10']} label={{ value: '$ (thousands)', angle: -90, position: 'insideLeft', fontSize: 9, fill: '#9ca3af' }} />
                                            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12, boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
                                            <Bar dataKey="applications" name="Sales" fill="#F4A183" radius={[6, 6, 0, 0]} />
                                            <Bar dataKey="revenue" name="Purchase" fill="#E2622D" radius={[6, 6, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                    <div className="flex items-center justify-center gap-6 mt-3 text-sm font-bold text-gray-500">
                                        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-[#F4A183] inline-block"></span>Sales</span>
                                        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-[#E2622D] inline-block"></span>Purchase</span>
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-lg font-bold text-gray-800">Overall Information</h3>
                                        <button className="flex items-center gap-1.5 text-sm font-bold text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors">Last 6 Months <MdKeyboardArrowDown /></button>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-400 mb-5">Applications Overview</p>
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="relative w-[140px] h-[140px] shrink-0">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <RadialBarChart cx="50%" cy="50%" innerRadius="55%" outerRadius="100%" barSize={10}
                                                    data={[{ name: "Approved", value: donutData.approvedPct, fill: "#22C55E" }, { name: "Pending", value: donutData.pendingPct, fill: "#FFB020" }]}
                                                    startAngle={90} endAngle={-270}>
                                                    <RadialBar background={{ fill: "#EEF1F4" }} dataKey="value" cornerRadius={20} clockWise />
                                                </RadialBarChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="flex-1 space-y-4">
                                            <div>
                                                <p className="text-2xl font-bold text-gray-800 leading-none">{donutData.approved}</p>
                                                <p className="text-[13px] font-bold text-emerald-600 mt-0.5">Approved</p>
                                                <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">▲ {donutData.approvedPct}%</span>
                                            </div>
                                            <div>
                                                <p className="text-2xl font-bold text-gray-800 leading-none">{donutData.pending}</p>
                                                <p className="text-[13px] font-bold text-amber-500 mt-0.5">Pending</p>
                                                <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">▲ {donutData.pendingPct}%</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3 mt-auto pt-6 border-t border-gray-100 text-center">
                                        <div className="border-r border-gray-100"><p className="text-3xl font-bold text-gray-800">{visas.length}</p><p className="text-[11px] font-bold text-gray-400 uppercase mt-1">Visas</p></div>
                                        <div className="border-r border-gray-100"><p className="text-3xl font-bold text-gray-800">{inquiries.length}</p><p className="text-[11px] font-bold text-gray-400 uppercase mt-1">Umrah</p></div>
                                        <div><p className="text-3xl font-bold text-gray-800">{messages.length}</p><p className="text-[11px] font-bold text-gray-400 uppercase mt-1">Msgs</p></div>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Activity */}
                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                                <div className="flex items-center justify-between mb-5">
                                    <h3 className="text-lg font-bold text-gray-800">Recent Activity</h3>
                                    <span className="text-sm font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-lg">Weekly</span>
                                </div>
                                {recentActivity.length === 0 ? (
                                    <p className="text-base text-gray-400 font-bold text-center py-8">No recent activity</p>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                        {recentActivity.map(a => (
                                            <motion.button key={a.type + a.id} whileHover={{ x: 2 }} whileTap={{ scale: 0.98 }}
                                                onClick={() => { if (a.type === "visa") { const v = visas.find(x => x.id === a.id); if (v) setSelectedDoc(v); } else setActiveTab("inquiries"); }}
                                                className="flex items-center gap-3 py-1 text-left w-full rounded-lg hover:bg-gray-50 transition-colors px-1 -mx-1">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${a.type === "visa" ? "bg-orange-50 text-orange-500" : "bg-emerald-50 text-emerald-600"}`}>
                                                    {a.type === "visa" ? <FaPassport className="text-base" /> : <FaKaaba className="text-base" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-base font-bold text-gray-700 truncate">{a.title || "Unnamed"}</p>
                                                    <p className="text-[12px] text-gray-400 truncate">{a.sub}</p>
                                                </div>
                                                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0 ${a.status === "Approved" ? "bg-emerald-50 text-emerald-600" : a.status === "Rejected" ? "bg-red-50 text-red-500" : "bg-gray-100 text-gray-500"}`}>
                                                    {a.status || "Pending"}
                                                </span>
                                            </motion.button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Allowed Edited */}
                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                                <div className="flex items-center justify-between mb-5">
                                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2"><MdLockOpen className="text-emerald-600" />Allowed Edited Applications</h3>
                                    {visas.filter(v => v.editApproved && !v.userConfirmed).length > 0 && (
                                        <span className="bg-emerald-100 text-emerald-700 text-sm font-bold px-3 py-1 rounded-full">{visas.filter(v => v.editApproved && !v.userConfirmed).length} Pending</span>
                                    )}
                                </div>
                                {visas.filter(v => v.editApproved && !v.userConfirmed).length === 0 ? (
                                    <div className="text-center py-12"><MdLockOpen className="text-gray-200 text-5xl mx-auto mb-3" /><p className="text-gray-500 font-bold">No edit-allowed applications</p></div>
                                ) : (
                                    <div className="space-y-3">
                                        {visas.filter(v => v.editApproved && !v.userConfirmed).slice(0, 10).map(visa => (
                                            <div key={visa.id} className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                                                <div className="flex items-center gap-4 flex-1">
                                                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center"><FaPassport className="text-emerald-600" /></div>
                                                    <div className="flex-1">
                                                        <p className="font-bold text-gray-800">{visa.applicantName}</p>
                                                        <p className="text-sm text-gray-500">{visa.country} • {visa.visaType}</p>
                                                        {visa.adminMessage && <p className="text-sm text-emerald-700 mt-1 font-bold">📝 {visa.adminMessage}</p>}
                                                    </div>
                                                </div>
                                                <span className="text-sm font-bold text-emerald-600 bg-white px-3 py-1 rounded-full border border-emerald-100">AWAITING EDIT</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Recently Edited */}
                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                                <div className="flex items-center justify-between mb-5">
                                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2"><MdCheckCircle className="text-blue-500" />Recently Edited Applications</h3>
                                    {visas.filter(v => v.userConfirmed).length > 0 && (
                                        <span className="bg-blue-100 text-blue-700 text-sm font-bold px-3 py-1 rounded-full">{visas.filter(v => v.userConfirmed).length} New</span>
                                    )}
                                </div>
                                {visas.filter(v => v.userConfirmed).length === 0 ? (
                                    <div className="text-center py-12"><MdCheckCircle className="text-gray-200 text-5xl mx-auto mb-3" /><p className="text-gray-500 font-bold">No recently edited applications</p></div>
                                ) : (
                                    <div className="space-y-3">
                                        {visas.filter(v => v.userConfirmed).slice(0, 10).map(visa => (
                                            <div key={visa.id} className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100">
                                                <div className="flex items-center gap-4 flex-1">
                                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center"><FaPassport className="text-blue-500" /></div>
                                                    <div className="flex-1">
                                                        <p className="font-bold text-gray-800">{visa.applicantName}</p>
                                                        <p className="text-sm text-gray-500">{visa.country} • {visa.visaType}</p>
                                                        {visa.adminMessage && <p className="text-sm text-blue-700 mt-1">📝 Original Request: {visa.adminMessage}</p>}
                                                        {visa.userConfirmedAt && <p className="text-sm text-gray-400 mt-1">✓ Edited on {new Date(visa.userConfirmedAt).toLocaleDateString()} at {new Date(visa.userConfirmedAt).toLocaleTimeString()}</p>}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => setHistoryVisa(visa)} className="text-sm font-bold text-blue-600 bg-white px-3 py-1.5 rounded-full hover:bg-blue-600 hover:text-white transition-all border border-blue-100">📋 View History</button>
                                                    <span className="text-sm font-bold text-blue-600 bg-white px-3 py-1.5 rounded-full animate-pulse border border-blue-100">RE-SUBMITTED</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ════ VISAS TAB ════ */}
                    {activeTab === "visas" && (
                        <VisaProcessList visas={filteredVisas} updateLocal={updateLocal} setSelectedDoc={setSelectedDoc} initialSearch={visaQuickFilter} />
                    )}

                    {/* ════ UMRAH QUERIES TAB ════ */}
                    {activeTab === "inquiries" && (
                        <UmrahQueriesTab inquiries={filteredInquiries} updateLocal={updateLocal} />
                    )}

                    {/* ════ MESSAGES TAB ════ */}
                    {activeTab === "messages" && (
                        <MessagesTab messages={filteredMessages} />
                    )}

                    {/* ════ SUB-ADMINS TAB ════ */}
                    {activeTab === "subadmins" && (
                        <SubAdminsTab />
                    )}
                </main>
            </div>

            {/* ─── MODALS ──────────────────────────────────────────── */}
            <AnimatePresence>
                {selectedDoc && (
                    <DocumentViewer visa={selectedDoc} onClose={() => setSelectedDoc(null)}
                        onVerifyDocument={async (id, data) => {
                            await updateDoc(doc(db, "visaApplications", id), { documentVerification: data });
                            updateLocal('visa', id, { documentVerification: data });
                        }} />
                )}
                {historyVisa && <EditHistoryModal visa={historyVisa} onClose={() => setHistoryVisa(null)} />}
            </AnimatePresence>
        </div>
    );
}

// ─── VISA PROCESS LIST ────────────────────────────────────────────────────────
const VISA_STEPS = ["Submitted", "Appointment", "Visa Decision", "Delivered"];

function stepIndexForStatus(status) {
    switch (status) {
        case "Doc Received": return 0;
        case "Analyzing": return 1;
        case "Approved": return 3;
        case "Rejected": return 2;
        default: return 0;
    }
}

function VisaProcessList({ visas, updateLocal, setSelectedDoc, initialSearch = "" }) {
    const [search, setSearch] = useState(initialSearch);
    const [expandedId, setExpandedId] = useState(null);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return visas;
        return visas.filter(v =>
            (v.applicantName || "").toLowerCase().includes(q) ||
            (v.applicationNumber || "").toLowerCase().includes(q) ||
            (v.status || "").toLowerCase().includes(q) ||
            (v.country || "").toLowerCase().includes(q)
        );
    }, [visas, search]);

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-2xl border border-gray-200 shadow-sm focus-within:ring-2 focus-within:ring-orange-400/40 focus-within:border-orange-300 transition-all">
                <MdSearch className="text-gray-400 text-xl" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, application no., status..."
                    className="flex-1 text-base outline-none placeholder:text-gray-400 bg-transparent text-gray-700" />
                {search && <button onClick={() => setSearch("")} className="text-gray-400 hover:text-orange-500"><MdClear /></button>}
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                {filtered.length === 0 ? (
                    <div className="p-14 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-3">
                            <FaPassport className="text-orange-300 text-3xl" />
                        </div>
                        <p className="text-gray-500 font-bold">No visa applications found</p>
                    </div>
                ) : (
                    <AnimatePresence initial={false}>
                        {filtered.map((v, idx) => {
                            const isOpen = expandedId === v.id;
                            return (
                                <motion.div key={v.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.25, delay: idx * 0.03 }}
                                    className={`border-b border-gray-100 last:border-0 transition-colors ${isOpen ? "bg-blue-50/30" : "hover:bg-gray-50/60"}`}>
                                    <div className="flex items-stretch gap-0 relative">
                                        <div className={`w-1 shrink-0 rounded-r-full transition-colors ${isOpen ? "bg-orange-400" : "bg-transparent"}`}></div>
                                        <div className="flex-1 flex flex-col xl:flex-row xl:items-center gap-4 lg:gap-6 py-5 px-5">
                                            <div className="flex items-center gap-3 xl:w-56 shrink-0">
                                                <span className="w-7 h-7 rounded-lg bg-orange-50 text-orange-500 text-[13px] font-bold flex items-center justify-center shrink-0">{idx + 1}</span>
                                                <div className="min-w-0">
                                                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide truncate">{v.applicationNumber || v.id?.slice(0, 8)}</p>
                                                    <p className="font-bold text-gray-800 truncate text-base">{v.applicantName}</p>
                                                </div>
                                            </div>
                                            <div className="xl:w-36 shrink-0">
                                                <StatusPill status={v.status} />
                                                <ProgressBar step={stepIndexForStatus(v.status)} />
                                            </div>
                                            <div className="flex-1 min-w-0 overflow-x-auto">
                                                <VisaStepTracker currentStep={stepIndexForStatus(v.status)} rejected={v.status === "Rejected"} />
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0 xl:justify-end">
                                                <button onClick={() => setSelectedDoc(v)} className="p-2.5 bg-orange-50 text-orange-500 rounded-xl hover:bg-orange-500 hover:text-white transition-all" title="View documents">
                                                    <MdVisibility className="text-xl" />
                                                </button>
                                                <button onClick={() => setExpandedId(isOpen ? null : v.id)}
                                                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${isOpen ? "bg-orange-500 text-white" : "border border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-500"}`}>
                                                    ✎ {isOpen ? "Close" : "Update"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <AnimatePresence>
                                        {isOpen && (
                                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                                                <div className="ml-1 px-6 pb-6 pt-1 flex flex-col sm:flex-row sm:items-center gap-4 bg-orange-50/40 border-t border-orange-100">
                                                    <div className="sm:w-56 shrink-0">
                                                        <StatusDropdown id={v.id} currentStatus={v.status} collectionName="visaApplications" onUpdate={(id, up) => updateLocal('visa', id, up)} isVisa applicant={v} />
                                                    </div>
                                                    <LiveActionPanel item={v} collectionName="visaApplications" onLocalUpdate={(id, up) => updateLocal('visa', id, up)} />
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
}

function StatusPill({ status }) {
    const styles = {
        "Doc Received": "bg-amber-50 text-amber-600",
        "Analyzing": "bg-blue-50 text-blue-600",
        "Approved": "bg-emerald-50 text-emerald-600",
        "Rejected": "bg-red-50 text-red-500",
    };
    return <span className={`inline-block text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${styles[status] || "bg-gray-100 text-gray-500"}`}>{status || "Pending"}</span>;
}

function ProgressBar({ step }) {
    const pct = Math.min(100, Math.round(((step + 1) / VISA_STEPS.length) * 100));
    return (
        <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 h-1.5 bg-orange-50 rounded-full overflow-hidden">
                <motion.div className="h-full bg-orange-400 rounded-full" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6, ease: "easeOut" }} />
            </div>
            <span className="text-[12px] font-bold text-gray-400 w-8 text-right">{pct}%</span>
        </div>
    );
}

function VisaStepTracker({ currentStep, rejected }) {
    return (
        <div className="flex items-start justify-between min-w-[380px]">
            {VISA_STEPS.map((label, i) => {
                const done = i < currentStep || (i === currentStep && i === VISA_STEPS.length - 1);
                const active = i === currentStep && !done;
                const isLast = i === VISA_STEPS.length - 1;
                const failed = rejected && i === 2;
                let circleClasses = "bg-gray-100 text-gray-400";
                if (failed) circleClasses = "bg-red-500 text-white";
                else if (done) circleClasses = "bg-orange-500 text-white";
                else if (active) circleClasses = "bg-orange-100 text-orange-500 ring-2 ring-orange-400";
                return (
                    <React.Fragment key={label}>
                        <div className="flex flex-col items-center gap-1.5 w-16 shrink-0">
                            <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.3, delay: i * 0.05 }}
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold relative ${circleClasses}`}>
                                {active && !failed && (
                                    <motion.span className="absolute inset-0 rounded-full bg-orange-400"
                                        animate={{ scale: [1, 1.7], opacity: [0.45, 0] }} transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }} />
                                )}
                                <span className="relative">{failed ? "✕" : done ? "✓" : i + 1}</span>
                            </motion.div>
                            <p className="text-[11px] font-bold text-gray-600 text-center leading-tight">{label}</p>
                            <p className={`text-[10px] font-bold text-center leading-tight ${active ? "text-orange-500" : failed ? "text-red-500" : done ? "text-gray-400" : "text-gray-300"}`}>
                                {failed ? "Rejected" : active ? "Pending" : done ? "Done" : "—"}
                            </p>
                        </div>
                        {!isLast && (
                            <div className="flex-1 h-[2px] bg-gray-100 relative mt-4 min-w-[12px]">
                                <motion.div className="h-full bg-orange-400" initial={{ width: 0 }} animate={{ width: i < currentStep ? "100%" : "0%" }} transition={{ duration: 0.5 }} />
                            </div>
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
}