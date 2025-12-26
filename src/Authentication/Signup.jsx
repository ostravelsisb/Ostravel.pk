import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"; // Added useNavigate
import { motion } from "framer-motion";
import logo from "../assets/logoimg/image.png";

// --- Firebase Helpers ---
// Importing the helpers we created in firebase.js
import { signUp, signInWithGoogle } from "../firbase";

// --- Icons ---
import { FaGoogle, FaFacebookF } from "react-icons/fa";
import { MdEmail, MdLock, MdPerson } from "react-icons/md";

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
function Signup() {
  const navigate = useNavigate();

  // 1. State for form inputs and UI feedback
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "Sign Up - O.S Travel & Tours";
  }, []);

  // 2. Handle Email/Password Sign Up
  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Uses the helper from firebase.js which also sets the Display Name
      await signUp(email, password, name);
      // Success: Redirect to home
      navigate("/");
    } catch (err) {
      console.error("Signup Error:", err);
      if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered. Please sign in.");
      } else if (err.code === "auth/weak-password") {
        setError("Password should be at least 6 characters.");
      } else {
        setError("Failed to create account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // 3. Handle Google Sign Up (Same as Login)
  const handleGoogleSignup = async () => {
    setError("");
    setLoading(true);

    try {
      await signInWithGoogle();
      navigate("/");
    } catch (err) {
      console.error("Google Signup Error:", err);
      setError("Failed to sign up with Google.");
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
        {/* --- 1. Image Panel (Left Side) --- */}
        <div className="hidden lg:block lg:w-1/2 relative">
          <img
            src="https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?q=80&w=1966&auto=format&fit=crop"
            alt="Canal in Venice, Italy"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Overlay Content */}
          <div className="relative z-10 flex flex-col justify-end h-full p-12 bg-black/40">
            <motion.h3
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-4xl font-bold text-white mb-4"
            >
              Start Your
              <br />
              Adventure Today.
            </motion.h3>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-lg text-white/90"
            >
              Sign up to get access to exclusive deals, visa tracking, and
              your complete travel history.
            </motion.p>
          </div>
        </div>

        {/* --- 2. Form Panel (Right Side) --- */}
        <div className="w-full lg:w-1/2 p-8 md:p-12">
          <motion.div
            variants={containerVariants}
            className="flex flex-col"
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
              Create Your Account
            </motion.h2>
            <motion.p variants={itemVariants} className="text-gray-600 mb-8">
              Join us and start planning your next adventure.
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
              onSubmit={handleSignup}
            >
              {/* Full Name Input */}
              <div>
                <label
                  htmlFor="name"
                  className="text-sm font-semibold text-gray-700"
                >
                  Full Name
                </label>
                <div className="relative mt-2">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <MdPerson className="h-5 w-5 text-gray-400" />
                  </span>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 p-3 pl-10 text-gray-900 shadow-sm
                               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Email Input */}
              <div>
                <label
                  htmlFor="email"
                  className="text-sm font-semibold text-gray-700"
                >
                  Email Address
                </label>
                <div className="relative mt-2">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <MdEmail className="h-5 w-5 text-gray-400" />
                  </span>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 p-3 pl-10 text-gray-900 shadow-sm
                               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label
                  htmlFor="password"
                  className="text-sm font-semibold text-gray-700"
                >
                  Password
                </label>
                <div className="relative mt-2">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <MdLock className="h-5 w-5 text-gray-400" />
                  </span>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 p-3 pl-10 text-gray-900 shadow-sm
                               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Sign Up Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg
                           hover:bg-blue-700 transition-all duration-300
                           transform hover:scale-105 ${loading ? "opacity-70 cursor-wait" : ""}`}
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </motion.form>

            {/* "Or sign up with" Divider */}
            <motion.div
              variants={itemVariants}
              className="my-8 flex items-center"
            >
              <hr className="grow border-gray-300" />
              <span className="mx-4 text-sm font-medium text-gray-500">
                Or sign up with
              </span>
              <hr className="grow border-gray-300" />
            </motion.div>

            {/* Social Logins */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-2 gap-4"
            >
              <button
                type="button" // Important: type="button" to prevent form submit
                onClick={handleGoogleSignup}
                disabled={loading}
                className="flex items-center justify-center gap-2 w-full bg-white border border-gray-300
                           text-gray-700 font-semibold py-2 px-4 rounded-lg shadow-sm
                           hover:bg-gray-50 transition-all"
              >
                <FaGoogle className="text-red-500" />
                Google
              </button>
              
              {/* Facebook (Placeholder) */}
              <button
                type="button"
                className="flex items-center justify-center gap-2 w-full bg-white border border-gray-300
                           text-gray-700 font-semibold py-2 px-4 rounded-lg shadow-sm
                           hover:bg-gray-50 transition-all"
              >
                <FaFacebookF className="text-blue-700" />
                Facebook
              </button>
            </motion.div>

            {/* Sign In Link */}
            <motion.p
              variants={itemVariants}
              className="mt-8 text-center text-sm text-gray-600"
            >
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-blue-600 hover:underline"
              >
                Sign in
              </Link>
            </motion.p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

export default Signup;