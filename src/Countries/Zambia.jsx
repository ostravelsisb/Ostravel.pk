import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Icons (from react-icons) ---
// Make sure to install: npm install react-icons
import {
  FaPassport, FaMoneyBillWave, FaClock, FaCalendarAlt, FaFileAlt,
  FaBuilding, FaEnvelope, FaPhone, FaCheckCircle, FaExclamationTriangle,
  FaChevronDown, FaStar, FaQuoteLeft, FaPlane, FaHotel, FaUmbrellaBeach,
  FaLaptopCode, // Icon for E-Visa
  FaPaw // Icon for Safari
} from 'react-icons/fa';

// --- Page Data ---
// Data based on official Zambia e-Visa portal and your provided fee.

const eVisaSingle = {
  title: "E-Visa (Single Entry)",
  subtitle: "Online Application (Recommended)",
  totalFee: "PKR 20,000", // Your provided fee
  govtFee: "$25 USD (Govt. Fee)",
  processingTime: "3-5 Working Days",
  validity: "90 Days",
  stay: "Up to 90 Days",
  category: "Single Entry",
  documents: [
    "Scanned Passport copy (valid 6+ months)",
    "Recent digital passport-size photo (white background)",
    "Signed Cover Letter (addressed to Director General of Immigration)",
    "Confirmed Return Flight Ticket",
    "Confirmed Hotel Booking",
  ],
  note: "This fee includes the $25 Govt. fee and our expert e-visa processing service.",
  isSticker: false
};

const eVisaDouble = {
  title: "E-Visa (Double Entry)",
  subtitle: "Online Application",
  totalFee: "$40 USD + Service Charge", // Official Govt. Fee
  processingTime: "3-5 Working Days",
  validity: "90 Days",
  stay: "Up to 90 Days",
  category: "Double Entry",
  documents: [
    "Scanned Passport copy (valid 6+ months)",
    "Recent digital passport-size photo (white background)",
    "Signed Cover Letter",
    "Confirmed Return Flight Ticket",
    "Confirmed Hotel Booking"
  ],
  note: "Ideal for visiting neighboring countries (e.g., Victoria Falls) and re-entering.",
  isSticker: false
};

const eVisaMultiple = {
  title: "E-Visa (Multiple Entry)",
  subtitle: "Online Application",
  totalFee: "$75 USD + Service Charge", // Official Govt. Fee
  processingTime: "3-5 Working Days",
  validity: "90 Days",
  stay: "Up to 90 Days",
  category: "Multiple Entry",
  documents: [
    "Scanned Passport copy (valid 6+ months)",
    "Recent digital passport-size photo (white background)",
    "Signed Cover Letter",
    "Confirmed Return Flight Ticket",
    "Confirmed Hotel Booking"
  ],
  note: "For frequent travelers. Issued at the discretion of the Immigration Dept.",
  isSticker: false
};

const embassyInfo = {
  title: "Zambian High Commission (Nearest)",
  address: "New Delhi, India (No Embassy in Pakistan)",
  phone: "+91 11 2615 0270",
  email: "pro@zambiaimmigration.gov.zm (Immigration Dept.)",
  note: "There is no Zambian Embassy in Pakistan. All visa processing is done online via the e-Visa portal."
};

// --- Zambia-Specific FAQs ---
const faqs = [
  {
    q: "Can I get a Zambia visa on arrival?",
    a: "No, Pakistani citizens are not eligible for a visa on arrival. You must apply for and receive an e-Visa approval letter *before* traveling."
  },
  {
    q: "Do I need to go to an embassy?",
    a: "No. The entire process is online. O.S. Travel & Tours handles the online application, and you receive the e-Visa approval by email. This is convenient as there is no Zambian embassy in Pakistan."
  },
  {
    q: "What is the fee for the e-visa?",
    a: "Our total service package for the most common Single Entry e-visa is PKR 20,000, which includes the $25 official government fee and our expert processing charges."
  }
];

