import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Icons (from react-icons) ---
// Make sure to install: npm install react-icons
import {
  FaPassport, FaMoneyBillWave, FaClock, FaCalendarAlt, FaFileAlt,
  FaBuilding, FaEnvelope, FaPhone, FaCheckCircle, FaExclamationTriangle,
  FaChevronDown, FaStar, FaQuoteLeft, FaPlane, FaHotel, FaUmbrellaBeach,
  FaLaptopCode, // Icon for E-Visa
  FaPaw // Icon for Safari/Wildlife
} from 'react-icons/fa';

// --- Page Data ---
// Data fetched from official Kenyan eTA portal and High Commission.

const eTA = {
  title: "Kenya Electronic Travel Authorization (eTA)",
  subtitle: "Online Application (Mandatory)",
  totalFee: "PKR 18,000", // As per your provided fee
  processingTime: "Approx. 3-5 Working Days",
  validity: "90 Days (Single Entry)",
  stay: "Up to 90 Days",
  category: "eTA (Electronic Travel Authorization)",
  documents: [
    "Scanned Passport copy (valid 6+ months)",
    "Recent digital passport-size photo (or a clear selfie)",
    "Confirmed Return Flight Ticket",
    "Confirmed Hotel Booking",
    "Contact Details (Email, Phone)",
    "Travel Itinerary",
    "Invitation Letter (if visiting friends/family)"
  ],
  note: "As of 2024, Kenya is visa-free, but this eTA is mandatory for all travelers, including Pakistanis. The fee includes Govt. charges and our expert service."
};

const highCommissionInfo = {
  title: "Kenya High Commission, Islamabad",
  address: "Plot # 1-2-3, Street # 27, Ramna 5, Diplomatic Enclave, Islamabad",
  phone: "(+92) 51 260 1504 / 6",
  email: "info@pakhc.or.ke",
  note: "All travel authorizations are processed online via the eTA portal, not at the High Commission."
};

const consulateInfo = {
  title: "Kenya Consulate, Karachi",
  address: "D3 KDA Scheme No.1, Off Miran Mohd Shah Road, Karachi",
  phone: "0092-21-4316361",
  email: "info@consulate.com.pk",
  note: "Provides consular services. All travel authorizations are online."
};

// --- Kenya-Specific FAQs ---
const faqs = [
  {
    q: "Do Pakistanis need a visa for Kenya?",
    a: "No, Kenya is officially visa-free. However, Pakistani citizens *must* obtain an Electronic Travel Authorization (eTA) online *before* traveling. You cannot board your flight without it."
  },
  {
    q: "How long does the Kenya eTA take?",
    a: "Processing time is typically 3 to 5 working days, but it's recommended to apply at least 7-10 days before your flight to avoid any delays."
  },
  {
    q: "What is the fee for the Kenya eTA?",
    a: "The official government processing fee is approximately $34 USD. Our total service fee of PKR 18,000 includes this government fee, our expert application handling, and all service charges."
  }
];

