import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, User, ArrowRight, MailOpen, Shield, Zap, Headphones, Sparkles, AlertCircle, Eye, EyeOff } from 'lucide-react';

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" fill="#0f172a" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
  </svg>
);

const AnimatedBackground = () => (
  <>
    <style>
      {`
        @keyframes drift1 {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(3vw, -3vh) scale(1.05); }
          66% { transform: translate(-1vw, 2vh) scale(0.95); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes drift2 {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(-3vw, 3vh) scale(1.05); }
          66% { transform: translate(2vw, -2vh) scale(0.95); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes drift3 {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(2vw, 2vh) scale(0.95); }
          66% { transform: translate(-2vw, -2vh) scale(1.05); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        
        .animate-drift1 { animation: drift1 20s infinite ease-in-out alternate; }
        .animate-drift2 { animation: drift2 25s infinite ease-in-out alternate; }
        .animate-drift3 { animation: drift3 30s infinite ease-in-out alternate; }
        
        .soft-noise {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          opacity: 0.025;
          mix-blend-mode: multiply;
          pointer-events: none;
        }
      `}
    </style>
    
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-[#f8fafc]">
      {/* Very soft, large pastel blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] max-w-[800px] max-h-[800px] rounded-full bg-blue-100/50 mix-blend-multiply filter blur-[120px] animate-drift1"></div>
      
      <div className="absolute top-[20%] right-[-10%] w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] rounded-full bg-indigo-50/50 mix-blend-multiply filter blur-[140px] animate-drift2"></div>
      
      <div className="absolute bottom-[-20%] left-[20%] w-[80vw] h-[80vw] max-w-[900px] max-h-[900px] rounded-full bg-violet-100/40 mix-blend-multiply filter blur-[120px] animate-drift3"></div>

      <div className="absolute top-[40%] left-[30%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full bg-slate-200/40 mix-blend-multiply filter blur-[100px] animate-drift1" style={{animationDelay: '5s'}}></div>
      
      {/* Extremely subtle noise for premium feel without being distracting */}
      <div className="absolute inset-0 z-10 soft-noise"></div>
    </div>
  </>
);

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [otpData, setOtpData] = useState({ email: '', role: '', devOtp: null });
  const [step, setStep] = useState('credentials');
  const [showPassword, setShowPassword] = useState(false);
  
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
        setApiError(result.message || 'Invalid email or password.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setApiError('An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
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
    if (code.length < 4) {
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

  if (step === 'otp') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 selection:bg-blue-100 relative overflow-hidden">
        <AnimatedBackground />
        <div className="max-w-md w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-8 sm:p-10 animate-in fade-in zoom-in-95 duration-300 relative z-10">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 transform -rotate-6">
            <MailOpen size={32} strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Check your email</h2>
          <p className="text-center text-gray-500 mb-8">
            We sent a verification code to <strong className="text-gray-900">{otpData.email}</strong>
          </p>

          {otpData.devOtp && (
            <div className="mb-6 p-3 bg-amber-50 text-amber-800 text-sm rounded-xl border border-amber-200 text-center flex items-center justify-center gap-2">
              <Zap size={16} /> Dev mode · OTP: <b className="font-mono text-base">{otpData.devOtp}</b>
            </div>
          )}
          
          {success && (
            <div className="mb-6 p-3 bg-emerald-50 text-emerald-700 text-sm rounded-xl border border-emerald-200 text-center flex items-center justify-center gap-2">
              <Sparkles size={16} /> {success}
            </div>
          )}

          <div className="flex gap-2 sm:gap-3 justify-center mb-6" onPaste={handleOtpPaste}>
            {otp.map((d, i) => (
              <input
                key={i}
                ref={el => otpRefs.current[i] = el}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
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
            disabled={isLoading}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all duration-200 shadow-lg shadow-blue-200 flex justify-center items-center gap-2 disabled:opacity-70"
          >
            {isLoading ? 'Verifying...' : (
              <>Verify & Continue <ArrowRight size={18} /></>
            )}
          </button>

          <button
            onClick={() => { setStep('credentials'); setOtp(['','','','','','']); }}
            className="w-full mt-6 text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium"
          >
            ← Back to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex items-center justify-center p-4 overflow-hidden relative">
      <AnimatedBackground />
      <div className="max-w-[440px] w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl overflow-hidden border border-white/50 h-auto max-h-[min(800px,95vh)] relative z-10">
        
        {/* Login Form */}
        <div className="w-full p-8 sm:p-10 flex flex-col justify-center relative bg-transparent overflow-y-auto">
          <div className="max-w-md w-full mx-auto">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome Back</h2>
              <p className="text-sm text-gray-500">Please enter your details to sign in.</p>
            </div>

            {apiError && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs sm:text-sm rounded-xl border border-red-100 flex gap-2 items-start animate-in fade-in">
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                <p>{apiError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border ${errors.email ? 'border-red-300 focus:ring-red-100' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'} bg-gray-50/50 focus:bg-white outline-none focus:ring-4 transition-all duration-200 text-gray-900`}
                    placeholder="name@example.com"
                  />
                </div>
                {errors.email && <p className="mt-1.5 text-sm text-red-500">{errors.email}</p>}
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-medium text-gray-700">Password</label>
                  <Link to="/forgot-password" className="text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-12 py-3 rounded-xl border ${errors.password ? 'border-red-300 focus:ring-red-100' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'} bg-gray-50/50 focus:bg-white outline-none focus:ring-4 transition-all duration-200 text-gray-900`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <p className="mt-1.5 text-sm text-red-500">{errors.password}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl transition-all duration-200 flex justify-center items-center gap-2 mt-4 disabled:opacity-70 shadow-md"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 mb-4 flex items-center justify-center">
              <div className="w-full h-px bg-gray-200"></div>
              <div className="px-3 text-xs text-gray-400 font-medium">OR</div>
              <div className="w-full h-px bg-gray-200"></div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleSocialLogin('Google')}
                className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium text-gray-700 text-sm"
              >
                <GoogleIcon /> Google
              </button>
              <button
                onClick={() => handleSocialLogin('GitHub')}
                className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium text-gray-700 text-sm"
              >
                <GitHubIcon /> GitHub
              </button>
            </div>

            <p className="mt-6 text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/signup" className="text-gray-900 font-semibold hover:text-gray-700 transition-colors">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Login;