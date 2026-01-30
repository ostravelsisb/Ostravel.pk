import React, { useState, useEffect } from 'react';
import { db } from '../firbase';
import { collection, query, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../Context/AuthContext';
import { motion } from 'framer-motion';
import { HiEye, HiPencil, HiX } from 'react-icons/hi';
import { updateApplicationData, confirmUserChanges } from '../Utils/ApplicationEditUtils';

const UserDashboard = () => {
    const { currentUser } = useAuth();
    const [visaApplications, setVisaApplications] = useState([]);
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewingVisa, setViewingVisa] = useState(null);
    const [editingVisa, setEditingVisa] = useState(null);
    const [editFormData, setEditFormData] = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!currentUser) return;

            try {
                // Fetch visa applications
                const visasQ = query(
                    collection(db, 'visaApplications'),
                    orderBy('applicationDate', 'desc')
                );
                const visasSnapshot = await getDocs(visasQ);
                const visasData = visasSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    applicationDate: doc.data().applicationDate?.toDate()
                }));
                setVisaApplications(visasData);

                // Fetch insurance policies
                const policiesQ = query(
                    collection(db, 'insurancesCustumer'),
                    orderBy('purchaseDate', 'desc')
                );
                const policiesSnapshot = await getDocs(policiesQ);
                const policiesData = policiesSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    purchaseDate: doc.data().purchaseDate?.toDate()
                }));
                setPolicies(policiesData);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentUser]);

    // Get status badge color
    const getStatusBadge = (status) => {
        const statusColors = {
            'Pending': 'bg-yellow-100 text-yellow-800',
            'Processing': 'bg-blue-100 text-blue-800',
            'Under Processing': 'bg-blue-100 text-blue-800',
            'Approved': 'bg-green-100 text-green-800',
            'Rejected': 'bg-red-100 text-red-800',
            'Doc Received': 'bg-purple-100 text-purple-800',
            'Unpaid': 'bg-orange-100 text-orange-800',
        };
        return statusColors[status] || 'bg-gray-100 text-gray-800';
    };

    // Handle edit visa
    const handleEditVisa = (visa) => {
        setEditingVisa(visa);
        setEditFormData({
            applicantName: visa.applicantName || '',
            email: visa.email || '',
            phone: visa.phone || '',
            cnic: visa.cnic || '',
            age: visa.age || ''
        });
    };

    // Save edited visa
    const handleSaveVisa = async () => {
        if (!editingVisa) return;

        // Confirm with user
        if (!window.confirm('Are you sure you want to save these changes? Edit access will be locked after saving.')) {
            return;
        }

        setSaving(true);
        try {
            console.log('Saving visa edits with tracking...', {
                visaId: editingVisa.id,
                changes: editFormData
            });

            // Use trackChanges=true to enable comprehensive tracking
            await updateApplicationData(editingVisa.id, 'visaApplications', editFormData, true);

            console.log('✅ Visa saved successfully with tracking');

            alert('✅ Visa application updated successfully!\n\nYour changes have been submitted for review.\nEdit access has been automatically locked.\n\nThe page will now reload to show the updated status.');

            // Wait a moment for Firestore to propagate
            await new Promise(resolve => setTimeout(resolve, 1000));

            setEditingVisa(null);
            window.location.reload();
        } catch (error) {
            console.error('❌ Save error:', error);
            alert(`❌ Failed to update visa application.\n\nError: ${error.message}\n\nPlease try again or contact support.`);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto"></div>
                    <p className="mt-4 text-slate-600 font-medium">Loading your applications...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-slate-900 mb-2">My Dashboard</h1>
                    <p className="text-slate-600">Welcome back, {currentUser?.email}</p>
                </div>

                {/* Visa Applications Table */}
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden mb-8">
                    <div className="p-6 border-b border-slate-200">
                        <h2 className="text-2xl font-bold text-slate-900">Visa Applications</h2>
                        <p className="text-sm text-slate-500 mt-1">{visaApplications.length} total applications</p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">ID / Email</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Appointment Info</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Amount / Payment</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-700 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {visaApplications.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-slate-400 italic">
                                            No visa applications found
                                        </td>
                                    </tr>
                                ) : (
                                    visaApplications.map((visa) => (
                                        <tr key={visa.id} className="hover:bg-slate-50 transition-colors">
                                            {/* Name */}
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-900">{visa.applicantName || 'N/A'}</div>
                                                <div className="text-sm text-slate-500">Age: {visa.age || 'N/A'}</div>
                                            </td>

                                            {/* ID / Email */}
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-mono text-blue-600">{visa.applicationNumber || 'N/A'}</div>
                                                <div className="text-sm text-slate-600">{visa.email || 'N/A'}</div>
                                                <div className="text-xs text-slate-500">{visa.cnic || 'N/A'}</div>
                                            </td>

                                            {/* Appointment Info */}
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-slate-900">{visa.visaType || 'N/A'}</div>
                                                <div className="text-sm text-slate-600">{visa.country || 'N/A'}</div>
                                                <div className="text-xs text-slate-500">{visa.stayDuration || 'N/A'}</div>
                                            </td>

                                            {/* Amount / Payment */}
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-emerald-600">PKR {visa.totalFee?.toLocaleString() || '0'}</div>
                                                <div className="text-xs text-slate-500">
                                                    {visa.applicationDate ? new Date(visa.applicationDate).toLocaleDateString() : 'N/A'}
                                                </div>
                                            </td>

                                            {/* Status */}
                                            <td className="px-6 py-4">
                                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getStatusBadge(visa.status)}`}>
                                                    {visa.status || 'Pending'}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    {/* View Button */}
                                                    <button
                                                        onClick={() => setViewingVisa(visa)}
                                                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                                                        title="View Details"
                                                    >
                                                        <HiEye className="w-5 h-5" />
                                                    </button>

                                                    {/* Edit Button */}
                                                    <button
                                                        onClick={() => handleEditVisa(visa)}
                                                        disabled={!visa.editApproved}
                                                        className={`p-2 rounded-lg transition-colors ${visa.editApproved
                                                            ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
                                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                            }`}
                                                        title={visa.editApproved ? 'Edit Application' : 'Edit Disabled'}
                                                    >
                                                        <HiPencil className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Insurance Policies Table (Similar Structure) */}
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-200">
                        <h2 className="text-2xl font-bold text-slate-900">Insurance Policies</h2>
                        <p className="text-sm text-slate-500 mt-1">{policies.length} total policies</p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Policy Number</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Plan</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-700 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {policies.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-slate-400 italic">
                                            No insurance policies found
                                        </td>
                                    </tr>
                                ) : (
                                    policies.map((policy) => (
                                        <tr key={policy.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-900">{policy.travelerName || 'N/A'}</div>
                                                <div className="text-sm text-slate-500">{policy.cnic || 'N/A'}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-mono text-blue-600">{policy.policyNumber || 'N/A'}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-slate-900">{policy.planName || 'Standard'}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-emerald-600">PKR {policy.amount?.toLocaleString() || '0'}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-slate-600">
                                                    {policy.purchaseDate ? new Date(policy.purchaseDate).toLocaleDateString() : 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                                                        title="View Details"
                                                    >
                                                        <HiEye className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        disabled={!policy.editApproved}
                                                        className={`p-2 rounded-lg transition-colors ${policy.editApproved
                                                            ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
                                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                            }`}
                                                        title={policy.editApproved ? 'Edit Policy' : 'Edit Disabled'}
                                                    >
                                                        <HiPencil className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* View Visa Modal */}
            {viewingVisa && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                    >
                        {/* Modal Header */}
                        <div className="p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900">Visa Application Details</h2>
                                <p className="text-sm text-slate-500 mt-1">{viewingVisa.applicationNumber}</p>
                            </div>
                            <button
                                onClick={() => setViewingVisa(null)}
                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <HiX className="w-6 h-6 text-slate-600" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 space-y-6">
                            {/* Personal Information */}
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">Personal Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-bold text-slate-500">Full Name</p>
                                        <p className="text-slate-900">{viewingVisa.applicantName || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-500">Email</p>
                                        <p className="text-slate-900">{viewingVisa.email || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-500">Phone</p>
                                        <p className="text-slate-900">{viewingVisa.phone || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-500">CNIC</p>
                                        <p className="text-slate-900">{viewingVisa.cnic || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-500">Age</p>
                                        <p className="text-slate-900">{viewingVisa.age || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-500">Passport Number</p>
                                        <p className="text-slate-900">{viewingVisa.passportNumber || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Visa Details */}
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">Visa Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-bold text-slate-500">Country</p>
                                        <p className="text-slate-900">{viewingVisa.country || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-500">Visa Type</p>
                                        <p className="text-slate-900">{viewingVisa.visaType || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-500">Stay Duration</p>
                                        <p className="text-slate-900">{viewingVisa.stayDuration || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-500">Status</p>
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getStatusBadge(viewingVisa.status)}`}>
                                            {viewingVisa.status || 'Pending'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Information */}
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">Payment Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-bold text-slate-500">Total Fee</p>
                                        <p className="text-2xl font-bold text-emerald-600">PKR {viewingVisa.totalFee?.toLocaleString() || '0'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-500">Application Date</p>
                                        <p className="text-slate-900">
                                            {viewingVisa.applicationDate ? new Date(viewingVisa.applicationDate).toLocaleDateString() : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Admin Message */}
                            {viewingVisa.adminMessage && (
                                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                                    <p className="text-sm font-bold text-blue-800 mb-1">Message from Admin:</p>
                                    <p className="text-blue-700">{viewingVisa.adminMessage}</p>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
                            <button
                                onClick={() => setViewingVisa(null)}
                                className="px-6 py-2 border border-slate-300 rounded-lg font-bold text-slate-700 hover:bg-slate-50 transition"
                            >
                                Close
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Edit Visa Modal */}
            {editingVisa && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                    >
                        <div className="p-6 border-b border-slate-200">
                            <h2 className="text-2xl font-bold text-slate-900">Edit Visa Application</h2>
                            <p className="text-sm text-slate-500 mt-1">Application: {editingVisa.applicationNumber}</p>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Applicant Name</label>
                                <input
                                    type="text"
                                    value={editFormData.applicantName || ''}
                                    onChange={(e) => setEditFormData({ ...editFormData, applicantName: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
                                <input
                                    type="email"
                                    value={editFormData.email || ''}
                                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Phone</label>
                                <input
                                    type="text"
                                    value={editFormData.phone || ''}
                                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">CNIC</label>
                                <input
                                    type="text"
                                    value={editFormData.cnic || ''}
                                    onChange={(e) => setEditFormData({ ...editFormData, cnic: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Age</label>
                                <input
                                    type="number"
                                    value={editFormData.age || ''}
                                    onChange={(e) => setEditFormData({ ...editFormData, age: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-200 flex gap-3 justify-end">
                            <button
                                onClick={() => setEditingVisa(null)}
                                className="px-6 py-2 border border-slate-300 rounded-lg font-bold text-slate-700 hover:bg-slate-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveVisa}
                                disabled={saving}
                                className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default UserDashboard;
