import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // 1. IMPORT NAVIGATE
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plane, GraduationCap, Briefcase, DollarSign, 
  Globe, User, MapPin, Search, Stamp, Info, MessageCircle, ArrowRight 
} from "lucide-react";

export default function Predict() {
  const navigate = useNavigate(); // 2. INITIALIZE HOOK

  const [formData, setFormData] = useState({
    age: "",
    home_country: "",
    destination_country: "",
    education: "",
    employment: "",
    monthly_income: "",
    travel_purpose: "",
    travel_history: "",
    criminal_record: "",
    english_level: "",
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const predict = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const res = await fetch("http://localhost:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          age: Number(formData.age),
          monthly_income: Number(formData.monthly_income),
          travel_history: Number(formData.travel_history),
          criminal_record: Number(formData.criminal_record),
        }),
      });

      const data = await res.json();
      setResult(data);

      localStorage.setItem("last_prediction", JSON.stringify(data));
      localStorage.setItem("last_form_data", JSON.stringify(formData));
      
      // OPTIONAL: If you strictly want auto-redirect after 2 seconds, uncomment this:
      // setTimeout(() => navigate("/assistant"), 3000); 

    } catch (error) {
      console.error("Error", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] text-stone-800 font-sans flex items-center justify-center p-6 md:p-12">
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" 
      >
        
        {/* LEFT COLUMN: THE APPLICATION FORM */}
        <div className="lg:col-span-7 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 md:p-10 border border-stone-100">
          
          <header className="mb-10 border-b border-stone-100 pb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-indigo-50 p-2 rounded-lg">
                <Plane className="text-indigo-900 w-5 h-5" />
              </div>
              <h2 className="text-xs font-bold tracking-widest text-indigo-900 uppercase">Immigration Consultant</h2>
            </div>
            <h1 className="text-3xl md:text-4xl font-serif text-stone-900 leading-tight">
              Visa Eligibility Assessment
            </h1>
            <p className="text-stone-500 mt-3 text-sm">
              Please complete the biographical details below to receive your personalized assessment.
            </p>
          </header>

          <form onSubmit={predict} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
            
            <HumanInput 
              label="Applicant Age" name="age" type="number" 
              value={formData.age} onChange={handleChange} 
              placeholder="e.g. 28"
            />
            
            <HumanSelect 
              label="Home Country" icon={<MapPin size={16}/>}
              name="home_country" value={formData.home_country} onChange={handleChange}
              options={["India", "Brazil", "Nigeria", "Philippines", "Mexico"]} 
            />

            <HumanSelect 
              label="Destination" icon={<Globe size={16}/>}
              name="destination_country" value={formData.destination_country} onChange={handleChange}
              options={["USA", "Australia", "Canada", "UK", "Germany"]} 
            />

            <HumanSelect 
              label="Education Level" icon={<GraduationCap size={16}/>}
              name="education" value={formData.education} onChange={handleChange}
              options={[{val: "HighSchool", lbl: "High School"}, {val: "Bachelors", lbl: "Bachelors Degree"}, {val: "Masters", lbl: "Masters Degree"}]} 
              complex
            />

            <HumanSelect 
              label="Current Employment" icon={<Briefcase size={16}/>}
              name="employment" value={formData.employment} onChange={handleChange}
              options={["Employed", "Unemployed"]} 
            />

            <HumanInput 
              label="Yearly Income (USD)" name="monthly_income" type="number" 
              value={formData.monthly_income} onChange={handleChange} 
              icon={<DollarSign size={14}/>} placeholder="0.00"
            />

            <HumanSelect 
              label="Travel Purpose" 
              name="travel_purpose" value={formData.travel_purpose} onChange={handleChange}
              options={["Study", "Work", "Tourist", "Business"]} 
            />

            <HumanSelect 
              label="Travel History" 
              name="travel_history" value={formData.travel_history} onChange={handleChange}
              options={[{val: "0", lbl: "No previous trips"}, {val: "1", lbl: "1 previous trip"}, {val: "2", lbl: "2 previous trips"}, {val: "3", lbl: "3 or more trips"}]} 
              complex
            />

            {/* DIRECT GRID CHILDREN FOR BETTER ALIGNMENT */}
            <HumanSelect 
              label="Criminal Record" 
              name="criminal_record" value={formData.criminal_record} onChange={handleChange}
              options={[{val: "0", lbl: "Clean Record"}, {val: "1", lbl: "Has Record"}]} 
              complex
            />
            
            <HumanSelect 
              label="English Proficiency" 
              name="english_level" value={formData.english_level} onChange={handleChange}
              options={["Low", "Medium", "High"]} 
            />

            <button
              disabled={loading}
              className={`md:col-span-2 mt-6 py-4 px-6 rounded-xl font-medium text-lg transition-all duration-300 transform flex items-center justify-center gap-3
                ${loading 
                  ? "bg-stone-200 text-stone-400 cursor-wait" 
                  : "bg-indigo-900 text-white hover:bg-indigo-800 hover:shadow-xl active:scale-[0.99]"
                }`}
            >
              {loading ? "Processing Application..." : "Generate Assessment"}
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: THE "PAPER" RESULT */}
        <div className="lg:col-span-5 flex flex-col h-full justify-start pt-0">
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="bg-white rounded-3xl border-2 border-dashed border-stone-200 flex flex-col items-center justify-center text-center p-10 min-h-[400px]"
              >
                <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mb-4 text-stone-400">
                  <User />
                </div>
                <h3 className="text-stone-900 font-serif text-lg mb-2">Assessment Pending</h3>
                <p className="text-stone-500 text-sm max-w-xs">Fill out the applicant details on the left to generate an official prediction report.</p>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
                className="bg-[#FFFDF5] rounded-xl shadow-xl border border-stone-200 overflow-hidden relative sticky top-8"
              >
                 <div className="absolute inset-0 opacity-50 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] pointer-events-none mix-blend-multiply"></div>

                <div className="bg-indigo-900 text-white p-6 relative z-10 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest opacity-70">Case ID: #82910</p>
                    <p className="font-serif text-xl italic">Assessment Report</p>
                  </div>
                  <Stamp className="opacity-20 w-12 h-12" />
                </div>

                <div className="p-8 relative z-10">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <p className="text-sm text-stone-500 font-medium uppercase tracking-wide">Status</p>
                      <motion.div 
                        initial={{ scale: 2, opacity: 0, rotate: -20 }}
                        animate={{ scale: 1, opacity: 1, rotate: -12 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className={`mt-2 border-4 rounded-lg px-6 py-2 inline-block mask-image-grunge
                          ${result.status === "Approved" 
                            ? "border-emerald-700 text-emerald-800" 
                            : "border-rose-800 text-rose-800"
                          }`}
                      >
                        <span className="text-2xl font-black uppercase tracking-widest font-serif">
                          {result.status}
                        </span>
                      </motion.div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-stone-500 font-medium uppercase tracking-wide">Confidence</p>
                      <div className="text-3xl font-serif text-stone-800 mt-2">{result.approval_probability}%</div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="font-bold text-stone-800 border-b border-stone-300 pb-2 mb-3 flex items-center gap-2">
                        <Info size={16} /> Analysis Notes
                      </h4>
                      {result.rejection_reasons.length > 0 ? (
                        <ul className="list-disc pl-5 space-y-2 text-stone-600 text-sm">
                          {result.rejection_reasons.map((r, i) => <li key={i}>{r}</li>)}
                        </ul>
                      ) : (
                        <p className="text-emerald-700 text-sm italic">
                          "Candidate shows a strong profile consistent with visa approval standards."
                        </p>
                      )}
                    </div>

                    {result.alternate_country_suggestions.length > 0 && (
                      <div className="bg-stone-100/50 p-4 rounded-lg border border-stone-200">
                        <h4 className="font-bold text-stone-800 text-sm mb-3">Alternative Recommendations</h4>
                        <ul className="space-y-3">
                          {result.alternate_country_suggestions.map((c, i) => (
                            <li key={i} className="flex justify-between text-sm">
                              <span className="text-stone-600">{c.country}</span>
                              <span className="font-semibold text-indigo-900">{c.estimated_probability}% Match</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* 3. CTA TO CHATBOT */}
                    <div className="bg-indigo-900 rounded-xl p-5 text-white flex flex-col gap-3 shadow-lg">
                      <div>
                         <h4 className="font-serif text-lg flex items-center gap-2">
                           <MessageCircle size={18} className="text-emerald-400"/> 
                           Consultant Review
                         </h4>
                         <p className="text-xs text-indigo-200 leading-relaxed mt-1">
                           Need a detailed roadmap? Our AI Consultant can explain this result and help you prepare documents.
                         </p>
                      </div>
                      <button 
                        onClick={() => navigate("/assistant")}
                        className="w-full bg-white text-indigo-900 py-3 rounded-lg text-sm font-bold uppercase tracking-widest hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2"
                      >
                        Discuss Strategy <ArrowRight size={16} />
                      </button>
                    </div>

                  </div>

                  <div className="mt-6 pt-4 border-t border-stone-200 text-center">
                    <p className="text-xs text-stone-400 font-serif italic">Generated by Visa Eligibility AI • Confidential</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </motion.div>
    </div>
  );
}

// --- UPDATED INPUT COMPONENTS ---

const HumanInput = ({ label, icon, ...props }) => (
  <div className="flex flex-col gap-2">
    <label className="text-xs font-bold text-stone-500 uppercase tracking-wide pl-1">{label}</label>
    <div className="relative group">
      <input
        {...props}
        className="w-full bg-stone-50 border-b-2 border-stone-200 text-stone-900 rounded-t-lg px-4 py-3 outline-none focus:border-indigo-900 focus:bg-indigo-50/30 transition-all placeholder:text-stone-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      {icon && <div className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400">{icon}</div>}
    </div>
  </div>
);

const HumanSelect = ({ label, icon, options, complex = false, ...props }) => (
  <div className="flex flex-col gap-2">
    <label className="text-xs font-bold text-stone-500 uppercase tracking-wide pl-1 flex items-center gap-2">
      {label}
    </label>
    <div className="relative">
      <select
        {...props}
        className="w-full appearance-none bg-stone-50 border-b-2 border-stone-200 text-stone-900 rounded-t-lg px-4 py-3 outline-none focus:border-indigo-900 focus:bg-indigo-50/30 transition-all cursor-pointer"
      >
        <option value="" className="text-stone-400">Select...</option>
        {options.map((opt, i) => (
          <option key={i} value={complex ? opt.val : opt}>
            {complex ? opt.lbl : opt}
          </option>
        ))}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
      </div>
    </div>
  </div>
);