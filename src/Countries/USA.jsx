import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Icons (from react-icons) ---
// Make sure to install: npm install react-icons
import {
  FaPassport, FaMoneyBillWave, FaClock, FaCalendarAlt, FaFileAlt,
  FaBuilding, FaEnvelope, FaPhone, FaCheckCircle, FaExclamationTriangle,
  FaChevronDown, FaStar, FaQuoteLeft, FaPlane, FaHotel, FaUmbrellaBeach,
  FaGavel // Icon for 'processing' or 'official'
} from 'react-icons/fa';

// --- Page Data ---
// Data synthesized from official US Embassy sources and OS Travel's site.

const usaVisa = {
  title: "B1/B2 Visa File Processing",
  subtitle: "Tourist / Business Visa",
  // This is the official US Govt. MRV Fee
  totalFee: "$185 (MRV Fee)",
  // This is the processing time *after* the interview
  processingTime: "15-50 Working Days",
  validity: "Up to 5 Years (Multiple Entry)",
  stay: "Up to 6 Months (per entry)",
  category: "B1/B2",
  documents: [
    "Original Passport (valid 6+ months) & all old passports",
    "DS-160 Form Confirmation Page",
    "Visa Fee (MRV) Payment Receipt",
    "Interview Appointment Letter",
    "1 Recent Photo (5x5cm or 2x2in, white background)",
    "Last 6-month bank statement",
    "Bank account maintenance letter",
    "Employment Letter / Business Documents (NTN, etc.)",
    "Family Registration Certificate (FRC)",
    "Marriage Registration Certificate (MRC, if applicable)",
    "Travel Itinerary / Hotel Bookings (if available)",
    "Invitation Letter (if for business/family visit)"
  ],
  note: "This is the US Govt. fee. O.S. Travel & Tours service charges for file preparation and interview coaching are separate."
};

const embassyInfo = {
  title: "U.S. Embassy, Islamabad",
  address: "Diplomatic Enclave, Ramna 5, Islamabad",
  phone: "(+92) 051-201-4000",
  note: "Handles visa interviews for residents of Punjab, KPK, GB, and AJK."
};

const consulateInfo = {
  title: "U.S. Consulate, Karachi",
  address: "Plot 3-5 New TPX Area, Mai Kolachi Road, Karachi",
  phone: "(+92) 021-3527-5000",
  note: "Handles visa interviews for residents of Sindh and Balochistan."
};

const consulateLahoreInfo = {
  title: "U.S. Consulate, Lahore",
  address: "50, Shahrah-e-Abdul Hameed Bin Badees, (Old Empress Road), Lahore",
  phone: "(+92) 042-3603-4000",
  note: "Provides services for residents of the Lahore consular district."
};

// --- NEW: USA-Specific Reviews ---
const reviews = [
  {
    name: "Tariq M.",
    quote: "The US visa interview is stressful, but O.S. Travel prepared me perfectly. They handled my DS-160 form and all documents. My visa was approved!",
    rating: 5
  },
  {
    name: "Dr. Saima",
    quote: "I used their file processing service for a US conference (B1 visa). The documentation was perfect, and the interview coaching was very helpful.",
    rating: 5
  },
  {
    name: "The Jaffer Family",
    quote: "We applied for a family tourist visa (B2). O.S. Travel & Tours managed all our applications together. We are so grateful for their professional service.",
    rating: 5
  }
];

