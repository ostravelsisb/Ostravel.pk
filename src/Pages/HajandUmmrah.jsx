import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useEffect } from "react";
// --- Icons (from react-icons) ---
// Make sure to install: npm install react-icons
import {
  FaKaaba, FaMoon, FaStar, FaPlane, FaHotel, FaBus, FaCheckCircle,
  FaFileContract, FaChevronDown, FaQuoteLeft, FaBuilding, FaPhone, FaEnvelope
} from 'react-icons/fa';
import UmrahBookingForm from '../SildeComponents/UmrahBookingForm';

// --- Page Data ---
// Sample package data. You can easily update this.
const umrahPackages = [
  {
    title: "5-Star Deluxe Package",
    duration: "10 Days (5 Makkah / 5 Madina)",
    hotels: "Movenpick Hajar (Makkah), Pullman ZamZam (Madina)",
    features: [
      "Closest 5-Star Hotels (Clock Tower)",
      "Direct Flights (Saudi/Emirates)",
      "Private Luxury Transport (Car)",
      "Guided Ziyarat"
    ],
    isRecommended: true
  },
  {
    title: "4-Star Premium Package",
    duration: "12 Days (6 Makkah / 6 Madina)",
    hotels: "Swissotel Al Maqam (Makkah), Anjum Hotel (Madina)",
    features: [
      "Premium 4-Star Hotels (Short Walk)",
      "Direct Flights",
      "Private Transport (Car)",
      "Guided Ziyarat"
    ],
    isRecommended: false
  },
  {
    title: "3-Star Economy Package",
    duration: "14 Days (7 Makkah / 7 Madina)",
    hotels: "3-Star Hotels (with Shuttle Service)",
    features: [
      "Clean, Approved Hotels",
      "Indirect Flights (Best Value)",
      "Group Transport (Bus)",
      "Guided Ziyarat"
    ],
    isRecommended: false
  }
];

const hajjPackage = {
  title: "Hajj 2026 Packages",
  description: "Our Hajj packages are in high demand. We provide complete services including accommodation near Haram, food, transport, and guided support throughout your journey. Pre-registration is now open."
};

// --- FAQs ---
const faqs = [
  {
    q: "What is included in a typical Umrah package?",
    a: "Our packages are all-inclusive. They cover your Umrah Visa, return flights, accommodation in Makkah and Madina, and complete transport (Airport-Hotel-Ziyarat)."
  },
  {
    q: "How do I get an Umrah visa?",
    a: "We process the Umrah E-Visa for you. It's a simple online process, and we just require your passport copy and a photograph. It's included in all our packages."
  },
  {
    q: "When is the best time to perform Umrah?",
    a: "The Umrah season is open most of the year, except for the Hajj period. The most pleasant weather is from November to February. Ramadan is also a very popular and blessed time to go."
  }
];

// --- Reviews ---
const reviews = [
  {
    name: "The Ahmed Family",
    quote: "Alhamdulillah, our Umrah was perfect. O.S. Travel & Tours handled everything. The hotels were exactly as promised, and the transport was always on time. Highly recommend.",
    rating: 5
  },
  {
    name: "Sobia M.",
    quote: "I booked a 5-star package. O.S. Travel provided excellent service. They are the best Umrah agents in Islamabad. My journey was smooth and stress-free.",
    rating: 5
  },
  {
    name: "Tariq J.",
    quote: "I used their economy package. Great value for money. The hotels were clean and the shuttle service was very reliable. Will definitely book with them again.",
    rating: 5
  }
];

// --- Animation Variants ---
const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

const sectionVariant = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeInOut",
      staggerChildren: 0.1,
    },
  },
};

const gridContainerVariant = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const gridItemVariant = {
  hidden: { opacity: 0, scale: 0.8, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0 },
};

