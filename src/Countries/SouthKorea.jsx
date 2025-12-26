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
  FaBriefcase // Icon for Business/Employment
} from 'react-icons/fa';

// --- Page Data ---
// Data based on official embassy requirements and your specific fee updates.

const stickerVisa = {
  title: "Tourist Sticker Visa (C-3-9)",
  subtitle: "From the Embassy in Islamabad",
  // --- UPDATED FEES ---
  embassyFee: "PKR 12,000 (Embassy Fee)", // "mebasy fee 12000"
  serviceCharge: "PKR 25000", // "file ready" service charge
  // ---
  processingTime: "15-20 Working Days",
  validity: "90 Days (Single Entry)",
  stay: "Up to 30 Days",
  category: "C-3-9 (Tourism)",
  // This is the core service you offer
  serviceIncludes: [
    "Complete Visa File Preparation",
    "Visa Application Form (filled & signed)",
    "Detailed Day-by-Day Travel Itinerary",
    "Confirmed Flight Reservation",
    "Confirmed Hotel Bookings",
    "Travel Insurance (Recommended)"
  ],
  // These are the documents the *client* must provide
  documents: [
    "Original Passport (valid 6+ months) & all old passports",
    "2 Recent Photos (35mm x 45mm, white background)",
    "CNIC Copy (front & back)",
    "Last 6-month Bank Statement (Min. PKR 1,000,000)",
    "Bank Account Maintenance Letter",
    "Family Registration Certificate (FRC)",
    "Employment Letter (NOC) / Business Documents",
    "Last 3 Years' Tax Returns (NTN)",
    "Police Character Certificate"
  ],
  note: "This is a complex file processing service. Visa approval is at the sole discretion of the embassy. Fees are non-refundable."
};

const embassyInfo = {
  title: "Embassy of the Republic of Korea",
  address: "Block 13, Street 29, Diplomatic Enclave, G-5/4, Islamabad",
  phone: "(051) 2279380",
  email: "pakistan@mofa.go.kr",
  note: "All visa applications must be submitted in person at the embassy by the applicant."
};

// --- South Korea-Specific FAQs ---
const faqs = [
  {
    q: "Can I get a South Korea e-visa or K-ETA?",
    a: "No. Pakistani passport holders are not eligible for the K-ETA (Korea Electronic Travel Authorization) or any e-visa. You must apply for a sticker visa in person at the embassy in Islamabad."
  },
  {
    q: "Is an invitation letter mandatory?",
    a: "An invitation letter is not always mandatory for a tourist visa if your financial documents and travel history are very strong. However, having one from a Korean citizen or company *greatly* increases your chances of approval."
  },
  {
    q: "What is the minimum bank balance for a Korea visa?",
    a: "It is highly recommended to show a consistent closing balance of at least PKR 1,000,000 (10 Lac) for solo travelers and more for families to prove you can fund your trip."
  }
];

// --- South Korea-Specific Reviews ---
const reviews = [
  {
    name: "Hammad A.",
    quote: "The South Korea visa is one of the toughest to get. O.S. Travel & Tours was amazing. They prepared my file meticulously, and I got my visa for a conference in Seoul. Thank you!",
    rating: 5
  },
  {
    name: "Dr. S. Naqvi",
    quote: "I wanted to visit for tourism. The O.S. team was very honest about the difficulty but built a strong file for me. The interview prep was also very helpful. Visa approved!",
    rating: 5
  },
  {
    name: "Faizan K.",
    quote: "Excellent service. They made sure I had every single document in order, from the FRC to the tax returns. They know exactly what the embassy is looking for.",
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
function SouthKorea() {
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
          src="https://flagcdn.com/w160/kr.png" // South Korea flag
          alt="Flag of South Korea"
          className="w-16 h-10 object-cover rounded shadow-md"
        />
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800">
            South Korea Visa
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

      {/* 4. About O.S. Travel Section */}
      <motion.div
        variants={itemVariants}
        className="mt-12 bg-white p-6 md:p-8 rounded-lg shadow-lg"
      >
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Why Book with <span className="text-blue-600">O.S. Travel & Tours</span>?
        </h2>
        <p className="text-lg text-gray-600 text-center mb-8 max-w-3xl mx-auto">
          The South Korea visa is a complex, document-intensive process. 
          <strong className="text-gray-800"> We deal in expert file preparation</strong> to ensure your application is perfect, complete, and has the highest chance of success.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ServiceCard
            icon={<FaPassport className="text-blue-500" />}
            title="Expert File Processing"
            desc="We meticulously prepare your file, from the application form to all supporting documents."
          />
          <ServiceCard
            icon={<FaBriefcase className="text-purple-500" />}
            title="Strong Documentation"
            desc="We help you source and prepare strong documents like travel itineraries and letters."
          />
          <ServiceCard
            icon={<FaPlane className="text-green-500" />}
            title="Air Ticketing"
            desc="We provide confirmed flight *reservations* for your application, as required by the embassy."
          />
          <ServiceCard
            icon={<FaHotel className="text-yellow-500" />}
            title="Hotel Bookings"
            desc="We arrange confirmed hotel bookings that align perfectly with your travel itinerary."
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
        <p>O.S. Travel & Tours provides expert visa file preparation services. Visa approval is at the sole discretion of the Embassy of the Republic of Korea.</p>
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
          <div className={`text-4xl text-blue-500`}><FaFileSignature /></div>
          <div>
            <h2 className="text-3xl font-bold text-gray-800">{visa.title}</h2>
            <p className="text-lg text-gray-500">{visa.subtitle}</p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4 mb-6 pt-4 border-t border-gray-100">
          <DetailItem icon={<FaMoneyBillWave className="text-green-600" />} label="O.S. Service Charge" value={visa.serviceCharge} />
          <DetailItem icon={<FaPassport className="text-gray-600" />} label="Embassy Fee" value={visa.embassyFee} />
          <DetailItem icon={<FaClock className="text-red-600" />} label="Processing Time" value={visa.processingTime} />
          <DetailItem icon={<FaCalendarAlt className="text-blue-600" />} label="Validity" value={visa.validity} />
          <DetailItem icon={<FaCalendarAlt className="text-purple-600" />} label="Stay Duration" value={visa.stay} />
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

export default SouthKorea;