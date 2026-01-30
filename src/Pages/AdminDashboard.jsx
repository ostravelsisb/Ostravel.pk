import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    MdDashboard, MdSecurity, MdMessage, MdLogout, MdMenu, MdClose,
    MdSearch, MdClear, MdChevronLeft, MdChevronRight, MdAnalytics,
    MdVisibility, MdCheckCircle, MdInfoOutline, MdLockOutline, MdLockOpen, MdFileDownload
} from "react-icons/md";
import { FaUserShield, FaKaaba, FaPassport, FaRegPaperPlane, FaUsersCog } from "react-icons/fa";
import { collection, query, getDocs, orderBy, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db, signOut } from "../firbase";
import { useAuth } from "../Context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

// External Components
import DocumentViewer from "../Components/DocumentViewer";
import VisaAnalytics from "../Components/VisaAnalytics";
import SubAdminManagement from "../Components/SubAdminManagement";
import SubAdminActivityLog from "../Components/SubAdminActivityLog";
import EditHistoryModal from "../Components/EditHistoryModal";
import { toggleEditApproval, saveAdminMessage } from "../Utils/ApplicationEditUtils";

// --- SUB-COMPONENT: LIVE ACTION PANEL ---
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
const StatusDropdown = ({ id, currentStatus, collectionName, onUpdate, isVisa = false }) => {
    const [loading, setLoading] = useState(false);
    const options = isVisa
        ? ["Doc Received", "Analyzing", "Approved", "Rejected"]
        : ["Pending", "Investigating", "Processing", "Completed", "Cancelled"];

    const handleChange = async (e) => {
        const val = e.target.value;
        setLoading(true);
        try {
            await updateDoc(doc(db, collectionName, id), { status: val, updatedAt: serverTimestamp() });
            onUpdate(id, { status: val });
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    return (
        <select
            value={currentStatus || "Pending"}
            onChange={handleChange}
            className={`text-[11px] font-bold px-3 py-1 rounded-full border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none ${loading ? 'opacity-50' : ''}`}
        >
            {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
    );
};

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState("overview");
    const [visas, setVisas] = useState([]);
    const [policies, setPolicies] = useState([]);
    const [messages, setMessages] = useState([]);
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [historyVisa, setHistoryVisa] = useState(null);

    // Date Filters
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const { currentUser } = useAuth();
    const navigate = useNavigate();

    // Data Fetching
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

    // Local Update Helpers
    const updateLocal = (type, id, updates) => {
        if (type === 'visa') setVisas(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));
        if (type === 'policy') setPolicies(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
        if (type === 'umrah') setInquiries(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
    };

    const stats = useMemo(() => ({
        revenue: policies.reduce((a, b) => a + (Number(b.amount) || 0), 0),
        pending: visas.filter(v => v.status === "Doc Received").length,
    }), [visas, policies]);

    // Helpers to parse dates robustly
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

    // Filtered Data
    const filteredVisas = useMemo(() => visas.filter(v => isWithinDateRange(v.applicationDate)), [visas, startDate, endDate]);
    const filteredInquiries = useMemo(() => inquiries.filter(i => isWithinDateRange(i.createdAt)), [inquiries, startDate, endDate]);
    const filteredMessages = useMemo(() => messages.filter(m => isWithinDateRange(m.createdAt)), [messages, startDate, endDate]);

    return (
        <div className="flex h-screen bg-slate-50 font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col p-4 shadow-2xl">
                <div className="p-4 flex items-center gap-3 border-b border-slate-800 mb-6">
                    <div className="bg-blue-600 p-2 rounded-lg"><FaUserShield className="text-xl" /></div>
                    <span className="font-black text-lg">OS ADMIN</span>
                </div>
                <nav className="flex-1 space-y-2">
                    {[
                        { id: "overview", label: "Dashboard", icon: <MdDashboard /> },
                        { id: "visas", label: "Visas", icon: <FaPassport /> },
                        { id: "inquiries", label: "Umrah Queries", icon: <FaKaaba /> },
                        { id: "messages", label: "Messages", icon: <MdMessage /> },
                        { id: "subadmins", label: "Sub-Admins", icon: <FaUsersCog /> },
                    ].map(item => (
                        <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.id ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}>
                            {item.icon} <span className="text-sm font-bold">{item.label}</span>
                        </button>
                    ))}
                </nav>
            </aside>

            {/* Main Wrapper */}
            <main className="flex-1 overflow-y-auto p-8">
                <header className="flex justify-between items-center mb-10">
                    <h2 className="text-3xl font-black text-slate-800 capitalize tracking-tighter">{activeTab.replace("-", " ")}</h2>
                    <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
                        <span className="text-xs font-black text-slate-400 pl-2">USER: {currentUser?.email}</span>
                        <button onClick={() => signOut()} className="bg-red-50 text-red-500 p-2 rounded-xl hover:bg-red-500 hover:text-white transition-all"><MdLogout /></button>
                    </div>
                </header>

                {/* Date Filters */}
                {(activeTab === "visas" || activeTab === "inquiries" || activeTab === "messages") && (
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
                        <span className="ml-auto text-xs font-bold text-slate-400 self-center">
                            Showing results from {startDate || 'Start'} to {endDate || 'Now'}
                        </span>
                    </div>
                )}

                {/* Dashboard Overview Content */}
                {activeTab === "overview" && (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <KPIBox label="Total Revenue" value={`PKR ${stats.revenue.toLocaleString()}`} color="text-emerald-600" />
                            <KPIBox label="Visa Requests" value={visas.length} sub={`${stats.pending} New`} color="text-blue-600" />
                            <KPIBox label="Umrah Queries" value={inquiries.length} color="text-amber-600" />
                            <KPIBox label="Messages" value={messages.length} color="text-purple-600" />
                        </div>

                        {/* Recent Sub-Admin Activity */}
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                            <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                                <FaUsersCog className="text-blue-600" />
                                Recent Sub-Admin Activity
                            </h3>
                            <SubAdminActivityLog limit={10} compact={true} />
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
                                    {visas.filter(v => v.editApproved && !v.userConfirmed).slice(0, 10).map(visa => (
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
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                        <Table head={["Applicant", "Country/Type", "Status", "Live Control", "Docs"]}>
                            {filteredVisas.length === 0 ? (
                                <tr><td colSpan="5" className="p-8 text-center text-slate-500 font-bold">No visa applications found for selected dates</td></tr>
                            ) : filteredVisas.map(v => (
                                <tr key={v.id} className="border-b border-slate-100 last:border-0">
                                    <td className="p-5"><p className="font-bold text-slate-800">{v.applicantName}</p><p className="text-[10px] text-slate-400 font-bold">{v.email}</p></td>
                                    <td className="p-5"><p className="text-xs font-bold text-slate-600">{v.country}</p><p className="text-[9px] font-black text-blue-500 uppercase">{v.visaType}</p></td>
                                    <td className="p-5"><StatusDropdown id={v.id} currentStatus={v.status} collectionName="visaApplications" onUpdate={(id, up) => updateLocal('visa', id, up)} isVisa /></td>
                                    <td className="p-5"><LiveActionPanel item={v} collectionName="visaApplications" onLocalUpdate={(id, up) => updateLocal('visa', id, up)} /></td>
                                    <td className="p-5"><button onClick={() => setSelectedDoc(v)} className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all"><MdVisibility className="text-xl" /></button></td>
                                </tr>
                            ))}
                        </Table>
                    </div>
                )}



                {/* Umrah Inquiries Tab (RESTORED) */}
                {activeTab === "inquiries" && (
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                        <Table head={["Client", "Itinerary", "Details", "Status"]}>
                            {filteredInquiries.length === 0 ? (
                                <tr><td colSpan="4" className="p-8 text-center text-slate-500 font-bold">No inquiries found for selected dates</td></tr>
                            ) : filteredInquiries.map(u => (
                                <tr key={u.id} className="border-b border-slate-100 last:border-0">
                                    <td className="p-5"><p className="font-bold text-slate-800">{u.user?.name}</p><p className="text-[10px] text-slate-400 font-bold">{u.user?.contact}</p></td>
                                    <td className="p-5"><p className="text-xs font-bold text-slate-600">{u.makkah?.hotel}</p><p className="text-[10px] text-blue-500 font-bold">{u.makkah?.checkIn} to {u.makkah?.checkOut}</p></td>
                                    <td className="p-5"><p className="text-[10px] font-bold text-slate-500">{u.transport?.vehicleType} • {u.makkah?.rooms} Rooms</p></td>
                                    <td className="p-5"><StatusDropdown id={u.id} currentStatus={u.status} collectionName="umardet" onUpdate={(id, up) => updateLocal('umrah', id, up)} /></td>
                                </tr>
                            ))}
                        </Table>
                    </div>
                )}

                {/* Messages Tab (RESTORED) */}
                {activeTab === "messages" && (
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                        <Table head={["Date", "Sender", "Subject", "Message Content"]}>
                            {filteredMessages.length === 0 ? (
                                <tr><td colSpan="4" className="p-8 text-center text-slate-500 font-bold">No messages found for selected dates</td></tr>
                            ) : filteredMessages.map(m => (
                                <tr key={m.id} className="border-b border-slate-100 last:border-0">
                                    <td className="p-5 text-xs text-slate-400 font-bold">{m.createdAt?.toDate ? m.createdAt.toDate().toLocaleDateString() : "Just now"}</td>
                                    <td className="p-5"><p className="font-bold text-slate-800">{m.name}</p><p className="text-[10px] text-blue-500 font-bold">{m.email}</p></td>
                                    <td className="p-5 font-bold text-slate-600 text-xs">{m.subject}</td>
                                    <td className="p-5 text-xs text-slate-500 max-w-md">{m.message}</td>
                                </tr>
                            ))}
                        </Table>
                    </div>
                )}

                {/* Sub-Admins Tab */}
                {activeTab === "subadmins" && (
                    <SubAdminManagement />
                )}
            </main>

            <AnimatePresence>
                {selectedDoc && (
                    <DocumentViewer visa={selectedDoc} onClose={() => setSelectedDoc(null)} onVerifyDocument={async (id, data) => {
                        await updateDoc(doc(db, "visaApplications", id), { documentVerification: data });
                        updateLocal('visa', id, { documentVerification: data });
                    }} />
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

// --- REUSABLE UI ELEMENTS ---
function KPIBox({ label, value, sub, color }) {
    return (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
            <h3 className={`text-2xl font-black ${color}`}>{value}</h3>
            {sub && <p className="text-[10px] font-bold text-slate-400 mt-2 bg-slate-50 px-2 py-1 rounded-lg inline-block">{sub}</p>}
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