// --- Kenya-Specific Reviews ---
const reviews = [
  {
    name: "Tariq A.",
    quote: "O.S. Travel handled my Kenya eTA. I was confused about the new 'visa-free' rules, but they explained I still need an eTA. Got it in 3 days. Excellent service for our safari trip!",
    rating: 5
  },
  {
    name: "Sobia M.",
    quote: "I highly recommend their eTA service. I just sent my documents via WhatsApp, and they handled the entire online application. Very fast and professional.",
    rating: 5
  },
  {
    name: "The Khan Family",
    quote: "We used O.S. Travel for our family vacation to Nairobi. They processed all 5 of our eTA applications. The file was perfect, and we had no issues at the airport. Thank you!",
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
function Kenya() {
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
          src="https://flagcdn.com/w160/ke.png" // Kenya flag
          alt="Flag of Kenya"
          className="w-16 h-10 object-cover rounded shadow-md"
        />
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800">
            Kenya eTA
          </h1>
          <p className="text-xl text-gray-600">
            Electronic Travel Authorization for Pakistani Citizens
          </p>
        </div>
      </motion.div>

      {/* 2. Visa Card Section (File Processing) */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1"
      >
        <VisaCard visa={eTA} />
      </motion.div>

      {/* 3. Embassy & Consulate Information */}
      <motion.div
        variants={itemVariants}
        className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8"
      >
        <EmbassyCard info={highCommissionInfo} />
        <EmbassyCard info={consulateInfo} />
      </motion.div>

      {/* 4. About O.S. Travel Section (Highlighting E-Visa) */}
      <motion.div
        variants={itemVariants}
        className="mt-12 bg-white p-6 md:p-8 rounded-lg shadow-lg"
      >
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Why Book with <span className="text-blue-600">O.S. Travel & Tours</span>?
        </h2>
        <p className="text-lg text-gray-600 text-center mb-8 max-w-3xl mx-auto">
          We are experts in the new Kenya eTA system. 
          <strong className="text-gray-800"> We deal in complete eTA processing</strong> to ensure your application is submitted correctly and approved quickly for your safari adventure.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ServiceCard
            icon={<FaLaptopCode className="text-blue-500" />}
            title="eTA Processing"
            desc="We handle the entire online application, so you just send us your documents."
          />
          <ServiceCard
            icon={<FaPaw className="text-yellow-600" />}
            title="Safari Packages"
            desc="We design unforgettable safari packages to Maasai Mara and other national parks."
          />
          <ServiceCard
            icon={<FaPlane className="text-green-500" />}
            title="Air Ticketing"
            desc="Get the best fares on all major airlines to Nairobi (NBO) and Mombasa (MBA)."
          />
          <ServiceCard
            icon={<FaHotel className="text-purple-500" />}
            title="Hotel Bookings"
            desc="We book your city hotels, safari lodges, and beach resorts."
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
        <p>The eTA is mandatory for entry and is subject to approval by the Government of Kenya. O.S. Travel & Tours provides expert application services.</p>
      </motion.div>

    </motion.div>
  );
}

// --- Reusable Sub-components ---

/**
 * A card component to display details for the eTA service.
 */
const VisaCard = ({ visa }) => {
  return (
    <div className={`bg-white rounded-lg shadow-xl overflow-hidden border-t-8 border-green-500`}>
      <div className="p-6 md:p-8">
        
        {/* Card Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`text-4xl text-green-500`}><FaLaptopCode /></div>
          <div>
            <h2 className="text-3xl font-bold text-gray-800">{visa.title}</h2>
            <p className="text-lg text-gray-500">{visa.subtitle}</p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4 mb-6 pt-4 border-t border-gray-100">
          <DetailItem icon={<FaMoneyBillWave className="text-green-600" />} label="Total Service Fee" value={visa.totalFee} />
          <DetailItem icon={<FaClock className="text-red-600" />} label="Processing Time" value={visa.processingTime} />
          <DetailItem icon={<FaCalendarAlt className="text-blue-600" />} label="Category" value={visa.category} />
        </div>
        
        {/* Documents List */}
        <h3 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FaFileAlt className="text-gray-600" />
          Documents Required (Scanned)
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
          <div className={`p-4 bg-green-50 border-l-4 border-green-400 text-green-800`}>
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
 * A card for Embassy/VFS info.
 */
const EmbassyCard = ({ info }) => (
  <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg flex flex-col">
    <h2 className="text-2xl font-bold text-gray-800 mb-5 flex items-center gap-3">
      <FaBuilding className={info.title.includes("High Commission") ? "text-red-700" : "text-blue-700"} />
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
      {info.fax && (
        <li className="flex items-start gap-4">
          <FaFax className="text-gray-500 mt-1.5 shrink-0" />
          <span><strong>Fax:</strong> {info.fax}</span>
        </li>
      )}
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

export default Kenya;