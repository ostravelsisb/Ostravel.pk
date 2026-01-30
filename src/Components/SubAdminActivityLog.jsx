import React, { useState, useEffect } from "react";
import { collection, query, getDocs, orderBy, limit, where } from "firebase/firestore";
import { db } from "../firbase";
import { motion } from "framer-motion";
import { MdEdit, MdCheckCircle, MdVisibility, MdDelete, MdPerson, MdFilterList } from "react-icons/md";
import { FaUserShield } from "react-icons/fa";

export default function SubAdminActivityLog({ limitCount = 20, compact = false }) {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterSubAdmin, setFilterSubAdmin] = useState("all");
    const [filterCountry, setFilterCountry] = useState("all");
    const [subAdmins, setSubAdmins] = useState([]);
    const [countries, setCountries] = useState([]);

    useEffect(() => {
        fetchActivities();
        fetchSubAdmins();
    }, [limitCount]);

    const fetchActivities = async () => {
        try {
            let q = query(
                collection(db, "activityLogs"),
                orderBy("timestamp", "desc"),
                limit(limitCount)
            );

            const snapshot = await getDocs(q);
            const activityList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().timestamp?.toDate() || new Date()
            }));

            setActivities(activityList);

            // Extract unique countries
            const uniqueCountries = [...new Set(activityList.map(a => a.targetCountry).filter(Boolean))];
            setCountries(uniqueCountries);
        } catch (error) {
            console.error("Error fetching activities:", error);
            // If permission denied, just show empty state
            if (error.code === 'permission-denied') {
                console.warn("Activity logs not accessible - Firestore rules may need to be updated");
            }
            setActivities([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchSubAdmins = async () => {
        try {
            const q = query(collection(db, "users"), where("role", "==", "subAdmin"));
            const snapshot = await getDocs(q);
            const subAdminList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setSubAdmins(subAdminList);
        } catch (error) {
            console.error("Error fetching sub-admins:", error);
        }
    };

    const getActionIcon = (action) => {
        switch (action) {
            case "edited": return <MdEdit className="text-blue-600" />;
            case "statusChanged": return <MdCheckCircle className="text-emerald-600" />;
            case "documentVerified": return <MdVisibility className="text-purple-600" />;
            case "documentDeleted": return <MdDelete className="text-red-600" />;
            case "created": return <FaUserShield className="text-blue-600" />;
            default: return <MdEdit className="text-slate-600" />;
        }
    };

    const getActionColor = (action) => {
        switch (action) {
            case "edited": return "bg-blue-50 text-blue-700";
            case "statusChanged": return "bg-emerald-50 text-emerald-700";
            case "documentVerified": return "bg-purple-50 text-purple-700";
            case "documentDeleted": return "bg-red-50 text-red-700";
            case "created": return "bg-blue-50 text-blue-700";
            default: return "bg-slate-50 text-slate-700";
        }
    };

    const getActionLabel = (action) => {
        switch (action) {
            case "edited": return "Edited";
            case "statusChanged": return "Status Changed";
            case "documentVerified": return "Document Verified";
            case "documentDeleted": return "Document Deleted";
            case "created": return "Created";
            default: return action;
        }
    };

    const getTimeAgo = (date) => {
        const seconds = Math.floor((new Date() - date) / 1000);

        if (seconds < 60) return "Just now";
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

        return date.toLocaleDateString();
    };

    const filteredActivities = activities.filter(activity => {
        if (filterSubAdmin !== "all" && activity.performedBy?.uid !== filterSubAdmin) return false;
        if (filterCountry !== "all" && activity.targetCountry !== filterCountry) return false;
        return true;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (compact) {
        return (
            <div className="space-y-2">
                {filteredActivities.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-slate-500 text-sm">No activity yet</p>
                    </div>
                ) : (
                    filteredActivities.slice(0, 10).map((activity) => (
                        <motion.div
                            key={activity.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                        >
                            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                                {getActionIcon(activity.action)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <p className="text-sm font-bold text-slate-800 truncate">
                                        {activity.performedBy?.displayName || activity.performedBy?.email}
                                    </p>
                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${getActionColor(activity.action)}`}>
                                        {getActionLabel(activity.action)}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-600">
                                    {activity.targetType === "visaApplication" && `Visa Application`}
                                    {activity.targetCountry && ` • ${activity.targetCountry}`}
                                </p>
                                {activity.changes && activity.changes.length > 0 && (
                                    <p className="text-xs text-slate-500 mt-1">
                                        {activity.changes[0].field}: {activity.changes[0].oldValue} → {activity.changes[0].newValue}
                                    </p>
                                )}
                                <p className="text-[10px] text-slate-400 mt-1">{getTimeAgo(activity.timestamp)}</p>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="flex gap-4 items-center">
                <div className="flex items-center gap-2">
                    <MdFilterList className="text-slate-400" />
                    <span className="text-sm font-bold text-slate-700">Filters:</span>
                </div>
                <select
                    value={filterSubAdmin}
                    onChange={(e) => setFilterSubAdmin(e.target.value)}
                    className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                >
                    <option value="all">All Sub-Admins</option>
                    {subAdmins.map(sa => (
                        <option key={sa.id} value={sa.uid}>{sa.displayName || sa.email}</option>
                    ))}
                </select>
                <select
                    value={filterCountry}
                    onChange={(e) => setFilterCountry(e.target.value)}
                    className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                >
                    <option value="all">All Countries</option>
                    {countries.map(country => (
                        <option key={country} value={country}>{country}</option>
                    ))}
                </select>
            </div>

            {/* Activity List */}
            <div className="space-y-3">
                {filteredActivities.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-2xl">
                        <FaUserShield className="text-slate-300 text-4xl mx-auto mb-3" />
                        <p className="text-slate-500 font-bold">No activity found</p>
                        <p className="text-sm text-slate-400 mt-1">Activity logs will appear here</p>
                    </div>
                ) : (
                    filteredActivities.map((activity) => (
                        <motion.div
                            key={activity.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-all"
                        >
                            <div className="flex items-start gap-4">
                                {/* Icon */}
                                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                    {getActionIcon(activity.action)}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-black">
                                                {activity.performedBy?.displayName?.charAt(0).toUpperCase() || "S"}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800">
                                                    {activity.performedBy?.displayName || activity.performedBy?.email}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    {activity.performedBy?.role === "subAdmin" ? "Sub-Admin" : "Admin"}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`ml-auto text-xs font-black px-3 py-1 rounded-full ${getActionColor(activity.action)}`}>
                                            {getActionLabel(activity.action)}
                                        </span>
                                    </div>

                                    {/* Details */}
                                    <div className="bg-slate-50 rounded-lg p-3 mb-2">
                                        <p className="text-sm text-slate-700 font-bold mb-1">
                                            {activity.targetType === "visaApplication" && "Visa Application"}
                                            {activity.targetType === "subAdmin" && "Sub-Admin Account"}
                                            {activity.targetCountry && ` • ${activity.targetCountry}`}
                                        </p>
                                        {activity.changes && activity.changes.length > 0 && (
                                            <div className="space-y-1">
                                                {activity.changes.map((change, idx) => (
                                                    <p key={idx} className="text-xs text-slate-600">
                                                        <span className="font-bold">{change.field}:</span>{" "}
                                                        <span className="text-red-600">{change.oldValue || "—"}</span>
                                                        {" → "}
                                                        <span className="text-emerald-600">{change.newValue || "—"}</span>
                                                    </p>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Timestamp */}
                                    <p className="text-xs text-slate-400 font-bold">
                                        {getTimeAgo(activity.timestamp)} • {activity.timestamp.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}