// --- Main Component ---
function HajandUmmrah() {
  useEffect(() => {
    document.title = "Customize Hajj & Umrah Services - O.S Travel & Tours"; // Dynamically sets title
  }, []);
  return (
    <div className="w-full bg-white overflow-x-hidden">
      {/* 1. Hero Section */}
      <motion.div
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        className="relative w-full h-[450px]"
      >
        <img
          src="https://invent.trips.pk/Images/cmsThumbnails/umrah-packages.jpg" // Image of Kaaba
          alt="Kaaba in Makkah during evening"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-blue-500/60" />
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-4xl md:text-6xl font-extrabold text-white mb-4"
          >
            Hajj & Umrah Services
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-xl md:text-2xl text-white opacity-90 max-w-3xl"
          >
            Your trusted and authorized partner for a blessed and seamless
            spiritual journey from Pakistan.
          </motion.p>
        </div>
      </motion.div>

      {/* 2. Main Content Area */}
      <div className="max-w-7xl mx-auto px-6">

        {/* --- Packages & Booking Form Layout --- */}
        <section className="py-16 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left Column: Packages (Takes 2/3 width on large screens) */}
            <div className="lg:col-span-2">
              <div className="mb-8">
                <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
                  Our Umrah Packages
                </h2>
                <p className="text-lg text-gray-600">
                  We offer a variety of Umrah packages from Pakistan, designed to fit your budget.
                </p>
              </div>
              <motion.div
                variants={gridContainerVariant}
                className="grid grid-cols-1 gap-8"
              >
                {umrahPackages.map((pkg, index) => (
                  <PackageCard key={index} pkg={pkg} />
                ))}
              </motion.div>
            </div>

            {/* Right Column: Sticky Booking Form (Takes 1/3 width) */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <UmrahBookingForm />
              </div>
            </div>

          </div>
        </section>

        {/* --- Hajj Packages Section --- */}
        <motion.section
          variants={sectionVariant}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="py-16 md:py-20 bg-gray-50 -mx-6 px-6" // Alternating background
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-center items-center gap-4 mb-4">
              <div className="text-4xl text-blue-600"><FaKaaba /></div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
                Hajj 2026 Packages
              </h2>
            </div>
            <p className="text-center text-lg text-gray-600 max-w-3xl mx-auto mb-8">
              {hajjPackage.description}
            </p>
            <motion.div
              variants={gridItemVariant}
              className="text-center"
            >
              <Link
                to="/contact"
                className="inline-block bg-blue-600 text-white font-bold text-lg rounded-lg px-10 py-3 transition-colors duration-300 hover:bg-blue-700 shadow-lg"
              >
                Pre-Register for Hajj
              </Link>
            </motion.div>
          </div>
        </motion.section>

        {/* --- Services Included Section --- */}
        <motion.section
          variants={sectionVariant}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="py-16 md:py-20"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              Our Services Include
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We take care of every detail of your journey.
            </p>
          </div>
          <motion.div
            variants={gridContainerVariant}
            className="grid grid-cols-1 md:grid-cols-4 gap-8"
          >
            <ServiceCard
              icon={<FaFileContract />}
              title="Umrah Visa Processing"
              desc="Fast and reliable E-Visa processing included in all packages."
            />
            <ServiceCard
              icon={<FaPlane />}
              title="Return Air Tickets"
              desc="We book the best direct and indirect flights for your journey."
            />
            <ServiceCard
              icon={<FaHotel />}
              title="Hotel Accommodation"
              desc="Handpicked 3, 4, and 5-Star hotels close to Haram in Makkah & Madina."
            />
            <ServiceCard
              icon={<FaBus />}
              title="Transport & Ziyarat"
              desc="Complete transport from airport to hotels and guided Ziyarat tours."
            />
          </motion.div>
        </motion.section>

        {/* 5. FAQ Section (The "Dropbox") */}
        <motion.section
          variants={sectionVariant}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="py-16 md:py-20 bg-gray-50 -mx-6 px-6" // Alternating background
        >
          <div className="max-w-4xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Frequently Asked Questions
              </h2>
            </div>
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} q={faq.q} a={faq.a} />
              ))}
            </div>
          </div>
        </motion.section>

        {/* 6. Review Section */}
        <motion.section
          variants={sectionVariant}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="py-16 md:py-20 bg-white -mx-6 px-6" // Alternating background
        >
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">
              What Our Pilgrims Say
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {reviews.map((review, index) => (
                <ReviewCard key={index} review={review} />
              ))}
            </div>
          </div>
        </motion.section>

      </div>
    </div>
  );
}

