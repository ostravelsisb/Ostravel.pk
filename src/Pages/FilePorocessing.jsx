
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
// --- Icons (from react-icons) ---
import {
  FaPassport,
  FaFileSignature,
  FaCalendarCheck,
  FaGlobeEurope,
  FaStar,
  FaCheckCircle,
  FaLightbulb,
  FaListUl,
  FaComments,
  FaChevronDown,
  FaQuoteLeft,
  FaEnvelope,
  FaPhone,
  FaBuilding,
} from 'react-icons/fa';

// --- Animation Variants ---
const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

const sectionVariant = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeInOut",
      staggerChildren: 0.1,
    },
  },
};

const gridContainerVariant = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const gridItemVariant = {
  hidden: { opacity: 0, scale: 0.8, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0 },
};

// --- Reusable Country Card Component ---
const CountryCard = ({ name, code, to }) => (
  <motion.div variants={gridItemVariant}>
    <Link
      to={to}
      className="block bg-white rounded-lg shadow-lg overflow-hidden h-full group transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5 border border-gray-200 hover:border-blue-500"
    >
      <div className="w-full h-40 overflow-hidden">
        <img
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          src={`https://flagcdn.com/w320/${code.toLowerCase()}.png`}
          alt={`${name} Flag`}
        />
      </div>
      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-300">
          {name}
        </h3>
      </div>
    </Link>
  </motion.div>
);

// --- Reusable Process Step Card Component ---
const ProcessStepCard = ({ icon, title, desc }) => (
  <motion.div
    variants={gridItemVariant}
    className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-blue-500"
  >
    <div className="flex items-center gap-4 mb-3">
      <div className="text-3xl text-blue-500 shrink-0">{icon}</div>
      <h3 className="text-xl font-bold text-gray-900">{title}</h3>
    </div>
    <p className="text-gray-600">{desc}</p>
  </motion.div>
);

// --- Data Arrays for Countries ---
const topTierCountries = [
  { name: "USA", code: "us", to: "/Countries/united-states" },
  { name: "United Kingdom", code: "gb", to: "/Countries/united-kingdom" },
  { name: "Canada", code: "ca", to: "/Countries/canada" },
  { name: "Australia", code: "au", to: "/Countries/australia" },
  { name: "Ireland", code: "ie", to: "/Countries/ireland" },
  { name: "South Africa", code: "za", to: "/Countries/south-africa" },
];

const schengenCountries = [
  { name: "Austria", code: "at", to: "/Countries/austria" },
  { name: "Belgium", code: "be", to: "/Countries/belgium" },
  { name: "Bulgaria", code: "bg", to: "/Countries/bulgaria" },
  { name: "Czech Republic", code: "cz", to: "/Countries/czechrepublic" },
  { name: "Denmark", code: "dk", to: "/Countries/denmark" },
  { name: "Estonia", code: "ee", to: "/Countries/estonia" },
  { name: "Finland", code: "fi", to: "/Countries/finland" },
  { name: "France", code: "fr", to: "/Countries/france" },
  { name: "Germany", code: "de", to: "/Countries/germany" },
  { name: "Greece", code: "gr", to: "/Countries/greece" },
  { name: "Hungary", code: "hu", to: "/Countries/hungary" },
  { name: "Italy", code: "it", to: "/Countries/italy" },
  { name: "Lithuania", code: "lt", to: "/Countries/lithuania" },
  { name: "Netherlands", code: "nl", to: "/Countries/netherlands" },
  { name: "Norway", code: "no", to: "/Countries/norway" },
  { name: "Poland", code: "pl", to: "/Countries/poland" },
  { name: "Portugal", code: "pt", to: "/Countries/portugal" },
  { name: "Romania", code: "ro", to: "/Countries/romania" },
  { name: "Spain", code: "es", to: "/Countries/spain" },
  { name: "Switzerland", code: "ch", to: "/Countries/switzerland" },
];

// --- FAQs ---
const faqs = [
  {
    q: "What is 'Visa File Processing'?",
    a: "This is our premium service for complex visa applications (like Schengen, USA, UK). Instead of just advice, we handle the *entire* process for you: filling the complex official forms, arranging all supporting documents (like flight/hotel bookings & insurance), and scheduling your mandatory in-person appointment (Biometrics)."
  },
  {
    q: "Why do I need this service? Can't I apply myself?",
    a: "You can, but these applications are difficult and often refused due to small mistakes. A single error on the form or a missing document leads to visa rejection and loss of fees. As expert consultants, we ensure your file is 'decision-ready,' perfect, and has the highest possible chance of success."
  },
  {
    q: "What is a Schengen visa?",
    a: "A Schengen visa is a single visa that allows you to travel to all 29 member countries in Europe (like France, Germany, Italy, etc.). You must apply at the embassy of your *main* destination. We help you build the perfect file and itinerary for this."
  }
];

// --- Reviews ---
const reviews = [
  {
    name: "Tariq M.",
    quote: "The US visa interview is stressful, but O.S. Travel prepared me perfectly. They handled my DS-160 form and all documents. My visa was approved!",
    rating: 5
  },
  {
    name: "Waqar A.",
    quote: "The Canada visa process is very long, but O.S. Travel are true professionals. They built a very strong file for me and I got my 10-year visa. Thank you!",
    rating: 5
  },
  {
    name: "Amina K.",
    quote: "O.S. Travel is the best for Schengen visas. They prepared my entire file for my Greece (Santorini) trip. I was so worried, but they handled everything. Got my visa!",
    rating: 5
  }
];