// --- NEW: USA-Specific FAQs ---
const faqs = [
  {
    q: "What is the DS-160?",
    a: "The DS-160 is the mandatory Online Nonimmigrant Visa Application form you must fill out. O.S. Travel & Tours provides expert assistance in filling this complex form accurately."
  },
  {
    q: "What is the 'MRV Fee'?",
    a: "The MRV (Machine Readable Visa) fee is the non-refundable $185 fee required by the US Government to apply for the visa. This must be paid before you can schedule your interview."
  },
  {
    q: "Do I need to buy a plane ticket before the interview?",
    a: "No. The US Embassy advises against purchasing non-refundable tickets until you have your visa. A flight *reservation* or itinerary is sufficient for the application."
  },
  {
    q: "What is Administrative Processing?",
    a: "Sometimes, an application is put under 'Administrative Processing' after the interview for extra background checks. This is common and can take several weeks. O.S. Travel helps ensure your initial file is strong to minimize delays."
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
function USA() {
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
          src="https://flagcdn.com/w160/us.png" // USA flag
          alt="Flag of USA"
          className="w-16 h-10 object-cover rounded shadow-md"
        />
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800">
            USA Visa
          </h1>
          <p className="text-xl text-gray-600">
            Visa File Processing for Pakistani Citizens
          </p>
        </div>
      </motion.div>

      {/* 2. Visa Card Section */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1"
      >
        <VisaCard visa={usaVisa} />
      </motion.div>

      {/* 3. Embassy & Consulate Information */}
      <motion.div
        variants={itemVariants}
        className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8"
      >
        <EmbassyCard info={embassyInfo} />
        <EmbassyCard info={consulateInfo} />
        <EmbassyCard info={consulateLahoreInfo} />
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
          The US visa is a complex, interview-based process. Our expert team provides complete file preparation and interview coaching. 
          <strong className="text-gray-800"> We deal in a wide range of services</strong> to ensure you are fully prepared.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ServiceCard
            icon={<FaPassport className="text-blue-500" />}
            title="Visa File Processing"
            desc="Expert DS-160 filling, document arrangement, and appointment scheduling."
          />
          <ServiceCard
            icon={<FaGavel className="text-red-500" />}
            title="Interview Coaching"
            desc="One-on-one mock interviews to build your confidence and prepare you for questions."
          />
          <ServiceCard
            icon={<FaPlane className="text-green-500" />}
            title="Air Ticketing"
            desc="We book your flight *reservations* for the application and finalize tickets *after* visa approval."
          />
          <ServiceCard
            icon={<FaHotel className="text-purple-500" />}
            title="Hotel Bookings"
            desc="Securing confirmed hotel bookings to strengthen your travel itinerary."
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
        <p>Visa approval is at the sole discretion of the US Embassy/Consulate. O.S. Travel & Tours provides expert file preparation services.</p>
      </motion.div>

    </motion.div>
  );
}

// --- Reusable Sub-components ---

/**
 * A card component to display details for the visa.
 */
const VisaCard = ({ visa }) => {
  return (
    <div className={`bg-white rounded-lg shadow-xl overflow-hidden border-t-8 border-blue-600`}>
      <div className="p-6 md:p-8">
        
        {/* Card Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`text-4xl text-blue-600`}><FaGavel /></div>
          <div>
            <h2 className="text-3xl font-bold text-gray-800">{visa.title}</h2>
            <p className="text-lg text-gray-500">{visa.subtitle}</p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4 mb-6 pt-4 border-t border-gray-100">
          <DetailItem icon={<FaMoneyBillWave className="text-green-600" />} label="US Govt. MRV Fee" value={visa.totalFee} />
          <DetailItem icon={<FaClock className="text-red-600" />} label="Post-Interview Processing" value={visa.processingTime} />
          <DetailItem icon={<FaCalendarAlt className="text-blue-600" />} label="Typical Validity" value={visa.validity} />
          <DetailItem icon={<FaCalendarAlt className="text-purple-600" />} label="Max Stay Per Entry" value={visa.stay} />
        </div>

        {/* Documents List */}
        <h3 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FaFileAlt className="text-gray-600" />
          Key Documents for Your File
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
 * A card for Embassy/Consulate info.
 */
const EmbassyCard = ({ info }) => (
  <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg flex flex-col">
    <h2 className="text-2xl font-bold text-gray-800 mb-5 flex items-center gap-3">
      <FaBuilding className="text-blue-800" />
      {info.title}
    </h2>
    <ul className="space-y-4 text-gray-700 text-lg grow">
      <li className="flex items-start gap-4">
        <FaBuilding className="text-gray-500 mt-1.5 shrink-0" />
        <span><strong>Address:</strong> {info.address}</span>
      </li>
      <li className="flex items-start gap-4">
        <FaPhone className="text-gray-500 mt-1.5 shrink-0" />
        <span><strong>Phone:</strong> <a href={`tel:${info.phone}`} className="text-blue-600 hover:underline">{info.phone}</a></span>
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

export default USA;