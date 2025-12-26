import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Icons (from react-icons) ---
import {
  FaPassport, FaMoneyBillWave, FaClock, FaCalendarAlt, FaFileAlt,
  FaBuilding, FaEnvelope, FaPhone, FaCheckCircle, FaExclamationTriangle,
  FaChevronDown, FaStar, FaQuoteLeft, FaPlane, FaHotel, FaUmbrellaBeach,
  FaFileSignature, // Icon for File Processing
  FaFax
} from 'react-icons/fa';

// --- Page Data ---

const stickerVisa = {
  title: "Egypt Sticker Visa",
  subtitle: "Embassy File Processing",
  totalFee: "PKR 20,000", // As per your text
  processingTime: "6 to 7 Weeks", // As per your text
  validity: "3 Months",
  stay: "Max 1 Month",
  category: "Single Entry",
  // Standard Documents
  documents: [
    "Original Passport (valid 6+ months)",
    "CNIC Copy",
    "4 Pictures (2x2, White Background)",
    "6-month Bank Statement (Closing Balance: 1 Million)",
    "Bank Account Maintenance Letter",
    "FRC (Family Registration Certificate)",
    "Covid-19 Vaccination Certificate",
    "Polio Vaccination Card",
    "Dengue Test Report"
  ],
  // Extra Requirements
  extraDocs: [
    "Business Person: NTN + Tax Returns + Chamber Cert + 4 Letterheads (Sign/Stamp)",
    "Job Person: 3 Salary Slips + Job Conf. Letter + 3 Company Letterheads (Sign/Stamp) + Company Tax/Chamber Docs"
  ],
  note: "In Case Of Visa Refuse / Rejection Fee and Services Charges Will Not Be Refundable.",
  isSticker: true
};

const embassyInfo = {
  title: "Egypt Consulate In Islamabad",
  address: "Plot no. 38-51, UN Boulevard, Diplomatic Enclave, Islamabad, Pakistan",
  phone: "+92 (51) 2209072 / 2209082",
  fax: "(+92) 51 2279552",
  email: "Egynet@isb.comsats.net.pk"
};

// --- Egypt-Specific FAQs ---
const faqs = [
  {
    q: "Is the Egypt E-Visa available for Pakistanis?",
    a: "No. The Egypt E-Visa is currently not available for Pakistani citizens. You must apply for a sticker visa through the consulate, which requires a detailed file preparation."
  },
  {
    q: "What is the bank balance requirement?",
    a: "As per the latest requirements, you need a 6-month bank statement with a closing balance of at least PKR 1 Million (10 Lac)."
  },
  {
    q: "Why is the processing time so long?",
    a: "The standard processing time is now 6 to 7 weeks. This is due to the verification processes by the Egyptian authorities. We recommend applying at least 2 months before your intended travel."
  },
  {
    q: "Is the Dengue Test mandatory?",
    a: "Yes, a Dengue Test report is a mandatory medical document for the Egypt visa application from Pakistan."
  }
];

// --- Egypt-Specific Reviews ---
const reviews = [
  {
    name: "Tariq J.",
    quote: "The Egypt visa process is very long (took about 7 weeks), but O.S. Travel handled it perfectly. They helped me with the Dengue test and the bank letter. Got my visa!",
    rating: 5
  },
  {
    name: "Sana A.",
    quote: "I highly recommend their service. I was worried about the 1 Million balance requirement, but they guided me on how to present my financial documents correctly.",
    rating: 5
  },
  {
    name: "Zubair Enterprises",
    quote: "We sent our staff for a business trip. O.S. Travel knew exactly what documents were needed for 'Job Persons' vs 'Business Persons'. Very professional.",
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
function Egypt() {
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
          src="https://flagcdn.com/w160/eg.png" // Egypt flag
          alt="Flag of Egypt"
          className="w-16 h-10 object-cover rounded shadow-md"
        />
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800">
            Egypt Visa
          </h1>
          <p className="text-xl text-gray-600">
            Sticker Visa Processing for Pakistani Citizens
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
          <FaBuilding className="text-yellow-700" />
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
          Obtaining an Egypt visa requires specific documentation and takes time. As a trusted travel agent,
          <strong className="text-gray-800"> we deal in complete visa file processing</strong> to ensure your application is accurate and approved.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ServiceCard
            icon={<FaPassport className="text-blue-500" />}
            title="Expert File Prep"
            desc="We compile your file including the mandatory 4 letterheads for business/job applicants."
          />
          <ServiceCard
            icon={<FaFileAlt className="text-purple-500" />}
            title="Document Guidance"
            desc="We guide you on the Dengue test, Polio card, and bank maintenance certificate."
          />
          <ServiceCard
            icon={<FaPlane className="text-green-500" />}
            title="Air Ticketing"
            desc="Get the best fares on EgyptAir, Emirates, and other carriers to Cairo (CAI)."
          />
          <ServiceCard
            icon={<FaHotel className="text-yellow-500" />}
            title="Tour Packages"
            desc="We create complete, customized holiday packages to see the Pyramids, Luxor, and more."
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
        <p>Visa approval is at the sole discretion of the Embassy of Egypt. O.S. Travel & Tours provides expert file preparation services.</p>
      </motion.div>

    </motion.div>
  );
}

// --- Reusable Sub-components ---

/**
 * A card component to display details for the File Processing service.
 */
const VisaCard = ({ visa }) => {
  return (
    <div className={`bg-white rounded-lg shadow-xl overflow-hidden border-t-8 border-blue-600`}>
      <div className="p-6 md:p-8 flex flex-col h-full">
        
        {/* Card Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`text-4xl text-blue-600`}><FaFileSignature /></div>
          <div>
            <h2 className="text-3xl font-bold text-gray-800">{visa.title}</h2>
            <p className="text-lg text-gray-500">{visa.subtitle}</p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4 mb-6 pt-4 border-t border-gray-100">
          <DetailItem icon={<FaMoneyBillWave className="text-green-600" />} label="Total Charges" value={visa.totalFee} />
          <DetailItem icon={<FaClock className="text-red-600" />} label="Processing Time" value={visa.processingTime} />
          <DetailItem icon={<FaCalendarAlt className="text-blue-600" />} label="Validity" value={visa.validity} />
        </div>

        {/* Documents List */}
        <h3 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FaFileAlt className="text-gray-600" />
          Standard Documents
        </h3>
        <ul className="space-y-3 mb-6">
          {visa.documents.map((doc, index) => (
            <li key={index} className="flex items-start gap-3 text-gray-700">
              <FaCheckCircle className="text-green-500 mt-1.5 shrink-0" />
              <span>{doc}</span>
            </li>
          ))}
        </ul>

        {/* Extra Documents (Business/Job) */}
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FaFileAlt className="text-purple-600" />
          Specific Requirements
        </h3>
        <ul className="space-y-3 mb-6 grow">
           {visa.extraDocs.map((doc, index) => (
            <li key={index} className="flex items-start gap-3 text-gray-700">
              <FaExclamationTriangle className="text-purple-500 mt-1.5 shrink-0" />
              <span>{doc}</span>
            </li>
          ))}
        </ul>

        {/* Note */}
        <div className={`p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800`}>
            <div className="flex items-center gap-3">
              <FaExclamationTriangle className="text-xl shrink-0" />
              <p className="font-semibold">{visa.note}</p>
            </div>
        </div>

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

export default Egypt;