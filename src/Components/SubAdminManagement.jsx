import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db, createSubAdmin } from "../firbase";
import { useAuth } from "../Context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
    MdAdd, MdEdit, MdDelete, MdClose, MdCheckCircle, MdBlock,
    MdPerson, MdEmail, MdPublic, MdSave, MdCancel
} from "react-icons/md";
import { FaUserShield, FaGlobe } from "react-icons/fa";
import { logSubAdminCreation, logSubAdminUpdate } from "../Utils/activityLogger";

// List of Asian countries for assignment
const ASIAN_COUNTRIES = [
    "Afghanistan", "Azerbaijan", "Bahrain", "Bangladesh", "Bhutan", "Brunei",
    "Cambodia", "China", "Georgia", "India", "Indonesia", "Iran", "Iraq",
    "Japan", "Jordan", "Kazakhstan", "Kuwait", "Kyrgyzstan", "Laos", "Lebanon",
    "Malaysia", "Maldives", "Mongolia", "Myanmar", "Nepal", "North Korea",
    "Oman", "Pakistan", "Palestine", "Philippines", "Qatar", "Saudi Arabia",
    "Singapore", "South Korea", "Sri Lanka", "Syria", "Tajikistan", "Thailand",
    "Turkey", "Turkmenistan", "United Arab Emirates", "Uzbekistan", "Vietnam", "Yemen"
];

