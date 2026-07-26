import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import {
    FaPassport, FaUser, FaEnvelope, FaPhone, FaFileUpload, FaIdCard,
    FaCheckCircle, FaExclamationCircle, FaGlobe, FaArrowRight, FaEye
} from 'react-icons/fa';
import { getAllCountryNames, getVisaDataByCountry, calculateTotalFee, ensureVisaCountriesData } from '../Data/visaData';

// ImgBB Config (replaces Firebase Storage — was returning 403 Forbidden)
const IMGBB_API_KEY = "339913c8ca610122063ecd903404baa0";

function ApplyVisa() {
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    const [formData, setFormData] = useState({
        fullName: '',
        email: currentUser?.email || '',
        phone: '',
        cnic: '',
        age: '',
        passportNumber: '',
        country: '',
        visaTypeIndex: 0,
        urgentProcessing: false
    });

    const [files, setFiles] = useState({
        personalPhoto: null, // First requirement
        cnicFront: null, cnicBack: null, bankStatement: null,
        passport: null, nicScan: null, bForm: null, frc: null
    });

    const [uploadProgress, setUploadProgress] = useState({});
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [selectedCountryData, setSelectedCountryData] = useState(null);
    const [demoImage, setDemoImage] = useState(null); // Modal state for demo images

    // Live fee/visa-type data from Firestore (`countries` collection — same
    // data Admin > Countries edits). Fetched once on mount so changing a fee
    // in the admin panel is reflected here on the next page load.
    const [visaCountriesData, setVisaCountriesData] = useState(null);
    const [countryDataLoading, setCountryDataLoading] = useState(true);

    useEffect(() => {
        ensureVisaCountriesData()
            .then(setVisaCountriesData)
            .finally(() => setCountryDataLoading(false));
    }, []);

    // URLs of documents already uploaded in a previous attempt (e.g. before a failed payment).
    // Lets user skip re-uploading files that already made it to the cloud.
    const [existingUrls, setExistingUrls] = useState({});

    const countries = getAllCountryNames(visaCountriesData);

    // Restore any in-progress draft (typed fields) or a fully-uploaded pending application
    // (e.g. user came back here after a failed payment) so nothing has to be re-typed or re-uploaded.
    // Guards against the save-effect firing with the initial blank state before
    // the restore-effect's setFormData has actually applied (which would overwrite
    // the saved draft with blank data on every page load).
    const hasRestoredRef = React.useRef(false);

    useEffect(() => {
        const storedCountry = sessionStorage.getItem('selected_visa_country');

        const draftRaw = localStorage.getItem('visa_form_draft');
        const pendingRaw = localStorage.getItem('pending_visa_application');

        let restored = {};

        if (pendingRaw) {
            try {
                const pending = JSON.parse(pendingRaw);
                restored = {
                    fullName: pending.applicantName || '',
                    email: pending.email || '',
                    phone: pending.phone || '',
                    cnic: pending.cnic || '',
                    age: pending.age || '',
                    passportNumber: pending.passportNumber || '',
                    country: pending.country || '',
                    urgentProcessing: !!pending.urgentProcessing
                };
                if (pending.documentURLs) setExistingUrls(pending.documentURLs);
            } catch { /* ignore bad json */ }
        }

        // Draft (saved on every keystroke) is fresher than a completed pending application,
        // so let it override individual fields if present.
        if (draftRaw) {
            try {
                restored = { ...restored, ...JSON.parse(draftRaw) };
            } catch { /* ignore bad json */ }
        }

        if (storedCountry && !restored.country) restored.country = storedCountry;

        if (Object.keys(restored).length > 0) {
            setFormData(prev => ({ ...prev, ...restored }));
        }

        hasRestoredRef.current = true;
    }, []);

    // Keep the draft saved on every change, so navigating away and back (or a page refresh)
    // never loses what the user already typed. Skipped until restore above has actually run,
    // otherwise this fires first (with the initial blank state) and clobbers the saved draft.
    useEffect(() => {
        if (!hasRestoredRef.current) return;
        localStorage.setItem('visa_form_draft', JSON.stringify(formData));
    }, [formData]);

    useEffect(() => {
        if (!currentUser) navigate('/login');
        if (formData.country) setSelectedCountryData(getVisaDataByCountry(visaCountriesData, formData.country));
    }, [formData.country, currentUser, navigate, visaCountriesData]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
            ...(name === 'country' ? { visaTypeIndex: 0 } : {})
        }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleFileChange = (e, fieldName) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size < 10 * 1024 || file.size > 10 * 1024 * 1024) {
            setErrors(prev => ({ ...prev, [fieldName]: 'Size must be 10KB - 10MB' }));
            return;
        }

        // imgbb only accepts image files — PDF removed
        const allowedTypes = ['image/jpeg', 'image/png'];
        if (!allowedTypes.includes(file.type)) {
            setErrors(prev => ({ ...prev, [fieldName]: 'JPG or PNG only' }));
            return;
        }

        setFiles(prev => ({ ...prev, [fieldName]: file }));
        setErrors(prev => ({ ...prev, [fieldName]: '' }));
    };

    // Uploads a file to imgbb and returns the hosted image URL
    const uploadFileToCloud = (file, appNum, type) => {
        return new Promise((resolve, reject) => {
            const form = new FormData();
            form.append("image", file);
            form.append("name", `${appNum}_${type}`);

            const xhr = new XMLHttpRequest();
            xhr.open("POST", `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`);

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const prog = (event.loaded / event.total) * 100;
                    setUploadProgress(prev => ({ ...prev, [type]: Math.round(prog) }));
                }
            };

            xhr.onload = () => {
                try {
                    const res = JSON.parse(xhr.responseText);
                    if (res.success) {
                        setUploadProgress(prev => ({ ...prev, [type]: 100 }));
                        resolve(res.data.url);
                    } else {
                        reject(new Error(res.error?.message || 'Upload failed'));
                    }
                } catch {
                    reject(new Error('Invalid response from image host'));
                }
            };

            xhr.onerror = () => reject(new Error('Network error during upload'));
            xhr.send(form);
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};

        if (!formData.fullName.trim()) newErrors.fullName = 'Required';
        if (!formData.email.trim()) newErrors.email = 'Required';
        if (!formData.phone.trim()) newErrors.phone = 'Required';
        if (!formData.country) newErrors.country = 'Required';
        if (!formData.cnic.trim()) newErrors.cnic = 'Required';
        if (!formData.age.toString().trim()) newErrors.age = 'Required';
        if (!formData.passportNumber.trim()) newErrors.passportNumber = 'Required';

        const requiredFiles = ['personalPhoto', 'cnicFront', 'cnicBack', 'bankStatement', 'passport', 'nicScan', 'bForm', 'frc'];
        // A file is fine if freshly picked OR already uploaded in a previous attempt.
        requiredFiles.forEach(f => { if (!files[f] && !existingUrls[f]) newErrors[f] = 'Required'; });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        const appNumber = `VA-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

        try {
            // Start from any URLs already uploaded in a previous attempt, so we don't
            // re-upload (and don't lose) files that already succeeded.
            const urls = { ...existingUrls };
            await Promise.all(Object.entries(files).map(async ([key, file]) => {
                if (file) urls[key] = await uploadFileToCloud(file, appNumber, key);
            }));

            const totalFee = calculateTotalFee(visaCountriesData, formData.country, formData.visaTypeIndex, formData.urgentProcessing);
            const visaType = selectedCountryData.visaTypes[formData.visaTypeIndex];

            const visaApplicationData = {
                applicationNumber: appNumber,
                applicantName: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                cnic: formData.cnic,
                age: formData.age,
                passportNumber: formData.passportNumber,
                country: formData.country,
                visaType: visaType.type,
                totalFee,
                documentURLs: urls,
                uid: currentUser.uid,
                userId: currentUser.uid,
                userEmail: currentUser.email,
                userName: formData.fullName,
                status: "Pending",
                applicationDate: new Date().toISOString(),
                urgentProcessing: formData.urgentProcessing,
                // Additional visa details
                visaFee: visaType.fee || totalFee,
                processingTime: visaType.processingTime || '',
                validity: visaType.validity || '',
                stayDuration: visaType.stayDuration || '',
                category: visaType.category || ''
            };

            localStorage.setItem('pending_visa_application', JSON.stringify(visaApplicationData));
            navigate('/visa-payment');
        } catch (error) {
            setErrors({ submit: 'Upload failed. Check your network.' });
        } finally {
            setLoading(false);
        }
    };

    if (countryDataLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full"
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
                    <div className="inline-block p-4 bg-emerald-100 rounded-full mb-4">
                        <FaPassport className="text-5xl text-emerald-600" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-3">Apply for Visa</h1>
                </motion.div>

                <motion.form
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    onSubmit={handleSubmit}
                    className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 space-y-8"
                >
                    {/* Country Section */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                            <FaGlobe className="text-emerald-600" /> Select Country *
                        </label>
                        <select name="country" value={formData.country} onChange={handleInputChange}
                            className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all ${errors.country ? 'border-red-500' : 'border-slate-200'}`}>
                            <option value="">Choose a country...</option>
                            {countries.map(({ key, name }) => <option key={key} value={key}>{name}</option>)}
                        </select>
                    </div>

                    {/* Visa Type Section — shown once country picked. Some countries have 2-3 types (e.g. Pakistan) */}
                    {selectedCountryData && selectedCountryData.visaTypes.length > 0 && (
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                <FaPassport className="text-emerald-600" /> Select Visa Type *
                            </label>
                            {selectedCountryData.visaTypes.length === 1 ? (
                                <div className="px-4 py-3 border-2 border-slate-200 rounded-xl bg-slate-50 text-slate-700">
                                    {selectedCountryData.visaTypes[0].type} — PKR {selectedCountryData.visaTypes[0].fee.toLocaleString()}
                                </div>
                            ) : (
                                <select name="visaTypeIndex" value={formData.visaTypeIndex}
                                    onChange={(e) => setFormData(prev => ({ ...prev, visaTypeIndex: Number(e.target.value) }))}
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all">
                                    {selectedCountryData.visaTypes.map((vt, idx) => (
                                        <option key={idx} value={idx}>
                                            {vt.type} — PKR {vt.fee.toLocaleString()}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                    )}

                    {/* Personal Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputBox label="Full Name" name="fullName" icon={<FaUser />} value={formData.fullName} onChange={handleInputChange} error={errors.fullName} />
                        <InputBox label="Email Address *" name="email" icon={<FaEnvelope />} value={formData.email} onChange={handleInputChange} error={errors.email} />
                        <InputBox label="Phone Number *" name="phone" icon={<FaPhone />} value={formData.phone} onChange={handleInputChange} error={errors.phone} />
                        <InputBox label="CNIC (13 Digits, no dashes)" name="cnic" icon={<FaIdCard />} value={formData.cnic} onChange={handleInputChange} error={errors.cnic} />
                        <InputBox label="Age" name="age" icon={<FaUser />} value={formData.age} onChange={handleInputChange} error={errors.age} type="number" />
                        <InputBox label="Passport Number" name="passportNumber" icon={<FaPassport />} value={formData.passportNumber} onChange={handleInputChange} error={errors.passportNumber} />
                    </div>

                    {/* Document Uploads */}
                    <div className="space-y-6">
                        <h3 className="text-2xl font-bold text-slate-900 border-b-2 border-emerald-500 pb-2">Documents</h3>
                        <div className="grid grid-cols-1 gap-4">
                            <FileUploadField
                                name="personalPhoto" label="Personal Photo (White Background)"
                                demoLink="https://www.vietnamimmigration.com/wp-content/uploads/2022/09/photo-requirements-for-vietnam-evisa-application-5.jpg"
                                file={files.personalPhoto} progress={uploadProgress.personalPhoto}
                                alreadyUploaded={!!existingUrls.personalPhoto}
                                error={errors.personalPhoto} onChange={(e) => handleFileChange(e, 'personalPhoto')}
                                onShowDemo={setDemoImage}
                            />
                            <FileUploadField
                                name="cnicFront" label="CNIC Front Scan"
                                demoLink="https://service-strapi-artifacts-a0b1c2d3.s3.eu-west-1.amazonaws.com/national_id_pakistan_CNIC_045a9dd28f.webp"
                                file={files.cnicFront} progress={uploadProgress.cnicFront}
                                alreadyUploaded={!!existingUrls.cnicFront}
                                error={errors.cnicFront} onChange={(e) => handleFileChange(e, 'cnicFront')}
                                onShowDemo={setDemoImage}
                            />
                            <FileUploadField
                                name="cnicBack" label="CNIC Back Scan"
                                demoLink="https://service-strapi-artifacts-a0b1c2d3.s3.eu-west-1.amazonaws.com/national_id_pakistan_CNIC_045a9dd28f.webp"
                                file={files.cnicBack} progress={uploadProgress.cnicBack}
                                alreadyUploaded={!!existingUrls.cnicBack}
                                error={errors.cnicBack} onChange={(e) => handleFileChange(e, 'cnicBack')}
                                onShowDemo={setDemoImage}
                            />
                            <FileUploadField
                                name="passport" label="Passport Scan (Data Page)"
                                demoLink="https://upload.wikimedia.org/wikipedia/commons/c/cf/Pakistan_Passport_Biodata_Page.jpg"
                                file={files.passport} progress={uploadProgress.passport}
                                alreadyUploaded={!!existingUrls.passport}
                                error={errors.passport} onChange={(e) => handleFileChange(e, 'passport')}
                                onShowDemo={setDemoImage}
                            />
                            <FileUploadField
                                name="bankStatement" label="Bank Statement"
                                file={files.bankStatement} progress={uploadProgress.bankStatement}
                                alreadyUploaded={!!existingUrls.bankStatement}
                                error={errors.bankStatement} onChange={(e) => handleFileChange(e, 'bankStatement')}
                            />
                            <FileUploadField
                                name="nicScan" label="NIC Scan / Other Docs"
                                file={files.nicScan} progress={uploadProgress.nicScan}
                                alreadyUploaded={!!existingUrls.nicScan}
                                error={errors.nicScan} onChange={(e) => handleFileChange(e, 'nicScan')}
                            />
                            <FileUploadField
                                name="bForm" label="B-Form"
                                file={files.bForm} progress={uploadProgress.bForm}
                                alreadyUploaded={!!existingUrls.bForm}
                                error={errors.bForm} onChange={(e) => handleFileChange(e, 'bForm')}
                            />
                            <FileUploadField
                                name="frc" label="Family Registration Certificate (FRC)"
                                file={files.frc} progress={uploadProgress.frc}
                                alreadyUploaded={!!existingUrls.frc}
                                error={errors.frc} onChange={(e) => handleFileChange(e, 'frc')}
                            />
                        </div>
                    </div>

                    <button type="submit" disabled={loading}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl font-black text-lg shadow-lg flex items-center justify-center gap-3 transition-all disabled:opacity-50">
                        {loading ? 'Uploading Files...' : 'Proceed to Payment'}
                        {!loading && <FaArrowRight />}
                    </button>
                    {errors.submit && <p className="text-center text-sm text-red-600 font-bold">{errors.submit}</p>}
                </motion.form>
            </div>

            {/* Demo Image Modal */}
            <AnimatePresence>
                {demoImage && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
                        onClick={() => setDemoImage(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="relative max-w-3xl bg-white p-2 rounded-2xl shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <button onClick={() => setDemoImage(null)} className="absolute -top-12 right-0 text-white flex items-center gap-2 font-bold bg-white/10 px-4 py-2 rounded-full hover:bg-white/20 transition">Close <FaArrowRight className="rotate-45" /></button>
                            <img src={demoImage} alt="Demo" className="max-h-[80vh] rounded-xl object-contain shadow-lg" />
                            <div className="p-4 text-center">
                                <p className="font-bold text-slate-800">Ensure your upload looks similar to this example.</p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

const InputBox = ({ label, name, icon, value, onChange, error, type = 'text' }) => (
    <div className="space-y-2 text-left">
        <label className="block text-sm font-bold text-slate-700 flex items-center gap-2">{icon} {label}</label>
        <input type={type} name={name} value={value} onChange={onChange} className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all ${error ? 'border-red-500' : 'border-slate-200'}`} />
        {error && <p className="text-[10px] text-red-600 font-bold">{error}</p>}
    </div>
);

const FileUploadField = ({ name, label, file, progress, error, onChange, demoLink, onShowDemo, alreadyUploaded }) => (
    <div className="text-left">
        <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-bold text-slate-700 flex items-center gap-2"><FaFileUpload className="text-emerald-600" /> {label} *</label>
            {demoLink && (
                <button
                    type="button"
                    onClick={() => onShowDemo(demoLink)}
                    className="text-[10px] font-black text-blue-600 hover:text-blue-800 flex items-center gap-1 uppercase tracking-tighter"
                >
                    <FaEye /> View Demo
                </button>
            )}
        </div>
        <div className={`relative border-2 border-dashed rounded-xl p-4 transition-all ${error ? 'border-red-500 bg-red-50' : (file || alreadyUploaded) ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 hover:border-emerald-400'}`}>
            <input type="file" id={name} onChange={onChange} className="hidden" accept="image/jpeg,image/png" />
            <label htmlFor={name} className="cursor-pointer flex items-center justify-between">
                <div>
                    <p className="text-sm font-bold text-slate-800 truncate max-w-[200px]">
                        {file ? file.name : alreadyUploaded ? 'Already uploaded — click to replace' : 'Click to upload scan'}
                    </p>
                    <p className="text-xs text-slate-500">
                        {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : alreadyUploaded ? 'Saved from your last attempt' : '10KB - 10MB (JPG, PNG)'}
                    </p>
                </div>
                {(file || alreadyUploaded) && <FaCheckCircle className="text-emerald-500 text-xl" />}
            </label>
            {progress > 0 && progress < 100 && (
                <div className="absolute bottom-0 left-0 h-1 bg-emerald-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
            )}
        </div>
        {error && <p className="mt-1 text-[10px] text-red-600 font-bold">{error}</p>}
    </div>
);

export default ApplyVisa;