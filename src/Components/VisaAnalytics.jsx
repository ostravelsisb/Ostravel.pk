import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { getVisaStatistics } from '../Utils/ExportUtils';
import {
    MdTrendingUp,
    MdCheckCircle,
    MdPending,
    MdCancel,
    MdAttachMoney,
    MdSpeed
} from 'react-icons/md';
import { FaPassport, FaGlobe } from 'react-icons/fa';

/**
 * Visa Analytics Component - Displays statistics and insights
 */
const VisaAnalytics = ({ visas }) => {
    const stats = getVisaStatistics(visas);

    const StatCard = ({ title, value, icon, color, subtext, trend }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-shadow"
        >
            <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}>
                {icon}
            </div>
            <div className="relative z-10">
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
                <h3 className="text-3xl font-extrabold text-slate-800">{value}</h3>
                {subtext && <p className="text-xs text-slate-400 mt-2">{subtext}</p>}
                {trend && (
                    <div className="flex items-center gap-1 mt-2 text-green-600 text-sm font-bold">
                        <MdTrendingUp /> {trend}
                    </div>
                )}
            </div>
            <div className={`h-1 w-full absolute bottom-0 left-0 ${color.replace('text-', 'bg-').split(' ')[0]}`} />
        </motion.div>
    );

    const StatusBreakdown = () => (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <MdCheckCircle className="text-emerald-600" />
                Applications by Status
            </h3>
            <div className="space-y-3">
                {Object.entries(stats.byStatus).map(([status, count]) => {
                    const percentage = ((count / stats.total) * 100).toFixed(1);
                    const colors = {
                        'Doc Received': 'bg-blue-500',
                        'Analyzing': 'bg-yellow-500',
                        'Approved': 'bg-green-500',
                        'Rejected': 'bg-red-500',
                    };
                    const color = colors[status] || 'bg-slate-500';

                    return (
                        <div key={status}>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-bold text-slate-700">{status}</span>
                                <span className="text-sm font-bold text-slate-900">{count} ({percentage}%)</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percentage}%` }}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                    className={`h-full ${color}`}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    const CountryBreakdown = () => {
        const topCountries = Object.entries(stats.byCountry)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        return (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <FaGlobe className="text-blue-600" />
                    Top Destinations
                </h3>
                <div className="space-y-3">
                    {topCountries.map(([country, count], index) => {
                        const percentage = ((count / stats.total) * 100).toFixed(1);
                        const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500'];
                        const color = colors[index] || 'bg-slate-500';

                        return (
                            <div key={country}>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm font-bold text-slate-700">{country}</span>
                                    <span className="text-sm font-bold text-slate-900">{count} ({percentage}%)</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${percentage}%` }}
                                        transition={{ duration: 0.5, delay: 0.2 }}
                                        className={`h-full ${color}`}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Applications"
                    value={stats.total}
                    icon={<FaPassport className="text-6xl" />}
                    color="text-emerald-600"
                    subtext="All time"
                />
                <StatCard
                    title="Total Revenue"
                    value={`PKR ${stats.totalRevenue.toLocaleString()}`}
                    icon={<MdAttachMoney className="text-6xl" />}
                    color="text-green-600"
                    subtext="From visa applications"
                />
                <StatCard
                    title="Urgent Processing"
                    value={stats.urgentCount}
                    icon={<MdSpeed className="text-6xl" />}
                    color="text-amber-500"
                    subtext={`${((stats.urgentCount / stats.total) * 100).toFixed(1)}% of total`}
                />
                <StatCard
                    title="Approved"
                    value={stats.byStatus['Approved'] || 0}
                    icon={<MdCheckCircle className="text-6xl" />}
                    color="text-blue-600"
                    subtext={`${(((stats.byStatus['Approved'] || 0) / stats.total) * 100).toFixed(1)}% success rate`}
                />
            </div>

            {/* Breakdowns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <StatusBreakdown />
                <CountryBreakdown />
            </div>
        </div>
    );
};

export default VisaAnalytics;
