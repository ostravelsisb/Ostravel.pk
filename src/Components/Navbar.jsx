import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logoimg/logo.webp";

// --- Framer Motion & Icons ---
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineMenu, HiOutlineX, HiOutlineHome, HiOutlineInformationCircle, HiOutlineGlobeAlt, HiOutlineDocumentText, HiOutlinePhone, HiOutlineStar, HiOutlineNewspaper, HiChevronDown } from "react-icons/hi";
import { FaUserCircle, FaSignOutAlt, FaKaaba } from "react-icons/fa";
import { HiOutlineTicket } from "react-icons/hi2";

// --- Auth Imports ---
import { useAuth } from "../Context/AuthContext";
import { signOut } from "../firbase";
import { useCurrency } from "../Context/CurrencyContext";

// --- Config for Navigation Links ---
const navItems = [
  { name: "Home", to: "/", icon: HiOutlineHome },
  { name: "About Us", to: "/about", icon: HiOutlineInformationCircle },
  { name: "Visa", to: "/visas", dropdownType: "visa", icon: HiOutlineGlobeAlt },
  { name: "File Process", to: "/fileprocessing", dropdownType: "fileProcess", icon: HiOutlineDocumentText },
  { name: "Contact", to: "/contact", icon: HiOutlinePhone },
  { name: "Haj and Ummrah", to: "/haj", icon: FaKaaba },
  { name: "Reviews", to: "/reviews", icon: HiOutlineStar },
  { name: "Blog", to: "/blog", icon: HiOutlineNewspaper },
];

// --- Static Country Data (replaces restcountries.com API — was failing/blocked) ---
const visaCountryData = {
  Asia: [
    { name: "Azerbaijan", code: "az" },
    { name: "Bahrain", code: "bh" },
    { name: "China", code: "cn" },
    { name: "Cambodia", code: "kh" },
    { name: "Indonesia", code: "id" },
    { name: "Japan", code: "jp" },
    { name: "Kazakhstan", code: "kz" },
    { name: "Malaysia", code: "my" },
    { name: "Maldives", code: "mv" },
    { name: "Nepal", code: "np" },
    { name: "Pakistan", code: "pk" },
    { name: "Philippines", code: "ph" },
    { name: "Qatar", code: "qa" },
    { name: "South Korea", code: "kr" },
    { name: "Sri Lanka", code: "lk" },
    { name: "Tajikistan", code: "tj" },
    { name: "Thailand", code: "th" },
    { name: "Turkey", code: "tr" },
    { name: "Vietnam", code: "vn" },
    { name: "Singapore", code: "sg" },
    { name: "Morocco", code: "ma" },
  ],
  Europe: [
    { name: "Austria", code: "at" },
    { name: "Belgium", code: "be" },
    { name: "Bulgaria", code: "bg" },
    { name: "Czech Republic", code: "cz" },
    { name: "Denmark", code: "dk" },
    { name: "Estonia", code: "ee" },
    { name: "Finland", code: "fi" },
    { name: "France", code: "fr" },
    { name: "Germany", code: "de" },
    { name: "Greece", code: "gr" },
    { name: "Hungary", code: "hu" },
    { name: "Ireland", code: "ie" },
    { name: "Italy", code: "it" },
    { name: "Lithuania", code: "lt" },
    { name: "Netherlands", code: "nl" },
    { name: "Norway", code: "no" },
    { name: "Poland", code: "pl" },
    { name: "Portugal", code: "pt" },
    { name: "Romania", code: "ro" },
    { name: "Spain", code: "es" },
    { name: "Switzerland", code: "ch" },
    { name: "United Kingdom", code: "gb" },
  ],
  Africa: [
    { name: "Egypt", code: "eg" },
    { name: "Ethiopia", code: "et" },
    { name: "Kenya", code: "ke" },
    { name: "South Africa", code: "za" },
    { name: "Zambia", code: "zm" },
    { name: "Uganda", code: "ug" },
  ],
};

const fileProcessCountryData = [
  { name: "United States", code: "us" },
  { name: "Canada", code: "ca" },
  { name: "United Kingdom", code: "gb" },
  { name: "Australia", code: "au" },
];

// --- Shared dropdown motion presets ---
const dropdownMotion = {
  initial: { opacity: 0, y: 10, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 6, scale: 0.98 },
  transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] },
};

