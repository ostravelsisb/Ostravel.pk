import React, { useState, useRef, useEffect } from "react";
// Make sure you have react-icons installed: npm install react-icons
import {
  MdFlightTakeoff,
  MdFlightLand,
  MdCalendarToday,
  MdPerson,
  MdAirlineSeatReclineNormal,
} from "react-icons/md";
import { HiPlus, HiMinus, HiChevronDown } from "react-icons/hi2";


// --- Passenger Counter Component ---
// This is the small counter logic for the dropdown
const PassengerCounter = ({ title, description, count, onDecrement, onIncrement, disabledDecrement }) => (
  <div className="flex justify-between items-center py-2">
    <div>
      <span className="font-semibold text-gray-700">{title}</span>
      {description && <p className="text-xs text-gray-500">{description}</p>}
    </div>
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onDecrement}
        disabled={disabledDecrement}
        className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-300 text-blue-600 hover:bg-blue-50 disabled:text-gray-300 disabled:bg-white disabled:cursor-not-allowed"
      >
        <HiMinus />
      </button>
      <span className="font-bold text-lg w-6 text-center">{count}</span>
      <button
        type="button"
        onClick={onIncrement}
        className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-300 text-blue-600 hover:bg-blue-50"
      >
        <HiPlus />
      </button>
    </div>
  </div>
);


function Flights() {
  const [flightType, setFlightType] = useState("Round-trip"); // 'Round-trip' or 'One-way'
  
  // State for passenger dropdown
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0); // Ages 2-11
  const [infants, setInfants] = useState(0); // Under 2
  const [cabinClass, setCabinClass] = useState("Economy");
  const [isPassengerDropdownOpen, setIsPassengerDropdownOpen] = useState(false);

  const passengerRef = useRef(null);
  const dropdownRef = useRef(null);

  // Effect to close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        passengerRef.current &&
        !passengerRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsPassengerDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Format the passenger display text
  const getPassengerDisplayText = () => {
    const total = adults + children + infants;
    return `${total} Passenger${total > 1 ? "s" : ""}, ${cabinClass}`;
  };

  return (
    <div>
      {/* 1. Flight Type Tabs */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setFlightType("Round-trip")}
          className={`px-5 py-2 rounded-full font-semibold transition-colors
            ${
              flightType === "Round-trip"
                ? "bg-blue-100 text-blue-700"
                : "text-gray-600 hover:bg-gray-100"
            }`}
        >
          Round-trip
        </button>
        <button
          onClick={() => setFlightType("One-way")}
          className={`px-5 py-2 rounded-full font-semibold transition-colors
            ${
              flightType === "One-way"
                ? "bg-blue-100 text-blue-700"
                : "text-gray-600 hover:bg-gray-100"
            }`}
        >
          One-way
        </button>
      </div>

      {/* 2. Form Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
        
        {/* Flying From */}
        <div>
          <label htmlFor="from" className="block text-sm font-medium text-gray-700 mb-1">
            Flying From
          </label>
          <div className="relative">
            <MdFlightTakeoff className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
            <input
              type="text"
              id="from"
              placeholder="City or Airport (e.g., LHE)"
              className="w-full h-14 pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Flying To */}
        <div>
          <label htmlFor="to" className="block text-sm font-medium text-gray-700 mb-1">
            Flying To
          </label>
          <div className="relative">
            <MdFlightLand className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
            <input
              type="text"
              id="to"
              placeholder="City or Airport (e.g., DXB)"
              className="w-full h-14 pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Departure Date */}
        <div>
          <label htmlFor="departureDate" className="block text-sm font-medium text-gray-700 mb-1">
            Departure Date
          </label>
          <div className="relative">
            <MdCalendarToday className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="date"
              id="departureDate"
              className="w-full h-14 pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-500"
            />
          </div>
        </div>

        {/* Return Date */}
        <div>
          <label htmlFor="returnDate" className="block text-sm font-medium text-gray-700 mb-1">
            Return Date
          </label>
          <div className="relative">
            <MdCalendarToday className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="date"
              id="returnDate"
              disabled={flightType === "One-way"} // Disable if one-way
              className="w-full h-14 pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {/* Passengers & Class (Spans full width) */}
        <div className="md:col-span-2 relative">
          <label htmlFor="passengers" className="block text-sm font-medium text-gray-700 mb-1">
            Passengers & Class
          </label>
          <button
            ref={passengerRef}
            type="button"
            id="passengers"
            onClick={() => setIsPassengerDropdownOpen(!isPassengerDropdownOpen)}
            className="flex justify-between items-center gap-3 w-full h-14 px-4 py-3 border border-gray-300 rounded-lg text-left hover:border-blue-500"
          >
            <div className="flex items-center gap-3">
              <MdPerson className="text-gray-500 text-xl" />
              <span className="block text-sm font-medium text-gray-700">
                {getPassengerDisplayText()}
              </span>
            </div>
            <HiChevronDown
              className={`text-gray-400 transition-transform ${
                isPassengerDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Passenger Dropdown */}
          {isPassengerDropdownOpen && (
            <div
              ref={dropdownRef}
              className="absolute top-full right-0 mt-2 p-5 bg-white shadow-xl rounded-lg w-full sm:w-[350px] z-20 border border-gray-200"
            >
              <PassengerCounter
                title="Adults"
                description="Ages 12+"
                count={adults}
                onDecrement={() => setAdults((prev) => Math.max(1, prev - 1))}
                onIncrement={() => setAdults((prev) => prev + 1)}
                disabledDecrement={adults <= 1}
              />
              <PassengerCounter
                title="Children"
                description="Ages 2-11"
                count={children}
                onDecrement={() => setChildren((prev) => Math.max(0, prev - 1))}
                onIncrement={() => setChildren((prev) => prev + 1)}
                disabledDecrement={children <= 0}
              />
              <PassengerCounter
                title="Infants"
                description="Under 2, on lap"
                count={infants}
                onDecrement={() => setInfants((prev) => Math.max(0, prev - 1))}
                onIncrement={() => setInfants((prev) => prev + 1)}
                disabledDecrement={infants <= 0}
              />
              
              <hr className="my-4" />

              {/* Cabin Class */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Cabin Class
                </label>
                <div className="relative">
                  <MdAirlineSeatReclineNormal className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select
                    value={cabinClass}
                    onChange={(e) => setCabinClass(e.target.value)}
                    className="w-full h-12 pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                  >
                    <option>Economy</option>
                    <option>Premium Economy</option>
                    <option>Business</option>
                    <option>First</option>
                  </select>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>

      {/* 3. Submit Button */}
      <div className="mt-8">
        <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold text-lg rounded-lg px-16 py-3 transition-colors">
          Search Flights
        </button>
      </div>
    </div>
  );
}

export default Flights;