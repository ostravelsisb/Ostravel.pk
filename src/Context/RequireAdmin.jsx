import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

function RequireAdmin({ children }) {
    const { currentUser, userRole, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    // 1. Check if Logged In
    if (!currentUser) {
        return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }

    // 2. Check Role
    console.log("🔐 RequireAdmin - Current User Role:", userRole);
    console.log("🔐 RequireAdmin - Current User Email:", currentUser?.email);

    // Redirect sub-admins to their own panel
    if (userRole === "subAdmin") {
        return <Navigate to="/subadmin/dashboard" replace />;
    }

    if (userRole !== "admin") {
        // Logged in but not an admin -> Access Denied
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-50 text-center px-4">
                <h1 className="text-3xl font-bold text-red-600 mb-4">Access Denied</h1>
                <p className="text-gray-600 mb-2">You do not have permission to view this page.</p>
                <p className="text-sm text-gray-500 mb-4">User: {currentUser?.email}</p>
                <p className="text-xs text-gray-400 mb-8">Role: {userRole || "not set"}</p>
                <button
                    onClick={() => window.location.href = "/"}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700"
                >
                    Return Home
                </button>
            </div>
        );
    }

    return children;
}

export default RequireAdmin;
