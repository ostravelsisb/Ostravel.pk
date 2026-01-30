import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronDown, FaQuestionCircle } from "react-icons/fa";

// --- FAQ Data (Edit this to change questions) ---
const faqData = [
  {
    question: "Are you an official authorized visa agent?",
    answer: "Yes, O.S Travel & Tours is an authorized Dropbox agent for Malaysia, Thailand, and Vietnam. We are also ICA authorized for Singapore visa processing, ensuring a secure and direct application process."
  },
  {
    question: "Do you guarantee visa approval for Schengen or USA?",
    answer: "No ethical travel agency can guarantee a visa, as the final decision lies solely with the Embassy. However, our expert consultants have a high success rate because we meticulously prepare your file, cover letter, and interview responses to meet strict embassy standards."
  },
  {
    question: "What documents do I need for a Schengen Visa from Pakistan?",
    answer: "Generally, you need a valid passport, passport-sized photos, travel insurance (which we provide), flight reservation, hotel booking, bank statement (last 6 months), and proof of employment or business. We provide a detailed checklist based on your specific profile."
  },
  {
    question: "How long does the US B1/B2 visa process take?",
    answer: "The US visa process involves filling out the DS-160 form and scheduling an interview. Appointment wait times in Islamabad/Karachi vary (often several months). Once the interview is done, the passport is usually returned within 7-10 working days if approved."
  },
  {
    question: "Do you offer Hajj and Umrah packages?",
    answer: "Yes, we offer both Economy and 5-Star Luxury Hajj and Umrah packages. Our packages include visa processing, return flights, hotel accommodation near Haram, and transport services."
  },
  {
    question: "Can I book just a flight or hotel without a visa service?",
    answer: "Absolutely. We are a full-service travel agency. We can book domestic and international flights, worldwide hotels, and travel insurance independently of our visa services."
  },
  {
    question: "Where is O.S Travel & Tours located?",
    answer: "We are based in Islamabad, Pakistan. However, we serve clients from all over Pakistan via online processing, courier services, and phone consultations."
  },
  {
    question: "What is your refund policy if a visa is rejected?",
    answer: "Embassy fees are non-refundable by the government. Our service fees are generally non-refundable as they cover the consultation and file preparation work performed. However, specific terms may vary based on the package selected."
  }
];

// --- Schema.org Generator for SEO ---
const generateFAQSchema = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqData.map(item => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }))
  };
  return JSON.stringify(schema);
};

// --- Single Accordion Item Component ---
const FAQItem = ({ item, isOpen, onClick }) => {
  return (
    <motion.div 
      initial={false}
      className="border border-gray-200 rounded-lg bg-white overflow-hidden mb-4 shadow-sm hover:shadow-md transition-shadow duration-300"
    >
      <button
        onClick={onClick}
        className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <FaQuestionCircle className={`text-xl shrink-0 ${isOpen ? "text-blue-600" : "text-gray-400"}`} />
          <span className={`font-bold text-lg ${isOpen ? "text-blue-600" : "text-gray-800"}`}>
            {item.question}
          </span>
        </div>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-gray-400 ml-4 shrink-0"
        >
          <FaChevronDown />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="px-6 pb-6 pt-0 text-gray-600 leading-relaxed border-t border-gray-100 mt-2">
              <p className="pt-4">{item.answer}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// --- Main Section Component ---
const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(0); // First item open by default

  const handleItemClick = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const sectionVariant = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: "easeInOut" } 
    },
  };

  return (
    <motion.section
      variants={sectionVariant}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      className="py-16 md:py-24 bg-white"
    >
      {/* Inject JSON-LD Schema for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: generateFAQSchema() }}
      />

      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-600">
            Everything you need to know about our visa processing, flights, and tour services.
          </p>
        </div>

        <div className="flex flex-col">
          {faqData.map((item, index) => (
            <FAQItem
              key={index}
              item={item}
              isOpen={openIndex === index}
              onClick={() => handleItemClick(index)}
            />
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default FAQSection;