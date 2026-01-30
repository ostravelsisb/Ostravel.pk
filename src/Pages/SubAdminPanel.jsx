import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    MdDashboard, MdLogout, MdVisibility, MdCheckCircle,
    MdLockOutline, MdLockOpen, MdPerson, MdPublic
} from "react-icons/md";
import { FaUserShield, FaPassport, FaRegPaperPlane } from "react-icons/fa";
import { collection, query, getDocs, orderBy, doc, updateDoc, serverTimestamp, where } from "firebase/firestore";
import { db, signOut } from "../firbase";
import { useAuth } from "../Context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

// External Components
import DocumentViewer from "../Components/DocumentViewer";
import EditHistoryModal from "../Components/EditHistoryModal";
import { toggleEditApproval, saveAdminMessage } from "../Utils/ApplicationEditUtils";
import { logStatusChange, logVisaEdit } from "../Utils/activityLogger";

// --- SUB-COMPONENT: LIVE ACTION PANEL ---
const LiveActionPanel = ({ item, collectionName, onLocalUpdate, currentUser, userRole }) => {
    const [msg, setMsg] = useState(item.adminMessage || "");
    const [isSending, setIsSending] = useState(false);
    const [isToggling, setIsToggling] = useState(false);

    const handleToggle = async () => {
        const nextState = !item.editApproved;
        setIsToggling(true);
        try {
            await toggleEditApproval(item.id, collectionName, nextState, currentUser.email);
            onLocalUpdate(item.id, { editApproved: nextState });
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
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-black transition-all ${item.editApproved ? "bg-emerald-500 text-white shadow-md" : "bg-slate-200 text-slate-500"
                        } ${isToggling ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {isToggling ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
                    ) : (
                        item.editApproved ? <MdLockOpen className="text-sm" /> : <MdLockOutline className="text-sm" />
                    )}
                    {isToggling ? "UPDATING..." : (item.editApproved ? "EDIT ENABLED" : "EDIT LOCKED")}
                </button>
                {item.userConfirmed && (
                    <span className="text-[9px] font-black text-blue-600 animate-bounce pr-2">RE-SUBMITTED</span>
                )}
            </div>
            <div className="relative">
                <input
                    type="text"
                    placeholder="Why enable edit? (e.g. Invalid Passport)"
                    value={msg}
                    onChange={(e) => setMsg(e.target.value)}
                    disabled={isSending}
                    className="w-full pl-3 pr-9 py-2 text-[11px] border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
                />
                <button
                    onClick={handleSendMessage}
                    disabled={isSending || !msg.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSending ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-2 border-blue-600 border-t-transparent"></div>
                    ) : (
                        <FaRegPaperPlane />
                    )}
                </button>
            </div>
        </div>
    );
};