// --- Reusable Sub-components ---

/**
 * A card component to display details for a single Umrah package.
 */
const PackageCard = ({ pkg }) => (
  <motion.div
    variants={gridItemVariant}
    className={`bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col border transition-all duration-300 hover:shadow-2xl hover:-translate-y-2
      ${pkg.isRecommended ? "border-blue-500 ring-2 ring-blue-500/20" : "border-transparent"}`}
  >
    <div className={`p-6 ${pkg.isRecommended ? "bg-blue-50" : "bg-white"}`}>
      {pkg.isRecommended && (
        <span className="inline-block bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase shadow-sm">
          Recommended
        </span>
      )}
      <h3 className="text-2xl font-extrabold text-gray-900 mb-1">{pkg.title}</h3>
      <div className="flex items-center text-blue-600 font-bold text-lg mb-4">
        <FaMoon className="mr-2" /> {pkg.duration}
      </div>

      <div className="flex items-start gap-3 mt-4 text-sm text-gray-600 bg-white p-3 rounded-lg border border-gray-100">
        <FaHotel className="text-blue-500 text-lg mt-1" />
        <div>
          <span className="font-bold block text-gray-800">Hotels:</span>
          {pkg.hotels}
        </div>
      </div>
    </div>

    <div className="px-6 pb-6 pt-4 grow border-t border-gray-100">
      <h4 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wide">Package Features:</h4>
      <ul className="space-y-3">
        {pkg.features.map((feature, i) => (
          <li key={i} className="flex items-center gap-3 text-sm">
            <FaCheckCircle className="text-green-500 shrink-0 text-lg" />
            <span className="text-gray-700 font-medium">{feature}</span>
          </li>
        ))}
      </ul>
    </div>

    <div className="p-6 bg-gray-50 mt-auto border-t border-gray-100">
      <a
        href={`https://wa.me/923325500377?text=${encodeURIComponent(`Assalamu Alaikum, I am interested in the ${pkg.title} package (${pkg.duration}). Please share more details.`)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3.5 px-6 
                   rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-95"
      >
        <FaPlane className="text-lg" />
        View Details & Contact
      </a>
    </div>
  </motion.div>
);

/**
 * A reusable card for client reviews.
 */
const ReviewCard = ({ review }) => (
  <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col border-t-4 border-blue-500">
    <FaQuoteLeft className="text-3xl text-blue-500 mb-4" />
    <p className="text-gray-600 italic mb-6 grow">"{review.quote}"</p>
    <div className="flex items-center justify-between">
      <span className="text-lg font-semibold text-gray-800">{review.name}</span>
      <div className="flex">
        {[...Array(review.rating)].map((_, i) => (
          <FaStar key={i} className="text-yellow-400" />
        ))}
      </div>
    </div>
  </div>
);

/**
 * A reusable card for included services.
 */
const ServiceCard = ({ icon, title, desc }) => (
  <motion.div
    variants={gridItemVariant}
    className="bg-white p-6 rounded-lg shadow-lg text-center"
  >
    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <div className="text-3xl text-blue-600">{icon}</div>
    </div>
    <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
    <p className="text-gray-600">{desc}</p>
  </motion.div>
);

/**
 * An animated Accordion item for the FAQ section.
 */
const AccordionItem = ({ q, a }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full p-6 text-left"
      >
        <span className="text-lg font-semibold text-gray-800">{q}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-gray-500"
        >
          <FaChevronDown className="shrink-0" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1, paddingTop: '0px', paddingBottom: '24px' }}
            exit={{ height: 0, opacity: 0, paddingTop: '0px', paddingBottom: '0px' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="text-gray-600 px-6">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HajandUmmrah;