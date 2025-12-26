import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// change it later to railway
// const BASE_URL = "https://uicbackend-production.up.railway.app/api/uic/packages";
const BASE_URL = "http://localhost:5002/api/uic/packages";

export default function InsuranceForm() {
  const navigate = useNavigate();
  const todayDate = new Date();

  // State for form data
  const [formData, setFormData] = useState({
    travelerName: "",
    nicNo: "",
    ntnNo: "",
    dob: "", // YYYY-MM-DD
    travelStart: "", // YYYY-MM-DD
    travelEnd: "",   // YYYY-MM-DD
    travelDays: 0,
    covid: "Not Covered",
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  // Auto calculate travel days
  useEffect(() => {
    if (formData.travelStart && formData.travelEnd) {
      const start = new Date(formData.travelStart);
      const end = new Date(formData.travelEnd);

      // validation to ensure valid dates are parsed
      if (!isNaN(start) && !isNaN(end)) {
        const diff = (end - start) / (1000 * 60 * 60 * 24) + 1;
        setFormData((prev) => ({
          ...prev,
          travelDays: diff > 0 ? Math.ceil(diff) : 0,
        }));
      }
    }
  }, [formData.travelStart, formData.travelEnd]);

  const formatUICDate = (date) => {
    const d = new Date(date);
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  };

  const applyDuration = (days) => {
    if (!formData.travelStart) {
      setErrorMsg("Please select a Departure Date first.");
      return;
    }
    const start = new Date(formData.travelStart);
    const end = new Date(start);
    end.setDate(start.getDate() + (days - 1));

    setFormData(prev => ({
      ...prev,
      travelEnd: end.toISOString().split('T')[0]
    }));
    setErrorMsg("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: null }));
    }
    setFormData({ ...formData, [name]: value });
    if (errorMsg) setErrorMsg("");
  };

  // --- GENERIC DATE HANDLER (For all dropdowns) ---
  const handleDateChange = (key, newDateString) => {
    setFormData(prev => ({ ...prev, [key]: newDateString }));
    if (fieldErrors[key]) setFieldErrors(prev => ({ ...prev, [key]: null }));
  };

  // --- SECURITY: Input Validation & Sanitization ---
  const validateInputs = () => {
    const errors = {};
    const nameRegex = /^[a-zA-Z\s]*$/;
    const cnicRegex = /^[0-9]{13}$/;

    // Dates validation objects
    const start = new Date(formData.travelStart);
    const end = new Date(formData.travelEnd);
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Normalize today

    if (!formData.travelerName.trim()) {
      errors.travelerName = "Full Name is required.";
    } else if (!nameRegex.test(formData.travelerName)) {
      errors.travelerName = "Name should only contain letters.";
    }

    if (!formData.dob) errors.dob = "Date of Birth is required.";

    if (!formData.travelStart) {
      errors.travelStart = "Departure date required.";
    } else if (start < now) {
      errors.travelStart = "Departure cannot be in the past.";
    }

    if (!formData.travelEnd) {
      errors.travelEnd = "Return date required.";
    } else if (end < start) {
      errors.travelEnd = "Return date cannot be before departure.";
    }

    if (formData.nicNo && !cnicRegex.test(formData.nicNo.replace(/-/g, ''))) {
      errors.nicNo = "CNIC must be 13 digits (no dashes).";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    setErrorMsg("");

    if (!validateInputs()) {
      setErrorMsg("Please fix the highlighted errors.");
      return;
    }

    const payload = {
      TravelerName: formData.travelerName.trim(),
      NICNo: formData.nicNo ? formData.nicNo.replace(/-/g, '').trim() : "",
      NTNNo: formData.ntnNo ? formData.ntnNo.trim() : "",
      TravelDays: Number(formData.travelDays),
      DOB: formatUICDate(formData.dob),
      Covid: formData.covid,
    };

    setLoading(true);

    try {
      const res = await fetch(BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store"
        },
        body: JSON.stringify(payload),
      });

      let responseData;
      let packagesArray;

      try {
        responseData = await res.json();
        packagesArray = responseData.data;
      } catch (e) {
        throw new Error("Server returned invalid response structure.");
      }

      if (!res.ok) {
        const apiError = packagesArray?.[0]?.ResponseDescription || "Server Error (HTTP status not OK)";
        throw new Error(apiError);
      }

      if (!Array.isArray(packagesArray)) {
        throw new Error("API returned unexpected data format.");
      }

      if (packagesArray.length > 0 && packagesArray[0].ResponseCode !== "USTI-S001") {
        const apiError = packagesArray[0].ResponseDescription || "API returned a non-success code.";
        throw new Error(apiError);
      }

      navigate("/packages", {
        state: {
          packages: packagesArray,
          searchData: {
            ...formData,
            formattedDOB: formatUICDate(formData.dob),
            formattedStartDate: formatUICDate(formData.travelStart),
            formattedEndDate: formatUICDate(formData.travelEnd),
          },
        },
      });
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full">
      <div className="w-full space-y-6">

        {/* Header */}
        <div className="text-center pb-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Travel Insurance
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Secure your journey with instant quote generation.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-none border border-slate-200 w-full">

          {/* Section 1: Personal Details */}
          <div className="p-4 sm:p-6 md:p-8 bg-white rounded-t-2xl">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6 pb-2 border-b border-slate-100">
              <UserIcon /> Traveler Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <InputField
                label="Full Name"
                name="travelerName"
                icon={<UserIconSmall className="text-slate-400" />}
                value={formData.travelerName}
                onChange={handleChange}
                placeholder="e.g. Munawar Abbas"
                required
                error={fieldErrors.travelerName}
              />

              {/* DOB Dropdowns (Past Years) */}
              <div className="relative group">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <DateSelector
                  value={formData.dob}
                  onChange={(val) => handleDateChange('dob', val)}
                  error={fieldErrors.dob}
                  range="past"
                />
              </div>

              {/* CNIC */}
              <InputField
                label="CNIC (13 Digits)"
                name="nicNo"
                icon={<IdCardIcon className="text-slate-400" />}
                value={formData.nicNo}
                onChange={handleChange}
                placeholder="0000000000000"
                error={fieldErrors.nicNo}
              />

              {/* NTN */}
              <InputField
                label="NTN Number (Optional)"
                name="ntnNo"
                icon={<HashtagIcon className="text-slate-400" />}
                value={formData.ntnNo}
                onChange={handleChange}
                placeholder="Tax Number"
              />
            </div>
          </div>

          {/* Section 2: Trip Details */}
          <div className="p-6 md:p-8 bg-blue-50/30 border-t border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6 pb-2 border-b border-blue-100">
              <PlaneIcon /> Trip Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Departure Date Dropdowns (Future Years) */}
              <div className="relative group">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Departure Date <span className="text-red-500">*</span>
                </label>
                <DateSelector
                  value={formData.travelStart}
                  onChange={(val) => handleDateChange('travelStart', val)}
                  error={fieldErrors.travelStart}
                  range="future"
                />
              </div>

              {/* Return Date Dropdowns (Future Years) */}
              <div className="relative group">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Return Date <span className="text-red-500">*</span>
                </label>
                <DateSelector
                  value={formData.travelEnd}
                  onChange={(val) => handleDateChange('travelEnd', val)}
                  error={fieldErrors.travelEnd}
                  range="future"
                />
              </div>
            </div>

            {/* Quick Duration Buttons */}
            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Quick Duration Select
              </label>
              <div className="flex gap-2 flex-wrap">
                {[7, 10, 15, 30].map(day => (
                  <button
                    key={day}
                    onClick={() => applyDuration(day)}
                    className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-300 rounded-full hover:bg-blue-50 hover:border-blue-300 text-slate-600 transition-colors"
                  >
                    {day} Days
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* Duration Display */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Duration
                </label>
                <div className={`flex items-center px-4 py-3 border rounded-lg sm:text-sm font-medium transition-colors
                    ${formData.travelDays > 0 ? 'bg-blue-50 border-blue-200 text-blue-800' : 'bg-slate-100 border-slate-200 text-slate-400'}
                `}>
                  {formData.travelDays > 0 ? (
                    <span className="font-bold flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4" /> {formData.travelDays} Days
                    </span>
                  ) : (
                    <span>Auto-calculated</span>
                  )}
                </div>
              </div>

              {/* Covid Toggle */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Covid-19 Coverage
                </label>
                <div className="relative">
                  <select
                    name="covid"
                    value={formData.covid}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition sm:text-sm appearance-none"
                  >
                    <option value="Not Covered">Not Covered</option>
                    <option value="Covered">Include Coverage</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="px-8 pb-4">
              <div className="rounded-md bg-red-50 p-4 border border-red-200 flex items-start animate-pulse">
                <div className="shrink-0">
                  <ExclamationCircleIcon className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Submission Failed</h3>
                  <div className="mt-1 text-sm text-red-700">{errorMsg}</div>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="px-8 py-6 bg-slate-50 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-400 text-center md:text-left">
              By clicking search, you agree to the data processing terms.
            </div>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`
                w-full md:w-auto px-8 py-3.5 border border-transparent rounded-xl shadow-lg shadow-blue-500/30 text-sm font-bold text-white uppercase tracking-wider
                bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                transform transition-all duration-150 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100
                flex items-center justify-center gap-2
              `}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  Search Packages <ArrowRightIcon />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- UNIVERSAL DATE SELECTOR COMPONENT ---
// Supports "range" prop: 'past' (for DOB) or 'future' (for Travel)
const DateSelector = ({ value, onChange, error, range = 'past' }) => {
  // Current value splitting
  const [yearStr, monthStr, dayStr] = value ? value.split("-") : ["", "", ""];

  const currentYear = new Date().getFullYear();
  let years = [];

  if (range === 'past') {
    // Last 100 years
    years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  } else {
    // This year + next 5 years
    years = Array.from({ length: 6 }, (_, i) => currentYear + i);
  }

  const months = [
    { val: "01", label: "Jan" }, { val: "02", label: "Feb" }, { val: "03", label: "Mar" },
    { val: "04", label: "Apr" }, { val: "05", label: "May" }, { val: "06", label: "Jun" },
    { val: "07", label: "Jul" }, { val: "08", label: "Aug" }, { val: "09", label: "Sep" },
    { val: "10", label: "Oct" }, { val: "11", label: "Nov" }, { val: "12", label: "Dec" }
  ];
  // Simple 1-31 days
  const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0"));

  const handleSelect = (type, val) => {
    let newY = type === 'y' ? val : (yearStr || currentYear);
    let newM = type === 'm' ? val : (monthStr || "01");
    let newD = type === 'd' ? val : (dayStr || "01");

    // Reconstruct YYYY-MM-DD
    onChange(`${newY}-${newM}-${newD}`);
  };

  const selectClass = `block w-full py-3 px-2 border rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 transition duration-150 text-sm ${error ? 'border-red-300 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
    }`;

  return (
    <div className="grid grid-cols-3 gap-2">
      {/* Day */}
      <select
        value={dayStr}
        onChange={(e) => handleSelect('d', e.target.value)}
        className={selectClass}
      >
        <option value="" disabled>Day</option>
        {days.map(d => <option key={d} value={d}>{d}</option>)}
      </select>

      {/* Month */}
      <select
        value={monthStr}
        onChange={(e) => handleSelect('m', e.target.value)}
        className={selectClass}
      >
        <option value="" disabled>Mon</option>
        {months.map(m => <option key={m.val} value={m.val}>{m.label}</option>)}
      </select>

      {/* Year */}
      <select
        value={yearStr}
        onChange={(e) => handleSelect('y', e.target.value)}
        className={selectClass}
      >
        <option value="" disabled>Year</option>
        {years.map(y => <option key={y} value={y}>{y}</option>)}
      </select>
      {error && <p className="col-span-3 text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
};

// --- Reusable Input Component ---
const InputField = ({ label, name, icon, value, onChange, placeholder, required = false, error }) => (
  <div className="relative group">
    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        {icon}
      </div>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`block w-full pl-10 pr-3 py-3 border rounded-lg leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 transition duration-150 ease-in-out sm:text-sm
                    ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-300 focus:ring-blue-500 focus:border-blue-500'}
                `}
      />
    </div>
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

/* --- Simple SVG Icons --- */
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);
const UserIconSmall = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);
const CalendarIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);
const PlaneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);
const IdCardIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
  </svg>
);
const HashtagIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
  </svg>
);
const ExclamationCircleIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);
const ArrowRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);