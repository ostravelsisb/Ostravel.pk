import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Icons (from react-icons) ---
import {
  FaPassport, FaMoneyBillWave, FaClock, FaCalendarAlt, FaFileAlt,
  FaBuilding, FaEnvelope, FaPhone, FaCheckCircle, FaExclamationTriangle,
  FaChevronDown, FaStar, FaQuoteLeft, FaPlane, FaHotel, FaUmbrellaBeach,
  FaLaptopCode // Icon for E-Visa
} from 'react-icons/fa';

// --- Page Data ---

const eVisa = {
  title: "E-Visa / ETA",
  subtitle: "Online Electronic Travel Authorization",
  totalFee: "PKR 14,000", // Updated Fee
  processingTime: "07 to 15 Days",
  validity: "30 Days (from arrival)",
  stay: "30 Days",
  category: "Tourist / Business",
  documents: [
    "Passport Scanned Copy (valid 6+ months)",
    "Scanned Photo (white background)",
    "CNIC Photo Copy"
  ],
  note: "This is the official online visa. O.S. Travel & Tours processes this for you. Fees are non-refundable.",
  isSticker: false
};

const highCommissionInfo = {
  title: "High Commission of Sri Lanka",
  address: "House No.24, Street No.89, G 6/3, Islamabad, Pakistan",
  phone: "0092 – 51- 2828723",
  email: "slhc.islamabad@mfa.gov.lk",
  website: "www.slhcpakistan.org",
  note: "Visas are processed online (ETA). The High Commission handles specific consular matters."
};

// --- Sri Lanka-Specific FAQs ---
const faqs = [
  {
    q: "What is the Sri Lanka ETA?",
    a: "The ETA (Electronic Travel Authorization) is the official online visa system for Sri Lanka. It is the only method we currently process as it is the fastest and simplest way to get a visa."
  },
  {
    q: "Can I get a visa on arrival?",
    a: "While visa on arrival exists for some nations, it is highly recommended for Pakistani citizens to obtain the ETA (e-visa) *before* traveling to avoid hassles or denial at the airport."
  },
  {
    q: "How long does the Sri Lanka ETA take?",
    a: "The processing time for the ETA is listed as 07 to 15 days. It is best to apply at least two weeks before your intended travel date."
  }
];

// --- Sri Lanka-Specific Reviews ---
const reviews = [
  {
    name: "Fariha K.",
    quote: "My trip to Colombo and Kandy was amazing. O.S. Travel got my Sri Lanka ETA in about a week. The process was so easy, just sent my documents on WhatsApp.",
    rating: 5
  },
  {
    name: "Bilal M.",
    quote: "I used O.S. Travel for my honeymoon package to Sri Lanka. They handled the E-Visas, flights, and all the hotel bookings. We had a wonderful and stress-free time.",
    rating: 5
  },
  {
    name: "Rizwan Traders",
    quote: "I needed a quick business entry. O.S. Travel processed my ETA efficiently. Good service and affordable rates.",
    rating: 5
  }
];

// --- Framer Motion Variants ---
const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

