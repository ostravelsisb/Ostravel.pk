import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiXMark, // Close icon
  HiPaperAirplane, // Send icon
} from "react-icons/hi2";
import { FaUserCircle } from "react-icons/fa";
import { IoChatbubbleEllipsesSharp } from "react-icons/io5";

// --- IMPORT YOUR LOCAL KNOWLEDGE BASE ---
import { chatbotKB } from "../Data/chatbotKB";

// --- !! GEMINI API KEY !! ---
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";

// --- Helper: Find Answer in KB ---
const findKBAnswer = (query) => {
  const lowerQuery = query.toLowerCase();

  // 1. Direct Keyword Match
  const match = chatbotKB.find(entry =>
    entry.keywords.some(keyword => lowerQuery.includes(keyword))
  );

  return match || null;
};

// --- AI API Call Function (Fallback) ---
const fetchAiResponse = async (userText) => {
  if (!API_KEY) {
    return {
      type: "text",
      content: "I couldn't find an exact answer in my database, and my AI connection is offline. Please call us at 0333-5542877 for assistance.",
      replies: ["Contact Us", "Main Menu"],
    };
  }

  const systemPrompt = `You are an expert travel agent for O.S. Travel & Tours. 
  User asked: "${userText}". 
  Your local database didn't have a specific answer. 
  Provide a helpful, professional, and short response about travel/visas. 
  Direct them to contact 0333-5542877 for complex queries.
  Don't invent prices. say "prices vary".`;

  const requestBody = {
    contents: [{ parts: [{ "text": systemPrompt }] }]
  };

  try {
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) throw new Error("API Error");
    const data = await response.json();
    const botText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Please contact our office for details.";

    return {
      type: "text",
      content: botText,
      replies: ["Main Menu", "Contact Us"],
    };

  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      type: "text",
      content: "I'm having trouble understanding right now. Please call our team at 0333-5542877.",
      replies: ["Contact Us"],
    };
  }
};

// --- Bot's "Brain" ---
const getBotResponse = async (userText) => {
  const text = userText.toLowerCase().trim();

  // 1. Check Local Knowledge Base First
  const kbMatch = findKBAnswer(text);
  if (kbMatch) {
    return {
      type: kbMatch.type || "text",
      content: kbMatch.answer,
      replies: kbMatch.replies?.map(r => ({ text: r, value: r.toLowerCase().replace(/ /g, "_") })) || [] // simple value generation
    };
  }

  // 2. Fallback to AI
  return await fetchAiResponse(userText);
};

// --- Child Components for Beautiful Messages ---

const BotContactCard = ({ content }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
    <div className="bg-white rounded-2xl rounded-bl-none shadow-md border border-blue-100 overflow-hidden max-w-[85%] w-full">
      <div className="bg-blue-50 p-3 border-b border-blue-100 flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
          <FaUserCircle />
        </div>
        <h4 className="font-bold text-gray-800 text-sm">Contact Information</h4>
      </div>
      <div className="p-4 flex flex-col gap-3 text-sm">

        {/* Address */}
        <div className="flex gap-3 items-start">
          <div className="min-w-[20px] text-lg">📍</div>
          <div>
            <p className="font-bold text-gray-700 text-xs uppercase tracking-wide">Office Address</p>
            <p className="text-gray-600 leading-snug">{content.office}</p>
          </div>
        </div>

        <div className="h-px bg-gray-100 w-full my-1"></div>

        {/* Contacts */}
        <div className="grid grid-cols-1 gap-3">
          <div className="flex gap-3 items-center">
            <div className="min-w-[20px] text-lg">📞</div>
            <div>
              <p className="font-bold text-gray-700 text-xs uppercase tracking-wide">Phone</p>
              <a href={`tel:${content.phone}`} className="text-blue-600 font-medium hover:underline">{content.phone}</a>
            </div>
          </div>
          <div className="flex gap-3 items-center">
            <div className="min-w-[20px] text-lg">📱</div>
            <div>
              <p className="font-bold text-gray-700 text-xs uppercase tracking-wide">WhatsApp</p>
              <a href={`https://wa.me/${content.whatsapp.replace(/-/g, '')}`} target="_blank" rel="noreferrer" className="text-green-600 font-medium hover:underline">{content.whatsapp}</a>
            </div>
          </div>
          <div className="flex gap-3 items-center">
            <div className="min-w-[20px] text-lg">✉️</div>
            <div>
              <p className="font-bold text-gray-700 text-xs uppercase tracking-wide">Email</p>
              <a href={`mailto:${content.email}`} className="text-gray-600 hover:text-blue-600">{content.email}</a>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 text-orange-800 text-xs p-2 rounded-lg mt-1 border border-orange-100 text-center font-medium">
          🕒 {content.hours}
        </div>
      </div>
    </div>
  </motion.div>
);

