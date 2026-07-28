import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

// Shared, reusable dashboard primitives used by BOTH AdminDashboard and
// SubAdminPanel so the two panels stay visually identical.


// ─── COUNT-UP NUMBER ──────────────────────────────────────────────────────────
function CountUp({ value, prefix = "", duration = 900 }) {
    const [display, setDisplay] = useState(0);
    const target = typeof value === "number" && !Number.isNaN(value) ? value : 0;

    useEffect(() => {
        if (target === 0) { setDisplay(0); return; }
        let raf;
        let start = null;
        const tick = (ts) => {
            if (start === null) start = ts;
            const progress = Math.min((ts - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
            setDisplay(Math.round(target * eased));
            if (progress < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [target, duration]);

    return <>{prefix}{display.toLocaleString()}</>;
}

// ─── UNIFORM STAT CARD THEMES ─────────────────────────────────────────────────
const STAT_THEMES = {
    orange: { grad: "from-orange-100/80 via-orange-50/40 to-white", iconGrad: "from-orange-300 via-orange-500 to-[#F97B4F]", blob1: "bg-orange-300", blob2: "bg-amber-200", dot: "bg-orange-500", text: "text-orange-600", glow: "rgba(249,123,79,0.4)", ring: "hover:ring-orange-300/60", border: "border-orange-100" },
    green:  { grad: "from-emerald-100/80 via-emerald-50/40 to-white", iconGrad: "from-emerald-300 via-emerald-500 to-[#28C76F]", blob1: "bg-emerald-300", blob2: "bg-teal-200", dot: "bg-emerald-500", text: "text-emerald-600", glow: "rgba(40,199,111,0.4)", ring: "hover:ring-emerald-300/60", border: "border-emerald-100" },
    sky:    { grad: "from-sky-100/80 via-sky-50/40 to-white", iconGrad: "from-sky-300 via-sky-500 to-[#00B4D8]", blob1: "bg-sky-300", blob2: "bg-cyan-200", dot: "bg-sky-500", text: "text-sky-600", glow: "rgba(0,180,216,0.4)", ring: "hover:ring-sky-300/60", border: "border-sky-100" },
    amber:  { grad: "from-amber-100/80 via-amber-50/40 to-white", iconGrad: "from-amber-300 via-amber-500 to-[#FFB300]", blob1: "bg-amber-300", blob2: "bg-yellow-200", dot: "bg-amber-500", text: "text-amber-600", glow: "rgba(255,179,0,0.4)", ring: "hover:ring-amber-300/60", border: "border-amber-100" },
    red:    { grad: "from-red-100/80 via-red-50/40 to-white", iconGrad: "from-red-300 via-red-500 to-[#F0473C]", blob1: "bg-red-300", blob2: "bg-rose-200", dot: "bg-red-500", text: "text-red-500", glow: "rgba(240,71,60,0.4)", ring: "hover:ring-red-300/60", border: "border-red-100" },
    blue:   { grad: "from-blue-100/80 via-blue-50/40 to-white", iconGrad: "from-blue-300 via-blue-500 to-[#3B82F6]", blob1: "bg-blue-300", blob2: "bg-indigo-200", dot: "bg-blue-500", text: "text-blue-600", glow: "rgba(59,130,246,0.4)", ring: "hover:ring-blue-300/60", border: "border-blue-100" },
};

// ─── UNIFORM STAT CARD (used for all overview KPI / Visa / Umrah cards) ──────
const statCardVariants = {
    hidden: { opacity: 0, y: 18, scale: 0.96 },
    show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

function StatCard({ icon, label, value, prefix = "", trend, theme = "orange", onClick }) {
    const t = STAT_THEMES[theme] || STAT_THEMES.orange;
    return (
        <motion.div
            variants={statCardVariants}
            whileHover={{ y: -8, scale: 1.015, boxShadow: `0 26px 44px -16px ${t.glow}` }}
            whileTap={{ scale: 0.96 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            onClick={onClick}
            className={`group relative isolate overflow-hidden rounded-[24px] p-5 cursor-pointer bg-gradient-to-br ${t.grad} border ${t.border} ring-1 ring-transparent ${t.ring} shadow-[0_2px_14px_-4px_rgba(15,23,42,0.08)] transition-[box-shadow,ring] duration-500`}
        >
            {/* ambient gradient blobs — drift + grow on hover */}
            <div className={`pointer-events-none absolute -right-10 -top-10 w-32 h-32 rounded-full blur-3xl opacity-30 ${t.blob1} transition-all duration-700 ease-out group-hover:scale-150 group-hover:opacity-45 group-hover:-translate-x-3 group-hover:translate-y-3`} />
            <div className={`pointer-events-none absolute -left-8 -bottom-10 w-24 h-24 rounded-full blur-3xl opacity-20 ${t.blob2} transition-all duration-700 ease-out group-hover:scale-125 group-hover:opacity-35`} />

            {/* diagonal shine sweep on hover */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[24px]">
                <div className="absolute -inset-y-8 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-[120%] group-hover:translate-x-[380%] transition-transform duration-[1100ms] ease-out" />
            </div>

            <div className="relative flex items-center gap-3 mb-5">
                <div className={`relative w-11 h-11 rounded-2xl bg-gradient-to-br ${t.iconGrad} flex items-center justify-center text-white text-[19px] shadow-lg shrink-0 transition-transform duration-300 ease-out group-hover:scale-110 group-hover:-rotate-6`}>
                    <span className={`absolute inset-0 rounded-2xl ${t.blob1} opacity-0 group-hover:opacity-40 blur-md scale-125 transition-opacity duration-500`} />
                    <span className="relative">{icon}</span>
                </div>
                <p className="text-[13px] font-bold text-slate-500 tracking-wide leading-snug">{label}</p>
            </div>

            <h3 className="relative text-[27px] font-extrabold text-slate-800 tabular-nums tracking-tight mb-2 leading-none transition-transform duration-300 group-hover:scale-[1.04] origin-left">
                <CountUp value={value} prefix={prefix} />
            </h3>

            <div className="relative flex items-center gap-1.5">
                <span className={`relative flex w-1.5 h-1.5`}>
                    <span className={`absolute inline-flex h-full w-full rounded-full ${t.dot} opacity-60 group-hover:animate-ping`} />
                    <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${t.dot} shadow-sm`} />
                </span>
                <p className={`text-[12px] font-bold ${t.text}`}>{trend}</p>
            </div>

            {/* bottom accent line, animates in on hover */}
            <div className={`absolute left-0 bottom-0 h-[3px] w-0 group-hover:w-full bg-gradient-to-r ${t.iconGrad} transition-all duration-500 ease-out rounded-full shadow-[0_0_8px_rgba(0,0,0,0.15)]`} />
        </motion.div>
    );
}

export { CountUp, STAT_THEMES, statCardVariants, StatCard };
export default StatCard;
