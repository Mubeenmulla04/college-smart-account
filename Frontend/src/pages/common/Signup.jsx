import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../../services';
import { 
  User, GraduationCap, Lock, ShieldCheck, 
  Hash, Mail, Phone, Calendar, Users, 
  Building2, CalendarDays, MapPin, Tag,
  Info, Shield, Zap, Headphones, ArrowLeft, ArrowRight,
  MailOpen, CheckCircle2, AlertCircle, Eye, EyeOff
} from 'lucide-react';

const STEPS = [
  { id: 1, label: 'Personal Information', desc: 'Basic details about you', icon: User },
  { id: 2, label: 'Academic Information', desc: 'Your academic details', icon: GraduationCap },
  { id: 3, label: 'Set Password',         desc: 'Secure your account', icon: Lock },
  { id: 4, label: 'Verify & Confirm',     desc: 'Email verification', icon: ShieldCheck },
];

const DEPARTMENTS = {
  'DIPLOMA': [
    'Diploma in Mechanical Engineering',
    'Diploma in Electrical Engineering',
  ],
  'UNDERGRADUATE (UG)': [
    'Biomedical Engineering',
    'Civil Engineering',
    'Computer Science Engineering',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Electronics & Telecomm. Engg.',
  ],
  'POSTGRADUATE (PG)': [
    'Master of Computer Application (MCA)',
    'MTech Civil Engg. (WRE)',
  ],
};

const CATEGORIES     = ['General', 'OBC', 'SC', 'ST', 'EWS', 'Other'];
const CURRENT_YEAR   = new Date().getFullYear();
const ADMISSION_YEARS = Array.from({ length: 6 }, (_, i) => String(CURRENT_YEAR - i));