export default function SubAdminManagement() {
    const { currentUser, userData } = useAuth();
    const [subAdmins, setSubAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingSubAdmin, setEditingSubAdmin] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        displayName: "",
        assignedCountries: []
    });
    const [formError, setFormError] = useState("");
    const [formLoading, setFormLoading] = useState(false);

    // Fetch all sub-admins
    useEffect(() => {
        fetchSubAdmins();
    }, []);

    const fetchSubAdmins = async () => {
        try {
            const q = query(collection(db, "users"), where("role", "==", "subAdmin"));
            const snapshot = await getDocs(q);
            const subAdminsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setSubAdmins(subAdminsList);
        } catch (error) {
            console.error("Error fetching sub-admins:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSubAdmin = async (e) => {
        e.preventDefault();
        setFormError("");
        setFormLoading(true);

        try {
            // Validate
            if (!formData.email || !formData.password || !formData.displayName) {
                setFormError("All fields are required");
                setFormLoading(false);
                return;
            }

            if (formData.assignedCountries.length === 0) {
                setFormError("Please assign at least one country");
                setFormLoading(false);
                return;
            }

            // Create sub-admin
            await createSubAdmin(
                formData.email,
                formData.password,
                formData.displayName,
                formData.assignedCountries,
                currentUser.uid
            );

            // Log activity
            await logSubAdminCreation(
                currentUser.uid,
                formData.email,
                formData.assignedCountries,
                {
                    uid: currentUser.uid,
                    email: currentUser.email,
                    role: userData?.role || "admin",
                    displayName: currentUser.displayName || currentUser.email
                }
            );

            // Reset form
            setFormData({ email: "", password: "", displayName: "", assignedCountries: [] });
            setShowCreateModal(false);

            // Refresh list
            await fetchSubAdmins();

            alert("✅ Sub-admin created successfully!");
        } catch (error) {
            console.error("Error creating sub-admin:", error);
            if (error.code === "auth/email-already-in-use") {
                setFormError("Email already in use");
            } else if (error.code === "auth/weak-password") {
                setFormError("Password should be at least 6 characters");
            } else {
                setFormError("Failed to create sub-admin. Please try again.");
            }
        } finally {
            setFormLoading(false);
        }
    };

    const handleUpdateCountries = async (subAdminId, newCountries) => {
        try {
            const subAdminRef = doc(db, "users", subAdminId);
            const oldCountries = subAdmins.find(sa => sa.id === subAdminId)?.assignedCountries || [];

            await updateDoc(subAdminRef, {
                assignedCountries: newCountries
            });

            // Log activity
            await logSubAdminUpdate(
                subAdminId,
                [{ field: "assignedCountries", oldValue: oldCountries.join(", "), newValue: newCountries.join(", ") }],
                {
                    uid: currentUser.uid,
                    email: currentUser.email,
                    role: userData?.role || "admin",
                    displayName: currentUser.displayName || currentUser.email
                }
            );

            await fetchSubAdmins();
            setEditingSubAdmin(null);
            alert("✅ Countries updated successfully!");
        } catch (error) {
            console.error("Error updating countries:", error);
            alert("❌ Failed to update countries");
        }
    };

    const handleToggleActive = async (subAdminId, currentStatus) => {
        try {
            const subAdminRef = doc(db, "users", subAdminId);
            const newStatus = !currentStatus;

            await updateDoc(subAdminRef, {
                isActive: newStatus
            });

            // Log activity
            await logSubAdminUpdate(
                subAdminId,
                [{ field: "isActive", oldValue: currentStatus, newValue: newStatus }],
                {
                    uid: currentUser.uid,
                    email: currentUser.email,
                    role: userData?.role || "admin",
                    displayName: currentUser.displayName || currentUser.email
                }
            );

            await fetchSubAdmins();
            alert(`✅ Sub-admin ${newStatus ? "activated" : "deactivated"} successfully!`);
        } catch (error) {
            console.error("Error toggling active status:", error);
            alert("❌ Failed to update status");
        }
    };

    const handleCountryToggle = (country) => {
        setFormData(prev => ({
            ...prev,
            assignedCountries: prev.assignedCountries.includes(country)
                ? prev.assignedCountries.filter(c => c !== country)
                : [...prev.assignedCountries, country]
        }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-black text-slate-800">Sub-Admin Management</h2>
                    <p className="text-sm text-slate-500 mt-1">Manage sub-admin accounts and country assignments</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                >
                    <MdAdd className="text-xl" />
                    Create Sub-Admin
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <FaUserShield className="text-blue-600 text-xl" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Total Sub-Admins</p>
                            <p className="text-2xl font-black text-slate-800">{subAdmins.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                            <MdCheckCircle className="text-emerald-600 text-xl" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Active</p>
                            <p className="text-2xl font-black text-emerald-600">{subAdmins.filter(sa => sa.isActive).length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                            <MdBlock className="text-red-600 text-xl" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Inactive</p>
                            <p className="text-2xl font-black text-red-600">{subAdmins.filter(sa => !sa.isActive).length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sub-Admins Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="text-left p-5 text-xs font-black text-slate-400 uppercase tracking-wider">Sub-Admin</th>
                            <th className="text-left p-5 text-xs font-black text-slate-400 uppercase tracking-wider">Assigned Countries</th>
                            <th className="text-left p-5 text-xs font-black text-slate-400 uppercase tracking-wider">Status</th>
                            <th className="text-left p-5 text-xs font-black text-slate-400 uppercase tracking-wider">Created</th>
                            <th className="text-left p-5 text-xs font-black text-slate-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subAdmins.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="p-12 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                                            <FaUserShield className="text-slate-400 text-2xl" />
                                        </div>
                                        <p className="text-slate-500 font-bold">No sub-admins yet</p>
                                        <p className="text-sm text-slate-400">Create your first sub-admin to get started</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            subAdmins.map((subAdmin) => (
                                <tr key={subAdmin.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                                    <td className="p-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-black">
                                                {subAdmin.displayName?.charAt(0).toUpperCase() || "S"}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800">{subAdmin.displayName}</p>
                                                <p className="text-xs text-slate-500">{subAdmin.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        {editingSubAdmin === subAdmin.id ? (
                                            <div className="flex flex-wrap gap-1 max-w-md">
                                                {ASIAN_COUNTRIES.slice(0, 10).map(country => (
                                                    <button
                                                        key={country}
                                                        onClick={() => handleCountryToggle(country)}
                                                        className={`text-xs px-2 py-1 rounded-full font-bold transition-all ${formData.assignedCountries.includes(country)
                                                                ? "bg-blue-600 text-white"
                                                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                                            }`}
                                                    >
                                                        {country}
                                                    </button>
                                                ))}
                                                <p className="text-xs text-slate-400 w-full mt-1">+ {ASIAN_COUNTRIES.length - 10} more countries...</p>
                                            </div>
                                        ) : (
                                            <div className="flex flex-wrap gap-1 max-w-md">
                                                {subAdmin.assignedCountries?.slice(0, 3).map(country => (
                                                    <span key={country} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-bold">
                                                        {country}
                                                    </span>
                                                ))}
                                                {subAdmin.assignedCountries?.length > 3 && (
                                                    <span className="text-xs text-slate-500 font-bold">
                                                        +{subAdmin.assignedCountries.length - 3} more
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-5">
                                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black ${subAdmin.isActive
                                                ? "bg-emerald-50 text-emerald-700"
                                                : "bg-red-50 text-red-700"
                                            }`}>
                                            {subAdmin.isActive ? <MdCheckCircle /> : <MdBlock />}
                                            {subAdmin.isActive ? "Active" : "Inactive"}
                                        </span>
                                    </td>
                                    <td className="p-5">
                                        <p className="text-sm text-slate-600 font-bold">
                                            {new Date(subAdmin.createdAt).toLocaleDateString()}
                                        </p>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex items-center gap-2">
                                            {editingSubAdmin === subAdmin.id ? (
                                                <>
                                                    <button
                                                        onClick={() => handleUpdateCountries(subAdmin.id, formData.assignedCountries)}
                                                        className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all"
                                                        title="Save"
                                                    >
                                                        <MdSave className="text-lg" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setEditingSubAdmin(null);
                                                            setFormData({ ...formData, assignedCountries: [] });
                                                        }}
                                                        className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-all"
                                                        title="Cancel"
                                                    >
                                                        <MdCancel className="text-lg" />
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => {
                                                            setEditingSubAdmin(subAdmin.id);
                                                            setFormData({ ...formData, assignedCountries: subAdmin.assignedCountries || [] });
                                                        }}
                                                        className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all"
                                                        title="Edit Countries"
                                                    >
                                                        <MdEdit className="text-lg" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleActive(subAdmin.id, subAdmin.isActive)}
                                                        className={`p-2 rounded-lg transition-all ${subAdmin.isActive
                                                                ? "bg-red-50 text-red-600 hover:bg-red-600 hover:text-white"
                                                                : "bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white"
                                                            }`}
                                                        title={subAdmin.isActive ? "Deactivate" : "Activate"}
                                                    >
                                                        {subAdmin.isActive ? <MdBlock className="text-lg" /> : <MdCheckCircle className="text-lg" />}
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create Sub-Admin Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setShowCreateModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        >
                            {/* Modal Header */}
                            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex justify-between items-center rounded-t-3xl">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-800">Create Sub-Admin</h3>
                                    <p className="text-sm text-slate-500 mt-1">Add a new sub-admin with country assignments</p>
                                </div>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                                >
                                    <MdClose className="text-2xl text-slate-600" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <form onSubmit={handleCreateSubAdmin} className="p-6 space-y-6">
                                {/* Display Name */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        <MdPerson className="inline mr-1" /> Display Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.displayName}
                                        onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        <MdEmail className="inline mr-1" /> Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        placeholder="subadmin@ostravels.com"
                                        required
                                    />
                                </div>

                                {/* Password */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        Password (min. 6 characters)
                                    </label>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        placeholder="••••••••"
                                        minLength={6}
                                        required
                                    />
                                </div>

                                {/* Country Assignment */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-3">
                                        <FaGlobe className="inline mr-1" /> Assign Countries ({formData.assignedCountries.length} selected)
                                    </label>
                                    <div className="border border-slate-200 rounded-xl p-4 max-h-64 overflow-y-auto">
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                            {ASIAN_COUNTRIES.map(country => (
                                                <button
                                                    key={country}
                                                    type="button"
                                                    onClick={() => handleCountryToggle(country)}
                                                    className={`text-sm px-3 py-2 rounded-lg font-bold transition-all text-left ${formData.assignedCountries.includes(country)
                                                            ? "bg-blue-600 text-white shadow-md"
                                                            : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                                                        }`}
                                                >
                                                    {formData.assignedCountries.includes(country) && "✓ "}
                                                    {country}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Error Message */}
                                {formError && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-bold">
                                        {formError}
                                    </div>
                                )}

                                {/* Submit Button */}
                                <div className="flex gap-3">
                                    <button
                                        type="submit"
                                        disabled={formLoading}
                                        className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {formLoading ? "Creating..." : "Create Sub-Admin"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="px-6 py-3 border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
