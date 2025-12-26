import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Icons (from react-icons) ---
import {
  FaPassport, FaMoneyBillWave, FaClock, FaCalendarAlt, FaFileAlt,
  FaBuilding, FaEnvelope, FaPhone, FaCheckCircle, FaExclamationTriangle,
  FaChevronDown, FaStar, FaQuoteLeft, FaPlane, FaHotel, FaUmbrellaBeach,
  FaLaptopCode, // Icon for E-Visa
  FaFax
} from 'react-icons/fa';

// --- Page Data ---
// Data fetched directly from ostravels.com/visa/singapore-visa/ with your specific fee updates.

const eVisa = {
  title: "E-Visa (Recommended)",
  subtitle: "Online via Authorized Agent",
  totalFee: "PKR 18,000 (Service + Fee)", // Updated as per request
  processingTime: "10-15 Working Days",
  validity: "35 Days",
  stay: "1 Month",
  category: "Single Entry",
  documents: [
    "Passport 1st & 2nd Page Scan Copy (valid 6+ months)",
    "01 Picture with White Background (35mm x 50mm)",
    "CNIC Photo Copy",
    "Last Six Month Bank Statement",
    "NTN Tax Returns (If available)",
    "Company letter head / Employee Letter",
    "Last three month Salary Slips (If Employee)"
  ],
  note: "O.S. Travel & Tours is an ICA-authorized agent. All documents are submitted via email.",
  isSticker: false
};

const stickerVisa = {
  title: "E-visa Visa",
  subtitle: "Via Consulate in Karachi",
  totalFee: "PKR 12,000 (Service + Fee)", // Updated as per request
  processingTime: "7-10 Working Days",
  validity: "1 Month",
  stay: "1 Month",
  category: "Single Entry",
  documents: [
    "Original Passport (valid 6+ months)",
    "04 Pictures with White Background (35mm x 50mm)",
    "CNIC Photo Copy",
    "Last Six Month Bank Statement",
    "Bank Account Maintenance Letter",
    "Visa Request Letter",
    "Invitation Letter From Singaporean Citizen / Company",
    "NTN (If Applicable)",
    "Return Air Ticket"
  ],
  note: "This traditional method requires submitting original documents to the consulate in Karachi.",
  isSticker: true
};

const consulateInfo = {
  title: "Singapore Consulate In Karachi, Pakistan",
  address: "Lakson Square Building, 2 Sarwar Shaheed Road, Karachi-I, Pakistan",
  phone: "001-92-(21) 568-6419 / 568-5308",
  fax: "001-92-(21) 568-3410 / 568-4336",
  email: "singaporecg@cyber.net.pk"
};

// --- Singapore-Specific FAQs ---
const faqs = [
  {
    q: "Can I apply for a Singapore e-visa myself?",
    a: "No. The Singapore Immigration & Checkpoints Authority (ICA) only allows Singaporean citizens or ICA-authorized travel agents to submit e-visa applications. O.S. Travel & Tours is an authorized agent and can apply on your behalf."
  },
  {
    q: "Why is the E-Visa recommended over the Sticker Visa?",
    a: "The E-Visa is recommended because you don't need to send your original passport, and you can apply from anywhere in Pakistan (like Islamabad) via email. The Sticker Visa requires you to submit your original documents to the consulate, which is only located in Karachi."
  },
  {
    q: "Do I need an Invitation Letter (LOI) for the E-Visa?",
    a: "No, the document list for the E-Visa processed by O.S. Travel & Tours does not require an LOI, which makes the process much simpler for tourists."
  }
];

