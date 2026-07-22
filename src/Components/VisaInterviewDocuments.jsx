import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../firbase';
import { doc, updateDoc } from 'firebase/firestore';
import {
    FaFileMedical, FaTimes, FaPlus, FaFileAlt, FaTrash,
    FaExternalLinkAlt, FaPaperPlane, FaSpinner
} from 'react-icons/fa';
import { sendInterviewDocumentsEmail } from '../Utils/emailService';

// Same host used for decision-letter uploads elsewhere in the app —
// Firebase Storage direct uploads return 403 in this project, so ImgBB
// is used instead. Keeps this consistent with uploadDecisionLetter().
const IMGBB_API_KEY = "339913c8ca610122063ecd903404baa0";

function uploadToImgbb(file, labelForName) {
    return new Promise((resolve, reject) => {
        const form = new FormData();
        form.append('image', file);
        form.append('name', `${labelForName}_${Date.now()}`);

        const xhr = new XMLHttpRequest();
        xhr.open('POST', `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`);
        xhr.onload = () => {
            try {
                const res = JSON.parse(xhr.responseText);
                if (!res.success) {
                    reject(new Error(res.error?.message || 'Upload failed'));
                    return;
                }
                resolve(res.data.url);
            } catch (err) {
                reject(err);
            }
        };
        xhr.onerror = () => reject(new Error('Network error during upload'));
        xhr.send(form);
    });
}

/**
 * "Interview Docs" button + modal for a single visa application. Lets
 * admin/subadmin pick multiple files (call letter, checklist, sample Qs,
 * etc.), name each one, and push them straight to the applicant's
 * dashboard AND email in one go. Only ever shown while the application is
 * in the "Interview" status — this is a staff -> applicant push, not a
 * request for the applicant to upload something (see VisaDocumentRequests
 * for that flow).
 */