// --- SUB-COMPONENT: STATUS SELECT ---
const StatusDropdown = ({ id, currentStatus, collectionName, onUpdate, country, currentUser, userRole }) => {
    const [loading, setLoading] = useState(false);
    const options = ["Doc Received", "Analyzing", "Approved", "Rejected"];

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

            // Log the status change
            await logStatusChange(id, country, oldStatus, val, {
                uid: currentUser.uid,
                email: currentUser.email,
                role: userRole,
                displayName: currentUser.displayName || currentUser.email
            });

            onUpdate(id, { status: val });
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    return (
        <select
            value={currentStatus || "Doc Received"}
            onChange={handleChange}
            className={`text-[11px] font-bold px-3 py-1 rounded-full border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none ${loading ? 'opacity-50' : ''}`}
        >
            {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
    );
};

export default function SubAdminPanel() {
    const [activeTab, setActiveTab] = useState("overview");
    const [visas, setVisas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [historyVisa, setHistoryVisa] = useState(null);
    const [statusFilter, setStatusFilter] = useState("All");

    // Date Filters
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const { currentUser, userData, userRole } = useAuth();
    const navigate = useNavigate();

    // Filtered visas based on status and date
    const filteredVisas = useMemo(() => {
        return visas.filter(v => {
            // Status Filter
            if (statusFilter !== "All" && v.status !== statusFilter) return false;

            // Date Filter
            if (!startDate && !endDate) return true;
            const appDate = v.applicationDate?.toDate ? v.applicationDate.toDate() : (v.applicationDate ? new Date(v.applicationDate) : null);
            if (!appDate) return false;

            const start = startDate ? new Date(startDate) : new Date('1970-01-01');
            const end = endDate ? new Date(endDate) : new Date();
            end.setHours(23, 59, 59); // End of day

            return appDate >= start && appDate <= end;
        });
    }, [visas, statusFilter, startDate, endDate]);

    // Get assigned countries from userData
    const assignedCountries = userData?.assignedCountries || [];

    // Data Fetching - Only assigned countries
    useEffect(() => {
        const fetchData = async () => {
            try {
                if (assignedCountries.length === 0) {
                    setLoading(false);
                    return;
                }

                // Fetch all visas and filter client-side to avoid composite index
                const q = query(
                    collection(db, "visaApplications"),
                    orderBy("applicationDate", "desc")
                );

                const snapshot = await getDocs(q);
                const allVisas = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

                // Filter for assigned countries only
                const filteredVisas = allVisas.filter(visa =>
                    assignedCountries.includes(visa.country)
                );

                setVisas(filteredVisas);
            } catch (e) {
                console.error("Error fetching visas:", e);
            }
            setLoading(false);
        };
        fetchData();
    }, [assignedCountries]);

    // Local Update Helper
    const updateLocal = (id, updates) => {
        setVisas(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));
    };

    // Stats
    const stats = useMemo(() => ({
        total: visas.length,
        docReceived: visas.filter(v => v.status === "Doc Received").length,
        analyzing: visas.filter(v => v.status === "Analyzing").length,
        approved: visas.filter(v => v.status === "Approved").length,
        rejected: visas.filter(v => v.status === "Rejected").length,
    }), [visas]);

    // Removed redundant filteredVisas - now handled in integrated memo above


    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-slate-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-slate-600 font-bold">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-slate-50 font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white flex flex-col p-4 shadow-2xl">
                <div className="p-4 flex items-center gap-3 border-b border-slate-700 mb-6">
                    <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg">
                        <FaUserShield className="text-xl" />
                    </div>
                    <div>
                        <span className="font-black text-sm block">SUB-ADMIN</span>
                        <span className="text-xs text-slate-400">Panel</span>
                    </div>
                </div>

                {/* User Info */}
                <div className="bg-slate-800/50 rounded-xl p-4 mb-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-black">
                            {userData?.displayName?.charAt(0).toUpperCase() || "S"}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate">{userData?.displayName}</p>
                            <p className="text-xs text-slate-400 truncate">{currentUser?.email}</p>
                        </div>
                    </div>
                    <div className="border-t border-slate-700 pt-3">
                        <p className="text-xs font-black text-slate-400 uppercase mb-2">Assigned Countries</p>
                        <div className="flex flex-wrap gap-1">
                            {assignedCountries.slice(0, 3).map(country => (
                                <span key={country} className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full font-bold">
                                    {country}
                                </span>
                            ))}
                            {assignedCountries.length > 3 && (
                                <span className="text-[10px] text-slate-400 font-bold">+{assignedCountries.length - 3}</span>
                            )}
                        </div>
                    </div>
                </div>

                <nav className="flex-1 space-y-2">
                    {[
                        { id: "overview", label: "Dashboard", icon: <MdDashboard /> },
                        { id: "visas", label: "Visa Applications", icon: <FaPassport /> },
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.id ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:bg-slate-700 hover:text-white"
                                }`}
                        >
                            {item.icon} <span className="text-sm font-bold">{item.label}</span>
                        </button>
                    ))}
                </nav>

                <button
                    onClick={() => signOut().then(() => navigate("/"))}
                    className="flex items-center gap-3 px-4 py-3 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all mt-4"
                >
                    <MdLogout /> <span className="text-sm font-bold">Logout</span>
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-8">
                <header className="mb-10">
                    <h2 className="text-3xl font-black text-slate-800 capitalize tracking-tighter">
                        {activeTab === "overview" ? "Dashboard Overview" : "Visa Applications"}
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                        Managing applications for {assignedCountries.length} {assignedCountries.length === 1 ? "country" : "countries"}
                    </p>
                </header>

                {/* Date Filters */}
                <div className="mb-6 flex flex-wrap items-end gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Start Date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">End Date</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    {(startDate || endDate) && (
                        <button
                            onClick={() => { setStartDate(''); setEndDate(''); }}
                            className="px-3 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>

                {/* Dashboard Overview */}
                {activeTab === "overview" && (
                    <div className="space-y-8">
                        {/* Date Filters */}
                        <div className="mb-6 flex flex-wrap items-end gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Start Date</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">End Date</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            {(startDate || endDate) && (
                                <button
                                    onClick={() => { setStartDate(''); setEndDate(''); }}
                                    className="px-3 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors"
                                >
                                    Clear Filters
                                </button>
                            )}
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <KPIBox label="Total Applications" value={stats.total} color="text-slate-800" />
                            <KPIBox label="Doc Received" value={stats.docReceived} color="text-blue-600" />
                            <KPIBox label="Analyzing" value={stats.analyzing} color="text-amber-600" />
                            <KPIBox label="Approved" value={stats.approved} color="text-emerald-600" />
                            <KPIBox label="Rejected" value={stats.rejected} color="text-red-600" />
                        </div>

                        {/* Assigned Countries */}
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                            <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                                <MdPublic className="text-blue-600" />
                                Your Assigned Countries
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {assignedCountries.map(country => (
                                    <div key={country} className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-100">
                                        <p className="font-bold text-slate-800">{country}</p>
                                        <p className="text-xs text-slate-500 mt-1">
                                            {visas.filter(v => v.country === country).length} applications
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Applications */}
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                            <h3 className="text-lg font-black text-slate-800 mb-4">Recent Applications</h3>
                            {visas.slice(0, 5).length === 0 ? (
                                <div className="text-center py-12">
                                    <FaPassport className="text-slate-300 text-4xl mx-auto mb-3" />
                                    <p className="text-slate-500 font-bold">No applications yet</p>
                                    <p className="text-sm text-slate-400">Applications will appear here once submitted</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {visas.slice(0, 5).map(visa => (
                                        <div key={visa.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <FaPassport className="text-blue-600" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800">{visa.applicantName}</p>
                                                    <p className="text-xs text-slate-500">{visa.country} • {visa.visaType}</p>
                                                </div>
                                            </div>
                                            <span className={`text-xs font-black px-3 py-1 rounded-full ${visa.status === "Approved" ? "bg-emerald-100 text-emerald-700" :
                                                visa.status === "Rejected" ? "bg-red-100 text-red-700" :
                                                    visa.status === "Analyzing" ? "bg-amber-100 text-amber-700" :
                                                        "bg-blue-100 text-blue-700"
                                                }`}>
                                                {visa.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Allowed Edited Applications */}
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                                    <MdLockOpen className="text-emerald-600" />
                                    Allowed Edited Applications
                                </h3>
                                {visas.filter(v => v.editApproved && !v.userConfirmed).length > 0 && (
                                    <span className="bg-emerald-100 text-emerald-700 text-xs font-black px-3 py-1 rounded-full">
                                        {visas.filter(v => v.editApproved && !v.userConfirmed).length} Pending
                                    </span>
                                )}
                            </div>
                            {visas.filter(v => v.editApproved && !v.userConfirmed).length === 0 ? (
                                <div className="text-center py-12">
                                    <MdLockOpen className="text-slate-300 text-4xl mx-auto mb-3" />
                                    <p className="text-slate-500 font-bold">No edit-allowed applications</p>
                                    <p className="text-sm text-slate-400">Applications with edit permission will appear here</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {visas.filter(v => v.editApproved && !v.userConfirmed).map(visa => (
                                        <div key={visa.id} className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                                            <div className="flex items-center gap-4 flex-1">
                                                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                                                    <FaPassport className="text-emerald-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-bold text-slate-800">{visa.applicantName}</p>
                                                    <p className="text-xs text-slate-500">{visa.country} • {visa.visaType}</p>
                                                    {visa.adminMessage && (
                                                        <p className="text-xs text-emerald-700 mt-1 font-bold">
                                                            📝 {visa.adminMessage}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <span className="text-xs font-black text-emerald-600 bg-white px-3 py-1 rounded-full">
                                                AWAITING EDIT
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Recently Edited Applications (User Completed) */}
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                                    <MdCheckCircle className="text-blue-600" />
                                    Recently Edited Applications
                                </h3>
                                {visas.filter(v => v.userConfirmed).length > 0 && (
                                    <span className="bg-blue-100 text-blue-700 text-xs font-black px-3 py-1 rounded-full">
                                        {visas.filter(v => v.userConfirmed).length} New
                                    </span>
                                )}
                            </div>
                            {visas.filter(v => v.userConfirmed).length === 0 ? (
                                <div className="text-center py-12">
                                    <MdCheckCircle className="text-slate-300 text-4xl mx-auto mb-3" />
                                    <p className="text-slate-500 font-bold">No recently edited applications</p>
                                    <p className="text-sm text-slate-400">User-completed edits will appear here</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {visas.filter(v => v.userConfirmed).slice(0, 10).map(visa => (
                                        <div key={visa.id} className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-200">
                                            <div className="flex items-center gap-4 flex-1">
                                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <FaPassport className="text-blue-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-bold text-slate-800">{visa.applicantName}</p>
                                                    <p className="text-xs text-slate-500">{visa.country} • {visa.visaType}</p>
                                                    {visa.adminMessage && (
                                                        <p className="text-xs text-blue-700 mt-1">
                                                            📝 Original Request: {visa.adminMessage}
                                                        </p>
                                                    )}
                                                    {visa.userConfirmedAt && (
                                                        <p className="text-xs text-slate-400 mt-1">
                                                            ✓ Edited on {new Date(visa.userConfirmedAt).toLocaleDateString()} at {new Date(visa.userConfirmedAt).toLocaleTimeString()}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setHistoryVisa(visa)}
                                                    className="text-xs font-black text-blue-600 bg-white px-3 py-1 rounded-full hover:bg-blue-600 hover:text-white transition-all border border-blue-200"
                                                >
                                                    📋 View History
                                                </button>
                                                <span className="text-xs font-black text-blue-600 bg-white px-3 py-1 rounded-full animate-pulse">
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

                {/* Visas Tab */}
                {activeTab === "visas" && (
                    <div className="space-y-6">
                        {/* Status Filter Tabs */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-2 inline-flex gap-2">
                            {["All", "Doc Received", "Analyzing", "Approved", "Rejected"].map(status => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${statusFilter === status
                                        ? "bg-blue-600 text-white shadow-md"
                                        : "hover:bg-slate-50 text-slate-600"
                                        }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>

                        {/* Visas Table */}
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                            <Table head={["Applicant", "Country/Type", "Status", "Live Control", "Docs"]}>
                                {filteredVisas.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="p-12 text-center">
                                            <FaPassport className="text-slate-300 text-5xl mx-auto mb-4" />
                                            <p className="text-slate-500 font-bold text-lg">
                                                {statusFilter === "All" ? "No visa applications" : `No ${statusFilter} applications`}
                                            </p>
                                            <p className="text-sm text-slate-400 mt-2">
                                                {statusFilter === "All"
                                                    ? "Applications for your assigned countries will appear here"
                                                    : `Try selecting a different status filter`
                                                }
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredVisas.map(v => (
                                        <tr key={v.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                                            <td className="p-5">
                                                <p className="font-bold text-slate-800">{v.applicantName}</p>
                                                <p className="text-[10px] text-slate-400 font-bold">{v.email}</p>
                                            </td>
                                            <td className="p-5">
                                                <p className="text-xs font-bold text-slate-600">{v.country}</p>
                                                <p className="text-[9px] font-black text-blue-500 uppercase">{v.visaType}</p>
                                            </td>
                                            <td className="p-5">
                                                <StatusDropdown
                                                    id={v.id}
                                                    currentStatus={v.status}
                                                    collectionName="visaApplications"
                                                    onUpdate={updateLocal}
                                                    country={v.country}
                                                    currentUser={currentUser}
                                                    userRole={userRole}
                                                />
                                            </td>
                                            <td className="p-5">
                                                <LiveActionPanel
                                                    item={v}
                                                    collectionName="visaApplications"
                                                    onLocalUpdate={updateLocal}
                                                    currentUser={currentUser}
                                                    userRole={userRole}
                                                />
                                            </td>
                                            <td className="p-5">
                                                <button
                                                    onClick={() => setSelectedDoc(v)}
                                                    className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all"
                                                >
                                                    <MdVisibility className="text-xl" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </Table>
                        </div>
                    </div>
                )
                }
            </main >

            {/* Document Viewer Modal */}
            < AnimatePresence >
                {selectedDoc && (
                    <DocumentViewer
                        visa={selectedDoc}
                        onClose={() => setSelectedDoc(null)}
                        onVerifyDocument={async (id, data) => {
                            await updateDoc(doc(db, "visaApplications", id), { documentVerification: data });
                            updateLocal(id, { documentVerification: data });
                        }}
                    />
                )}
                {
                    historyVisa && (
                        <EditHistoryModal
                            visa={historyVisa}
                            onClose={() => setHistoryVisa(null)}
                        />
                    )
                }
            </AnimatePresence >
        </div >
    );
}

// --- REUSABLE UI ELEMENTS ---
function KPIBox({ label, value, color }) {
    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
            <h3 className={`text-2xl font-black ${color}`}>{value}</h3>
        </div>
    );
}

function Table({ head, children }) {
    return (
        <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <tr>{head.map(h => <th key={h} className="p-5">{h}</th>)}</tr>
            </thead>
            <tbody>{children}</tbody>
        </table>
    );
}
