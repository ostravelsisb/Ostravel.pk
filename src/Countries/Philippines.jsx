import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Icons (from react-icons) ---
// Make sure to install: npm install react-icons
import {
  FaPassport, FaMoneyBillWave, FaClock, FaCalendarAlt, FaFileAlt,
  FaBuilding, FaEnvelope, FaPhone, FaCheckCircle, FaExclamationTriangle,
  FaChevronDown, FaStar, FaQuoteLeft, FaPlane, FaHotel, FaUmbrellaBeach
} from 'react-icons/fa';

// --- Page Data ---
// Data fetched directly from ostravels.com/schengen-visa-file-processing/philippine-visa/

const visaOptions = [
  {
    title: "Single Entry Visa",
    subtitle: "From the Embassy",
    totalFee: "Rs. 12,000",
    processingTime: "7-10 Working Days (Approx.)",
    validity: "3 Months",
    stay: "Up to 59 Days",
    category: "Single Entry",
    isSticker: true
  },
  {
    title: "Multiple Entry Visa",
    subtitle: "From the Embassy",
    totalFee: "Rs. 24,000",
    processingTime: "7-10 Working Days (Approx.)",
    validity: "6 Months",
    stay: "Up to 59 Days (per entry)",
    category: "Multiple Entry",
    isSticker: true
  },
  {
    title: "Multiple Entry Visa",
    subtitle: "From the Embassy",
    totalFee: "Rs. 36,600",
    processingTime: "7-10 Working Days (Approx.)",
    validity: "1 Year",
    stay: "Up to 59 Days (per entry)",
    category: "Multiple Entry",
    isSticker: true
  }
];

const requiredDocuments = [
  "Passport valid for at least 6 months",
  "Original bank statement (attested by MOFA)",
  "2 passport-size photographs",
  "Original Police Character Certificate (attested by MOFA)",
  "Return air ticket booking",
  "Hotel booking / Itinerary",
  "Business Letter Head (or Employment Certificate)",
  "NTN (National Tax Number)",
  "Online visa application"
];

const embassyInfo = {
  title: "Embassy of the Philippines in Pakistan",
  address: "Zhou-Enlai Avenue, Plot Nos. 3, 4 and 5, Diplomatic Enclave, Sector G-5, Islamabad",
  phone: "051 8487513",
  email: "islamabad.pe@dfa.gov.ph, isdpe@isbcomsats.net.pk"
};

// --- Philippines-Specific FAQs ---
const faqs = [
  {
    q: "Can I get a Philippines e-visa?",
    a: "No. The O.S. Travel & Tours website explicitly states, 'Philippine E-visa is not available for Pakistani national.' You must apply for a sticker visa."
  },
  {
    q: "Is the Police Character Certificate mandatory?",
    a: "Yes, this is a key requirement. You must provide an original copy of your Police Character Certificate, and it must be attested by the Ministry of Foreign Affairs (MOFA)."
  },
  {
    q: "Is my bank statement required to be attested?",
    a: "Yes, the official list of documents specifies an 'Original bank statement attested by the Ministry of Foreign Affairs'."
  },
  {
    q: "Are the visa fees refundable if my application is rejected?",
    a: "No, the visa fee and all service charges are non-refundable, regardless of the application's outcome."
  }
];

