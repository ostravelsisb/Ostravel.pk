import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaPassport, FaMoneyBillWave, FaClock, FaCalendarAlt, FaFileAlt,
  FaBuilding, FaEnvelope, FaPhone, FaCheckCircle, FaExclamationTriangle,
  FaChevronDown, FaStar, FaQuoteLeft, FaPlane, FaHotel, FaUmbrellaBeach, FaFax,
  FaMountain, FaBriefcase, FaCalendarCheck, FaCar, FaFileSignature, FaGavel,
  FaLaptopCode, FaPaw, FaSyringe,
} from 'react-icons/fa';

// Maps the icon-name string stored in Firestore back to the actual react-icon
// component. Add new entries here if a future country needs an icon that
// isn't in this list yet — the string must match the FaXxx name exactly.
const ICONS = {
  FaPassport, FaMoneyBillWave, FaClock, FaCalendarAlt, FaFileAlt, FaBuilding,
  FaEnvelope, FaPhone, FaCheckCircle, FaExclamationTriangle, FaChevronDown,
  FaStar, FaQuoteLeft, FaPlane, FaHotel, FaUmbrellaBeach, FaFax, FaMountain,
  FaBriefcase, FaCalendarCheck, FaCar, FaFileSignature, FaGavel, FaLaptopCode,
  FaPaw, FaSyringe,
};
const Icon = ({ name, className }) => {
  const Cmp = ICONS[name] || FaCheckCircle;
  return <Cmp className={className} />;
};

const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

/**
 * Renders a single country's visa page. `country` is the Firestore document
 * for that country (see the schema in scripts/upload-to-firestore.mjs).
 * This is a 1:1 layout match for the old per-country files (Nepal.jsx etc) —
 * same sections, same classNames — just fed by data instead of hardcoded.
 */
export default function CountryTemplate({ country }) {
  const {
    name, flagCode, applyKey,
    visaCards = [], officeInfos = [], faqs = [], reviews = [], serviceCards = [],
  } = country;

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
          src={`https://flagcdn.com/w160/${flagCode}.png`}
          alt={`Flag of ${name}`}
          className="w-16 h-10 object-cover rounded shadow-md"
        />
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800">{name} Visa</h1>
          <p className="text-xl text-gray-600">Visa Requirements for Pakistani Citizens</p>
        </div>
      </motion.div>

      {/* Apply Now Button */}
      <motion.div variants={itemVariants} className="mt-8 text-center">
        <button
          onClick={() => {
            sessionStorage.setItem('selected_visa_country', applyKey);
            window.location.href = '/apply-visa';
          }}
          className="inline-flex items-center gap-3 px-12 py-5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-xl font-black rounded-2xl shadow-2xl hover:shadow-emerald-500/50 hover:scale-105 transition-all duration-300"
        >
          <FaPassport className="text-2xl" />
          Apply for {name} Visa Now
          <span className="text-2xl">→</span>
        </button>
        <p className="text-sm text-gray-500 mt-4">Complete your application in minutes</p>
      </motion.div>

      {/* 2. Visa Card Section — one or more visa types */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 gap-8 mt-8">
        {visaCards.map((visa, i) => (
          <VisaCard key={i} visa={visa} />
        ))}
      </motion.div>

      {/* 3. Office Info — Embassy / Consulate / VFS / etc, one or more */}
      {officeInfos.map((office, i) => (
        <motion.div
          key={i}
          variants={itemVariants}
          className="mt-12 bg-white p-6 md:p-8 rounded-lg shadow-lg"
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <FaBuilding className="text-red-700" />
            {office.title || office.label}
          </h2>
          <ul className="space-y-4 text-gray-700 text-lg">
            {office.address && (
              <li className="flex items-start gap-4">
                <FaBuilding className="text-gray-500 mt-1.5 shrink-0" />
                <span><strong>Address:</strong> {office.address}</span>
              </li>
            )}
            {office.phone && (
              <li className="flex items-start gap-4">
                <FaPhone className="text-gray-500 mt-1.5 shrink-0" />
                <span>
                  <strong>Phone:</strong>{' '}
                  <a href={`tel:${office.phone.split(',')[0]}`} className="text-blue-600 hover:underline">
                    {office.phone}
                  </a>
                </span>
              </li>
            )}
            {office.fax && (
              <li className="flex items-start gap-4">
                <FaFax className="text-gray-500 mt-1.5 shrink-0" />
                <span><strong>Fax:</strong> {office.fax}</span>
              </li>
            )}
            {office.email && (
              <li className="flex items-start gap-4">
                <FaEnvelope className="text-gray-500 mt-1.5 shrink-0" />
                <span>
                  <strong>Email:</strong>{' '}
                  <a href={`mailto:${office.email.split(',')[0]}`} className="text-blue-600 hover:underline">
                    {office.email}
                  </a>
                </span>
              </li>
            )}
            {office.note && (
              <li className="flex items-start gap-4">
                <FaExclamationTriangle className="text-gray-500 mt-1.5 shrink-0" />
                <span>{office.note}</span>
              </li>
            )}
          </ul>
        </motion.div>
      ))}

      {/* 4. About O.S. Travel Section */}
      {serviceCards.length > 0 && (
        <motion.div variants={itemVariants} className="mt-12 bg-white p-6 md:p-8 rounded-lg shadow-lg">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            Why Book with <span className="text-blue-600">O.S. Travel & Tours</span>?
          </h2>
          <p className="text-lg text-gray-600 text-center mb-8 max-w-3xl mx-auto">
            As the "Recommended Visa Agency for {name} visa," we provide fast and efficient processing.
            <strong className="text-gray-800"> We deal in a wide range of services</strong> to make your trip a reality.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {serviceCards.map((s, i) => (
              <ServiceCard key={i} icon={<Icon name={s.icon} className="text-blue-500" />} title={s.title} desc={s.desc} />
            ))}
          </div>
        </motion.div>
      )}

      {/* 5. FAQ Section */}
      {faqs.length > 0 && (
        <motion.div variants={itemVariants} className="mt-12 bg-white rounded-lg shadow-lg overflow-hidden">
          <h2 className="text-3xl font-bold text-gray-800 p-6 md:p-8">Frequently Asked Questions</h2>
          <div className="border-t border-gray-200">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} q={faq.q} a={faq.a} />
            ))}
          </div>
        </motion.div>
      )}

      {/* 6. Review Section */}
      {reviews.length > 0 && (
        <motion.div variants={itemVariants} className="mt-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">What Our Clients Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((review, i) => (
              <ReviewCard key={i} review={review} />
            ))}
          </div>
        </motion.div>
      )}

      {/* Footer Note */}
      <motion.div variants={itemVariants} className="text-center mt-10 text-sm text-gray-500">
        <p>All fees and processing times are from O.S. Travel & Tours and are subject to change.</p>
      </motion.div>
    </motion.div>
  );
}

