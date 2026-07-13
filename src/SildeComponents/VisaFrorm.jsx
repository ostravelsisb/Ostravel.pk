import React, { useState, useRef, useEffect } from "react";
// Import useNavigate for navigation
import { useNavigate } from "react-router-dom";
import {
  FaMapMarkerAlt,
  FaPlaneDeparture,
} from "react-icons/fa"; // Only keeping the necessary icons

// --- Static Country List (replaces restcountries.com API — was failing) ---
const countryList = [
  { name: "Australia", code: "au" },
  { name: "Austria", code: "at" },
  { name: "Azerbaijan", code: "az" },
  { name: "Bahrain", code: "bh" },
  { name: "Belgium", code: "be" },
  { name: "Bulgaria", code: "bg" },
  { name: "Canada", code: "ca" },
  { name: "China", code: "cn" },
  { name: "Czech Republic", code: "cz" },
  { name: "Denmark", code: "dk" },
  { name: "Egypt", code: "eg" },
  { name: "Estonia", code: "ee" },
  { name: "Ethiopia", code: "et" },
  { name: "Finland", code: "fi" },
  { name: "France", code: "fr" },
  { name: "Germany", code: "de" },
  { name: "Greece", code: "gr" },
  { name: "Hungary", code: "hu" },
  { name: "Indonesia", code: "id" },
  { name: "Ireland", code: "ie" },
  { name: "Italy", code: "it" },
  { name: "Japan", code: "jp" },
  { name: "Kazakhstan", code: "kz" },
  { name: "Kenya", code: "ke" },
  { name: "Lithuania", code: "lt" },
  { name: "Malaysia", code: "my" },
  { name: "Maldives", code: "mv" },
  { name: "Morocco", code: "ma" },
  { name: "Nepal", code: "np" },
  { name: "Netherlands", code: "nl" },
  { name: "Norway", code: "no" },
  { name: "Philippines", code: "ph" },
  { name: "Poland", code: "pl" },
  { name: "Portugal", code: "pt" },
  { name: "Qatar", code: "qa" },
  { name: "Romania", code: "ro" },
  { name: "Singapore", code: "sg" },
  { name: "South Africa", code: "za" },
  { name: "South Korea", code: "kr" },
  { name: "Spain", code: "es" },
  { name: "Sri Lanka", code: "lk" },
  { name: "Switzerland", code: "ch" },
  { name: "Tajikistan", code: "tj" },
  { name: "Thailand", code: "th" },
  { name: "Turkey", code: "tr" },
  { name: "UAE", code: "ae" },
  { name: "Uganda", code: "ug" },
  { name: "United Kingdom", code: "gb" },
  { name: "USA", code: "us" },
  { name: "Vietnam", code: "vn" },
  { name: "Zambia", code: "zm" },
];

function VisaForm() {
  // --- State for Selected Destination ---
  const [selectedDestination, setSelectedDestination] = useState("");
  const [destinationFlag, setDestinationFlag] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const navigate = useNavigate();

  // --- Close dropdown when clicking outside ---
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Handle Country Select ---
  const handleCountrySelect = (country) => {
    setSelectedDestination(country.name);
    setDestinationFlag(`https://flagcdn.com/w40/${country.code}.png`);
    setIsOpen(false);
  };

  // --- Handle Submit / Navigation ---
  const handleSubmit = () => {
    if (selectedDestination) {
      navigate(`/Countries/${selectedDestination.toLowerCase().replace(/\s+/g, "")}`);
    } else {
      alert("Please select a destination country first.");
    }
  };

  return (
    <div className="w-full p-0 bg-transparent">

      {/* 1. Title */}
      <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 text-center">
        Visa Requirements Check
      </h3>

      {/* 2. Form Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 bg-white p-6 rounded-xl shadow-sm border border-slate-200">

        {/* --- "FROM" Field (Always Pakistan) --- */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Flying From
          </label>
          <div className="relative">
            <FaPlaneDeparture className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" />
            <input
              type="text"
              value="Pakistan"
              readOnly
              className="w-full h-14 pl-12 pr-4 py-3 border border-gray-300 bg-gray-50 rounded-lg focus:outline-none cursor-not-allowed font-semibold text-gray-600"
            />
            <img
              src="https://flagcdn.com/w40/pk.png"
              alt="PK"
              className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-4 object-cover rounded-sm"
            />
          </div>
        </div>

        {/* --- "TO" Field (Custom Dropdown with Flags) --- */}
        <div ref={dropdownRef}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Destination Country
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsOpen((prev) => !prev)}
              className="w-full h-14 pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white flex items-center text-left"
            >
              <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <span className={selectedDestination ? "text-gray-900" : "text-gray-400"}>
                {selectedDestination || "Select Country..."}
              </span>
            </button>

            {/* Selected flag, shown on the closed button */}
            {destinationFlag && (
              <img
                src={destinationFlag}
                alt="Flag"
                className="absolute right-8 top-1/2 -translate-y-1/2 w-6 h-4 object-cover rounded-sm shadow-sm"
              />
            )}

            {/* Arrow */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>

            {/* --- Custom Dropdown List (with flags) --- */}
            {isOpen && (
              <div className="absolute z-50 mt-1 w-full max-h-64 overflow-y-auto bg-white border border-gray-300 rounded-lg shadow-lg">
                {countryList.map((country) => (
                  <button
                    type="button"
                    key={country.code}
                    onClick={() => handleCountrySelect(country)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-blue-50 transition-colors ${selectedDestination === country.name ? "bg-blue-100 font-semibold" : ""
                      }`}
                  >
                    <img
                      src={`https://flagcdn.com/w40/${country.code}.png`}
                      alt={country.name}
                      className="w-6 h-4 object-cover rounded-sm border border-gray-200 flex-shrink-0"
                    />
                    <span className="text-sm text-gray-800">{country.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 3. Submit Button */}
        <div className="md:col-span-2 mt-4">
          <button
            onClick={handleSubmit}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold text-lg rounded-lg px-8 py-3 transition-colors shadow-lg shadow-blue-500/30"
          >
            Check Visa Requirements
          </button>
        </div>
      </div>
    </div>
  );
}

export default VisaForm;