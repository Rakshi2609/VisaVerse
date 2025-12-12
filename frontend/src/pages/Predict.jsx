import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plane, GraduationCap, Briefcase, DollarSign, 
  Globe, User, MapPin, MessageCircle, ArrowRight, Stamp, Info 
} from "lucide-react";

// READ ML BACKEND URL FROM ENV
const ML_API = import.meta.env.VITE_ML_API;

export default function Predict() {
  const navigate = useNavigate();

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

    // Scroll to result on mobile after a short delay
    if (window.innerWidth < 1024) {
      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }, 100);
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const res = await fetch(`${ML_API}/predict`, {
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

    } catch (error) {
      console.error("ML Service Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    // RESPONSIVE UPDATE: Reduced padding on mobile (p-4 vs p-12)
    <div className="min-h-screen bg-[#F5F5F0] text-stone-800 font-sans flex items-center justify-center p-4 md:p-12">

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start"
      >

        {/* LEFT FORM */}
        {/* RESPONSIVE UPDATE: Reduced padding on mobile (p-6 vs p-10) */}
        <div className="lg:col-span-7 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 md:p-10 border border-stone-100">

          <header className="mb-8 md:mb-10 border-b border-stone-100 pb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-indigo-50 p-2 rounded-lg">
                <Plane className="text-indigo-900 w-5 h-5" />
              </div>
              <h2 className="text-[10px] md:text-xs font-bold tracking-widest text-indigo-900 uppercase">Immigration Consultant</h2>
            </div>
            {/* RESPONSIVE UPDATE: Smaller title on mobile */}
            <h1 className="text-2xl md:text-4xl font-serif text-stone-900 leading-tight">Visa Eligibility Assessment</h1>
            <p className="text-stone-500 mt-2 md:mt-3 text-sm">Enter applicant details to generate your ML prediction.</p>
          </header>

          {/* RESPONSIVE UPDATE: Gap adjusted for mobile */}
          <form onSubmit={predict} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 md:gap-y-8">

            {/* INPUT FIELDS */}
            <HumanInput label="Applicant Age" name="age" type="number" value={formData.age} onChange={handleChange} />

            <HumanSelect label="Home Country" icon={<MapPin size={14}/>} name="home_country" 
              value={formData.home_country} onChange={handleChange}
              options={["India", "Brazil", "Nigeria", "Philippines", "Mexico"]} 
            />

            <HumanSelect label="Destination Country" icon={<Globe size={14}/>} name="destination_country"
              value={formData.destination_country} onChange={handleChange}
              options={["USA", "Canada", "UK", "Australia", "Germany"]} 
            />

            <HumanSelect label="Education Level" name="education" complex
              value={formData.education} onChange={handleChange}
              options={[
                { val: "HighSchool", lbl: "High School" },
                { val: "Bachelors", lbl: "Bachelor's Degree" },
                { val: "Masters", lbl: "Master's Degree" }
              ]}
            />

            <HumanSelect label="Employment Status" name="employment"
              value={formData.employment} onChange={handleChange}
              options={["Employed", "Unemployed"]} 
            />

            <HumanInput label="Yearly Income (USD)" type="number" name="monthly_income"
              value={formData.monthly_income} onChange={handleChange} icon={<DollarSign size={14}/>} 
            />

            <HumanSelect label="Travel Purpose" name="travel_purpose"
              value={formData.travel_purpose} onChange={handleChange}
              options={["Study", "Work", "Tourism", "Business"]} 
            />

            <HumanSelect label="Travel History" name="travel_history" complex
              value={formData.travel_history} onChange={handleChange}
              options={[
                { val: "0", lbl: "No trips" },
                { val: "1", lbl: "1 trip" },
                { val: "2", lbl: "2 trips" },
                { val: "3", lbl: "3+ trips" }
              ]}
            />

            <HumanSelect label="Criminal Record" name="criminal_record" complex
              value={formData.criminal_record} onChange={handleChange}
              options={[
                { val: "0", lbl: "Clean Record" },
                { val: "1", lbl: "Has Record" }
              ]}
            />

            <HumanSelect label="English Level" name="english_level"
              value={formData.english_level} onChange={handleChange}
              options={["Low", "Medium", "High"]} 
            />

            <button 
              disabled={loading}
              className={`md:col-span-2 mt-4 md:mt-6 py-4 rounded-xl font-medium text-lg flex items-center justify-center gap-3 transition-all active:scale-95
                ${loading ? "bg-stone-200 text-stone-400" : "bg-indigo-900 text-white hover:bg-indigo-800 shadow-lg shadow-indigo-100"}
              `}
            >
              {loading ? "Processing..." : "Generate Assessment"}
            </button>

          </form>
        </div>

        {/* RIGHT RESULT PANEL */}
        {/* RESPONSIVE UPDATE: Full width on mobile */}
        <div className="lg:col-span-5 flex flex-col h-full justify-start pt-0">
          <AnimatePresence mode="wait">

            {/* BEFORE RESULT */}
            {!result ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                // RESPONSIVE UPDATE: Hidden on mobile to save space until result appears, or reduced height
                className="hidden lg:flex bg-white rounded-3xl border-2 border-dashed border-stone-200 flex-col items-center justify-center p-10 min-h-[400px]"
              >
                <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mb-4 text-stone-400">
                  <User />
                </div>
                <h3 className="text-stone-900 font-serif text-lg mb-2">Awaiting Submission</h3>
                <p className="text-stone-500 text-sm">Fill the form to generate your ML evaluation.</p>
              </motion.div>
            ) : (

              /* RESULT BOX */
              <motion.div
                key="result"
                id="result-box"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, type: "spring" }}
                className="bg-[#FFFDF5] rounded-xl shadow-xl border border-stone-200 overflow-hidden sticky top-8"
              >
                <div className="bg-indigo-900 text-white p-6 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest opacity-70">Case File</p>
                    <p className="font-serif text-xl italic">Assessment Report</p>
                  </div>
                  <Stamp className="opacity-20 w-12 h-12" />
                </div>

                <div className="p-6 md:p-8">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <p className="text-xs uppercase text-stone-500 font-medium">Status</p>
                      <div 
                        className={`mt-2 border-4 rounded-lg px-4 md:px-6 py-2 inline-block
                          ${result.status === "Approved" ? "border-emerald-700 text-emerald-700" : "border-rose-700 text-rose-700"}
                        `}
                      >
                        <span className="text-xl md:text-2xl font-black uppercase font-serif">{result.status}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xs uppercase text-stone-500">Confidence</p>
                      <p className="text-2xl md:text-3xl font-serif">{result.approval_probability}%</p>
                    </div>
                  </div>

                  <h4 className="font-bold text-stone-800 border-b border-stone-300 pb-2 mb-3 flex items-center gap-2">
                    <Info size={16} /> Key Notes
                  </h4>

                  {result.rejection_reasons.length > 0 ? (
                    <ul className="list-disc pl-5 text-sm text-stone-600 space-y-2">
                      {result.rejection_reasons.map((r, i) => <li key={i}>{r}</li>)}
                    </ul>
                  ) : (
                    <p className="text-emerald-700 text-sm italic">
                      Applicant shows a profile consistent with high approval probability.
                    </p>
                  )}

                  {result.alternate_country_suggestions?.length > 0 && (
                    <div className="mt-6 bg-stone-100 p-4 rounded-lg border border-stone-200">
                      <h4 className="font-bold text-stone-800 mb-2 text-sm">Alternate Options</h4>
                      {result.alternate_country_suggestions.map((c, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span>{c.country}</span>
                          <span className="font-semibold text-indigo-900">{c.estimated_probability}%</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* CTA BUTTON */}
                  <div className="mt-8 bg-indigo-900 text-white p-5 rounded-lg">
                    <h4 className="font-serif text-lg flex items-center gap-2">
                      <MessageCircle size={18} className="text-emerald-400"/>
                      Consultant Review
                    </h4>
                    <p className="text-xs text-indigo-200 mt-1">
                      Want deeper analysis? Chat with our Visa Strategy AI.
                    </p>

                    <button 
                      onClick={() => navigate("/assistant")}
                      className="mt-4 w-full bg-white text-indigo-900 py-3 rounded-lg text-sm font-bold uppercase hover:bg-emerald-50 flex items-center justify-center gap-2 transition-colors"
                    >
                      Discuss Strategy <ArrowRight size={16}/>
                    </button>
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

/* ---------- INPUT COMPONENTS ---------- */

const HumanInput = ({ label, icon, ...props }) => (
  <div className="flex flex-col gap-2">
    <label className="text-[10px] md:text-xs font-bold text-stone-500 uppercase tracking-wide">{label}</label>
    <div className="relative">
      <input
        {...props}
        className="w-full bg-stone-50 border-b-2 border-stone-200 px-3 py-2 md:px-4 md:py-3 text-sm md:text-base rounded-t-lg focus:border-indigo-900 outline-none transition-all"
      />
      {icon && <div className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400">{icon}</div>}
    </div>
  </div>
);

const HumanSelect = ({ label, icon, options, complex = false, ...props }) => (
  <div className="flex flex-col gap-2">
    <label className="text-[10px] md:text-xs font-bold text-stone-500 uppercase tracking-wide">{label}</label>
    <div className="relative">
      <select
        {...props}
        className="w-full bg-stone-50 border-b-2 border-stone-200 px-3 py-2 md:px-4 md:py-3 text-sm md:text-base rounded-t-lg appearance-none focus:border-indigo-900 outline-none"
      >
        <option value="">Select...</option>
        {options.map((opt, i) => (
          <option key={i} value={complex ? opt.val : opt}>
            {complex ? opt.lbl : opt}
          </option>
        ))}
      </select>
      {icon && <div className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400">{icon}</div>}
    </div>
  </div>
);