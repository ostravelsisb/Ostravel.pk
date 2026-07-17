import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    MdDashboard, MdLogout, MdVisibility, MdCheckCircle, MdSave,
    MdLockOutline, MdLockOpen, MdPerson, MdPublic,
    MdNotificationsNone, MdMenu, MdSearch, MdClear,
    MdKeyboardArrowDown, MdMessage, MdSwapHoriz, MdReceipt,
    MdOutlineContentCopy, MdOutlineCreditCard, MdAttachFile
} from "react-icons/md";
import { FaUserShield, FaPassport, FaRegPaperPlane } from "react-icons/fa";
import { collection, query, getDocs, orderBy, doc, updateDoc, serverTimestamp, where, onSnapshot } from "firebase/firestore";
import { db, signOut } from "../firbase";
import { useAuth } from "../Context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
    RadialBarChart, RadialBar
} from "recharts";

// External Components
import DocumentViewer from "../Components/DocumentViewer";
import EditHistoryModal from "../Components/EditHistoryModal";
import { toggleEditApproval, saveAdminMessage, dismissResubmissionHighlight, uploadDecisionLetter } from "../Utils/ApplicationEditUtils";
import { sendConsolidatedUpdateEmail } from "../Utils/emailService";
import ToastContainer, { notify } from "../Components/Toast";
import { logStatusChange, logVisaEdit } from "../Utils/activityLogger";


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

// --- MODERN COUNTRY DROPDOWN ---
const ModernCountryDropdown = ({ value, onChange, options, assignedCountries }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = React.useRef(null);

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
                        className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden"
                    >
                        <div className="p-2 space-y-1 max-h-64 overflow-y-auto">
                            {/* All Countries Option */}
                            <motion.button
                                whileHover={{ backgroundColor: "#FEF3C7" }}
                                onClick={() => {
                                    onChange({ target: { value: "All" } });
                                    setIsOpen(false);
                                }}
                                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                                    value === "All"
                                        ? "bg-orange-500 text-white shadow-md shadow-orange-200"
                                        : "text-gray-700 hover:bg-orange-50"
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${value === "All" ? "bg-white" : "bg-orange-500"}`} />
                                    All Countries
                                </div>
                            </motion.button>

                            {/* Divider */}
                            <div className="my-1 border-t border-gray-100" />

                            {/* Country Options */}
                            {assignedCountries.map(country => (
                                <motion.button
                                    key={country}
                                    whileHover={{ backgroundColor: "#FEF3C7" }}
                                    onClick={() => {
                                        onChange({ target: { value: country } });
                                        setIsOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                                        value === country
                                            ? "bg-orange-500 text-white shadow-md shadow-orange-200"
                                            : "text-gray-700 hover:bg-orange-50"
                                    }`}
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
};

