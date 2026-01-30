import React, { useState, useEffect } from "react";
// Import useNavigate for navigation
import { useNavigate } from "react-router-dom";
import {
  FaMapMarkerAlt,
  FaPlaneDeparture,
} from "react-icons/fa"; // Only keeping the necessary icons

function VisaForm() {
  // --- State for Countries and Form Data ---
  const [countries, setCountries] = useState([]);
  const [selectedDestination, setSelectedDestination] = useState("");
  const [destinationFlag, setDestinationFlag] = useState(""); // To store the flag url of selected country
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  // --- Fetch Countries on Load ---
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await fetch(
          "https://restcountries.com/v3.1/all?fields=name,flags"
        );
        const data = await res.json();
        // Sort alphabetically
        const sorted = data.sort((a, b) =>
          a.name.common.localeCompare(b.name.common)
        );
        setCountries(sorted);
      } catch (error) {
        console.error("Error fetching countries:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCountries();
  }, []);

  // --- Handle Dropdown Change ---
  const handleCountryChange = (e) => {
    const countryName = e.target.value;
    setSelectedDestination(countryName);

    // Find the flag for the selected country to display it visually
    const countryData = countries.find(c => c.name.common === countryName);
    if (countryData) {
      setDestinationFlag(countryData.flags.png);
    } else {
      setDestinationFlag(""); // Clear flag if "Select Country..." is chosen
    }
  };

  // --- Handle Submit / Navigation ---
  const handleSubmit = () => {
    if (selectedDestination) {
      // Navigate to the dynamic country page, e.g. /Countries/france
      navigate(`/Countries/${selectedDestination.toLowerCase()}`);
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
            {/* Flag of Pakistan (Hardcoded) */}
            <img
              src="https://flagcdn.com/w40/pk.png"
              alt="PK"
              className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-4 object-cover rounded-sm"
            />
          </div>
        </div>

        {/* --- "TO" Field (Dropdown with Countries) --- */}
        <div>
          <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-1">
            Destination Country
          </label>
          <div className="relative">
            <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

            <select
              id="destination"
              onChange={handleCountryChange}
              value={selectedDestination}
              className="w-full h-14 pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none"
            >
              <option value="">Select Country...</option>
              {isLoading ? (
                <option>Loading countries...</option>
              ) : (
                countries.map((country) => (
                  <option key={country.name.common} value={country.name.common}>
                    {country.name.common}
                  </option>
                ))
              )}
            </select>

            {/* Show selected country flag on the right side if selected */}
            {destinationFlag && (
              <img
                src={destinationFlag}
                alt="Flag"
                className="absolute right-8 top-1/2 -translate-y-1/2 w-6 h-4 object-cover rounded-sm shadow-sm"
              />
            )}

            {/* Custom arrow for select dropdown */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

        {/* 3. Submit Button (Inside Grid or Full Width below?) - Moving below for cleaner look */}
        <div className="md:col-span-2 mt-4">
          {/* Added onClick handler to navigate */}
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