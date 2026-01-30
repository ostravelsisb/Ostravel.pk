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
  FaLaptopCode, // Icon for E-Visa
  FaTag // Icon for Fee
} from 'react-icons/fa';

// --- Page Data ---
// Data based on official Moroccan E-Visa portal and Embassy requirements.

const eVisa = {
  title: "E-Visa (Conditional)",
  subtitle: "For US/UK/Schengen Visa Holders",
  totalFee: "770 MAD (Approx. $77 USD)", // Official Govt. Fee
  serviceCharge: "PKR 15,000", // O.S. Service Charge
  processingTime: "1-3 Working Days",
  validity: "180 Days",
  stay: "30 Days",
  category: "E-Visa",
  documents: [
    "Scanned Passport copy (valid 6+ months)",
    "Recent digital passport-size photo (white background)",
    "Scanned copy of your valid US, UK, Schengen, Canada, Australia, or NZ visa (must be valid for 90+ days)"
  ],
  note: "This is the fastest option ONLY if you hold an eligible supporting visa. Fees are non-refundable.",
  isSticker: false
};

const stickerVisa = {
  title: "Sticker Visa (Tourist)",
  subtitle: "Complete File Processing Service",
  totalFee: "PKR 10,000 (Approx. Embassy Fee)", // Approx. fee
  serviceCharge: "PKR 50,000", // O.S. Service Charge
  processingTime: "15-20 Working Days",
  validity: "90 Days",
  stay: "30 Days",
  category: "Sticker Visa",
  documents: [
    "Original Passport (valid 6+ months) & all old passports",
    "04 Pictures with White Background (35mm x 45mm)",
    "Last 6-month Bank Statement & Maintenance Letter",
    "CNIC Photo Copy (front & back)",
    "Family Registration Certificate (FRC)",
    "Income Tax Returns & NTN",
    "Employment Letter / Business Documents",
    "Confirmed Flight Reservation",
    "Confirmed Hotel Booking",
    "Police Character Certificate"
  ],
  note: "For all other applicants, this comprehensive file processing service is required. Fees are non-refundable.",
  isSticker: true
};

const embassyInfo = {
  title: "Embassy of the Kingdom of Morocco",
  address: "Diplomatic Enclave, G-5, Islamabad, Pakistan",
  phone: "(051) 2279318",
  email: "embassyofmorocco@isb.comsats.net.pk",
  note: "E-Visa applicants do not need to visit. Sticker visa applicants must submit their file via O.S. Travel & Tours."
};

// --- Morocco-Specific FAQs ---
const faqs = [
  {
    q: "Can any Pakistani citizen get a Morocco e-visa?",
    a: "No. The Morocco e-visa is *only* available to Pakistani citizens who hold a valid visa or residence permit (valid for at least 90 days) from the USA, UK, Canada, Australia, New Zealand, or a Schengen country. All other travelers must apply for a sticker visa."
  },
  {
    q: "What is the 'File Processing' service for the sticker visa?",
    a: "This is our expert service where we handle the entire complex application. We fill the forms, arrange your appointments, and ensure all your documents (bank statements, FRC, hotel/flight bookings) are perfect to maximize your chance of approval."
  },
  {
    q: "How long does the Morocco visa take?",
    a: "The E-Visa (if you are eligible) is very fast, taking 1-3 working days. The standard sticker visa from the embassy takes much longer, typically 15-20 working days after submission."
  }
];

