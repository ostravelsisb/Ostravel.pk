import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
// --- Icons ---
import {
  FaKaaba, FaMoon, FaStar, FaPlane, FaHotel, FaBus, FaCheckCircle,
  FaFileContract, FaChevronDown, FaQuoteLeft, FaMoneyBillWave, FaFilter, FaSortAmountDown, FaCalendarAlt
} from 'react-icons/fa';
// --- Components & Context ---
import UmrahBookingForm from '../SildeComponents/UmrahBookingForm';
import { useCurrency } from '../Context/CurrencyContext';

// --- Master Data (All Packages) ---
const allPackages = [
  // --- 14 DAY PACKAGES ---
  {
    id: 101,
    title: "14-Day Economy Saver",
    durationVal: 14,
    duration: "14 Days (7 Makkah / 7 Madina)",
    hotels: "Al Rayhan Int’l (Makkah) & Jood Marjan (Madina)",
    distance: "Shuttle Service",
    distanceCategory: "shuttle",
    basePrice: 268500,
    priceList: [
      { type: "Sharing", price: 268500 },
      { type: "Quad", price: 277000 },
      { type: "Triple", price: 289000 },
      { type: "Double", price: 315500 },
    ],
    features: ["14 Days Duration", "Visa & Transport", "Shuttle Service", "Guided Ziyarat"],
    isRecommended: false
  },
  {
    id: 102,
    title: "14-Day 3-Star Standard",
    durationVal: 14,
    duration: "14 Days (7 Makkah / 7 Madina)",
    hotels: "Shaza Wassam (Makkah) & Marina Zahbi (Madina)",
    distance: "650–750m Distance",
    distanceCategory: "walkable",
    basePrice: 287500,
    priceList: [
      { type: "Sharing", price: 287500 },
      { type: "Quad", price: 300000 },
      { type: "Triple", price: 321000 },
      { type: "Double", price: 363000 },
    ],
    features: ["Rated 3-4 Star", "Walkable (750m)", "Direct Flights Option", "Full Transport"],
    isRecommended: true
  },
  {
    id: 103,
    title: "14-Day Silver Package",
    durationVal: 14,
    duration: "14 Days (7 Makkah / 7 Madina)",
    hotels: "Mawaddah Hasnain (Makkah) & Shams Madinah (Madina)",
    distance: "600–700m Distance",
    distanceCategory: "walkable",
    basePrice: 302500,
    priceList: [
      { type: "Sharing", price: 302500 },
      { type: "Quad", price: 319000 },
      { type: "Triple", price: 346000 },
      { type: "Double", price: 400500 },
    ],
    features: ["Premium Locations", "Close to Haram (600m)", "Visa Included", "Luxury Bus"],
    isRecommended: false
  },
  {
    id: 104,
    title: "14-Day Gold Proximity",
    durationVal: 14,
    duration: "14 Days (7 Makkah / 7 Madina)",
    hotels: "Badar Al Masa (Makkah) & Rua Al Khair (Madina)",
    distance: "300–600m Distance",
    distanceCategory: "close",
    basePrice: 322000,
    priceList: [
      { type: "Sharing", price: 322000 },
      { type: "Quad", price: 343000 },
      { type: "Triple", price: 378500 },
      { type: "Double", price: 448500 },
    ],
    features: ["Nearest Hotels (300m)", "Premium Services", "Direct Flights Priority", "VIP Transport"],
    isRecommended: false
  },

  // --- 21 DAY PACKAGES (Restored) ---
  {
    id: 201,
    title: "21-Day Economy Saver",
    durationVal: 21,
    duration: "21 Days (10 Makkah / 10 Madina)",
    hotels: "Al Rayhan Int’l (Makkah) & Jood Marjan (Madina)",
    distance: "Shuttle Service",
    distanceCategory: "shuttle",
    basePrice: 283000,
    priceList: [
      { type: "Sharing", price: 283000 },
      { type: "Quad", price: 295000 },
      { type: "Triple", price: 315000 },
      { type: "Double", price: 352000 },
    ],
    features: ["21 Days Duration", "Visa & Transport", "Shuttle Service", "Guided Ziyarat"],
    isRecommended: false
  },
  {
    id: 202,
    title: "21-Day 3-Star Standard",
    durationVal: 21,
    duration: "21 Days (10 Makkah / 10 Madina)",
    hotels: "Shaza Wassam (Makkah) & Marina Zahbi (Madina)",
    distance: "650–750m Distance",
    distanceCategory: "walkable",
    basePrice: 308000,
    priceList: [
      { type: "Sharing", price: 308000 },
      { type: "Quad", price: 326000 },
      { type: "Triple", price: 356000 },
      { type: "Double", price: 415000 },
    ],
    features: ["Rated 3-4 Star", "Walkable (750m)", "Direct Flights Option", "Full Transport"],
    isRecommended: true
  },
  {
    id: 203,
    title: "21-Day Silver Package",
    durationVal: 21,
    duration: "21 Days (10 Makkah / 10 Madina)",
    hotels: "Mawaddah Hasnain (Makkah) & Shams Madinah (Madina)",
    distance: "600–700m Distance",
    distanceCategory: "walkable",
    basePrice: 330000,
    priceList: [
      { type: "Sharing", price: 330000 },
      { type: "Quad", price: 352500 },
      { type: "Triple", price: 391500 },
      { type: "Double", price: 467500 },
    ],
    features: ["Premium Locations", "Close to Haram (600m)", "Visa Included", "Luxury Bus"],
    isRecommended: false
  },
  {
    id: 204,
    title: "21-Day Gold Proximity",
    durationVal: 21,
    duration: "21 Days (10 Makkah / 10 Madina)",
    hotels: "Badar Al Masa (Makkah) & Rua Al Khair (Madina)",
    distance: "300–600m Distance",
    distanceCategory: "close",
    basePrice: 356500,
    priceList: [
      { type: "Sharing", price: 356500 },
      { type: "Quad", price: 387000 },
      { type: "Triple", price: 437000 },
      { type: "Double", price: 535500 },
    ],
    features: ["Nearest Hotels (300m)", "Premium Services", "Direct Flights Priority", "VIP Transport"],
    isRecommended: false
  }
];

