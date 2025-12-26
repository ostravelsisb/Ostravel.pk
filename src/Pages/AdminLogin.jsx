import React, { useState } from "react";
import { auth, db } from "../firbase";
import { collection, query, where, getDocs } from "firebase/firestore";
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
    const from = location.state?.from?.pathname || "/admin/dashboard";

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await signInWithEmailAndPassword(auth, email, password);

            // Verify Admin Role from Firestore
            const q = query(collection(db, "users"), where("Email", "==", email));
            const snapshot = await getDocs(q);

            let isAdmin = false;
            if (!snapshot.empty) {
                const data = snapshot.docs[0].data();
                const role = data.role || data.Role || "user";
                if (role === 'admin') isAdmin = true;
            }

            if (isAdmin) {
                navigate(from, { replace: true });
            } else {
                setError("Access Denied: You are not an admin.");
                // Optionally sign them out immediately
            }

        } catch (err) {
            console.error(err);
            setError("Invalid Admin Credentials");
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
