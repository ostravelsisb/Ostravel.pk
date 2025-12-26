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
// Data fetched directly from ostravels.com/schengen-visa-file-processing/turkey/

const eVisa = {
  title: "E-Visa (for Eligible Pakistanis)",
  subtitle: "Online (with Valid US/UK/Schengen Visa)",
  totalFee: "$100(Approx. - Varies)", // Fee taken from sticker visa
  processingTime: "1-2 Working Days", // E-visas are typically fast
  validity: "Varies",
  stay: "30 Days (Typically)",
  category: "Single Entry",
  documents: [
    "Scanned Passport copy (valid 6+ months)",
    "A valid, unexpired visa or residence permit from the USA, UK, Canada, or a Schengen country.",
    "Recent digital photo (white background)",
    "Confirmed Return Flight Ticket",
    "Confirmed Hotel Booking"
  ],
  note: "This is the fastest option ONLY if you hold a valid visa from one of the mentioned countries.",
  isSticker: false
};

const stickerVisa = {
  title: "Sticker Visa (Visit Visa)",
  subtitle: "From the Embassy",
  totalFee: "$180",
  serviceCharge: "PKR 12,000",
  processingTime: "15 to 18 Working Days",
  validity: "Varies",
  stay: "As per your itinerary",
  category: "Single Entry",
  documents: [
    "Original Passport (valid 6+ months)",
    "04 Pictures with White Background (35mm x 50mm)",
    "Online visa application",
    "Bank Statement with account maintenance certificate",
    "Visa Request Letter",
    "Return Air Ticket",
    "Hotel Booking",
    "FRC (Family Registration Certificate) or MRC",
    "Travel Insurance"
  ],
  note: "In Case Of Visa Refuse / Rejection Fee and Services Charges Will Not Be Refundable.",
  isSticker: true
};

const embassyInfo = {
  title: "Embassy of Turkey (Türkiye) in Islamabad",
  address: "Street 1, Diplomatic Enclave, G-5, 44000 Islamabad – Pakistan",
  phone: "+92 51 831 98 00 / +92 51 831 98 10",
  fax: "+92 51 227 76 71 / +92 51 227 87 52",
  email: "embassy.islamabad@mfa.gov.tr"
};

// --- Turkey-Specific FAQs ---
const faqs = [
  {
    q: "Can any Pakistani citizen get a Turkey e-visa?",
    a: "No. The Turkey e-visa is only available to Pakistani citizens who *already hold* a valid, unexpired visa or residence permit from the USA, UK, Canada, or any Schengen country. All other applicants must apply for a sticker visa."
  },
  {
    q: "What is the total fee for the sticker visa?",
    a: "The page lists the 'Turkey Visa Fee' as 55,000 PKR and 'File Services Charges' as 12,000 PKR. It's best to confirm the total package price with O.S. Travel & Tours."
  },
  {
    q: "Is an invitation letter required for a tourist sticker visa?",
    a: "No, an invitation letter is not listed under the 'Documents Required' for the tourist sticker visa. However, you do need a confirmed hotel booking and a return air ticket."
  }
];

// --- Turkey-Specific Reviews ---
const reviews = [
  {
    name: "Hassan A.",
    quote: "I had a valid UK visa, and O.S. Travel got my Turkey e-visa in just one day! I was shocked. Amazing, fast service. Highly recommended.",
    rating: 5
  },
  {
    name: "The Qureshi Family",
    quote: "We used O.S. Travel for our family trip to Istanbul. They handled the sticker visa applications for all four of us. The process was long, but they managed it professionally.",
    rating: 5
  },
  {
    name: "Sobia M.",
    quote: "Applied for a sticker visa. O.S. Travel was very clear about the documents, especially the bank statement. My file was strong, and the visa was approved. Thank you!",
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
function Turkey() {
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
          src="https://flagcdn.com/w160/tr.png" // Turkey flag
          alt="Flag of Turkey"
          className="w-16 h-10 object-cover rounded shadow-md"
        />
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800">
            Turkey Visa
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
        <VisaCard visa={eVisa} /> {/* Green border for E-Visa */}
        <VisaCard visa={stickerVisa} /> {/* Blue border for Sticker Visa */}
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
            <span><strong>Phone:</strong> <a href={`tel:${embassyInfo.phone.split(' / ')[0]}`} className="text-blue-600 hover:underline">{embassyInfo.phone}</a></span>
          </li>
          <li className="flex items-start gap-4">
            <FaFax className="text-gray-500 mt-1.5 shrink-0" />
            <span><strong>Fax:</strong> {embassyInfo.fax}</span>
          </li>
          <li className="flex items-start gap-4">
            <FaEnvelope className="text-gray-500 mt-1.5 shrink-0" />
            <span><strong>Email:</strong> <a href={`mailto:${embassyInfo.email}`} className="text-blue-600 hover:underline">{embassyInfo.email}</a></span>
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
          As the "best agent for Turkey visa in Pakistan," we provide expert guidance for both E-Visas and Sticker Visas.
          <strong className="text-gray-800"> We deal in a wide range of services</strong> to make your trip to Istanbul, Cappadocia, or Antalya unforgettable.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ServiceCard
            icon={<FaLaptopCode className="text-blue-500" />}
            title="E-Visa for Eligible"
            desc="We provide instant processing for the Turkey e-visa if you have a valid US, UK, or Schengen visa."
          />
          <ServiceCard
            icon={<FaPassport className="text-purple-500" />}
            title="Sticker Visa Processing"
            desc="Complete, expert file preparation for your sticker visa application to the embassy."
          />
          <ServiceCard
            icon={<FaPlane className="text-green-500" />}
            title="Air Ticketing"
            desc="Get the best fares on Turkish Airlines, Pegasus, and other carriers to Turkey."
          />
          <ServiceCard
            icon={<FaUmbrellaBeach className="text-yellow-500" />}
            title="Holiday Packages"
            desc="We create customized holiday and honeymoon packages, including hot air balloon trips!"
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
          <DetailItem icon={<FaMoneyBillWave className="text-green-600" />} label="Visa Fee" value={visa.totalFee} />
          <DetailItem icon={<FaClock className="text-red-600" />} label="Processing Time" value={visa.processingTime} />
          <DetailItem icon={<FaCalendarAlt className="text-blue-600" />} label="Validity" value={visa.validity} />
          <DetailItem icon={<FaCalendarAlt className="text-purple-600" />} label="Stay Duration" value={visa.stay} />
        </div>

        {/* Fee Breakdown (only for sticker visa) */}
        {visa.serviceCharge && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
            <p className="font-semibold">File Service Charges: {visa.serviceCharge}</p>
          </div>
        )}

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

export default Turkey;