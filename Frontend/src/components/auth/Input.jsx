import React, { useState } from 'react';
import { Eye, EyeOff, ChevronDown } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import styles from './Input.module.css';

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
  { label: 'Weak',   color: '#ef4444' },
  { label: 'Fair',   color: '#f59e0b' },
  { label: 'Good',   color: '#3b82f6' },
  { label: 'Strong', color: '#22c55e' },
];

/**
 * Input — multi-variant form field for auth pages.
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

  const baseClass = `${styles.input} ${Icon ? styles.inputHasIcon : ''} ${isError ? styles.inputError : ''}`;

  const renderCore = () => {
    if (type === 'select') {
      return (
        <div className={styles.inputWrap}>
          {Icon && <div className={styles.leftIcon}><Icon size={18} strokeWidth={1.5} /></div>}
          <select
            id={inputId} name={name} value={value}
            onChange={onChange} className={baseClass} {...rest}
          >
            <option value="">{placeholder || 'Select…'}</option>
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
          <div className={styles.selectIcon}>
            <ChevronDown size={18} strokeWidth={1.5} />
          </div>
        </div>
      );
    }

    if (type === 'textarea') {
      return (
        <div className={styles.inputWrap}>
          {Icon && <div className={styles.leftIcon} style={{ top: '0.8rem', alignItems: 'flex-start' }}><Icon size={18} strokeWidth={1.5} /></div>}
          <textarea
            id={inputId} name={name} value={value} rows={rows}
            onChange={onChange} placeholder={placeholder}
            className={baseClass} {...rest}
          />
        </div>
      );
    }

    if (type === 'password') {
      const strength = showStrength ? calcStrength(value) : 0;
      const meta     = STRENGTH_META[strength];

      return (
        <>
          <div className={styles.inputWrap}>
            {Icon && <div className={styles.leftIcon}><Icon size={18} strokeWidth={1.5} /></div>}
            <input
              id={inputId} name={name}
              type={showPwd ? 'text' : 'password'}
              value={value} onChange={onChange}
              placeholder={placeholder}
              className={baseClass}
              autoFocus={autoFocus}
              {...rest}
            />
            <button
              type="button"
              className={styles.eyeBtn}
              onClick={() => setShowPwd(v => !v)}
              aria-label={showPwd ? 'Hide password' : 'Show password'}
              tabIndex={-1}
            >
              {showPwd ? <EyeOff size={18} strokeWidth={1.5} /> : <Eye size={18} strokeWidth={1.5} />}
            </button>
          </div>
          {showStrength && value && meta && (
            <div className={styles.strengthRow}>
              <div className={styles.strengthTrack}>
                <div
                  className={styles.strengthFill}
                  style={{ width: `${strength * 25}%`, background: meta.color }}
                />
              </div>
              <span className={styles.strengthTxt} style={{ color: meta.color }}>
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
        <div className={styles.inputWrap}>
          {Icon && <div className={styles.leftIcon}><Icon size={18} strokeWidth={1.5} /></div>}
          <div className={styles.datePickerWrapper}>
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
              className={baseClass}
              id={inputId}
              name={name}
              dateFormat="yyyy-MM-dd"
              autoFocus={autoFocus}
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
            />
          </div>
        </div>
      );
    }

    // Default: text / email / tel

    if (phonePrefix) {
      return (
        <div className={`${styles.phoneWrap} ${isError ? styles.inputError : ''}`}>
          <span className={styles.phonePrefix}>
            {Icon && <Icon size={18} strokeWidth={1.5} />}
            {phonePrefix}
          </span>
          <input
            id={inputId} name={name} type={type}
            value={value} onChange={onChange}
            placeholder={placeholder}
            maxLength={maxLength} max={max}
            className={`${baseClass} ${styles.phoneInput}`}
            autoFocus={autoFocus}
            {...rest}
          />
        </div>
      );
    }

    return (
      <div className={styles.inputWrap}>
        {Icon && <div className={styles.leftIcon}><Icon size={18} strokeWidth={1.5} /></div>}
        <input
          id={inputId} name={name} type={type}
          value={value} onChange={onChange}
          placeholder={placeholder}
          maxLength={maxLength} max={max}
          className={baseClass}
          autoFocus={autoFocus}
          {...rest}
        />
      </div>
    );
  };

  return (
    <div className={`${styles.field} ${full ? styles.fieldFull : ''}`}>
      {label && <label htmlFor={inputId} className={styles.label}>{label}</label>}
      {renderCore()}
      {error && <p className={styles.error}>{error}</p>}
      {!error && hint && <p className={styles.hint}>{hint}</p>}
    </div>
  );
};

export default Input;
