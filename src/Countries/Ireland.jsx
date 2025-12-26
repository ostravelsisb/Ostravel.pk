import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Icons (from react-icons) ---
// Make sure to install: npm install react-icons
import {
  FaPassport, FaMoneyBillWave, FaClock, FaCalendarAlt, FaFileAlt,
  FaBuilding, FaEnvelope, FaPhone, FaCheckCircle, FaExclamationTriangle,
  FaChevronDown, FaStar, FaQuoteLeft, FaPlane, FaHotel, FaUmbrellaBeach,
  FaFileSignature, // Icon for File Processing
  FaCalendarCheck, // Icon for Appointment
  FaEuroSign // Icon for Euros
} from 'react-icons/fa';

// --- Page Data ---
// Data based on official Irish Immigration (AVATS) and VFS Global sources.

const processingService = {
  title: "Ireland Short Stay 'C' Visa",
  subtitle: "Complete File Processing Service",
  totalFee: "60 EUR + Service Charges", // Official fee for single entry
  processingTime: "Approx. 45 Days (After Appointment)",
  validity: "Up to 90 Days",
  stay: "Up to 90 Days",
  category: "Short Stay (C) Tourist/Visit",
  // This is the core service you offer
  serviceIncludes: [
    "Complete Visa File Preparation",
    "Online Application (AVATS) Form Filling",
    "Visa Appointment Scheduling at VFS Global",
    "Travel Insurance (Ireland Approved)",
    "Confirmed Flight Reservation",
    "Detailed Day-by-Day Itinerary",
    "Confirmed Hotel Bookings for Itinerary"
  ],
  // These are the documents the *client* must provide
  documents: [
    "Original Passport (valid 6+ months after departure date)",
    "Photocopy of all pages of *all* previous passports",
    "2 Recent Photos (Irish visa specs, white background)",
    "Last 6-month Bank Statement & Maintenance Letter",
    "CNIC Photo Copy (front & back)",
    "Family Registration Certificate (FRC)",
    "Income Tax Returns (last 2-3 years)",
    "Employment Letter / Business Documents",
    "Proof of strong ties to Pakistan (e.g., property, etc.)"
  ],
  note: "Embassy fee (60 EUR) and VFS Global fee are paid separately from our expert service charges. All fees are non-refundable."
};

const embassyInfo = {
  title: "Honorary Consulate of Ireland, Karachi",
  address: "House 91/1, 1st Lower Commercial St, Phase IV, DHA, Karachi",
  phone: "+92 21 358 911 81",
  email: "info@irishconpk.page",
  note: "For visa processing, all applications are submitted to VFS Global, not the consulate."
};

const vfsInfo = {
  title: "Ireland Visa Application Centre (VFS Global)",
  address: "Park Road, Chak Shahzad, (Opposite CDA Park), Islamabad",
  phone: "0900 07860 (VFS Helpline)",
  email: "N/A",
  note: "This is the official partner for submitting your application and biometrics."
};

// --- Ireland-Specific FAQs ---
const faqs = [
  {
    q: "Is Ireland part of the Schengen Area?",
    a: "No. Ireland is not a member of the Schengen Area. A Schengen visa is not valid for travel to Ireland. You must apply for a separate Irish visa."
  },
  {
    q: "Can I get an Ireland e-visa?",
    a: "No, Pakistani citizens cannot get an e-visa. You must complete the online application form (AVATS), then attend an in-person appointment at VFS Global to submit your documents and provide biometrics."
  },
  {
    q: "How long does the Ireland visa take?",
    a: "The processing time for a visit visa is approximately 45 days after your appointment at VFS. It is highly recommended to apply at least 3 months before your intended travel date."
  }
];