// --- Reusable Sub-components (identical to the originals) ---

const VisaCard = ({ visa }) => (
  <div className="bg-white rounded-lg shadow-xl overflow-hidden border-t-8 border-blue-500">
    <div className="p-6 md:p-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="text-4xl text-blue-500"><FaPassport /></div>
        <div>
          <h2 className="text-3xl font-bold text-gray-800">{visa.title}</h2>
          <p className="text-lg text-gray-500">{visa.subtitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-6 pt-4 border-t border-gray-100">
        <DetailItem icon={<FaMoneyBillWave className="text-green-600" />} label="Visa Fee" value={visa.totalFee} />
        <DetailItem icon={<FaClock className="text-red-600" />} label="Processing Time" value={visa.processingTime} />
        <DetailItem icon={<FaCalendarAlt className="text-blue-600" />} label="Validity" value={visa.validity} />
        <DetailItem icon={<FaCalendarAlt className="text-purple-600" />} label="Stay Duration" value={visa.stay} />
        <DetailItem icon={<FaPassport className="text-gray-600" />} label="Category" value={visa.category} />
      </div>

      {visa.documents?.length > 0 && (
        <>
          <h3 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaFileAlt className="text-gray-600" />
            Documents Required
          </h3>
          <ul className="space-y-3 mb-6">
            {visa.documents.map((doc, i) => (
              <li key={i} className="flex items-start gap-3 text-gray-700">
                <FaCheckCircle className="text-green-500 mt-1.5 shrink-0" />
                <span>{doc}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      {visa.note && (
        <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800">
          <div className="flex items-center gap-3">
            <FaExclamationTriangle className="text-xl shrink-0" />
            <p className="font-semibold">{visa.note}</p>
          </div>
        </div>
      )}
    </div>
  </div>
);

const DetailItem = ({ icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="text-2xl text-gray-600 mt-1 shrink-0">{icon}</div>
    <div>
      <p className="text-sm font-semibold text-gray-500">{label}</p>
      <p className="text-lg font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

const AccordionItem = ({ q, a }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-gray-200">
      <button onClick={() => setIsOpen(!isOpen)} className="flex justify-between items-center w-full p-6 text-left">
        <span className="text-lg font-semibold text-gray-800">{q}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }} className="text-gray-500">
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

const ServiceCard = ({ icon, title, desc }) => (
  <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg text-center flex flex-col items-center">
    <div className="text-4xl mb-4">{icon}</div>
    <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
    <p className="text-gray-600">{desc}</p>
  </div>
);

const ReviewCard = ({ review }) => (
  <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col">
    <FaQuoteLeft className="text-3xl text-blue-500 mb-4" />
    <p className="text-gray-600 italic mb-6 grow">"{review.quote}"</p>
    <div className="flex items-center justify-between">
      <span className="text-lg font-semibold text-gray-800">{review.name}</span>
      <div className="flex">
        {[...Array(review.rating)].map((_, i) => <FaStar key={i} className="text-yellow-400" />)}
      </div>
    </div>
  </div>
);
