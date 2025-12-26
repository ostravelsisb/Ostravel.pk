import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    MdDashboard,
    MdSecurity,
    MdMessage,
    MdLogout,
    MdMenu,
    MdClose,
    MdSearch,
    MdFilterList
} from "react-icons/md";
import { FaUserShield, FaKaaba, FaCalendarAlt } from "react-icons/fa";
import { signOut } from "../firbase";
import { useAuth } from "../Context/AuthContext";
import { collection, query, getDocs, orderBy, doc, updateDoc } from "firebase/firestore";
import { db } from "../firbase";
import { motion } from "framer-motion";

// --- Helper: Status Update Component ---
const StatusSelect = ({ id, currentStatus, collectionName, onUpdate }) => {
    const [status, setStatus] = useState(currentStatus || "Pending");
    const [updating, setUpdating] = useState(false);

    const handleChange = async (e) => {
        const newStatus = e.target.value;
        setStatus(newStatus);
        setUpdating(true);
        try {
            const ref = doc(db, collectionName, id);
            await updateDoc(ref, { status: newStatus });
            if (onUpdate) onUpdate(id, newStatus);
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Failed to update status");
        } finally {
            setUpdating(false);
        }
    };

    const getStatusColor = (s) => {
        switch (s) {
            case "Pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "Investigating": return "bg-blue-100 text-blue-800 border-blue-200";
            case "Processing": return "bg-purple-100 text-purple-800 border-purple-200";
            case "Completed": return "bg-green-100 text-green-800 border-green-200";
            case "Cancelled": return "bg-red-100 text-red-800 border-red-200";
            default: return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    return (
        <div className="relative">
            <select
                value={status}
                onChange={handleChange}
                disabled={updating}
                className={`appearance-none cursor-pointer pl-3 pr-8 py-1.5 rounded-full text-xs font-bold border ${getStatusColor(status)} focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 transition-all`}
            >
                <option value="Pending">Pending</option>
                <option value="Investigating">Investigating</option>
                <option value="Processing">Processing</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
            </select>
            {updating && <span className="absolute right-2 top-1.5 text-xs animate-spin">⌛</span>}
        </div>
    );
};

// --- 1. Dashboard Overview Component ---
const DashboardOverview = ({ policies, messages, inquiries }) => {
    const totalRevenue = policies.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

    const StatCard = ({ title, value, icon, color, subtext }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group`}
        >
            <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}>
                {icon}
            </div>
            <div className="relative z-10">
                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
                <h3 className="text-3xl font-extrabold text-slate-800">{value}</h3>
                {subtext && <p className="text-xs text-gray-400 mt-2">{subtext}</p>}
            </div>
            <div className={`h-1 w-full absolute bottom-0 left-0 ${color.replace('text-', 'bg-').split(' ')[0]}`} />
        </motion.div>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard
                title="Total Revenue"
                value={`PKR ${totalRevenue.toLocaleString()}`}
                icon={<MdDashboard className="text-6xl" />}
                color="text-blue-600"
            />
            <StatCard
                title="Policies Issued"
                value={policies.length}
                icon={<MdSecurity className="text-6xl" />}
                color="text-green-600"
                subtext="Verified Insurances"
            />
            <StatCard
                title="Umrah Inquiries"
                value={inquiries.length}
                icon={<FaKaaba className="text-6xl" />}
                color="text-amber-500"
                subtext="Pending Actions"
            />
            <StatCard
                title="Messages"
                value={messages.length}
                icon={<MdMessage className="text-6xl" />}
                color="text-purple-600"
                subtext="Unread messages"
            />
        </div>
    );
};

// --- 2. Policies Table Component ---
const BookedPolicies = ({ policies }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                        <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Policy No</th>
                        <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Traveler</th>
                        <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Plan</th>
                        <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                        <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                        <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Download</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {policies.length === 0 ? (
                        <tr><td colSpan="6" className="p-10 text-center text-slate-400 italic">No policies found for this period.</td></tr>
                    ) : (
                        policies.map((p) => (
                            <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                                <td className="p-5 font-mono text-sm text-blue-600 font-medium">{p.policyNumber || "N/A"}</td>
                                <td className="p-5 font-bold text-slate-700">{p.travelerName || "Guest"}</td>
                                <td className="p-5 text-sm text-slate-600">{p.planName || "Standard"}</td>
                                <td className="p-5 font-bold text-green-600">PKR {Number(p.amount).toLocaleString()}</td>
                                <td className="p-5 text-sm text-slate-500">
                                    {p.purchaseDate?.toDate ? new Date(p.purchaseDate.toDate()).toLocaleDateString() : "Just now"}
                                </td>
                                <td className="p-5">
                                    {p.pdfLink ? (
                                        <a href={p.pdfLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 font-bold text-sm bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                                            PDF
                                        </a>
                                    ) : <span className="text-gray-300 text-sm">N/A</span>}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    </div>
);

// --- 3. Messages Table Component ---
const Messages = ({ messages }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                        <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                        <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Sender</th>
                        <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Subject</th>
                        <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Message</th>
                        <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {messages.length === 0 ? (
                        <tr><td colSpan="5" className="p-10 text-center text-slate-400 italic">No messages found.</td></tr>
                    ) : (
                        messages.map((m) => (
                            <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-5 text-sm text-slate-500 whitespace-nowrap">
                                    {m.createdAt?.toDate ? new Date(m.createdAt.toDate()).toLocaleDateString() : "Just now"}
                                </td>
                                <td className="p-5">
                                    <div className="font-bold text-slate-800">{m.name}</div>
                                    <div className="text-xs text-slate-400">{m.email}</div>
                                </td>
                                <td className="p-5 text-sm text-blue-600 font-medium">{m.subject}</td>
                                <td className="p-5 text-sm text-slate-600 max-w-sm truncate" title={m.message}>{m.message}</td>
                                <td className="p-5">
                                    <StatusSelect
                                        id={m.id}
                                        currentStatus={m.status}
                                        collectionName="contact_messages"
                                    />
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    </div>
);

// --- 4. Umrah Inquiries Table Component ---
const UmrahInquiries = ({ inquiries, onStatusUpdate }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                        <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                        <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Client Details</th>
                        <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Itinerary</th>
                        <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Requirements</th>
                        <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {inquiries.length === 0 ? (
                        <tr><td colSpan="5" className="p-10 text-center text-slate-400 italic">No inquiries found.</td></tr>
                    ) : (
                        inquiries.map((iq) => (
                            <tr key={iq.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-5 text-sm text-slate-500 whitespace-nowrap align-top">
                                    {iq.createdAt?.toDate ? new Date(iq.createdAt.toDate()).toLocaleDateString() : "Just now"}
                                </td>

                                {/* Client Info */}
                                <td className="p-5 align-top">
                                    <div className="font-bold text-slate-800">{iq.user?.name || "N/A"}</div>
                                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                        <span>📞 {iq.user?.contact}</span>
                                    </div>
                                    <div className="text-xs text-blue-500 mt-0.5">{iq.user?.email}</div>
                                </td>

                                {/* Hotel / Dates */}
                                <td className="p-5 align-top">
                                    <div className="bg-blue-50 p-2 rounded-lg border border-blue-100">
                                        <div className="font-semibold text-blue-800 text-sm mb-1">{iq.makkah?.hotel}</div>
                                        <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                                            <div><span className="font-bold">In:</span> {iq.makkah?.checkIn}</div>
                                            <div><span className="font-bold">Out:</span> {iq.makkah?.checkOut}</div>
                                        </div>
                                        <div className="mt-1 text-xs font-medium text-slate-500">
                                            {iq.makkah?.rooms} Room(s) • {iq.makkah?.nights} Night(s)
                                        </div>
                                    </div>
                                </td>

                                {/* Transport & Services */}
                                <td className="p-5 align-top space-y-2">
                                    <div className="text-sm">
                                        <div className="font-bold text-slate-700">{iq.transport?.vehicleType}</div>
                                        <div className="text-xs text-slate-500">{iq.transport?.travelers} Traveler(s)</div>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {iq.services?.visa && <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded">VISA</span>}
                                        {iq.services?.transport && <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded">TRANSPORT</span>}
                                        {iq.services?.airFare && <span className="bg-cyan-100 text-cyan-700 text-[10px] font-bold px-2 py-0.5 rounded">FLIGHT</span>}
                                    </div>
                                </td>

                                {/* Status Update */}
                                <td className="p-5 align-top">
                                    <StatusSelect
                                        id={iq.id}
                                        currentStatus={iq.status}
                                        collectionName="umardet"
                                        onUpdate={onStatusUpdate}
                                    />
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    </div>
);

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState("overview");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    // Data States
    const [policies, setPolicies] = useState([]);
    const [messages, setMessages] = useState([]);
    const [inquiries, setInquiries] = useState([]);
    const [loadingData, setLoadingData] = useState(true);

    // Filters
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // Fetch Data on Mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Policies
                const policiesQ = query(collection(db, "insurancesCustumer"), orderBy("purchaseDate", "desc"));
                const policiesSnap = await getDocs(policiesQ);
                const policiesData = policiesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setPolicies(policiesData);

                // Fetch Contact Messages
                const messagesQ = query(collection(db, "contact_messages"), orderBy("createdAt", "desc"));
                const messagesSnap = await getDocs(messagesQ);
                const messagesData = messagesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setMessages(messagesData);

                // Fetch Umrah Inquiries
                const inquiriesQ = query(collection(db, "umardet"), orderBy("createdAt", "desc"));
                const inquiriesSnap = await getDocs(inquiriesQ);
                const inquiriesData = inquiriesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setInquiries(inquiriesData);

            } catch (error) {
                console.error("Error fetching admin data:", error);
            } finally {
                setLoadingData(false);
            }
        };
        fetchData();
    }, []);

    const handleLogout = async () => {
        await signOut();
        navigate("/");
    };

    const handleInquiryStatusUpdate = (id, newStatus) => {
        setInquiries(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
    };

    // --- Filtering Logic ---
    const filterByDate = (items, dateField) => {
        if (!startDate && !endDate) return items;

        const start = startDate ? new Date(startDate) : new Date("2000-01-01");
        const end = endDate ? new Date(endDate) : new Date();
        end.setHours(23, 59, 59, 999); // Include the whole end day

        return items.filter(item => {
            if (!item[dateField]) return false;
            // Handle Firestore Timestamp
            const itemDate = item[dateField].toDate ? item[dateField].toDate() : new Date(item[dateField]);
            return itemDate >= start && itemDate <= end;
        });
    };

    const filteredPolicies = filterByDate(policies, "purchaseDate");
    const filteredMessages = filterByDate(messages, "createdAt");
    const filteredInquiries = filterByDate(inquiries, "createdAt");


    const menuItems = [
        { id: "overview", label: "Dashboard", icon: <MdDashboard /> },
        { id: "policies", label: "Booked Policies", icon: <MdSecurity /> },
        { id: "inquiries", label: "Umrah Inquiries", icon: <FaKaaba /> },
        { id: "messages", label: "Messages", icon: <MdMessage /> },
    ];

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-800">

            {/* --- Sidebar (Desktop) --- */}
            <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white shadow-2xl z-20">
                <div className="p-6 flex items-center gap-3 border-b border-slate-800">
                    <div className="bg-blue-600 p-2 rounded-lg">
                        <FaUserShield className="text-2xl text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold tracking-wide leading-tight">Admin<br />Console</h1>
                    </div>
                </div>

                <nav className="flex-1 py-6 px-3 space-y-1">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 group ${activeTab === item.id
                                ? "bg-blue-600 text-white shadow-lg shadow-blue-900/50 font-semibold"
                                : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                }`}
                        >
                            <span className={`text-xl group-hover:scale-110 transition-transform ${activeTab === item.id ? "text-white" : "text-slate-500 group-hover:text-white"}`}>{item.icon}</span>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-all w-full px-4 py-3 rounded-lg font-medium"
                    >
                        <MdLogout /> Sign Out
                    </button>
                </div>
            </aside>

            {/* --- Mobile Header & Overlay --- */}
            {/* Mobile Top Bar */}
            <div className="md:hidden fixed top-0 w-full h-16 bg-slate-900 text-white flex items-center justify-between px-4 z-20 shadow-md">
                <div className="flex items-center gap-2">
                    <FaUserShield className="text-xl" />
                    <span className="font-bold">Admin Panel</span>
                </div>
                <button onClick={() => setIsSidebarOpen(true)} className="text-2xl">
                    <MdMenu />
                </button>
            </div>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div className="fixed inset-0 z-50 flex md:hidden">
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)}></div>
                    <div className="relative w-64 bg-slate-900 text-white h-full shadow-2xl flex flex-col">
                        <div className="p-4 flex justify-between items-center border-b border-slate-800">
                            <span className="font-bold">Menu</span>
                            <button onClick={() => setIsSidebarOpen(false)}><MdClose className="text-2xl" /></button>
                        </div>
                        <nav className="flex-1 p-4 space-y-2">
                            {menuItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                                    className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg ${activeTab === item.id ? "bg-blue-600 font-bold" : "text-slate-300"
                                        }`}
                                >
                                    <span className="text-xl">{item.icon}</span>
                                    <span>{item.label}</span>
                                </button>
                            ))}
                        </nav>
                        <div className="p-4 border-t border-slate-800">
                            <button onClick={handleLogout} className="flex items-center gap-2 text-red-300"><MdLogout /> Sign Out</button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- Main Content Area --- */}
            <main className="flex-1 overflow-y-auto pt-16 md:pt-0 bg-slate-50 relative">

                {/* Header with Filters */}
                <header className="bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-slate-200 px-8 py-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-extrabold text-slate-800 capitalize tracking-tight">{activeTab.replace("-", " ")}</h2>
                        <p className="text-sm text-slate-500 font-medium">Overview of your business performance</p>
                    </div>

                    {/* Date Filters */}
                    <div className="flex items-center gap-3 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center px-3 py-2 gap-2 border-r border-slate-100">
                            <FaCalendarAlt className="text-slate-400" />
                            <span className="text-xs font-bold text-slate-500 uppercase">Filter Date:</span>
                        </div>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="text-sm bg-transparent border-none focus:ring-0 text-slate-700 font-medium cursor-pointer"
                        />
                        <span className="text-slate-300">-</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="text-sm bg-transparent border-none focus:ring-0 text-slate-700 font-medium cursor-pointer"
                        />
                        {(startDate || endDate) && (
                            <button
                                onClick={() => { setStartDate(""); setEndDate(""); }}
                                className="text-xs text-red-500 hover:text-red-700 font-bold px-2"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </header>

                <div className="p-8 max-w-7xl mx-auto">
                    {loadingData ? (
                        <div className="flex flex-col justify-center items-center h-64 text-slate-400">
                            <div className="animate-spin text-4xl mb-4">⏳</div>
                            <p>Loading Dashboard Data...</p>
                        </div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                        >
                            {activeTab === "overview" && (
                                <div className="space-y-8">
                                    <DashboardOverview policies={filteredPolicies} messages={filteredMessages} inquiries={filteredInquiries} />

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                            <div className="flex justify-between items-center mb-6">
                                                <h3 className="text-lg font-bold text-slate-800">Recent Inquiries</h3>
                                                <button onClick={() => setActiveTab("inquiries")} className="text-sm text-blue-600 font-bold hover:underline">View All</button>
                                            </div>
                                            <UmrahInquiries inquiries={filteredInquiries.slice(0, 3)} onStatusUpdate={handleInquiryStatusUpdate} />
                                        </div>

                                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                            <div className="flex justify-between items-center mb-6">
                                                <h3 className="text-lg font-bold text-slate-800">Recent Messages</h3>
                                                <button onClick={() => setActiveTab("messages")} className="text-sm text-blue-600 font-bold hover:underline">View All</button>
                                            </div>
                                            <Messages messages={filteredMessages.slice(0, 3)} />
                                        </div>
                                    </div>
                                </div>
                            )}
                            {activeTab === "policies" && <BookedPolicies policies={filteredPolicies} />}
                            {activeTab === "inquiries" && <UmrahInquiries inquiries={filteredInquiries} onStatusUpdate={handleInquiryStatusUpdate} />}
                            {activeTab === "messages" && <Messages messages={filteredMessages} />}
                        </motion.div>
                    )}
                </div>
            </main>
        </div>
    );
}
