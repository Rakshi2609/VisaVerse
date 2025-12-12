import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  FileCheck, MessageCircle, Shield, Globe, ArrowRight, 
  ClipboardList, Cpu, Stamp 
} from "lucide-react";

export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem("visit_time", new Date().toISOString());
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F5F0] text-stone-800 font-sans flex flex-col relative overflow-x-hidden selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Background Texture */}
      <div className="fixed inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] pointer-events-none mix-blend-multiply z-0"></div>
      <div className="fixed inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-0"></div>

      {/* Main Content Wrapper */}
      {/* RESPONSIVE UPDATE: Reduced top padding on mobile (pt-12 vs pt-20) and side padding (px-4 vs px-6) */}
      <main className="flex-grow flex flex-col items-center pt-12 pb-10 px-4 md:pt-20 md:px-6 relative z-10 w-full max-w-6xl mx-auto">
        
        {/* --- HERO SECTION --- */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full text-center max-w-4xl mx-auto"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-900 text-[10px] font-bold tracking-widest uppercase mb-6 md:mb-8 shadow-sm">
            <Shield size={12} />
            Official Immigration AI
          </div>

          {/* Headline */}
          {/* RESPONSIVE UPDATE: Scaled font size down for mobile (text-4xl) up to desktop (text-7xl) */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif text-stone-900 mb-4 md:mb-6 leading-[1.1] tracking-tight">
            Navigate your <br />
            <span className="italic text-indigo-900">global journey.</span>
          </h1>

          <p className="text-base md:text-xl text-stone-500 max-w-xl md:max-w-2xl mx-auto mb-10 md:mb-16 font-light leading-relaxed px-2">
            Professional visa eligibility prediction powered by hybrid machine learning and strict policy intelligence.
          </p>

          {/* Action Cards */}
          {/* RESPONSIVE UPDATE: Reduced bottom margin on mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-3xl mx-auto mb-16 md:mb-24 w-full">
            
            {/* Predictor Card */}
            <ActionCard 
              icon={<FileCheck size={24} />}
              bgIcon={<Globe size={100} />}
              title="Eligibility Assessment"
              desc="Submit your profile details to receive an instant, calculated approval probability score."
              action="Start Assessment"
              onClick={() => navigate("/predict")}
              colorClass="text-indigo-900 bg-indigo-50"
            />

            {/* Assistant Card */}
            <ActionCard 
              icon={<MessageCircle size={24} />}
              bgIcon={<MessageCircle size={100} />}
              title="Policy Assistant"
              desc="Chat with our AI consultant to clear doubts regarding documentation and embassy rules."
              action="Chat Now"
              onClick={() => navigate("/assistant")}
              colorClass="text-emerald-800 bg-emerald-50"
            />
          </div>
        </motion.div>

        {/* --- HOW TO USE SECTION --- */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="w-full max-w-5xl border-t border-stone-200 pt-12 md:pt-16"
        >
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-xs md:text-sm font-bold tracking-widest text-stone-400 uppercase mb-2 md:mb-3">Methodology</h2>
            <h3 className="text-2xl md:text-3xl font-serif text-stone-800">How the assessment works</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative">
            {/* Connecting Line (Desktop Only) */}
            <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-stone-200 -z-10"></div>

            {/* Step 1 */}
            <StepItem 
              number="01"
              icon={<ClipboardList size={24} />}
              title="Submit Profile"
              desc="Complete the biographical form with details including age, education, and travel history."
            />

            {/* Step 2 */}
            <StepItem 
              number="02"
              icon={<Cpu size={24} />}
              title="AI Analysis"
              desc="Our hybrid engine compares your data against thousands of past immigration records."
            />

            {/* Step 3 */}
            <StepItem 
              number="03"
              icon={<Stamp size={24} />}
              title="Get Verdict"
              desc="Receive an instant approval probability score, risk factors, and country recommendations."
            />
          </div>
        </motion.div>

      </main>

      {/* Footer */}
      <footer className="py-6 md:py-8 text-center text-[10px] md:text-xs text-stone-400 font-serif italic relative z-10 border-t border-stone-200 mt-auto px-4">
        <p>System v2.0 • Secure Encryption Standard • FastAPI & React Architecture</p>
      </footer>
    </div>
  );
}

// --- SUB-COMPONENTS ---

const ActionCard = ({ icon, bgIcon, title, desc, action, onClick, colorClass }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    onClick={onClick}
    // RESPONSIVE UPDATE: Reduced padding (p-6) on mobile, larger (p-8) on desktop.
    className="group bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-stone-200 cursor-pointer text-left hover:shadow-xl transition-all duration-300 relative overflow-hidden h-full flex flex-col"
  >
    <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity ${colorClass.split(' ')[0]}`}>
      {bgIcon}
    </div>
    
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 md:mb-6 ${colorClass} shrink-0`}>
      {icon}
    </div>
    <h3 className="text-xl md:text-2xl font-serif text-stone-900 mb-2">{title}</h3>
    
    {/* RESPONSIVE UPDATE: Removed fixed height (h-10). Added 'flex-grow' to push the button down. */}
    <p className="text-stone-500 text-sm mb-6 md:mb-8 leading-relaxed flex-grow">
      {desc}
    </p>
    
    <span className={`inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider group-hover:gap-3 transition-all ${colorClass.split(' ')[0]}`}>
      {action} <ArrowRight size={16} />
    </span>
  </motion.div>
);

const StepItem = ({ number, icon, title, desc }) => (
  <div className="flex flex-col items-center text-center bg-[#F5F5F0]">
    <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-full border-4 border-[#F5F5F0] flex items-center justify-center shadow-sm mb-4 md:mb-6 relative z-10">
      <div className="text-stone-400">{icon}</div>
      <div className="absolute -top-1 -right-1 md:-top-2 md:-right-2 w-6 h-6 md:w-8 md:h-8 bg-indigo-900 text-white rounded-full flex items-center justify-center text-[10px] md:text-xs font-bold font-serif">
        {number}
      </div>
    </div>
    <h4 className="text-lg md:text-xl font-serif text-stone-900 mb-2 md:mb-3">{title}</h4>
    <p className="text-stone-500 text-sm leading-relaxed max-w-xs mx-auto">
      {desc}
    </p>
  </div>
);