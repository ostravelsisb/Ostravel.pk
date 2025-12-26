import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Icons (from react-icons) ---
// Make sure to install: npm install react-icons
import {
  FaPassport, FaMoneyBillWave, FaClock, FaCalendarAlt, FaFileAlt,
  FaBuilding, FaEnvelope, FaPhone, FaCheckCircle, FaExclamationTriangle,
  FaChevronDown, FaStar, FaQuoteLeft, FaPlane, FaHotel, FaUmbrellaBeach,
  FaLaptopCode, // Icon for E-Visa
  FaBriefcase,
  FaCar // Icon for Business
} from 'react-icons/fa';

// --- Page Data ---
// Data synthesized from official Pakistan Online Visa portal (visa.nadra.gov.pk)

const touristVisa = {
  title: "Tourist E-Visa",
  subtitle: "Online Application Portal",
  totalFee: "Varies by Country (e.g., $60 USD)",
  processingTime: "7-10 Working Days",
  validity: "Up to 3 Months (or more)",
  stay: "30-90 Days (Extendable)",
  category: "Single or Multiple Entry",
  documents: [
    "Digital Passport Copy (valid 6+ months)",
    "Recent Digital Photo (white background)",
    "Letter of Invitation (LOI) from a registered Pakistani Tour Operator (like O.S. Travel & Tours)",
    "OR a confirmed hotel booking (LOI is strongly recommended for higher success rate)"
  ],
  note: "O.S. Travel & Tours is a licensed tour operator (DTS) and can provide the mandatory Letter of Invitation (LOI) for your visa application."
};

const businessVisa = {
  title: "Business E-Visa",
  subtitle: "Online Application Portal",
  totalFee: "Varies by Country",
  processingTime: "7-10 Working Days",
  validity: "Up to 5 Years",
  stay: "Varies",
  category: "Multiple Entry",
  documents: [
    "Digital Passport Copy (valid 6+ months)",
    "Recent Digital Photo (white background)",
    "Invitation Letter from a Pakistani business/organization",
    "Letter from your employer (outside Pakistan)",
    "Proof of registration of the Pakistani company (e.g., Chamber of Commerce certificate)"
  ],
  note: "We assist in ensuring all business documentation is correct for the E-Visa portal submission."
};

const visaPortalInfo = {
  title: "Official Pakistan Online Visa System",
  address: "visa.nadra.gov.pk",
  phone: "N/A (Online Portal)",
  email: "N/A",
  note: "All visa applications for Pakistan must be submitted through this official government portal. O.S. Travel & Tours provides expert assistance for this process."
};

// --- Pakistan-Specific FAQs ---
const faqs = [
  {
    q: "What is a Letter of Invitation (LOI) and do I need one?",
    a: "An LOI is an official document from a tour operator in Pakistan (like O.S. Travel & Tours) that invites you to the country. For most nationalities, providing an LOI is a mandatory requirement for the tourist visa and highly increases the chance of approval."
  },
  {
    q: "Can I get a visa on arrival (VOA)?",
    a: "Only citizens of a few specific countries are eligible for VOA (e.g., UAE, Saudi Arabia, Turkey). For most travelers (from Europe, USA, Canada, Australia, etc.), you *must* apply for the E-Visa *before* you travel."
  },
  {
    q: "Is Pakistan safe for international tourists?",
    a: "Yes, Pakistan is very safe for tourists, especially in the popular tourist areas of Hunza, Skardu, and Islamabad. O.S. Travel & Tours provides secure, private transport and experienced local guides to ensure your safety and comfort."
  }
];

