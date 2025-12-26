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
    if (userRole !== "admin") {
        // Logged in but not an admin -> Access Denied
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-50 text-center px-4">
                <h1 className="text-3xl font-bold text-red-600 mb-4">Access Denied</h1>
                <p className="text-gray-600 mb-8">You do not have permission to view this page.</p>
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
