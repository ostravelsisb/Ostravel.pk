import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MdPhone,
  MdEmail,
  MdLocationOn,
  MdPerson,
  MdSubject,
} from "react-icons/md";
import { db } from "../firbase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
// --- Animation Variants ---
const sectionVariant = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeInOut",
    },
  },
};

const cardContainerVariant = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.2,
    },
  },
};

const cardVariant = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0 },
};

const formVariant = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: "easeInOut",
      delay: 0.2,
    },
  },
};

// --- Helper Card Component ---
const InfoCard = ({ icon, title, children }) => (
  <motion.div
    variants={cardVariant}
    className="flex items-start gap-4 p-6 bg-white rounded-lg shadow-md"
  >
    <div className="shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
      {React.cloneElement(icon, { className: "text-2xl text-blue-600" })}
    </div>
    <div>
      <h3 className="text-xl font-semibold text-gray-900 mb-1">{title}</h3>
      <div className="text-gray-600 leading-relaxed">{children}</div>
    </div>
  </motion.div>
);

// --- Main Contact Page Component ---
function Contact() {
  useEffect(() => {
    document.title = "Contact Us - O.S Travel & Tours"; // Dynamically sets title
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error' | null

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      await addDoc(collection(db, "contact_messages"), {
        ...formData,
        createdAt: serverTimestamp(),
        status: "unread"
      });
      setSubmitStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      console.error("Error sending message: ", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-gray-50 overflow-x-hidden">
      {/* 1. Hero Section */}
      <div className="relative w-full h-64 md:h-72 bg-blue-500">
        <img
          src="https://tnu.edu.eg/Design/assets/media/contact.jpg"
          alt="Contact us background"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-4xl md:text-6xl font-bold text-white mb-2"
          >
            Get in Touch
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-lg md:text-xl text-white opacity-90"
          >
            We're here to help you plan your next perfect trip.
          </motion.p>
        </div>
      </div>

      {/* 2. Main Content (Info Cards & Form) */}
      <section className="py-16 md:py-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* Left Column: Info Cards */}
          <motion.div
            variants={cardContainerVariant}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-6"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Contact Information
            </h2>
            <p className="text-lg text-gray-600 mb-4 -mt-4">
              Reach out to us via phone, email, or visit our office.
            </p>

            <InfoCard icon={<MdPhone />} title="Phone">
              <a href="tel:0512120700" className="hover:text-blue-600 hover:underline">
                051-2120700-701
              </a>
              <br />
              <a href="tel:03335542877" className="hover:text-blue-600 hover:underline">
                0333-5542877
              </a>
            </InfoCard>

            <InfoCard icon={<MdEmail />} title="Email">
              <a href="mailto:info@ostravels.com" className="hover:text-blue-600 hover:underline">
                info@ostravels.com
              </a>
              <br />
              <a href="mailto:ostravelsisb@gmail.com" className="hover:text-blue-600 hover:underline">
                ostravelsisb@gmail.com
              </a>
            </InfoCard>

            <InfoCard icon={<MdLocationOn />} title="Address">
              <p>
                Office # 3, Aaly Plaza, Fazal e Haq Rd, Block E G 6/2 Blue Area,
                Islamabad
              </p>
            </InfoCard>
          </motion.div>

          {/* Right Column: Contact Form */}
          <motion.div
            variants={formVariant}
            initial="hidden"
            animate="visible"
            className="bg-white p-6 sm:p-8 rounded-lg shadow-xl"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Send Us a Message
            </h2>
            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Full Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <MdPerson className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your Full Name"
                    className="w-full h-14 pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <MdEmail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
                  <input
                    type="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="you@example.com"
                    className="w-full h-14 pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Subject */}
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <div className="relative">
                  <MdSubject className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
                  <input
                    type="text"
                    id="subject"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g., Visa Inquiry, Tour Package"
                    className="w-full h-14 pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  id="message"
                  required
                  rows="5"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Write your message here..."
                  className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting}
                className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-lg px-10 py-3 transition-colors ${isSubmitting ? "opacity-70 cursor-not-allowed" : ""}`}
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </motion.button>

              {submitStatus && (
                <div className={`p-4 rounded-lg text-center ${submitStatus === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {submitStatus === 'success' ? 'Message sent successfully! We will get back to you soon.' : 'Failed to send message. Please try again.'}
                </div>
              )}
            </form>
          </motion.div>
        </div>
      </section>

      {/* 3. Map Section */}
      <motion.section
        variants={sectionVariant}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="w-full py-16 md:py-24 px-6 bg-white" // Changed to white for a seamless feel
      >
        <div className="text-center w-full max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
            Visit Us in Islamabad
          </h2>
          <div className="w-full overflow-hidden rounded-xl shadow-2xl border-4 border-white">
            <iframe
              width="100%"
              height="450"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              // This src is generated from your exact address and is the correct way to embed
              src="https://maps.google.com/maps?q=Office%20%23%203%2C%20Aaly%20Plaza%2C%20Fazal%20e%20Haq%20Rd%2C%20Block%20E%20G%206%2F2%20Blue%20Area%2C%20Islamabad&t=&z=15&ie=UTF8&iwloc=&output=embed"
            ></iframe>
          </div>
        </div>
      </motion.section>
    </div>
  );
}

export default Contact;