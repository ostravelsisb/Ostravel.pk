import { useState, useEffect } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logoimg/image.png";

// --- Framer Motion & Icons ---
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";
import { FaUserCircle, FaSignOutAlt } from "react-icons/fa"; // Added User Icons

// --- Auth Imports ---
import { useAuth } from "../Context/AuthContext";
import { signOut } from "../firbase";
import { useCurrency } from "../Context/CurrencyContext"; // Added

// --- Config for Navigation Links ---
const navItems = [
  { name: "Home", to: "/" },
  { name: "About Us", to: "/about" },
  { name: "Visa", to: "/visas", dropdownType: "visa" },
  { name: "File Process", to: "/fileprocessing", dropdownType: "fileProcess" },
  { name: "Contact", to: "/contact" },
  { name: "Haj and Ummrah", to: "/haj" },
];

// --- 1. Simple Nav Link Component ---
const SimpleNavLink = ({ item }) => (
  <NavLink
    to={item.to}
    className={({ isActive }) =>
      `relative group py-2 text-sm xl:text-base font-medium transition-colors ${isActive ? "text-blue-600" : "text-gray-700 hover:text-blue-600"}`
    }
  >
    <span className="relative z-10">{item.name}</span>
    <span
      className={`absolute left-0 bottom-0 h-[2px] bg-blue-500 transition-all duration-300 ease-out origin-left scale-x-0 group-hover:scale-x-100 w-full rounded-full ${({ isActive }) => (isActive ? "scale-x-100" : "")
        }`}
    ></span>
  </NavLink>
);

