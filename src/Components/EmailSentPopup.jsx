import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

// Small toast shown after an "Email" inquiry button is clicked.
// success=true  -> "Email sent!"
// success=false -> "Couldn't send email" (network/server error)
// Auto-dismisses after 3.5s, also closable by tapping it.
export default function EmailSentPopup({ show, success = true, onClose }) {
  useEffect(() => {
    if (!show) return;
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [show, onClose]);

  if (!show) return null;

  return createPortal(
    <div
      onClick={onClose}
      className="fixed top-6 left-1/2 -translate-x-1/2 z-[2000] cursor-pointer animate-in fade-in slide-in-from-top-4 duration-300"
      role="status"
    >
      <div
        className={`flex items-center gap-3 rounded-2xl shadow-2xl px-5 py-3.5 border ${
          success
            ? "bg-white border-emerald-200"
            : "bg-white border-red-200"
        }`}
      >
        {success ? (
          <FaCheckCircle className="text-emerald-500 text-xl shrink-0" />
        ) : (
          <FaTimesCircle className="text-red-500 text-xl shrink-0" />
        )}
        <span className="font-semibold text-slate-800 text-sm">
          {success ? "Email sent! Our team will get back to you shortly." : "Couldn't send the email. Please try again."}
        </span>
      </div>
    </div>,
    document.body
  );
}
