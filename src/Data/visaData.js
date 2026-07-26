import { collection, getDocs } from "firebase/firestore";
import { db } from "../firbase";

// Was: a hardcoded object with ~18 countries and a fixed PKR fee per visa
// type. That's why editing a fee in Admin > Countries never changed
// checkout — this file never looked at Firestore at all.
//
// Now: builds the exact same shape (visaCountriesData keyed by slug) from
// the live `countries` collection, so there's one source of truth for both
// the /visa/:country info page and the Apply Visa checkout flow.
//
// Fetched once per page load and cached — call ensureVisaCountriesData()
// before using getAllCountryNames/getVisaDataByCountry/calculateTotalFee.

let cache = null; // { [slug]: { country, visaTypes: [...], urgentFee, allowUrgent } }
let inFlight = null;

function parseFeeToNumber(feeStr) {
  if (typeof feeStr === "number") return feeStr;
  if (!feeStr) return 0;
  const digits = String(feeStr).replace(/[^0-9]/g, "");
  return digits ? Number(digits) : 0;
}

function docToCountryData(doc) {
  return {
    country: doc.name,
    visaTypes: (doc.visaCards || []).map((v) => ({
      type: v.title,
      fee: parseFeeToNumber(v.totalFee),
      processingTime: v.processingTime || "",
      validity: v.validity || "",
      stayDuration: v.stay || "",
      category: v.category || "",
    })),
    // Not part of the visa-info schema (no admin field for it yet) — default
    // to no urgent option until Admin > Countries grows an "Urgent Fee" input.
    urgentFee: doc.urgentFee || 0,
    allowUrgent: !!doc.allowUrgent,
  };
}

export async function ensureVisaCountriesData() {
  if (cache) return cache;
  if (inFlight) return inFlight;

  inFlight = (async () => {
    const snap = await getDocs(collection(db, "countries"));
    const data = {};
    snap.docs.forEach((d) => {
      data[d.id] = docToCountryData(d.data());
    });
    cache = data;
    inFlight = null;
    return data;
  })();

  return inFlight;
}

// Call this if you know data changed (e.g. after an admin edit in the same
// session) and need fresh data instead of the cached copy.
export function invalidateVisaCountriesCache() {
  cache = null;
}

export const getAllCountryNames = (data) =>
  Object.entries(data || {}).map(([key, val]) => ({ key, name: val.country }));

export const getVisaDataByCountry = (data, countryKey) => (data || {})[countryKey] || null;

export const calculateTotalFee = (data, countryKey, visaTypeIndex, isUrgent) => {
  const countryData = getVisaDataByCountry(data, countryKey);
  if (!countryData) return 0;

  const visaType = countryData.visaTypes[visaTypeIndex];
  if (!visaType) return 0;

  const baseFee = visaType.fee;
  const urgentFee = isUrgent && countryData.allowUrgent ? countryData.urgentFee : 0;

  return baseFee + urgentFee;
};