// --- Main Component ---
// Corrected function name from FilePorocessing to FileProcessing
function FilePorocessing() {

  useEffect(()=>{
    document.title = "Visa Porcessing Os Travels and Tours"
  },[])
  return (
    <div className="w-full bg-white overflow-x-hidden">
      {/* 1. Hero Section */}
      <motion.div
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        className="relative w-full h-[450px]"
      >
        {/* Image of visa documents and a passport */}
        <img
          src="https://images.unsplash.com/photo-1556742502-0c0f9b09204e?q=80&w=2070&auto=format&fit=crop"
          alt="Visa application forms and passport"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-blue-900 bg-opacity-70" />
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-4xl md:text-6xl font-extrabold text-white mb-4"
          >
            Expert Visa File Processing
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-xl md:text-2xl text-white opacity-90 max-w-3xl"
          >
            We handle the complex paperwork and appointment scheduling for Schengen, USA, UK, Canada, and more, so you don't have to.
          </motion.p>
        </div>
      </motion.div>

      {/* 2. Main Content Area */}
      <div className="max-w-7xl mx-auto px-6">

        {/* --- What is File Processing? Section --- */}
        <motion.section
          variants={sectionVariant}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="py-16 md:py-20"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              What is Our Visa File Processing Service?
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              This is our premium, all-inclusive service for complex visas that require in-person appointments (like Schengen, USA, UK, Canada). We are expert visa consultants who manage the entire process from start to finish.
            </p>
          </div>
          <motion.div
            variants={gridContainerVariant}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <ProcessStepCard
              icon={<FaLightbulb />}
              title="1. Consultation & Strategy"
              desc="We assess your profile, select the right visa category, and build a strategy to create the strongest possible application."
            />
            <ProcessStepCard
              icon={<FaListUl />}
              title="2. Document Preparation"
              desc="We provide a precise checklist and help you prepare all documents, including bank statements, FRC, and employment letters."
            />
            <ProcessStepCard
              icon={<FaFileSignature />}
              title="3. Form Filling & Booking"
              desc="We expertly fill the complex online application forms (like DS-160, IRCC) and provide flight, hotel, and insurance for your file."
            />
            <ProcessStepCard
              icon={<FaCalendarCheck />}
              title="4. Appointment & Handover"
              desc="We schedule your mandatory VFS/Embassy appointment for biometrics and hand over a 'decision-ready' file for you to submit."
            />
          </motion.div>
        </motion.section>

        {/* --- Top-Tier Countries Section --- */}
        <motion.section
          variants={sectionVariant}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="py-16 md:py-20 bg-gray-50 -mx-6 px-6" // Alternating background
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-center items-center gap-4 mb-4">
              <div className="text-4xl text-blue-600"><FaPassport /></div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
                USA, UK, Canada & Australia
              </h2>
            </div>
            <p className="text-center text-lg text-gray-600 max-w-3xl mx-auto mb-12">
              These are the most complex, interview-based visa applications. Our expert file processing and interview coaching give you the highest chance of approval.
            </p>
            <motion.div
              variants={gridContainerVariant}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6"
            >
              {topTierCountries.map((country) => (
                <CountryCard
                  key={country.code}
                  name={country.name}
                  code={country.code}
                  to={country.to}
                />
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* --- Schengen Section --- */}
        <motion.section
          variants={sectionVariant}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="py-16 md:py-20 bg-white -mx-6 px-6" // Alternating background
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-center items-center gap-4 mb-4">
              <div className="text-4xl text-blue-600"><FaGlobeEurope /></div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
                Schengen Visa: File & Appointment
              </h2>
            </div>
            <p className="text-center text-lg text-gray-600 max-w-3xl mx-auto mb-12">
              We are your specialists for all 29 Schengen Area countries. We prepare one perfect file for your VFS/BLS appointment, including insurance, itineraries, and more.
            </p>
            <motion.div
              variants={gridContainerVariant}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6"
            >
              {schengenCountries.map((country) => (
                <CountryCard
                  key={country.code}
                  name={country.name}
                  code={country.code}
                  to={country.to}
                />
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* 5. FAQ Section (The "Dropbox") */}
        <motion.section
          variants={sectionVariant}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="py-16 md:py-20 bg-gray-50 -mx-6 px-6" // Alternating background
        >
          <div className="max-w-4xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Frequently Asked Questions
              </h2>
            </div>
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} q={faq.q} a={faq.a} />
              ))}
            </div>
          </div>
        </motion.section>

        {/* 6. Review Section */}
        <motion.section
          variants={sectionVariant}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="py-16 md:py-20 bg-white -mx-6 px-6" // Alternating background
        >
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">
              What Our Clients Say
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {reviews.map((review, index) => (
                <ReviewCard key={index} review={review} />
              ))}
            </div>
          </div>
        </motion.section>

      </div>
    </div>
  );
}

// --- Reusable Sub-components (Accordion, Review Card) ---

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

/**
 * A reusable card for client reviews.
 */
const ReviewCard = ({ review }) => (
  <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col border-t-4 border-blue-500">
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

export default FilePorocessing; // Corrected spelling