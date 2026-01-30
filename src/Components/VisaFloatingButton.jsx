import React from 'react';
import { motion } from 'framer-motion';
import { FaPassport } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

function VisaFloatingButton() {
    const navigate = useNavigate();

    return (
        <motion.button
            onClick={() => navigate('/apply-visa')}
            className="fixed right-6 top-1/3 z-30 bg-gradient-to-br from-emerald-500 to-emerald-600 
                 text-white px-6 py-4 rounded-full shadow-2xl hover:shadow-emerald-500/50 
                 transition-all duration-300 flex items-center gap-3 group
                 border-2 border-emerald-400"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 1 }}
            whileHover={{ scale: 1.05, x: -5 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Apply for Visa"
        >
            {/* Pulsing Ring Animation */}
            <motion.div
                className="absolute inset-0 rounded-full bg-emerald-400"
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0, 0.5]
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />

            {/* Icon */}
            <motion.div
                className="relative z-10"
                animate={{
                    rotate: [0, 10, -10, 0]
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            >
                <FaPassport className="text-2xl" />
            </motion.div>

            {/* Text */}
            <div className="relative z-10 text-left">
                <p className="text-xs font-bold uppercase tracking-wider opacity-90">Apply Now</p>
                <p className="text-sm font-black">Visa Services</p>
            </div>

            {/* Arrow indicator */}
            <motion.div
                className="relative z-10"
                animate={{ x: [0, 5, 0] }}
                transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            >
                <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M9 5l7 7-7 7"
                    />
                </svg>
            </motion.div>

            {/* Shine effect on hover */}
            <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.6 }}
            />
        </motion.button>
    );
}

export default VisaFloatingButton;
