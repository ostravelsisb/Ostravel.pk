import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Icons (from react-icons) ---
// Make sure to install: npm install react-icons
import {
  FaPassport, FaMoneyBillWave, FaClock, FaCalendarAlt, FaFileAlt,
  FaBuilding, FaEnvelope, FaPhone, FaCheckCircle, FaExclamationTriangle,
  FaBriefcase, FaPlaneDeparture,
  // --- ADDED ICONS ---
  FaChevronDown, FaStar, FaQuoteLeft, FaPlane, FaHotel, FaUmbrellaBeach
} from 'react-icons/fa';

// --- Page Data ---
// Data synthesized from official embassy & VASC sources.

const touristVisa = {
  title: "Tourist Visa (L-Visa)",
  subtitle: "Online Form + In-Person Submission",
  totalFee: "PKR 13,200 (Regular Service Fee)",
  processingTime: "4-6 Working Days",
  validity: "Varies (Typically 3 Months)",
  stay: "Varies (Typically 30 Days)",
  category: "Single Entry",
  documents: [
    "Original Passport (valid 6+ months)",
    "Printed Online Application Form (filled on official portal)",
    "Appointment confirmation for VASC (Gerry's)",
    "2 Recent Photos (48x33mm, white background)",
    "Confirmed Round-trip air ticket",
    "Detailed Hotel Bookings",
    "Last 6-month bank statement",
    "Police Character Certificate (Attested by MOFA)"
  ],
  note: "Visa fee is PKR 0 for Pakistanis, but the VASC service fee is mandatory."
};

const businessVisa = {
  title: "Business Visa (M-Visa)",
  subtitle: "Online Form + In-Person Submission",
  totalFee: "PKR 13,200 (Regular Service Fee)",
  processingTime: "4-6 Working Days",
  validity: "Varies",
  stay: "Varies",
  category: "Single or Multiple Entry",
  documents: [
    "All documents required for Tourist Visa",
    "Official Invitation Letter (TE) from a Chinese company",
    "Supporting letter from your employer in Pakistan",
    "Company registration and last 3 years' tax returns"
  ],
  note: "Express service (PKR 19,800) may be available for faster processing."
};

const vascInfo = {
  title: "China Visa Application Service Center (Gerry's)",
  address: "Gerry's Building, Adjacent to Punjab Cash and Carry, Park Road, Chak Shahzad, Islamabad.",
  phone: "051-8439385",
  email: "islamabadcenterforchina@gerrys.com.pk",
  note: "This is the official center where you must submit your application and provide biometrics."
};

const embassyInfo = {
  title: "Embassy of China in Pakistan",
  address: "Diplomatic Enclave, Ramna 4, Islamabad, Pakistan",
  phone: "+92 51 8496167",
  email: "islamabad@csm.mfa.gov.cn"
};

// --- NEW: China-Specific Reviews ---
const reviews = [
  {
    name: "Hassan T.",
    quote: "O.S. Travel made the complex China visa process so simple. They handled the Gerry's appointment and all my documents. I got my business visa without any hassle.",
    rating: 5
  },
  {
    name: "Aisha I.",
    quote: "I was very confused about the 'TE' invitation letter. Obaid at O.S. Travel explained everything and my application was successful. 10/10 service.",
    rating: 5
  },
  {
    name: "Bilal Enterprises",
    quote: "We use O.S. Travel for all our employees' business visas to China. They are professional, fast, and always get the job done right. Highly recommended.",
    rating: 5
  }
];

// --- NEW: China-Specific FAQs ---
const faqs = [
  {
    q: "Do I have to go to Gerry's in person?",
    a: "Yes, all applicants must visit the Visa Application Service Center (VASC) in person to submit their application and provide biometric data (fingerprints)."
  },
  {
    q: "Is the China visa fee free for Pakistanis?",
    a: "Yes, the official *embassy visa fee* is waived for Pakistani passport holders. However, you *must* pay the mandatory *service fee* to the VASC (Gerry's), which is PKR 13,200 for regular service."
  },
  {
    q: "What is an Invitation Letter (TE)?",
    a: "A 'TE' is a government-issued invitation letter required for most Business (M) visas. It must be arranged by the inviting company in China through their local municipal government or foreign affairs office."
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
function China() {
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
          src="https://flagcdn.com/w160/cn.png" // China flag
          alt="Flag of China"
          className="w-16 h-10 object-cover rounded shadow-md"
        />
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800">
            China Visa
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
        <VisaCard visa={touristVisa} isBusiness={false} />
        <VisaCard visa={businessVisa} isBusiness={true} />
      </motion.div>

      {/* 3. VASC (Gerry's) Information */}
      <motion.div
        variants={itemVariants}
        className="mt-12 bg-white p-6 md:p-8 rounded-lg shadow-lg"
      >
        <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <FaBuilding className="text-red-600" />
          {vascInfo.title}
        </h2>
        <ul className="space-y-4 text-gray-700 text-lg">
          <li className="flex items-start gap-4">
            <FaBuilding className="text-gray-500 mt-1.5 shrink-0" />
            <span><strong>Address:</strong> {vascInfo.address}</span>
          </li>
          <li className="flex items-start gap-4">
            <FaPhone className="text-gray-500 mt-1.5 shrink-0" />
            <span><strong>Phone:</strong> <a href={`tel:${vascInfo.phone}`} className="text-blue-600 hover:underline">{vascInfo.phone}</a></span>
          </li>
          <li className="flex items-start gap-4">
            <FaEnvelope className="text-gray-500 mt-1.5 shrink-0" />
            <span><strong>Email:</strong> <a href={`mailto:${vascInfo.email}`} className="text-blue-600 hover:underline">{vascInfo.email}</a></span>
          </li>
        </ul>
        <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800">
          <div className="flex items-center gap-3">
            <FaExclamationTriangle className="text-xl shrink-0" />
            <p className="font-semibold">{vascInfo.note}</p>
          </div>
        </div>
      </motion.div>

      {/* 4. Embassy Information */}
      <motion.div
        variants={itemVariants}
        className="mt-8 bg-white p-6 md:p-8 rounded-lg shadow-lg"
      >
        <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <FaBuilding className="text-gray-700" />
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
      
      {/* --- NEW: FAQ Section (The "Dropbox") --- */}
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
      {/* --- End: FAQ Section --- */}

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
        <p>Agency file processing fees (like O.S. Travel & Tours) are separate from the mandatory VASC service fees listed above.</p>
      </motion.div>

    </motion.div>
  );
}

// --- Reusable Sub-components ---

/**
 * A card component to display details for a single visa type.
 */
const VisaCard = ({ visa, isBusiness }) => {
  const borderColor = isBusiness ? "border-blue-500" : "border-green-500";
  const textColor = isBusiness ? "text-blue-500" : "text-green-500";
  const icon = isBusiness ? <FaBriefcase /> : <FaPlaneDeparture />;

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
          <DetailItem icon={<FaMoneyBillWave className="text-green-600" />} label="VASC Service Fee" value={visa.totalFee} />
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
          <div className={`p-4 ${isBusiness ? 'bg-blue-50 border-l-4 border-blue-400 text-blue-800' : 'bg-green-50 border-l-4 border-green-400 text-green-800'}`}>
            <div className="flex items-center gap-3">
              <FaCheckCircle className="text-xl shrink-0" />
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

// --- NEW: Accordion Item Component ---
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

export default China;