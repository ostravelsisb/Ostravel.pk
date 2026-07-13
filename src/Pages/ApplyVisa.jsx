import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import {
    FaPassport, FaUser, FaEnvelope, FaPhone, FaFileUpload,
    FaCheckCircle, FaExclamationCircle, FaGlobe, FaArrowRight, FaEye
} from 'react-icons/fa';
import { getAllCountryNames, getVisaDataByCountry, calculateTotalFee } from '../Data/visaData';

// ImgBB Config (replaces Firebase Storage — was returning 403 Forbidden)
const IMGBB_API_KEY = "339913c8ca610122063ecd903404baa0";

function ApplyVisa() {
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    const [formData, setFormData] = useState({
        fullName: '',
        email: currentUser?.email || '',
        phone: '',
        country: '',
        visaTypeIndex: 0,
        urgentProcessing: false
    });

    const [files, setFiles] = useState({
        personalPhoto: null, // First requirement
        cnicFront: null, cnicBack: null, bankStatement: null,
        passport: null, nicScan: null
    });

    const [uploadProgress, setUploadProgress] = useState({});
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [selectedCountryData, setSelectedCountryData] = useState(null);
    const [demoImage, setDemoImage] = useState(null); // Modal state for demo images

    const countries = getAllCountryNames();

    useEffect(() => {
        const storedCountry = sessionStorage.getItem('selected_visa_country');
        if (storedCountry) setFormData(prev => ({ ...prev, country: storedCountry }));
    }, []);

    useEffect(() => {
        if (!currentUser) navigate('/login');
        if (formData.country) setSelectedCountryData(getVisaDataByCountry(formData.country));
    }, [formData.country, currentUser, navigate]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleFileChange = (e, fieldName) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size < 1 * 1024 * 1024 || file.size > 10 * 1024 * 1024) {
            setErrors(prev => ({ ...prev, [fieldName]: 'Size must be 1MB - 10MB' }));
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
        if (!formData.country) newErrors.country = 'Required';

        const requiredFiles = ['personalPhoto', 'cnicFront', 'cnicBack', 'bankStatement', 'passport', 'nicScan'];
        requiredFiles.forEach(f => { if (!files[f]) newErrors[f] = 'Required'; });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        const appNumber = `VA-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

        try {
            const urls = {};
            await Promise.all(Object.entries(files).map(async ([key, file]) => {
                if (file) urls[key] = await uploadFileToCloud(file, appNumber, key);
            }));

            const totalFee = calculateTotalFee(formData.country, formData.visaTypeIndex, formData.urgentProcessing);
            const visaType = selectedCountryData.visaTypes[formData.visaTypeIndex];

            const visaApplicationData = {
                applicationNumber: appNumber,
                applicantName: formData.fullName,
                email: formData.email,
                phone: formData.phone,
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

            sessionStorage.setItem('pending_visa_application', JSON.stringify(visaApplicationData));
            navigate('/visa-payment');
        } catch (error) {
            setErrors({ submit: 'Upload failed. Check your network.' });
        } finally {
            setLoading(false);
        }
    };

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

                    {/* Personal Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputBox label="Full Name" name="fullName" icon={<FaUser />} value={formData.fullName} onChange={handleInputChange} error={errors.fullName} />
                        <InputBox label="Email Address" name="email" icon={<FaEnvelope />} value={formData.email} onChange={handleInputChange} error={errors.email} />
                        <div className="md:col-span-2">
                            <InputBox label="Phone Number" name="phone" icon={<FaPhone />} value={formData.phone} onChange={handleInputChange} error={errors.phone} />
                        </div>
                    </div>

                    {/* Document Uploads */}
                    <div className="space-y-6">
                        <h3 className="text-2xl font-bold text-slate-900 border-b-2 border-emerald-500 pb-2">Documents</h3>
                        <div className="grid grid-cols-1 gap-4">
                            <FileUploadField
                                name="personalPhoto" label="Personal Photo (White Background)"
                                demoLink="https://www.vietnamimmigration.com/wp-content/uploads/2022/09/photo-requirements-for-vietnam-evisa-application-5.jpg"
                                file={files.personalPhoto} progress={uploadProgress.personalPhoto}
                                error={errors.personalPhoto} onChange={(e) => handleFileChange(e, 'personalPhoto')}
                                onShowDemo={setDemoImage}
                            />
                            <FileUploadField
                                name="cnicFront" label="CNIC Front Scan"
                                demoLink="https://service-strapi-artifacts-a0b1c2d3.s3.eu-west-1.amazonaws.com/national_id_pakistan_CNIC_045a9dd28f.webp"
                                file={files.cnicFront} progress={uploadProgress.cnicFront}
                                error={errors.cnicFront} onChange={(e) => handleFileChange(e, 'cnicFront')}
                                onShowDemo={setDemoImage}
                            />
                            <FileUploadField
                                name="cnicBack" label="CNIC Back Scan"
                                demoLink="https://service-strapi-artifacts-a0b1c2d3.s3.eu-west-1.amazonaws.com/national_id_pakistan_CNIC_045a9dd28f.webp"
                                file={files.cnicBack} progress={uploadProgress.cnicBack}
                                error={errors.cnicBack} onChange={(e) => handleFileChange(e, 'cnicBack')}
                                onShowDemo={setDemoImage}
                            />
                            <FileUploadField
                                name="passport" label="Passport Scan (Data Page)"
                                demoLink="https://upload.wikimedia.org/wikipedia/commons/c/cf/Pakistan_Passport_Biodata_Page.jpg"
                                file={files.passport} progress={uploadProgress.passport}
                                error={errors.passport} onChange={(e) => handleFileChange(e, 'passport')}
                                onShowDemo={setDemoImage}
                            />
                            <FileUploadField
                                name="bankStatement" label="Bank Statement"
                                file={files.bankStatement} progress={uploadProgress.bankStatement}
                                error={errors.bankStatement} onChange={(e) => handleFileChange(e, 'bankStatement')}
                            />
                            <FileUploadField
                                name="nicScan" label="NIC Scan / Other Docs"
                                file={files.nicScan} progress={uploadProgress.nicScan}
                                error={errors.nicScan} onChange={(e) => handleFileChange(e, 'nicScan')}
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

const InputBox = ({ label, name, icon, value, onChange, error }) => (
    <div className="space-y-2 text-left">
        <label className="block text-sm font-bold text-slate-700 flex items-center gap-2">{icon} {label}</label>
        <input type="text" name={name} value={value} onChange={onChange} className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all ${error ? 'border-red-500' : 'border-slate-200'}`} />
    </div>
);

const FileUploadField = ({ name, label, file, progress, error, onChange, demoLink, onShowDemo }) => (
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
        <div className={`relative border-2 border-dashed rounded-xl p-4 transition-all ${error ? 'border-red-500 bg-red-50' : file ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 hover:border-emerald-400'}`}>
            <input type="file" id={name} onChange={onChange} className="hidden" accept="image/jpeg,image/png" />
            <label htmlFor={name} className="cursor-pointer flex items-center justify-between">
                <div>
                    <p className="text-sm font-bold text-slate-800 truncate max-w-[200px]">{file ? file.name : 'Click to upload scan'}</p>
                    <p className="text-xs text-slate-500">{file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : '1MB - 10MB (JPG, PNG)'}</p>
                </div>
                {file && <FaCheckCircle className="text-emerald-500 text-xl" />}
            </label>
            {progress > 0 && progress < 100 && (
                <div className="absolute bottom-0 left-0 h-1 bg-emerald-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
            )}
        </div>
        {error && <p className="mt-1 text-[10px] text-red-600 font-bold">{error}</p>}
    </div>
);

export default ApplyVisa;