import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Plane, Shield } from "lucide-react";

export default function Navbar() {
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#F5F5F0]/80 backdrop-blur-md border-b border-stone-200 px-6 py-4">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        
        {/* BRAND LOGO */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="bg-indigo-900 text-white p-2 rounded-lg shadow-sm group-hover:bg-indigo-800 transition-colors">
            <Plane size={20} />
          </div>
          <div>
            <h1 className="font-serif text-lg font-bold text-stone-900 tracking-tight leading-none group-hover:text-indigo-900 transition-colors">
              Visa Eligibility AI
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-stone-400 font-medium group-hover:text-indigo-900/60 transition-colors">
              Immigration Consultant
            </p>
          </div>
        </Link>

        {/* NAVIGATION LINKS */}
        <div className="flex items-center gap-8">
          <NavLink to="/" current={location.pathname} label="Lobby" />
          <NavLink to="/predict" current={location.pathname} label="Assessment" />
          <NavLink to="/assistant" current={location.pathname} label="Assistant" />
          
          {/* "Call to Action" style button for the main tool */}
          <Link 
            to="/predict" 
            className="hidden md:flex items-center gap-2 px-4 py-2 bg-indigo-900 text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-indigo-800 transition-all shadow-sm hover:shadow-md"
          >
            <Shield size={14} />
            Check Eligibility
          </Link>
        </div>
      </div>
    </nav>
  );
}

// --- REUSABLE LINK COMPONENT ---
// Handles the "Active State" styling (underline effect)
const NavLink = ({ to, current, label }) => {
  const isActive = current === to;
  
  return (
    <Link 
      to={to} 
      className={`relative text-sm font-medium transition-colors duration-300 
        ${isActive ? "text-indigo-900" : "text-stone-500 hover:text-indigo-900"}`
      }
    >
      {label}
      {/* Animated Underline for Active State */}
      {isActive && (
        <span className="absolute -bottom-2 left-0 w-full h-0.5 bg-indigo-900 rounded-full" />
      )}
    </Link>
  );
};