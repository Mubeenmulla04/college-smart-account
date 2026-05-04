import React, { useState } from 'react';
import { Eye, EyeOff, ChevronDown } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// ── Strength helpers ──────────────────────────────────────────────────────────
const calcStrength = (pwd) => {
  let s = 0;
  if (pwd.length >= 8)          s++;
  if (/[A-Z]/.test(pwd))        s++;
  if (/[0-9]/.test(pwd))        s++;
  if (/[^A-Za-z0-9]/.test(pwd)) s++;
  return s;
};

const STRENGTH_META = [
  null,
  { label: 'Weak',   colorClass: 'bg-red-500', textClass: 'text-red-500' },
  { label: 'Fair',   colorClass: 'bg-amber-500', textClass: 'text-amber-500' },
  { label: 'Good',   colorClass: 'bg-blue-500', textClass: 'text-blue-500' },
  { label: 'Strong', colorClass: 'bg-emerald-500', textClass: 'text-emerald-500' },
];

/**
 * Input — multi-variant form field using Tailwind CSS.
 */
const Input = ({
  label,
  name,
  type = 'text',
  value = '',
  onChange,
  placeholder,
  error,
  hint,
  full,
  icon: Icon,
  options,
  optGroups,
  maxLength,
  max,
  rows = 2,
  phonePrefix,
  showStrength = false,
  id,
  autoFocus,
  ...rest
}) => {
  const [showPwd, setShowPwd] = useState(false);
  const inputId = id || name;
  const isError = Boolean(error);

  const baseInputClass = `w-full bg-gray-50 border transition-all duration-200 outline-none text-gray-900 placeholder-gray-400 focus:bg-white
    ${Icon ? 'pl-11 pr-4' : 'px-4'}
    ${type === 'textarea' ? 'py-3 rounded-2xl resize-y min-h-[80px]' : 'h-11 rounded-xl'}
    ${isError 
      ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100 bg-red-50/30' 
      : 'border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 hover:border-gray-300'
    }
  `;

  const iconContainerClass = `absolute left-0 top-0 h-11 w-11 flex items-center justify-center pointer-events-none text-gray-400 ${isError ? 'text-red-400' : ''} ${type === 'textarea' ? 'items-start pt-3' : ''}`;

  const renderCore = () => {
    if (type === 'select') {
      return (
        <div className="relative">
          {Icon && <div className={iconContainerClass}><Icon size={18} strokeWidth={2} /></div>}
          <select
            id={inputId} name={name} value={value}
            onChange={onChange} className={`${baseInputClass} appearance-none pr-10 cursor-pointer`} {...rest}
          >
            <option value="" disabled hidden>{placeholder || 'Select…'}</option>
            {options?.map(o => {
              const val = typeof o === 'object' ? o.value : o;
              const lbl = typeof o === 'object' ? o.label : o;
              return <option key={val} value={val}>{lbl}</option>;
            })}
            {optGroups && Object.entries(optGroups).map(([grp, items]) => (
              <optgroup key={grp} label={grp}>
                {items.map(o => {
                  const val = typeof o === 'object' ? o.value : o;
                  const lbl = typeof o === 'object' ? o.label : o;
                  return <option key={val} value={val}>{lbl}</option>;
                })}
              </optgroup>
            ))}
          </select>
          <div className="absolute right-0 top-0 h-11 w-11 flex items-center justify-center pointer-events-none text-gray-400">
            <ChevronDown size={18} strokeWidth={2} />
          </div>
        </div>
      );
    }

    if (type === 'textarea') {
      return (
        <div className="relative">
          {Icon && <div className={iconContainerClass}><Icon size={18} strokeWidth={2} /></div>}
          <textarea
            id={inputId} name={name} value={value} rows={rows}
            onChange={onChange} placeholder={placeholder}
            className={baseInputClass} {...rest}
          />
        </div>
      );
    }

    if (type === 'password') {
      const strength = showStrength ? calcStrength(value) : 0;
      const meta     = STRENGTH_META[strength];

      return (
        <>
          <div className="relative">
            {Icon && <div className={iconContainerClass}><Icon size={18} strokeWidth={2} /></div>}
            <input
              id={inputId} name={name}
              type={showPwd ? 'text' : 'password'}
              value={value} onChange={onChange}
              placeholder={placeholder}
              className={`${baseInputClass} pr-11`}
              autoFocus={autoFocus}
              {...rest}
            />
            <button
              type="button"
              className="absolute right-0 top-0 h-11 w-11 flex items-center justify-center text-gray-400 hover:text-indigo-600 transition-colors focus:outline-none"
              onClick={() => setShowPwd(v => !v)}
              aria-label={showPwd ? 'Hide password' : 'Show password'}
              tabIndex={-1}
            >
              {showPwd ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
            </button>
          </div>
          {showStrength && value && meta && (
            <div className="flex items-center gap-3 mt-2 animate-in fade-in slide-in-from-top-1">
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden flex gap-0.5">
                {[1, 2, 3, 4].map(level => (
                  <div 
                    key={level} 
                    className={`h-full flex-1 transition-all duration-300 ${level <= strength ? meta.colorClass : 'bg-transparent'}`}
                  />
                ))}
              </div>
              <span className={`text-xs font-bold uppercase tracking-wider ${meta.textClass}`}>
                {meta.label}
              </span>
            </div>
          )}
        </>
      );
    }

    // Date variant using react-datepicker
    if (type === 'date') {
      const selectedDate = value ? new Date(value) : null;
      const maxDate = max ? new Date(max) : null;
      
      return (
        <div className="relative">
          {Icon && <div className={iconContainerClass}><Icon size={18} strokeWidth={2} /></div>}
          <div className="w-full">
            <DatePicker
              selected={selectedDate}
              onChange={(date) => {
                let dateString = '';
                if (date) {
                  const y = date.getFullYear();
                  const m = String(date.getMonth() + 1).padStart(2, '0');
                  const d = String(date.getDate()).padStart(2, '0');
                  dateString = `${y}-${m}-${d}`;
                }
                if (onChange) {
                  onChange({ target: { name, value: dateString } });
                }
              }}
              maxDate={maxDate}
              placeholderText={placeholder}
              className={`${baseInputClass} w-full`}
              id={inputId}
              name={name}
              dateFormat="yyyy-MM-dd"
              autoFocus={autoFocus}
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
              wrapperClassName="w-full"
            />
          </div>
        </div>
      );
    }

    // Default: text / email / tel

    if (phonePrefix) {
      return (
        <div className="relative flex">
          <div className={`flex items-center justify-center px-4 bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl text-gray-500 font-medium ${isError ? 'border-red-300 bg-red-50 text-red-500' : ''}`}>
            {Icon && <Icon size={16} strokeWidth={2} className="mr-1.5" />}
            {phonePrefix}
          </div>
          <input
            id={inputId} name={name} type={type}
            value={value} onChange={onChange}
            placeholder={placeholder}
            maxLength={maxLength} max={max}
            className={`${baseInputClass} rounded-l-none pl-4 border-l-0 focus:border-l`}
            autoFocus={autoFocus}
            {...rest}
          />
        </div>
      );
    }

    return (
      <div className="relative">
        {Icon && <div className={iconContainerClass}><Icon size={18} strokeWidth={2} /></div>}
        <input
          id={inputId} name={name} type={type}
          value={value} onChange={onChange}
          placeholder={placeholder}
          maxLength={maxLength} max={max}
          className={baseInputClass}
          autoFocus={autoFocus}
          {...rest}
        />
      </div>
    );
  };

  return (
    <div className={`flex flex-col ${full ? 'w-full' : ''}`}>
      {label && <label htmlFor={inputId} className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>}
      {renderCore()}
      {error && <p className="mt-1.5 text-sm text-red-500 font-medium animate-in fade-in">{error}</p>}
      {!error && hint && <p className="mt-1.5 text-xs text-gray-500">{hint}</p>}
    </div>
  );
};

export default Input;
