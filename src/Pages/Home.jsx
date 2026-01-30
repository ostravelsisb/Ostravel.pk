import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// --- Form Components ---
import Flights from "../SildeComponents/Flights";
import VisaForm from "../SildeComponents/VisaFrorm";
import Hotelform from "../SildeComponents/Hotelform";
import InsurenceForm from "../SildeComponents/InsurenceForm";
import Seopage from "../SildeComponents/Seopage";
import FAQSection from "../SildeComponents/FAQSection"

// --- Icons ---
import {
  MdLocalHotel,
  MdFlight,
  MdOutlineSecurity,
  MdOutlineArticle,
} from "react-icons/md";
import {
  FaPassport,
  FaFileSignature,
  FaStar,
  FaKaaba,
  FaPlane,
  FaQuoteLeft,
  FaCheckCircle,
  FaHotel,
  FaGlobeEurope,
  FaGlobeAsia,
  FaChevronDown,
} from "react-icons/fa";
import PrivacyPolicyPage from "./PrivacyPolicyPage";

// --- Animation Variants ---
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
      staggerChildren: 0.1,
    },
  },
};

const gridItemVariant = {
  hidden: { opacity: 0, scale: 0.9, y: 30 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
    },
  },
};

// --- Main Nav for Hero Section ---
const mainNavItems = [
  { name: "Hotels", icon: <MdLocalHotel /> },
  { name: "Insurance", icon: <MdOutlineSecurity /> },
  { name: "Visa", icon: <MdOutlineArticle /> },
  { name: "Flights", icon: <MdFlight /> },
];

// --- Data for Dropbox Countries ---
const dropboxCountries = [
  { name: "Malaysia", code: "my", to: "/Countries/malaysia" },
  { name: "Thailand", code: "th", to: "/Countries/thailand" },
  { name: "Indonesia", code: "id", to: "/Countries/indonesia" },
  { name: "Vietnam", code: "vn", to: "/Countries/vietnam" },
];

