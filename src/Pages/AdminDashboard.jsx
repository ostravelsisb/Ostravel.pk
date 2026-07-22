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
    MdMoreVert, MdFilterList, MdOpenInNew, MdSave, MdAttachFile
} from "react-icons/md";
import { FaUserShield, FaKaaba, FaPassport, FaRegPaperPlane, FaUsersCog, FaMosque, FaBed, FaCar, FaEnvelope } from "react-icons/fa";
import { collection, query, getDocs, orderBy, doc, updateDoc, serverTimestamp, onSnapshot } from "firebase/firestore";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage, signOut } from "../firbase";
import { useAuth } from "../Context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
    RadialBarChart, RadialBar
} from "recharts";

// External Components
import DocumentViewer from "../Components/DocumentViewer";
import UmrahProcessList from "../Components/UmrahProcessList";
import VisaDocumentRequests from "../Components/VisaDocumentRequests";
import VisaInterviewDocuments from "../Components/VisaInterviewDocuments";
import VisaAnalytics from "../Components/VisaAnalytics";
import SubAdminManagement from "../Components/SubAdminManagement";
import SubAdminActivityLog from "../Components/SubAdminActivityLog";
import EditHistoryModal from "../Components/EditHistoryModal";
import LiveChatPanel from "../Components/LiveChatPanel";
import { toggleEditApproval, saveAdminMessage, dismissResubmissionHighlight, uploadDecisionLetter, hasUnseenUserMessage, markUserMessageSeen } from "../Utils/ApplicationEditUtils";
import { sendUmrahStatusEmail, sendUmrahMessageEmail, sendConsolidatedUpdateEmail } from "../Utils/emailService";
import ToastContainer, { notify } from "../Components/Toast";


// ─── SHARED PAGINATION COMPONENT ─────────────────────────────────────────────
const ITEMS_PER_PAGE = 10;