const BotVisaCard = ({ content }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
    <div className="bg-white rounded-2xl rounded-bl-none shadow-lg border border-gray-100 overflow-hidden max-w-[85%] w-full flex flex-col">

      {/* 1. Header with Image */}
      <div className="relative h-32 w-full">
        <img
          src={content.image || "https://images.unsplash.com/photo-1436491865332-7a6153212e7e?q=80&w=2074&auto=format&fit=crop"}
          alt={content.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>

        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <span className="text-2xl shadow-sm">{content.flag}</span>
          <h4 className="text-white font-bold text-lg leading-tight shadow-sm">{content.country}</h4>
        </div>
      </div>

      {/* 2. Content Body */}
      <div className="p-4 flex flex-col gap-3">
        <h5 className="font-bold text-blue-600 text-[15px]">{content.title}</h5>

        {/* Requirements List */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Requirements</p>
          <ul className="flex flex-col gap-1.5">
            {content.details.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-slate-600 leading-snug">
                <span className="text-green-500 mt-0.5">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Footer: Time & Price */}
        <div className="flex justify-between items-center text-xs pt-1">
          <div className="flex items-center gap-1.5 text-slate-500 font-medium bg-slate-100 px-2 py-1 rounded-md">
            <span>⏱️</span> {content.processing}
          </div>
          {content.price && (
            <div className="font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
              {content.price}
            </div>
          )}
        </div>
      </div>

    </div>
  </motion.div>
);

const BotMessage = ({ content }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
    <div className="p-3 rounded-2xl max-w-[85%] bg-blue-50 text-slate-800 rounded-bl-none shadow-sm border border-blue-100 whitespace-pre-wrap text-sm leading-relaxed">
      {content}
    </div>
  </motion.div>
);

const UserMessage = ({ content }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end">
    <div className="p-3 rounded-2xl max-w-[85%] bg-blue-600 text-white rounded-br-none shadow-md text-sm">
      {content}
    </div>
  </motion.div>
);

// --- Main Chatbot Component ---
function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setIsTyping(true);
      setTimeout(async () => {
        const welcomeMsg = await getBotResponse("hello");
        setMessages([{ sender: "bot", ...welcomeMsg }]);
        setIsTyping(false);
      }, 800);
    }
  }, [isOpen]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = async (text, value) => {
    const userText = text || value;
    if (!userText) return;

    setMessages((prev) => [...prev, { sender: "user", type: "text", content: userText }]);
    setIsTyping(true);
    setInputValue("");

    const response = await getBotResponse(userText);

    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [...prev, { sender: "bot", ...response }]);
    }, 1000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim() === "") return;
    handleSendMessage(inputValue, null);
  };

  // Quick Replies Logic
  const lastMessage = messages[messages.length - 1];
  const quickReplies = lastMessage?.sender === "bot" && lastMessage.replies ? lastMessage.replies : [];

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
                  <FaUserCircle className="text-3xl text-blue-100" />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-blue-700 rounded-full"></span>
                </div>
                <div>
                  <h3 className="font-bold text-base leading-tight">O.S Support Bot</h3>
                  <p className="text-[10px] text-blue-100 uppercase tracking-wider font-semibold">Online & Ready</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded-full transition-colors"><HiXMark className="text-xl" /></button>
            </header>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto bg-slate-50 flex flex-col gap-4">
              {messages.map((msg, index) => (
                msg.sender === "user"
                  ? <UserMessage key={index} content={msg.content} />
                  : (() => {
                    switch (msg.type) {
                      case "text":
                        return <BotMessage key={index} content={msg.content} />;
                      case "contact":
                        return <BotContactCard key={index} content={msg.content} />;
                      case "visa":
                        return <BotVisaCard key={index} content={msg.content} />;
                      case "visaInfo":
                        // Assuming BotVisaCard exists or will be added
                        return <div key={index}>Visa Info Card Placeholder</div>; // Replace with actual component
                      case "visaList":
                        // Assuming BotVisaList exists or will be added
                        return <div key={index}>Visa List Card Placeholder</div>; // Replace with actual component
                      default:
                        return <BotMessage key={index} content={msg.content} />;
                    }
                  })()
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="p-3 rounded-2xl bg-slate-200 text-slate-500 rounded-bl-none flex gap-1 items-center h-10">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.1s]"></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Replies */}
            {quickReplies.length > 0 && (
              <div className="p-3 bg-slate-50 border-t border-slate-200 overflow-x-auto flex gap-2 no-scrollbar pb-4 mask-fade-right">
                {quickReplies.map((reply, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(reply.text || reply, null)}
                    className="flex-shrink-0 whitespace-nowrap bg-white text-blue-600 border border-blue-200 text-xs font-bold py-2 px-4 rounded-full shadow-sm hover:bg-blue-600 hover:text-white hover:border-blue-600 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                  >
                    {reply.text || reply}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about visas, hajj, or prices..."
                className="flex-1 bg-slate-50 text-slate-800 text-sm px-4 py-3 rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
              <button type="submit" className="w-11 h-11 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all">
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
        </motion.button>
      )}
    </>
  );
}

export default Chatbot;