// --- Morocco-Specific Reviews ---
const reviews = [
  {
    name: "Hassan A.",
    quote: "I had a valid US visa, and O.S. Travel got my Morocco e-visa in just 2 days! I was shocked. Amazing, fast service for my Marrakesh trip.",
    rating: 5
  },
  {
    name: "Sobia M.",
    quote: "I didn't have a supporting visa, so I needed the sticker visa. The file was complex, but O.S. Travel handled everything. My visa was approved for my trip to Casablanca!",
    rating: 5
  },
  {
    name: "The Qureshi Family",
    quote: "We used O.S. Travel for our family vacation to Morocco. They processed all our sticker visa applications. The file was perfect, and the visa was approved. Thank you!",
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
function Morocco() {
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
          src="https://flagcdn.com/w160/ma.png" // Morocco flag
          alt="Flag of Morocco"
          className="w-16 h-10 object-cover rounded shadow-md"
        />
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800">
            Morocco Visa
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
        <VisaCard visa={eVisa} />
        <VisaCard visa={stickerVisa} />
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
        <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800">
          <div className="flex items-center gap-3">
            <FaExclamationTriangle className="text-xl shrink-0" />
            <p className="font-semibold">{embassyInfo.note}</p>
          </div>
        </div>
      </motion.div>

      {/* 4. About O.S. Travel Section (Highlighting E-Visa & File Processing) */}
      <motion.div
        variants={itemVariants}
        className="mt-12 bg-white p-6 md:p-8 rounded-lg shadow-lg"
      >
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Why Book with <span className="text-blue-600">O.S. Travel & Tours</span>?
        </h2>
        <p className="text-lg text-gray-600 text-center mb-8 max-w-3xl mx-auto">
          We are experts in both visa processes for Morocco.
          <strong className="text-gray-800"> We deal in fast E-Visa processing</strong> for eligible clients and <strong className="text-gray-800">complete file preparation</strong> for the sticker visa.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ServiceCard
            icon={<FaLaptopCode className="text-blue-500" />}
            title="E-Visa (Conditional)"
            desc="Fast 1-3 day e-visa processing if you hold a valid US, UK, or Schengen visa."
          />
          <ServiceCard
            icon={<FaFileSignature className="text-purple-500" />}
            title="Sticker Visa Processing"
            desc="Complete file preparation and embassy guidance for all other applicants."
          />
          <ServiceCard
            icon={<FaPlane className="text-green-500" />}
            title="Air Ticketing"
            desc="Get the best fares on all major airlines to Casablanca (CMN) and Marrakesh (RAK)."
          />
          <ServiceCard
            icon={<FaHotel className="text-yellow-500" />}
            title="Tour Packages"
            desc="We create customized holiday packages to explore the cities and deserts of Morocco."
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
        <p>Visa approval is at the sole discretion of the Kingdom of Morocco. O.S. Travel & Tours provides expert application services.</p>
      </motion.div>

    </motion.div>
  );
}

// --- Reusable Sub-components ---

/**
 * A card component to display details for a single visa type.
 */
const VisaCard = ({ visa }) => {
  const isSticker = visa.isSticker;
  const borderColor = isSticker ? "border-blue-500" : "border-green-500";
  const textColor = isSticker ? "text-blue-500" : "text-green-500";
  const icon = isSticker ? <FaFileSignature /> : <FaLaptopCode />;

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
          <DetailItem icon={<FaTag className="text-green-600" />} label="Govt. Fee" value={visa.totalFee} />
          <DetailItem icon={<FaMoneyBillWave className="text-blue-600" />} label="O.S. Service Fee" value={visa.serviceCharge} />
          <DetailItem icon={<FaClock className="text-red-600" />} label="Processing Time" value={visa.processingTime} />
          <DetailItem icon={<FaCalendarAlt className="text-blue-600" />} label="Validity" value={visa.validity} />
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

        {/* Note */}
        {visa.note && (
          <div className={`p-4 mt-auto ${isSticker ? 'bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800' : 'bg-green-50 border-l-4 border-green-400 text-green-800'}`}>
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
 * A card for Embassy/VFS info.
 */
const EmbassyCard = ({ info }) => (
  <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg flex flex-col">
    <h2 className="text-2xl font-bold text-gray-800 mb-5 flex items-center gap-3">
      <FaBuilding className={"text-red-700"} />
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
        <span><strong>Email:</strong> <a href={`mailto:${info.email.split(',')[0]}`} className="text-blue-600 hover:underline">{info.email}</a></span>
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

export default Morocco;