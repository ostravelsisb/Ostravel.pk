import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

function RequireUser({ children }) {
    const { currentUser, userRole, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    // 1. Check if Logged In
    if (!currentUser) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 2. Redirect admins to admin dashboard
    if (userRole === "admin") {
        return <Navigate to="/admin/dashboard" replace />;
    }

    return children;
}

export default RequireUser;
