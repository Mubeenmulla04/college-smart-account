import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from '../../styles/Login.module.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { resetPassword } = useAuth();

  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setErrors({ email: 'Email is required' });
      return;
    }

    if (!validateEmail(email)) {
      setErrors({ email: 'Please enter a valid email address' });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const success = await resetPassword(email);
      
      if (success) {
        setIsSuccess(true);
      } else {
        setErrors({
          general: 'Email address not found. Please check your email and try again.'
        });
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setErrors({
        general: 'An error occurred. Please try again later.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className={styles.loginContainer}>
        <div className={styles.loginForm}>
          <div className={styles.loginCard}>
            <div className={styles.loginHeader}>
              <div className={styles.loginLogo}>
                <span className={styles.loginLogoIcon}>✅</span>
              </div>
              <h2 className={styles.loginTitle}>
                Check Your Email
              </h2>
              <p className={styles.loginSubtitle}>
                We've sent password reset instructions to {email}
              </p>
            </div>

            <div className={styles.successMessage}>
              <p>
                If you don't see the email in your inbox, please check your spam folder.
              </p>
              <p>
                The reset link will expire in 24 hours for security reasons.
              </p>
            </div>

            <div className={styles.backToLogin}>
              <Link to="/login" className={styles.backLink}>
                ← Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginForm}>
        <div className={styles.loginCard}>
          <div className={styles.loginHeader}>
            <div className={styles.loginLogo}>
              <span className={styles.loginLogoIcon}>🔑</span>
            </div>
            <h2 className={styles.loginTitle}>
              Reset Your Password
            </h2>
            <p className={styles.loginSubtitle}>
              Enter your email address and we'll send you instructions to reset your password.
            </p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.inputGroup}>
              <input
                type="email"
                name="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`${styles.emailInput} ${errors.email ? styles.inputError : ''}`}
                placeholder="Enter your email address"
              />
            </div>

            {errors.email && (
              <p className={styles.errorMessage}>{errors.email}</p>
            )}
            
            {errors.general && (
              <p className={styles.generalError}>{errors.general}</p>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={styles.submitButton}
              >
                {isLoading ? 'Sending...' : 'Send Reset Instructions'}
              </button>
            </div>

            <div className={styles.backToLogin}>
              <Link to="/login" className={styles.backLink}>
                ← Back to Login
              </Link>
            </div>

            {/* <div className={styles.demoCredentials}>
              <p className={styles.demoTitle}>
                Available demo accounts:
              </p>
              <p className={styles.demoText}>
                john.doe@student.edu
              </p>
              <p className={styles.demoText}>
                jane.smith@student.edu
              </p>
              <p className={styles.demoText}>
                mike.wilson@student.edu
              </p>
              <p className={styles.demoText}>
                admin@college.edu
              </p>
            </div> */}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;