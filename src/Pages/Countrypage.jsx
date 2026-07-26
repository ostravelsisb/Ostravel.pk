import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { doc, getDoc } from "firebase/firestore";
import { FaGlobeAmericas, FaSearchMinus } from "react-icons/fa";
import { db } from "../firbase";
import SEO from "../Components/SEO";
import CountryTemplate from "../Countries/CountryTemplate";

// Old file statically imported ~50 country .jsx components and mapped slug ->
// component. Countries now live in Firestore (`countries` collection, doc id
// = slug) so admins can add/edit/remove them without a code deploy. This page
// just fetches the one doc it needs and renders it through CountryTemplate.
export default function Countrypage() {
  const { country: countrySlug } = useParams();
  const slug = (countrySlug || "").toLowerCase();

  const [country, setCountry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    setCountry(null);

    getDoc(doc(db, "countries", slug))
      .then((snap) => {
        if (cancelled) return;
        if (snap.exists()) {
          setCountry({ id: snap.id, ...snap.data() });
        } else {
          setNotFound(true);
        }
      })
      .catch((err) => {
        console.error("Error fetching country:", err);
        if (!cancelled) setNotFound(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [slug]);

  if (loading) {
    return (
      <div className="container mx-auto p-10 min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (notFound || !country) {
    return (
      <div className="container mx-auto p-10 min-h-screen flex flex-col items-center justify-center text-center">
        <FaSearchMinus className="text-6xl text-gray-300 mb-6" />
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Country Not Found</h1>
        <p className="text-gray-500 mb-6">
          We couldn't find visa information for "{countrySlug}".
        </p>
        <Link to="/visa" className="inline-flex items-center gap-2 text-blue-600 hover:underline">
          <FaGlobeAmericas /> Browse all countries
        </Link>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={`${country.name} Visa for Pakistani Citizens | O.S. Travel & Tours`}
        description={`Visa requirements, fees, documents and embassy info for ${country.name}.`}
      />
      <CountryTemplate country={country} />
    </>
  );
}