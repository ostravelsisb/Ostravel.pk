import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { HiOutlineEmojiSad } from "react-icons/hi";

export default function NotFound() {
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "Page Not Found - O.S Travel & Tours";
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full"
            >
                <div className="flex justify-center mb-6">
                    <HiOutlineEmojiSad className="text-9xl text-gray-300" />
                </div>

                <h1 className="text-6xl font-black text-blue-900 mb-2">404</h1>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Page Not Found</h2>
                <p className="text-gray-600 mb-8">
                    Oops! The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                </p>

                <div className="flex justify-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-bold hover:bg-gray-100 transition-colors"
                    >
                        Go Back
                    </button>
                    <Link
                        to="/"
                        className="px-6 py-3 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
                    >
                        Return Home
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
