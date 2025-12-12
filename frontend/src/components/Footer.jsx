import React from "react";
import { Link } from "react-router-dom";
import { 
  Plane, Facebook, Twitter, Linkedin, Mail, MapPin, Phone 
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-indigo-950 text-stone-300 font-sans border-t border-indigo-900 relative overflow-hidden">
      
      {/* Background Pattern (Subtle) */}
      <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>

      {/* RESPONSIVE UPDATE: Reduced vertical padding on mobile (pt-12 vs pt-16) */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 pt-12 md:pt-16 pb-8 relative z-10">
        
        {/* RESPONSIVE UPDATE: Reduced gap on mobile (gap-8 vs gap-12) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-8 md:mb-12">
          
          {/* COL 1: BRANDING */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-white">
              <div className="bg-white/10 p-2 rounded-lg">
                <Plane size={20} />
              </div>
              <span className="font-serif text-lg font-bold tracking-wide">
                Visa Eligibility AI
              </span>
            </div>
            <p className="text-sm leading-relaxed text-stone-400 max-w-xs">
              Professional immigration assessment powered by hybrid machine learning logic and current policy databases.
            </p>
            <div className="flex gap-4 pt-2">
              <SocialIcon icon={<Twitter size={18} />} />
              <SocialIcon icon={<Linkedin size={18} />} />
              <SocialIcon icon={<Facebook size={18} />} />
            </div>
          </div>

          {/* COL 2: SERVICES */}
          <div>
            <h4 className="text-white font-serif text-lg mb-4 md:mb-6">Services</h4>
            <ul className="space-y-2 md:space-y-3 text-sm">
              <li><FooterLink to="/predict">Eligibility Assessment</FooterLink></li>
              <li><FooterLink to="/assistant">Policy Chatbot</FooterLink></li>
              <li><FooterLink to="#">Document Review</FooterLink></li>
              <li><FooterLink to="#">Embassy Directory</FooterLink></li>
            </ul>
          </div>

          {/* COL 3: LEGAL */}
          <div>
            <h4 className="text-white font-serif text-lg mb-4 md:mb-6">Legal</h4>
            <ul className="space-y-2 md:space-y-3 text-sm">
              <li><FooterLink to="#">Privacy Policy</FooterLink></li>
              <li><FooterLink to="#">Terms of Service</FooterLink></li>
              <li><FooterLink to="#">Data Retention</FooterLink></li>
              <li><FooterLink to="#">Cookie Settings</FooterLink></li>
            </ul>
          </div>

          {/* COL 4: CONTACT */}
          <div>
            <h4 className="text-white font-serif text-lg mb-4 md:mb-6">Contact</h4>
            <ul className="space-y-3 md:space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="mt-1 text-emerald-500 shrink-0" size={16} />
                <span>12 Global Avenue,<br/>Tech Park, Chennai, India</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="text-emerald-500 shrink-0" size={16} />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="text-emerald-500 shrink-0" size={16} />
                <span>consult@visapredictor.ai</span>
              </li>
            </ul>
          </div>

        </div>

        {/* DIVIDER */}
        <div className="h-px w-full bg-indigo-900 mb-6 md:mb-8"></div>

        {/* DISCLAIMER & COPYRIGHT */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6 text-[10px] md:text-xs text-stone-500 text-center md:text-left">
          <p className="max-w-2xl leading-relaxed">
            <span className="font-bold text-stone-400">Disclaimer:</span> This tool uses artificial intelligence to provide estimates based on historical data. It is not a substitute for legal advice from a certified immigration attorney. Results are not guaranteed.
          </p>
          <p className="whitespace-nowrap">
            &copy; {new Date().getFullYear()} Visa Eligibility AI.
          </p>
        </div>
      </div>
    </footer>
  );
}

// --- SUB-COMPONENTS ---

const FooterLink = ({ to, children }) => (
  <Link 
    to={to} 
    className="hover:text-emerald-400 hover:translate-x-1 transition-all duration-300 inline-block text-stone-400"
  >
    {children}
  </Link>
);

const SocialIcon = ({ icon }) => (
  <a 
    href="#" 
    className="w-8 h-8 rounded-full bg-indigo-900 flex items-center justify-center text-stone-400 hover:bg-emerald-600 hover:text-white transition-all"
  >
    {icon}
  </a>
);