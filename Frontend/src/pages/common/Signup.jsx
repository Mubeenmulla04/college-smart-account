import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../../services';
import { AuthLayout, Stepper, Input, Button } from '../../components/auth';
import styles from '../../styles/Signup.module.css';

// ── Icons ──
import { 
  User, GraduationCap, Lock, ShieldCheck, 
  Hash, Mail, Phone, Calendar, Users, 
  Building2, CalendarDays, MapPin, Tag,
  Info, Shield, Zap, Headphones, ArrowLeft, ArrowRight,
  MailOpen
} from 'lucide-react';

// ── Static data ──────────────────────────────────────────────────────────────
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

// ── Validators ───────────────────────────────────────────────────────────────
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
const isPhone = (v) => /^[6-9]\d{9}$/.test(v.replace(/\s|-/g, ''));
const isName  = (v) => v.trim().length >= 2 && /^[a-zA-Z\s.'-]+$/.test(v.trim());
const isId    = (v) => /^[A-Za-z0-9]{4,15}$/.test(v.trim());

const DOB_MAX = new Date(Date.now() - 14 * 365.25 * 24 * 3600 * 1000)
  .toISOString().split('T')[0];

// ─────────────────────────────────────────────────────────────────────────────
const Signup = () => {
  const navigate = useNavigate();

  // ── Phase & UI state ──────────────────────────────────────────────────────
  const [step, setStep]         = useState(1);   // 1 | 2 | 3 | 4 (OTP)
  const [loading, setLoading]   = useState(false);
  const [apiError, setApiError] = useState('');
  const [success, setSuccess]   = useState('');

  // ── OTP state ──────────────────────────────────────────────────────────────
  const [otpEmail, setOtpEmail] = useState('');
  const [otp, setOtp]           = useState(['', '', '', '', '', '']);
  const [devOtp, setDevOtp]     = useState('');
  const [otpError, setOtpError] = useState('');
  const otpRefs = useRef([]);

  // ── Form data ──────────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    studentId: '', name: '', email: '', phone: '', dateOfBirth: '', gender: '',
    department: '', year: '', rollNumber: '', admissionYear: '', category: '', address: '',
    password: '', confirmPassword: '',
  });
  const [errors, setErrors] = useState({});

  // ── Handlers ───────────────────────────────────────────────────────────────
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
      if (!form.address.trim() || form.address.length < 10)
                                                         e.address       = 'Enter complete address (min 10 chars)';
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

  // ── Submit registration ────────────────────────────────────────────────────
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
      rollNumber:   form.studentId.trim(), // Using PRN as Roll Number
      admissionYear:parseInt(form.admissionYear),
      category:     form.category,
      address:      form.address.trim(),
      password:     form.password,
    };

    const result = await authAPI.register(payload);
    setLoading(false);

    if (result.success) {
      setOtpEmail(payload.email);
      if (result.otp) setDevOtp(result.otp);
      setStep(4);
    } else {
      setApiError(result.message || 'Registration failed. Please try again.');
    }
  };

  // ── OTP handlers ───────────────────────────────────────────────────────────
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
    const result = await authAPI.verifyOtp(otpEmail, code, 'student');
    setLoading(false);
    if (result.success) {
      setSuccess('Registration complete! Redirecting…');
      setTimeout(() => navigate('/login'), 2000);
    } else {
      setOtpError(result.message || 'Invalid OTP. Try again.');
    }
  };

  // ── OTP screen (standalone) ────────────────────────────────────────────────
  if (step === 4) {
    return (
      <div className={styles.otpPage}>
        <div className={styles.otpCard}>
          <div className={styles.otpIcon}>
            <MailOpen size={36} strokeWidth={1.5} />
          </div>
          <h2 className={styles.otpTitle}>Check your email</h2>
          <p className={styles.otpSub}>
            We sent a 6-digit code to <strong>{otpEmail}</strong>
          </p>

          {devOtp && <div className={styles.devBadge}>Dev mode · OTP: <b>{devOtp}</b></div>}
          {success  && <div className={styles.successBanner}>{success}</div>}

          <div className={styles.otpRow} onPaste={handleOtpPaste}>
            {otp.map((d, i) => (
              <input
                key={i}
                ref={el => otpRefs.current[i] = el}
                type="text" inputMode="numeric" maxLength={1} value={d}
                id={`otp-${i}`}
                onChange={e => handleOtpChange(i, e.target.value)}
                onKeyDown={e => handleOtpKeyDown(i, e)}
                className={`${styles.otpDigit} ${otpError ? styles.otpDigitErr : ''}`}
                autoFocus={i === 0}
              />
            ))}
          </div>

          {otpError && <p className={styles.otpErr}>{otpError}</p>}

          <Button
            variant="primary" full loading={loading}
            loadingText="Verifying…"
            onClick={handleVerify}
          >
            Verify & Continue <ArrowRight size={16} />
          </Button>

          <button className={styles.backLink}
            onClick={() => { setStep(3); setOtp(['','','','','','']); }}>
            Back to registration
          </button>
        </div>
      </div>
    );
  }

  // ── Header configs ─────────────────────────────────────────────────────────
  const HEADERS = {
    1: { title: 'Personal Information', sub: 'Please provide your basic details to get started', icon: User },
    2: { title: 'Academic Information', sub: 'Provide your department and enrollment details', icon: GraduationCap },
    3: { title: 'Secure Your Account',  sub: 'Create a strong password to protect your data', icon: Lock },
  };
  const currentHeader = HEADERS[step];

  // ── Split-screen registration layout ──────────────────────────────────────
  return (
    <AuthLayout 
      stepper={<Stepper steps={STEPS} current={step} />}
      bottomLink={
        <>Already have an account? <Link to="/login">Sign in</Link></>
      }
    >

      {apiError && <div className={styles.alertError}>⚠ {apiError}</div>}

      <div className={styles.formCard}>

        {/* ── Form Header ── */}
        <div className={styles.headerRow}>
          <div className={styles.headerTitle}>
            <div className={styles.headerIcon}>
              <currentHeader.icon size={26} strokeWidth={1.8} />
            </div>
            <div className={styles.headerText}>
              <h1>{currentHeader.title}</h1>
              <p>{currentHeader.sub}</p>
            </div>
          </div>
          <div className={styles.stepTag}>
            Step {step} of 4
          </div>
        </div>

        {/* ══ PHASE 1 — Personal Info ══════════════════════════════════════════ */}
        {step === 1 && (
          <>
            <div className={styles.grid2}>
              <Input label="Full Name"      name="name"        value={form.name}
                icon={User}
                onChange={handleChange} placeholder="Enter your full name"
                error={errors.name}/>

              <Input label="PRN (Student ID)" name="studentId"   value={form.studentId}
                icon={Hash}
                onChange={handleChange} placeholder="Enter your PRN"
                error={errors.studentId}/>

              <Input label="Email Address"  name="email"       type="email" value={form.email}
                icon={Mail}
                onChange={handleChange} placeholder="Enter your email"
                error={errors.email}/>

              <Input label="Phone Number"  name="phone"       type="tel"   value={form.phone}
                icon={Phone}
                onChange={handleChange} placeholder="Enter 10-digit mobile number"
                error={errors.phone}/>

              <Input label="Date of Birth"  name="dateOfBirth" type="date"  value={form.dateOfBirth}
                icon={Calendar}
                onChange={handleChange} max={DOB_MAX} placeholder="Select date of birth"
                error={errors.dateOfBirth}/>

              <Input label="Gender"         name="gender"      type="select" value={form.gender}
                icon={Users}
                onChange={handleChange} placeholder="Select your gender"
                options={['Male', 'Female', 'Other', 'Prefer not to say']}
                error={errors.gender}/>
            </div>

            <div className={styles.infoBox}>
              <Info size={18} strokeWidth={2} />
              <p>Make sure your details are accurate. You can't change them later.</p>
            </div>

            <div className={styles.actions}>
              <div />
              <Button variant="primary" onClick={goNext}>
                Next Step <ArrowRight size={16} />
              </Button>
            </div>
          </>
        )}

        {/* ══ PHASE 2 — Academic Info ══════════════════════════════════════════ */}
        {step === 2 && (
          <>
            <div className={styles.grid2}>
              <Input label="Department / Branch" name="department" type="select" value={form.department}
                icon={Building2}
                onChange={handleChange} placeholder="Select your department"
                optGroups={DEPARTMENTS} error={errors.department} full/>

              <Input label="Current Year"     name="year"          type="select" value={form.year}
                icon={CalendarDays}
                onChange={handleChange} placeholder="Select your current year"
                options={['1st Year', '2nd Year', '3rd Year', '4th Year'].map((l, i) => ({ label: l, value: String(i+1) }))}
                error={errors.year}/>

              <Input label="Admission Year"   name="admissionYear" type="select" value={form.admissionYear}
                icon={Calendar}
                onChange={handleChange} placeholder="Select admission year"
                options={ADMISSION_YEARS} error={errors.admissionYear}/>

              <Input label="Category"         name="category"      type="select" value={form.category}
                icon={Tag}
                onChange={handleChange} placeholder="Select your category"
                options={CATEGORIES} error={errors.category}/>

              <Input label="Permanent Address" name="address"      type="textarea" value={form.address}
                icon={MapPin}
                onChange={handleChange}
                placeholder="House No., Street, City, State – PIN"
                rows={2} error={errors.address} full/>
            </div>

            <div className={styles.actions}>
              <Button variant="secondary" onClick={goPrev}><ArrowLeft size={16} /> Back</Button>
              <Button variant="primary"   onClick={goNext}>Next Step <ArrowRight size={16} /></Button>
            </div>
          </>
        )}

        {/* ══ PHASE 3 — Password ══════════════════════════════════════════════ */}
        {step === 3 && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            
            <div className={styles.summaryStrip}>
              <SummaryTag icon={<User size={14}/>} text={form.name}/>
              <SummaryTag icon={<Building2 size={14}/>} text={form.department}/>
              <SummaryTag icon={<Mail size={14}/>} text={form.email}/>
            </div>

            <div className={styles.gridSingle}>
              <Input
                label="Create Password" name="password" type="password" value={form.password}
                icon={Lock}
                onChange={handleChange} placeholder="Create a strong password"
                error={errors.password} showStrength full/>

              <Input
                label="Confirm Password" name="confirmPassword" type="password"
                icon={Lock}
                value={form.confirmPassword} onChange={handleChange}
                placeholder="Re-enter your password"
                error={errors.confirmPassword} full/>
            </div>

            <div className={styles.actions}>
              <Button type="button" variant="secondary" onClick={goPrev}>
                <ArrowLeft size={16} /> Back
              </Button>
              <Button type="submit" variant="primary" loading={loading} loadingText="Creating…">
                Create Account <ArrowRight size={16} />
              </Button>
            </div>
          </form>
        )}

      </div>

      {/* ── Features Bar ── */}
      <div className={styles.featuresBar}>
        <div className={styles.feature}>
          <div className={styles.featureIcon}><Shield size={16} strokeWidth={2}/></div>
          <div className={styles.featureText}>
            <h4>Secure & Safe</h4>
            <p>Your data is encrypted and protected</p>
          </div>
        </div>
        <div className={styles.feature}>
          <div className={styles.featureIcon}><Zap size={16} strokeWidth={2}/></div>
          <div className={styles.featureText}>
            <h4>Quick & Easy</h4>
            <p>Get registered in just a few minutes</p>
          </div>
        </div>
        <div className={styles.feature}>
          <div className={styles.featureIcon}><Headphones size={16} strokeWidth={2}/></div>
          <div className={styles.featureText}>
            <h4>24/7 Support</h4>
            <p>We're here to help you anytime</p>
          </div>
        </div>
      </div>

    </AuthLayout>
  );
};

const SummaryTag = ({ icon, text }) => (
  <div className={styles.tag}><span>{icon}</span>{text || '—'}</div>
);

export default Signup;