function Pagination({ total, page, onChange }) {
    const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
    if (totalPages <= 1) return null;
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    return (
        <div className="flex items-center justify-center gap-1.5 pt-4 mt-2">
            <button
                onClick={() => onChange(page - 1)}
                disabled={page === 1}
                className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-orange-50 hover:text-orange-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-bold text-base"
            >
                ‹
            </button>
            {pages.map(p => (
                <button
                    key={p}
                    onClick={() => onChange(p)}
                    className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-bold border transition-all ${
                        p === page
                            ? "bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-200"
                            : "border-gray-200 text-gray-500 hover:bg-orange-50 hover:text-orange-500"
                    }`}
                >
                    {p}
                </button>
            ))}
            <button
                onClick={() => onChange(page + 1)}
                disabled={page === totalPages}
                className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-orange-50 hover:text-orange-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-bold text-base"
            >
                ›
            </button>
            <span className="ml-3 text-[12px] font-bold text-gray-400">
                Page {page} of {totalPages} · {total} total
            </span>
        </div>
    );
}

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

// ─── MODERN STATUS DROPDOWN (matches Sub-Admin Panel) ────────────────────────
const ModernStatusDropdown = ({ currentStatus, onChange, loading }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = React.useRef(null);
    const options = ["Doc Received", "Analyzing", "Req Document", "Visa in Process", "Interview", "Approve", "Reject"];

    const statusColors = {
        "Doc Received": { bg: "bg-sky-50", hoverBg: "hover:bg-sky-50", text: "text-sky-700", border: "border-sky-200", dot: "bg-sky-500" },
        "Analyzing": { bg: "bg-amber-50", hoverBg: "hover:bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-500" },
        "Req Document": { bg: "bg-orange-50", hoverBg: "hover:bg-orange-50", text: "text-orange-700", border: "border-orange-200", dot: "bg-orange-500" },
        "Visa in Process": { bg: "bg-indigo-50", hoverBg: "hover:bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200", dot: "bg-indigo-500" },
        "Interview": { bg: "bg-purple-50", hoverBg: "hover:bg-purple-50", text: "text-purple-700", border: "border-purple-200", dot: "bg-purple-500" },
        "Approve": { bg: "bg-emerald-50", hoverBg: "hover:bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" },
        "Reject": { bg: "bg-red-50", hoverBg: "hover:bg-red-50", text: "text-red-700", border: "border-red-200", dot: "bg-red-500" },
    };

    const currentColor = statusColors[currentStatus] || statusColors["Doc Received"];

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
                    <span>{currentStatus || "Doc Received"}</span>
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
                                    <button
                                        key={status}
                                        onClick={() => {
                                            onChange({ target: { value: status } });
                                            setIsOpen(false);
                                        }}
                                        className={`w-full text-left px-4 py-2.5 rounded-lg text-[13px] font-bold transition-colors duration-150 ${
                                            isActive
                                                ? `${colors.bg} ${colors.text} border-2 ${colors.border} shadow-md`
                                                : `text-gray-700 hover:bg-gray-100 hover:text-gray-900`
                                        }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2.5 h-2.5 rounded-full ${colors.dot}`} />
                                            {status}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ─── SUB-COMPONENT: LIVE ACTION PANEL ────────────────────────────────────────
const LiveActionPanel = ({ item, collectionName, onLocalUpdate, onStage }) => {
    const [msg, setMsg] = useState(item.adminMessage || "");
    const [isSending, setIsSending] = useState(false);
    const [isToggling, setIsToggling] = useState(false);

    const handleToggle = async () => {
        const nextState = !item.editApproved;
        setIsToggling(true);
        try {
            await toggleEditApproval(item.id, collectionName, nextState, 'admin@ostravels.com');
            onLocalUpdate(item.id, { editApproved: nextState });
            if (collectionName === "visaApplications" && onStage) {
                onStage(item.id, {
                    editAccess: { enabled: nextState, reason: msg },
                });
            }
        } catch (e) { notify.error("Toggle failed"); }
        setIsToggling(false);
    };

    const handleSendMessage = async () => {
        if (!msg.trim()) return;
        setIsSending(true);
        try {
            await saveAdminMessage(item.id, collectionName, msg);
            onLocalUpdate(item.id, { adminMessage: msg });
            if (collectionName === "visaApplications" && onStage) {
                onStage(item.id, { message: msg });
            }
            notify.success(item.email ? "Message saved — hit Save to email the client" : "Message saved to dashboard");
        } catch (e) { notify.error("Message failed"); }
        setIsSending(false);
    };

    return (
        <div className="flex flex-col gap-2 min-w-[220px]">
            {item.userConfirmed && (
                <span className="text-[11px] font-bold text-blue-600 animate-bounce"></span>
            )}
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
const StatusDropdown = ({ id, currentStatus, collectionName, onUpdate, isVisa = false, isUmrah = false, applicant, inquiry, onStage }) => {
    const [loading, setLoading] = useState(false);
    const options = ["Pending", "Investigating", "Processing", "Completed", "Cancelled"];

    const handleChange = async (e) => {
        const val = e.target.value;
        const oldStatus = currentStatus;
        setLoading(true);
        try {
            await updateDoc(doc(db, collectionName, id), { status: val, updatedAt: serverTimestamp() });
            onUpdate(id, { status: val });
            if (isVisa && applicant && onStage) {
                onStage(id, { statusChange: { oldStatus, newStatus: val } });
            }
            if (isUmrah && inquiry) {
                sendUmrahStatusEmail({
                    to: inquiry.user?.email,
                    applicantName: inquiry.user?.name,
                    hotel: inquiry.makkah?.hotel,
                    checkIn: inquiry.makkah?.checkIn,
                    checkOut: inquiry.makkah?.checkOut,
                    oldStatus,
                    newStatus: val,
                });
            }
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    // Visa applications use the modern pill-style dropdown to match the Sub-Admin panel
    if (isVisa) {
        return (
            <ModernStatusDropdown
                currentStatus={currentStatus}
                onChange={handleChange}
                loading={loading}
            />
        );
    }

    return (
        <select
            value={currentStatus || "Pending"}
            onChange={handleChange}
            className={`text-[13px] font-bold px-3 py-1 rounded-full border border-slate-200 focus:ring-2 focus:ring-orange-400 outline-none bg-white cursor-pointer ${loading ? 'opacity-50' : ''}`}
        >
            {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
    );
};

// ─── SUB-COMPONENT: UMRAH MESSAGE BOX (functional — saves + emails the client) ──
const UmrahMessageBox = ({ inquiry, onLocalUpdate }) => {
    const [msg, setMsg] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [justSent, setJustSent] = useState(false);

    const handleSend = async () => {
        if (!msg.trim()) return;
        setIsSending(true);
        try {
            await saveAdminMessage(inquiry.id, "umardet", msg);
            onLocalUpdate('umrah', inquiry.id, { adminMessage: msg });
            sendUmrahMessageEmail({
                to: inquiry.user?.email,
                applicantName: inquiry.user?.name,
                hotel: inquiry.makkah?.hotel,
                message: msg,
            });
            setMsg("");
            setJustSent(true);
            notify.success(inquiry.user?.email ? "Message sent & emailed to client" : "Message sent (no client email on file)");
            setTimeout(() => setJustSent(false), 2500);
        } catch (e) {
            console.error(e);
            notify.error("Message failed");
        }
        setIsSending(false);
    };

    return (
        <div className="flex-1 min-w-[240px]">
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-orange-400/40 focus-within:border-orange-300 transition-all">
                <MdChat className="shrink-0 text-orange-400 text-base" />
                <input
                    type="text"
                    value={msg}
                    onChange={(e) => setMsg(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    disabled={isSending || !inquiry.user?.email}
                    placeholder={inquiry.user?.email ? "Message the client (also emailed)..." : "No client email on file"}
                    className="flex-1 text-sm outline-none placeholder:text-gray-400 bg-transparent text-gray-700 disabled:opacity-50"
                />
                <button
                    onClick={handleSend}
                    disabled={isSending || !msg.trim()}
                    className="shrink-0 text-orange-500 hover:text-orange-700 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {isSending
                        ? <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-orange-500 border-t-transparent" />
                        : <FaRegPaperPlane className="text-sm" />}
                </button>
            </div>
            {justSent && <p className="text-[11px] font-bold text-emerald-500 mt-1 pl-1">✓ Sent &amp; emailed to client</p>}
            {inquiry.adminMessage && !justSent && (
                <p className="text-[11px] text-gray-400 mt-1 pl-1 truncate">Last note: {inquiry.adminMessage}</p>
            )}
        </div>
    );
};

// ─── UMRAH QUERIES TAB ────────────────────────────────────────────────────────
function UmrahQueriesTab({ inquiries, updateLocal }) {
    const [search, setSearch] = useState("");
    const [expandedId, setExpandedId] = useState(null);
    const [filterStatus, setFilterStatus] = useState("All");
    const [page, setPage] = useState(1);

    const statuses = ["All", "Pending", "Investigating", "Processing", "Completed", "Cancelled"];

    // Reset to page 1 whenever filters change
    useEffect(() => { setPage(1); }, [search, filterStatus]);

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

    const paginatedUmrah = useMemo(() => {
        const start = (page - 1) * ITEMS_PER_PAGE;
        return filtered.slice(start, start + ITEMS_PER_PAGE);
    }, [filtered, page]);

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
                ) : paginatedUmrah.map((u) => {
                    const isOpen = expandedId === u.id;
                    const statusStyle = UMRAH_STATUS_STYLES[u.status || "Pending"] || UMRAH_STATUS_STYLES["Pending"];
                    const meta = [
                        u.makkah?.rooms ? `${u.makkah.rooms} Rooms` : null,
                        u.makkah?.guests ? `${u.makkah.guests} Guests` : null,
                        u.transport?.vehicleType || null,
                    ].filter(Boolean);

                    return (
                        <motion.div key={u.id} variants={fadeUp} layout
                            className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${isOpen ? "border-orange-200 shadow-md shadow-orange-100/50" : "border-gray-200 hover:border-gray-300 hover:shadow-sm"}`}
                        >
                            {/* Card Header — one clean row: client, hotel, status, action */}
                            <button
                                onClick={() => setExpandedId(isOpen ? null : u.id)}
                                className="w-full text-left flex flex-col sm:flex-row sm:items-center gap-4 p-4"
                            >
                                {/* Client */}
                                <div className="flex items-center gap-3 sm:w-48 shrink-0">
                                    <span className="w-10 h-10 rounded-xl bg-sky-50 text-sky-500 text-sm font-bold flex items-center justify-center shrink-0">
                                        {(u.user?.name || "?").charAt(0).toUpperCase()}
                                    </span>
                                    <div className="min-w-0">
                                        <p className="font-bold text-gray-800 truncate text-sm">{u.user?.name || "Unknown Client"}</p>
                                        <p className="text-xs text-gray-400 truncate">{u.user?.contact || "—"}</p>
                                    </div>
                                </div>

                                {/* Hotel + meta, single line, subtle */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-700 truncate flex items-center gap-1.5">
                                        <MdHotel className="text-orange-400 shrink-0" /> {u.makkah?.hotel || "No hotel selected"}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-0.5 truncate">
                                        {u.makkah?.checkIn && u.makkah?.checkOut ? `${u.makkah.checkIn} → ${u.makkah.checkOut}` : "Dates not set"}
                                        {meta.length > 0 && <span className="mx-1.5 text-gray-300">•</span>}
                                        {meta.join(" · ")}
                                    </p>
                                </div>

                                {/* Status + chevron */}
                                <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
                                    <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${statusStyle.pill}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`}></span>
                                        {u.status || "Pending"}
                                    </span>
                                    <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                                        <MdKeyboardArrowDown className="text-xl text-gray-400" />
                                    </motion.div>
                                </div>
                            </button>

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
                                        <div className="px-4 pb-4 pt-3 bg-orange-50/40 border-t border-orange-100 flex flex-col sm:flex-row sm:items-start gap-3">
                                            <div className="flex items-center gap-3 shrink-0">
                                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Status</label>
                                                <StatusDropdown
                                                    id={u.id}
                                                    currentStatus={u.status}
                                                    collectionName="umardet"
                                                    onUpdate={(id, up) => updateLocal('umrah', id, up)}
                                                    isUmrah
                                                    inquiry={u}
                                                />
                                            </div>
                                            <UmrahMessageBox inquiry={u} onLocalUpdate={updateLocal} />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}
            </motion.div>
            <Pagination total={filtered.length} page={page} onChange={setPage} />
        </motion.div>

    );
}

// ─── MESSAGES TAB ─────────────────────────────────────────────────────────────
function MessagesTab({ messages, adminName }) {
    const [segment, setSegment] = useState("liveChat"); // "liveChat" | "contactForm"
    const [search, setSearch] = useState("");
    const [selectedMsg, setSelectedMsg] = useState(null);
    const [page, setPage] = useState(1);

    useEffect(() => { setPage(1); }, [search]);

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

    const paginatedMessages = useMemo(() => {
        const start = (page - 1) * ITEMS_PER_PAGE;
        return filtered.slice(start, start + ITEMS_PER_PAGE);
    }, [filtered, page]);

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

            {/* Segment Toggle */}
            <motion.div variants={fadeUp} className="inline-flex bg-white rounded-2xl border border-gray-200 shadow-sm p-1.5 gap-1">
                {[
                    { id: "liveChat", label: "Live Chat" },
                    { id: "contactForm", label: "Contact Form" },
                ].map((s) => (
                    <button
                        key={s.id}
                        onClick={() => setSegment(s.id)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                            segment === s.id
                                ? "bg-orange-500 text-white shadow-sm shadow-orange-200"
                                : "text-gray-500 hover:bg-gray-50"
                        }`}
                    >
                        {s.label}
                    </button>
                ))}
            </motion.div>

            {segment === "liveChat" && <LiveChatPanel adminName={adminName} />}

            {segment === "contactForm" && (
            <>
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
                    ) : paginatedMessages.map((m, idx) => (
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
                    <Pagination total={filtered.length} page={page} onChange={setPage} />
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
            </>
            )}
        </motion.div>
    );
}

