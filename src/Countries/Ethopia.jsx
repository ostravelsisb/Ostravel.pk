import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Icons (from react-icons) ---
// Make sure to install: npm install react-icons
import {
  FaPassport, FaMoneyBillWave, FaClock, FaCalendarAlt, FaFileAlt,
  FaBuilding, FaEnvelope, FaPhone, FaCheckCircle, FaExclamationTriangle,
  FaChevronDown, FaStar, FaQuoteLeft, FaPlane, FaHotel, FaUmbrellaBeach,
  FaLaptopCode, // Icon for E-Visa
  FaFax
} from 'react-icons/fa';

// --- Page Data ---
// Data fetched from the official Ethiopian E-Visa website (evisa.gov.et)

const eVisa30 = {
  title: "E-Visa (30 Days)",
  subtitle: "Online Application (Recommended)",
  totalFee: "$90", // Official Govt. Fee
  processingTime: "Approx. 3 Working Days",
  validity: "30 Days from intended arrival date",
  stay: "30 Days",
  category: "Single Entry",
  documents: [
    "Scanned Passport copy (valid 6+ months)",
    "Recent digital passport-size photo (white background)"
  ],
  note: "This is the fastest and most common option for tourists. The fee is non-refundable.",
  isSticker: false
};

const eVisa90 = {
  title: "E-Visa (90 Days)",
  subtitle: "Online Application (Extended Stay)",
  totalFee: "Varies", // Official Govt. Fee
  processingTime: "Approx. 3 Working Days",
  validity: "90 Days from intended arrival date",
  stay: "90 Days",
  category: "Single Entry",
  documents: [
    "Scanned Passport copy (valid 6+ months)",
    "Recent digital passport-size photo (white background)"
  ],
  note: "Ideal for tourists who plan to stay in the country for an extended period.",
  isSticker: false
};

const embassyInfo = {
  title: "Embassy of Ethiopia, Islamabad",
  address: "Islamabad, Pakistan (Officially inaugurated in 2023)",
  phone: "N/A",
  email: "N/A",
  note: "The embassy has been officially opened. All tourist visas are processed via the e-Visa portal."
};

const consulateInfo = {
  title: "Consulate of Ethiopia, Karachi",
  address: "D3 KDA Scheme No.1, Off Miran Mohd Shah Road, Karachi",
  phone: "0092-21-4316361",
  fax: "0092-21-4381960",
  email: "info@consulate.com.pk",
  note: "Provides consular services. Tourist visas are processed online."
};

// --- Ethiopia-Specific FAQs ---
const faqs = [
  {
    q: "Can Pakistani citizens get an e-visa for Ethiopia?",
    a: "Yes, Pakistani citizens are fully eligible to apply for an e-visa for tourism through the official government website: evisa.gov.et. This is the recommended method."
  },
  {
    q: "Do I need to go to the embassy?",
    a: "No, for a tourist visa, you do not need to visit the embassy. The entire process is completed online, and the e-visa is sent to your email. O.S. Travel & Tours can process this application for you."
  },
  {
    q: "How long does the Ethiopia e-visa take?",
    a: "The official processing time is very fast, typically around 3 working days. However, we recommend applying at least one week in advance."
  }
];

// --- Ethiopia-Specific Reviews ---
const reviews = [
  {
    name: "Ali R.",
    quote: "O.S. Travel handled my Ethiopia e-visa. I just sent my passport copy and photo, and I got the visa in my email in 3 days. Incredibly easy!",
    rating: 5
  },
  {
    name: "S. Jaffer",
    quote: "I was flying Ethiopian Airlines and wanted to do a stopover. O.S. Travel processed my e-visa quickly so I could explore Addis Ababa. Great service.",
    rating: 5
  },
  {
    name: "The Awan Family",
    quote: "We used O.S. Travel for our family trip. They processed all our e-visas. The file was perfect, and the visa was approved. Thank you!",
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
function Ethiopia() {
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
          src="https://flagcdn.com/w160/et.png" // Ethiopia flag
          alt="Flag of Ethiopia"
          className="w-16 h-10 object-cover rounded shadow-md"
        />
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800">
            Ethiopia Visa
          </h1>
          <p className="text-xl text-gray-600">
            E-Visa Requirements for Pakistani Citizens
          </p>
        </div>
      </motion.div>

      {/* 2. Visa Comparison Grid */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        <VisaCard visa={eVisa30} />
        <VisaCard visa={eVisa90} />
      </motion.div>

      {/* 3. Embassy & Consulate Information */}
      <motion.div
        variants={itemVariants}
        className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8"
      >
        <EmbassyCard info={embassyInfo} />
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
          The Ethiopia E-Visa is fast and simple, and we make it even easier.
          <strong className="text-gray-800"> We deal in complete E-Visa processing</strong> to ensure your application is submitted correctly and approved in as little as 3 days.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ServiceCard
            icon={<FaLaptopCode className="text-blue-500" />}
            title="E-Visa Processing"
            desc="We handle the entire online application for your 30-day or 90-day e-visa."
          />
          <ServiceCard
            icon={<FaPlane className="text-green-500" />}
            title="Air Ticketing"
            desc="Get the best fares on Ethiopian Airlines and other carriers to Addis Ababa (ADD)."
          />
          <ServiceCard
            icon={<FaHotel className="text-purple-500" />}
            title="Hotel Bookings"
            desc="We can arrange your hotel bookings, which are often required for the e-visa application."
          />
          <ServiceCard
            icon={<FaUmbrellaBeach className="text-yellow-500" />}
            title="Tour Packages"
            desc="Ask us about stopover tours in Addis Ababa or full trips to see the history of Ethiopia."
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
        <p>Visa approval is at the sole discretion of the Ethiopian Immigration Department. O.S. Travel & Tours provides expert application services.</p>
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
          <DetailItem icon={<FaMoneyBillWave className="text-green-600" />} label="Govt. E-Visa Fee" value={visa.totalFee} />
          <DetailItem icon={<FaClock className="text-red-600" />} label="Processing Time" value={visa.processingTime} />
          <DetailItem icon={<FaCalendarAlt className="text-blue-600" />} label="Validity" value={visa.validity} />
          <DetailItem icon={<FaCalendarAlt className="text-purple-600" />} label="Stay Duration" value={visa.stay} />
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

export default Ethiopia;