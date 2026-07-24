import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdSearch, MdClear, MdSend, MdChatBubbleOutline } from "react-icons/md";
import { FaCheck } from "react-icons/fa";
import {
    listenToAllChats,
    listenToChat,
    sendAdminMessage,
    markChatReadByAdmin,
} from "../Utils/liveChatUtils";

const Ticks = ({ read }) => (
    <span className={`inline-flex ml-1 -space-x-1.5 ${read ? "text-sky-400" : "text-white/60"}`}>
        <FaCheck className="text-[10px]" />
        <FaCheck className="text-[10px]" />
    </span>
);

const formatTime = (ts) => {
    const d = ts?.toDate ? ts.toDate() : ts instanceof Date ? ts : null;
    if (!d) return "";
    return d.toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" });
};

export default function LiveChatPanel({ adminName, preselectChatId, onPreselectHandled }) {
    const [chats, setChats] = useState([]);
    const [search, setSearch] = useState("");
    const [selectedId, setSelectedId] = useState(null);
    const [thread, setThread] = useState(null);
    const [inputValue, setInputValue] = useState("");
    const [sending, setSending] = useState(false);
    const chatEndRef = useRef(null);

    useEffect(() => {
        const unsub = listenToAllChats(setChats);
        return () => unsub && unsub();
    }, []);

    // Auto-open a specific conversation when arriving here from a
    // notification click (e.g. the bell dropdown). Waits for `chats` to be
    // loaded so the thread listener below has something to attach to, then
    // tells the parent it's been handled so it doesn't re-trigger.
    useEffect(() => {
        if (!preselectChatId) return;
        if (!chats.some(c => c.id === preselectChatId)) return;
        setSelectedId(preselectChatId);
        onPreselectHandled?.();
    }, [preselectChatId, chats, onPreselectHandled]);

    useEffect(() => {
        if (!selectedId) return;
        const unsub = listenToChat(selectedId, setThread);
        return () => unsub && unsub();
    }, [selectedId]);

    useEffect(() => {
        if (selectedId && thread?.adminUnread) {
            markChatReadByAdmin(selectedId);
        }
    }, [selectedId, thread?.adminUnread]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [thread?.messages]);

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        if (!q) return chats;
        return chats.filter(
            (c) =>
                (c.userName || "").toLowerCase().includes(q) ||
                (c.userEmail || "").toLowerCase().includes(q)
        );
    }, [chats, search]);

    const lastMessagePreview = (c) => {
        const msgs = c.messages || [];
        if (!msgs.length) return "No messages yet";
        return msgs[msgs.length - 1].text;
    };

    const handleSend = async (e) => {
        e.preventDefault();
        const text = inputValue.trim();
        if (!text || !selectedId || sending) return;
        setSending(true);
        setInputValue("");
        try {
            await sendAdminMessage(selectedId, adminName, text);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
            {/* Conversation list */}
            <div className="xl:col-span-2 space-y-3">
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
                    <div className="flex items-center gap-2 px-3 py-2.5 border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-orange-400/40 focus-within:border-orange-300 transition-all">
                        <MdSearch className="text-gray-400 text-xl shrink-0" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name or email..."
                            className="flex-1 text-sm outline-none placeholder:text-gray-400 bg-transparent text-gray-700"
                        />
                        {search && (
                            <button onClick={() => setSearch("")} className="text-gray-400 hover:text-orange-500">
                                <MdClear />
                            </button>
                        )}
                    </div>
                </div>

                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                    {filtered.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 text-center">
                            <MdChatBubbleOutline className="text-3xl text-gray-300 mx-auto mb-2" />
                            <p className="text-gray-500 font-bold">No conversations yet</p>
                        </div>
                    ) : (
                        filtered.map((c) => (
                            <button
                                key={c.id}
                                onClick={() => setSelectedId(c.id)}
                                className={`w-full text-left rounded-2xl border p-4 transition-all shadow-sm ${
                                    selectedId === c.id
                                        ? "bg-orange-50 border-orange-300 shadow-orange-100/60"
                                        : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-md"
                                }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm">
                                        {(c.userName || "?")[0].toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="font-bold text-gray-800 truncate text-sm">{c.userName || "User"}</p>
                                            {c.adminUnread && (
                                                <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
                                            )}
                                        </div>
                                        <p className="text-xs text-blue-500 font-semibold truncate mt-0.5">{c.userEmail}</p>
                                        <p className="text-xs text-gray-400 truncate mt-1 leading-relaxed">{lastMessagePreview(c)}</p>
                                    </div>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Thread panel */}
            <div className="xl:col-span-3">
                <AnimatePresence mode="wait">
                    {thread ? (
                        <motion.div
                            key={thread.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.25 }}
                            className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[650px]"
                        >
                            {/* Header */}
                            <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-sky-50 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold shadow-md">
                                    {(thread.userName || "?")[0].toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-800 text-sm">{thread.userName}</p>
                                    <p className="text-xs text-blue-500 font-semibold">{thread.userEmail}</p>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 p-4 overflow-y-auto bg-slate-50 flex flex-col gap-3">
                                {(thread.messages || []).map((m) =>
                                    m.sender === "admin" ? (
                                        <div key={m.id} className="flex justify-end">
                                            <div className="p-3 rounded-2xl max-w-[75%] bg-orange-500 text-white rounded-br-none shadow-md text-sm">
                                                <p className="whitespace-pre-wrap">{m.text}</p>
                                                <div className="flex justify-end items-center gap-1 mt-1 text-[10px] text-orange-100">
                                                    {formatTime(m.createdAt)}
                                                    <Ticks read={!!m.readByUser} />
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div key={m.id} className="flex justify-start">
                                            <div className="p-3 rounded-2xl max-w-[75%] bg-white text-slate-800 rounded-bl-none shadow-sm border border-gray-100 text-sm">
                                                <p className="whitespace-pre-wrap">{m.text}</p>
                                                <p className="text-[10px] text-slate-400 mt-1">{formatTime(m.createdAt)}</p>
                                            </div>
                                        </div>
                                    )
                                )}
                                <div ref={chatEndRef} />
                            </div>

                            {/* Reply box */}
                            <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Type a reply..."
                                    className="flex-1 bg-slate-50 text-slate-800 text-sm px-4 py-3 rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:bg-white transition-all"
                                />
                                <button
                                    type="submit"
                                    disabled={sending}
                                    className="w-11 h-11 bg-orange-500 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                                >
                                    <MdSend className="w-5 h-5" />
                                </button>
                            </form>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="bg-white rounded-2xl border border-dashed border-gray-200 h-[650px] flex flex-col items-center justify-center p-10 text-center"
                        >
                            <MdChatBubbleOutline className="text-3xl text-gray-300 mb-2" />
                            <p className="font-bold text-gray-500">Select a conversation</p>
                            <p className="text-sm text-gray-400 mt-1">Choose a chat on the left to reply</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}