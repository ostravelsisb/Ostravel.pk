import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiXMark, HiPaperAirplane } from "react-icons/hi2";
import { IoChatbubbleEllipsesSharp } from "react-icons/io5";
import { FaUserShield, FaCheck } from "react-icons/fa";
import { useAuth } from "../Context/AuthContext";
import {
    listenToChat,
    ensureChatDoc,
    sendUserMessage,
    markChatReadByUser,
} from "../Utils/liveChatUtils";

// --- Tick icon: single grey = sent, double grey = delivered, double blue = read ---
const Ticks = ({ read }) => (
    <span className={`inline-flex ml-1 -space-x-1.5 ${read ? "text-sky-400" : "text-white/60"}`}>
        <FaCheck className="text-[10px]" />
        <FaCheck className="text-[10px]" />
    </span>
);

function LiveChatWidget() {
    const { currentUser, userData } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [chat, setChat] = useState(null);
    const [inputValue, setInputValue] = useState("");
    const [sending, setSending] = useState(false);
    const chatEndRef = useRef(null);

    const userName =
        userData?.displayName || currentUser?.displayName ||
        (currentUser?.email ? currentUser.email.split("@")[0] : "User");

    // Ensure chat doc + subscribe once opened
    useEffect(() => {
        if (!isOpen || !currentUser?.uid) return;
        let unsub;
        (async () => {
            await ensureChatDoc(currentUser.uid, currentUser.email, userName);
            unsub = listenToChat(currentUser.uid, (data) => setChat(data));
        })();
        return () => unsub && unsub();
    }, [isOpen, currentUser?.uid]);

    // Mark admin replies as read when panel is open
    useEffect(() => {
        if (isOpen && chat?.userUnread) {
            markChatReadByUser(currentUser.uid);
        }
    }, [isOpen, chat?.userUnread]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chat?.messages, isOpen]);

    const handleSend = async (e) => {
        e.preventDefault();
        const text = inputValue.trim();
        if (!text || !currentUser?.uid || sending) return;
        setSending(true);
        setInputValue("");
        try {
            await sendUserMessage(currentUser.uid, currentUser.email, userName, text);
        } finally {
            setSending(false);
        }
    };

    if (!currentUser) return null; // guests keep the AI chatbot instead

    const messages = chat?.messages || [];

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        className="fixed bottom-24 right-4 w-[90vw] md:w-[380px] h-[550px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-slate-200 overflow-hidden font-sans"
                    >
                        {/* Header */}
                        <header className="bg-gradient-to-r from-blue-700 to-blue-600 text-white p-4 flex justify-between items-center shadow-md">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <FaUserShield className="text-3xl text-blue-100" />
                                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-blue-700 rounded-full"></span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-base leading-tight">O.S Support Team</h3>
                                    <p className="text-[10px] text-blue-100 uppercase tracking-wider font-semibold">We usually reply fast</p>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                                <HiXMark className="text-xl" />
                            </button>
                        </header>

                        {/* Messages */}
                        <div className="flex-1 p-4 overflow-y-auto bg-slate-50 flex flex-col gap-3">
                            {messages.length === 0 && (
                                <div className="text-center text-xs text-slate-400 mt-6">
                                    Send a message and our team will reply here.
                                </div>
                            )}
                            {messages.map((msg) =>
                                msg.sender === "user" ? (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex justify-end"
                                    >
                                        <div className="p-3 rounded-2xl max-w-[85%] bg-blue-600 text-white rounded-br-none shadow-md text-sm">
                                            <p className="whitespace-pre-wrap">{msg.text}</p>
                                            <div className="flex justify-end items-center mt-1 text-[10px] text-blue-100">
                                                <Ticks read={!!msg.readByAdmin} />
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex justify-start"
                                    >
                                        <div className="p-3 rounded-2xl max-w-[85%] bg-white text-slate-800 rounded-bl-none shadow-sm border border-blue-100 text-sm">
                                            <p className="whitespace-pre-wrap">{msg.text}</p>
                                            <p className="text-[10px] text-slate-400 mt-1">{msg.senderName || "Support"}</p>
                                        </div>
                                    </motion.div>
                                )
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Type your message..."
                                className="flex-1 bg-slate-50 text-slate-800 text-sm px-4 py-3 rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                            />
                            <button
                                type="submit"
                                disabled={sending}
                                className="w-11 h-11 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                            >
                                <HiPaperAirplane className="w-5 h-5 -rotate-45 translate-x-0.5" />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Toggle Button */}
            {!isOpen && (
                <motion.button
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 w-14 h-14 md:w-16 md:h-16 bg-blue-600 text-white rounded-full shadow-2xl shadow-blue-600/40 flex items-center justify-center text-3xl z-50 cursor-pointer"
                >
                    <IoChatbubbleEllipsesSharp />
                    {chat?.userUnread && (
                        <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 border-2 border-white rounded-full" />
                    )}
                </motion.button>
            )}
        </>
    );
}

export default LiveChatWidget;
