import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, db } from "../firbase"; // Import db
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";

const AuthContext = createContext();

// Custom hook to use the auth context easily
export function useAuth() {
  return useContext(AuthContext);
}

import LoadingSpinner from "../Components/LoadingSpinner"; // Import Spinner

// ... existing imports

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null); // 'admin' | 'subAdmin' | 'user' | null
  const [userData, setUserData] = useState(null); // Full user document from Firestore
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(async (user) => {
      setCurrentUser(user);

      if (user) {
        // Fetch Role from Firestore
        try {
          console.log("🔍 Fetching role for user:", user.email, "UID:", user.uid);

          // Try to get document by UID first (most reliable)
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userDoc = userDocSnap.data();
            console.log("📄 User document data (by UID):", userDoc);
            console.log("🔑 Role field value:", userDoc.role);
            console.log("🔑 Role field value (capital R):", userDoc.Role);

            const fetchedRole = userDoc.role || userDoc.Role || "user";
            setUserRole(fetchedRole);
            setUserData(userDoc); // Store complete user data
            console.log("✅ User Role Set To:", fetchedRole);

            // Check if sub-admin is active
            if (fetchedRole === "subAdmin" && !userDoc.isActive) {
              console.warn("⚠️ Sub-admin account is deactivated");
            }
          } else {
            // Fallback: Try querying by Email if UID document doesn't exist
            console.log("⚠️ No document found by UID, trying Email query...");
            const q = query(collection(db, "users"), where("Email", "==", user.email));
            const querySnapshot = await getDocs(q);

            console.log("📊 Email query results - Empty?", querySnapshot.empty);
            console.log("📊 Number of documents found:", querySnapshot.docs.length);

            if (!querySnapshot.empty) {
              const userDoc = querySnapshot.docs[0].data();
              console.log("📄 User document data (by Email):", userDoc);
              console.log("🔑 Role field value:", userDoc.role);
              console.log("🔑 Role field value (capital R):", userDoc.Role);

              const fetchedRole = userDoc.role || userDoc.Role || "user";
              setUserRole(fetchedRole);
              setUserData(userDoc); // Store complete user data
              console.log("✅ User Role Set To:", fetchedRole);
            } else {
              console.warn("⚠️ No user document found for email:", user.email);
              setUserRole("user");
            }
          }
        } catch (error) {
          console.error("❌ Error fetching user role:", error);
          setUserRole("user");
        }
      } else {
        setUserRole(null);
        setUserData(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole,
    userData,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? <LoadingSpinner /> : children}
    </AuthContext.Provider>
  );
}