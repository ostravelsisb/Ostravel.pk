import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import LoadingSpinner from "../Components/LoadingSpinner";

function RequireSubAdmin({ children }) {
    const { currentUser, userRole, userData, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-slate-50">
                <LoadingSpinner />
            </div>
        );
    }

    // 1. Check if Logged In
    if (!currentUser) {
        return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }

    // 2. Check Role
    console.log("🔐 RequireSubAdmin - Current User Role:", userRole);
    console.log("🔐 RequireSubAdmin - Current User Email:", currentUser?.email);

    if (userRole !== "subAdmin") {
        // Logged in but not a sub-admin -> Access Denied
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-50 text-center px-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-black text-slate-800 mb-2">Access Denied</h1>
                    <p className="text-slate-600 mb-4">You do not have permission to view this page.</p>
                    <div className="bg-slate-50 p-3 rounded-lg mb-6">
                        <p className="text-sm text-slate-500 mb-1">User: <span className="font-bold text-slate-700">{currentUser?.email}</span></p>
                        <p className="text-xs text-slate-400">Role: <span className="font-bold">{userRole || "not set"}</span></p>
                    </div>
                    <button
                        onClick={() => window.location.href = "/"}
                        className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
                    >
                        Return Home
                    </button>
                </div>
            </div>
        );
    }

    // 3. Check if Sub-Admin is Active
    if (userData && !userData.isActive) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-50 text-center px-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-black text-slate-800 mb-2">Account Deactivated</h1>
                    <p className="text-slate-600 mb-4">Your sub-admin account has been deactivated.</p>
                    <div className="bg-slate-50 p-3 rounded-lg mb-6">
                        <p className="text-sm text-slate-500">Please contact the main administrator for assistance.</p>
                    </div>
                    <button
                        onClick={() => window.location.href = "/"}
                        className="w-full bg-slate-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-slate-700 transition-colors shadow-lg"
                    >
                        Return Home
                    </button>
                </div>
            </div>
        );
    }

    return children;
}

export default RequireSubAdmin;