// ─── SUB-ADMINS TAB ───────────────────────────────────────────────────────────
function SubAdminsTab() {
    // SubAdminManagement now owns its own header (title + Secured Panel badge +
    // Create button) and its own stat cards, so we don't wrap/duplicate them
    // here anymore — that double-header/double-card look was the "odd UI" bug.
    return (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <SubAdminManagement />
        </motion.div>
    );
}

// ─── MAIN ADMIN DASHBOARD ─────────────────────────────────────────────────────
export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState("overview");
    const [visas, setVisas] = useState([]);
    const [umrahRequests, setUmrahRequests] = useState([]);
    // Insurance-flow transactions (BookingConfirmation.jsx writes here, has 'amount' + 'purchaseDate')
    const [policies, setPolicies] = useState([]);
    // Payment-gateway transactions (PaymentReturn.jsx writes here, has 'amountPaid' + 'orderDate')
    const [gatewayPolicies, setGatewayPolicies] = useState([]);
    const [messages, setMessages] = useState([]);
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);

    // Helpers to read amount/date across both collections (different field names).
    const getPolicyAmount = (r) => Number(r?.amount ?? r?.amountPaid ?? 0) || 0;
    const getPolicyDate = (r) => r?.purchaseDate?.toDate?.() || r?.purchaseDate
        || r?.orderDate?.toDate?.() || r?.orderDate
        || r?.createdAt?.toDate?.() || r?.createdAt
        || null;
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [historyVisa, setHistoryVisa] = useState(null);
    const [visaQuickFilter, setVisaQuickFilter] = useState("");
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
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
    const [salesPeriod, setSalesPeriod] = useState("This Year");
    const [overallPeriod, setOverallPeriod] = useState("Last 6 Months");
    const [showSalesDropdown, setShowSalesDropdown] = useState(false);
    const [showOverallDropdown, setShowOverallDropdown] = useState(false);
    const [allowedEditPage, setAllowedEditPage] = useState(1);
    const [recentEditPage, setRecentEditPage] = useState(1);
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Realtime listener for visa applications — reflects user uploads/reuploads
        // instantly without needing a page refresh.
        const visasUnsub = onSnapshot(
            query(collection(db, "visaApplications"), orderBy("applicationDate", "desc")),
            (snap) => {
                const visasData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                setVisas(visasData);
                // Keep an open Document Viewer in sync too, so a user's
                // re-upload shows up instantly without closing/reopening it.
                setSelectedDoc(prev => prev ? (visasData.find(v => v.id === prev.id) || prev) : prev);
                setLoading(false);
            },
            (e) => { console.error("visas onSnapshot error:", e); setLoading(false); }
        );

        // Realtime listener for insurance policies (BookingConfirmation flow).
        // Was using one-time getDocs, so newly added transactions didn't show up
        // without a page refresh — that's why revenue was stuck at 6610.
        const insuranceUnsub = onSnapshot(
            query(collection(db, "insurancesCustumer"), orderBy("purchaseDate", "desc")),
            (snap) => {
                setPolicies(snap.docs.map(d => ({ id: d.id, ...d.data() })));
                setLoading(false);
            },
            (e) => { console.error("insurancesCustumer onSnapshot error:", e); }
        );

        // Realtime listener for payment-gateway transactions (PaymentReturn flow).
        // This collection was NEVER being read by the dashboard — the second
        // half of why total revenue stayed frozen.
        const gatewayUnsub = onSnapshot(
            query(collection(db, "policies"), orderBy("orderDate", "desc")),
            (snap) => {
                setGatewayPolicies(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            },
            (e) => { console.error("policies onSnapshot error:", e); }
        );

        // Realtime listener for Hajj/Umrah requests — admin & sub-admin process
        // these (status + payment requests) and it must reflect instantly.
        const umrahUnsub = onSnapshot(
            query(collection(db, "umrahApplications"), orderBy("applicationDate", "desc")),
            (snap) => setUmrahRequests(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
            (e) => console.error("umrahApplications onSnapshot error:", e)
        );

        // Non-revenue collections — one-time fetch is fine, they don't drive KPIs.
        const fetchRest = async () => {
            try {
                const [m, i] = await Promise.all([
                    getDocs(query(collection(db, "contact_messages"), orderBy("createdAt", "desc"))),
                    getDocs(query(collection(db, "umardet"), orderBy("createdAt", "desc")))
                ]);
                setMessages(m.docs.map(d => ({ id: d.id, ...d.data() })));
                setInquiries(i.docs.map(d => ({ id: d.id, ...d.data() })));
            } catch (e) { console.error(e); }
        };
        fetchRest();

        return () => {
            visasUnsub();
            insuranceUnsub();
            gatewayUnsub();
            umrahUnsub();
        };
    }, []);

    const updateLocal = (type, id, updates) => {
        if (type === 'visa') setVisas(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));
        if (type === 'policy') setPolicies(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
        if (type === 'umrah') setInquiries(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
    };

    // ─── Pending per-user email changes (batched, only sent on "Save") ────────
    const [pendingChanges, setPendingChanges] = useState({});
    // ─── Decision letter uploads (per visa id) ───────────────────────────────
    const [decisionDocs, setDecisionDocs] = useState({}); // { [visaId]: File }

    const stagePendingChange = (id, patch) => {
        setPendingChanges(prev => {
            const existing = prev[id] || {};
            const merged = { ...existing, ...patch };
            // documentActions accumulate, but only the latest action per
            // document label is kept so verify -> unverify -> verify does
            // not stack duplicate "Verified" entries in the email.
            if (patch.documentActions) {
                const combined = [...(existing.documentActions || []), ...patch.documentActions];
                const byLabel = new Map();
                combined.forEach(action => byLabel.set(action.docLabel, action));
                merged.documentActions = Array.from(byLabel.values());
            }
            return { ...prev, [id]: merged };
        });
    };

    const clearPendingChange = (id) => {
        setPendingChanges(prev => {
            const next = { ...prev };
            delete next[id];
            return next;
        });
    };

    const sendPendingEmail = async (visaItem) => {
        const pending = pendingChanges[visaItem.id];
        if (!pending || Object.keys(pending).length === 0) {
            notify.error("No pending changes for this user yet");
            return;
        }
        if (!visaItem.email) {
            notify.error("No email on file for this user");
            return;
        }
        // Build reuploadDocs list from editApprovedDocs (docs admin enabled edit for)
        const docLabelMap = {
            personalPhoto: 'Personal Photo', passport: 'Passport',
            cnicFront: 'CNIC Front', cnicBack: 'CNIC Back',
            bankStatement: 'Bank Statement', nicScan: 'NIC Scan',
            bForm: 'B-Form', frc: 'FRC',
        };
        const editApprovedDocs = pending.editApprovedDocs || {};
        const reuploadDocs = Object.entries(editApprovedDocs)
            .filter(([, enabled]) => enabled)
            .map(([key]) => docLabelMap[key] || key);

        // Upload decision letter if provided; otherwise fall back to a letter
        // that was already attached previously, so it still gets emailed.
        let decisionDocURL = visaItem.decisionDocURL || null;
        let decisionDocName = visaItem.decisionDocName || null;
        const decisionFile = decisionDocs[visaItem.id];
        if (decisionFile) {
            try {
                notify.success("Uploading decision letter...");
                const newStatus = pending.statusChange?.newStatus;
                const uploaded = await uploadDecisionLetter(decisionFile, visaItem.id, "visaApplications", newStatus);
                decisionDocURL = uploaded.decisionDocURL;
                decisionDocName = uploaded.decisionDocName;
                // Clear from local state
                setDecisionDocs(prev => { const n = { ...prev }; delete n[visaItem.id]; return n; });
            } catch (uploadErr) {
                console.error("Decision letter upload failed:", uploadErr);
                notify.error("Decision letter upload failed — email will be sent without attachment");
            }
        }

        const result = await sendConsolidatedUpdateEmail({
            to: visaItem.email,
            applicantName: visaItem.applicantName,
            applicationNumber: visaItem.applicationNumber,
            country: visaItem.country,
            visaType: visaItem.visaType,
            statusChange: pending.statusChange || null,
            editAccess: pending.editAccess || null,
            message: pending.message || null,
            documentActions: pending.documentActions || [],
            reuploadDocs: reuploadDocs.length > 0 ? reuploadDocs : null,
            decisionDocURL,
            decisionDocName,
        });
        if (result?.ok !== false) {
            notify.success("One email sent to client with all updates");
            clearPendingChange(visaItem.id);
        } else {
            notify.error("Failed to send email — try again");
        }
    };

    const stats = useMemo(() => {
        // Sum revenue from ALL THREE sources:
        // - `policies` (state) ← insurance bookings (BookingConfirmation.jsx writes here)
        // - `gatewayPolicies` (state) ← insurance payment-gateway transactions (PaymentReturn.jsx writes here)
        // - `visas` (state) ← visa applications paid via gateway (PaymentReturn.jsx writes amountPaid straight
        //   into visaApplications, NOT into `policies`, so it needs to be counted separately)
        // Exclude dev-only bypass test records (order IDs starting VISA-TEST-) from ALL
        // THREE sources — these were never real payments, see PaymentReturn.jsx
        // verifyPayment(). Must be applied here too, not just to `visas`, or this KPI
        // won't match the (correctly filtered) Revenue Details page.
        const isRealPayment = (r) => !String(r?.orderId || "").startsWith("VISA-TEST-");
        const insuranceRevenue = policies.filter(isRealPayment).reduce((a, b) => a + getPolicyAmount(b), 0);
        const gatewayRevenue = gatewayPolicies.filter(isRealPayment).reduce((a, b) => a + getPolicyAmount(b), 0);
        const visaRevenue = visas
            .filter(isRealPayment)
            .reduce((a, b) => a + (Number(b?.amountPaid) || 0), 0);
        return {
            revenue: insuranceRevenue + gatewayRevenue + visaRevenue,
            pending: visas.filter(v => v.status === "Doc Received").length,
            approved: visas.filter(v => v.status === "Approve").length,
            rejected: visas.filter(v => v.status === "Reject").length,
        };
    }, [visas, policies, gatewayPolicies]);

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

    // ── Sales period helper ──────────────────────────────────────
    const getSalesCutoff = (period) => {
        const now = new Date();
        if (period === "This Year") return new Date(now.getFullYear(), 0, 1);
        if (period === "Last Year") return new Date(now.getFullYear() - 1, 0, 1);
        if (period === "Last 3 Months") { const d = new Date(now); d.setMonth(d.getMonth() - 3); return d; }
        if (period === "Last 6 Months") { const d = new Date(now); d.setMonth(d.getMonth() - 6); return d; }
        if (period === "Last 12 Months") { const d = new Date(now); d.setFullYear(d.getFullYear() - 1); return d; }
        return new Date(now.getFullYear(), 0, 1);
    };
    const getSalesEndDate = (period) => {
        if (period === "Last Year") return new Date(new Date().getFullYear() - 1, 11, 31, 23, 59, 59);
        return new Date();
    };

    const salesChartData = useMemo(() => {
        const cutoff = getSalesCutoff(salesPeriod);
        const endDt = getSalesEndDate(salesPeriod);
        // Group by month for multi-month periods, by day-of-week for short periods
        const useMonthly = ["This Year", "Last Year", "Last 12 Months"].includes(salesPeriod);
        // Single helper: tally revenue from a policy record (handles both schemas).
        const addRevenueFor = (bucket, record) => {
            const d = getPolicyDate(record);
            if (d && d >= cutoff && d <= endDt) bucket.revenue += getPolicyAmount(record) / 1000;
        };
        if (useMonthly) {
            const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
            const totals = months.map(m => ({ day: m, applications: 0, revenue: 0 }));
            visas.forEach(v => {
                const d = parseDate(v.applicationDate);
                if (d && d >= cutoff && d <= endDt) totals[d.getMonth()].applications += 1;
            });
            [...policies, ...gatewayPolicies].forEach(p => addRevenueFor(totals[getPolicyDate(p)?.getMonth() ?? -1] || totals[0], p));
            // For "Last Year" only show that year's months; for "This Year" trim future months
            if (salesPeriod === "This Year") {
                const currentMonth = new Date().getMonth();
                return totals.slice(0, currentMonth + 1);
            }
            return totals;
        } else {
            const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
            const totals = days.map(d => ({ day: d, applications: 0, revenue: 0 }));
            visas.forEach(v => {
                const d = parseDate(v.applicationDate);
                if (d && d >= cutoff && d <= endDt) totals[d.getDay()].applications += 1;
            });
            [...policies, ...gatewayPolicies].forEach(p => {
                const d = getPolicyDate(p);
                if (d && d >= cutoff && d <= endDt) totals[d.getDay()].revenue += getPolicyAmount(p) / 1000;
            });
            return totals;
        }
    }, [visas, policies, gatewayPolicies, salesPeriod]);

    // Keep weeklyOverview for backward compat with other usages
    const weeklyOverview = useMemo(() => {
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const totals = days.map(d => ({ day: d, applications: 0, revenue: 0 }));
        visas.forEach(v => { const d = parseDate(v.applicationDate); if (d) totals[d.getDay()].applications += 1; });
        [...policies, ...gatewayPolicies].forEach(p => {
            const d = getPolicyDate(p);
            if (d) totals[d.getDay()].revenue += getPolicyAmount(p) / 1000;
        });
        return totals;
    }, [visas, policies, gatewayPolicies]);

    const donutData = useMemo(() => {
        const now = new Date();
        let cutoff = null;
        if (overallPeriod === "Last 3 Months") { cutoff = new Date(now); cutoff.setMonth(cutoff.getMonth() - 3); }
        else if (overallPeriod === "Last 6 Months") { cutoff = new Date(now); cutoff.setMonth(cutoff.getMonth() - 6); }
        else if (overallPeriod === "Last 12 Months") { cutoff = new Date(now); cutoff.setFullYear(cutoff.getFullYear() - 1); }
        else if (overallPeriod === "This Year") { cutoff = new Date(now.getFullYear(), 0, 1); }
        const filtered = cutoff ? visas.filter(v => { const d = parseDate(v.applicationDate); return d && d >= cutoff; }) : visas;
        const approved = filtered.filter(v => v.status === "Approve").length;
        const pending = filtered.filter(v => v.status === "Doc Received" || v.status === "Analyzing").length;
        const rejected = filtered.filter(v => v.status === "Reject").length;
        const total = approved + pending + rejected;
        return {
            total, approved, pending, rejected,
            approvedPct: total ? Math.round((approved / total) * 100) : 0,
            pendingPct: total ? Math.round((pending / total) * 100) : 0,
            chart: [
                { name: "Approve", value: approved || 0.0001, color: "#22C55E" },
                { name: "Pending", value: pending || 0.0001, color: "#F97316" },
                { name: "Reject", value: rejected || 0.0001, color: "#E2E8F0" },
            ],
        };
    }, [visas, overallPeriod]);

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
        { id: "inquiries", label: "Umrah Requests", icon: <FaKaaba /> },
        { id: "messages", label: "Messages", icon: <MdMessage /> },
        { id: "subadmins", label: "Sub-Admins", icon: <FaUsersCog /> },
    ];

    const pageTitle = activeTab === "overview" ? "Dashboard" : navItems.find(n => n.id === activeTab)?.label || activeTab;
    const visaCountries = useMemo(() => {
        const set = new Set(visas.map(v => v.country).filter(Boolean));
        return set.size;
    }, [visas]);

    const pageSubtitle = activeTab === "visas"
        ? null
        : ({
            overview: "Your travel agency overview",
            inquiries: "Track Umrah package inquiries and bookings",
            messages: "Customer messages and support requests",
            subadmins: "Team access control and permissions",
        }[activeTab] || "\u00A0");

    return (
        <div className="flex h-screen bg-[#f5f5f5] overflow-hidden"
            style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif" }}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');`}</style>
            <ToastContainer />

            {/* ─── MOBILE SIDEBAR BACKDROP ─────────────────────────── */}
            {mobileSidebarOpen && (
                <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setMobileSidebarOpen(false)} />
            )}

            {/* ─── SIDEBAR ─────────────────────────────────────────── */}
            <aside className={`${sidebarCollapsed ? "lg:w-[70px]" : "lg:w-[200px]"} w-[220px] fixed lg:static inset-y-0 left-0 z-50 bg-white flex flex-col border-r border-gray-200 transition-all duration-300 shrink-0 ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`} style={{ minHeight: "100vh" }}>
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
                                    onClick={() => { setActiveTab(item.id); setMobileSidebarOpen(false); }}
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
                <header className="h-[56px] bg-white border-b border-gray-200 flex items-center px-3 sm:px-6 shrink-0">
                    <button onClick={() => setMobileSidebarOpen(p => !p)}
                        className="w-8 h-8 flex lg:hidden items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors mr-2">
                        <MdMenu className="text-xl" />
                    </button>
                    <button onClick={() => setSidebarCollapsed(p => !p)}
                        className="w-8 h-8 hidden lg:flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors mr-4">
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
                                        className="absolute right-0 top-11 w-[calc(100vw-2rem)] max-w-80 bg-white rounded-2xl border border-gray-200 shadow-xl z-50 overflow-hidden">
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
                                        className="absolute right-0 top-11 w-[calc(100vw-2rem)] max-w-64 bg-white rounded-2xl border border-gray-200 shadow-xl z-50 overflow-hidden">
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
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#f7f8fa]">

                    {/* Page heading */}
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mb-7"
                    >
                        <h1 className="text-4xl font-bold text-slate-800 capitalize tracking-tight">{pageTitle}</h1>
                        {activeTab === "visas" ? (
                            <p className="text-base text-gray-500 font-medium mt-1">
                                Managing applications for{" "}
                                <span className="text-orange-500 font-bold">{visaCountries} {visaCountries === 1 ? "country" : "countries"}</span>
                            </p>
                        ) : (
                            <p className="text-base text-gray-500 font-medium mt-1">{pageSubtitle}</p>
                        )}
                    </motion.div>

                    {/* ════ OVERVIEW TAB ════ */}
                    {activeTab === "overview" && (
                        <div className="space-y-6">
                            {/* KPI Cards */}
                            <motion.div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5" initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}>
                                <motion.div variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
                                    whileHover={{ y: -4, boxShadow: "0 12px 24px -8px rgba(249,123,79,0.25)" }} transition={{ duration: 0.35, ease: "easeOut" }}
                                    onClick={() => navigate("/admin/revenue")} whileTap={{ scale: 0.97 }}
                                    className="bg-[#FEE8E0] rounded-2xl p-5 border border-black/5 cursor-pointer">
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
                                    { label: "Total Approved Visas", value: stats.approved, trend: "+35% vs Last Month", trendColor: "text-emerald-600", action: () => goToVisas("Approve"), icon: <MdOutlineContentCopy className="text-orange-500 text-2xl" />, iconBg: "bg-orange-50" },
                                    { label: "Docs Awaiting Review", value: stats.pending, trend: "-20% vs Last Month", trendColor: "text-red-500", action: () => goToVisas("Doc Received"), icon: <MdOutlineCreditCard className="text-orange-500 text-2xl" />, iconBg: "bg-orange-50" },
                                    { label: "Rejected Applications", value: stats.rejected, trend: "-20% vs Last Month", trendColor: "text-red-500", action: () => goToVisas("Reject"), icon: <MdReceipt className="text-amber-500 text-2xl" />, iconBg: "bg-amber-50" },
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
                                        <div className="relative">
                                            <button
                                                onClick={() => { setShowSalesDropdown(p => !p); setShowOverallDropdown(false); }}
                                                className="flex items-center gap-1.5 text-sm font-bold text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
                                            >
                                                {salesPeriod} <MdKeyboardArrowDown />
                                            </button>
                                            {showSalesDropdown && (
                                                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden min-w-[160px]">
                                                    {["This Year", "Last Year", "Last 3 Months", "Last 6 Months", "Last 12 Months"].map(opt => (
                                                        <button key={opt} onClick={() => { setSalesPeriod(opt); setShowSalesDropdown(false); }}
                                                            className={`w-full text-left px-4 py-2.5 text-sm font-bold transition-colors ${salesPeriod === opt ? "bg-orange-500 text-white" : "text-gray-700 hover:bg-orange-50"}`}>
                                                            {opt}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <ResponsiveContainer width="100%" height={280}>
                                        <BarChart data={salesChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }} barGap={2} barCategoryGap="25%" barSize={22}>
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
                                        <div className="relative">
                                            <button
                                                onClick={() => { setShowOverallDropdown(p => !p); setShowSalesDropdown(false); }}
                                                className="flex items-center gap-1.5 text-sm font-bold text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
                                            >
                                                {overallPeriod} <MdKeyboardArrowDown />
                                            </button>
                                            {showOverallDropdown && (
                                                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden min-w-[160px]">
                                                    {["Last 3 Months", "Last 6 Months", "Last 12 Months", "This Year"].map(opt => (
                                                        <button key={opt} onClick={() => { setOverallPeriod(opt); setShowOverallDropdown(false); }}
                                                            className={`w-full text-left px-4 py-2.5 text-sm font-bold transition-colors ${overallPeriod === opt ? "bg-orange-500 text-white" : "text-gray-700 hover:bg-orange-50"}`}>
                                                            {opt}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-400 mb-5">Applications Overview</p>
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="relative w-[140px] h-[140px] shrink-0">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <RadialBarChart cx="50%" cy="50%" innerRadius="55%" outerRadius="100%" barSize={10}
                                                    data={[{ name: "Approve", value: donutData.approvedPct, fill: "#22C55E" }, { name: "Pending", value: donutData.pendingPct, fill: "#FFB020" }]}
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
                                                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0 ${a.status === "Approve" ? "bg-emerald-50 text-emerald-600" : a.status === "Reject" ? "bg-red-50 text-red-500" : "bg-gray-100 text-gray-500"}`}>
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
                                    <>
                                    <div className="space-y-3">
                                        {visas.filter(v => v.editApproved && !v.userConfirmed).slice((allowedEditPage-1)*ITEMS_PER_PAGE, allowedEditPage*ITEMS_PER_PAGE).map(visa => (
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
                                    <Pagination total={visas.filter(v => v.editApproved && !v.userConfirmed).length} page={allowedEditPage} onChange={setAllowedEditPage} />
                                    </>
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
                                    <>
                                    <div className="space-y-3">
                                        {visas.filter(v => v.userConfirmed).slice((recentEditPage-1)*ITEMS_PER_PAGE, recentEditPage*ITEMS_PER_PAGE).map(visa => (
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
                                    <Pagination total={visas.filter(v => v.userConfirmed).length} page={recentEditPage} onChange={setRecentEditPage} />
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ════ VISAS TAB ════ */}
                    {activeTab === "visas" && (
                        <VisaProcessList visas={filteredVisas} updateLocal={updateLocal} setSelectedDoc={setSelectedDoc} initialSearch={visaQuickFilter} startDate={startDate} setStartDate={setStartDate} endDate={endDate} setEndDate={setEndDate} pendingChanges={pendingChanges} onStage={stagePendingChange} onSavePending={sendPendingEmail} decisionDocs={decisionDocs} setDecisionDocs={setDecisionDocs} />
                    )}

                    {/* ════ UMRAH REQUESTS TAB ════ */}
                    {activeTab === "inquiries" && (
                        <UmrahProcessList requests={umrahRequests} actorRole="admin" actorName={currentUser?.email || "Admin"} />
                    )}

                    {/* ════ MESSAGES TAB ════ */}
                    {activeTab === "messages" && (
                        <MessagesTab messages={filteredMessages} adminName={currentUser?.email} />
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
                        }}
                        onStage={(patch) => stagePendingChange(selectedDoc.id, patch)} />
                )}
                {historyVisa && <EditHistoryModal visa={historyVisa} onClose={() => setHistoryVisa(null)} />}
            </AnimatePresence>
        </div>
    );
}

// ─── COUNTRY DROPDOWN (mirrors SubAdmin ModernCountryDropdown) ────────────────
function AdminCountryDropdown({ value, onChange, countries }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = React.useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsOpen(!isOpen)}
                className="appearance-none bg-gradient-to-r from-white to-gray-50 border-2 border-gray-200 hover:border-orange-300 rounded-2xl pl-4 pr-4 py-2.5 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-orange-400 outline-none cursor-pointer transition-all duration-200 flex items-center gap-2 min-w-[180px] justify-between shadow-sm hover:shadow-md"
            >
                <span className="truncate">{value === "All" ? "All Countries" : value}</span>
                <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <MdKeyboardArrowDown className="text-lg text-gray-400" />
                </motion.div>
            </motion.button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -12, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -12, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden min-w-[180px]"
                    >
                        <div className="p-2 space-y-1 max-h-64 overflow-y-auto">
                            <motion.button
                                whileHover={{ backgroundColor: "#FEF3C7" }}
                                onClick={() => { onChange("All"); setIsOpen(false); }}
                                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${value === "All" ? "bg-orange-500 text-white shadow-md shadow-orange-200" : "text-gray-700 hover:bg-orange-50"}`}
                            >
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${value === "All" ? "bg-white" : "bg-orange-500"}`} />
                                    All Countries
                                </div>
                            </motion.button>
                            <div className="my-1 border-t border-gray-100" />
                            {countries.map(country => (
                                <motion.button
                                    key={country}
                                    whileHover={{ backgroundColor: "#FEF3C7" }}
                                    onClick={() => { onChange(country); setIsOpen(false); }}
                                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${value === country ? "bg-orange-500 text-white shadow-md shadow-orange-200" : "text-gray-700 hover:bg-orange-50"}`}
                                >
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${value === country ? "bg-white" : "bg-orange-500"}`} />
                                        {country}
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ─── VISA PROCESS LIST (Sub-Admin panel styled cards) ─────────────────────────
function VisaProcessList({ visas, updateLocal, setSelectedDoc, initialSearch = "", startDate, setStartDate, endDate, setEndDate, pendingChanges = {}, onStage, onSavePending, decisionDocs = {}, setDecisionDocs }) {
    const [search, setSearch] = useState(initialSearch);
    const [statusFilter, setStatusFilter] = useState("All");
    const [countryFilter, setCountryFilter] = useState("All");
    const [page, setPage] = useState(1);

    // Derive unique countries from visa data
    const allCountries = useMemo(() => {
        const set = new Set(visas.map(v => v.country).filter(Boolean));
        return Array.from(set).sort();
    }, [visas]);

    const stats = useMemo(() => ({
        total: visas.length,
        docReceived: visas.filter(v => v.status === "Doc Received").length,
        analyzing: visas.filter(v => v.status === "Analyzing").length,
        approved: visas.filter(v => v.status === "Approve").length,
        rejected: visas.filter(v => v.status === "Reject").length,
    }), [visas]);

    useEffect(() => { setPage(1); }, [search, statusFilter, countryFilter]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return visas.filter(v => {
            const matchStatus = statusFilter === "All" || v.status === statusFilter;
            const matchCountry = countryFilter === "All" || (v.country || "").toLowerCase() === countryFilter.toLowerCase();
            const matchSearch = !q ||
                (v.applicantName || "").toLowerCase().includes(q) ||
                (v.applicationNumber || "").toLowerCase().includes(q) ||
                (v.status || "").toLowerCase().includes(q) ||
                (v.country || "").toLowerCase().includes(q);
            return matchStatus && matchCountry && matchSearch;
        });
    }, [visas, search, statusFilter, countryFilter]);

    const paginatedVisas = useMemo(() => {
        const start = (page - 1) * ITEMS_PER_PAGE;
        return filtered.slice(start, start + ITEMS_PER_PAGE);
    }, [filtered, page]);

    return (
        <div className="space-y-5">

            {/* Date Filters */}
            <div className="flex flex-wrap items-end gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div>
                    <label className="block text-sm font-bold text-slate-500 mb-1">Start Date</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="px-3 py-2 border border-slate-200 rounded-lg text-base font-medium focus:ring-2 focus:ring-orange-400 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-500 mb-1">End Date</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="px-3 py-2 border border-slate-200 rounded-lg text-base font-medium focus:ring-2 focus:ring-orange-400 outline-none"
                    />
                </div>
                {(startDate || endDate) && (
                    <button
                        onClick={() => { setStartDate(''); setEndDate(''); }}
                        className="px-3 py-2 bg-slate-100 text-slate-600 rounded-lg text-base font-bold hover:bg-slate-200 transition-colors"
                    >
                        Clear Filters
                    </button>
                )}
            </div>

            {/* Search */}
            <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-2xl border border-gray-200 shadow-sm focus-within:ring-2 focus-within:ring-orange-400/40 focus-within:border-orange-300 transition-all">
                <MdSearch className="text-gray-400 text-xl" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, application no., status..."
                    className="flex-1 text-base outline-none placeholder:text-gray-400 bg-transparent text-gray-700" />
                {search && <button onClick={() => setSearch("")} className="text-gray-400 hover:text-orange-500"><MdClear /></button>}
            </div>

            {/* Status Filter Pills + Country Dropdown */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-2 inline-flex gap-1.5 flex-wrap">
                    {["All", "Doc Received", "Analyzing", "Req Document", "Visa in Process", "Interview", "Approve", "Reject"].map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-4 py-2 text-sm font-bold rounded-xl transition-all ${
                                statusFilter === status
                                    ? "bg-orange-500 text-white shadow-md shadow-orange-200"
                                    : "hover:bg-gray-50 text-gray-500"
                            }`}
                        >
                            {status}
                            {status !== "All" && (
                                <span className={`ml-1.5 text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                                    statusFilter === status ? "bg-white/20 text-white" : "bg-gray-100 text-gray-400"
                                }`}>
                                    {status === "Doc Received" ? stats.docReceived :
                                     status === "Analyzing" ? stats.analyzing :
                                     status === "Approve" ? stats.approved :
                                     stats.rejected}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                <AdminCountryDropdown
                    value={countryFilter}
                    onChange={setCountryFilter}
                    countries={allCountries}
                />

                {countryFilter !== "All" && (
                    <motion.button
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCountryFilter("All")}
                        className="flex items-center gap-1.5 bg-orange-50 text-orange-600 text-sm font-bold px-3 py-2.5 rounded-2xl hover:bg-orange-100 transition-colors border border-orange-200"
                    >
                        {countryFilter} <MdClear className="text-base" />
                    </motion.button>
                )}
            </div>

            {/* Visa Cards */}
            <div className="space-y-4">
                {filtered.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-14 text-center">
                        <div className="w-16 h-16 rounded-3xl bg-orange-50 flex items-center justify-center mx-auto mb-4">
                            <FaPassport className="text-orange-300 text-4xl" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">
                            {statusFilter === "All" ? "No visa applications" : `No "${statusFilter}" applications`}
                        </h3>
                        <p className="text-sm text-slate-500">
                            {statusFilter === "All"
                                ? "Visa applications will appear here."
                                : "Try selecting a different status filter or search term."}
                        </p>
                    </div>
                ) : (
                    paginatedVisas.map(v => {
                        const hasResubmission = Object.keys(v.resubmittedDocs || {}).length > 0;
                        return (
                        <motion.div
                            key={v.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.22 }}
                            className={`bg-white rounded-3xl border shadow-sm p-5 md:p-6 grid gap-4 md:grid-cols-[2.4fr_1fr_1fr_0.9fr] items-center ${
                                hasResubmission ? 'border-blue-300 ring-2 ring-blue-100' : 'border-gray-200'
                            }`}
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-14 h-14 rounded-3xl bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center text-orange-600 text-2xl font-black shadow-sm">
                                    {v.applicantName?.charAt(0).toUpperCase() || "A"}
                                </div>
                                <div className="min-w-0">
                                    <p className={`text-lg truncate ${hasResubmission ? 'font-black text-blue-700' : 'font-bold text-slate-900'}`}>
                                        {v.applicantName}
                                    </p>
                                    <p className="text-sm text-slate-500 truncate">{v.email}</p>
                                    <div className="mt-3 flex flex-wrap items-center gap-2">
                                        <span className="inline-flex items-center gap-2 rounded-full bg-orange-50 text-orange-600 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] border border-orange-100">
                                            <span className="w-2 h-2 rounded-full bg-orange-500" />
                                            {v.country}
                                        </span>
                                        <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 text-slate-700 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] border border-slate-200">
                                            <span className="w-2 h-2 rounded-full bg-slate-400" />
                                            {v.visaType}
                                        </span>
                                        {hasResubmission && (
                                            <button
                                                type="button"
                                                title="Click to dismiss"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    dismissResubmissionHighlight(v.id, 'visaApplications');
                                                }}
                                                className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 text-blue-700 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.1em] border border-blue-300 hover:bg-blue-200 transition-colors cursor-pointer"
                                            >
                                                📤 Re-uploaded — Review ✕
                                            </button>
                                        )}
                                        {hasUnseenUserMessage(v) && (
                                            <button
                                                type="button"
                                                title={v.userMessage}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    markUserMessageSeen(v.id, 'visaApplications', v.userMessageAt || null);
                                                }}
                                                className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 text-purple-700 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.1em] border border-purple-300 hover:bg-purple-200 transition-colors cursor-pointer"
                                            >
                                                💬 Msg from User ✕
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Status</div>
                                <div className="flex items-center gap-2">
                                    {(pendingChanges[v.id]?.statusChange?.newStatus === 'Approve' || pendingChanges[v.id]?.statusChange?.newStatus === 'Reject' || v.status === 'Approve' || v.status === 'Reject') && (
                                        <>
                                            <label
                                                className={`shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-full cursor-pointer transition-all shadow-sm ${
                                                    decisionDocs[v.id] || v.decisionDocURL
                                                        ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                                                        : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                                }`}
                                                title={
                                                    decisionDocs[v.id]
                                                        ? `Ready to upload: ${decisionDocs[v.id].name} (click to replace)`
                                                        : v.decisionDocURL
                                                        ? 'Letter attached — click to replace'
                                                        : (pendingChanges[v.id]?.statusChange?.newStatus === 'Approve' || v.status === 'Approve') ? 'Attach visa letter' : 'Attach rejection letter'
                                                }
                                            >
                                                <MdDescription className="text-lg" />
                                                <input
                                                    type="file"
                                                    accept="image/jpeg,image/png"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) setDecisionDocs(prev => ({ ...prev, [v.id]: file }));
                                                        e.target.value = '';
                                                    }}
                                                />
                                            </label>
                                            {v.decisionDocURL && (
                                                <a
                                                    href={v.decisionDocURL}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                                                    title="View attached letter"
                                                >
                                                    <MdVisibility className="text-lg" />
                                                </a>
                                            )}
                                        </>
                                    )}
                                    <StatusDropdown
                                        id={v.id}
                                        currentStatus={v.status}
                                        collectionName="visaApplications"
                                        onUpdate={(id, up) => updateLocal('visa', id, up)}
                                        isVisa
                                        applicant={v}
                                        onStage={onStage}
                                    />
                                    <VisaDocumentRequests visa={v} />
                                    <VisaInterviewDocuments visa={v} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Edit control</div>
                                <LiveActionPanel
                                    item={v}
                                    collectionName="visaApplications"
                                    onLocalUpdate={(id, up) => updateLocal('visa', id, up)}
                                    onStage={onStage}
                                />
                            </div>

                            <div className="flex flex-col items-end justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setSelectedDoc(v)}
                                        className="inline-flex items-center justify-center w-12 h-12 rounded-3xl bg-orange-50 text-orange-600 hover:bg-orange-500 hover:text-white transition-all shadow-sm"
                                        title="View documents"
                                    >
                                        <MdVisibility className="text-xl" />
                                    </button>
                                    {(() => {
                                        const pending = pendingChanges[v.id];
                                        const pendingCount = pending
                                            ? Object.keys(pending).filter(k => k !== 'documentActions').length + (pending.documentActions?.length || 0)
                                            : 0;
                                        const hasPending = pendingCount > 0;
                                        return (
                                            <button
                                                onClick={() => onSavePending && onSavePending(v)}
                                                disabled={!hasPending}
                                                className={`relative inline-flex items-center justify-center w-12 h-12 rounded-3xl transition-all shadow-sm ${
                                                    hasPending
                                                        ? "bg-emerald-500 text-white hover:bg-emerald-600"
                                                        : "bg-slate-100 text-slate-300 cursor-not-allowed"
                                                }`}
                                                title={hasPending ? `Send 1 email with ${pendingCount} pending update(s)` : "No pending changes to email"}
                                            >
                                                <MdEmail className="text-xl" />
                                                {hasPending && (
                                                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
                                                        {pendingCount}
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })()}
                                </div>
                                <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${
                                    v.status === "Approve" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                                    v.status === "Reject" ? "bg-red-50 text-red-600 border border-red-100" :
                                    v.status === "Analyzing" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                                    "bg-sky-50 text-sky-700 border border-sky-100"
                                }`}>
                                    {v.status || "Doc Received"}
                                </span>
                            </div>
                        </motion.div>
                        );
                    })
                )}
            </div>
            <Pagination total={filtered.length} page={page} onChange={setPage} />
        </div>
    );
}