// --- MAIN HOME COMPONENT ---
function Home() {
  const [activeMainTab, setActiveMainTab] = useState("Visa");

  // --- NEW: Loading State for Splash Screen (Session Persist) ---
  const [isLoading, setIsLoading] = useState(() => {
    // Check if user has already seen the splash screen in this session
    return !sessionStorage.getItem("hasSeenSplash");
  });

  // --- NEW: Timer to remove Splash Screen ---
  useEffect(() => {
    if (isLoading) {
      // Show splash screen for 2.8 seconds, then show website
      const timer = setTimeout(() => {
        setIsLoading(false);
        sessionStorage.setItem("hasSeenSplash", "true"); // Mark as seen
      }, 2800);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  const isFormOpen = activeMainTab !== null;

  const formVariants = {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, y: 20, transition: { duration: 0.2, ease: "easeIn" } },
  };

  const handleTabClick = (tabName) => {
    if (activeMainTab === tabName) {
      setActiveMainTab(null);
    } else {
      setActiveMainTab(tabName);
    }
  };

  const renderSearchForm = () => {
    if (activeMainTab === null) return null;
    switch (activeMainTab) {
      case "Hotels":
        return <motion.div key="hotels" variants={formVariants} initial="initial" animate="animate" exit="exit"><Hotelform /></motion.div>;
      case "Flights":
        return <motion.div key="flights" variants={formVariants} initial="initial" animate="animate" exit="exit"><Flights /></motion.div>;
      case "Visa":
        return <motion.div key="visa" variants={formVariants} initial="initial" animate="animate" exit="exit"><VisaForm /></motion.div>;
      case "Insurance":
        return <motion.div key="insurance" variants={formVariants} initial="initial" animate="animate" exit="exit"><InsurenceForm /></motion.div>;
      default:
        return null;
    }
  };

  useEffect(() => {
    document.title = "Home - O.S Travel & Tours";
  }, []);

  return (
    <>
      <AnimatePresence mode="wait">
        {/* --- 1. INTRO SPLASH SCREEN --- */}
        {isLoading ? (
          <motion.div
            key="splash-screen"
            className="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-blue-600"
            initial={{ opacity: 1 }}
            exit={{ y: -1000, opacity: 1, transition: { duration: 0.8, ease: "easeInOut" } }} // Slide up exit
          >
            {/* Animated Icons Container */}
            <div className="relative w-32 h-32 mb-8">
              {/* Spinning Globe */}
              <motion.div
                initial={{ rotate: 0, opacity: 0, scale: 0.5 }}
                animate={{ rotate: 360, opacity: 1, scale: 1 }}
                transition={{ duration: 2, ease: "easeOut" }}
                className="absolute inset-0 flex items-center justify-center text-blue-200"
              >
                <FaGlobeAsia className="text-8xl opacity-30" />
              </motion.div>

              {/* Plane Flying In */}
              <motion.div
                initial={{ x: -100, y: 50, opacity: 0, scale: 0.5 }}
                animate={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                transition={{ duration: 1.5, ease: "backOut", delay: 0.2 }}
                className="absolute inset-0 flex items-center justify-center text-white drop-shadow-lg"
              >
                <FaPlane className="text-7xl transform -rotate-45" />
              </motion.div>
            </div>

            {/* Text Animation */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="text-white text-2xl font-light tracking-widest mb-2"
            >
              WELCOME TO
            </motion.h1>

            <motion.h2
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.5, duration: 0.5, type: "spring" }}
              className="text-white text-4xl md:text-5xl font-extrabold tracking-tight text-center px-4"
            >
              O.S TRAVEL & TOURS
            </motion.h2>

            {/* Loading Dots */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
              className="mt-8 flex gap-2"
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-3 h-3 bg-white rounded-full"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </motion.div>
          </motion.div>
        ) : (
          /* --- 2. MAIN WEBSITE CONTENT --- */
          <motion.div
            key="main-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full bg-white overflow-x-hidden"
          >
            {/* --- HERO SECTION --- */}
            <section className="w-full relative min-h-[500px] flex flex-col items-center justify-start pt-28 pb-20">

              {/* Ken Burns Effect Background - Fixed Height */}
              <motion.div
                className="absolute top-0 left-0 w-full h-[500px] overflow-hidden z-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
              >
                <motion.div
                  className="w-full h-full bg-cover bg-center"
                  initial={{ scale: 1 }}
                  animate={{ scale: 1.1 }}
                  transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
                  style={{
                    backgroundImage:
                      "url('https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2070&auto=format&fit=crop')",
                  }}
                />
                {/* Premium Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-transparent" />
              </motion.div>

              <div className="w-full px-4 flex flex-col items-center z-10">
                <motion.h2
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-white mb-8 text-center tracking-tight drop-shadow-2xl"
                >
                  SEE THE WORLD<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                    FOR LESS
                  </span>
                </motion.h2>

                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                  className="w-[95%] sm:w-[90%] md:w-[80%] lg:w-[75%] max-w-4xl glass-effect rounded-3xl shadow-2xl relative border border-white/20"
                >
                  {/* --- Mini Navbar - Pixel Perfect Agoda Style --- */}
                  <div className="relative z-10 bg-white/40 backdrop-blur-md shadow-sm rounded-t-3xl border-b border-white/30 overflow-hidden">
                    <div className="grid grid-cols-4 w-full">
                      {mainNavItems.map((item) => (
                        <button
                          key={item.name}
                          onClick={() => handleTabClick(item.name)}
                          className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-3 sm:py-4 cursor-pointer transition-all duration-300
                            ${activeMainTab === item.name
                              ? "bg-blue-600 text-white shadow-inner"
                              : "text-gray-800 hover:bg-white/50 hover:text-blue-700"
                            }`}
                        >
                          <span className="text-xl sm:text-2xl">{item.icon}</span>
                          <span className={`text-xs sm:text-base font-bold ${activeMainTab === item.name ? "text-white" : "text-gray-700"}`}>
                            {item.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* --- Main Form Box --- */}
                  <div className={`relative transition-all duration-300 bg-white/80 backdrop-blur-sm rounded-b-3xl ${isFormOpen ? "p-6 md:p-8" : "h-0 overflow-hidden"}`}>
                    <AnimatePresence mode="wait">
                      {renderSearchForm()}
                    </AnimatePresence>
                  </div>
                </motion.div>
              </div>
            </section>


            {/* --- CORE SERVICES SECTION --- */}
            <motion.section
              variants={sectionVariant}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              className="mt-8 md:mt-1"
            >
              <div className="max-w-7xl mx-auto px-6">
                <div className="text-center max-w-3xl mx-auto mb-12">
                  <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
                    Your Trusted Partner in Travel
                  </h2>
                  <p className="text-lg text-gray-600">
                    O.S. Travel & Tours – Islamabad’s Top-Rated Travel Agency
                    O.S. Travel & Tours is one of the leading travel agencies in Islamabad, Pakistan, trusted for reliable visa processing,Travel Insurance,  affordable flight bookings, and fully customized international tour packages.

                    We provide professional visa consultancy for more than 50+ countries, including UAE, Saudi Arabia, Malaysia, Turkey, Schengen, UK, USA, and many more — with the highest approval guidance.
                  </p>
                </div>
                <motion.div
                  variants={gridContainerVariant}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
                >
                  <FeatureCard
                    icon={<FaFileSignature />}
                    title="Expert Visa Consultants"
                    desc="High success rate for complex file processing (Schengen, USA, UK, Canada) and fast E-Visas."
                  />
                  <FeatureCard
                    icon={<FaStar />}
                    title="Authorized Agents"
                    desc="Official dropbox for Malaysia, Thailand, & Vietnam. ICA authorized for Singapore."
                  />
                  <FeatureCard
                    icon={<FaKaaba />}
                    title="Hajj & Umrah Packages"
                    desc="We provide all-inclusive 5-Star and Economy packages with the best hotels and transport."
                  />
                  <FeatureCard
                    icon={<FaPlane />}
                    title="Complete Travel Solution"
                    desc="From cheap flights to hotel bookings and custom tours, we handle every detail of your trip."
                  />
                </motion.div>
              </div>
            </motion.section>

            {/* --- OFFICIAL DROPBOX SECTION --- */}
            <motion.section
              variants={sectionVariant}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              className="py-16 md:py-24 bg-blue-50"
            >
              <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-extrabold text-blue-900 mb-4">
                    Official Dropbox Services
                  </h2>
                  <p className="text-lg text-gray-700 max-w-3xl mx-auto">
                    We are proud to be **official authorized Dropbox agents** for several embassies.
                    This allows us to provide the fastest, most secure, and most reliable E-Visa and sticker visa processing for these destinations.
                  </p>
                </div>
                <motion.div
                  variants={gridContainerVariant}
                  className="grid grid-cols-2 md:grid-cols-4 gap-6"
                >
                  {dropboxCountries.map((country) => (
                    <DropboxCard
                      key={country.code}
                      name={country.name}
                      code={country.code}
                      to={country.to}
                    />
                  ))}
                </motion.div>
              </div>
            </motion.section>

            {/* --- FEATURED VISA CATEGORIES SECTION --- */}
            <motion.section
              variants={sectionVariant}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              className="py-16 md:py-24 bg-gray-900 text-white"
            >
              <div className="max-w-7xl mx-auto px-6">
                <div className="text-center max-w-3xl mx-auto mb-12">
                  <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
                    Explore Our Visa Services
                  </h2>
                  <p className="text-lg text-gray-300">
                    We are Pakistan's leading visa consultants. We make the complex simple.
                  </p>
                </div>
                <motion.div
                  variants={gridContainerVariant}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                >
                  <VisaCategoryCard
                    title="Schengen & Global File Processing"
                    desc="Expert guidance for complex, interview-based visas to Europe, USA, UK, & Canada."
                    imageUrl="https://www.azal.az/_next/static/media/sengen_79ef5255d7.png" // Paris
                    linkTo="/fileprocessing"
                  />
                  <VisaCategoryCard
                    title="Asia & Africa E-Visas"
                    desc="Fast, simple E-Visa processing for top destinations like Turkey, Dubai (UAE), Malaysia, & more."
                    imageUrl="https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3?q=80&w=2071&auto=format&fit=crop" // Japan
                    linkTo="/visas"
                  />
                </motion.div>
              </div>
            </motion.section>

            {/* --- HAJJ & UMRAH SECTION --- */}
            <motion.section
              variants={sectionVariant}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              className="py-16 md:py-24 bg-white"
            >
              <div className="max-w-7xl mx-auto px-6">
                <VisaCategoryCard
                  title="Hajj & Umrah Packages"
                  desc="Book your blessed journey with us. We offer all-inclusive 5-Star and Economy packages from Pakistan."
                  imageUrl="https://invent.trips.pk/Images/cmsThumbnails/umrah-packages.jpg" // Kaaba
                  linkTo="/haj"
                />
              </div>
            </motion.section>



            {/* --- FINAL CTA SECTION --- */}

            <PrivacyPolicyPage />
            {/* --- TESTIMONIALS SECTION --- */}
            <motion.section
              variants={sectionVariant}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              className="py-16 md:py-24 bg-gray-50"
            >
              <div className="max-w-7xl mx-auto px-6">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">
                  What Our Clients Say
                </h2>
                <motion.div
                  variants={gridContainerVariant}
                  className="grid grid-cols-1 md:grid-cols-3 gap-8"
                >
                  <ReviewCard
                    quote="The US visa interview is stressful, but O.S. Travel prepared me perfectly. They handled my DS-160 form and all documents. My visa was approved!"
                    name="Tariq M."
                  />
                  <ReviewCard
                    quote="Alhamdulillah, our Umrah was perfect. The hotels were exactly as promised, and the transport was always on time. Highly recommend O.S. Travel."
                    name="The Ahmed Family"
                  />
                  <ReviewCard
                    quote="O.S. Travel is the best for Schengen visas. They prepared my entire file for my France trip. I was so worried, but they handled everything. Got my visa!"
                    name="Omer S."
                  />
                </motion.div>
              </div>
            </motion.section>
            {/* Added Seopage here inside the content */}
            <FAQSection />
            <Seopage />

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// --- Reusable Sub-components ---
const FeatureCard = ({ icon, title, desc }) => (
  <motion.div
    variants={gridItemVariant}
    whileHover={{ y: -10 }}
    className="text-center p-8 rounded-2xl bg-white hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 border border-transparent hover:border-blue-50"
  >
    <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
      <span className="text-4xl drop-shadow-sm">{icon}</span>
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
    <p className="text-gray-600 leading-relaxed text-sm">{desc}</p>
  </motion.div>
);

const VisaCategoryCard = ({ title, desc, imageUrl, linkTo }) => (
  <motion.div
    variants={gridItemVariant}
    whileHover={{ y: -5 }}
    className="relative rounded-2xl overflow-hidden shadow-2xl h-[400px] group cursor-pointer"
  >
    <img src={imageUrl} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

    <div className="absolute inset-0 p-8 flex flex-col justify-end items-start transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
      <h3 className="text-3xl font-bold text-white mb-3 tracking-wide">{title}</h3>
      <p className="text-lg text-gray-200 mb-6 font-light">{desc}</p>

      <Link
        to={linkTo}
        className="opacity-0 group-hover:opacity-100 bg-white/20 backdrop-blur-md border border-white/30 text-white font-bold py-3 px-8 rounded-full 
                   hover:bg-white hover:text-blue-900 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0"
      >
        Explore Now
      </Link>
    </div>
  </motion.div>
);

const ReviewCard = ({ quote, name }) => (
  <motion.div
    variants={gridItemVariant}
    className="bg-gray-50 p-6 rounded-lg shadow-lg border-l-4 border-blue-500"
  >
    <FaQuoteLeft className="text-3xl text-blue-500 mb-4" />
    <p className="text-gray-600 italic mb-6 grow">"{quote}"</p>
    <div className="flex items-center gap-2">
      <div className="flex text-yellow-400">
        <FaStar /> <FaStar /> <FaStar /> <FaStar /> <FaStar />
      </div>
      <span className="text-lg font-semibold text-gray-800">- {name}</span>
    </div>
  </motion.div>
);

const DropboxCard = ({ name, code, to }) => (
  <motion.div variants={gridItemVariant}>
    <Link
      to={to}
      className="block bg-white rounded-lg shadow-xl overflow-hidden h-full group transform transition-all duration-300 hover:shadow-blue-300 hover:shadow-2xl hover:-translate-y-2 border-2 border-transparent hover:border-blue-500"
    >
      <div className="relative w-full h-40 overflow-hidden">
        <img
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          src={`https://flagcdn.com/w320/${code.toLowerCase()}.png`}
          alt={`${name} Flag`}
        />
        <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
          <FaStar className="text-yellow-300" />
          <span>Official Agent</span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-300">
          {name}
        </h3>
        <p className="text-sm text-gray-600">Click to see E-Visa details</p>
      </div>
    </Link>
  </motion.div>
);

export default Home;