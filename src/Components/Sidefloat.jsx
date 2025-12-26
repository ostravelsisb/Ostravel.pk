import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// --- UPDATED ICONS ---
import {
  FaChevronRight,
  FaHeadset,
  FaWhatsapp,
  FaPhoneAlt,
  FaBuilding,
} from 'react-icons/fa';
import { Link } from 'react-router-dom';

function Sidefloat() {
  // State now controls if the panel is open or minimized
  const [isOpen, setIsOpen] = useState(true);
  const toggleOpen = () => setIsOpen(!isOpen);

  // Animation variants for the main container
  const containerVariants = {
    open: {
      width: "auto", // Let content decide width
      transition: { type: "spring", stiffness: 400, damping: 30, delay: 0.1 },
    },
    closed: {
      width: "4rem", // This is 64px (w-16)
      transition: { type: "spring", stiffness: 400, damping: 30 },
    },
  };

  // Variants for the content (text, button) fading in/out
  const contentVariants = {
    open: {
      opacity: 1,
      transition: { delay: 0.3 },
    },
    closed: {
      opacity: 0,
      transition: { duration: 0.1 },
    },
  };

  // Variants for the minimized icon fading in/out
  const iconVariants = {
    open: {
      opacity: 0,
      transition: { duration: 0.1 },
    },
    closed: {
      opacity: 1,
      transition: { delay: 0.3 },
    },
  };

  return (
    <motion.div
      className="fixed top-1/2 right-0 z-40 bg-white shadow-2xl 
                 rounded-l-lg overflow-hidden
                 border-l-4 border-t-4 border-b-4 border-blue-500"
      style={{ y: "-50%" }}
      variants={containerVariants}
      animate={isOpen ? "open" : "closed"}
      initial="open" // Start in the open state
    >
      {/* We use AnimatePresence to switch between the open and closed content */}
      <AnimatePresence mode="wait">
        {isOpen ? (
          // --- 2. OPEN VIEW (The Content) ---
          <motion.div
            key="content"
            // Set max-width for responsiveness on small screens
            className="w-80 max-w-[calc(100vw-40px)] p-6" 
            variants={contentVariants}
            initial="closed"
            animate="open"
            exit="closed"
          >
            {/* --- Close (Minimize) Button --- */}
            <button
              onClick={toggleOpen}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 transition-colors"
              aria-label="Minimize"
            >
              {/* Changed from FaTimes to a "minimize" chevron */}
              <FaChevronRight />
            </button>

            {/* --- Content --- */}
            <div className="flex items-center gap-3 mb-3">
              <FaHeadset className="text-4xl text-blue-500 shrink-0" />
              <h3 className="text-xl font-bold text-gray-800">
                Need Expert Guidance?
              </h3>
            </div>
            
            <p className="text-gray-600 mb-5">
              We are available! For expert guidance on your visa file, flight bookings, 
              or tour packages, contact us now.
            </p>

            {/* --- NEW CTAs --- */}
            <div className="space-y-3">
              {/* WhatsApp Button */}
              <a
                href="https://wa.me/923335542877"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full bg-green-500 text-white font-semibold py-2 px-4 
                           rounded-lg shadow-md hover:bg-green-600 transition-all"
              >
                <FaWhatsapp className="text-lg" />
                <span>Chat on WhatsApp</span>
              </a>

              {/* Call Us Button */}
              <a
                href="tel:+92512120700"
                className="flex items-center justify-center gap-3 w-full bg-blue-600 text-white font-semibold py-2 px-4 
                           rounded-lg shadow-md hover:bg-blue-700 transition-all"
              >
                <FaPhoneAlt className="text-lg" />
                <span>Call Our Office</span>
              </a>

              {/* Visit Us/Contact Page Button */}
              <Link
                to="/contact"
                onClick={() => setIsOpen(false)} // Minimize when CTA is clicked
                className="flex items-center justify-center gap-3 w-full bg-gray-100 text-gray-700 font-semibold py-2 px-4 
                           rounded-lg shadow-sm hover:bg-gray-200 transition-all border border-gray-300"
              >
                <FaBuilding className="text-lg" />
                <span>Visit Us or Live Chat</span>
              </Link>
            </div>
          </motion.div>
        ) : (
          // --- 1. MINIMIZED VIEW (The Icon Button) ---
          <motion.button
            key="icon"
            onClick={toggleOpen}
            className="w-16 h-24 flex items-center justify-center text-blue-500 cursor-pointer" // h-24 for vertical center
            aria-label="Open guidance panel"
            variants={iconVariants}
            initial="closed"
            animate="closed"
            exit="open"
          >
            <FaHeadset className="text-3xl" />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default Sidefloat;