const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
const isPhone = (v) => /^[6-9]\d{9}$/.test(v.replace(/\s|-/g, ''));
const isName  = (v) => v.trim().length >= 2 && /^[a-zA-Z\s.'-]+$/.test(v.trim());
const isId    = (v) => /^[A-Za-z0-9]{4,15}$/.test(v.trim());
const DOB_MAX = new Date(Date.now() - 14 * 365.25 * 24 * 3600 * 1000).toISOString().split('T')[0];

const Signup = () => {
  const navigate = useNavigate();

  const [step, setStep]         = useState(1);
  const [loading, setLoading]   = useState(false);
  const [apiError, setApiError] = useState('');
  const [success, setSuccess]   = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [otpEmail, setOtpEmail] = useState('');
  const [otp, setOtp]           = useState(['', '', '', '', '', '']);
  const [devOtp, setDevOtp]     = useState('');
  const [otpError, setOtpError] = useState('');
  const otpRefs = useRef([]);

  const [form, setForm] = useState({
    studentId: '', name: '', email: '', phone: '', dateOfBirth: '', gender: '',
    department: '', year: '', rollNumber: '', admissionYear: '', category: '', address: '',
    password: '', confirmPassword: '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
    setApiError('');
  };

  const validate = (p) => {
    const e = {};
    if (p === 1) {
      if (!isName(form.name))        e.name        = 'Enter your full name (letters only)';
      if (!isId(form.studentId))     e.studentId   = 'Invalid Student ID (4–15 alphanumeric)';
      if (!isEmail(form.email))      e.email       = 'Enter a valid email address';
      if (!isPhone(form.phone))      e.phone       = 'Enter a valid 10-digit mobile number';
      if (!form.dateOfBirth)         e.dateOfBirth = 'Date of birth is required';
      if (!form.gender)              e.gender      = 'Select your gender';
    }
    if (p === 2) {
      if (!form.department)                              e.department    = 'Select a department';
      if (!form.year)                                    e.year          = 'Select your year';
      if (!form.admissionYear)                           e.admissionYear = 'Select admission year';
      if (!form.category)                                e.category      = 'Select your category';
      if (!form.address.trim() || form.address.length < 10) e.address    = 'Enter complete address (min 10 chars)';
    }
    if (p === 3) {
      if (!form.password || form.password.length < 8)   e.password        = 'Password must be at least 8 characters';
      if (form.password !== form.confirmPassword)        e.confirmPassword = 'Passwords do not match';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const goNext = () => { if (validate(step)) setStep(s => s + 1); };
  const goPrev = () => { setStep(s => s - 1); setApiError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate(3)) return;

    setLoading(true);
    setApiError('');

    const payload = {
      studentId:    form.studentId.trim(),
      name:         form.name.trim(),
      email:        form.email.trim().toLowerCase(),
      phone:        form.phone.trim(),
      dateOfBirth:  form.dateOfBirth,
      gender:       form.gender,
      department:   form.department,
      year:         parseInt(form.year),
      rollNumber:   form.studentId.trim(),
      admissionYear:parseInt(form.admissionYear),
      category:     form.category,
      address:      form.address.trim(),
      password:     form.password,
    };

    try {
      const result = await authAPI.register(payload);
      setLoading(false);

      if (result.success) {
        setOtpEmail(payload.email);
        if (result.otp) setDevOtp(result.otp);
        setStep(4);
      } else {
        setApiError(result.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setLoading(false);
      setApiError('An error occurred during registration.');
    }
  };

  const handleOtpChange = (i, v) => {
    if (!/^\d?$/.test(v)) return;
    const updated = [...otp]; updated[i] = v; setOtp(updated); setOtpError('');
    if (v && i < 5) otpRefs.current[i + 1]?.focus();
  };
  
  const handleOtpKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
  };
  
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    setOtp(Array.from({ length: 6 }, (_, i) => text[i] || ''));
    otpRefs.current[Math.min(text.length, 5)]?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== 6) { setOtpError('Please enter all 6 digits'); return; }
    setLoading(true);
    
    try {
      const result = await authAPI.verifyOtp(otpEmail, code, 'student');
      setLoading(false);
      if (result.success) {
        setSuccess('Registration complete! Redirecting…');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setOtpError(result.message || 'Invalid OTP. Try again.');
      }
    } catch (err) {
      setLoading(false);
      setOtpError('An error occurred. Please try again.');
    }
  };

  if (step === 4) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 selection:bg-blue-100">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sm:p-10 animate-in fade-in zoom-in-95 duration-300">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 transform -rotate-6">
            <MailOpen size={32} strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Check your email</h2>
          <p className="text-center text-gray-500 mb-8">
            We sent a 6-digit code to <strong className="text-gray-900">{otpEmail}</strong>
          </p>

          {devOtp && (
            <div className="mb-6 p-3 bg-amber-50 text-amber-800 text-sm rounded-xl border border-amber-200 text-center flex items-center justify-center gap-2">
              <Zap size={16} /> Dev mode · OTP: <b className="font-mono text-base">{devOtp}</b>
            </div>
          )}
          
          {success && (
            <div className="mb-6 p-3 bg-emerald-50 text-emerald-700 text-sm rounded-xl border border-emerald-200 text-center flex items-center justify-center gap-2">
              <CheckCircle2 size={16} /> {success}
            </div>
          )}

          <div className="flex gap-2 sm:gap-3 justify-center mb-6" onPaste={handleOtpPaste}>
            {otp.map((d, i) => (
              <input
                key={i}
                ref={el => otpRefs.current[i] = el}
                type="text" inputMode="numeric" maxLength={1} value={d}
                onChange={e => handleOtpChange(i, e.target.value)}
                onKeyDown={e => handleOtpKeyDown(i, e)}
                autoFocus={i === 0}
                className={`w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-semibold rounded-xl border ${
                  otpError ? 'border-red-300 bg-red-50 focus:ring-red-200' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
                } focus:ring-4 outline-none transition-all duration-200`}
              />
            ))}
          </div>

          {otpError && <p className="text-red-500 text-sm text-center mb-6">{otpError}</p>}

          <button
            onClick={handleVerify}
            disabled={loading}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all duration-200 shadow-lg shadow-blue-200 flex justify-center items-center gap-2 disabled:opacity-70"
          >
            {loading ? 'Verifying...' : (
              <>Verify & Continue <ArrowRight size={18} /></>
            )}
          </button>

          <button
            onClick={() => { setStep(3); setOtp(['','','','','','']); }}
            className="w-full mt-6 text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium"
          >
            ← Back to registration
          </button>
        </div>
      </div>
    );
  }

  const HEADERS = {
    1: { title: 'Personal Information', sub: 'Please provide your basic details to get started', icon: User },
    2: { title: 'Academic Information', sub: 'Provide your department and enrollment details', icon: GraduationCap },
    3: { title: 'Secure Your Account',  sub: 'Create a strong password to protect your data', icon: Lock },
  };
  const CurrentHeader = HEADERS[step];
  
  const InputField = ({ label, name, type="text", icon: Icon, error, ...props }) => (
    <div className={`col-span-1 ${props.full ? 'md:col-span-2' : ''}`}>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
          <Icon size={18} />
        </div>
        {type === 'select' ? (
          <select
            name={name}
            className={`w-full pl-10 pr-4 py-3 rounded-xl border appearance-none ${error ? 'border-red-300 focus:ring-red-100 bg-red-50/50' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100 bg-gray-50/50'} focus:bg-white outline-none focus:ring-4 transition-all duration-200 text-gray-900`}
            {...props}
          >
            <option value="" disabled hidden>{props.placeholder}</option>
            {props.options && props.options.map(o => {
              const val = typeof o === 'string' ? o : o.value;
              const lbl = typeof o === 'string' ? o : o.label;
              return <option key={val} value={val}>{lbl}</option>;
            })}
            {props.optGroups && Object.entries(props.optGroups).map(([group, opts]) => (
              <optgroup key={group} label={group}>
                {opts.map(o => <option key={o} value={o}>{o}</option>)}
              </optgroup>
            ))}
          </select>
        ) : type === 'textarea' ? (
          <textarea
            name={name}
            className={`w-full pl-10 pr-4 py-3 rounded-xl border ${error ? 'border-red-300 focus:ring-red-100 bg-red-50/50' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100 bg-gray-50/50'} focus:bg-white outline-none focus:ring-4 transition-all duration-200 text-gray-900 resize-none`}
            {...props}
          />
        ) : (
          <input
            type={type === 'password' && showPassword ? 'text' : type}
            name={name}
            className={`w-full pl-10 pr-10 py-3 rounded-xl border ${error ? 'border-red-300 focus:ring-red-100 bg-red-50/50' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100 bg-gray-50/50'} focus:bg-white outline-none focus:ring-4 transition-all duration-200 text-gray-900`}
            {...props}
          />
        )}
        {type === 'password' && (
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600">
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
        {type === 'select' && (
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
          </div>
        )}
      </div>
      {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Left Sidebar Layout */}
      <div className="w-full md:w-5/12 lg:w-4/12 bg-gradient-to-br from-blue-900 to-indigo-800 text-white p-8 md:p-12 flex flex-col justify-between relative overflow-hidden min-h-[300px] md:min-h-screen">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
           <div className="absolute top-[-10%] right-[-10%] w-96 h-96 rounded-full bg-blue-500 opacity-20 blur-3xl"></div>
           <div className="absolute bottom-[-10%] left-[-10%] w-80 h-80 rounded-full bg-indigo-500 opacity-30 blur-3xl"></div>
        </div>

        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 mb-12 group">
            <div className="w-10 h-10 bg-white/10 rounded-xl backdrop-blur-md flex items-center justify-center border border-white/20 group-hover:scale-105 transition-transform">
              <span className="text-xl">🎓</span>
            </div>
            <span className="font-bold text-xl tracking-tight text-white">Smart Account</span>
          </Link>

          <h2 className="text-3xl font-bold mb-8 leading-tight">Join thousands of students on our platform.</h2>
          
          <div className="space-y-6 hidden md:block">
            {STEPS.map((s, idx) => (
              <div key={s.id} className="flex gap-4 relative">
                {idx < STEPS.length - 1 && (
                  <div className={`absolute top-10 left-5 w-0.5 h-full -ml-px ${step > s.id ? 'bg-blue-400' : 'bg-white/10'}`}></div>
                )}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-colors duration-300 z-10 ${
                  step > s.id ? 'bg-blue-500 border-blue-500 text-white' : 
                  step === s.id ? 'bg-white/10 border-blue-400 text-blue-300 backdrop-blur-md' : 
                  'bg-transparent border-white/20 text-white/40'
                }`}>
                  {step > s.id ? <CheckCircle2 size={20} /> : <s.icon size={18} />}
                </div>
                <div className="pt-2 pb-6">
                  <h4 className={`font-semibold ${step >= s.id ? 'text-white' : 'text-white/40'}`}>{s.label}</h4>
                  <p className={`text-sm ${step >= s.id ? 'text-blue-100' : 'text-white/30'}`}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Form Layout */}
      <div className="w-full md:w-7/12 lg:w-8/12 bg-white flex flex-col justify-center py-10 px-6 sm:px-12 lg:px-24">
        <div className="max-w-2xl w-full mx-auto">
          
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                <CurrentHeader.icon size={24} strokeWidth={2} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{CurrentHeader.title}</h2>
                <p className="text-sm text-gray-500">{CurrentHeader.sub}</p>
              </div>
            </div>
            <div className="hidden sm:flex px-3 py-1 bg-gray-100 text-gray-600 text-sm font-semibold rounded-full">
              Step {step} of 4
            </div>
          </div>

          {apiError && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100 flex gap-3 items-start animate-in fade-in">
              <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
              <p>{apiError}</p>
            </div>
          )}

          <form onSubmit={step === 3 ? handleSubmit : (e) => e.preventDefault()} className="space-y-6">
            
            {step === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-right-4 fade-in duration-300">
                <InputField label="Full Name" name="name" value={form.name} onChange={handleChange} icon={User} placeholder="Enter your full name" error={errors.name} />
                <InputField label="PRN (Student ID)" name="studentId" value={form.studentId} onChange={handleChange} icon={Hash} placeholder="Enter your PRN" error={errors.studentId} />
                <InputField label="Email Address" name="email" type="email" value={form.email} onChange={handleChange} icon={Mail} placeholder="name@example.com" error={errors.email} />
                <InputField label="Phone Number" name="phone" type="tel" value={form.phone} onChange={handleChange} icon={Phone} placeholder="10-digit mobile number" error={errors.phone} />
                <InputField label="Date of Birth" name="dateOfBirth" type="date" max={DOB_MAX} value={form.dateOfBirth} onChange={handleChange} icon={Calendar} error={errors.dateOfBirth} />
                <InputField label="Gender" name="gender" type="select" options={['Male', 'Female', 'Other']} value={form.gender} onChange={handleChange} icon={Users} placeholder="Select gender" error={errors.gender} />
                
                <div className="md:col-span-2 mt-2 p-4 bg-blue-50 rounded-xl flex gap-3 text-sm text-blue-800 border border-blue-100">
                  <Info size={18} className="flex-shrink-0 text-blue-600" />
                  <p>Please ensure all details match your official documents. You cannot change them easily later.</p>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-right-4 fade-in duration-300">
                <InputField full label="Department / Branch" name="department" type="select" optGroups={DEPARTMENTS} value={form.department} onChange={handleChange} icon={Building2} placeholder="Select your department" error={errors.department} />
                <InputField label="Current Year" name="year" type="select" options={[{label: '1st Year', value: '1'}, {label: '2nd Year', value: '2'}, {label: '3rd Year', value: '3'}, {label: '4th Year', value: '4'}]} value={form.year} onChange={handleChange} icon={CalendarDays} placeholder="Current year" error={errors.year} />
                <InputField label="Admission Year" name="admissionYear" type="select" options={ADMISSION_YEARS} value={form.admissionYear} onChange={handleChange} icon={Calendar} placeholder="Admission year" error={errors.admissionYear} />
                <InputField label="Category" name="category" type="select" options={CATEGORIES} value={form.category} onChange={handleChange} icon={Tag} placeholder="Select category" error={errors.category} />
                <InputField full label="Permanent Address" name="address" type="textarea" rows="2" value={form.address} onChange={handleChange} icon={MapPin} placeholder="House No., Street, City, State - PIN" error={errors.address} />
              </div>
            )}

            {step === 3 && (
              <div className="animate-in slide-in-from-right-4 fade-in duration-300 space-y-6">
                <div className="flex flex-wrap gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-sm font-medium text-gray-700 rounded-lg shadow-sm"><User size={14} className="text-gray-400" /> {form.name}</div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-sm font-medium text-gray-700 rounded-lg shadow-sm"><Building2 size={14} className="text-gray-400" /> {form.department.split(' ').slice(0, 2).join(' ')}...</div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-sm font-medium text-gray-700 rounded-lg shadow-sm"><Mail size={14} className="text-gray-400" /> {form.email}</div>
                </div>

                <InputField full label="Create Password" name="password" type="password" value={form.password} onChange={handleChange} icon={Lock} placeholder="Create a strong password" error={errors.password} />
                <InputField full label="Confirm Password" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} icon={Lock} placeholder="Re-enter your password" error={errors.confirmPassword} />
              </div>
            )}

            <div className="mt-10 pt-6 border-t border-gray-100 flex items-center justify-between">
              {step > 1 ? (
                <button type="button" onClick={goPrev} disabled={loading} className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-all duration-200 flex items-center gap-2">
                  <ArrowLeft size={16} /> Back
                </button>
              ) : <div></div>}

              {step < 3 ? (
                <button type="button" onClick={goNext} className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all duration-200 shadow-lg shadow-blue-200 flex items-center gap-2">
                  Next Step <ArrowRight size={16} />
                </button>
              ) : (
                <button type="submit" disabled={loading} className="px-8 py-3 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl transition-all duration-200 shadow-md flex items-center gap-2 disabled:opacity-70">
                  {loading ? 'Creating...' : <>Create Account <ArrowRight size={16} /></>}
                </button>
              )}
            </div>
          </form>

          <p className="mt-12 text-center text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">
              Sign in
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
};

export default Signup;