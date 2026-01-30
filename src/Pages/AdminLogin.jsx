import React, { useState } from "react";
import { auth, db, signOut } from "../firbase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { FaLock, FaUserShield } from "react-icons/fa";

export default function AdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // Sign in with Firebase Auth
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Fetch user role from Firestore using UID (most reliable)
            const userDocRef = doc(db, "users", user.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
                const userData = userDocSnap.data();
                const role = userData.role || "user";

                console.log("🔐 Login - User Role:", role);
                console.log("🔐 Login - User Data:", userData);

                // Handle different roles
                if (role === "admin") {
                    // Main Admin - redirect to admin dashboard
                    navigate("/admin/dashboard", { replace: true });
                } else if (role === "subAdmin") {
                    // Sub-Admin - check if active
                    if (!userData.isActive) {
                        setError("Your account has been deactivated. Contact the administrator.");
                        await signOut();
                        return;
                    }
                    // Redirect to sub-admin panel
                    navigate("/subadmin/dashboard", { replace: true });
                } else {
                    // Regular user - not authorized
                    setError("Access Denied: You are not authorized to access the admin panel.");
                    await signOut();
                }
            } else {
                setError("User data not found. Please contact support.");
                await signOut();
            }

        } catch (err) {
            console.error("Login Error:", err);
            if (err.code === "auth/wrong-password" || err.code === "auth/user-not-found") {
                setError("Invalid email or password");
            } else if (err.code === "auth/too-many-requests") {
                setError("Too many failed attempts. Please try again later.");
            } else {
                setError("Login failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden"
            >
                <div className="bg-blue-900 p-8 text-center">
                    <div className="mx-auto w-16 h-16 bg-blue-800 rounded-full flex items-center justify-center mb-4 text-blue-200">
                        <FaUserShield className="text-3xl" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Admin Portal</h2>
                    <p className="text-blue-200 text-sm mt-2">Authorized Personnel Only</p>
                </div>

                <div className="p-8">
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Admin Email</label>
                            <div className="relative">
                                <FaUserShield className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none transition-all"
                                    placeholder="admin@ostravels.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <div className="relative">
                                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 text-center">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full bg-blue-900 text-white font-bold py-3 rounded-lg hover:bg-blue-800 transition-colors shadow-lg shadow-blue-900/20 ${loading ? 'opacity-70 cursor-wait' : ''}`}
                        >
                            {loading ? "Authenticating..." : "Access Dashboard"}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <a href="/" className="text-sm text-gray-500 hover:text-blue-900 transition-colors">
                            ← Return to Website
                        </a>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
