import React, { useState, useEffect } from "react";
import { collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firbase";
import { motion, AnimatePresence } from "framer-motion";
import {
  MdAdd, MdEdit, MdDelete, MdClose, MdSave, MdCancel, MdSearch,
} from "react-icons/md";
import { FaGlobeAmericas, FaPassport } from "react-icons/fa";
import { notify } from "./Toast";
import { invalidateVisaCountriesCache } from "../Data/visaData";

const ICON_OPTIONS = [
  "FaPassport", "FaMoneyBillWave", "FaClock", "FaCalendarAlt", "FaPlane",
  "FaHotel", "FaUmbrellaBeach", "FaMountain", "FaBriefcase", "FaCalendarCheck",
  "FaCar", "FaFileSignature", "FaGavel", "FaLaptopCode", "FaPaw", "FaSyringe",
];

const PROCESSING_TYPES = [
  { value: "visa", label: "Visa Processing" },
  { value: "file", label: "File Processing" },
];

const emptyVisaCard = () => ({
  title: "", subtitle: "", totalFee: "", processingTime: "", validity: "",
  stay: "", category: "", documents: [], note: "", processingType: "visa",
});
const emptyOffice = () => ({ label: "Embassy", title: "", address: "", phone: "", fax: "", email: "", note: "" });
const emptyFaq = () => ({ q: "", a: "" });
const emptyReview = () => ({ name: "", quote: "", rating: 5 });
const emptyServiceCard = () => ({ icon: "FaCheckCircle", title: "", desc: "" });

const emptyCountry = () => ({
  slug: "", name: "", flagCode: "", applyKey: "",
  visaCards: [emptyVisaCard()],
  officeInfos: [emptyOffice()],
  faqs: [], reviews: [], serviceCards: [],
});

export default function CountriesManagement() {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingSlug, setEditingSlug] = useState(null); // null = creating new
  const [form, setForm] = useState(emptyCountry());
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => { fetchCountries(); }, []);

  const fetchCountries = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "countries"));
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => a.name.localeCompare(b.name));
      setCountries(list);
    } catch (err) {
      console.error(err);
      notify.error("Failed to load countries");
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingSlug(null);
    setForm(emptyCountry());
    setShowModal(true);
  };

  const openEdit = (country) => {
    setEditingSlug(country.id);
    setForm({
      slug: country.id,
      name: country.name || "",
      flagCode: country.flagCode || "",
      applyKey: country.applyKey || country.id,
      visaCards: country.visaCards?.length ? country.visaCards : [emptyVisaCard()],
      officeInfos: country.officeInfos?.length ? country.officeInfos : [emptyOffice()],
      faqs: country.faqs || [],
      reviews: country.reviews || [],
      serviceCards: country.serviceCards || [],
    });
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditingSlug(null); };

  const slugify = (s) =>
    s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleSave = async () => {
    if (!form.name.trim()) return notify.error("Country name is required");
    const slug = editingSlug || slugify(form.slug || form.name);
    if (!slug) return notify.error("Could not derive a valid slug from the name");

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        flagCode: (form.flagCode || "un").trim().toLowerCase(),
        applyKey: (form.applyKey || slug).trim(),
        visaCards: form.visaCards.filter((v) => v.title),
        officeInfos: form.officeInfos.filter((o) => o.title || o.address),
        faqs: form.faqs.filter((f) => f.q),
        reviews: form.reviews.filter((r) => r.name),
        serviceCards: form.serviceCards.filter((s) => s.title),
      };
      await setDoc(doc(db, "countries", slug), payload, { merge: false });
      invalidateVisaCountriesCache(); // keep Apply Visa checkout in sync with this edit
      notify.success(editingSlug ? "Country updated" : "Country added");
      closeModal();
      fetchCountries();
    } catch (err) {
      console.error(err);
      notify.error("Failed to save country");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (slug) => {
    try {
      await deleteDoc(doc(db, "countries", slug));
      invalidateVisaCountriesCache();
      notify.success("Country removed");
      setConfirmDelete(null);
      fetchCountries();
    } catch (err) {
      console.error(err);
      notify.error("Failed to delete country");
    }
  };

  const filtered = countries.filter((c) =>
    c.name?.toLowerCase().includes(search.toLowerCase())
  );

  // --- helpers for editing nested arrays in the form ---
  const updateArrItem = (key, i, patch) => {
    setForm((f) => {
      const arr = [...f[key]];
      arr[i] = { ...arr[i], ...patch };
      return { ...f, [key]: arr };
    });
  };
  const addArrItem = (key, empty) => setForm((f) => ({ ...f, [key]: [...f[key], empty()] }));
  const removeArrItem = (key, i) => setForm((f) => ({ ...f, [key]: f[key].filter((_, idx) => idx !== i) }));

  const updateDocuments = (vi, text) => {
    updateArrItem("visaCards", vi, { documents: text.split("\n").map((l) => l.trim()).filter(Boolean) });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaGlobeAmericas className="text-blue-500" /> Countries
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Add, edit, or remove the visa pages shown on the site — changes go live immediately.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition-colors"
        >
          <MdAdd className="text-xl" /> Add Country
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-sm">
        <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search countries..."
          className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading countries...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th className="p-3">Country</th>
                <th className="p-3">Slug (URL)</th>
                <th className="p-3">Visa Types</th>
                <th className="p-3">FAQs</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="p-3 flex items-center gap-2 font-medium text-gray-800">
                    <img
                      src={`https://flagcdn.com/w40/${c.flagCode}.png`}
                      alt={c.name}
                      className="w-6 h-4 object-cover rounded shadow-sm"
                      onError={(e) => (e.target.style.visibility = "hidden")}
                    />
                    {c.name}
                  </td>
                  <td className="p-3 text-gray-500">/visa/{c.id}</td>
                  <td className="p-3">{c.visaCards?.length || 0}</td>
                  <td className="p-3">{c.faqs?.length || 0}</td>
                  <td className="p-3 text-right">
                    <button onClick={() => openEdit(c)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg mr-1">
                      <MdEdit />
                    </button>
                    <button onClick={() => setConfirmDelete(c.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                      <MdDelete />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-gray-400">No countries found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete confirm */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-white rounded-xl p-6 max-w-sm w-full"
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Remove this country?</h3>
              <p className="text-sm text-gray-500 mb-6">
                This deletes the "{confirmDelete}" visa page. This can't be undone.
              </p>
              <div className="flex justify-end gap-2">
                <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100">Cancel</button>
                <button onClick={() => handleDelete(confirmDelete)} className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center p-4 overflow-y-auto"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-white rounded-xl w-full max-w-3xl my-8"
              initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}>
              <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white rounded-t-xl">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <FaPassport className="text-blue-500" />
                  {editingSlug ? `Edit ${form.name}` : "Add Country"}
                </h2>
                <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg"><MdClose /></button>
              </div>

              <div className="p-5 space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Basics */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500">Country Name *</label>
                    <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full mt-1 p-2 border border-gray-200 rounded-lg" placeholder="Nepal" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500">
                      URL Slug {editingSlug && "(locked)"}
                    </label>
                    <input value={form.slug} disabled={!!editingSlug}
                      onChange={(e) => setForm({ ...form, slug: e.target.value })}
                      className="w-full mt-1 p-2 border border-gray-200 rounded-lg disabled:bg-gray-50"
                      placeholder="auto-generated from name if left blank" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500">Flag Code (ISO-2, e.g. np, uk, ae)</label>
                    <input value={form.flagCode} onChange={(e) => setForm({ ...form, flagCode: e.target.value })}
                      className="w-full mt-1 p-2 border border-gray-200 rounded-lg" placeholder="np" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500">Apply-form Key</label>
                    <input value={form.applyKey} onChange={(e) => setForm({ ...form, applyKey: e.target.value })}
                      className="w-full mt-1 p-2 border border-gray-200 rounded-lg" placeholder="nepal" />
                  </div>
                </div>

                {/* Visa Cards */}
                <Section title="Visa Types" onAdd={() => addArrItem("visaCards", emptyVisaCard)}>
                  {form.visaCards.map((v, i) => (
                    <div key={i} className="border border-gray-200 rounded-lg p-4 mb-3 relative">
                      <RemoveBtn onClick={() => removeArrItem("visaCards", i)} />
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Title" value={v.title} onChange={(val) => updateArrItem("visaCards", i, { title: val })} />
                        <Field label="Subtitle" value={v.subtitle} onChange={(val) => updateArrItem("visaCards", i, { subtitle: val })} />
                        <Field label="Fee" value={v.totalFee} onChange={(val) => updateArrItem("visaCards", i, { totalFee: val })} />
                        <Field label="Processing Time" value={v.processingTime} onChange={(val) => updateArrItem("visaCards", i, { processingTime: val })} />
                        <Field label="Validity" value={v.validity} onChange={(val) => updateArrItem("visaCards", i, { validity: val })} />
                        <Field label="Stay Duration" value={v.stay} onChange={(val) => updateArrItem("visaCards", i, { stay: val })} />
                        <Field label="Category" value={v.category} onChange={(val) => updateArrItem("visaCards", i, { category: val })} />
                        <div>
                          <label className="text-xs font-semibold text-gray-500">Processing Type</label>
                          <select value={v.processingType || "visa"}
                            onChange={(e) => updateArrItem("visaCards", i, { processingType: e.target.value })}
                            className="w-full mt-1 p-2 border border-gray-200 rounded-lg">
                            {PROCESSING_TYPES.map((pt) => <option key={pt.value} value={pt.value}>{pt.label}</option>)}
                          </select>
                        </div>
                      </div>
                      <label className="text-xs font-semibold text-gray-500 mt-3 block">Documents (one per line)</label>
                      <textarea value={(v.documents || []).join("\n")} onChange={(e) => updateDocuments(i, e.target.value)}
                        rows={4} className="w-full mt-1 p-2 border border-gray-200 rounded-lg text-sm" />
                      <label className="text-xs font-semibold text-gray-500 mt-3 block">Note</label>
                      <input value={v.note} onChange={(e) => updateArrItem("visaCards", i, { note: e.target.value })}
                        className="w-full mt-1 p-2 border border-gray-200 rounded-lg" />
                    </div>
                  ))}
                </Section>

                {/* Office Info */}
                <Section title="Embassy / Consulate / VFS Info" onAdd={() => addArrItem("officeInfos", emptyOffice)}>
                  {form.officeInfos.map((o, i) => (
                    <div key={i} className="border border-gray-200 rounded-lg p-4 mb-3 relative">
                      <RemoveBtn onClick={() => removeArrItem("officeInfos", i)} />
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Label (e.g. Embassy)" value={o.label} onChange={(val) => updateArrItem("officeInfos", i, { label: val })} />
                        <Field label="Title" value={o.title} onChange={(val) => updateArrItem("officeInfos", i, { title: val })} />
                        <Field label="Phone" value={o.phone} onChange={(val) => updateArrItem("officeInfos", i, { phone: val })} />
                        <Field label="Fax" value={o.fax} onChange={(val) => updateArrItem("officeInfos", i, { fax: val })} />
                        <Field label="Email" value={o.email} onChange={(val) => updateArrItem("officeInfos", i, { email: val })} />
                      </div>
                      <label className="text-xs font-semibold text-gray-500 mt-3 block">Address</label>
                      <input value={o.address} onChange={(e) => updateArrItem("officeInfos", i, { address: e.target.value })}
                        className="w-full mt-1 p-2 border border-gray-200 rounded-lg" />
                    </div>
                  ))}
                </Section>

                {/* Service Cards */}
                <Section title="Why Book With Us (Service Cards)" onAdd={() => addArrItem("serviceCards", emptyServiceCard)}>
                  {form.serviceCards.map((s, i) => (
                    <div key={i} className="border border-gray-200 rounded-lg p-4 mb-3 relative">
                      <RemoveBtn onClick={() => removeArrItem("serviceCards", i)} />
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="text-xs font-semibold text-gray-500">Icon</label>
                          <select value={s.icon} onChange={(e) => updateArrItem("serviceCards", i, { icon: e.target.value })}
                            className="w-full mt-1 p-2 border border-gray-200 rounded-lg">
                            {ICON_OPTIONS.map((ic) => <option key={ic} value={ic}>{ic}</option>)}
                          </select>
                        </div>
                        <Field label="Title" value={s.title} onChange={(val) => updateArrItem("serviceCards", i, { title: val })} />
                        <Field label="Description" value={s.desc} onChange={(val) => updateArrItem("serviceCards", i, { desc: val })} />
                      </div>
                    </div>
                  ))}
                </Section>

                {/* FAQs */}
                <Section title="FAQs" onAdd={() => addArrItem("faqs", emptyFaq)}>
                  {form.faqs.map((f, i) => (
                    <div key={i} className="border border-gray-200 rounded-lg p-4 mb-3 relative">
                      <RemoveBtn onClick={() => removeArrItem("faqs", i)} />
                      <Field label="Question" value={f.q} onChange={(val) => updateArrItem("faqs", i, { q: val })} />
                      <label className="text-xs font-semibold text-gray-500 mt-3 block">Answer</label>
                      <textarea value={f.a} onChange={(e) => updateArrItem("faqs", i, { a: e.target.value })}
                        rows={2} className="w-full mt-1 p-2 border border-gray-200 rounded-lg text-sm" />
                    </div>
                  ))}
                </Section>

                {/* Reviews */}
                <Section title="Reviews" onAdd={() => addArrItem("reviews", emptyReview)}>
                  {form.reviews.map((r, i) => (
                    <div key={i} className="border border-gray-200 rounded-lg p-4 mb-3 relative">
                      <RemoveBtn onClick={() => removeArrItem("reviews", i)} />
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Name" value={r.name} onChange={(val) => updateArrItem("reviews", i, { name: val })} />
                        <div>
                          <label className="text-xs font-semibold text-gray-500">Rating</label>
                          <select value={r.rating} onChange={(e) => updateArrItem("reviews", i, { rating: Number(e.target.value) })}
                            className="w-full mt-1 p-2 border border-gray-200 rounded-lg">
                            {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} star</option>)}
                          </select>
                        </div>
                      </div>
                      <label className="text-xs font-semibold text-gray-500 mt-3 block">Quote</label>
                      <textarea value={r.quote} onChange={(e) => updateArrItem("reviews", i, { quote: e.target.value })}
                        rows={2} className="w-full mt-1 p-2 border border-gray-200 rounded-lg text-sm" />
                    </div>
                  ))}
                </Section>
              </div>

              <div className="flex justify-end gap-2 p-5 border-t border-gray-100 sticky bottom-0 bg-white rounded-b-xl">
                <button onClick={closeModal} className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 flex items-center gap-1">
                  <MdCancel /> Cancel
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1 disabled:opacity-50">
                  <MdSave /> {saving ? "Saving..." : "Save Country"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const Section = ({ title, onAdd, children }) => (
  <div>
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">{title}</h3>
      <button onClick={onAdd} className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
        <MdAdd /> Add
      </button>
    </div>
    {children}
  </div>
);

const RemoveBtn = ({ onClick }) => (
  <button onClick={onClick} className="absolute top-3 right-3 p-1 text-red-500 hover:bg-red-50 rounded">
    <MdClose />
  </button>
);

const Field = ({ label, value, onChange }) => (
  <div>
    <label className="text-xs font-semibold text-gray-500">{label}</label>
    <input value={value || ""} onChange={(e) => onChange(e.target.value)}
      className="w-full mt-1 p-2 border border-gray-200 rounded-lg" />
  </div>
);