// --- Main Component ---
function Srilanka() {
  return (
    <motion.div
      className="container mx-auto p-4 md:p-10 bg-gray-50 min-h-screen"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      {/* 1. Page Header */}
      <motion.div variants={itemVariants} className="flex items-center gap-4 mb-8">
        <img
          src="https://flagcdn.com/w160/lk.png" // Sri Lanka flag
          alt="Flag of Sri Lanka"
          className="w-16 h-10 object-cover rounded shadow-md"
        />
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800">
            Sri Lanka Visa
          </h1>
          <p className="text-xl text-gray-600">
            E-Visa (ETA) Processing for Pakistani Citizens
          </p>
        </div>
      </motion.div>

      {/* 2. Visa Comparison Grid - Single Column now */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1"
      >
        <VisaCard visa={eVisa} />
      </motion.div>

      {/* 3. High Commission Information */}
      <motion.div
        variants={itemVariants}
        className="mt-12 bg-white p-6 md:p-8 rounded-lg shadow-lg"
      >
        <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <FaBuilding className="text-yellow-600" />
          {highCommissionInfo.title}
        </h2>
        <ul className="space-y-4 text-gray-700 text-lg">
          <li className="flex items-start gap-4">
            <FaBuilding className="text-gray-500 mt-1.5 shrink-0" />
            <span><strong>Address:</strong> {highCommissionInfo.address}</span>
          </li>
          <li className="flex items-start gap-4">
            <FaPhone className="text-gray-500 mt-1.5 shrink-0" />
            <span><strong>Phone:</strong> <a href={`tel:${highCommissionInfo.phone}`} className="text-blue-600 hover:underline">{highCommissionInfo.phone}</a></span>
          </li>
          <li className="flex items-start gap-4">
            <FaEnvelope className="text-gray-500 mt-1.5 shrink-0" />
            <span><strong>Email:</strong> <a href={`mailto:${highCommissionInfo.email}`} className="text-blue-600 hover:underline">{highCommissionInfo.email}</a></span>
          </li>
        </ul>
        <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800">
          <div className="flex items-center gap-3">
            <FaExclamationTriangle className="text-xl shrink-0" />
            <p className="font-semibold">{highCommissionInfo.note}</p>
          </div>
        </div>
      </motion.div>

      {/* 4. About O.S. Travel Section */}
      <motion.div
        variants={itemVariants}
        className="mt-12 bg-white p-6 md:p-8 rounded-lg shadow-lg"
      >
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Why Book with <span className="text-blue-600">O.S. Travel & Tours</span>?
        </h2>
        <p className="text-lg text-gray-600 text-center mb-8 max-w-3xl mx-auto">
          As one of the "best and finest" travel agencies for Sri Lanka, we make your visa process smooth and stress-free.
          <strong className="text-gray-800"> We deal in complete E-Visa/ETA processing</strong> for your perfect island getaway.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ServiceCard
            icon={<FaLaptopCode className="text-blue-500" />}
            title="ETA/E-Visa Processing"
            desc="Fast and reliable processing for the Sri Lanka ETA. Just send us your scanned documents."
          />
          <ServiceCard
            icon={<FaPlane className="text-green-500" />}
            title="Air Ticketing"
            desc="Get the best fares on SriLankan Airlines and other carriers to Colombo (CMB)."
          />
          <ServiceCard
            icon={<FaHotel className="text-purple-500" />}
            title="Hotel Bookings"
            desc="From beach resorts in Bentota to tea plantation hotels in Nuwara Eliya, we book it all."
          />
          <ServiceCard
            icon={<FaUmbrellaBeach className="text-yellow-500" />}
            title="Holiday Packages"
            desc="We create complete, customized holiday and honeymoon packages to explore Sri Lanka."
          />
        </div>
      </motion.div>

      {/* 5. FAQ Section (The "Dropbox") */}
      <motion.div
        variants={itemVariants}
        className="mt-12 bg-white rounded-lg shadow-lg overflow-hidden"
      >
        <h2 className="text-3xl font-bold text-gray-800 p-6 md:p-8">
          Frequently Asked Questions
        </h2>
        <div className="border-t border-gray-200">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} q={faq.q} a={faq.a} />
          ))}
        </div>
      </motion.div>

      {/* 6. Review Section */}
      <motion.div
        variants={itemVariants}
        className="mt-12"
      >
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          What Our Clients Say
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((review, index) => (
            <ReviewCard key={index} review={review} />
          ))}
        </div>
      </motion.div>

      {/* Footer Note */}
      <motion.div variants={itemVariants} className="text-center mt-10 text-sm text-gray-500">
        <p>All fees and processing times are from O.S. Travel & Tours and are subject to change.</p>
      </motion.div>

    </motion.div>
  );
}

// --- Reusable Sub-components ---

/**
 * A card component to display details for a single visa type.
 */
const VisaCard = ({ visa }) => {
  // E-Visa Theme
  const borderColor = "border-green-500";
  const textColor = "text-green-500";
  const icon = <FaLaptopCode />;

  return (
    <div className={`bg-white rounded-lg shadow-xl overflow-hidden border-t-8 ${borderColor} flex flex-col`}>
      <div className="p-6 md:p-8 flex flex-col grow"> {/* Use grow */}
        
        {/* Card Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`text-4xl ${textColor}`}>{icon}</div>
          <div>
            <h2 className="text-3xl font-bold text-gray-800">{visa.title}</h2>
            <p className="text-lg text-gray-500">{visa.subtitle}</p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-6 pt-4 border-t border-gray-100">
          <DetailItem icon={<FaMoneyBillWave className="text-green-600" />} label="Visa Fee" value={visa.totalFee} />
          <DetailItem icon={<FaClock className="text-red-600" />} label="Processing Time" value={visa.processingTime} />
          <DetailItem icon={<FaCalendarAlt className="text-blue-600" />} label="Validity" value={visa.validity} />
          <DetailItem icon={<FaCalendarAlt className="text-purple-600" />} label="Stay Duration" value={visa.stay} />
          <DetailItem icon={<FaPassport className="text-gray-600" />} label="Category" value={visa.category} />
        </div>

        {/* Documents List */}
        <h3 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FaFileAlt className="text-gray-600" />
          Documents Required
        </h3>
        <ul className="space-y-3 mb-6 grow">
          {visa.documents.map((doc, index) => (
            <li key={index} className="flex items-start gap-3 text-gray-700">
              <FaCheckCircle className="text-green-500 mt-1.5 shrink-0" />
              <span>{doc}</span>
            </li>
          ))}
        </ul>

        {/* Note */}
        <div className={`p-4 mt-auto bg-green-50 border-l-4 border-green-400 text-green-800`}>
            <div className="flex items-center gap-3">
              <FaCheckCircle className="text-xl shrink-0" />
              <p className="font-semibold">{visa.note}</p>
            </div>
        </div>

      </div>
    </div>
  );
};

/**
 * A small component for displaying an icon, label, and value.
 */
const DetailItem = ({ icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="text-2xl text-gray-600 mt-1 shrink-0">{icon}</div>
    <div>
      <p className="text-sm font-semibold text-gray-500">{label}</p>
      <p className="text-lg font-bold text-gray-800">{value}</p>
    </div>
  </div>
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

// --- Service Card Component ---
const ServiceCard = ({ icon, title, desc }) => (
  <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg text-center flex flex-col items-center">
    <div className="text-4xl mb-4">{icon}</div>
    <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
    <p className="text-gray-600">{desc}</p>
  </div>
);

// --- Review Card Component ---
const ReviewCard = ({ review }) => (
  <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col">
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

export default Srilanka;