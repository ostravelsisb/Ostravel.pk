import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "../assets/logoimg/image.png";

// --- Icons ---
import { FaGoogle, FaFacebookF } from "react-icons/fa";
import { MdEmail, MdLock } from "react-icons/md";

// --- Firebase Helpers ---
import { signIn, signInWithGoogle, db } from "../firbase";
import { collection, query, where, getDocs } from "firebase/firestore";

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100 },
  },
};

// --- Main Component ---
function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Get the Path to go back to (e.g., "/purchase")
  const from = location.state?.from?.pathname || "/";

  // 2. CRITICAL FIX: Get the Data (Package info) meant for that page
  // 'location.state.from' is the location object of the page we tried to visit.
  // We need its '.state' property.
  const originalPageData = location.state?.from?.state;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "Login - O.S Travel & Tours";
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCred = await signIn(email, password);

      // Check Role for Redirect
      try {
        const q = query(collection(db, "users"), where("Email", "==", email));
        const querySnapshot = await getDocs(q);
        let role = "user";
        if (!querySnapshot.empty) {
          const data = querySnapshot.docs[0].data();
          role = data.role || data.Role || "user";
        }

        if (role === "admin") {
          navigate("/admin/dashboard");
        } else {
          // If not admin, navigate to the original destination or home
          navigate(from, { replace: true, state: originalPageData });
        }
      } catch (err) {
        console.error("Role check failed, defaulting to home", err);
        // If role check fails, still try to navigate to the original destination or home
        navigate(from, { replace: true, state: originalPageData });
      }

    } catch (err) {
      console.error("Login Error:", err);
      if (err.code === "auth/invalid-credential") {
        setError("Incorrect email or password.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many failed attempts. Please reset your password or try again later.");
      } else {
        setError("Failed to sign in. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      await signInWithGoogle();
      // 3. Pass the 'originalPageData' back here too
      navigate(from, { replace: true, state: originalPageData });
    } catch (err) {
      console.error("Google Login Error:", err);
      setError("Failed to sign in with Google.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <motion.div
        className="flex w-full max-w-4xl overflow-hidden bg-white rounded-2xl shadow-2xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* --- 1. Form Panel (Right Side) --- */}
        <div className="w-full lg:w-1/2 p-8 md:p-12">
          <motion.div
            variants={containerVariants}
            className="flex flex-col h-full"
          >
            {/* Logo */}
            <motion.div variants={itemVariants} className="mb-8">
              <Link to="/">
                <img
                  src={logo}
                  alt="O.S Travel & Tours Logo"
                  className="w-32 object-contain"
                />
              </Link>
            </motion.div>

            {/* Title */}
            <motion.h2
              variants={itemVariants}
              className="text-3xl font-extrabold text-gray-900 mb-2"
            >
              Welcome Back!
            </motion.h2>
            <motion.p variants={itemVariants} className="text-gray-600 mb-8">
              Sign in to your account to continue.
            </motion.p>

            {/* Error Banner */}
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 text-sm rounded-lg"
              >
                {error}
              </motion.div>
            )}

            {/* Form */}
            <motion.form
              variants={itemVariants}
              className="space-y-5"
              onSubmit={handleLogin}
            >
              <div>
                <label htmlFor="email" className="text-sm font-semibold text-gray-700">Email Address</label>
                <div className="relative mt-2">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <MdEmail className="h-5 w-5 text-gray-400" />
                  </span>
                  <input
                    id="email" name="email" type="email" autoComplete="email" required
                    placeholder="you@example.com"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 p-3 pl-10 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center">
                  <label htmlFor="password" className="text-sm font-semibold text-gray-700">Password</label>
                  <Link to="/forgot-password" className="text-sm font-semibold text-blue-600 hover:underline">Forgot password?</Link>
                </div>
                <div className="relative mt-2">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <MdLock className="h-5 w-5 text-gray-400" />
                  </span>
                  <input
                    id="password" name="password" type="password" autoComplete="current-password" required
                    placeholder="••••••••"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 p-3 pl-10 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit" disabled={loading}
                className={`w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 ${loading ? "opacity-70 cursor-wait" : ""}`}
              >
                {loading ? "Signing In..." : "Sign In"}
              </button>
            </motion.form>

            <motion.div variants={itemVariants} className="my-8 flex items-center">
              <hr className="grow border-gray-300" />
              <span className="mx-4 text-sm font-medium text-gray-500">Or continue with</span>
              <hr className="grow border-gray-300" />
            </motion.div>

            <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
              <button
                type="button" onClick={handleGoogleLogin} disabled={loading}
                className="flex items-center justify-center gap-2 w-full bg-white border border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-gray-50 transition-all"
              >
                <FaGoogle className="text-red-500" /> Google
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-2 w-full bg-white border border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-gray-50 transition-all"
              >
                <FaFacebookF className="text-blue-700" /> Facebook
              </button>
            </motion.div>

            <motion.p variants={itemVariants} className="mt-8 text-center text-sm text-gray-600">
              Don't have an account? <Link to="/signup" className="font-semibold text-blue-600 hover:underline">Sign up</Link>
            </motion.p>
          </motion.div>
        </div>

        <div className="hidden lg:block lg:w-1/2 relative">
          <img
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto=format&fit=crop"
            alt="Tropical beach"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="relative z-10 flex flex-col justify-end h-full p-12 bg-black/40">
            <motion.h3 initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="text-4xl font-bold text-white mb-4">
              Your Journey<br />Starts Here.
            </motion.h3>
            <motion.p initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.5 }} className="text-lg text-white/90">
              Get access to exclusive deals, visa tracking, and your complete travel history, all in one place.
            </motion.p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Login;