// --- Ireland-Specific Reviews ---
const reviews = [
  {
    name: "Taha M.",
    quote: "The Ireland visa process is very long and document-heavy. O.S. Travel was a huge help. They prepared my entire file, and I just had to go to VFS. Got my visa!",
    rating: 5
  },
  {
    name: "S. Khurram",
    quote: "Excellent, professional service. They know the Irish visa requirements perfectly, which are different from Schengen. Highly recommended.",
    rating: 5
  },
  {
    name: "The Awan Family",
    quote: "We used O.S. Travel for our family vacation to Dublin. They processed all our applications and appointments. The file was perfect, and the visa was approved. Thank you!",
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
function Ireland() {
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
          src="https://flagcdn.com/w160/ie.png" // Ireland flag
          alt="Flag of Ireland"
          className="w-16 h-10 object-cover rounded shadow-md"
        />
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800">
            Ireland Visa
          </h1>
          <p className="text-xl text-gray-600">
            Visa File Processing for Pakistani Citizens
          </p>
        </div>
      </motion.div>

      {/* 2. Visa Card Section (File Processing) */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1"
      >
        <FileProcessingCard visa={processingService} />
      </motion.div>

      {/* 3. Embassy & VFS Information */}
      <motion.div
        variants={itemVariants}
        className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8"
      >
        <EmbassyCard info={embassyInfo} />
        <EmbassyCard info={vfsInfo} />
      </motion.div>

      {/* 4. About O.S. Travel Section (Highlighting File Processing) */}
      <motion.div
        variants={itemVariants}
        className="mt-12 bg-white p-6 md:p-8 rounded-lg shadow-lg"
      >
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Why Choose O.S. Travel for Your <span className="text-blue-600">Ireland Visa</span>?
        </h2>
        <p className="text-lg text-gray-600 text-center mb-8 max-w-3xl mx-auto">
          The Irish visa is a complex process, separate from Schengen. As expert visa consultants in Islamabad,
          <strong className="text-gray-800"> we deal in complete visa file processing and appointment scheduling</strong> to ensure your application is accurate and has the best chance of success.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ServiceCard
            icon={<FaFileSignature className="text-blue-500" />}
            title="Expert File Processing"
            desc="We handle the AVATS online form and compile all complex supporting documents."
          />
          <ServiceCard
            icon={<FaCalendarCheck className="text-purple-500" />}
            title="VFS Appointment"
            desc="We secure the earliest possible visa appointment date for you at VFS Global."
          />
          <ServiceCard
            icon={<FaPlane className="text-green-500" />}
            title="Flight & Hotel Bookings"
            desc="We provide confirmed flight reservations and hotel bookings for your application."
          />
          <ServiceCard
            icon={<FaHotel className="text-yellow-500" />}
            title="Detailed Itinerary"
            desc="We create a detailed day-by-day travel itinerary, a key requirement for the Irish visa."
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
        <p>Visa approval is at the sole discretion of the Irish Immigration Service. O.S. Travel & Tours provides expert file preparation services.</p>
      </motion.div>

    </motion.div>
  );
}

// --- Reusable Sub-components ---

/**
 * A card component to display details for the File Processing service.
 */
const FileProcessingCard = ({ visa }) => {
  return (
    <div className={`bg-white rounded-lg shadow-xl overflow-hidden border-t-8 border-blue-600`}>
      <div className="p-6 md:p-8">
        
        {/* Card Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`text-4xl text-blue-600`}><FaFileSignature /></div>
          <div>
            <h2 className="text-3xl font-bold text-gray-800">{visa.title}</h2>
            <p className="text-lg text-gray-500">{visa.subtitle}</p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4 mb-6 pt-4 border-t border-gray-100">
          <DetailItem icon={<FaMoneyBillWave className="text-green-600" />} label="Total Fee" value={visa.totalFee} />
          <DetailItem icon={<FaClock className="text-red-600" />} label="Processing Time" value={visa.processingTime} />
          <DetailItem icon={<FaCalendarAlt className="text-blue-600" />} label="Category" value={visa.category} />
        </div>

        {/* Services Included */}
        <h3 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FaCheckCircle className="text-gray-600" />
          Our Service Package Includes
        </h3>
        <ul className="space-y-3 mb-6 grid grid-cols-1 md:grid-cols-2 gap-x-6">
          {visa.serviceIncludes.map((doc, index) => (
            <li key={index} className="flex items-start gap-3 text-gray-700">
              <FaCheckCircle className="text-blue-500 mt-1.5 shrink-0" />
              <span>{doc}</span>
            </li>
          ))}
        </ul>
        
        {/* Documents List */}
        <h3 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FaFileAlt className="text-gray-600" />
          Documents Required From You
        </h3>
        <ul className="space-y-3 mb-6 grid grid-cols-1 md:grid-cols-2 gap-x-6">
          {visa.documents.map((doc, index) => (
            <li key={index} className="flex items-start gap-3 text-gray-700">
              <FaCheckCircle className="text-green-500 mt-1.5 shrink-0" />
              <span>{doc}</span>
            </li>
          ))}
        </ul>

        {/* Note */}
        {visa.note && (
          <div className={`p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800`}>
            <div className="flex items-center gap-3">
              <FaExclamationTriangle className="text-xl shrink-0" />
              <p className="font-semibold">{visa.note}</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

/**
 * A card for Embassy/VFS info.
 */
const EmbassyCard = ({ info }) => (
  <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg flex flex-col">
    <h2 className="text-2xl font-bold text-gray-800 mb-5 flex items-center gap-3">
      <FaBuilding className={info.title.includes("Embassy") || info.title.includes("Consulate") ? "text-red-700" : "text-blue-700"} />
      {info.title}
    </h2>
    <ul className="space-y-4 text-gray-700 text-lg grow"> {/* Use grow */}
      <li className="flex items-start gap-4">
        <FaBuilding className="text-gray-500 mt-1.5 shrink-0" />
        <span><strong>Address:</strong> {info.address}</span>
      </li>
      <li className="flex items-start gap-4">
        <FaPhone className="text-gray-500 mt-1.5 shrink-0" />
        <span><strong>Phone:</strong> <a href={`tel:${info.phone.split(' / ')[0]}`} className="text-blue-600 hover:underline">{info.phone}</a></span>
      </li>
      <li className="flex items-start gap-4">
        <FaEnvelope className="text-gray-500 mt-1.5 shrink-0" />
        <span><strong>Email:</strong> <a href={`mailto:${info.email}`} className="text-blue-600 hover:underline">{info.email}</a></span>
      </li>
    </ul>
    <div className="mt-6 p-4 bg-gray-100 border-l-4 border-gray-400 text-gray-800">
      <div className="flex items-center gap-3">
        <FaExclamationTriangle className="text-xl shrink-0" />
        <p className="font-semibold text-sm">{info.note}</p>
      </div>
    </div>
  </div>
);

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

export default Ireland;