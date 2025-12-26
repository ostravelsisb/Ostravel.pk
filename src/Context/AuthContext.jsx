import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, db } from "../firbase"; // Import db
import { collection, query, where, getDocs } from "firebase/firestore";

const AuthContext = createContext();

// Custom hook to use the auth context easily
export function useAuth() {
  return useContext(AuthContext);
}

import LoadingSpinner from "../Components/LoadingSpinner"; // Import Spinner

// ... existing imports

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null); // 'admin' | 'user' | null
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(async (user) => {
      setCurrentUser(user);

      if (user) {
        // Fetch Role from Firestore
        try {
          // Querying for "Email" (Capitalized) as per user's database structure
          const q = query(collection(db, "users"), where("Email", "==", user.email));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0].data();
            // Check 'role' or 'Role' to be safe
            setUserRole(userDoc.role || userDoc.Role || "user");
            console.log("User Role Fetched:", userDoc.role || userDoc.Role);
          } else {
            console.warn("No user document found for email:", user.email);
            setUserRole("user");
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
          setUserRole("user");
        }
      } else {
        setUserRole(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? <LoadingSpinner /> : children}
    </AuthContext.Provider>
  );
}