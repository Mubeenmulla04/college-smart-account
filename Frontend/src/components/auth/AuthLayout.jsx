import React from 'react';
import { GraduationCap } from 'lucide-react';

/**
 * AuthLayout — Compact split-screen auth wrapper using Tailwind CSS.
 */
const AuthLayout = ({
  stepper,
  children,
  bottomLink
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px] border border-gray-100">

        {/* ── LEFT PANEL ───────────────────────────────────────── */}
        <div className="w-full md:w-2/5 bg-gray-50 p-8 lg:p-12 border-r border-gray-100 flex flex-col relative overflow-hidden">
          
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-50/50 to-blue-50/50 pointer-events-none"></div>

          <div className="relative z-10 flex-1 flex flex-col">
            {/* Brand */}
            <div className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
                <GraduationCap size={22} strokeWidth={2.5} />
              </div>
              <div className="font-bold text-xl text-gray-900 tracking-tight leading-none">
                College Smart<br/>
                <span className="text-indigo-600 text-sm tracking-widest uppercase">Account</span>
              </div>
            </div>

            {/* Stepper */}
            <div className="flex-1">
              {stepper}
            </div>

            {bottomLink && <div className="mt-8 pt-6 border-t border-gray-200/60">{bottomLink}</div>}
          </div>
        </div>

        {/* ── RIGHT PANEL ──────────────────────────────────────── */}
        <div className="w-full md:w-3/5 p-8 lg:p-12 flex flex-col justify-center bg-white">
          <div className="w-full max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AuthLayout;
