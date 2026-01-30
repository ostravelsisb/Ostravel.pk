import React from 'react';
import { motion } from 'framer-motion';
// Using the corrected icons from previous steps + added a few more for the expanded sections
import { 
    FaShieldAlt, FaPlane, FaLock, FaUser, 
    FaUsers, FaReceipt, FaCookieBite, FaPassport, 
    FaHeadset, FaGlobeAsia, FaExclamationTriangle 
} from 'react-icons/fa';
import { IoDocumentTextOutline, IoCalendarOutline, IoCheckmarkCircleOutline } from 'react-icons/io5';
import { Link } from 'react-router-dom';

// --- ANIMATION VARIANTS ---
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
        opacity: 1, 
        transition: { staggerChildren: 0.1 } 
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
        opacity: 1, 
        y: 0, 
        transition: { duration: 0.5, ease: "easeOut" } 
    }
};

export default function PrivacyPolicyPage() {
    
    // Expanded Data Structure with SEO-friendly content and Local Context (CNIC, NADRA, etc.)
    const policySections = [
        {
            title: "Privacy & Data Protection",
            description: "How we collect, use, and protect your personal data in compliance with international travel regulations.",
            icon: FaShieldAlt,
            color: "text-blue-600",
            bg: "bg-blue-50",
            content: [
                {
                    heading: "1. Collection of Personal Information",
                    icon: FaUser,
                    details: "To facilitate your travel arrangements, we collect specific personal details including your full Name, CNIC (for Pakistani citizens), Passport Number, Date of Birth, and Contact Information. For visa processing, we may require additional financial documents or family registration certificates (FRC) as mandated by embassies."
                },
                {
                    heading: "2. Usage for Booking & Ticketing",
                    icon: FaPlane,
                    details: "Your data is transmitted securely to Global Distribution Systems (GDS), Airlines (e.g., PIA, Emirates, Qatar Airways), and Hotel Aggregators to confirm your reservations. We do not use your data for unrelated marketing without your explicit consent."
                },
                {
                    heading: "3. Third-Party Disclosure",
                    icon: FaUsers,
                    details: "We share necessary data with third-party service providers such as Visa Processing Centers, Travel Insurance providers, and Ground Handling agencies. All partners are vetted to ensure they adhere to strict data privacy standards."
                },
                {
                    heading: "4. Payment Security (SSL/3D Secure)",
                    icon: FaLock,
                    details: "All online transactions are processed through secure gateways using industry-standard SSL encryption. We do not store your complete credit card details on our servers; they are handled directly by banking partners."
                },
                {
                    heading: "5. Cookies & Digital Experience",
                    icon: FaCookieBite,
                    details: "Our website uses cookies to enhance your browsing experience, remember your flight search history, and provide personalized travel recommendations. You can manage cookie preferences in your browser settings."
                }
            ]
        },
        {
            title: "Terms & Conditions of Booking",
            description: "The legal agreement governing flight tickets, hotel vouchers, and tour packages.",
            icon: IoDocumentTextOutline,
            color: "text-teal-600",
            bg: "bg-teal-50",
            content: [
                {
                    heading: "1. Flight Fares & Pricing",
                    icon: FaReceipt,
                    details: "Fares are dynamic and subject to change without prior notice until the ticket is issued. A booking confirmation email is not a ticket. The ticket is only generated after full payment is received and verified."
                },
                {
                    heading: "2. Visa Processing & Approvals",
                    icon: FaPassport,
                    details: "While we assist with visa applications, the final decision lies solely with the respective Embassy or Consulate. We are not liable for visa rejections, delays, or offloading at the airport due to invalid documents. Visa fees are strictly non-refundable."
                },
                {
                    heading: "3. Cancellation & Refund Policy",
                    icon: IoCalendarOutline,
                    details: "Refunds are processed according to the specific Airline or Hotel policy. Promo fares are often non-refundable. Service charges applied by the agency are non-refundable. Refund processing can take 15-45 working days depending on the airline."
                },
                {
                    heading: "4. Traveler Responsibilities",
                    icon: FaGlobeAsia,
                    details: "Passengers must ensure their Passport is valid for at least 6 months beyond the travel date. It is the traveler's responsibility to check health requirements (e.g., Polio cards, COVID-19 vaccination) for their destination."
                },
                {
                    heading: "5. Limitation of Liability",
                    icon: FaExclamationTriangle,
                    details: "We act as an intermediary agent. We are not responsible for flight delays, cancellations, baggage loss, or acts of God (force majeure) affecting your trip. However, our support team will assist you in managing these situations."
                }
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
            
            {/* --- HERO SECTION --- */}
            {/* styled to look like a premium corporate header */}
            <div className="relative bg-blue-900 text-white pt-24 pb-32 px-4 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10">
                    <FaPlane className="absolute top-10 right-10 w-64 h-64 transform rotate-12" />
                    <FaGlobeAsia className="absolute bottom-[-50px] left-[-50px] w-80 h-80" />
                </div>
                
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-5xl mx-auto text-center relative z-10"
                >
                    <div className="inline-flex items-center gap-2 bg-blue-800/50 px-4 py-2 rounded-full mb-6 border border-blue-700 backdrop-blur-sm">
                        <IoCheckmarkCircleOutline className="text-teal-400" />
                        <span className="text-sm font-medium tracking-wide text-blue-100">Verified & Trusted Agency</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
                        Legal Documentation & <br className="hidden md:block" /> 
                        <span className="text-teal-400">Traveler Policies</span>
                    </h1>
                    <p className="text-lg md:text-xl text-blue-200 max-w-3xl mx-auto leading-relaxed">
                        Transparency is the foundation of your journey. Please review our policies regarding privacy, booking conditions, and refunds to ensure a smooth travel experience.
                    </p>
                    <p className="mt-8 text-sm text-blue-400 font-mono">
                        Last Updated: December 2, 2025
                    </p>
                </motion.div>
            </div>

            {/* --- MAIN CONTENT --- */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-20 pb-20 relative z-20">
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                >
                    {policySections.map((section) => (
                        <motion.div 
                            key={section.title}
                            variants={itemVariants}
                            className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden flex flex-col"
                        >
                            {/* Card Header */}
                            <div className={`p-8 border-b border-slate-100 ${section.bg}`}>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className={`p-3 rounded-xl bg-white shadow-sm ${section.color}`}>
                                        <section.icon className="w-8 h-8" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-800">{section.title}</h2>
                                </div>
                                <p className="text-slate-600 leading-relaxed">
                                    {section.description}
                                </p>
                            </div>

                            {/* Card Content */}
                            <div className="p-8 grow bg-white">
                                <ul className="space-y-8">
                                    {section.content.map((item, idx) => (
                                        <li key={idx} className="relative pl-0">
                                            <div className="flex items-start gap-4">
                                                <div className="mt-1 shrink-0">
                                                    <item.icon className={`w-5 h-5 ${section.color} opacity-80`} />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                                                        {item.heading}
                                                    </h3>
                                                    <p className="text-slate-600 text-sm leading-7">
                                                        {item.details}
                                                    </p>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* --- FOOTER CTA / SUPPORT --- */}
               
            </div>
        </div>
    );
}