import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Icons (from react-icons) ---
// Make sure to install: npm install react-icons
import {
  FaPassport, FaMoneyBillWave, FaClock, FaCalendarAlt, FaFileAlt,
  FaBuilding, FaEnvelope, FaPhone, FaCheckCircle, FaExclamationTriangle,
  FaChevronDown, FaStar, FaQuoteLeft, FaPlane, FaHotel, FaUmbrellaBeach,
  FaPlaneArrival // Specific icon for Visa on Arrival
} from 'react-icons/fa';

// --- Page Data ---
// Data synthesized from official Maldives Immigration & trusted sources.

const visaOnArrival = {
  title: "Visa on Arrival (Tourist)",
  subtitle: "Granted at the Airport",
  totalFee: "Free (Gratis)",
  processingTime: "Immediate (at airport)",
  validity: "30 Days",
  stay: "30 Days",
  category: "Single Entry",
  documents: [
    "Original Passport (valid for at least 6 months)",
    "Confirmed Return or Onward Flight Ticket",
    "Confirmed Hotel/Resort Booking",
    "Proof of Sufficient Funds (approx. $100-150 per day)",
    "Completed Traveller Declaration (IMUGA) submitted online 96 hours *before* arrival."
  ],
  note: "This visa is granted to Pakistani citizens free of charge upon arrival at Malé (Velana) International Airport."
};

const embassyInfo = {
  title: "High Commission of Maldives in Pakistan",
  address: "H No. 10, St No. 4, F-8/3, Islamabad, Pakistan",
  phone: "+92-51-2286903",
  email: "AdminPakistan@foreign.gov.mv",
  note: "For tourism, you do not need to contact the High Commission. The visa is granted on arrival."
};

// --- Maldives-Specific FAQs ---
const faqs = [
  {
    q: "Is the Maldives visa really free for Pakistani citizens?",
    a: "Yes, the 30-day tourist visa on arrival is 'gratis,' which means it is provided free of charge at the airport."
  },
  {
    q: "Do I need to apply for the visa before I fly?",
    a: "No. You do not need to apply for a visa beforehand. However, you *must* fill out the mandatory 'Traveller Declaration (IMUGA)' form online on the official Maldives Immigration website within 96 hours *before* your flight."
  },
  {
    q: "What do I need to show at the immigration counter?",
    a: "You must present your valid passport (6+ months), your confirmed return ticket, and your confirmed hotel/resort booking. You may also be asked to show proof of sufficient funds."
  }
];

// --- Maldives-Specific Reviews (focus on packages) ---
const reviews = [
  {
    name: "Usman & Ayesha",
    quote: "O.S. Travel & Tours booked our dream honeymoon to the Maldives. The overwater bungalow they found for us was paradise. Visa was easy, just as they said!",
    rating: 5
  },
  {
    name: "The Khan Family",
    quote: "We just came back from a family trip to the Maldives, all arranged by O.S. Travel. They handled the flights, resort booking, and speedboat transfers. 10/10 service.",
    rating: 5
  },
  {
    name: "Sobia K.",
    quote: "The visa on arrival was so simple! The O.S. Travel team just reminded me to fill out the online declaration form. They found me a great package deal.",
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
function Maldives() {
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
          src="https://flagcdn.com/w160/mv.png" // Maldives flag
          alt="Flag of Maldives"
          className="w-16 h-10 object-cover rounded shadow-md"
        />
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800">
            Maldives Visa
          </h1>
          <p className="text-xl text-gray-600">
            Visa on Arrival for Pakistani Citizens
          </p>
        </div>
      </motion.div>

      {/* 2. Visa Card Section */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1"
      >
        <VisaCard visa={visaOnArrival} />
      </motion.div>

      {/* 3. Embassy Information */}
      <motion.div
        variants={itemVariants}
        className="mt-12 bg-white p-6 md:p-8 rounded-lg shadow-lg"
      >
        <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <FaBuilding className="text-red-600" />
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
        <div className="mt-6 p-4 bg-green-50 border-l-4 border-green-400 text-green-800">
          <div className="flex items-center gap-3">
            <FaCheckCircle className="text-xl shrink-0" />
            <p className="font-semibold">{embassyInfo.note}</p>
          </div>
        </div>
      </motion.div>

      {/* 4. About O.S. Travel Section (Tailored for Packages) */}
      <motion.div
        variants={itemVariants}
        className="mt-12 bg-white p-6 md:p-8 rounded-lg shadow-lg"
      >
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Book Your <span className="text-blue-600">Maldives Dream Trip</span>
        </h2>
        <p className="text-lg text-gray-600 text-center mb-8 max-w-3xl mx-auto">
          Since the visa is on arrival, your main focus is planning the perfect trip. 
          <strong className="text-gray-800"> We deal in all-inclusive Maldives packages</strong>,
          from honeymoon trips to family vacations.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ServiceCard
            icon={<FaUmbrellaBeach className="text-yellow-500" />}
            title="Honeymoon Packages"
            desc="We design unforgettable honeymoon experiences in overwater bungalows."
          />
          <ServiceCard
            icon={<FaHotel className="text-purple-500" />}
            title="Resort Bookings"
            desc="Access to exclusive deals on all major resorts and guest houses."
          />
          <ServiceCard
            icon={<FaPlane className="text-green-500" />}
            title="Air Ticketing"
            desc="Finding you the best and cheapest flight options to Malé."
          />
          <ServiceCard
            icon={<FaPassport className="text-blue-500" />}
            title="Travel Guidance"
            desc="We ensure you have all correct documents & the IMUGA form submitted for smooth travel."
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
        <p>Visa on arrival is subject to approval by Maldives Immigration. Ensure you have all required documents.</p>
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
    <div className={`bg-white rounded-lg shadow-xl overflow-hidden border-t-8 border-green-500`}>
      <div className="p-6 md:p-8">
        
        {/* Card Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`text-4xl text-green-500`}><FaPlaneArrival /></div>
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
        </div>

        {/* Documents List */}
        <h3 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FaFileAlt className="text-gray-600" />
          Requirements at the Airport
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

export default Maldives;