const hajjPackage = {
  title: "Hajj 2026 Packages",
  description: "Our Hajj packages are in high demand. We provide complete services including accommodation near Haram, food, transport, and guided support throughout your journey. Pre-registration is now open."
};

const faqs = [
  { q: "What durations are available?", a: "We currently offer 14-Day (7 Makkah/7 Madina) and 21-Day (10 Makkah/10 Madina) packages." },
  { q: "What is included in the package?", a: "Packages include Visa, Return Flights, Accommodation, and Transport (Airport-Hotel-Ziyarat)." },
  { q: "How do I get an Umrah visa?", a: "We process the Umrah E-Visa for you. It requires a passport copy and photograph." }
];

// --- Animation Variants ---
const sectionVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};
const gridContainerVariant = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const gridItemVariant = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0 },
};

// --- Main Component ---
function HajandUmmrah() {
  const { currency, setCurrency, currencies } = useCurrency();
  const [filterDistance, setFilterDistance] = useState('all'); // all, shuttle, walkable, close
  const [filterDuration, setFilterDuration] = useState('all'); // all, 14, 21
  const [sortOrder, setSortOrder] = useState('asc'); // asc, desc

  useEffect(() => {
    document.title = "Umrah Packages 2026 - O.S Travel & Tours";
  }, []);

  // Filter and Sort Logic
  const filteredPackages = useMemo(() => {
    let result = [...allPackages];

    // Filter by Duration
    if (filterDuration !== 'all') {
      result = result.filter(p => p.durationVal === parseInt(filterDuration));
    }

    // Filter by Distance
    if (filterDistance !== 'all') {
      if (filterDistance === 'walkable') {
        result = result.filter(p => p.distanceCategory === 'walkable' || p.distanceCategory === 'close');
      } else {
        result = result.filter(p => p.distanceCategory === filterDistance);
      }
    }

    // Sort by Base Price (Sharing)
    result.sort((a, b) => {
      return sortOrder === 'asc' ? a.basePrice - b.basePrice : b.basePrice - a.basePrice;
    });

    return result;
  }, [filterDistance, filterDuration, sortOrder]);

  return (
    <div className="w-full bg-slate-50 overflow-x-hidden font-sans">

      {/* 1. Premium Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative w-full h-[500px]"
      >
        <img
          src="https://invent.trips.pk/Images/cmsThumbnails/umrah-packages.jpg"
          alt="Kaaba"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/60 to-slate-900/90" />
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block py-1 px-3 border border-amber-400/50 rounded-full text-amber-400 text-sm tracking-widest uppercase mb-4 bg-black/30 backdrop-blur-sm">
              Spiritual Journey
            </span>
            <h1 className="text-4xl md:text-7xl font-bold text-white mb-6 drop-shadow-2xl">
              Hajj & Umrah <span className="text-amber-500">2026</span>
            </h1>
            <p className="text-xl text-gray-200 max-w-2xl mx-auto leading-relaxed">
              Premium 14-Day & 21-Day packages tailored for your comfort.
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* 2. Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 -mt-20 relative z-10">

        {/* --- Filter Bar --- */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-xl shadow-2xl shadow-slate-200/50 p-4 md:p-6 mb-12 flex flex-col lg:flex-row gap-4 items-center justify-between border border-slate-100"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full lg:w-auto">

            {/* Duration Filter */}
            <div className="relative group">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
                <FaCalendarAlt /> Duration
              </div>
              <select
                value={filterDuration}
                onChange={(e) => setFilterDuration(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 py-2.5 px-4 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none cursor-pointer font-medium"
              >
                <option value="all">All Durations</option>
                <option value="14">14 Days</option>
                <option value="21">21 Days</option>
              </select>
            </div>

            {/* Distance Filter */}
            <div className="relative group">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
                <FaFilter /> Distance
              </div>
              <select
                value={filterDistance}
                onChange={(e) => setFilterDistance(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 py-2.5 px-4 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none cursor-pointer font-medium"
              >
                <option value="all">All Distances</option>
                <option value="shuttle">Shuttle Service</option>
                <option value="walkable">Walkable (&lt;750m)</option>
                <option value="close">Closest (&lt;600m)</option>
              </select>
            </div>

            {/* Sort Price */}
            <div className="relative group">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
                <FaSortAmountDown /> Price
              </div>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 py-2.5 px-4 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none cursor-pointer font-medium"
              >
                <option value="asc">Low to High</option>
                <option value="desc">High to Low</option>
              </select>
            </div>
          </div>

          {/* Currency Selector */}
          <div className="flex flex-col items-center lg:items-end gap-2 w-full lg:w-auto mt-4 lg:mt-0">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select Currency</span>
            <div className="flex flex-wrap justify-center gap-2 bg-slate-100 p-1 rounded-lg">
              {currencies.map((curr) => (
                <button
                  key={curr}
                  onClick={() => setCurrency(curr)}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all duration-300 ${currency === curr
                    ? "bg-amber-500 text-white shadow-md"
                    : "text-slate-500 hover:bg-white hover:text-slate-700"
                    }`}
                >
                  {curr}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        <section className="pb-16 md:pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Package Grid */}
            <div className="lg:col-span-2">
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-slate-800">Available Packages</h2>
                <p className="text-slate-500 mt-1">
                  Showing {filteredPackages.length} packages
                  {filterDuration !== 'all' && ` for ${filterDuration} Days`}
                </p>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={filterDistance + filterDuration + sortOrder + currency}
                  variants={gridContainerVariant}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 gap-8"
                >
                  {filteredPackages.length > 0 ? (
                    filteredPackages.map((pkg) => (
                      <PackageCard key={pkg.id} pkg={pkg} />
                    ))
                  ) : (
                    <div className="p-12 text-center bg-white rounded-xl shadow-sm border border-slate-200">
                      <p className="text-slate-500">No packages found for this selection.</p>
                      <button onClick={() => { setFilterDistance('all'); setFilterDuration('all'); }} className="mt-4 text-amber-600 font-bold hover:underline">Clear All Filters</button>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Sticky Form */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <UmrahBookingForm />
              </div>
            </div>

          </div>
        </section>

        {/* --- Hajj & Other Sections --- */}
        <motion.section variants={sectionVariant} initial="hidden" whileInView="visible" viewport={{ once: true }} className="py-16 bg-white rounded-3xl shadow-sm border border-slate-100 px-6 md:px-12 mb-12">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-amber-100 p-3 rounded-full text-amber-600 text-2xl"><FaKaaba /></div>
                <h2 className="text-3xl font-bold text-slate-800">Hajj 2026</h2>
              </div>
              <p className="text-lg text-slate-600 leading-relaxed mb-6">{hajjPackage.description}</p>
              <Link to="/contact" className="inline-block bg-slate-900 text-white font-semibold px-8 py-3 rounded-lg hover:bg-slate-800 transition-colors">
                Pre-Register Now
              </Link>
            </div>
            <div className="w-full md:w-1/3">
              <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100 text-center">
                <h4 className="text-amber-800 font-bold text-xl">Limited Slots</h4>
                <p className="text-amber-700/80 text-sm mt-2">Book early to secure best locations.</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Services & FAQs */}
        <ServicesAndExtras />

      </div>
    </div>
  );
}

// --- Sub-Components ---

const PackageCard = ({ pkg }) => {
  const { convertPrice } = useCurrency();

  return (
    <motion.div
      variants={gridItemVariant}
      className={`bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border ${pkg.isRecommended ? 'border-amber-400 ring-1 ring-amber-400/30 relative' : 'border-slate-100'
        }`}
    >
      {pkg.isRecommended && (
        <div className="absolute top-0 right-0 bg-amber-500 text-white text-xs font-bold px-4 py-1 rounded-bl-xl z-10">
          RECOMMENDED
        </div>
      )}

      <div className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
          <div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">{pkg.title}</h3>
            <div className="flex flex-wrap gap-3 text-sm font-medium">
              <span className="flex items-center text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                <FaMoon className="mr-2" /> {pkg.duration}
              </span>
              <span className="flex items-center text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                <FaBus className="mr-2" /> {pkg.distance}
              </span>
            </div>
          </div>
        </div>

        {/* Hotel Info */}
        <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-100 flex items-start gap-3">
          <FaHotel className="text-slate-400 text-xl mt-1 shrink-0" />
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Accommodation</span>
            <p className="text-slate-700 font-semibold text-lg leading-tight">{pkg.hotels}</p>
          </div>
        </div>

        {/* Pricing Table - Premium Grid */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <FaMoneyBillWave className="text-green-600" />
            <span className="text-sm font-bold text-slate-700 uppercase tracking-wide">Per Person Rates</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {pkg.priceList.map((item, idx) => (
              <div key={idx} className="flex flex-col bg-white border border-slate-200 rounded-lg p-3 text-center transition-colors hover:border-amber-300 hover:bg-amber-50/30">
                <span className="text-xs font-bold text-slate-400 uppercase mb-1">{item.type}</span>
                <span className="text-sm md:text-base font-bold text-slate-800 whitespace-nowrap">
                  {convertPrice(item.price)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex gap-4 text-sm text-slate-500 w-full md:w-auto overflow-x-auto">
            {pkg.features.slice(0, 2).map((f, i) => (
              <span key={i} className="flex items-center whitespace-nowrap"><FaCheckCircle className="text-emerald-500 mr-2" /> {f}</span>
            ))}
          </div>
          <a
            href={`https://wa.me/923325500377?text=${encodeURIComponent(`Salam, I'm interested in the ${pkg.title} package.`)}`}
            target="_blank"
            rel="noreferrer"
            className="w-full md:w-auto px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg shadow-slate-900/20 transition-transform active:scale-95 flex items-center justify-center gap-2"
          >
            <FaPlane /> Book Now
          </a>
        </div>
      </div>
    </motion.div>
  );
};

const ServicesAndExtras = () => (
  <>
    {/* Services */}
    <div className="py-12">
      <h2 className="text-2xl font-bold text-center text-slate-800 mb-10">Premium Services Included</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { icon: <FaFileContract />, title: "Visa Processing", desc: "Fast E-Visa Approval" },
          { icon: <FaPlane />, title: "Flights", desc: "Return Air Tickets" },
          { icon: <FaHotel />, title: "Hotels", desc: "Pre-booked Stays" },
          { icon: <FaBus />, title: "Transport", desc: "AC Buses / Cars" },
        ].map((s, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 text-center hover:shadow-md transition-shadow">
            <div className="text-3xl text-amber-500 mb-3 flex justify-center">{s.icon}</div>
            <h3 className="font-bold text-slate-800">{s.title}</h3>
            <p className="text-sm text-slate-500">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>

    {/* FAQ Accordion */}
    <div className="py-12 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-12">
      <h2 className="text-2xl font-bold text-slate-800 mb-8 text-center">Frequently Asked Questions</h2>
      <div className="max-w-3xl mx-auto space-y-4">
        {faqs.map((faq, i) => <AccordionItem key={i} q={faq.q} a={faq.a} />)}
      </div>
    </div>
  </>
);

const AccordionItem = ({ q, a }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full p-5 text-left bg-slate-50 hover:bg-slate-100 transition-colors"
      >
        <span className="font-semibold text-slate-700">{q}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
          <FaChevronDown className="text-slate-400" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-white"
          >
            <p className="p-5 text-slate-600 leading-relaxed border-t border-slate-100">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HajandUmmrah;