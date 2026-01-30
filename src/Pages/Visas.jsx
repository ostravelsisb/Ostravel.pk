import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect } from "react";
// --- Icons (from react-icons) ---
import {
  FaPassport,
  FaFileSignature,
  FaLaptopCode,
  FaGlobeAfrica,
  FaGlobeAsia,
  FaUmbrellaBeach,
  FaStar,
} from "react-icons/fa";

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
      className="block bg-white rounded-lg shadow-lg overflow-hidden h-full group transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5 border border-gray-200 hover:border-blue-500" // Added borders
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

// --- Special Dropbox Card Component ---
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

// --- Reusable Region Section Component ---
const RegionSection = ({ icon, title, description, countries, bgColor = "bg-white" }) => (
  <motion.section
    variants={sectionVariant}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.1 }}
    className={`py-16 md:py-20 ${bgColor} -mx-6 px-6`} // Full-width bleed effect
  >
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-center items-center gap-4 mb-4">
        <div className="text-4xl text-blue-600">{icon}</div>
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
          {title}
        </h2>
      </div>
      <p className="text-center text-lg text-gray-600 max-w-3xl mx-auto mb-12">
        {description}
      </p>

      <motion.div
        variants={gridContainerVariant}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6"
      >
        {countries.map((country) => (
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
);

// --- Data Arrays for Countries ---
// I've corrected all `to` links to match the keys in your `countryPages` object
const dropboxCountries = [
  { name: "Malaysia", code: "my", to: "/Countries/malaysia" },
  { name: "Thailand", code: "th", to: "/Countries/thailand" },
  { name: "Indonesia", code: "id", to: "/Countries/indonesia" },
  { name: "Vietnam", code: "vn", to: "/Countries/vietnam" },
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

const globalFileCountries = [
  { name: "United Kingdom", code: "gb", to: "/Countries/united-kingdom" },
  { name: "USA", code: "us", to: "/Countries/united-states" },
  { name: "Canada", code: "ca", to: "/Countries/canada" },
  { name: "Australia", code: "au", to: "/Countries/australia" },
  { name: "Ireland", code: "ie", to: "/Countries/ireland" },
  { name: "South Africa", code: "za", to: "/Countries/south-africa" },
];

const asiaMiddleEastCountries = [
  { name: "Azerbaijan", code: "az", to: "/Countries/azerbaijan" },
  { name: "Bahrain", code: "bh", to: "/Countries/bahrain" },
  { name: "China", code: "cn", to: "/Countries/china" },
  { name: "Japan", code: "jp", to: "/Countries/japan" },
  { name: "Kazakhstan", code: "kz", to: "/Countries/kazakhstan" },
  { name: "Philippines", code: "ph", to: "/Countries/philippines" },
  { name: "Qatar", code: "qa", to: "/Countries/qatar" },
  { name: "Singapore", code: "sg", to: "/Countries/singapore" },
  { name: "South Korea", code: "kr", to: "/Countries/south-korea" },
  { name: "Sri Lanka", code: "lk", to: "/Countries/sri-lanka" },
  { name: "Tajikistan", code: "tj", to: "/Countries/tajikistan" },
  { name: "Turkey", code: "tr", to: "/Countries/turkey" },
  { name: "UAE", code: "ae", to: "/Countries/uae" },
  { name: "Morocco", code: "ma", to: "/Countries/morocco" },
];

const africaCountries = [
  { name: "Egypt", code: "eg", to: "/Countries/egypt" },
  { name: "Ethiopia", code: "et", to: "/Countries/ethiopia" },
  { name: "Kenya", code: "ke", to: "/Countries/kenya" },
  { name: "Uganda", code: "ug", to: "/Countries/uganda" },
  { name: "Zambia", code: "zm", to: "/Countries/zambia" },
];

const easyNavCountries = [
  { name: "Maldives", code: "mv", to: "/Countries/maldives" },
  { name: "Nepal", code: "np", to: "/Countries/nepal" },
];

const inboundTour = [
  { name: "Visit Pakistan", code: "pk", to: "/Countries/pakistan" },
];

// --- Main Visas Page Component ---
function Visas() {
  useEffect(()=>{
    document.title = "Visa we deal in Os Travels and Tours "
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
        <img
          src="https://images.unsplash.com/photo-1504150558240-0b419c700ab6?q=80&w=2070&auto=format&fit=crop"
          alt="World map with travel pins"
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
            Visa Services
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-xl md:text-2xl text-white opacity-90 max-w-3xl"
          >
            Your Trusted Partner for Visa Processing. We handle everything from
            E-Visas to complex file submissions.
          </motion.p>
        </div>
      </motion.div>

      {/* 2. Main Content Area */}
      <div className="max-w-7xl mx-auto px-6">

        {/* --- OFFICIAL DROPBOX SECTION (AT TOP) --- */}
        <motion.section
          variants={sectionVariant}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="py-16 md:py-20 bg-blue-50 -mx-6 px-6" // Special background
        >
          <div className="max-w-7xl mx-auto">
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

        {/* --- Schengen Section --- */}
        <RegionSection
          bgColor="bg-white"
          icon={<FaFileSignature />}
          title="Schengen Visa File Processing"
          description="The Schengen visa is complex. We are expert visa consultants in Islamabad, specializing in complete file preparation, VFS/BLS appointment scheduling, and all supporting documents to ensure the highest chance of success."
          countries={schengenCountries}
        />

        {/* --- Global File Processing Section --- */}
        <RegionSection
          bgColor="bg-gray-50"
          icon={<FaPassport />}
          title="Global Visa File Processing"
          description="Expert file preparation and appointment scheduling for complex, interview-based visas to the UK, USA, Canada, Australia, Ireland, and South Africa. We provide full guidance and interview coaching."
          countries={globalFileCountries}
        />

        {/* --- Asia & Middle East Section --- */}
        <RegionSection
          bgColor="bg-white"
          icon={<FaGlobeAsia />}
          title="Asia & Middle East E-Visa Services"
          description="Fast and reliable E-Visa and Sticker Visa processing for top destinations. We are authorized agents for many of these countries, ensuring a smooth and quick approval for your trips."
          countries={asiaMiddleEastCountries}
        />

        {/* --- Africa Section --- */}
        <RegionSection
          bgColor="bg-gray-50"
          icon={<FaGlobeAfrica />}
          title="Africa E-Visa Services"
          description="Explore the wonders of Africa with our easy e-visa processing. We guide you on all requirements, including mandatory health certificates (like Yellow Fever), for a hassle-free application."
          countries={africaCountries}
        />

        {/* --- Easy Visa Section --- */}
        <RegionSection
          bgColor="bg-white"
          icon={<FaUmbrellaBeach />}
          title="Easy & On-Arrival Visas"
          description="Planning a quick getaway? These destinations offer Visa on Arrival or very simple e-visa processes. We handle all the bookings to make your trip seamless."
          countries={easyNavCountries}
        />

        {/* --- Inbound Tour Section --- */}
        <RegionSection
          bgColor="bg-gray-50"
          icon={<img src="https://flagcdn.com/w80/pk.png" alt="Pakistan Flag" className="w-10 h-10 rounded-full shadow-md" />}
          title="Inbound Tours to Pakistan"
          description="Welcome to Pakistan! As a licensed tour operator, we provide the mandatory Letter of Invitation (LOI) for your visa and create unforgettable custom tours of Pakistan's beautiful landscapes."
          countries={inboundTour}
        />

      </div>
    </div>
  );
}

export default Visas;