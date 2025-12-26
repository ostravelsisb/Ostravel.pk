import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Icons (from react-icons) ---
// Make sure to install: npm install react-icons
import {
  FaPassport, FaMoneyBillWave, FaClock, FaCalendarAlt, FaFileAlt,
  FaBuilding, FaEnvelope, FaPhone, FaCheckCircle, FaExclamationTriangle,
  FaLaptopCode, FaChevronDown,
  // --- ADDED ICONS ---
  FaStar, FaQuoteLeft, FaPlane, FaHotel, FaUmbrellaBeach
} from 'react-icons/fa';

// --- Page Data ---
// Data fetched from ostravels.com/visa/indonesia-visa/

const eVisa = {
  title: "E-Visa (Tourist)",
  subtitle: "Online Application",
  totalFee: "PKR 35,000",
  processingTime: "7-10 Working Days",
  validity: "3 Months",
  stay: "30 Days",
  category: "Single Entry",
  documents: [
    "Scanned Passport copy (valid 6+ months)",
    "Scanned CNIC copy",
    "Recent photo (white background)",
    "Last 6-month bank statement (Min. PKR 1,000,000)",
    "Confirmed return air ticket",
    "Confirmed hotel booking"
  ],
  note: "This is the most common option for tourism. All documents are submitted as scans."
};

const stickerVisa = {
  title: "Sticker Visa (Social/Business)",  
  subtitle: "From the Embassy",
  totalFee: "PKR 28,000",
  processingTime: "15-20 Working Days",
  validity: "Varies",
  stay: "Varies",
  category: "Single Entry",
  documents: [
    "Original Passport (valid 6+ months)",
    "Passport-size photos (white background)",
    "CNIC copy",
    "Invitation Letter (for Business/Social)",
    "Last 6-month bank statement",
    "Bank account maintenance letter",
    "Visa request letter",
    "Return air ticket"
  ],
  note: "This visa typically requires an invitation from an Indonesian sponsor."
};

const embassyInfo = {
  title: "Embassy of Indonesia in Pakistan",
  address: "Diplomatic Enclave, Sector G-5/4, Islamabad, Pakistan",
  phone: "(051) 2832017",
  email: "islamabad.kbri@kemlu.go.id"
};

const faqs = [
  {
    q: "Are the visa fees refundable if my application is rejected?",
    a: "No, the visa fee and any service charges are non-refundable, regardless of the application's outcome."
  },
  {
    q: "Do I need to submit my original passport for the E-Visa?",
    a: "No, the E-Visa process only requires clear scanned copies of your documents. You keep your original passport."
  },
  {
    q: "What is the minimum bank balance required?",
    a: "For the tourist E-Visa, a minimum closing balance of PKR 1,000,000 (10 Lac) is generally required."
  },
  {
    q: "Can I get a visa on arrival?",
    a: "No, Pakistani passport holders are not eligible for a visa on arrival in Indonesia and must secure an E-Visa or Sticker Visa before traveling."
  }
];

// --- NEW: Indonesia-Specific Reviews ---
const reviews = [
  {
    name: "Ayesha K.",
    quote: "Got my Bali (Indonesia) e-visa through O.S. Travel. They were very clear about the 10 Lac bank statement requirement, which helped me prepare. Visa arrived in 8 days!",
    rating: 5
  },
  {
    name: "Omer & Family",
    quote: "We used O.S. Travel for our family trip to Jakarta. They handled all our e-visas, flights, and hotels. It was a completely stress-free experience.",
    rating: 5
  },
  {
    name: "Kashif B.",
    quote: "Applied for a business sticker visa. O.S. Travel helped me coordinate with my sponsor for the invitation letter. Professional service.",
    rating: 4
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
function Indonesia() {
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
          src="https://flagcdn.com/w160/id.png" // Indonesia flag
          alt="Flag of Indonesia"
          className="w-16 h-10 object-cover rounded shadow-md"
        />
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800">
            Indonesia Visa
          </h1>
          <p className="text-xl text-gray-600">
            Visa Requirements for Pakistani Citizens
          </p>
        </div>
      </motion.div>

      {/* 2. Visa Comparison Grid */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        <VisaCard visa={eVisa} isSticker={false} />
        <VisaCard visa={stickerVisa} isSticker={true} />
      </motion.div>

      {/* 3. Embassy Information */}
      <motion.div
        variants={itemVariants}
        className="mt-12 bg-white p-6 md:p-8 rounded-lg shadow-lg"
      >
        <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <FaBuilding className="text-red-700" />
          {embassyInfo.title}
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

      {/* --- NEW: About O.S. Travel Section --- */}
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
            icon={<FaPassport className="text-blue-500" />}
            title="Visa Services"
            desc="Expert assistance for E-Visas, Sticker Visas, and complex file preparation."
          />
          <ServiceCard
            icon={<FaPlane className="text-green-500" />}
            title="Air Ticketing"
            desc="Competitive pricing on all domestic and international flight bookings."
          />
          <ServiceCard
            icon={<FaHotel className="text-purple-500" />}
            title="Hotel Bookings"
            desc="Access to a wide range of hotel reservations to fit your budget."
          />
          <ServiceCard
            icon={<FaUmbrellaBeach className="text-yellow-500" />}
            title="Tour Packages"
            desc="Customized holiday and spiritual (Umrah) packages for a perfect trip."
          />
        </div>
      </motion.div>
      {/* --- End: About O.S. Travel Section --- */}

      {/* 4. FAQ Section (The "Dropbox") */}
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

      {/* --- NEW: Review Section --- */}
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
      {/* --- End: Review Section --- */}

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
const VisaCard = ({ visa, isSticker }) => {
  const borderColor = isSticker ? "border-blue-500" : "border-green-500";
  const textColor = isSticker ? "text-blue-500" : "text-green-500";
  const icon = isSticker ? <FaPassport /> : <FaLaptopCode />;

  return (
    <div className={`bg-white rounded-lg shadow-xl overflow-hidden border-t-8 ${borderColor}`}>
      <div className="p-6 md:p-8">
        
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
        <ul className="space-y-3 mb-6">
          {visa.documents.map((doc, index) => (
            <li key={index} className="flex items-start gap-3 text-gray-700">
              <FaCheckCircle className="text-green-500 mt-1.5 shrink-0" />
              <span>{doc}</span>
            </li>
          ))}
        </ul>

        {/* Note */}
        {visa.note && (
          <div className={`p-4 ${isSticker ? 'bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800' : 'bg-green-50 border-l-4 border-green-400 text-green-800'}`}>
            <div className="flex items-center gap-3">
              {isSticker ? <FaExclamationTriangle className="text-xl shrink-0" /> : <FaCheckCircle className="text-xl shrink-0" />}
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

// --- NEW: Service Card Component ---
const ServiceCard = ({ icon, title, desc }) => (
  <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg text-center flex flex-col items-center">
    <div className="text-4xl mb-4">{icon}</div>
    <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
    <p className="text-gray-600">{desc}</p>
  </div>
);

// --- NEW: Review Card Component ---
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

export default Indonesia;