// --- Singapore-Specific Reviews ---
const reviews = [
  {
    name: "Ahtisham H.",
    quote: "Applied for Singapore, Got visa in 3 days, very efficiently. To the point, no beating around the bush. They know what they are doing. God bless them!",
    rating: 5
  },
  {
    name: "Nasir Islam",
    quote: "Trustable and good services. I got Singapore e-visa from O.S. Travel in just 2 days. Quality and charges and services good. Thanks.",
    rating: 5
  },
  {
    name: "Sami Jamal",
    quote: "Obaid is an extremely competent person who handled my Singapore visa with utmost care. I will definitely use his services in future. Highly recommended!",
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
function Singapore() {
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
          src="https://flagcdn.com/w160/sg.png" // Singapore flag
          alt="Flag of Singapore"
          className="w-16 h-10 object-cover rounded shadow-md"
        />
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800">
            Singapore Visa
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
        <VisaCard visa={eVisa} isSticker={false} /> {/* Green border for recommended E-Visa */}
        <VisaCard visa={stickerVisa} isSticker={true} /> {/* Blue border for standard Sticker Visa */}
      </motion.div>

      {/* 3. Consulate Information */}
      <motion.div
        variants={itemVariants}
        className="mt-12 bg-white p-6 md:p-8 rounded-lg shadow-lg"
      >
        <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <FaBuilding className="text-red-600" />
          {consulateInfo.title}
        </h2>
        <ul className="space-y-4 text-gray-700 text-lg">
          <li className="flex items-start gap-4">
            <FaBuilding className="text-gray-500 mt-1.5 shrink-0" />
            <span><strong>Address:</strong> {consulateInfo.address}</span>
          </li>
          <li className="flex items-start gap-4">
            <FaPhone className="text-gray-500 mt-1.5 shrink-0" />
            <span><strong>Phone:</strong> <a href={`tel:${consulateInfo.phone.split(' / ')[0]}`} className="text-blue-600 hover:underline">{consulateInfo.phone}</a></span>
          </li>
          <li className="flex items-start gap-4">
            <FaFax className="text-gray-500 mt-1.5 shrink-0" />
            <span><strong>Fax:</strong> {consulateInfo.fax}</span>
          </li>
          <li className="flex items-start gap-4">
            <FaEnvelope className="text-gray-500 mt-1.5 shrink-0" />
            <span><strong>Email:</strong> <a href={`mailto:${consulateInfo.email}`} className="text-blue-600 hover:underline">{consulateInfo.email}</a></span>
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
          As an <strong className="text-gray-800">ICA Authorized Travel Agent</strong>, we have direct access to Singapore's e-visa system. 
          <strong className="text-gray-800"> We deal in a wide range of services</strong> to ensure your application is fast, secure, and successful.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ServiceCard
            icon={<FaPassport className="text-blue-500" />}
            title="Authorized E-Visa Agent"
            desc="We are authorized by Singapore (ICA) to submit e-visa applications directly for you."
          />
          <ServiceCard
            icon={<FaPlane className="text-green-500" />}
            title="Air Ticketing"
            desc="Get the best fares on Singapore Airlines, Thai, Emirates, and more to SIN."
          />
          <ServiceCard
            icon={<FaHotel className="text-purple-500" />}
            title="Hotel Bookings"
            desc="From Marina Bay Sands to budget-friendly options, we book your perfect stay."
          />
          <ServiceCard
            icon={<FaUmbrellaBeach className="text-yellow-500" />}
            title="Tour Packages"
            desc="We create complete holiday packages including Universal Studios, Gardens by the Bay, and more."
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
 * isSticker = true -> Blue Border (Standard)
 * isSticker = false -> Green Border (Preferred/E-Visa)
 */
const VisaCard = ({ visa, isSticker }) => {
  const borderColor = isSticker ? "border-blue-500" : "border-green-500";
  const textColor = isSticker ? "text-blue-500" : "text-green-500";
  const icon = isSticker ? <FaPassport /> : <FaLaptopCode />;

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

        {/* Note */}
        {visa.note && (
          <div className={`p-4 mt-auto ${isSticker ? 'bg-blue-50 border-l-4 border-blue-400 text-blue-800' : 'bg-green-50 border-l-4 border-green-400 text-green-800'}`}>
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

export default Singapore;