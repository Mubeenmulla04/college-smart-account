import React from "react";
import { Link } from "react-router-dom";
import { FaGithub, FaLinkedinIn, FaEnvelope } from "react-icons/fa";
import { 
  GraduationCap, 
  ArrowUp,
  ChevronRight
} from 'lucide-react';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full mt-auto bg-white border-t border-gray-200/60 pt-16 pb-8 relative overflow-hidden">
      {/* Decorative top gradient line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-10 lg:gap-8 mb-16">
          
          {/* 1. Brand Section (Takes up 2 columns on desktop) */}
          <div className="sm:col-span-2 lg:col-span-2 flex flex-col items-start">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-200 transform -rotate-2">
                <GraduationCap size={20} />
              </div>
              <div>
                <h3 className="font-heading font-bold text-gray-900 text-lg leading-tight tracking-tight">College Smart</h3>
                <p className="font-sans text-[10px] font-black text-indigo-600 uppercase tracking-widest leading-none mt-1">Account</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed mb-6 max-w-xs font-sans">
              Simplifying student account management with clarity, security, and enterprise-grade financial tools.
            </p>
            
            {/* Social / Connect */}
            <div className="flex items-center gap-3">
              <a href="#" className="w-9 h-9 rounded-full bg-gray-50 border border-gray-200 text-gray-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 hover:-translate-y-0.5 flex items-center justify-center transition-all duration-300 shadow-sm">
                <FaLinkedinIn size={16} />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-gray-50 border border-gray-200 text-gray-500 hover:text-gray-900 hover:border-gray-300 hover:bg-gray-100 hover:-translate-y-0.5 flex items-center justify-center transition-all duration-300 shadow-sm">
                <FaGithub size={16} />
              </a>
              <a href="mailto:support@collegesmart.edu" className="w-9 h-9 rounded-full bg-gray-50 border border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 hover:-translate-y-0.5 flex items-center justify-center transition-all duration-300 shadow-sm">
                <FaEnvelope size={14} />
              </a>
            </div>
          </div>

          {/* 2. Quick Links */}
          <div className="flex flex-col">
            <h4 className="font-heading font-semibold text-gray-900 mb-5 tracking-wide">Quick Links</h4>
            <nav className="flex flex-col gap-3 font-sans">
              {['Dashboard', 'Payments', 'Receipts', 'Scholarships', 'Profile'].map((item) => (
                <Link key={item} to="#" className="text-sm text-gray-500 hover:text-indigo-600 transition-colors flex items-center gap-1 group w-fit">
                  <span className="w-0 overflow-hidden group-hover:w-3 transition-all duration-300 opacity-0 group-hover:opacity-100"><ChevronRight size={14} className="text-indigo-400" /></span>
                  {item}
                </Link>
              ))}
            </nav>
          </div>

          {/* 3. Admin Links */}
          <div className="flex flex-col">
            <h4 className="font-heading font-semibold text-gray-900 mb-5 tracking-wide">Admin Core</h4>
            <nav className="flex flex-col gap-3 font-sans">
              {['Manage Students', 'Departments', 'Fee Management', 'System Reports'].map((item) => (
                <Link key={item} to="#" className="text-sm text-gray-500 hover:text-indigo-600 transition-colors flex items-center gap-1 group w-fit">
                  <span className="w-0 overflow-hidden group-hover:w-3 transition-all duration-300 opacity-0 group-hover:opacity-100"><ChevronRight size={14} className="text-indigo-400" /></span>
                  {item}
                </Link>
              ))}
            </nav>
          </div>

          {/* 4. Support Section */}
          <div className="flex flex-col">
            <h4 className="font-heading font-semibold text-gray-900 mb-5 tracking-wide">Support</h4>
            <nav className="flex flex-col gap-3 font-sans">
              {['Help Center', 'Contact Us', 'FAQ', 'System Status'].map((item) => (
                <Link key={item} to="#" className="text-sm text-gray-500 hover:text-indigo-600 transition-colors flex items-center gap-1 group w-fit">
                  <span className="w-0 overflow-hidden group-hover:w-3 transition-all duration-300 opacity-0 group-hover:opacity-100"><ChevronRight size={14} className="text-indigo-400" /></span>
                  {item}
                </Link>
              ))}
            </nav>
          </div>

          {/* 5. Legal / Info */}
          <div className="flex flex-col">
            <h4 className="font-heading font-semibold text-gray-900 mb-5 tracking-wide">Legal</h4>
            <nav className="flex flex-col gap-3 font-sans">
              {['Privacy Policy', 'Terms & Conditions', 'Cookie Policy', 'About System'].map((item) => (
                <Link key={item} to="#" className="text-sm text-gray-500 hover:text-indigo-600 transition-colors flex items-center gap-1 group w-fit">
                  <span className="w-0 overflow-hidden group-hover:w-3 transition-all duration-300 opacity-0 group-hover:opacity-100"><ChevronRight size={14} className="text-indigo-400" /></span>
                  {item}
                </Link>
              ))}
            </nav>
          </div>

        </div>

        {/* Divider & Bottom Section */}
        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
          
          <p className="text-sm text-gray-400 font-medium font-sans order-2 md:order-1 text-center md:text-left">
            &copy; {new Date().getFullYear()} College Smart Account. All rights reserved.
          </p>

          <button 
            onClick={scrollToTop}
            className="order-1 md:order-2 flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-indigo-600 transition-colors group bg-gray-50 hover:bg-indigo-50 px-4 py-2 rounded-full border border-gray-200 hover:border-indigo-200 shadow-sm"
          >
            Back to Top
            <ArrowUp size={16} className="group-hover:-translate-y-1 transition-transform duration-300" />
          </button>

        </div>

      </div>
    </footer>
  );
};

export default Footer;