// --- Pakistan-Specific Reviews (from foreigners) ---
const reviews = [
  {
    name: "Mark T. (from UK)",
    quote: "As a foreign tourist, I was nervous about visiting Pakistan. O.S. Travel handled my LOI for the e-visa, and provided an amazing guide and driver. I felt safe and saw the most beautiful mountains in the world.",
    rating: 5
  },
  {
    name: "Ana G. (from Spain)",
    quote: "O.S. Travel is the best! They helped me get my visa, and then arranged the most incredible 12-day tour of Hunza and Skardu. The hospitality in Pakistan is unbelievable. Thank you!",
    rating: 5
  },
  {
    name: "David & Sarah (from USA)",
    quote: "We used O.S. Travel for our Pakistan visa and tour. The LOI service was fast, and our guide was fantastic. We can't wait to come back and explore more.",
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
function Pakistan() {
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
          src="https://flagcdn.com/w160/pk.png" // Pakistan flag
          alt="Flag of Pakistan"
          className="w-16 h-10 object-cover rounded shadow-md"
        />
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800">
            Pakistan Visa
          </h1>
          <p className="text-xl text-gray-600">
            Visa Requirements for International Travelers
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

      {/* 3. Official Portal Information */}
      <motion.div
        variants={itemVariants}
        className="mt-12 bg-white p-6 md:p-8 rounded-lg shadow-lg"
      >
        <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <FaBuilding className="text-green-700" />
          {visaPortalInfo.title}
        </h2>
        <ul className="space-y-4 text-gray-700 text-lg">
          <li className="flex items-start gap-4">
            <FaLaptopCode className="text-gray-500 mt-1.5 shrink-0" />
            <span><strong>Portal URL:</strong> <a href="https://visa.nadra.gov.pk/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{visaPortalInfo.address}</a></span>
          </li>
        </ul>
        <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800">
          <div className="flex items-center gap-3">
            <FaExclamationTriangle className="text-xl shrink-0" />
            <p className="font-semibold">{visaPortalInfo.note}</p>
          </div>
        </div>
      </motion.div>

      {/* 4. About O.S. Travel Section (Inbound Tourism Focus) */}
      <motion.div
        variants={itemVariants}
        className="mt-12 bg-white p-6 md:p-8 rounded-lg shadow-lg"
      >
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Visit Pakistan with <span className="text-blue-600">O.S. Travel & Tours</span>
        </h2>
        <p className="text-lg text-gray-600 text-center mb-8 max-w-3xl mx-auto">
          As a <strong className="text-gray-800">DTS Licensed Tour Operator</strong>, we are your official partner for visiting Pakistan.
          We provide the mandatory <strong className="text-gray-800">Letter of Invitation (LOI)</strong> for your visa and plan your entire journey.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ServiceCard
            icon={<FaPassport className="text-blue-500" />}
            title="Visa & LOI Service"
            desc="We provide the official LOI and guide you through the online E-Visa application."
          />
          <ServiceCard
            icon={<FaUmbrellaBeach className="text-yellow-500" />}
            title="Custom Tours"
            desc="We design amazing, all-inclusive tours to Hunza, Skardu, Lahore, and more."
          />
          <ServiceCard
            icon={<FaCar className="text-purple-500" />}
            title="Secure Transport"
            desc="Safe, reliable, and comfortable private cars and Prados with expert local drivers."
          />
          <ServiceCard
            icon={<FaHotel className="text-green-500" />}
            title="Hotel Bookings"
            desc="We book the best hotels and resorts in all tourist destinations for your safety and comfort."
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
          What Our International Clients Say
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((review, index) => (
            <ReviewCard key={index} review={review} />
          ))}
        </div>
      </motion.div>

      {/* Footer Note */}
      <motion.div variants={itemVariants} className="text-center mt-10 text-sm text-gray-500">
        <p>Visa policies are subject to change by the Govt. of Pakistan. We provide expert guidance for the current process.</p>
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
  const icon = isBusiness ? <FaBriefcase /> : <FaLaptopCode />;

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
          <DetailItem icon={<FaMoneyBillWave className="text-green-600" />} label="Govt. Visa Fee" value={visa.totalFee} />
          <DetailItem icon={<FaClock className="text-red-600" />} label="Processing Time" value={visa.processingTime} />
          <DetailItem icon={<FaCalendarAlt className="text-blue-600" />} label="Validity" value={visa.validity} />
          <DetailItem icon={<FaCalendarAlt className="text-purple-600" />} label="Stay Duration" value={visa.stay} />
        </div>

        {/* Documents List */}
        <h3 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FaFileAlt className="text-gray-600" />
          Key Documents for E-Visa
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

export default Pakistan;