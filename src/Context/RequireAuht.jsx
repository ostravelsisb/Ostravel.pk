import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

function RequireAuth({ children }) {
  const { currentUser, loading } = useAuth(); // Destructure loading
  const location = useLocation();

  // 1. Wait for Auth Check to complete
  if (loading) {
    return null; // or <div className="p-4 text-center">Checking access...</div>
    // Note: AuthProvider usually shows a spinner while loading, 
    // so this might only be hit if AuthProvider finishes but sets loading=false
    // before currentUser is fully propagated (rare but possible).
  }

  // 2. If not logged in, redirect
  if (!currentUser) {
    // Redirect to Login, but save the current location they were trying to visit!
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Render children
  return children;
}

export default RequireAuth;