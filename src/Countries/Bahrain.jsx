import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Icons (from react-icons) ---
// Make sure to install: npm install react-icons
import {
  FaPassport, FaMoneyBillWave, FaClock, FaCalendarAlt, FaFileAlt,
  FaBuilding, FaEnvelope, FaPhone, FaCheckCircle, FaExclamationTriangle,
  FaLaptopCode, FaChevronDown, FaStar, FaQuoteLeft, FaPlane, FaHotel, FaUmbrellaBeach
} from 'react-icons/fa';

// --- Page Data ---
// NEW data based on your specific request

// Common documents for all e-visas
const commonDocuments = [
  "Scanned copy of Passport (valid 6+ months)",
  "Scanned copy of CNIC",
  "Recent passport-size photo scan (white background)",
  "Confirmed return air ticket",
  "Confirmed hotel booking in Bahrain",
  "Last 6-month bank statement (min. $1000 balance)"
];

const eVisa14 = {
  title: "Visit E-Visa (14 Days)",
  subtitle: "Online Application",
  totalFee: "PKR 22,000",
  processingTime: "3-7 Working Days",
  validity: "3 Months",
  stay: "14 Days",
  category: "Single Entry",
  documents: commonDocuments,
  note: "Ideal for short trips. Fees are non-refundable."
};

const eVisa30 = {
  title: "Visit E-Visa (1 Month)",
  subtitle: "Online Application",
  totalFee: "PKR 35,000",
  processingTime: "3-7 Working Days",
  validity: "3 Months",
  stay: "1 Month",
  category: "Multiple Entry",
  documents: commonDocuments,
  note: "For a standard holiday. Fees are non-refundable."
};

const eVisa1Year = {
  title: "Visit E-Visa (1 Year)",
  subtitle: "Online Application",
  totalFee: "PKR 55,000",
  processingTime: "3-7 Working Days",
  validity: "1 Year",
  stay: "3 Months per Visit",
  category: "Multiple Entry",
  documents: commonDocuments,
  note: "For frequent travelers. Fees are non-refundable."
};

const embassyInfo = {
  address: "House No 12, Street No 02, F-6/3, Islamabad, Pakistan",
  phone: "+92 51 230 7881",
  email: "islamabad.mission@mofa.gov.bh"
};

// --- UPDATED Bahrain-Specific Reviews ---
const reviews = [
  {
    name: "Ali Raza",
    quote: "O.S. Travel handled my Bahrain e-visa perfectly. I just sent my scans and got the visa in my email in 4 days. Very impressed.",
    rating: 5
  },
  {
    name: "Fatima B.",
    quote: "I was worried about the bank statement requirement, but the team at O.S. guided me through the whole process. My family trip was a success!",
    rating: 5
  },
  {
    name: "Zubair S.",
    quote: "Good service for my 1-month e-visa. It took about 5 days, just as they said. All documents were handled by email. Will use again.",
    rating: 4
  }
];

