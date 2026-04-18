import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from '../../styles/Login.module.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'student'
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
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
    setErrors({});

    try {
      const success = await login(formData.email, formData.password, formData.role);
      
      if (success) {
        // Navigation will be handled by the auth context
        navigate(formData.role === 'admin' ? '/admin/dashboard' : '/student/dashboard');
      } else {
        setErrors({
          general: 'Invalid email or password. Please check your credentials and try again.'
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({
        general: 'An error occurred during login. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginForm}>
        <div className={styles.loginCard}>
          <div className={styles.loginHeader}>
            <div className={styles.loginLogo}>
              <span className={styles.loginLogoIcon}>🎓</span>
            </div>
            <h2 className={styles.loginTitle}>
              Sign in to your account
            </h2>
            <p className={styles.loginSubtitle}>
              Or{' '}
              <Link to="/signup" className={styles.signupLink}>
                create a new account
              </Link>
            </p>
          </div>
        
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className={styles.roleSelect}
              required
            >
              <option value="student">Student</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className={styles.inputGroup}>
            <input
              type="email"
              name="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              className={`${styles.emailInput} ${errors.email ? styles.inputError : ''}`}
              placeholder="Email address"
            />
          </div>

          <div className={styles.inputGroup}>
            <div className={styles.passwordContainer}>
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className={`${styles.passwordInput} ${errors.password ? styles.inputError : ''}`}
                placeholder="Password"
              />
            </div>
          </div>

          {errors.email && (
            <p className={styles.errorMessage}>{errors.email}</p>
          )}
          
          {errors.password && (
            <p className={styles.errorMessage}>{errors.password}</p>
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
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <Link to="/forgot-password" className={styles.forgotPasswordLink}>
            Forgot your password?
          </Link>

          {/* <div className={styles.demoCredentials}>
            <p className={styles.demoTitle}>
              Demo Login Credentials:
            </p>
            <p className={styles.demoText}>
              <strong>Admin:</strong> admin@college.edu / Password123 (Select "Admin" role)
            </p>
            <p className={styles.demoText}>
              <strong>Student 1:</strong> john.doe@student.edu / Password123 (Select "Student" role)
            </p>
            <p className={styles.demoText}>
              <strong>Student 2:</strong> jane.smith@student.edu / Student123 (Select "Student" role)
            </p>
            <p className={styles.demoText}>
              <strong>Student 3:</strong> mike.wilson@student.edu / Student456 (Select "Student" role)
            </p>
          </div> */}
        </form>
        </div>
      </div>
    </div>
  );
};

export default Login;