// --- Zambia-Specific Reviews ---
const reviews = [
  {
    name: "Kamran A.",
    quote: "O.S. Travel handled my Zambia e-visa for a safari. The process was so simple, I just sent my documents and they handled the rest. Got my approval in 4 days!",
    rating: 5
  },
  {
    name: "S. Jafri",
    quote: "I was worried because there is no embassy here, but O.S. Travel assured me the e-visa is the official way. They were right. Very professional service.",
    rating: 5
  },
  {
    name: "The Malik Family",
    quote: "We used O.S. Travel for our trip to Victoria Falls. They processed our double-entry e-visas so we could cross into Zimbabwe. Everything was perfect.",
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
function Zambia() {
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
          src="https://flagcdn.com/w160/zm.png" // Zambia flag
          alt="Flag of Zambia"
          className="w-16 h-10 object-cover rounded shadow-md"
        />
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800">
            Zambia Visa
          </h1>
          <p className="text-xl text-gray-600">
            E-Visa Processing for Pakistani Citizens
          </p>
        </div>
      </motion.div>

      {/* 2. Visa Comparison Grid */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        <VisaCard visa={eVisaSingle} />
        <VisaCard visa={eVisaDouble} />
        <VisaCard visa={eVisaMultiple} />
      </motion.div>

      {/* 3. Embassy & VFS Information */}
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
            <span><strong>Immigration Email:</strong> <a href={`mailto:${embassyInfo.email}`} className="text-blue-600 hover:underline">{embassyInfo.email}</a></span>
          </li>
        </ul>
        <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800">
          <div className="flex items-center gap-3">
            <FaExclamationTriangle className="text-xl shrink-0" />
            <p className="font-semibold">{embassyInfo.note}</p>
          </div>
        </div>
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
          We are experts in the Zambia E-Visa system. 
          <strong className="text-gray-800"> We deal in complete E-Visa processing</strong> to ensure your application is submitted correctly and approved quickly for your safari adventure.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ServiceCard
            icon={<FaLaptopCode className="text-blue-500" />}
            title="E-Visa Processing"
            desc="We handle the entire online application for your single, double, or multiple entry e-visa."
          />
          <ServiceCard
            icon={<FaPaw className="text-yellow-600" />}
            title="Safari & Tour Packages"
            desc="We design unforgettable safari packages to Victoria Falls, South Luangwa, and more."
          />
          <ServiceCard
            icon={<FaPlane className="text-green-500" />}
            title="Air Ticketing"
            desc="Get the best fares on Emirates, Qatar Airways, and other carriers to Lusaka (LUN)."
          />
          <ServiceCard
            icon={<FaHotel className="text-purple-500" />}
            title="Hotel Bookings"
            desc="We book your city hotels and safari lodges, which are mandatory for the e-visa."
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
        <p>The e-Visa is mandatory for entry and is subject to approval by the Zambia Department of Immigration.</p>
      </motion.div>

    </motion.div>
  );
}

// --- Reusable Sub-components ---

/**
 * A card component to display details for a single visa type.
 */
const VisaCard = ({ visa }) => {
  // Determine border color based on title
  const borderColor = visa.title.includes("Single") ? "border-green-500" : 
                    visa.title.includes("Double") ? "border-blue-500" : "border-purple-500";
  const textColor = visa.title.includes("Single") ? "text-green-500" :
                    visa.title.includes("Double") ? "text-blue-500" : "text-purple-500";
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
          <DetailItem icon={<FaMoneyBillWave className="text-green-600" />} label="Service Fee" value={visa.totalFee} />
          {visa.govtFee && <DetailItem icon={<FaPassport className="text-gray-600" />} label="Govt. Fee" value={visa.govtFee} />}
          <DetailItem icon={<FaClock className="text-red-600" />} label="Processing Time" value={visa.processingTime} />
          <DetailItem icon={<FaCalendarAlt className="text-blue-600" />} label="Validity" value={visa.validity} />
          <DetailItem icon={<FaCalendarAlt className="text-purple-600" />} label="Stay Duration" value={visa.stay} />
        </div>

        {/* Documents List */}
        <h3 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FaFileAlt className="text-gray-600" />
          Documents Required (Scanned)
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
          <div className={`p-4 mt-auto ${borderColor === 'border-green-500' ? 'bg-green-50 border-l-4 border-green-400 text-green-800' : 'bg-blue-50 border-l-4 border-blue-400 text-blue-800'}`}>
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

export default Zambia;