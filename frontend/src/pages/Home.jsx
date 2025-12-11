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
    <div className="min-h-screen bg-[#F5F5F0] text-stone-800 font-sans flex flex-col relative overflow-y-auto selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Background Texture */}
      <div className="fixed inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] pointer-events-none mix-blend-multiply z-0"></div>
      <div className="fixed inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-0"></div>

      {/* Main Content Wrapper */}
      <main className="flex-grow flex flex-col items-center pt-20 pb-10 px-6 relative z-10 w-full max-w-6xl mx-auto">
        
        {/* --- HERO SECTION --- */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full text-center max-w-4xl mx-auto"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-900 text-[10px] font-bold tracking-widest uppercase mb-8 shadow-sm">
            <Shield size={12} />
            Official Immigration AI
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-serif text-stone-900 mb-6 leading-[1.1] tracking-tight">
            Navigate your <br />
            <span className="italic text-indigo-900">global journey.</span>
          </h1>

          <p className="text-lg md:text-xl text-stone-500 max-w-2xl mx-auto mb-16 font-light leading-relaxed">
            Professional visa eligibility prediction powered by hybrid machine learning and strict policy intelligence.
          </p>

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-24">
            
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

        {/* --- HOW TO USE SECTION (Added) --- */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="w-full max-w-5xl border-t border-stone-200 pt-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-sm font-bold tracking-widest text-stone-400 uppercase mb-3">Methodology</h2>
            <h3 className="text-3xl font-serif text-stone-800">How the assessment works</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
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
      <footer className="py-8 text-center text-xs text-stone-400 font-serif italic relative z-10 border-t border-stone-200 mt-10">
        <p>System v2.0 • Secure Encryption Standard • FastAPI & React Architecture</p>
      </footer>
    </div>
  );
}

// --- SUB-COMPONENTS FOR CLEANER CODE ---

const ActionCard = ({ icon, bgIcon, title, desc, action, onClick, colorClass }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    onClick={onClick}
    className="group bg-white p-8 rounded-2xl shadow-sm border border-stone-200 cursor-pointer text-left hover:shadow-xl transition-all duration-300 relative overflow-hidden"
  >
    <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity ${colorClass.split(' ')[0]}`}>
      {bgIcon}
    </div>
    
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${colorClass}`}>
      {icon}
    </div>
    <h3 className="text-2xl font-serif text-stone-900 mb-2">{title}</h3>
    <p className="text-stone-500 text-sm mb-8 leading-relaxed h-10">
      {desc}
    </p>
    <span className={`inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider group-hover:gap-3 transition-all ${colorClass.split(' ')[0]}`}>
      {action} <ArrowRight size={16} />
    </span>
  </motion.div>
);

const StepItem = ({ number, icon, title, desc }) => (
  <div className="flex flex-col items-center text-center bg-[#F5F5F0]">
    <div className="w-24 h-24 bg-white rounded-full border-4 border-[#F5F5F0] flex items-center justify-center shadow-sm mb-6 relative z-10">
      <div className="text-stone-400">{icon}</div>
      <div className="absolute -top-2 -right-2 w-8 h-8 bg-indigo-900 text-white rounded-full flex items-center justify-center text-xs font-bold font-serif">
        {number}
      </div>
    </div>
    <h4 className="text-xl font-serif text-stone-900 mb-3">{title}</h4>
    <p className="text-stone-500 text-sm leading-relaxed max-w-xs">
      {desc}
    </p>
  </div>
);