// --- UPDATED Bahrain-Specific FAQs ---
const faqs = [
  {
    q: "What is the difference between the 14-day, 1-month, and 1-year e-visas?",
    a: "They offer different lengths of stay and validity. The 14-day and 1-month visas are single entry, while the 1-year visa is multiple entry, allowing stays of up to 30 days per visit."
  },
  {
    q: "What is the minimum bank balance for the E-Visa?",
    a: "It is strongly recommended to have a closing bank statement balance equivalent to at least USD 1,000 to show sufficient funds for your trip."
  },
  {
    q: "Can I get a visa on arrival in Bahrain?",
    a: "No, Pakistani passport holders are not eligible for a visa on arrival and must secure an E-Visa *before* traveling to Bahrain."
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
function Bahrain() {
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
          src="https://flagcdn.com/w160/bh.png" // Bahrain flag
          alt="Flag of Bahrain"
          className="w-16 h-10 object-cover rounded shadow-md"
        />
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800">
            Bahrain Visa
          </h1>
          <p className="text-xl text-gray-600">
            E-Visa Requirements for Pakistani Citizens
          </p>
        </div>
      </motion.div>

      {/* 2. Visa Comparison Grid - UPDATED TO 3 COLS */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        <VisaCard visa={eVisa14} isSticker={false} />
        <VisaCard visa={eVisa30} isSticker={false} />
        <VisaCard visa={eVisa1Year} isSticker={true} /> {/* Use blue border for contrast */}
      </motion.div>

      {/* 3. Embassy Information */}
      <motion.div
        variants={itemVariants}
        className="mt-12 bg-white p-6 md:p-8 rounded-lg shadow-lg"
      >
        <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <FaBuilding className="text-red-700" />
          Embassy of Bahrain in Pakistan
        </h2>
        <ul className="space-y-4 text-gray-700 text-lg">
          <li className="flex items-start gap-4">
            <FaBuilding className="text-gray-500 mt-1.5 shrink-0" />
            <span><strong>Address:</strong> {embassyInfo.address}</span>
          </li>
          <li className="flex items-start gap-4">
            <FaPhone className="text-gray-500 mt-1.5 shrink-0" />
            <span><strong>Phone:</strong> <a href={`tel:${embassyInfo.phone}`} className="text-blue-600 hover:underline">{embassyInfo.phone}</a></span>
          </li>
          <li className="flex items-start gap-4">
            <FaEnvelope className="text-gray-500 mt-1.5 shrink-0" />
            <span><strong>Email:</strong> <a href={`mailto:${embassyInfo.email}`} className="text-blue-600 hover:underline">{embassyInfo.email}</a></span>
          </li>
        </ul>
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
          We are a leading travel agency in Islamabad, Pakistan, dedicated to ensuring your travel experience is seamless, comfortable, and memorable. 
          <strong className="text-gray-800">We deal in a wide range of services</strong> to handle all your travel needs.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ServiceCard
            icon={<FaLaptopCode className="text-blue-500" />}
            title="E-Visa Processing"
            desc="Expert, fast processing for all Bahrain e-visa types (14-day, 1-month, and 1-year)."
          />
          <ServiceCard
            icon={<FaPlane className="text-green-500" />}
            title="Air Ticketing"
            desc="Competitive pricing on Gulf Air, PIA, and all other airlines to Bahrain (BAH)."
          />
          <ServiceCard
            icon={<FaHotel className="text-purple-500" />}
            title="Hotel Bookings"
            desc="Access to a wide range of confirmed hotel bookings, a mandatory visa requirement."
          />
          <ServiceCard
            icon={<FaUmbrellaBeach className="text-yellow-500" />}
            title="Tour Packages"
            desc="Customized holiday and business travel packages to Manama and beyond."
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
        <p>Visa fees and requirements are subject to change. Please confirm all details with O.S. Travel & Tours before applying.</p>
      </motion.div>

    </motion.div>
  );
}


// --- Reusable Sub-components ---

/**
 * A card component to display details for a single visa type.
 */
const VisaCard = ({ visa, isSticker }) => {
  const borderColor = isSticker ? "border-blue-500" : "border-green-500";
  const textColor = isSticker ? "text-blue-500" : "text-green-500";
  const icon = isSticker ? <FaPassport /> : <FaLaptopCode />; // Use Laptop for E-Visa

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
        <ul className="space-y-3 mb-6 grow"> {/* Use grow */}
          {visa.documents.map((doc, index) => (
            <li key={index} className="flex items-start gap-3 text-gray-700">
              <FaCheckCircle className="text-green-500 mt-1.5 shrink-0" />
              <span>{doc}</span>
            </li>
          ))}
        </ul>

        {/* Non-refundable Note */}
        {visa.note && (
          <div className="p-4 mt-auto bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800">
            <div className="flex items-center gap-3">
              <FaExclamationTriangle className="text-xl" />
              <p className="font-semibold">{visa.note}</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

/**
 * A small component for displaying an icon, label, and value.
 */
const DetailItem = ({ icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="text-2xl text-gray-600 mt-1 shrink-0">{icon}</div> {/* Use shrink-0 */}
    <div>
      <p className="text-sm font-semibold text-gray-500">{label}</p>
      <p className="text-lg font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

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
    <p className="text-gray-600 italic mb-6 grow">"{review.quote}"</p> {/* Use grow */}
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

// --- Accordion Item Component ---
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
          <FaChevronDown className="shrink-0" /> {/* Use shrink-0 */}
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

export default Bahrain;