// --- MODERN STATUS DROPDOWN ---
const ModernStatusDropdown = ({ currentStatus, onChange, loading }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = React.useRef(null);
    const options = ["Doc Received", "Analyzing", "Req Document", "Visa in Process", "Interview", "Approve", "Reject"];

    const statusColors = {
        "Doc Received": { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200", dot: "bg-sky-500" },
        "Analyzing": { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-500" },
        "Req Document": { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", dot: "bg-orange-500" },
        "Visa in Process": { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200", dot: "bg-indigo-500" },
        "Interview": { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", dot: "bg-purple-500" },
        "Approve": { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" },
        "Reject": { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", dot: "bg-red-500" },
    };

    const currentColor = statusColors[currentStatus || "Doc Received"] || statusColors["Doc Received"];

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

// --- SUB-COMPONENT: LIVE ACTION PANEL ---
const LiveActionPanel = ({ item, collectionName, onLocalUpdate, currentUser, userRole, onStage }) => {
    const [msg, setMsg] = useState(item.adminMessage || "");
    const [isSending, setIsSending] = useState(false);
    const [isToggling, setIsToggling] = useState(false);

    const handleToggle = async () => {
        const nextState = !item.editApproved;
        setIsToggling(true);
        try {
            await toggleEditApproval(item.id, collectionName, nextState, currentUser.email);
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
                <span className="text-[11px] font-bold text-orange-600 animate-bounce"></span>
            )}
            <div className="relative">
                <input
                    type="text"
                    placeholder="Why enable edit? (e.g. Invalid Passport)"
                    value={msg}
                    onChange={(e) => setMsg(e.target.value)}
                    disabled={isSending}
                    className="w-full pl-3 pr-9 py-2 text-[13px] border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-400 outline-none disabled:opacity-50"
                />
                <button
                    onClick={handleSendMessage}
                    disabled={isSending || !msg.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-orange-500 hover:text-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSending ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-2 border-orange-500 border-t-transparent"></div>
                    ) : (
                        <FaRegPaperPlane />
                    )}
                </button>
            </div>
        </div>
    );
};

// --- SUB-COMPONENT: STATUS SELECT ---
const StatusDropdown = ({ id, currentStatus, collectionName, onUpdate, country, currentUser, userRole, applicant, onStage }) => {
    const [loading, setLoading] = useState(false);

    const handleChange = async (e) => {
        const val = e.target.value;
        const oldStatus = currentStatus;
        setLoading(true);
        try {
            await updateDoc(doc(db, collectionName, id), {
                status: val,
                updatedAt: serverTimestamp(),
                lastEditedBy: {
                    uid: currentUser.uid,
                    email: currentUser.email,
                    role: userRole,
                    timestamp: new Date().toISOString()
                }
            });

            await logStatusChange(id, country, oldStatus, val, {
                uid: currentUser.uid,
                email: currentUser.email,
                role: userRole,
                displayName: currentUser.displayName || currentUser.email
            });

            onUpdate(id, { status: val });

            if (applicant && onStage) {
                onStage(id, { statusChange: { oldStatus, newStatus: val } });
            }
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    return (
        <ModernStatusDropdown 
            currentStatus={currentStatus} 
            onChange={handleChange}
            loading={loading}
        />
    );
};

export default function SubAdminPanel() {
    const [activeTab, setActiveTab] = useState("overview");
    const [visas, setVisas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [historyVisa, setHistoryVisa] = useState(null);
    const [statusFilter, setStatusFilter] = useState("All");
    const [countryFilter, setCountryFilter] = useState("All");
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [showNotifDropdown, setShowNotifDropdown] = useState(false);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [visaPage, setVisaPage] = useState(1);
    const notifRef = React.useRef(null);
    const profileRef = React.useRef(null);

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifDropdown(false);
            if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfileDropdown(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Date Filters
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const [salesPeriod, setSalesPeriod] = useState("This Week");
    const [overallPeriod, setOverallPeriod] = useState("Last 6 Months");
    const [showSalesDropdown, setShowSalesDropdown] = useState(false);
    const [showOverallDropdown, setShowOverallDropdown] = useState(false);
    const { currentUser, userData, userRole } = useAuth();
    const navigate = useNavigate();

    // Get assigned countries from userData
    const assignedCountries = userData?.assignedCountries || [];

    // Data Fetching - Only assigned countries
    useEffect(() => {
        if (assignedCountries.length === 0) {
            setLoading(false);
            setVisas([]);
            return;
        }

        const assignedLower = assignedCountries.map(c => c.toLowerCase());

        // Realtime listener — reflects user uploads/reuploads instantly, no refresh needed.
        const unsub = onSnapshot(
            query(collection(db, "visaApplications"), orderBy("applicationDate", "desc")),
            (snap) => {
                const allVisas = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                const filtered = allVisas.filter(visa =>
                    assignedLower.includes((visa.country || "").toLowerCase())
                );
                setVisas(filtered);
                // Keep an open Document Viewer in sync too, so a user's
                // re-upload shows up instantly without closing/reopening it.
                setSelectedDoc(prev => prev ? (filtered.find(v => v.id === prev.id) || prev) : prev);
                setLoading(false);
            },
            (e) => { console.error("Error fetching visas:", e); setLoading(false); }
        );

        return () => unsub();
    }, [assignedCountries]);

    // Local Update Helper
    const updateLocal = (id, updates) => {
        setVisas(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));
    };

    // ─── Pending per-user email changes (batched, only sent on "Save") ────────
    const [pendingChanges, setPendingChanges] = useState({});
    // ─── Decision letter uploads (per visa id) ───────────────────────────────
    const [decisionDocs, setDecisionDocs] = useState({}); // { [visaId]: File }

    const stagePendingChange = (id, patch) => {
        setPendingChanges(prev => {
            const existing = prev[id] || {};
            const merged = { ...existing, ...patch };
            if (patch.documentActions) {
                merged.documentActions = [...(existing.documentActions || []), ...patch.documentActions];
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

        // Upload decision letter if provided
        let decisionDocURL = null;
        let decisionDocName = null;
        const decisionFile = decisionDocs[visaItem.id];
        if (decisionFile) {
            try {
                notify.success("Uploading decision letter...");
                const newStatus = pending.statusChange?.newStatus;
                const uploaded = await uploadDecisionLetter(decisionFile, visaItem.id, "visaApplications", newStatus);
                decisionDocURL = uploaded.decisionDocURL;
                decisionDocName = uploaded.decisionDocName;
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

    // Stats
    const stats = useMemo(() => ({
        total: visas.length,
        docReceived: visas.filter(v => v.status === "Doc Received").length,
        analyzing: visas.filter(v => v.status === "Analyzing").length,
        approved: visas.filter(v => v.status === "Approve").length,
        rejected: visas.filter(v => v.status === "Reject").length,
    }), [visas]);

    // --- CHART DATA ---
    const parseDate = (d) => {
        if (!d) return null;
        if (d.toDate) return d.toDate();
        return new Date(d);
    };

    const weeklyOverview = useMemo(() => {
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const totals = days.map(d => ({ day: d, applications: 0, approved: 0 }));
        visas.forEach(v => {
            const d = parseDate(v.applicationDate);
            if (!d) return;
            totals[d.getDay()].applications += 1;
            if (v.status === "Approve") totals[d.getDay()].approved += 1;
        });
        return totals;
    }, [visas]);

    const salesChartData = useMemo(() => {
        const now = new Date();
        let cutoff = null;
        let useMonthly = false;
        if (salesPeriod === "This Week") {
            const start = new Date(now); start.setDate(start.getDate() - start.getDay()); start.setHours(0,0,0,0);
            cutoff = start;
        } else if (salesPeriod === "Last Month") {
            cutoff = new Date(now); cutoff.setMonth(cutoff.getMonth() - 1);
        } else if (salesPeriod === "Last 3 Months") {
            cutoff = new Date(now); cutoff.setMonth(cutoff.getMonth() - 3); useMonthly = true;
        } else if (salesPeriod === "This Year") {
            cutoff = new Date(now.getFullYear(), 0, 1); useMonthly = true;
        }
        if (useMonthly) {
            const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
            const totals = months.map(m => ({ day: m, applications: 0, approved: 0 }));
            visas.forEach(v => {
                const d = parseDate(v.applicationDate);
                if (d && d >= cutoff) {
                    totals[d.getMonth()].applications += 1;
                    if (v.status === "Approve") totals[d.getMonth()].approved += 1;
                }
            });
            if (salesPeriod === "This Year") return totals.slice(0, now.getMonth() + 1);
            return totals;
        } else {
            const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
            const totals = days.map(d => ({ day: d, applications: 0, approved: 0 }));
            visas.forEach(v => {
                const d = parseDate(v.applicationDate);
                if (d && (!cutoff || d >= cutoff)) {
                    totals[d.getDay()].applications += 1;
                    if (v.status === "Approve") totals[d.getDay()].approved += 1;
                }
            });
            return totals;
        }
    }, [visas, salesPeriod]);

    const donutData = useMemo(() => {
        const now = new Date();
        let cutoff = null;
        if (overallPeriod === "Last 3 Months") { cutoff = new Date(now); cutoff.setMonth(cutoff.getMonth() - 3); }
        else if (overallPeriod === "Last 6 Months") { cutoff = new Date(now); cutoff.setMonth(cutoff.getMonth() - 6); }
        else if (overallPeriod === "Last 12 Months") { cutoff = new Date(now); cutoff.setFullYear(cutoff.getFullYear() - 1); }
        else if (overallPeriod === "This Year") { cutoff = new Date(now.getFullYear(), 0, 1); }
        const filtered = cutoff ? visas.filter(v => { const d = parseDate(v.applicationDate); return d && d >= cutoff; }) : visas;
        const approved = filtered.filter(v => v.status === "Approve").length;
        const docReceived = filtered.filter(v => v.status === "Doc Received").length;
        const analyzing = filtered.filter(v => v.status === "Analyzing").length;
        const total = filtered.length || 0;
        return {
            approved,
            pending: docReceived + analyzing,
            approvedPct: total ? Math.round((approved / total) * 100) : 0,
            pendingPct: total ? Math.round(((docReceived + analyzing) / total) * 100) : 0,
        };
    }, [visas, overallPeriod]);

    // Filtered visas
    const filteredVisas = useMemo(() => {
        return visas.filter(v => {
            if (statusFilter !== "All" && v.status !== statusFilter) return false;
            if (countryFilter !== "All" && (v.country || "").toLowerCase() !== countryFilter.toLowerCase()) return false;
            if (!startDate && !endDate) return true;
            const appDate = v.applicationDate?.toDate
                ? v.applicationDate.toDate()
                : (v.applicationDate ? new Date(v.applicationDate) : null);
            if (!appDate) return false;
            const start = startDate ? new Date(startDate) : new Date('1970-01-01');
            const end = endDate ? new Date(endDate) : new Date();
            end.setHours(23, 59, 59);
            return appDate >= start && appDate <= end;
        });
    }, [visas, statusFilter, countryFilter, startDate, endDate]);

    // Reset visa page when filters change
    useEffect(() => { setVisaPage(1); }, [statusFilter, countryFilter, startDate, endDate]);

    const paginatedVisas = useMemo(() => {
        const start = (visaPage - 1) * ITEMS_PER_PAGE;
        return filteredVisas.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredVisas, visaPage]);

    const navItems = [
        { id: "overview", label: "Dashboard", icon: <MdDashboard /> },
        { id: "visas", label: "Visa Applications", icon: <FaPassport /> },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-[#f7f8fa]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-14 w-14 border-b-4 border-orange-500 mx-auto mb-4"></div>
                    <p className="text-slate-600 font-bold text-lg">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div
            className="flex h-screen bg-[#f7f8fa] overflow-hidden"
            style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif" }}
        >
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
            `}</style>
            <ToastContainer />

            {/* ===================== MOBILE SIDEBAR BACKDROP ===================== */}
            {mobileSidebarOpen && (
                <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setMobileSidebarOpen(false)} />
            )}

            {/* ===================== SIDEBAR ===================== */}
            <aside
                className={`${sidebarCollapsed ? "lg:w-[70px]" : "lg:w-[210px]"} w-[220px] fixed lg:static inset-y-0 left-0 z-50 bg-white flex flex-col border-r border-gray-200 transition-all duration-300 shrink-0 ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
                style={{ minHeight: "100vh" }}
            >
                {/* Logo area */}
                <div className={`flex items-center gap-2 px-4 py-5 border-b border-gray-100 ${sidebarCollapsed ? "justify-center" : ""}`}>
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-400 rounded-lg flex items-center justify-center shrink-0 shadow shadow-orange-200">
                        <FaUserShield className="text-white text-base" />
                    </div>
                    {!sidebarCollapsed && (
                        <div>
                            <p className="text-base font-bold text-slate-800 leading-none">Sub-Admin</p>
                            <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Travel Agency</p>
                        </div>
                    )}
                </div>

                {/* User info card — visible when expanded */}
                {!sidebarCollapsed && (
                    <div className="mx-3 mt-4 bg-orange-50 rounded-xl p-3 border border-orange-100">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-orange-400 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                                {userData?.displayName?.charAt(0).toUpperCase() || "S"}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-800 truncate">{userData?.displayName || "Sub Admin"}</p>
                                <p className="text-[11px] text-slate-400 truncate">{currentUser?.email}</p>
                            </div>
                        </div>
                        <div className="border-t border-orange-100 pt-2">
                            <p className="text-[11px] font-bold text-orange-400 uppercase mb-1.5">Assigned Countries</p>
                            <div className="flex flex-wrap gap-1">
                                {assignedCountries.slice(0, 3).map(country => (
                                    <span key={country} className="text-[11px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full font-bold">
                                        {country}
                                    </span>
                                ))}
                                {assignedCountries.length > 3 && (
                                    <span className="text-[11px] text-slate-400 font-bold">+{assignedCountries.length - 3}</span>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Nav */}
                <div className="flex-1 px-3 py-4 overflow-y-auto">
                    {!sidebarCollapsed && (
                        <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-3 px-2">Main</p>
                    )}
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
                                    className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-base transition-colors group
                                        ${isActive
                                            ? "bg-orange-50 text-orange-600 font-bold"
                                            : "text-gray-500 hover:bg-gray-50 hover:text-gray-700 font-medium"
                                        }
                                        ${sidebarCollapsed ? "justify-center" : ""}
                                    `}
                                >
                                    {isActive && (
                                        <motion.span
                                            layoutId="subadmin-nav-indicator"
                                            className="absolute left-0 top-1 bottom-1 w-1 rounded-full bg-orange-500"
                                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                        />
                                    )}
                                    <span className={`text-lg shrink-0 ${isActive ? "text-orange-500" : "text-gray-400 group-hover:text-gray-600"}`}>
                                        {item.icon}
                                    </span>
                                    {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                                </motion.button>
                            );
                        })}
                    </nav>

                    {/* Account section */}
                    {!sidebarCollapsed && (
                        <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mt-6 mb-3 px-2">Account</p>
                    )}
                    {sidebarCollapsed && <div className="my-4 border-t border-gray-100" />}
                    <div className="space-y-0.5">
                        <button
                            onClick={() => signOut().then(() => navigate("/"))}
                            title={sidebarCollapsed ? "Log out" : ""}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-base text-gray-500 hover:bg-red-50 hover:text-red-500 font-medium transition-all
                                ${sidebarCollapsed ? "justify-center" : ""}
                            `}
                        >
                            <MdLogout className="text-lg shrink-0 text-gray-400" />
                            {!sidebarCollapsed && <span>Log out</span>}
                        </button>
                    </div>
                </div>
            </aside>

            {/* ===================== MAIN AREA ===================== */}
            <div className="flex-1 flex flex-col overflow-hidden">

                {/* ---- TOP BAR ---- */}
                <header className="h-[56px] bg-white border-b border-gray-200 flex items-center px-3 sm:px-6 shrink-0">
                    <button
                        onClick={() => setMobileSidebarOpen(p => !p)}
                        className="w-8 h-8 flex lg:hidden items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors mr-2"
                    >
                        <MdMenu className="text-xl" />
                    </button>
                    <button
                        onClick={() => setSidebarCollapsed(p => !p)}
                        className="w-8 h-8 hidden lg:flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors mr-4"
                    >
                        <MdMenu className="text-xl" />
                    </button>

                    <div className="flex-1" />

                    <div className="flex items-center gap-3">
                        {/* Bell */}
                        <div className="relative" ref={notifRef}>
                            <motion.button
                                whileHover={{ scale: 1.08 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => { setShowNotifDropdown(p => !p); setShowProfileDropdown(false); }}
                                className="relative w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 transition-colors"
                            >
                                <MdNotificationsNone className="text-2xl" />
                                {visas.filter(v => v.userConfirmed).length > 0 && (
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", stiffness: 500 }}
                                        className="absolute -top-1 -right-1 bg-orange-500 text-white text-[11px] font-bold w-4 h-4 rounded-full flex items-center justify-center"
                                    >
                                        {visas.filter(v => v.userConfirmed).length > 9 ? "9+" : visas.filter(v => v.userConfirmed).length}
                                    </motion.span>
                                )}
                            </motion.button>

                            <AnimatePresence>
                                {showNotifDropdown && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -8, scale: 0.97 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -8, scale: 0.97 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute right-0 top-11 w-80 bg-white rounded-2xl border border-gray-200 shadow-xl z-50 overflow-hidden"
                                    >
                                        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                                            <h4 className="text-base font-bold text-gray-800">Notifications</h4>
                                            <span className="text-[12px] font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">
                                                {visas.filter(v => v.userConfirmed).length} New
                                            </span>
                                        </div>
                                        <div className="max-h-80 overflow-y-auto">
                                            {visas.filter(v => v.userConfirmed).length === 0 ? (
                                                <div className="p-6 text-center">
                                                    <MdNotificationsNone className="text-gray-200 text-4xl mx-auto mb-2" />
                                                    <p className="text-sm text-gray-400 font-bold">No new notifications</p>
                                                </div>
                                            ) : (
                                                visas.filter(v => v.userConfirmed).slice(0, 8).map(v => (
                                                    <button
                                                        key={v.id}
                                                        onClick={() => {
                                                            setSelectedDoc(v);
                                                            setShowNotifDropdown(false);
                                                        }}
                                                        className="w-full text-left px-4 py-3 hover:bg-orange-50 transition-colors border-b border-gray-50 last:border-0 flex items-center gap-3"
                                                    >
                                                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                                                            <FaPassport className="text-orange-500 text-sm" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-bold text-gray-800 truncate">{v.applicantName || "Applicant"}</p>
                                                            <p className="text-[12px] text-gray-400 truncate">{v.country} • Re-submitted for review</p>
                                                        </div>
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                        {visas.filter(v => v.userConfirmed).length > 0 && (
                                            <button
                                                onClick={() => { setActiveTab("visas"); setShowNotifDropdown(false); }}
                                                className="w-full text-center text-sm font-bold text-orange-500 py-2.5 border-t border-gray-100 hover:bg-orange-50 transition-colors"
                                            >
                                                View All Applications
                                            </button>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Avatar + Profile */}
                        <div className="relative" ref={profileRef}>
                            <motion.button
                                whileHover={{ scale: 1.08 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => { setShowProfileDropdown(p => !p); setShowNotifDropdown(false); }}
                                className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-base shadow shadow-orange-200 cursor-pointer"
                            >
                                {userData?.displayName?.charAt(0).toUpperCase() || (currentUser?.email || "S")[0].toUpperCase()}
                            </motion.button>

                            <AnimatePresence>
                                {showProfileDropdown && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -8, scale: 0.97 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -8, scale: 0.97 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute right-0 top-11 w-64 bg-white rounded-2xl border border-gray-200 shadow-xl z-50 overflow-hidden"
                                    >
                                        <div className="p-4 border-b border-gray-100 bg-gradient-to-br from-orange-50 to-amber-50 flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-base shrink-0">
                                                {userData?.displayName?.charAt(0).toUpperCase() || (currentUser?.email || "S")[0].toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-base font-bold text-gray-800 truncate">{userData?.displayName || "Sub Admin"}</p>
                                                <p className="text-[12px] text-gray-500 truncate">{currentUser?.email}</p>
                                            </div>
                                        </div>
                                        <div className="p-2">
                                            <button
                                                onClick={() => { setActiveTab("overview"); setShowProfileDropdown(false); }}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-medium text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                                            >
                                                <MdDashboard className="text-lg text-gray-400" /> Dashboard
                                            </button>
                                            <button
                                                onClick={() => { setActiveTab("visas"); setShowProfileDropdown(false); }}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-medium text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                                            >
                                                <FaPassport className="text-base text-gray-400" /> Visa Applications
                                            </button>
                                            <div className="my-1 border-t border-gray-100" />
                                            <button
                                                onClick={() => signOut().then(() => navigate("/"))}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-bold text-red-500 hover:bg-red-50 transition-colors"
                                            >
                                                <MdLogout className="text-lg" /> Log out
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </header>

                {/* ---- SCROLLABLE CONTENT ---- */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#f7f8fa]">

                    {/* Page heading */}
                    <div className="mb-7">
                        <h1 className="text-4xl font-bold text-slate-800 tracking-tight">
                            {activeTab === "overview" ? "Dashboard" : "Visa Applications"}
                        </h1>
                        <p className="text-base text-gray-500 font-medium mt-1">
                            Managing applications for{" "}
                            <span className="text-orange-500 font-bold">
                                {assignedCountries.length} {assignedCountries.length === 1 ? "country" : "countries"}
                            </span>
                        </p>
                    </div>

                    {/* =================== OVERVIEW TAB =================== */}
                    {activeTab === "overview" && (
                        <div className="space-y-6">

                            {/* === DATE FILTERS === */}
                            {/* <div className="flex flex-wrap items-end gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
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
                                <span className="ml-auto text-sm font-bold text-slate-400 self-center">
                                    Showing: {startDate || 'Start'} → {endDate || 'Now'}
                                </span>
                            </div> */}

                            {/* === TOP KPI ROW (5 pastel cards) === */}
                            <motion.div
                                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4"
                                initial="hidden"
                                animate="show"
                                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
                            >
                                {/* Total */}
                                <motion.div
                                    variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
                                    whileHover={{ y: -4, boxShadow: "0 12px 24px -8px rgba(99,102,241,0.25)" }}
                                    transition={{ duration: 0.35, ease: "easeOut" }}
                                    onClick={() => { setStatusFilter("All"); setActiveTab("visas"); }}
                                    whileTap={{ scale: 0.97 }}
                                    className="bg-[#EEF0FD] rounded-2xl p-5 border border-black/5 cursor-pointer"
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white text-xl shadow-sm shadow-orange-300">
                                            <FaPassport />
                                        </div>
                                        <p className="text-base font-bold text-gray-600">Total</p>
                                    </div>
                                    <h3 className="text-3xl font-bold text-gray-800 mb-1">{stats.total}</h3>
                                    <p className="text-[13px] font-bold text-orange-500">All Applications</p>
                                </motion.div>

                                {/* Doc Received */}
                                <motion.div
                                    variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
                                    whileHover={{ y: -4, boxShadow: "0 12px 24px -8px rgba(14,165,233,0.25)" }}
                                    transition={{ duration: 0.35, ease: "easeOut" }}
                                    onClick={() => { setStatusFilter("Doc Received"); setActiveTab("visas"); }}
                                    whileTap={{ scale: 0.97 }}
                                    className="bg-[#E0F3FE] rounded-2xl p-5 border border-black/5 cursor-pointer"
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center text-white text-xl shadow-sm shadow-sky-300">
                                            <MdOutlineContentCopy />
                                        </div>
                                        <p className="text-base font-bold text-gray-600">Doc Received</p>
                                    </div>
                                    <h3 className="text-3xl font-bold text-gray-800 mb-1">{stats.docReceived}</h3>
                                    <p className="text-[13px] font-bold text-sky-500">Awaiting Review</p>
                                </motion.div>

                                {/* Analyzing */}
                                <motion.div
                                    variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
                                    whileHover={{ y: -4, boxShadow: "0 12px 24px -8px rgba(251,191,36,0.25)" }}
                                    transition={{ duration: 0.35, ease: "easeOut" }}
                                    onClick={() => { setStatusFilter("Analyzing"); setActiveTab("visas"); }}
                                    whileTap={{ scale: 0.97 }}
                                    className="bg-[#FFF8E1] rounded-2xl p-5 border border-black/5 cursor-pointer"
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-amber-400 flex items-center justify-center text-white text-xl shadow-sm shadow-amber-200">
                                            <MdSwapHoriz />
                                        </div>
                                        <p className="text-base font-bold text-gray-600">Analyzing</p>
                                    </div>
                                    <h3 className="text-3xl font-bold text-gray-800 mb-1">{stats.analyzing}</h3>
                                    <p className="text-[13px] font-bold text-amber-500">In Progress</p>
                                </motion.div>

                                {/* Approved */}
                                <motion.div
                                    variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
                                    whileHover={{ y: -4, boxShadow: "0 12px 24px -8px rgba(16,185,129,0.25)" }}
                                    transition={{ duration: 0.35, ease: "easeOut" }}
                                    onClick={() => { setStatusFilter("Approve"); setActiveTab("visas"); }}
                                    whileTap={{ scale: 0.97 }}
                                    className="bg-[#E6F9F0] rounded-2xl p-5 border border-black/5 cursor-pointer"
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white text-xl shadow-sm shadow-emerald-300">
                                            <MdCheckCircle />
                                        </div>
                                        <p className="text-base font-bold text-gray-600">Approved</p>
                                    </div>
                                    <h3 className="text-3xl font-bold text-gray-800 mb-1">{stats.approved}</h3>
                                    <p className="text-[13px] font-bold text-emerald-500">+22% this month</p>
                                </motion.div>

                                {/* Rejected */}
                                <motion.div
                                    variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
                                    whileHover={{ y: -4, boxShadow: "0 12px 24px -8px rgba(248,113,113,0.25)" }}
                                    transition={{ duration: 0.35, ease: "easeOut" }}
                                    onClick={() => { setStatusFilter("Reject"); setActiveTab("visas"); }}
                                    whileTap={{ scale: 0.97 }}
                                    className="bg-[#FEE8E8] rounded-2xl p-5 border border-black/5 cursor-pointer"
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-red-400 flex items-center justify-center text-white text-xl shadow-sm shadow-red-200">
                                            <MdReceipt />
                                        </div>
                                        <p className="text-base font-bold text-gray-600">Rejected</p>
                                    </div>
                                    <h3 className="text-3xl font-bold text-gray-800 mb-1">{stats.rejected}</h3>
                                    <p className="text-[13px] font-bold text-red-400">Applications</p>
                                </motion.div>
                            </motion.div>

                            {/* === SECONDARY STATS ROW (3 white cards) === */}
                            <motion.div
                                className="grid grid-cols-1 md:grid-cols-3 gap-5"
                                initial="hidden"
                                animate="show"
                                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } }}
                            >
                                <motion.div
                                    variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
                                    whileHover={{ y: -3, boxShadow: "0 14px 28px -12px rgba(15,23,42,0.14)" }}
                                    transition={{ duration: 0.35, ease: "easeOut" }}
                                    className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm cursor-default"
                                >
                                    <div className="flex items-start justify-between mb-1">
                                        <div>
                                            <h3 className="text-4xl font-bold text-gray-800">{stats.docReceived}</h3>
                                            <p className="text-base font-semibold text-gray-400 mt-1">Docs Awaiting Review</p>
                                        </div>
                                        <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                                            <MdOutlineContentCopy className="text-orange-500 text-2xl" />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between pt-4 mt-3 border-t border-gray-100">
                                        <span className="text-[13px] font-bold text-emerald-600">+35% vs Last Month</span>
                                        <button onClick={() => { setStatusFilter("Doc Received"); setActiveTab("visas"); }} className="text-[13px] font-bold text-orange-500 underline hover:text-orange-600">View</button>
                                    </div>
                                </motion.div>

                                <motion.div
                                    variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
                                    whileHover={{ y: -3, boxShadow: "0 14px 28px -12px rgba(15,23,42,0.14)" }}
                                    transition={{ duration: 0.35, ease: "easeOut" }}
                                    className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm cursor-default"
                                >
                                    <div className="flex items-start justify-between mb-1">
                                        <div>
                                            <h3 className="text-4xl font-bold text-gray-800">{stats.analyzing}</h3>
                                            <p className="text-base font-semibold text-gray-400 mt-1">Currently Analyzing</p>
                                        </div>
                                        <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                                            <MdOutlineCreditCard className="text-orange-500 text-2xl" />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between pt-4 mt-3 border-t border-gray-100">
                                        <span className="text-[13px] font-bold text-amber-500">In Progress</span>
                                        <button onClick={() => { setStatusFilter("Analyzing"); setActiveTab("visas"); }} className="text-[13px] font-bold text-orange-500 underline hover:text-orange-600">View</button>
                                    </div>
                                </motion.div>

                                <motion.div
                                    variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
                                    whileHover={{ y: -3, boxShadow: "0 14px 28px -12px rgba(15,23,42,0.14)" }}
                                    transition={{ duration: 0.35, ease: "easeOut" }}
                                    className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm cursor-default"
                                >
                                    <div className="flex items-start justify-between mb-1">
                                        <div>
                                            <h3 className="text-4xl font-bold text-gray-800">{stats.rejected}</h3>
                                            <p className="text-base font-semibold text-gray-400 mt-1">Rejected Applications</p>
                                        </div>
                                        <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                                            <MdReceipt className="text-amber-500 text-2xl" />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between pt-4 mt-3 border-t border-gray-100">
                                        <span className="text-[13px] font-bold text-red-500">-20% vs Last Month</span>
                                        <button onClick={() => { setStatusFilter("Reject"); setActiveTab("visas"); }} className="text-[13px] font-bold text-orange-500 underline hover:text-orange-600">View</button>
                                    </div>
                                </motion.div>
                            </motion.div>

                            {/* === CHARTS ROW === */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                                {/* Bar Chart — Applications this week */}
                                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                                    <div className="flex items-center justify-between mb-5">
                                        <h3 className="text-lg font-bold text-gray-800">Applications Overview</h3>
                                        <div className="relative">
                                            <button
                                                onClick={() => { setShowSalesDropdown(p => !p); setShowOverallDropdown(false); }}
                                                className="flex items-center gap-1.5 text-sm font-bold text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
                                            >
                                                {salesPeriod} <MdKeyboardArrowDown className="text-base" />
                                            </button>
                                            {showSalesDropdown && (
                                                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden min-w-[160px]">
                                                    {["This Week", "Last Month", "Last 3 Months", "This Year"].map(opt => (
                                                        <button key={opt} onClick={() => { setSalesPeriod(opt); setShowSalesDropdown(false); }}
                                                            className={`w-full text-left px-4 py-2.5 text-sm font-bold transition-colors ${salesPeriod === opt ? "bg-orange-500 text-white" : "text-gray-700 hover:bg-orange-50"}`}>
                                                            {opt}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <ResponsiveContainer width="100%" height={260}>
                                        <BarChart
                                            data={salesChartData}
                                            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                                            barGap={2}
                                            barCategoryGap="25%"
                                            barSize={22}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis
                                                dataKey="day"
                                                tick={{ fontSize: 11, fill: "#9ca3af" }}
                                                axisLine={false}
                                                tickLine={false}
                                            />
                                            <YAxis
                                                tick={{ fontSize: 11, fill: "#9ca3af" }}
                                                axisLine={false}
                                                tickLine={false}
                                                allowDecimals={false}
                                            />
                                            <Tooltip
                                                contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12, boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}
                                                cursor={{ fill: "rgba(0,0,0,0.03)" }}
                                            />
                                            <Bar dataKey="applications" name="Applications" fill="#A5B4FC" radius={[6, 6, 0, 0]} />
                                            <Bar dataKey="approved" name="Approve" fill="#6366F1" radius={[6, 6, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                    <div className="flex items-center justify-center gap-6 mt-3 text-sm font-bold text-gray-500">
                                        <span className="flex items-center gap-2">
                                            <span className="w-3 h-3 rounded-sm bg-[#A5B4FC] inline-block"></span>
                                            Applications
                                        </span>
                                        <span className="flex items-center gap-2">
                                            <span className="w-3 h-3 rounded-sm bg-[#6366F1] inline-block"></span>
                                            Approved
                                        </span>
                                    </div>
                                </div>

                                {/* Radial ring summary */}
                                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-lg font-bold text-gray-800">Status Overview</h3>
                                        <div className="relative">
                                            <button
                                                onClick={() => { setShowOverallDropdown(p => !p); setShowSalesDropdown(false); }}
                                                className="flex items-center gap-1.5 text-sm font-bold text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
                                            >
                                                {overallPeriod} <MdKeyboardArrowDown className="text-base" />
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
                                    <p className="text-sm font-semibold text-gray-400 mb-5">Applications breakdown</p>

                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="relative w-[140px] h-[140px] shrink-0">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <RadialBarChart
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius="55%"
                                                    outerRadius="100%"
                                                    barSize={10}
                                                    data={[
                                                        { name: "Approve", value: donutData.approvedPct, fill: "#6366F1" },
                                                        { name: "Pending", value: donutData.pendingPct, fill: "#FBBF24" },
                                                    ]}
                                                    startAngle={90}
                                                    endAngle={-270}
                                                >
                                                    <RadialBar
                                                        background={{ fill: "#EEF1F4" }}
                                                        dataKey="value"
                                                        cornerRadius={20}
                                                        clockWise
                                                    />
                                                </RadialBarChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="flex-1 space-y-4">
                                            <div>
                                                <p className="text-2xl font-bold text-gray-800 leading-none">{donutData.approved}</p>
                                                <p className="text-[13px] font-bold text-orange-500 mt-0.5">Approved</p>
                                                <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full">
                                                    ▲ {donutData.approvedPct}%
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-2xl font-bold text-gray-800 leading-none">{donutData.pending}</p>
                                                <p className="text-[13px] font-bold text-amber-500 mt-0.5">Pending</p>
                                                <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                                                    ▲ {donutData.pendingPct}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mt-auto pt-6 border-t border-gray-100 text-center">
                                        <div className="border-r border-gray-100">
                                            <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
                                            <p className="text-[11px] font-bold text-gray-400 uppercase mt-1">Total</p>
                                        </div>
                                        <div>
                                            <p className="text-3xl font-bold text-gray-800">{stats.rejected}</p>
                                            <p className="text-[11px] font-bold text-gray-400 uppercase mt-1">Rejected</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* === ASSIGNED COUNTRIES + RECENT APPS (side by side) === */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                                {/* Assigned Countries */}
                                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                                    <div className="flex items-center justify-between mb-5">
                                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                            <MdPublic className="text-orange-500" />
                                            Your Assigned Countries
                                        </h3>
                                        <span className="text-sm font-bold text-orange-500 bg-orange-50 px-3 py-1 rounded-lg">
                                            {assignedCountries.length} Total
                                        </span>
                                    </div>
                                    {assignedCountries.length === 0 ? (
                                        <div className="text-center py-10">
                                            <MdPublic className="text-gray-200 text-4xl mx-auto mb-2" />
                                            <p className="text-gray-400 font-bold text-base">No countries assigned yet</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-3">
                                            {assignedCountries.map(country => {
                                                const count = visas.filter(v => (v.country || "").toLowerCase() === country.toLowerCase()).length;
                                                return (
                                                    <motion.button
                                                        key={country}
                                                        onClick={() => { setCountryFilter(country); setStatusFilter("All"); setActiveTab("visas"); }}
                                                        whileHover={{ y: -2 }}
                                                        whileTap={{ scale: 0.97 }}
                                                        className="text-left bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-xl border border-orange-100 hover:border-orange-300 transition-colors"
                                                    >
                                                        <p className="font-bold text-slate-800 text-base">{country}</p>
                                                        <p className="text-sm text-orange-500 mt-1 font-semibold">{count} application{count !== 1 ? "s" : ""}</p>
                                                    </motion.button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* Recent Applications */}
                                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                                    <div className="flex items-center justify-between mb-5">
                                        <h3 className="text-lg font-bold text-gray-800">Recent Applications</h3>
                                        <span className="text-sm font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-lg">Latest 5</span>
                                    </div>
                                    {visas.slice(0, 5).length === 0 ? (
                                        <div className="text-center py-10">
                                            <FaPassport className="text-gray-200 text-4xl mx-auto mb-2" />
                                            <p className="text-gray-400 font-bold text-base">No applications yet</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {visas.slice(0, 5).map(visa => (
                                                <motion.button
                                                    key={visa.id}
                                                    onClick={() => setSelectedDoc(visa)}
                                                    whileHover={{ x: 2 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-orange-50/50 transition-colors text-left"
                                                >
                                                    <div className="w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
                                                        <FaPassport className="text-orange-500 text-base" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-bold text-gray-800 text-base truncate">{visa.applicantName}</p>
                                                        <p className="text-[12px] text-gray-400 truncate">{visa.country} • {visa.visaType}</p>
                                                    </div>
                                                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0 ${
                                                        visa.status === "Approve" ? "bg-emerald-50 text-emerald-600" :
                                                        visa.status === "Reject" ? "bg-red-50 text-red-500" :
                                                        visa.status === "Analyzing" ? "bg-amber-50 text-amber-600" :
                                                        "bg-sky-50 text-sky-600"
                                                    }`}>
                                                        {visa.status || "Doc Received"}
                                                    </span>
                                                </motion.button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* === ALLOWED EDITED APPLICATIONS === */}
                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                                <div className="flex items-center justify-between mb-5">
                                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                        <MdLockOpen className="text-emerald-500" />
                                        Allowed Edited Applications
                                    </h3>
                                    {visas.filter(v => v.editApproved && !v.userConfirmed).length > 0 && (
                                        <span className="bg-emerald-100 text-emerald-700 text-sm font-bold px-3 py-1 rounded-full">
                                            {visas.filter(v => v.editApproved && !v.userConfirmed).length} Pending
                                        </span>
                                    )}
                                </div>
                                {visas.filter(v => v.editApproved && !v.userConfirmed).length === 0 ? (
                                    <div className="text-center py-12">
                                        <MdLockOpen className="text-gray-200 text-5xl mx-auto mb-3" />
                                        <p className="text-gray-500 font-bold">No edit-allowed applications</p>
                                        <p className="text-base text-gray-400 mt-1">Applications with edit permission will appear here</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {visas.filter(v => v.editApproved && !v.userConfirmed).map(visa => (
                                            <div key={visa.id} className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                                                <div className="flex items-center gap-4 flex-1">
                                                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                                                        <FaPassport className="text-emerald-600" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-bold text-gray-800">{visa.applicantName}</p>
                                                        <p className="text-sm text-gray-500">{visa.country} • {visa.visaType}</p>
                                                        {visa.adminMessage && (
                                                            <p className="text-sm text-emerald-700 mt-1 font-bold">📝 {visa.adminMessage}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <span className="text-sm font-bold text-emerald-600 bg-white px-3 py-1 rounded-full border border-emerald-100">
                                                    AWAITING EDIT
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* === RECENTLY EDITED APPLICATIONS === */}
                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                                <div className="flex items-center justify-between mb-5">
                                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                        <MdCheckCircle className="text-orange-500" />
                                        Recently Edited Applications
                                    </h3>
                                    {visas.filter(v => v.userConfirmed).length > 0 && (
                                        <span className="bg-orange-100 text-orange-700 text-sm font-bold px-3 py-1 rounded-full">
                                            {visas.filter(v => v.userConfirmed).length} New
                                        </span>
                                    )}
                                </div>
                                {visas.filter(v => v.userConfirmed).length === 0 ? (
                                    <div className="text-center py-12">
                                        <MdCheckCircle className="text-gray-200 text-5xl mx-auto mb-3" />
                                        <p className="text-gray-500 font-bold">No recently edited applications</p>
                                        <p className="text-base text-gray-400 mt-1">User-completed edits will appear here</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {visas.filter(v => v.userConfirmed).slice(0, 10).map(visa => (
                                            <div key={visa.id} className="flex items-center justify-between p-4 bg-orange-50 rounded-xl border border-orange-100">
                                                <div className="flex items-center gap-4 flex-1">
                                                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                                                        <FaPassport className="text-orange-500" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-bold text-gray-800">{visa.applicantName}</p>
                                                        <p className="text-sm text-gray-500">{visa.country} • {visa.visaType}</p>
                                                        {visa.adminMessage && (
                                                            <p className="text-sm text-orange-700 mt-1">📝 Original Request: {visa.adminMessage}</p>
                                                        )}
                                                        {visa.userConfirmedAt && (
                                                            <p className="text-sm text-gray-400 mt-1">
                                                                ✓ Edited on {new Date(visa.userConfirmedAt).toLocaleDateString()} at {new Date(visa.userConfirmedAt).toLocaleTimeString()}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => setHistoryVisa(visa)}
                                                        className="text-sm font-bold text-orange-600 bg-white px-3 py-1.5 rounded-full hover:bg-orange-600 hover:text-white transition-all border border-orange-100"
                                                    >
                                                        📋 View History
                                                    </button>
                                                    <span className="text-sm font-bold text-orange-600 bg-white px-3 py-1.5 rounded-full animate-pulse border border-orange-100">
                                                        RE-SUBMITTED
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* =================== VISAS TAB =================== */}
                    {activeTab === "visas" && (
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

                            {/* Status Filter Pills + Country Filter */}
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

                                <ModernCountryDropdown 
                                    value={countryFilter}
                                    onChange={(e) => setCountryFilter(e.target.value)}
                                    options={assignedCountries}
                                    assignedCountries={assignedCountries}
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

                            {/* Visas List */}
                            <div className="space-y-4">
                                {filteredVisas.length === 0 ? (
                                    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-14 text-center">
                                        <div className="w-16 h-16 rounded-3xl bg-orange-50 flex items-center justify-center mx-auto mb-4">
                                            <FaPassport className="text-orange-300 text-4xl" />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-2">{statusFilter === "All" ? "No visa applications" : `No "${statusFilter}" applications`}</h3>
                                        <p className="text-sm text-slate-500">
                                            {statusFilter === "All"
                                                ? "Applications for your assigned countries will appear here."
                                                : "Try selecting a different status filter or country."}
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
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Status</div>
                                                <div className="flex items-center gap-2">
                                                    {(pendingChanges[v.id]?.statusChange?.newStatus === 'Approve' || pendingChanges[v.id]?.statusChange?.newStatus === 'Reject' || v.status === 'Approve' || v.status === 'Reject') && (
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
                                                            {decisionDocs[v.id] || v.decisionDocURL ? <MdCheckCircle className="text-lg" /> : <MdAttachFile className="text-lg" />}
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
                                                    )}
                                                    <StatusDropdown
                                                        id={v.id}
                                                        currentStatus={v.status}
                                                        collectionName="visaApplications"
                                                        onUpdate={updateLocal}
                                                        country={v.country}
                                                        currentUser={currentUser}
                                                        userRole={userRole}
                                                        applicant={v}
                                                        onStage={stagePendingChange}
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Edit control</div>
                                                <LiveActionPanel
                                                    item={v}
                                                    collectionName="visaApplications"
                                                    onLocalUpdate={updateLocal}
                                                    currentUser={currentUser}
                                                    userRole={userRole}
                                                    onStage={stagePendingChange}
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
                                                                onClick={() => sendPendingEmail(v)}
                                                                disabled={!hasPending}
                                                                className={`relative inline-flex items-center justify-center w-12 h-12 rounded-3xl transition-all shadow-sm ${
                                                                    hasPending
                                                                        ? "bg-emerald-500 text-white hover:bg-emerald-600"
                                                                        : "bg-slate-100 text-slate-300 cursor-not-allowed"
                                                                }`}
                                                                title={hasPending ? `Send 1 email with ${pendingCount} pending update(s)` : "No pending changes to email"}
                                                            >
                                                                <MdSave className="text-xl" />
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
                            <Pagination total={filteredVisas.length} page={visaPage} onChange={setVisaPage} />
                        </div>
                    )}
                </main>
            </div>

            {/* ===================== MODALS ===================== */}
            <AnimatePresence>
                {selectedDoc && (
                    <DocumentViewer
                        visa={selectedDoc}
                        onClose={() => setSelectedDoc(null)}
                        onVerifyDocument={async (id, data) => {
                            await updateDoc(doc(db, "visaApplications", id), { documentVerification: data });
                            updateLocal(id, { documentVerification: data });
                        }}
                        onStage={(patch) => stagePendingChange(selectedDoc.id, patch)}
                    />
                )}
                {historyVisa && (
                    <EditHistoryModal
                        visa={historyVisa}
                        onClose={() => setHistoryVisa(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

// --- REUSABLE TABLE ---
function Table({ head, children }) {
    return (
        <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
                <thead className="bg-gray-50 border-b border-gray-200 text-[12px] font-bold text-gray-400 uppercase tracking-widest">
                    <tr>{head.map(h => <th key={h} className="p-5 whitespace-nowrap">{h}</th>)}</tr>
                </thead>
                <tbody>{children}</tbody>
            </table>
        </div>
    );
}