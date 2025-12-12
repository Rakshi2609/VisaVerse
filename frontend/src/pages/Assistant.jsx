import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Send, Bot, User, Loader2, ShieldCheck, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ENV VARIABLE
const API_BASE = import.meta.env.VITE_BACKEND_URL;

// --- TYPEWRITER COMPONENT ---
const Typewriter = ({ text, onComplete }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let index = 0;
    const speed = 10;

    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayedText((prev) => prev + text.charAt(index));
        index++;
      } else {
        clearInterval(timer);
        setIsComplete(true);
        if (onComplete) onComplete();
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text]);

  return (
    <span>
      {displayedText.split("**").map((part, index) =>
        index % 2 === 1 ? <span key={index} className="font-bold">{part}</span> : part
      )}
      {!isComplete && (
        <span className="inline-block w-1.5 h-4 ml-1 bg-indigo-500 animate-pulse align-middle"></span>
      )}
    </span>
  );
};

export default function Assistant() {
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);

  // --- DYNAMIC INITIAL MESSAGE LOGIC ---
  const getInitialMessage = () => {
    try {
      const pred = JSON.parse(localStorage.getItem("last_prediction"));
      if (pred && pred.approval_probability !== undefined) {
        return `Hello. I have your assessment results here.\n\n**Score:** ${pred.approval_probability}%\n**Status:** ${pred.status}\n\nI'm ready to explain the strategy to improve this. What is your main concern?`;
      }
    } catch (e) {
      console.error("Error reading local storage", e);
    }
    return "Hello. I am your dedicated Visa Consultant.\n\nI have reviewed your profile data. How can I assist you with your immigration strategy today?";
  };

  const [messages, setMessages] = useState([
    { sender: "bot", text: getInitialMessage() },
  ]);

  // --- SCROLL LOGIC ---
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // LOAD USER DATA
  const userProfile = JSON.parse(localStorage.getItem("last_form_data")) || {};
  const modelPrediction = JSON.parse(localStorage.getItem("last_prediction")) || {};

  // --- SEND MESSAGE ---
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await axios.post(
        `${API_BASE}/api/chat/message`,
        {
          message: input,
          sessionId: sessionId,
          userProfile: userProfile,
          modelPrediction: modelPrediction,
        }
      );

      setSessionId(response.data.sessionId);

      const botMessage = {
        sender: "bot",
        text: response.data.response,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "⚠️ The consultant is currently unreachable. Please check your connection and try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !loading) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center p-4 md:p-8 font-sans">
      
      <div className="fixed inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] pointer-events-none mix-blend-multiply"></div>

      {/* MAIN CONTAINER */}
      <div className="w-full max-w-5xl h-[85vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-stone-200 relative z-10">

        {/* HEADER */}
        <div className="bg-indigo-950 p-6 flex items-center justify-between shadow-md z-20">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
                <Bot className="text-white w-7 h-7" />
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-indigo-950"></div>
            </div>
            <div>
              <h2 className="text-white font-serif text-xl tracking-wide">VisaExpert AI</h2>
              <div className="flex items-center gap-2 text-indigo-200 text-xs uppercase tracking-widest font-medium">
                <ShieldCheck size={12} />
                <span>Secure Advisory Channel</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="p-2 hover:bg-white/10 rounded-lg text-indigo-200 transition-colors"
            title="Reset Session"
          >
            <RefreshCw size={20} />
          </button>
        </div>

        {/* CHAT AREA */}
        <div className="flex-1 bg-[#F5F5F0] relative overflow-hidden flex flex-col">
          <div className="absolute inset-0 opacity-50 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>

          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 relative z-10 scroll-smooth">
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className={`flex items-end gap-3 ${
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.sender === "bot" && (
                    <div className="w-8 h-8 rounded-full bg-indigo-900 flex items-center justify-center shrink-0 shadow-lg">
                      <Bot size={16} className="text-white" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] md:max-w-[70%] px-6 py-4 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed whitespace-pre-wrap
                      ${
                        msg.sender === "user"
                          ? "bg-indigo-900 text-white rounded-br-none shadow-indigo-200"
                          : "bg-white text-stone-800 border border-stone-200 rounded-bl-none font-medium"
                      }`}
                  >
                    {msg.sender === "bot" && i === messages.length - 1 ? (
                      <Typewriter text={msg.text} onComplete={scrollToBottom} />
                    ) : (
                      msg.text.split("**").map((part, index) =>
                        index % 2 === 1 ? (
                          <span key={index} className="font-bold">
                            {part}
                          </span>
                        ) : (
                          part
                        )
                      )
                    )}
                  </div>

                  {msg.sender === "user" && (
                    <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center shrink-0">
                      <User size={16} className="text-stone-500" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-900 flex items-center justify-center shrink-0">
                  <Bot size={16} className="text-white" />
                </div>
                <div className="bg-white border border-stone-200 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-indigo-900 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-2 h-2 bg-indigo-900 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-2 h-2 bg-indigo-900 rounded-full animate-bounce"></span>
                  </div>
                  <span className="text-xs text-stone-400 font-medium uppercase tracking-wider ml-2">
                    Consulting...
                  </span>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} className="h-1" />
          </div>
        </div>

        {/* INPUT AREA */}
        <div className="bg-white p-4 md:p-6 border-t border-stone-200 z-20">
          <div className="relative flex items-center gap-2 max-w-4xl mx-auto">
            <input
              type="text"
              placeholder="Type your message to the consultant..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              className="flex-1 bg-stone-50 text-stone-800 placeholder:text-stone-400 border border-stone-200 rounded-xl px-5 py-4 focus:outline-none focus:border-indigo-900 focus:ring-1 focus:ring-indigo-900 transition-all shadow-inner"
            />

            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className={`p-4 rounded-xl shadow-lg transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center
                ${
                  loading || !input.trim()
                    ? "bg-stone-200 text-stone-400 cursor-not-allowed shadow-none"
                    : "bg-indigo-900 text-white hover:bg-indigo-800 shadow-indigo-200"
                }`}
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
            </button>
          </div>
          <p className="text-center text-[10px] text-stone-400 mt-3 font-serif italic">
            Advisory provided by AI. Always verify critical details with official embassy documentation.
          </p>
        </div>
      </div>
    </div>
  );
}
