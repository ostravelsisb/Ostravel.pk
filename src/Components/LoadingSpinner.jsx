import React from "react";
import { motion } from "framer-motion";
import logo from "../assets/logoimg/image.png";

const LoadingSpinner = () => {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                className="mb-8"
            >
                <img src={logo} alt="O.S Travel & Tours" className="w-32 object-contain" />
            </motion.div>

            <div className="flex gap-2">
                {[0, 1, 2].map((index) => (
                    <motion.div
                        key={index}
                        className="w-4 h-4 bg-blue-600 rounded-full"
                        animate={{
                            y: ["0%", "-50%", "0%"],
                            opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            delay: index * 0.2,
                            ease: "easeInOut",
                        }}
                    />
                ))}
            </div>
            <p className="mt-4 text-gray-400 font-bold text-sm tracking-widest uppercase">Loading Experience...</p>
        </div>
    );
};

export default LoadingSpinner;
