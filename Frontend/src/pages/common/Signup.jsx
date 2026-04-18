import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { validateEmail, validateName, validatePhone, validateStudentId, validateAmount } from '../../utils/validate';
import { studentsAPI } from '../../services';
import styles from '../../styles/Signup.module.css';

const Signup = () => {
  const [formData, setFormData] = useState({
    studentId: '',
    name: '',
    email: '',
    phone: '',
    department: '',
    year: '',
    totalFees: '',
    address: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const navigate = useNavigate();

  const departments = [
    'Computer Science',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Chemical Engineering',
    'Information Technology',
    'Business Administration',
    'Arts and Humanities'
  ];

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
    // Clear success message when form changes
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!validateStudentId(formData.studentId)) {
      newErrors.studentId = 'Student ID must be 6-10 alphanumeric characters';
    }

    if (!validateName(formData.name)) {
      newErrors.name = 'Name must be 2-50 characters with only letters and spaces';
    }

    if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.department) {
      newErrors.department = 'Please select a department';
    }

    if (!formData.year || formData.year < 1 || formData.year > 4) {
      newErrors.year = 'Please select a valid year (1-4)';
    }

    if (!validateAmount(formData.totalFees)) {
      newErrors.totalFees = 'Please enter a valid amount';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Please enter an address';
    }

    if (!formData.password || formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Prepare student data
      const newStudent = {
        id: formData.studentId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        department: formData.department,
        year: parseInt(formData.year),
        address: formData.address,
        password: formData.password, // Store password for demo purposes
        fees: {
          total: parseFloat(formData.totalFees),
          paid: 0,
          pending: parseFloat(formData.totalFees),
          lastPayment: null,
          paymentHistory: []
        },
        scholarship: {
          eligible: true,
          applied: false,
          status: 'Not Applied',
          amount: 0,
          applicationDate: null,
          documents: []
        }
      };

      // Send to API to store in database
      const response = await studentsAPI.create(newStudent);
      
      if (response && response.data && response.data.id) {
        setSuccessMessage('Registration successful! You can now login with your email and password.');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        throw new Error('Failed to register student');
      }
    } catch (error) {
      console.error('Error registering student:', error);
      // Check if it's a conflict error (duplicate email)
      if (error.response && error.response.status === 409) {
        setErrors({ 
          general: error.response.data.error || 'A student with this email already exists.' 
        });
      } else {
        setErrors({ 
          general: 'Failed to register. Please check your connection and try again.' 
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.signupContainer}>
      <div className={styles.signupForm}>
        <div className={styles.signupCard}>
          <div className={styles.signupHeader}>
            <div className={styles.signupLogo}>
              <span className={styles.signupLogoIcon}>🎓</span>
            </div>
            <h2 className={styles.signupTitle}>
              Student Registration
            </h2>
            <p className={styles.signupSubtitle}>
              Already have an account?{' '}
              <Link to="/login" className={styles.signupLoginLink}>
                Sign in here
              </Link>
            </p>
          </div>
        
          <form className={styles.signupFormContent} onSubmit={handleSubmit}>
            {successMessage && (
              <div className={styles.signupSuccessMessage}>
                {successMessage}
              </div>
            )}

            {errors.general && (
              <div className={styles.signupGeneralError}>{errors.general}</div>
            )}

            <div className={styles.signupFormSection}>
              <h3 className={styles.signupSectionTitle}>Personal Information</h3>
              <div className={styles.signupFormGrid}>
                <div className={styles.signupFormGroup}>
                  <label htmlFor="studentId" className={styles.signupFormLabel}>
                    Student ID
                  </label>
                  <input
                    id="studentId"
                    name="studentId"
                    type="text"
                    required
                    value={formData.studentId}
                    onChange={handleChange}
                    className={`${styles.signupFormInput} ${errors.studentId ? styles.signupInputError : ''}`}
                    placeholder="Enter your student ID"
                  />
                  {errors.studentId && (
                    <p className={styles.signupErrorMessage}>{errors.studentId}</p>
                  )}
                </div>

                <div className={styles.signupFormGroup}>
                  <label htmlFor="name" className={styles.signupFormLabel}>
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className={`${styles.signupFormInput} ${errors.name ? styles.signupInputError : ''}`}
                    placeholder="Enter your full name"
                  />
                  {errors.name && (
                    <p className={styles.signupErrorMessage}>{errors.name}</p>
                  )}
                </div>

                <div className={styles.signupFormGroup}>
                  <label htmlFor="email" className={styles.signupFormLabel}>
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className={`${styles.signupFormInput} ${errors.email ? styles.signupInputError : ''}`}
                    placeholder="Enter your email address"
                  />
                  {errors.email && (
                    <p className={styles.signupErrorMessage}>{errors.email}</p>
                  )}
                </div>

                <div className={styles.signupFormGroup}>
                  <label htmlFor="phone" className={styles.signupFormLabel}>
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className={`${styles.signupFormInput} ${errors.phone ? styles.signupInputError : ''}`}
                    placeholder="Enter your phone number"
                  />
                  {errors.phone && (
                    <p className={styles.signupErrorMessage}>{errors.phone}</p>
                  )}
                </div>

                <div className={styles.signupFormGroup}>
                  <label htmlFor="address" className={styles.signupFormLabel}>
                    Address
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleChange}
                    className={`${styles.signupFormInput} ${errors.address ? styles.signupInputError : ''}`}
                    placeholder="Enter your complete address"
                    rows={3} 
                  />
                  {errors.address && (
                    <p className={styles.signupErrorMessage}>{errors.address}</p>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.signupFormSection}>
              <h3 className={styles.signupSectionTitle}>Academic Information</h3>
              <div className={styles.signupFormGrid}>
                <div className={styles.signupFormGroup}>
                  <label htmlFor="department" className={styles.signupFormLabel}>
                    Department
                  </label>
                  <select
                    id="department"
                    name="department"
                    required
                    value={formData.department}
                    onChange={handleChange}
                    className={`${styles.signupFormSelect} ${errors.department ? styles.signupInputError : ''}`}
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                  {errors.department && (
                    <p className={styles.signupErrorMessage}>{errors.department}</p>
                  )}
                </div>

                <div className={styles.signupFormGroup}>
                  <label htmlFor="year" className={styles.signupFormLabel}>
                    Academic Year
                  </label>
                  <select
                    id="year"
                    name="year"
                    required
                    value={formData.year}
                    onChange={handleChange}
                    className={`${styles.signupFormSelect} ${errors.year ? styles.signupInputError : ''}`}
                  >
                    <option value="">Select Year</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                  {errors.year && (
                    <p className={styles.signupErrorMessage}>{errors.year}</p>
                  )}
                </div>

                <div className={styles.signupFormGroup}>
                  <label htmlFor="totalFees" className={styles.signupFormLabel}>
                    Total Fees (₹)
                  </label>
                  <input
                    id="totalFees"
                    name="totalFees"
                    type="number"
                    required
                    value={formData.totalFees}
                    onChange={handleChange}
                    className={`${styles.signupFormInput} ${errors.totalFees ? styles.signupInputError : ''}`}
                    placeholder="Enter total fees amount"
                  />
                  {errors.totalFees && (
                    <p className={styles.signupErrorMessage}>{errors.totalFees}</p>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.signupFormSection}>
              <h3 className={styles.signupSectionTitle}>Account Security</h3>
              <div className={styles.signupFormGrid}>
                <div className={styles.signupFormGroup}>
                  <label htmlFor="password" className={styles.signupFormLabel}>
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className={`${styles.signupFormInput} ${errors.password ? styles.signupInputError : ''}`}
                    placeholder="Create a password"
                  />
                  {errors.password && (
                    <p className={styles.signupErrorMessage}>{errors.password}</p>
                  )}
                </div>

                <div className={styles.signupFormGroup}>
                  <label htmlFor="confirmPassword" className={styles.signupFormLabel}>
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`${styles.signupFormInput} ${errors.confirmPassword ? styles.signupInputError : ''}`}
                    placeholder="Confirm your password"
                  />
                  {errors.confirmPassword && (
                    <p className={styles.signupErrorMessage}>{errors.confirmPassword}</p>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.signupFormSection}>
              <button
                type="submit"
                disabled={isLoading}
                className={`${styles.signupSubmitButton} ${isLoading ? styles.signupLoading : ''}`}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;