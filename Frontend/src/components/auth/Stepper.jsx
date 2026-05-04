import React from 'react';
import { Check } from 'lucide-react';

/**
 * Stepper — Compact vertical line step indicator using Tailwind CSS.
 */
const Stepper = ({ steps = [], current = 1 }) => {
  return (
    <div className="flex flex-col">
      {steps.map((step, idx) => {
        const isDone    = current > step.id;
        const isActive  = current === step.id;

        return (
          <div key={step.id} className="flex group">
            
            {/* Left: circle + connector */}
            <div className="flex flex-col items-center mr-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                isDone
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                  : isActive
                  ? 'bg-white border-2 border-indigo-600 text-indigo-600 shadow-md'
                  : 'bg-gray-100 border border-gray-200 text-gray-400'
              }`}>
                {isDone ? (
                  <Check size={16} strokeWidth={3} />
                ) : (
                  step.icon && <step.icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                )}
              </div>
              
              {/* Connector line (hide on last item) */}
              {idx < steps.length - 1 && (
                <div className={`w-0.5 h-10 my-1 rounded-full transition-colors duration-300 ${
                  isDone ? 'bg-indigo-600' : 'bg-gray-200'
                }`} />
              )}
            </div>

            {/* Right: text */}
            <div className={`pb-8 pt-1 ${idx === steps.length - 1 ? 'pb-0' : ''}`}>
              <div className={`text-sm font-bold tracking-wide uppercase transition-colors duration-300 ${
                isActive ? 'text-indigo-600' : isDone ? 'text-gray-900' : 'text-gray-400'
              }`}>
                {step.label}
              </div>
              <div className={`text-sm mt-0.5 transition-colors duration-300 ${
                isActive ? 'text-gray-900 font-medium' : 'text-gray-500'
              }`}>
                {step.desc}
              </div>
            </div>

          </div>
        );
      })}
    </div>
  );
};

export default Stepper;
