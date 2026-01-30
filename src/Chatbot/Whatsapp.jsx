import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Icons (from react-icons) ---
// Make sure to install: npm install react-icons
import { FaWhatsapp, FaTimes, FaPhoneAlt } from 'react-icons/fa';

// --- Main Component ---
function Whatsapp() {
  const [isOpen, setIsOpen] = useState(false);
  const toggleOpen = () => setIsOpen(!isOpen);

  // Animation variants for the chat box
  const boxVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.95,
      transition: { duration: 0.2, ease: 'easeOut' },
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: 'spring', stiffness: 400, damping: 25 },
    },
    exit: {
      opacity: 0,
      y: 20,
      scale: 0.95,
      transition: { duration: 0.2, ease: 'easeIn' },
    },
  };

  return (
    <>
      {/* --- Chat Box --- */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={boxVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed bottom-24 left-5 w-80 bg-white rounded-lg shadow-2xl z-50 overflow-hidden"
            style={{ maxWidth: 'calc(100vw - 40px)' }} // Ensures it fits on mobile
          >
            {/* Header */}
            <div className="bg-green-600 text-white p-4 flex justify-between items-center">
              <h3 className="font-bold text-lg">Chat with O.S. Travel!</h3>
              <button
                onClick={toggleOpen}
                className="text-xl hover:opacity-75 transition-opacity"
                aria-label="Close chat"
              >
                <FaTimes />
              </button>
            </div>

            {/* Body (Greeting) */}
            <div className="p-4">
              <p className="text-gray-700 text-md">
                Hello! 👋<br />
                Need assistance with a visa or planning your trip? We're here
                to help!
              </p>
            </div>

            {/* Footer with Links */}
            <div className="p-4 bg-gray-50 border-t border-gray-100">
              {/* WhatsApp Link (Mobile) */}
              <a
                href="https://wa.me/923335542877" // Correct format for WhatsApp
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full bg-green-500 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:bg-green-600 transition-all"
              >
                <FaWhatsapp className="text-xl" />
                <span>Chat on WhatsApp</span>
              </a>

              {/* Call Link (Landline) */}
              <a
                href="tel:+92512120700" // Correct format for telephone
                className="flex items-center justify-center gap-3 w-full bg-blue-500 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:bg-blue-600 transition-all mt-3"
              >
                <FaPhoneAlt className="text-lg" />
                <span>Call our Office</span>
              </a>
              <p className="text-center text-gray-500 text-sm mt-2">
                051-2120700-701
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Trigger Button --- */}
      <button
        onClick={toggleOpen}
        className="fixed bottom-5 left-5 w-16 h-16 bg-green-500 rounded-full shadow-lg flex items-center justify-center text-white z-50 transform transition-transform hover:scale-110"
        aria-label="Open chat"
      >
        <motion.div
          animate={{
            scale: [1, 1.1, 1], // Pulse effect
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {/* Show X if open, WhatsApp icon if closed */}
          {isOpen ? <FaTimes className="text-3xl" /> : <FaWhatsapp className="text-4xl" />}
        </motion.div>
      </button>
    </>
  );
}

export default Whatsapp;