import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  MdLocationCity,
  MdCalendarToday,
  MdPerson,
  MdHotel,
} from "react-icons/md";
import { HiPlus, HiMinus, HiChevronDown, HiXMark, HiChevronRight } from "react-icons/hi2";
import { FaWhatsapp, FaEnvelope } from "react-icons/fa";
import { sendInquiryEmail } from "../Utils/emailService";
import EmailSentPopup from "../Components/EmailSentPopup";

// --- Guest Counter (same pattern as Flights' PassengerCounter) ---
const Counter = ({ title, description, count, onDecrement, onIncrement, disabledDecrement }) => (
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

// Officers who receive hotel inquiries over WhatsApp.
// TODO: replace with the real hotel-desk numbers.
const WHATSAPP_OFFICERS = [
  { name: "Hammad Ahmed", role: "Reservations Officer", number: "923325500377" },
  { name: "Noor Ul Huda", role: "Reservations Officer", number: "923315500177" },
];

const EXIT_DURATION = 200;

// --- "Choose your travel expert" WhatsApp picker modal (same pattern as Flights.jsx) ---
const InquiryModal = ({ onClose, onSelectOfficer }) => {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const closeTimeoutRef = useRef(null);

  useEffect(() => {
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

  const requestClose = () => {
    if (closing) return;
    setOpen(false);
    setClosing(true);
    closeTimeoutRef.current = setTimeout(onClose, EXIT_DURATION);
  };

  const handleSelectOfficer = (officer) => {
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
      aria-labelledby="hotel-inquiry-modal-title"
    >
      <div
        className={`w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-[0_25px_70px_-15px_rgba(15,23,42,0.45)] ring-1 ring-black/5 transition-all duration-250 ease-out ${
          open ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-95"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-600 to-indigo-700 px-6 py-6">
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

          <span className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
            <FaWhatsapp className="h-6 w-6 text-white" />
          </span>
          <h3 id="hotel-inquiry-modal-title" className="relative text-xl font-bold text-white">
            Hotel Inquiry
          </h3>
          <p className="relative mt-1 text-sm text-blue-100">
            Send your details to our expert via WhatsApp
          </p>
        </div>

        <div className="bg-white p-5">
          <p className="mb-4 text-center text-xs font-bold uppercase tracking-wider text-slate-400">
            Choose Your Travel Expert
          </p>
          <div className="space-y-3">
            {WHATSAPP_OFFICERS.map((officer) => (
              <button
                key={officer.number + officer.name}
                type="button"
                onClick={() => handleSelectOfficer(officer)}
                className="group flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-left transition-all duration-300 ease-out hover:border-emerald-300 hover:bg-emerald-50 hover:shadow-lg hover:shadow-emerald-100 active:scale-[0.98]"
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

function Hotelform() {
  const [city, setCity] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [rooms, setRooms] = useState(1);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [starRating, setStarRating] = useState("Any");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  const [isGuestDropdownOpen, setIsGuestDropdownOpen] = useState(false);
  const guestRef = useRef(null);
  const dropdownRef = useRef(null);

  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailPopup, setEmailPopup] = useState({ show: false, success: true });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        guestRef.current &&
        !guestRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsGuestDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getGuestDisplayText = () => {
    const total = adults + children;
    return `${rooms} Room${rooms > 1 ? "s" : ""}, ${total} Guest${total > 1 ? "s" : ""}`;
  };

  const formatDate = (d) => {
    if (!d) return "Flexible";
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return d;
    return dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  // Required-field check shared by both WhatsApp and Email flows.
  const validate = () => {
    if (!city.trim()) {
      alert("Please enter a destination city.");
      return false;
    }
    if (!checkIn || !checkOut) {
      alert("Please select both check-in and check-out dates.");
      return false;
    }
    if (!name.trim() || !phone.trim()) {
      alert("Please provide your name and contact number.");
      return false;
    }
    return true;
  };

  const buildDetails = () => ({
    "Destination City": city.trim(),
    "Check In": formatDate(checkIn),
    "Check Out": formatDate(checkOut),
    "Rooms": rooms,
    "Guests": `${adults} Adult${adults > 1 ? "s" : ""}${children ? `, ${children} Child${children > 1 ? "ren" : ""}` : ""}`,
    "Star Rating Preference": starRating,
  });

  const buildWhatsAppMessage = () => {
    const lines = [
      "🏨 *Hotel Booking Inquiry*",
      "",
      `*Destination:* ${city.trim()}`,
      `*Check In:* ${formatDate(checkIn)}`,
      `*Check Out:* ${formatDate(checkOut)}`,
      `*Rooms:* ${rooms}`,
      `*Guests:* ${adults} Adult${adults > 1 ? "s" : ""}${children ? `, ${children} Child${children > 1 ? "ren" : ""}` : ""}`,
      `*Star Rating:* ${starRating}`,
      `*Name:* ${name.trim()}`,
      `*Phone:* ${phone.trim()}`,
    ];
    if (email.trim()) lines.push(`*Email:* ${email.trim()}`);
    if (notes.trim()) lines.push("", `*Notes:* ${notes.trim()}`);
    lines.push("", "Hi, I'd like to get a quote for the hotel above. Please share available options and pricing. Thank you!");
    return lines.join("\n");
  };

  const handleSearchHotels = () => {
    if (!validate()) return;
    setIsInquiryModalOpen(true);
  };

  const sendInquiryToOfficer = (officer) => {
    const message = buildWhatsAppMessage();
    const url = `https://wa.me/${officer.number}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setIsInquiryModalOpen(false);
  };

  const handleSendEmailInquiry = async () => {
    if (!validate()) return;

    setIsSendingEmail(true);
    const { ok } = await sendInquiryEmail({
      type: "Hotel",
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      details: buildDetails(),
      message: notes.trim() || undefined,
    });
    setIsSendingEmail(false);
    setEmailPopup({ show: true, success: ok });
  };

  return (
    <div>
      <EmailSentPopup
        show={emailPopup.show}
        success={emailPopup.success}
        onClose={() => setEmailPopup((p) => ({ ...p, show: false }))}
      />

      {/* 1. Form Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">

        {/* Destination City */}
        <div className="md:col-span-2">
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
            Destination City <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <MdLocationCity className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
            <input
              type="text"
              id="city"
              placeholder="e.g., Makkah, Madinah, Dubai"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
              className="w-full h-14 pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Check In */}
        <div>
          <label htmlFor="checkIn" className="block text-sm font-medium text-gray-700 mb-1">
            Check In <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <MdCalendarToday className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none" />
            <input
              type="date"
              id="checkIn"
              value={checkIn}
              min={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setCheckIn(e.target.value)}
              required
              className="w-full h-14 pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Check Out */}
        <div>
          <label htmlFor="checkOut" className="block text-sm font-medium text-gray-700 mb-1">
            Check Out <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <MdCalendarToday className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none" />
            <input
              type="date"
              id="checkOut"
              value={checkOut}
              min={checkIn || new Date().toISOString().slice(0, 10)}
              onChange={(e) => setCheckOut(e.target.value)}
              required
              className="w-full h-14 pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Rooms & Guests */}
        <div className="relative">
          <label htmlFor="guests" className="block text-sm font-medium text-gray-700 mb-1">
            Rooms & Guests
          </label>
          <button
            ref={guestRef}
            type="button"
            id="guests"
            onClick={() => setIsGuestDropdownOpen(!isGuestDropdownOpen)}
            className="flex justify-between items-center gap-3 w-full h-14 px-4 py-3 border border-gray-300 rounded-lg text-left hover:border-blue-500"
          >
            <div className="flex items-center gap-3">
              <MdPerson className="text-gray-500 text-xl" />
              <span className="block text-sm font-medium text-gray-700">{getGuestDisplayText()}</span>
            </div>
            <HiChevronDown className={`text-gray-400 transition-transform ${isGuestDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {isGuestDropdownOpen && (
            <div
              ref={dropdownRef}
              className="absolute top-full left-0 mt-2 p-5 bg-white shadow-xl rounded-lg w-full sm:w-[350px] z-20 border border-gray-200"
            >
              <Counter
                title="Rooms"
                count={rooms}
                onDecrement={() => setRooms((prev) => Math.max(1, prev - 1))}
                onIncrement={() => setRooms((prev) => prev + 1)}
                disabledDecrement={rooms <= 1}
              />
              <Counter
                title="Adults"
                description="Ages 12+"
                count={adults}
                onDecrement={() => setAdults((prev) => Math.max(1, prev - 1))}
                onIncrement={() => setAdults((prev) => prev + 1)}
                disabledDecrement={adults <= 1}
              />
              <Counter
                title="Children"
                description="Ages 2-11"
                count={children}
                onDecrement={() => setChildren((prev) => Math.max(0, prev - 1))}
                onIncrement={() => setChildren((prev) => prev + 1)}
                disabledDecrement={children <= 0}
              />
            </div>
          )}
        </div>

        {/* Star Rating */}
        <div>
          <label htmlFor="starRating" className="block text-sm font-medium text-gray-700 mb-1">
            Star Rating Preference
          </label>
          <div className="relative">
            <MdHotel className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl z-10 pointer-events-none" />
            <select
              id="starRating"
              value={starRating}
              onChange={(e) => setStarRating(e.target.value)}
              className="w-full h-14 pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option>Any</option>
              <option>3 Star</option>
              <option>4 Star</option>
              <option>5 Star</option>
            </select>
          </div>
        </div>

        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Your Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            placeholder="e.g. Ali Khan"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full h-14 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Contact Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            id="phone"
            placeholder="e.g. 0336 5555666"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            className="w-full h-14 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Email */}
        <div className="md:col-span-2">
          <label htmlFor="hotelEmail" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            id="hotelEmail"
            placeholder="e.g. ali@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-14 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Notes */}
        <div className="md:col-span-2">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Additional Notes
          </label>
          <textarea
            id="notes"
            rows={3}
            placeholder="Anything else we should know about your stay"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* 2. Submit Buttons */}
      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={handleSearchHotels}
          className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold text-lg rounded-lg px-8 py-3 transition-colors flex items-center justify-center gap-2"
        >
          <FaWhatsapp className="text-xl" />
          Send Inquiry on WhatsApp
        </button>
        <button
          type="button"
          onClick={handleSendEmailInquiry}
          disabled={isSendingEmail}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-lg rounded-lg px-8 py-3 transition-colors flex items-center justify-center gap-2"
        >
          <FaEnvelope className="text-lg" />
          {isSendingEmail ? "Sending..." : "Send Inquiry by Email"}
        </button>
      </div>

      {isInquiryModalOpen && (
        <InquiryModal
          onClose={() => setIsInquiryModalOpen(false)}
          onSelectOfficer={sendInquiryToOfficer}
        />
      )}
    </div>
  );
}

export default Hotelform;