// --- 1. Simple Nav Link — glass hover pill + icon lift ---
const SimpleNavLink = ({ item, scrolled }) => {
  const Icon = item.icon;
  return (
    <NavLink to={item.to} className="relative group">
      {({ isActive }) => (
        <div className="relative flex items-center gap-1 px-2.5 xl:px-3.5 py-2 whitespace-nowrap">
          {/* hover / active glass pill */}
          <span
            className={`absolute inset-0 rounded-full transition-all duration-300 ease-out ${
              isActive
                ? "bg-gradient-to-r from-blue-600 to-sky-500 opacity-100 scale-100 shadow-md shadow-blue-500/30"
                : "bg-white/80 opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 shadow-sm"
            }`}
          />
          <Icon className={`relative z-10 text-[14px] transition-all duration-300 ${isActive ? "text-white" : "text-gray-400 group-hover:text-blue-500 group-hover:-translate-y-px"}`} />
          <span className={`relative z-10 text-[12px] xl:text-[14px] font-semibold transition-colors duration-300 ${isActive ? "text-white" : "text-gray-700 group-hover:text-blue-600"}`}>
            {item.name}
          </span>
        </div>
      )}
    </NavLink>
  );
};

// --- 2. Visa Dropdown Component ---
const VisaDropdown = () => {
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Asia");
  const location = useLocation();
  const isActive = location.pathname.startsWith("/visa");
  const currentList = visaCountryData[activeCategory];

  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <div className="relative flex items-center gap-1 px-2.5 xl:px-3.5 py-2 cursor-pointer whitespace-nowrap group">
        <span
          className={`absolute inset-0 rounded-full transition-all duration-300 ease-out ${
            isActive
              ? "bg-gradient-to-r from-blue-600 to-sky-500 opacity-100 scale-100 shadow-md shadow-blue-500/30"
              : "bg-white/80 opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 shadow-sm"
          }`}
        />
        <HiOutlineGlobeAlt className={`relative z-10 text-[14px] transition-colors duration-300 ${isActive ? "text-white" : "text-gray-400 group-hover:text-blue-500"}`} />
        <span className={`relative z-10 text-[12px] xl:text-[14px] font-semibold transition-colors duration-300 ${isActive ? "text-white" : "text-gray-700 group-hover:text-blue-600"}`}>Visa</span>
        <HiChevronDown className={`relative z-10 text-[10px] transition-all duration-300 ${isActive ? "text-white" : "text-gray-400 group-hover:text-blue-500"} ${open ? "rotate-180" : ""}`} />
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            {...dropdownMotion}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-3 flex bg-white/95 backdrop-blur-md shadow-2xl shadow-slate-900/15 rounded-3xl overflow-hidden z-50 w-[520px] border border-white/60 ring-1 ring-black/5"
          >
            <div className="w-1/3 bg-slate-50/80 border-r border-slate-100 py-2">
              {["Asia", "Europe", "Africa"].map((region) => (
                <div
                  key={region}
                  onMouseEnter={() => setActiveCategory(region)}
                  className={`relative mx-2 my-1 px-4 py-3 rounded-xl font-bold text-sm cursor-pointer transition-all duration-200 ${
                    activeCategory === region ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:bg-white/60"
                  }`}
                >
                  {region}
                  {activeCategory === region && (
                    <motion.span layoutId="visaRegionDot" className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-blue-500" />
                  )}
                </div>
              ))}
            </div>
            <div className="w-2/3 h-80 overflow-y-auto p-2.5">
              {currentList.map((country, i) => (
                <motion.div key={country.code} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.015, duration: 0.2 }}>
                  <Link
                    to={`/visa/${country.name.toLowerCase().replace(/\s+/g, "")}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-blue-50 transition-colors duration-150 group/item"
                  >
                    <img
                      src={`https://flagcdn.com/w40/${country.code}.png`}
                      alt={country.name}
                      className="w-6 h-4 object-cover rounded-sm border border-gray-200 shadow-sm transition-transform duration-200 group-hover/item:scale-110"
                    />
                    <span className="text-sm font-semibold text-slate-700 group-hover/item:text-blue-600">{country.name}</span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- 3. File Process Dropdown Component ---
const FileProcessDropdown = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const isActive = location.pathname.startsWith("/fileprocessing");

  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <div className="relative flex items-center gap-1 px-2.5 xl:px-3.5 py-2 cursor-pointer whitespace-nowrap group">
        <span
          className={`absolute inset-0 rounded-full transition-all duration-300 ease-out ${
            isActive
              ? "bg-gradient-to-r from-blue-600 to-sky-500 opacity-100 scale-100 shadow-md shadow-blue-500/30"
              : "bg-white/80 opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 shadow-sm"
          }`}
        />
        <HiOutlineDocumentText className={`relative z-10 text-[14px] transition-colors duration-300 ${isActive ? "text-white" : "text-gray-400 group-hover:text-blue-500"}`} />
        <span className={`relative z-10 text-[12px] xl:text-[14px] font-semibold transition-colors duration-300 ${isActive ? "text-white" : "text-gray-700 group-hover:text-blue-600"}`}>File Process</span>
        <HiChevronDown className={`relative z-10 text-[10px] transition-all duration-300 ${isActive ? "text-white" : "text-gray-400 group-hover:text-blue-500"} ${open ? "rotate-180" : ""}`} />
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            {...dropdownMotion}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-3 bg-white/95 backdrop-blur-md shadow-2xl shadow-slate-900/15 rounded-3xl overflow-hidden z-50 w-64 border border-white/60 ring-1 ring-black/5"
          >
            <div className="overflow-y-auto p-2.5">
              {fileProcessCountryData.map((country, i) => (
                <motion.div key={country.code} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03, duration: 0.2 }}>
                  <Link
                    to={`/visa/${country.name.toLowerCase().replace(/\s+/g, "-")}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 transition-colors duration-150 group/item"
                  >
                    <img
                      src={`https://flagcdn.com/w40/${country.code}.png`}
                      alt={country.name}
                      className="w-6 h-4 object-cover rounded-sm border border-gray-200 shadow-sm transition-transform duration-200 group-hover/item:scale-110"
                    />
                    <span className="text-sm font-semibold text-slate-700 group-hover/item:text-blue-600">{country.name}</span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- 4. Main Navbar Component ---
function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Auth Hook
  const { currentUser } = useAuth();
  const { currency, setCurrency, currencies } = useCurrency();
  const navigate = useNavigate();

  // Logout Handler
  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/login");
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // --- Scroll-aware shrink / floating capsule effect (rAF-throttled to avoid scroll-jank) ---
  useEffect(() => {
    let ticking = false;
    const evaluate = () => {
      setScrolled(window.scrollY > 24);
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(evaluate);
        ticking = true;
      }
    };
    evaluate();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock Body Scroll when Mobile Menu is Open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isMobileMenuOpen]);

  // Mobile Menu Animation
  const mobileMenuVariants = {
    hidden: { x: "100%", transition: { type: "tween", duration: 0.3 } },
    visible: { x: 0, transition: { type: "tween", duration: 0.3 } },
  };

  return (
    <>
      {/* --- STICKY WRAPPER — creates the floating-capsule effect on scroll --- */}
      <div className={`sticky top-0 z-50 w-full flex justify-center transition-[padding] duration-500 ease-out ${scrolled ? "pt-3 px-3 md:px-6" : "pt-0 px-0"}`}>
        <nav
          className={`relative w-full max-w-[1720px] flex items-center font-bold px-4 md:px-6 xl:px-8 overflow-visible transform-gpu transition-[height,border-radius,background-color,box-shadow,border-color] duration-300 ease-out ${
            scrolled
              ? "h-[76px] rounded-[26px] bg-white/85 backdrop-blur-md border border-white/70 shadow-[0_8px_28px_-10px_rgba(15,23,42,0.2)] ring-1 ring-black/[0.03]"
              : "h-[96px] rounded-none bg-white/60 backdrop-blur-md border-b border-white/40 shadow-sm"
          }`}
        >
          {/* subtle top-light sheen */}
          <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />

          {/* --- DESKTOP NAV (lg+) — true 3-column grid so the links are always dead-center --- */}
          <div className="hidden lg:grid grid-cols-[auto_1fr_auto] items-center w-full gap-4">
            {/* Column 1: Logo */}
            <Link to="/" className="justify-self-start">
              <motion.div
                animate={{ scale: scrolled ? 0.88 : 1 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ scale: scrolled ? 0.93 : 1.05, rotate: -2 }}
                whileTap={{ scale: 0.93 }}
                className="flex items-center gap-2 xl:gap-3 origin-left"
              >
                <img src={logo} alt="OS Logo" className="w-[52px] h-[52px] xl:w-[68px] xl:h-[68px] object-contain flex-shrink-0 drop-shadow-sm" />
                <div className="w-px h-8 bg-gradient-to-b from-transparent via-gray-300 to-transparent flex-shrink-0" />
                <span className="text-sm xl:text-lg font-extrabold tracking-tight whitespace-nowrap">
                  <span className="bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent">O.S</span>
                  <span className="bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent"> Travel & Tours</span>
                </span>
              </motion.div>
            </Link>

            {/* Column 2: Nav Items — centered as a group, independent of logo/auth widths */}
            <div className="flex justify-center items-center gap-0.5 xl:gap-1 flex-nowrap">
              {navItems.map((item) => {
                if (item.dropdownType === "visa") return <VisaDropdown key={item.name} />;
                if (item.dropdownType === "fileProcess") return <FileProcessDropdown key={item.name} />;
                return <SimpleNavLink key={item.name} item={item} scrolled={scrolled} />;
              })}
            </div>

            {/* Column 3: Auth */}
            <div className="flex gap-2 items-center justify-self-end flex-shrink-0">
              {/* --- AUTH CONDITIONAL RENDERING --- */}
              {currentUser ? (
                <div
                  className="relative flex items-center pl-2 xl:pl-3 ml-1 border-l border-gray-300/50 flex-shrink-0"
                  onMouseEnter={() => setProfileOpen(true)}
                  onMouseLeave={() => setProfileOpen(false)}
                >
                  {/* --- MERGED: avatar + name + bookings + sign out, all in one compact trigger --- */}
                  <button className="flex items-center gap-1.5 xl:gap-2 pl-1 pr-2.5 xl:pr-3 py-1 rounded-full bg-blue-50/80 hover:bg-blue-100/80 border border-blue-100 transition-colors duration-300">
                    <div className="relative shrink-0">
                      <div className="w-7 h-7 xl:w-8 xl:h-8 rounded-full bg-gradient-to-br from-blue-500 to-sky-400 p-[2px] shadow-sm shadow-blue-500/20">
                        <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                          <FaUserCircle className="text-base xl:text-lg text-blue-600" />
                        </div>
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white" />
                    </div>
                    <span className="hidden xl:inline text-[13px] font-bold text-blue-700 max-w-[90px] truncate">
                      {currentUser.displayName || "My Bookings"}
                    </span>
                    <HiChevronDown className={`text-blue-400 text-xs transition-transform duration-300 ${profileOpen ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        {...dropdownMotion}
                        className="absolute top-full right-0 mt-2 w-56 bg-white/95 backdrop-blur-md border border-white/60 ring-1 ring-black/5 rounded-2xl shadow-2xl shadow-slate-900/15 overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-gray-100 bg-blue-50/50">
                          <p className="text-sm font-bold text-slate-800 truncate">{currentUser.displayName || "User"}</p>
                          <p className="text-xs text-slate-400 truncate">{currentUser.email}</p>
                        </div>
                        <div className="p-1.5">
                          <Link
                            to="/dashboard"
                            className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          >
                            <HiOutlineTicket className="text-lg" /> My Bookings
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <FaSignOutAlt /> Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <Link to="/login">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="cursor-pointer hover:text-blue-600 transition-colors text-xs xl:text-sm font-medium px-2"
                    >
                      Sign in
                    </motion.button>
                  </Link>
                  <Link to="/signup">
                    <motion.button
                      whileHover={{ scale: 1.05, boxShadow: "0 12px 24px -8px rgba(37,99,235,0.5)" }}
                      whileTap={{ scale: 0.95 }}
                      className="relative overflow-hidden cursor-pointer rounded-full bg-gradient-to-r from-blue-600 to-sky-500 text-white px-4 xl:px-5 py-2 transition-all duration-300 text-xs xl:text-sm font-bold shadow-lg shadow-blue-500/25 group whitespace-nowrap"
                    >
                      <span className="absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-[120%] group-hover:translate-x-[420%] transition-transform duration-[900ms] ease-out" />
                      <span className="relative z-10">Create Account</span>
                    </motion.button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* --- MOBILE/TABLET HEADER (lg-) --- */}
          <div className="flex lg:hidden justify-between items-center w-full">
            <div className="w-8"></div>
            <div className="flex-1 flex justify-center">
              <Link to="/">
                <motion.div animate={{ scale: scrolled ? 0.9 : 1 }} transition={{ duration: 0.35 }} className="flex items-center gap-2">
                  <img src={logo} alt="OS Logo" className="w-[54px] h-[54px] object-contain" />
                  <div className="w-px h-7 bg-gray-300" />
                  <span className="text-base font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent">O.S Travel & Tours</span>
                </motion.div>
              </Link>
            </div>
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="relative z-50 w-11 h-11 flex items-center justify-center rounded-full bg-white/70 backdrop-blur-sm border border-white/60 shadow-sm text-2xl text-gray-800"
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={isMobileMenuOpen ? "close" : "open"}
                  initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-center"
                >
                  {isMobileMenuOpen ? <HiOutlineX /> : <HiOutlineMenu />}
                </motion.span>
              </AnimatePresence>
            </motion.button>
          </div>
        </nav>
      </div>

      {/* --- MOBILE MENU OVERLAY --- */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="fixed inset-0 lg:hidden bg-white/95 backdrop-blur-xl z-[60] flex flex-col font-sans"
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            {/* 1. Mobile Menu Header (Logo + Close Button) */}
            <div className="flex justify-between items-center w-full h-20 px-4 md:px-6 border-b border-gray-100 flex-none">
              <div className="flex-1 flex justify-start">
                <div className="flex items-center gap-2">
                  <img src={logo} alt="OS Logo" className="w-[36px] h-[36px] object-contain" />
                  <div className="w-px h-7 bg-gray-300" />
                  <span className="text-base font-extrabold tracking-tight text-blue-600">O.S Travel & Tours</span>
                </div>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-3xl text-gray-800 p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close menu"
              >
                <HiOutlineX />
              </button>
            </div>

            {/* 2. Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto py-6 px-6 flex flex-col gap-6">

              {/* Navigation Links */}
              <div className="flex flex-col gap-1.5">
                {navItems.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <motion.div key={item.name} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04, duration: 0.25 }}>
                      <NavLink
                        to={item.to}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-4 py-3 rounded-xl text-lg transition-all ${isActive
                            ? "bg-gradient-to-r from-blue-600 to-sky-500 text-white font-bold shadow-md shadow-blue-200"
                            : "text-gray-700 hover:bg-gray-50 font-medium"
                          }`
                        }
                      >
                        <Icon className="text-xl shrink-0" />
                        {item.name}
                      </NavLink>
                    </motion.div>
                  );
                })}
              </div>

              <hr className="border-gray-100" />

              {/* Currency Selector */}
              <div className="px-4">
                <label className="text-sm text-gray-400 font-bold uppercase tracking-wider mb-2 block">Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-800 py-3 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold appearance-none cursor-pointer"
                >
                  {currencies.map(curr => (
                    <option key={curr} value={curr}>{curr}</option>
                  ))}
                </select>
              </div>

              {/* Authentication Actions */}
              <div className="flex flex-col gap-3 mt-auto mb-8">
                {currentUser ? (
                  <div className="bg-gray-50 p-5 rounded-2xl flex flex-col gap-4">
                    <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                        <FaUserCircle className="text-2xl" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-bold text-gray-900 truncate">{currentUser.displayName || "User"}</p>
                        <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
                      </div>
                    </div>

                    <Link
                      to="/dashboard"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-sky-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-200 active:scale-95 transition-transform"
                    >
                      My Bookings
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2 text-red-500 font-bold py-3 rounded-xl border border-red-100 hover:bg-red-50 transition-colors"
                    >
                      <FaSignOutAlt /> Sign Out
                    </button>
                  </div>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                      <button className="w-full py-3 text-gray-600 font-bold hover:bg-gray-50 rounded-xl transition-colors">
                        Sign In
                      </button>
                    </Link>
                    <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                      <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-sky-500 text-white font-bold rounded-xl shadow-lg shadow-blue-200 active:scale-95 transition-transform">
                        Create Account
                      </button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Navbar;