// --- Philippines-Specific Reviews ---
const reviews = [
  {
    name: "Aamir S.",
    quote: "My trip to Manila and Boracay was fantastic. O.S. Travel & Tours handled my visa application perfectly. They were very clear about the MOFA attestation for my documents, which was a huge help.",
    rating: 5
  },
  {
    name: "Nida T.",
    quote: "Very professional service for my Philippines visa. The process took about 8 working days, just as they said. I will use their service again.",
    rating: 5
  },
  {
    name: "Javaid R.",
    quote: "I was planning a trip to Southeast Asia and O.S. Travel managed my visas for Thailand, Vietnam, and the Philippines. Everything was smooth.",
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
function Philippines() {
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
          src="https://flagcdn.com/w160/ph.png" // Philippines flag
          alt="Flag of Philippines"
          className="w-16 h-10 object-cover rounded shadow-md"
        />
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800">
            Philippines Visa
          </h1>
          <p className="text-xl text-gray-600">
            Visa Requirements for Pakistani Citizens
          </p>
        </div>
      </motion.div>

      {/* 2. Visa Comparison Grid */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        {visaOptions.map((visa, index) => (
          <VisaCard key={index} visa={visa} />
        ))}
      </motion.div>
      
      {/* 3. Required Documents Section */}
      <motion.div
        variants={itemVariants}
        className="mt-12 bg-white p-6 md:p-8 rounded-lg shadow-lg"
      >
        <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <FaFileAlt className="text-gray-600" />
          Required Documents for All Visa Types
        </h2>
        <ul className="space-y-3 mb-6 grid grid-cols-1 md:grid-cols-2 gap-x-6">
          {requiredDocuments.map((doc, index) => (
            <li key={index} className="flex items-start gap-3 text-gray-700">
              <FaCheckCircle className="text-green-500 mt-1.5 shrink-0" />
              <span>{doc}</span>
            </li>
          ))}
        </ul>
        <div className={`p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800`}>
          <div className="flex items-center gap-3">
            <FaExclamationTriangle className="text-xl shrink-0" />
            <p className="font-semibold">Note: In Case Of Visa Refuse / Rejection Fee and Services Charges Will Not Be Refundable.</p>
          </div>
        </div>
      </motion.div>

      {/* 4. Embassy Information */}
      <motion.div
        variants={itemVariants}
        className="mt-12 bg-white p-6 md:p-8 rounded-lg shadow-lg"
      >
        <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <FaBuilding className="text-blue-700" />
          {embassyInfo.title}
        </h2>
        <ul className="space-y-4 text-gray-700 text-lg">
          <li className="flex items-start gap-4">
            <FaBuilding className="text-gray-500 mt-1.5 shrink-0" />
            <span><strong>Address:</strong> {embassyInfo.address}</span>
          </li>
          <li className="flex items-start gap-4">
            <FaPhone className="text-gray-500 mt-1.5 shrink-0" />
            <span><strong>Phone:</strong> <a href={`tel:${embassyInfo.phone.split(' / ')[0]}`} className="text-blue-600 hover:underline">{embassyInfo.phone}</a></span>
          </li>
          <li className="flex items-start gap-4">
            <FaEnvelope className="text-gray-500 mt-1.5 shrink-0" />
            <span><strong>Email:</strong> <a href={`mailto:${embassyInfo.email.split(',')[0]}`} className="text-blue-600 hover:underline">{embassyInfo.email.split(',')[0]}</a></span>
          </li>
        </ul>
      </motion.div>

      {/* 5. About O.S. Travel Section */}
      <motion.div
        variants={itemVariants}
        className="mt-12 bg-white p-6 md:p-8 rounded-lg shadow-lg"
      >
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Why Book with <span className="text-blue-600">O.S. Travel & Tours</span>?
        </h2>
        <p className="text-lg text-gray-600 text-center mb-8 max-w-3xl mx-auto">
          We are a leading travel agency in Islamabad, Pakistan, dedicated to ensuring your travel experience is seamless, comfortable, and memorable. 
          <strong className="text-gray-800">We deal in a wide range of services</strong> for your trip to the Philippines.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ServiceCard
            icon={<FaPassport className="text-blue-500" />}
            title="Visa Processing"
            desc="Expert guidance on all required documents, including MOFA attestations."
          />
          <ServiceCard
            icon={<FaPlane className="text-green-500" />}
            title="Air Ticketing"
            desc="Competitive pricing on all flights to Manila, Cebu, and other islands."
          />
          <ServiceCard
            icon={<FaHotel className="text-purple-500" />}
            title="Hotel Bookings"
            desc="From city hotels in Manila to beach resorts in Boracay and Palawan, we book it all."
          />
          <ServiceCard
            icon={<FaUmbrellaBeach className="text-yellow-500" />}
            title="Tour Packages"
            desc="We create customized holiday packages to explore the beautiful islands of the Philippines."
          />
        </div>
      </motion.div>

      {/* 6. FAQ Section (The "Dropbox") */}
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

      {/* 7. Review Section */}
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
  return (
    <div className={`bg-white rounded-lg shadow-xl overflow-hidden border-t-8 border-blue-500`}>
      <div className="p-6 md:p-8">
        
        {/* Card Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`text-4xl text-blue-500`}><FaPassport /></div>
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

export default Philippines;