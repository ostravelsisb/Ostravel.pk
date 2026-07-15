import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdCheckCircle, MdErrorOutline, MdInfoOutline, MdClose } from "react-icons/md";

// Module-level dispatcher so any component can fire a toast without
// prop-drilling or context: `import { notify } from "../Components/Toast"`.
let dispatch = () => {};

export const notify = {
    success: (message) => dispatch({ type: "success", message }),
    error: (message) => dispatch({ type: "error", message }),
    info: (message) => dispatch({ type: "info", message }),
};

const STYLES = {
    success: { bar: "bg-emerald-500", iconBg: "bg-emerald-50", iconColor: "text-emerald-500", Icon: MdCheckCircle },
    error: { bar: "bg-red-500", iconBg: "bg-red-50", iconColor: "text-red-500", Icon: MdErrorOutline },
    info: { bar: "bg-orange-500", iconBg: "bg-orange-50", iconColor: "text-orange-500", Icon: MdInfoOutline },
};

// Mount <ToastContainer /> once near the top of any admin page tree.
// Nested components (modals, panels) can call notify.success(...) etc.
// from anywhere below it — no prop passing required.
export default function ToastContainer() {
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        dispatch = ({ type, message }) => {
            const id = `${Date.now()}-${Math.random()}`;
            setToasts((prev) => [...prev, { id, type, message }]);
            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== id));
            }, 4000);
        };
        return () => {
            dispatch = () => {};
        };
    }, []);

    const dismiss = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

    return (
        <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 w-[min(380px,calc(100vw-2.5rem))] pointer-events-none">
            <AnimatePresence>
                {toasts.map((t) => {
                    const s = STYLES[t.type] || STYLES.info;
                    const Icon = s.Icon;
                    return (
                        <motion.div
                            key={t.id}
                            layout
                            initial={{ opacity: 0, y: -16, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 60, scale: 0.95, transition: { duration: 0.18 } }}
                            transition={{ duration: 0.22, ease: "easeOut" }}
                            className="pointer-events-auto bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex"
                        >
                            <div className={`w-1.5 shrink-0 ${s.bar}`} />
                            <div className="flex items-start gap-3 p-4 flex-1 min-w-0">
                                <span className={`w-8 h-8 rounded-full ${s.iconBg} flex items-center justify-center shrink-0`}>
                                    <Icon className={`text-lg ${s.iconColor}`} />
                                </span>
                                <p className="text-sm font-semibold text-gray-700 leading-snug pt-1 min-w-0 break-words">{t.message}</p>
                                <button onClick={() => dismiss(t.id)} className="text-gray-300 hover:text-gray-500 shrink-0">
                                    <MdClose className="text-lg" />
                                </button>
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}