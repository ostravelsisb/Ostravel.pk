import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
// Make sure you have react-icons installed: npm install react-icons
import {
  MdFlightTakeoff,
  MdFlightLand,
  MdCalendarToday,
  MdPerson,
  MdAirlineSeatReclineNormal,
} from "react-icons/md";
import { HiPlus, HiMinus, HiChevronDown, HiXMark, HiChevronRight } from "react-icons/hi2";
import { FaWhatsapp } from "react-icons/fa";


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


// --- Modern Date Picker ---
// Replaces the bland native OS calendar with a themed dropdown that matches
// the blue/green look of the rest of the form.
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAY_LABELS = ["Su","Mo","Tu","We","Th","Fr","Sa"];

const CustomDatePicker = ({ id, value, onChange, placeholder = "Select date", disabled, minDate }) => {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => (value ? new Date(value) : new Date()));
  const wrapRef = useRef(null);

  useEffect(() => {
    if (value) setViewDate(new Date(value));
  }, [value]);

  useEffect(() => {
    const handleClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const toISO = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const selected = value ? new Date(value + "T00:00:00") : null;
  const min = minDate ? new Date(minDate + "T00:00:00") : null;

  const displayLabel = selected
    ? selected.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : placeholder;

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const isSameDay = (a, b) => a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  const isDisabledDay = (d) => {
    if (!min) return false;
    const candidate = new Date(year, month, d);
    return candidate < new Date(min.getFullYear(), min.getMonth(), min.getDate());
  };

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={`w-full h-14 pl-12 pr-4 py-3 border rounded-lg text-left transition-colors ${
          disabled
            ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
            : open
              ? "border-blue-500 ring-2 ring-blue-500 bg-white"
              : "border-gray-300 bg-white hover:border-blue-400"
        } ${selected ? "text-gray-800" : "text-gray-400"}`}
      >
        {displayLabel}
      </button>

      {open && !disabled && (
        <div className="absolute z-30 mt-2 w-[300px] bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 animate-in fade-in zoom-in-95 duration-150">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() => setViewDate(new Date(year, month - 1, 1))}
              className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              ‹
            </button>
            <span className="font-bold text-gray-800 text-sm">{MONTH_NAMES[month]} {year}</span>
            <button
              type="button"
              onClick={() => setViewDate(new Date(year, month + 1, 1))}
              className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              ›
            </button>
          </div>

          {/* Day labels */}
          <div className="grid grid-cols-7 mb-1">
            {DAY_LABELS.map((d) => (
              <div key={d} className="text-center text-[11px] font-bold text-gray-400 py-1">{d}</div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 gap-y-1">
            {cells.map((d, idx) => {
              if (d === null) return <div key={`empty-${idx}`} />;
              const cellDate = new Date(year, month, d);
              const isSelected = isSameDay(cellDate, selected);
              const isToday = isSameDay(cellDate, new Date());
              const isDisabled = isDisabledDay(d);
              return (
                <button
                  key={d}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => { onChange(toISO(cellDate)); setOpen(false); }}
                  className={`mx-auto w-8 h-8 rounded-full text-sm font-semibold flex items-center justify-center transition-colors ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                      : isDisabled
                        ? "text-gray-300 cursor-not-allowed"
                        : isToday
                          ? "border border-blue-400 text-blue-600 hover:bg-blue-50"
                          : "text-gray-700 hover:bg-blue-50"
                  }`}
                >
                  {d}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => { onChange(""); setOpen(false); }}
              className="text-xs font-bold text-gray-400 hover:text-red-500 transition-colors"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => { const t = new Date(); setViewDate(t); onChange(toISO(t)); setOpen(false); }}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
};


// the customer pick who to send the flight inquiry to. TODO: replace these
// placeholder numbers with the real officers' WhatsApp numbers.
const WHATSAPP_OFFICERS = [
  { name: "Hammad Ahmed", role: "Ticketing Officer", number: "923325500377" },
  { name: "Noor Ul Huda", role: "Ticketing Officer", number: "923315500177" },
];

// --- Inquiry Modal ---
// Rendered through a portal directly into document.body so it always sits
// above EVERYTHING regardless of any ancestor's overflow/transform/filter
// (the beach-bg card, blurred backgrounds, etc. all create their own
// stacking contexts that would otherwise clip a "fixed" element).
// How long the exit animation runs for, in ms — kept in sync with the
// `duration-*` classes below so the component unmounts exactly when the
// animation finishes (no flash of a frozen last frame).
const EXIT_DURATION = 200;

const InquiryModal = ({ onClose, onSelectOfficer }) => {
  // `open` drives the enter animation (starts false, flips true right after
  // mount so the "from" state actually paints first). `closing` drives the
  // exit animation and delays the real unmount until it's finished playing.
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const closeTimeoutRef = useRef(null);

  useEffect(() => {
    // Defer to the next frame so the initial (closed) styles are committed
    // before we transition to the open styles — otherwise the browser can
    // coalesce both and skip the animation entirely.
    const raf = requestAnimationFrame(() => setOpen(true));

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e) => {
      if (e.key === "Escape") requestClose();
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(closeTimeoutRef.current);
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Plays the exit animation, then tells the parent to actually unmount us.
  const requestClose = () => {
    if (closing) return;
    setOpen(false);
    setClosing(true);
    closeTimeoutRef.current = setTimeout(onClose, EXIT_DURATION);
  };

  const handleSelectOfficer = (officer) => {
    // Let the tap register visually before the WhatsApp tab steals focus.
    setOpen(false);
    setClosing(true);
    closeTimeoutRef.current = setTimeout(() => onSelectOfficer(officer), EXIT_DURATION);
  };

  return createPortal(
    <div
      className={`fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md transition-opacity duration-200 ease-out ${
        open ? "opacity-100" : "opacity-0"
      }`}
      onClick={requestClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="inquiry-modal-title"
    >
      <div
        className={`w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-[0_25px_70px_-15px_rgba(15,23,42,0.45)] ring-1 ring-black/5 transition-all duration-250 ease-out ${
          open
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-4 scale-95"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-600 to-indigo-700 px-6 py-6">
          {/* Decorative glow — subtle pulse to keep the header feeling alive */}
          <div className="pointer-events-none absolute -top-8 -right-8 h-32 w-32 animate-pulse rounded-full bg-white/10 [animation-duration:3s]" />
          <div className="pointer-events-none absolute -bottom-10 -left-6 h-28 w-28 animate-pulse rounded-full bg-white/10 [animation-duration:4s] [animation-delay:0.5s]" />

          <button
            type="button"
            onClick={requestClose}
            className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/90 transition-all duration-150 hover:rotate-90 hover:bg-white/20 hover:text-white active:scale-90"
            aria-label="Close"
          >
            <HiXMark className="h-5 w-5" />
          </button>

          <span
            className={`mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 transition-all duration-300 ease-out ${
              open ? "scale-100 opacity-100 delay-100" : "scale-50 opacity-0"
            }`}
          >
            <FaWhatsapp className="h-6 w-6 text-white" />
          </span>
          <h3
            id="inquiry-modal-title"
            className={`relative text-xl font-bold text-white transition-all duration-300 ease-out ${
              open ? "translate-y-0 opacity-100 delay-100" : "translate-y-1.5 opacity-0"
            }`}
          >
            Travel Inquiry
          </h3>
          <p
            className={`relative mt-1 text-sm text-blue-100 transition-all duration-300 ease-out ${
              open ? "translate-y-0 opacity-100 delay-150" : "translate-y-1.5 opacity-0"
            }`}
          >
            Send your details to our expert via WhatsApp
          </p>
        </div>

        {/* Officer list */}
        <div className="bg-white p-5">
          <p className="mb-4 text-center text-xs font-bold uppercase tracking-wider text-slate-400">
            Choose Your Travel Expert
          </p>
          <div className="space-y-3">
            {WHATSAPP_OFFICERS.map((officer, i) => (
              <button
                key={officer.number + officer.name}
                type="button"
                onClick={() => handleSelectOfficer(officer)}
                style={{ transitionDelay: open ? `${180 + i * 70}ms` : "0ms" }}
                className={`group flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-left transition-all duration-300 ease-out hover:border-emerald-300 hover:bg-emerald-50 hover:shadow-lg hover:shadow-emerald-100 active:scale-[0.98] ${
                  open ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
                }`}
              >
                <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 text-white shadow-md shadow-emerald-200 transition-transform duration-200 group-hover:scale-110">
                  <FaWhatsapp className="h-5 w-5" />
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-400" />
                </span>
                <span className="flex-1">
                  <span className="block text-[11px] font-bold uppercase tracking-wide text-slate-400">
                    {officer.role}
                  </span>
                  <span className="block text-base font-bold text-slate-900">{officer.name}</span>
                </span>
                <HiChevronRight className="h-5 w-5 shrink-0 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-emerald-500" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

function Flights() {
  const [flightType, setFlightType] = useState("Round-trip"); // 'Round-trip' or 'One-way'

  // Route + date fields (now controlled so they can be used in the WhatsApp message)
  const [fromCity, setFromCity] = useState("");
  const [toCity, setToCity] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");

  // State for passenger dropdown
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0); // Ages 2-11
  const [infants, setInfants] = useState(0); // Under 2
  const [cabinClass, setCabinClass] = useState("Economy");
  const [isPassengerDropdownOpen, setIsPassengerDropdownOpen] = useState(false);

  // Controls the "Choose your travel expert" WhatsApp picker modal, shown
  // after the form validates and before the WhatsApp chat actually opens.
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);

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

  const formatDate = (d) => {
    if (!d) return "Flexible";
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return d;
    return dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  // Builds a prewritten, nicely formatted WhatsApp message from the current
  // form values.
  const buildInquiryMessage = () => {
    const lines = [
      "✈️ *Flight Booking Inquiry*",
      "",
      `*Trip Type:* ${flightType}`,
      `*From:* ${fromCity.trim()}`,
      `*To:* ${toCity.trim()}`,
      `*Departure Date:* ${formatDate(departureDate)}`,
    ];

    if (flightType === "Round-trip") {
      lines.push(`*Return Date:* ${formatDate(returnDate)}`);
    }

    lines.push(
      `*Passengers:* ${adults} Adult${adults > 1 ? "s" : ""}${children ? `, ${children} Child${children > 1 ? "ren" : ""}` : ""}${infants ? `, ${infants} Infant${infants > 1 ? "s" : ""}` : ""}`,
      `*Cabin Class:* ${cabinClass}`,
      "",
      "Hi, I'd like to get a quote for the flight details above. Please share available options and pricing. Thank you!"
    );

    return lines.join("\n");
  };

  // Validates the form, then opens the "Choose your travel expert" modal
  // instead of jumping straight to WhatsApp.
  const handleSearchFlights = () => {
    if (!fromCity.trim() || !toCity.trim()) {
      alert("Please enter both a departure and destination city/airport.");
      return;
    }
    if (!departureDate) {
      alert("Please select a departure date.");
      return;
    }
    setIsInquiryModalOpen(true);
  };

  // Fired when the customer picks one of the two officers in the modal —
  // opens a wa.me chat with that officer's number, message pre-filled.
  const sendInquiryToOfficer = (officer) => {
    const message = buildInquiryMessage();
    const url = `https://wa.me/${officer.number}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setIsInquiryModalOpen(false);
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
              value={fromCity}
              onChange={(e) => setFromCity(e.target.value)}
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
              value={toCity}
              onChange={(e) => setToCity(e.target.value)}
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
            <MdCalendarToday className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none" />
            <CustomDatePicker
              id="departureDate"
              value={departureDate}
              onChange={setDepartureDate}
              placeholder="Select departure date"
              minDate={new Date().toISOString().slice(0, 10)}
            />
          </div>
        </div>

        {/* Return Date */}
        <div>
          <label htmlFor="returnDate" className="block text-sm font-medium text-gray-700 mb-1">
            Return Date
          </label>
          <div className="relative">
            <MdCalendarToday className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none" />
            <CustomDatePicker
              id="returnDate"
              value={returnDate}
              onChange={setReturnDate}
              placeholder="Select return date"
              disabled={flightType === "One-way"}
              minDate={departureDate || new Date().toISOString().slice(0, 10)}
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
        <button
          type="button"
          onClick={handleSearchFlights}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold text-lg rounded-lg px-16 py-3 transition-colors flex items-center justify-center gap-2"
        >
          Send Inquiry on WhatsApp
        </button>
      </div>

      {/* "Choose your travel expert" WhatsApp picker modal — rendered via
          portal so it floats over the ENTIRE page, not just this card. */}
      {isInquiryModalOpen && (
        <InquiryModal
          onClose={() => setIsInquiryModalOpen(false)}
          onSelectOfficer={sendInquiryToOfficer}
        />
      )}
    </div>
  );
}

export default Flights;