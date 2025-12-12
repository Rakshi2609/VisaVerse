import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Plane, Shield, Menu, X } from "lucide-react";

export default function Navbar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  // Close menu when a link is clicked
  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#F5F5F0]/90 backdrop-blur-md border-b border-stone-200 px-4 md:px-6 py-4">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        
        {/* BRAND LOGO */}
        <Link to="/" onClick={closeMenu} className="flex items-center gap-3 group">
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

        {/* --- DESKTOP NAVIGATION (Hidden on Mobile) --- */}
        <div className="hidden md:flex items-center gap-8">
          <NavLink to="/" current={location.pathname} label="Lobby" />
          <NavLink to="/predict" current={location.pathname} label="Assessment" />
          <NavLink to="/assistant" current={location.pathname} label="Assistant" />
          
          <Link 
            to="/predict" 
            className="flex items-center gap-2 px-4 py-2 bg-indigo-900 text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-indigo-800 transition-all shadow-sm hover:shadow-md"
          >
            <Shield size={14} />
            Check Eligibility
          </Link>
        </div>

        {/* --- MOBILE HAMBURGER BUTTON --- */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-stone-600 hover:text-indigo-900 transition-colors"
          aria-label="Toggle Menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* --- MOBILE MENU DROPDOWN --- */}
      {/* This renders only when isOpen is true */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-[#F5F5F0] border-b border-stone-200 shadow-xl flex flex-col p-4 animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col gap-4">
            <MobileNavLink to="/" current={location.pathname} label="Lobby" onClick={closeMenu} />
            <MobileNavLink to="/predict" current={location.pathname} label="Assessment" onClick={closeMenu} />
            <MobileNavLink to="/assistant" current={location.pathname} label="Assistant" onClick={closeMenu} />
            
            <Link 
              to="/predict" 
              onClick={closeMenu}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-indigo-900 text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-indigo-800 transition-all shadow-sm mt-2"
            >
              <Shield size={14} />
              Check Eligibility
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

// --- DESKTOP NAV LINK ---
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
      {isActive && (
        <span className="absolute -bottom-2 left-0 w-full h-0.5 bg-indigo-900 rounded-full" />
      )}
    </Link>
  );
};

// --- MOBILE NAV LINK ---
// Slightly larger hit area and different active styling for mobile
const MobileNavLink = ({ to, current, label, onClick }) => {
  const isActive = current === to;

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`text-base font-medium py-2 px-2 rounded-lg transition-colors
        ${isActive 
          ? "bg-indigo-50 text-indigo-900 font-bold" 
          : "text-stone-600 hover:bg-stone-100"
        }`}
    >
      {label}
    </Link>
  );
};