// --- 2. Visa Dropdown Component ---
const VisaDropdown = () => {
  const [activeCategory, setActiveCategory] = useState("Asia");
  const [countries, setCountries] = useState({ Asia: [], Europe: [], Africa: [] });
  const [isLoading, setIsLoading] = useState(true);

  const location = useLocation();
  const isActive = location.pathname.startsWith("/visa");

  useEffect(() => {
    const curatedEuropeNames = new Set([
      "Austria", "Belgium", "Bulgaria", "CzechRepublic", "Denmark", "Estonia",
      "Finland", "France", "Germany", "Greece", "Hungary", "Ireland", "Italy",
      "Lithuania", "Netherlands", "Norway", "Poland", "Portugal", "Romania",
      "Spain", "Switzerland", "United Kingdom"
    ]);

    const curatedAsiaNames = new Set([
      "Azerbaijan", "Bahrain", "China", "Cambodia", "Egypt",
      "Indonesia", "Japan", "Kazakhstan", "Malaysia", "Maldives", "Nepal",
      "Pakistan", "Philippines", "Qatar", "South Korea", "Sri Lanka",
      "Tajikistan", "Thailand", "Turkey", "Vietnam", "Saudi Arabia", "Singapore", "Morocco"
    ]);

    const curatedAfricaNames = new Set([
      "Egypt", "Ethiopia", "Kenya", "South Africa", "Zambia", "Uganda", "Sudan"
    ]);

    const fetchCountries = async () => {
      setIsLoading(true);
      try {
        const [asiaRes, europeRes, africaRes] = await Promise.all([
          fetch("https://restcountries.com/v3.1/region/asia?fields=name,flags,cca3"),
          fetch("https://restcountries.com/v3.1/region/europe?fields=name,flags,cca3"),
          fetch("https://restcountries.com/v3.1/region/africa?fields=name,flags,cca3"),
        ]);

        const asiaData = await asiaRes.json();
        const europeData = await europeRes.json();
        const africaData = await africaRes.json();
        const sortByName = (a, b) => a.name.common.localeCompare(b.name.common);

        setCountries({
          Asia: asiaData.filter((c) => curatedAsiaNames.has(c.name.common)).sort(sortByName),
          Europe: europeData.filter((c) => curatedEuropeNames.has(c.name.common)).sort(sortByName),
          Africa: africaData.filter((c) => curatedAfricaNames.has(c.name.common)).sort(sortByName),
        });
      } catch (error) {
        console.error("Failed to fetch country data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCountries();
  }, []);

  const currentList =
    activeCategory === "Asia" ? countries.Asia
      : activeCategory === "Europe" ? countries.Europe
        : countries.Africa;

  return (
    <div className="relative group">
      <div className={`relative group py-2 cursor-pointer text-sm xl:text-base ${isActive ? "text-blue-600" : ""}`}>
        <span>Visa</span>
        <span className={`absolute left-0 bottom-0 h-0.5 bg-blue-500 transition-all duration-300 group-hover:w-full ${isActive ? "w-full" : "w-0"}`}></span>
      </div>

      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-0 pt-2 hidden group-hover:flex bg-white shadow-2xl rounded-lg overflow-hidden z-50 w-[500px] border border-gray-200">
        <div className="w-1/3 bg-gray-50 border-r border-gray-200">
          {["Asia", "Europe", "Africa"].map((region) => (
            <div
              key={region}
              onMouseEnter={() => setActiveCategory(region)}
              className={`p-4 font-semibold cursor-pointer ${activeCategory === region ? "bg-white text-blue-600" : "hover:bg-gray-100"
                }`}
            >
              {region}
            </div>
          ))}
        </div>
        <div className="w-2/3 h-80 overflow-y-auto p-2">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">Loading...</div>
          ) : (
            currentList.map((country) => (
              <Link
                key={country.cca3}
                to={`/Countries/${country.name.common.toLowerCase()}`}
                className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100"
              >
                <img src={country.flags.png} alt={country.name.common} className="w-6 h-4 object-cover rounded-sm border border-gray-300" />
                <span className="text-sm font-medium">{country.name.common}</span>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// --- 3. File Process Dropdown Component ---
const FileProcessDropdown = () => {
  const [countries, setCountries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const isActive = location.pathname.startsWith("/fileprocessing");

  useEffect(() => {
    const fetchCountries = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("https://restcountries.com/v3.1/alpha?codes=USA,CAN,GBR,AUS&fields=name,flags,cca3");
        const data = await res.json();
        setCountries(data.sort((a, b) => a.name.common.localeCompare(b.name.common)));
      } catch (error) {
        console.error("Failed to fetch file process countries:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCountries();
  }, []);

  return (
    <div className="relative group">
      <div className={`relative group py-2 cursor-pointer text-sm xl:text-base ${isActive ? "text-blue-600" : ""}`}>
        <span>File Process</span>
        <span className={`absolute left-0 bottom-0 h-0.5 bg-blue-500 transition-all duration-300 group-hover:w-full ${isActive ? "w-full" : "w-0"}`}></span>
      </div>
      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-0 pt-2 hidden group-hover:block bg-white shadow-2xl rounded-lg overflow-hidden z-50 w-64 border border-gray-200">
        <div className="overflow-y-auto p-2">
          {isLoading ? (
            <div className="flex items-center justify-center h-full p-4">Loading...</div>
          ) : (
            countries.map((country) => (
              <Link
                key={country.cca3}
                to={`/Countries/${country.name.common.toLowerCase()}`}
                className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-100"
              >
                <img src={country.flags.png} alt={country.name.common} className="w-6 h-4 object-cover rounded-sm border border-gray-300" />
                <span className="text-sm font-medium">{country.name.common}</span>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// --- 4. Main Navbar Component ---
function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Auth Hook
  const { currentUser } = useAuth();
  const { currency, setCurrency, currencies } = useCurrency(); // Added
  const navigate = useNavigate();

  // Logout Handler
  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/login"); // Optional: redirect to login or home after logout
      setIsMobileMenuOpen(false); // Close mobile menu if open
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

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
      <nav className="sticky top-0 left-0 right-0 flex justify-center glass-effect shadow-sm w-full font-bold items-center h-20 px-4 md:px-6 z-50 transition-all duration-300">

        {/* --- DESKTOP NAV (Visible on Large Screens only - lg+) --- */}
        {/* CHANGED: 'md:flex' -> 'lg:flex' to hide on small laptops/tablets */}
        <div className="hidden lg:flex justify-between w-full max-w-7xl items-center">
          <div className="flex gap-8 xl:gap-12 items-center">
            <Link to="/">
              <motion.img
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                src={logo}
                alt="OS Logo Image"
                className="w-[120px] h-[50px] object-contain"
              />
            </Link>
            {/* Nav Items */}
            <div className="flex gap-6 xl:gap-8 items-center cursor-pointer">
              {navItems.map((item) => {
                if (item.dropdownType === "visa") return <VisaDropdown key={item.name} />;
                if (item.dropdownType === "fileProcess") return <FileProcessDropdown key={item.name} />;
                return <SimpleNavLink key={item.name} item={item} />;
              })}
            </div>
          </div>

          {/* Right Side: Auth & Currency */}
          <div className="flex gap-4 xl:gap-6 items-center">
            {/* Currency Selector */}
            <div className="relative group">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="cursor-pointer bg-transparent border border-gray-300 text-gray-700 py-1.5 px-3 rounded-full hover:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm font-bold transition-all"
              >
                {currencies.map(curr => (
                  <option key={curr} value={curr}>{curr}</option>
                ))}
              </select>
            </div>

            {/* --- AUTH CONDITIONAL RENDERING --- */}
            {currentUser ? (
              // Logged In State
              <div className="flex items-center gap-4 pl-4 border-l border-gray-300/50">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    {/* Fallback to email if name isn't set yet */}
                    {currentUser.displayName || "User"}
                    <FaUserCircle className="text-xl text-blue-600" />
                  </span>
                  <span className="text-[10px] text-gray-500 font-normal">{currentUser.email}</span>
                </div>
                <Link
                  to="/dashboard"
                  className="px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 text-xs font-black hover:bg-blue-100 transition-colors uppercase tracking-wide shadow-sm"
                >
                  My Policies
                </Link>
                <motion.button
                  whileHover={{ scale: 1.1, color: "#ef4444" }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleLogout}
                  className="text-gray-400 transition-colors"
                  title="Logout"
                >
                  <FaSignOutAlt className="text-xl" />
                </motion.button>
              </div>
            ) : (
              // Logged Out State
              <>
                <Link to="/login">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="cursor-pointer hover:text-blue-600 transition-colors text-sm xl:text-base font-medium"
                  >
                    Sign in
                  </motion.button>
                </Link>
                <Link to="/signup">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="cursor-pointer border-blue-900 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:shadow-lg hover:shadow-blue-500/30 px-6 py-2 transition-all duration-300 text-sm xl:text-base font-bold"
                  >
                    Create Account
                  </motion.button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* --- MOBILE/TABLET HEADER (Visible on Small Laptops & below - lg-) --- */}
        {/* CHANGED: 'md:hidden' -> 'lg:hidden' to show hamburger on small laptops */}
        <div className="flex lg:hidden justify-between items-center w-full">
          <div className="w-8"></div>
          <div className="flex-1 flex justify-center">
            <Link to="/">
              <img src={logo} alt="OS Logo Image" className="w-[100px] h-10 object-contain" />
            </Link>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-3xl z-50 text-gray-800"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <HiOutlineX /> : <HiOutlineMenu />}
          </button>
        </div>
      </nav>

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
                <img src={logo} alt="OS Logo" className="w-[100px] h-10 object-contain" />
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
              <div className="flex flex-col gap-2">
                {navItems.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `px-4 py-3 rounded-xl text-lg transition-all ${isActive
                        ? "bg-blue-50 text-blue-600 font-bold"
                        : "text-gray-700 hover:bg-gray-50 font-medium"
                      }`
                    }
                  >
                    {item.name}
                  </NavLink>
                ))}
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
                  // Logged In
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
                      className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-200 active:scale-95 transition-transform"
                    >
                      My Policies
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2 text-red-500 font-bold py-3 rounded-xl border border-red-100 hover:bg-red-50 transition-colors"
                    >
                      <FaSignOutAlt /> Sign Out
                    </button>
                  </div>
                ) : (
                  // Logged Out
                  <>
                    <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                      <button className="w-full py-3 text-gray-600 font-bold hover:bg-gray-50 rounded-xl transition-colors">
                        Sign In
                      </button>
                    </Link>
                    <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                      <button className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 active:scale-95 transition-transform">
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