export default function VisaInterviewDocuments({ visa }) {
    const [open, setOpen] = useState(false);
    const [pendingFiles, setPendingFiles] = useState([]); // [{ file, name }]
    const [note, setNote] = useState('');
    const [sending, setSending] = useState(false);

    const sentDocs = useMemo(() => visa.interviewDocuments || [], [visa.interviewDocuments]);

    // Only visible for applications currently at the Interview stage.
    if (visa.status !== 'Interview') return null;

    const addFiles = (fileList) => {
        const files = Array.from(fileList || []);
        if (files.length === 0) return;
        setPendingFiles(prev => [
            ...prev,
            ...files.map(file => ({ file, name: file.name.replace(/\.[^.]+$/, '') })),
        ]);
    };

    const removePending = (idx) => {
        setPendingFiles(prev => prev.filter((_, i) => i !== idx));
    };

    const updatePendingName = (idx, name) => {
        setPendingFiles(prev => prev.map((p, i) => (i === idx ? { ...p, name } : p)));
    };

    const removeSent = async (docId) => {
        if (!confirm('Remove this document from the applicant\'s dashboard?')) return;
        try {
            await updateDoc(doc(db, 'visaApplications', visa.id), {
                interviewDocuments: sentDocs.filter(d => d.id !== docId),
                updatedAt: new Date().toISOString(),
            });
        } catch (err) {
            console.error('Failed to remove interview document', err);
            alert('Failed to remove document.');
        }
    };

    const sendDocuments = async () => {
        const ready = pendingFiles.filter(p => p.name.trim());
        if (ready.length === 0) {
            alert('Add at least one file and give it a name first.');
            return;
        }
        if (!visa.email) {
            alert('No email on file for this applicant.');
            return;
        }
        setSending(true);
        try {
            // 1. Upload every file
            const uploaded = [];
            for (const p of ready) {
                const url = await uploadToImgbb(p.file, `${visa.id}_interview`);
                uploaded.push({
                    id: `idoc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                    name: p.name.trim(),
                    fileName: p.file.name,
                    url,
                    sentAt: new Date().toISOString(),
                });
            }

            // 2. Save onto the visa doc so it shows on the user's dashboard
            await updateDoc(doc(db, 'visaApplications', visa.id), {
                interviewDocuments: [...sentDocs, ...uploaded],
                updatedAt: new Date().toISOString(),
            });

            // 3. Email the applicant with all docs attached
            const result = await sendInterviewDocumentsEmail({
                to: visa.email,
                applicantName: visa.applicantName,
                applicationNumber: visa.applicationNumber,
                country: visa.country,
                visaType: visa.visaType,
                note: note.trim() || null,
                documents: uploaded.map(d => ({ name: d.name, url: d.url, fileName: d.fileName })),
            });

            if (result?.ok === false) {
                alert('Documents saved to dashboard, but the email failed to send. Please retry the email.');
            }

            setPendingFiles([]);
            setNote('');
        } catch (err) {
            console.error('Failed to send interview documents', err);
            alert('Failed to send documents. Please try again.');
        } finally {
            setSending(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="px-3 py-2 rounded-xl text-xs font-black bg-purple-500 text-white hover:bg-purple-600 transition flex items-center gap-1.5"
            >
                <FaFileMedical /> Interview Docs{sentDocs.length ? ` (${sentDocs.length})` : ''}
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[80] bg-black/50 flex items-center justify-center p-4"
                        onClick={() => !sending && setOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="bg-purple-500 p-6 text-white flex items-center justify-between sticky top-0">
                                <div>
                                    <p className="text-purple-100 text-xs font-bold uppercase">Interview Documents — {visa.applicantName}</p>
                                    <h3 className="text-lg font-black font-mono">{visa.applicationNumber}</h3>
                                </div>
                                <button onClick={() => !sending && setOpen(false)}><FaTimes /></button>
                            </div>

                            <div className="p-6 space-y-5">
                                {/* --- Already sent --- */}
                                {sentDocs.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Already Sent</p>
                                        {sentDocs.map(d => (
                                            <div key={d.id} className="border border-gray-200 rounded-xl p-3 flex items-center justify-between gap-3">
                                                <a href={d.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 font-bold text-sm truncate hover:underline min-w-0">
                                                    <FaExternalLinkAlt className="shrink-0" /> <span className="truncate">{d.name}</span>
                                                </a>
                                                <button onClick={() => removeSent(d.id)} className="text-gray-300 hover:text-red-500 transition shrink-0">
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* --- Add new files --- */}
                                <div className="space-y-2">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Add Documents</p>
                                    <label className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-dashed border-purple-300 text-purple-600 font-bold text-sm cursor-pointer hover:bg-purple-50 transition">
                                        <FaPlus /> Choose File(s)
                                        <input
                                            type="file"
                                            multiple
                                            className="hidden"
                                            onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }}
                                        />
                                    </label>

                                    {pendingFiles.length === 0 ? (
                                        <div className="text-center py-6 text-gray-400">
                                            <FaFileAlt className="text-2xl mx-auto mb-2 opacity-30" />
                                            <p className="text-xs">No files selected yet</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {pendingFiles.map((p, idx) => (
                                                <div key={idx} className="flex items-center gap-2 border border-gray-200 rounded-xl p-2.5">
                                                    <input
                                                        value={p.name}
                                                        onChange={(e) => updatePendingName(idx, e.target.value)}
                                                        placeholder="Document name (e.g. Interview Call Letter)"
                                                        className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-xs outline-none focus:ring-2 focus:ring-purple-300 min-w-0"
                                                    />
                                                    <span className="text-[10px] text-gray-400 truncate max-w-[80px] shrink-0">{p.file.name}</span>
                                                    <button onClick={() => removePending(idx)} className="text-gray-300 hover:text-red-500 shrink-0">
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* --- Optional note --- */}
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Details / Note (optional)</p>
                                    <textarea
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        placeholder="e.g. Please bring the original documents to your interview at 10 AM."
                                        rows={3}
                                        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-purple-300 resize-none"
                                    />
                                </div>

                                <button
                                    onClick={sendDocuments}
                                    disabled={sending || pendingFiles.length === 0}
                                    className="w-full px-4 py-3 rounded-xl bg-purple-600 text-white font-black text-sm hover:bg-purple-700 disabled:opacity-40 flex items-center justify-center gap-2"
                                >
                                    {sending ? <><FaSpinner className="animate-spin" /> Sending...</> : <><FaPaperPlane /> Send to Dashboard & Email</>}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
