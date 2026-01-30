import React from 'react';
import { motion } from 'framer-motion';
import { MdClose, MdHistory, MdMessage, MdEdit } from 'react-icons/md';
import { FaClock } from 'react-icons/fa';

/**
 * Edit History Modal - Shows comprehensive edit tracking
 * Displays:
 * - Message history (all admin/sub-admin messages with timestamps)
 * - Edit history (what fields were changed, old vs new values)
 * - User confirmation details
 */
export default function EditHistoryModal({ visa, onClose }) {
    if (!visa) return null;

    const messageHistory = visa.messageHistory || [];
    const editHistory = visa.editHistory || [];

    // Format date nicely
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return `${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`;
    };

    // Format field name for display
    const formatFieldName = (field) => {
        return field
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .trim();
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-black flex items-center gap-2">
                                <MdHistory className="text-3xl" />
                                Edit History & Messages
                            </h2>
                            <p className="text-sm text-blue-100 mt-1">
                                {visa.applicantName} • {visa.country}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-xl transition-all"
                        >
                            <MdClose className="text-2xl" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Message History */}
                    <div>
                        <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                            <MdMessage className="text-blue-600" />
                            Message History
                        </h3>
                        {messageHistory.length === 0 ? (
                            <div className="text-center py-8 bg-slate-50 rounded-xl">
                                <MdMessage className="text-slate-300 text-4xl mx-auto mb-2" />
                                <p className="text-slate-500 font-bold">No messages sent</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {messageHistory.map((msg, index) => (
                                    <div key={index} className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <p className="text-sm text-slate-800 font-bold mb-2">
                                                    📝 {msg.message}
                                                </p>
                                                <div className="flex items-center gap-4 text-xs text-slate-500">
                                                    <span className="flex items-center gap-1">
                                                        <FaClock />
                                                        {formatDate(msg.sentAt)}
                                                    </span>
                                                    <span className="bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full font-bold">
                                                        {msg.sentBy || 'Admin'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Edit History */}
                    <div>
                        <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                            <MdEdit className="text-emerald-600" />
                            User Edit History
                        </h3>
                        {editHistory.length === 0 ? (
                            <div className="text-center py-8 bg-slate-50 rounded-xl">
                                <MdEdit className="text-slate-300 text-4xl mx-auto mb-2" />
                                <p className="text-slate-500 font-bold">No edits made yet</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {editHistory.map((edit, editIndex) => (
                                    <div key={editIndex} className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-xs font-black text-emerald-700 bg-white px-3 py-1 rounded-full">
                                                Edit #{editHistory.length - editIndex} • {edit.changesCount} {edit.changesCount === 1 ? 'change' : 'changes'}
                                            </span>
                                            <span className="text-xs text-slate-500 flex items-center gap-1">
                                                <FaClock />
                                                {formatDate(edit.editedAt)}
                                            </span>
                                        </div>

                                        {edit.changes && edit.changes.length > 0 && (
                                            <div className="space-y-2">
                                                {edit.changes.map((change, changeIndex) => (
                                                    <div key={changeIndex} className="bg-white rounded-lg p-3 border border-emerald-100">
                                                        <div className="flex items-start gap-3">
                                                            <div className="flex-1">
                                                                <p className="text-xs font-black text-slate-600 uppercase mb-1">
                                                                    {formatFieldName(change.field)}
                                                                </p>
                                                                <div className="grid grid-cols-2 gap-2 text-xs">
                                                                    <div>
                                                                        <span className="text-slate-400 font-bold block mb-1">Old Value:</span>
                                                                        <span className="text-red-600 font-bold bg-red-50 px-2 py-1 rounded">
                                                                            {change.oldValue || 'N/A'}
                                                                        </span>
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-slate-400 font-bold block mb-1">New Value:</span>
                                                                        <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded">
                                                                            {change.newValue}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* User Confirmation Status */}
                    {visa.userConfirmed && (
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                            <h3 className="text-sm font-black text-blue-800 mb-2">✓ User Confirmation</h3>
                            <p className="text-xs text-slate-600">
                                User completed their edits and submitted on <strong>{formatDate(visa.userConfirmedAt)}</strong>
                            </p>
                        </div>
                    )}

                    {/* Current Edit Status */}
                    <div className={`border rounded-xl p-4 ${visa.editApproved ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'
                        }`}>
                        <h3 className="text-sm font-black mb-2 flex items-center gap-2">
                            <span className={visa.editApproved ? 'text-emerald-700' : 'text-slate-600'}>
                                Current Edit Access
                            </span>
                        </h3>
                        <div className="flex items-center gap-2">
                            <span className={`text-xs font-black px-3 py-1 rounded-full ${visa.editApproved
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-slate-300 text-slate-600'
                                }`}>
                                {visa.editApproved ? '🔓 EDIT ENABLED' : '🔒 EDIT LOCKED'}
                            </span>
                            {visa.editApprovedAt && (
                                <span className="text-xs text-slate-500">
                                    Last changed: {formatDate(visa.editApprovedAt)}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-slate-200 p-4 bg-slate-50">
                    <button
                        onClick={onClose}
                        className="w-full bg-slate-800 text-white py-3 rounded-xl font-bold hover:bg-slate-900 transition-all"
                    >
                        Close
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}
