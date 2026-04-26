import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AuthLayout, Input, Button } from '../../components/auth';
import styles from '../../styles/Login.module.css';

// ── Icons ──
import { Mail, Lock, User, ArrowRight, MailOpen, Shield, Zap, Headphones, Sparkles } from 'lucide-react';

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{width: 18, height: 18}}>
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" fill="#0f172a" xmlns="http://www.w3.org/2000/svg" style={{width: 18, height: 18}}>
    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
  </svg>
);

const LoginInfo = () => (
  <div className={styles.loginInfo}>
    <div className={styles.infoBadge}>
      <Sparkles size={14} /> Smart Account
    </div>
    <h3 className={styles.infoTitle}>Sign In to Your Portal</h3>
    <p className={styles.infoText}>
      Experience a seamless way to manage your academic journey, fee payments, and scholarship updates—all in one place.
    </p>

    <div className={styles.statsGrid}>
      <div className={styles.statBox}>
        <div className={styles.statValue}>24/7</div>
        <div className={styles.statLabel}>Access</div>
      </div>
      <div className={styles.statBox}>
        <div className={styles.statValue}>100%</div>
        <div className={styles.statLabel}>Secure</div>
      </div>
    </div>
  </div>
);

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [otpData, setOtpData] = useState({ email: '', role: '', devOtp: null });
  const [step, setStep] = useState('credentials'); // 'credentials' | 'otp'
  
  // OTP state
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const otpRefs = useRef([]);

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');
  
  const { login, verifyOtp, socialLogin } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    setApiError('');
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setApiError('');

    try {
      const result = await login(formData.email, formData.password);

      if (result.requiresOTP) {
        setOtpData({ email: result.email, role: result.role, devOtp: result.devOtp || null });
        setStep('otp');
      } else if (result.success) {
        navigate(result.role === 'admin' ? '/admin/dashboard' : '/student/dashboard');
      } else {
        setApiError(result.message || 'Invalid email or password. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setApiError('An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
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
    if (code.length < 4) { // Handling 4-digit or 6-digit depending on backend but UI allows 6
      setOtpError('Please enter the OTP'); 
      return; 
    }
    
    setIsLoading(true);
    setOtpError('');

    try {
      const result = await verifyOtp(otpData.email, code, otpData.role);

      if (result.success) {
        setSuccess('Verification successful! Redirecting…');
        setTimeout(() => {
          navigate(otpData.role === 'admin' ? '/admin/dashboard' : '/student/dashboard');
        }, 1500);
      } else {
        setOtpError(result.message || 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      setOtpError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    setIsLoading(true);
    setApiError('');
    
    try {
      const result = await socialLogin(provider);

      if (result.success) {
        navigate('/student/dashboard');
      } else {
        setApiError(result.message || `Failed to sign in with ${provider}`);
      }
    } catch (error) {
      console.error('Social login error:', error);
      setApiError(`An error occurred while signing in with ${provider}`);
    } finally {
      setIsLoading(false);
    }
  };

  // ── OTP screen (standalone) ────────────────────────────────────────────────
  if (step === 'otp') {
    return (
      <div className={styles.otpPage}>
        <div className={styles.otpCard}>
          <div className={styles.otpIcon}>
            <MailOpen size={36} strokeWidth={1.5} />
          </div>
          <h2 className={styles.otpTitle}>Check your email</h2>
          <p className={styles.otpSub}>
            We sent a verification code to <strong>{otpData.email}</strong>
          </p>

          {otpData.devOtp && <div className={styles.devBadge}>Dev mode · OTP: <b>{otpData.devOtp}</b></div>}
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
            variant="primary" full loading={isLoading}
            loadingText="Verifying…"
            onClick={handleVerify}
          >
            Verify & Continue <ArrowRight size={16} />
          </Button>

          <button className={styles.backLink}
            onClick={() => { setStep('credentials'); setOtp(['','','','','','']); }}>
            ← Back to login
          </button>
        </div>
      </div>
    );
  }

  // ── Split-screen login layout ─────────────────────────────────────────────
  return (
    <AuthLayout 
      stepper={<LoginInfo />}
      bottomLink={
        <>Don't have an account? <Link to="/signup">Create one</Link></>
      }
    >
      {apiError && <div className={styles.alertError}>⚠ {apiError}</div>}

      <div className={styles.formCard}>
        {/* ── Form Header ── */}
        <div className={styles.headerRow}>
          <div className={styles.headerTitle}>
            <div className={styles.headerIcon}>
              <User size={26} strokeWidth={1.8} />
            </div>
            <div className={styles.headerText}>
              <h1>Welcome Back</h1>
              <p>Please enter your details to sign in</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <div className={styles.gridSingle}>
            <Input 
              label="Email Address" 
              name="email" 
              type="email" 
              value={formData.email}
              icon={Mail}
              onChange={handleChange} 
              placeholder="name@example.com"
              error={errors.email}
              full
            />

            <div>
              <Input 
                label="Password" 
                name="password" 
                type="password" 
                value={formData.password}
                icon={Lock}
                onChange={handleChange} 
                placeholder="••••••••"
                error={errors.password}
                full
              />
              <Link to="/forgot-password" className={styles.forgotPassword}>
                Forgot password?
              </Link>
            </div>
          </div>

          <div className={styles.actions}>
            <div />
            <Button type="submit" variant="primary" loading={isLoading} loadingText="Signing in…">
              Sign In <ArrowRight size={16} />
            </Button>
          </div>
        </form>

        <div className={styles.divider}>
          <span>OR</span>
        </div>

        <div className={styles.socialLogins}>
          <button 
            type="button" 
            className={styles.socialButton}
            onClick={() => handleSocialLogin('Google')}
          >
            <GoogleIcon /> Google
          </button>
          <button 
            type="button" 
            className={styles.socialButton}
            onClick={() => handleSocialLogin('GitHub')}
          >
            <GitHubIcon /> GitHub
          </button>
        </div>
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
            <p>Access everything in just a few clicks</p>
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

export default Login;