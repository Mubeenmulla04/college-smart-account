import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateEmail, validateName, validatePhone, validateStudentId, validateAmount } from '../../utils/validate';
import { studentsAPI } from '../../services';
import styles from '../admin/AddStudent.module.css';

const AddStudent = () => {
  const [formData, setFormData] = useState({
    studentId: '',
    name: '',
    email: '',
    phone: '',
    department: '',
    year: '',
    totalFees: '',
    address: ''
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({}); // Clear previous errors

    try {
      // Check if student ID already exists
      const existingStudents = await studentsAPI.getAll();
      const studentExists = existingStudents.data.find(
        student => student.id === formData.studentId || student.email === formData.email
      );

      if (studentExists) {
        setErrors({ 
          general: 'A student with this ID or email already exists. Please use a different ID or email.' 
        });
        return;
      }

      // Prepare student data with proper structure
      const newStudent = {
        id: formData.studentId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        department: formData.department,
        year: parseInt(formData.year),
        address: formData.address,
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
      
      if (response.status === 201) {
        setSuccessMessage('Student added successfully! Redirecting to dashboard...');
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 2000);
      } else {
        throw new Error('Failed to create student');
      }
    } catch (error) {
      console.error('Error adding student:', error);
      setErrors({ 
        general: 'Failed to add student. Please check your connection and try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.addStudentContainer}>
      <div className={styles.addStudentContent}>
        <div className={styles.addStudentHeader}>
          <div>
            <h1 className={styles.addStudentTitle}>Add New Student</h1>
            <p className={styles.addStudentSubtitle}>Register a new student in the system</p>
          </div>
          <button
            onClick={() => navigate('/admin/dashboard')}
            className={styles.backButton}
          >
            Back to Dashboard
          </button>
        </div>

        <div className={styles.formContainer}>
          <div className={styles.formContent}>
            {successMessage && (
              <div className={styles.successMessage}>
                {successMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label htmlFor="studentId" className={styles.formLabel}>
                    Student ID *
                  </label>
                  <input
                    type="text"
                    id="studentId"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleChange}
                    className={`${styles.formInput} ${errors.studentId ? styles.formInputError : ''}`}
                    placeholder="Enter student ID"
                  />
                  {errors.studentId && (
                    <p className={styles.errorMessage}>{errors.studentId}</p>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="name" className={styles.formLabel}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`${styles.formInput} ${errors.name ? styles.formInputError : ''}`}
                    placeholder="Enter full name"
                  />
                  {errors.name && (
                    <p className={styles.errorMessage}>{errors.name}</p>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="email" className={styles.formLabel}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`${styles.formInput} ${errors.email ? styles.formInputError : ''}`}
                    placeholder="Enter email address"
                  />
                  {errors.email && (
                    <p className={styles.errorMessage}>{errors.email}</p>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="phone" className={styles.formLabel}>
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`${styles.formInput} ${errors.phone ? styles.formInputError : ''}`}
                    placeholder="Enter phone number"
                  />
                  {errors.phone && (
                    <p className={styles.errorMessage}>{errors.phone}</p>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="department" className={styles.formLabel}>
                    Department *
                  </label>
                  <select
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className={`${styles.formSelect} ${errors.department ? styles.formInputError : ''}`}
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                  {errors.department && (
                    <p className={styles.errorMessage}>{errors.department}</p>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="year" className={styles.formLabel}>
                    Year *
                  </label>
                  <select
                    id="year"
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    className={`${styles.formSelect} ${errors.year ? styles.formInputError : ''}`}
                  >
                    <option value="">Select Year</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                  {errors.year && (
                    <p className={styles.errorMessage}>{errors.year}</p>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="totalFees" className={styles.formLabel}>
                    Total Fees (₹) *
                  </label>
                  <input
                    type="number"
                    id="totalFees"
                    name="totalFees"
                    value={formData.totalFees}
                    onChange={handleChange}
                    className={`${styles.formInput} ${errors.totalFees ? styles.formInputError : ''}`}
                    placeholder="Enter total fees"
                  />
                  {errors.totalFees && (
                    <p className={styles.errorMessage}>{errors.totalFees}</p>
                  )}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="address" className={styles.formLabel}>
                  Address *
                </label>
                <textarea
                  id="address"
                  name="address"
                  rows={3}
                  value={formData.address}
                  onChange={handleChange}
                  className={`${styles.formTextarea} ${errors.address ? styles.formInputError : ''}`}
                  placeholder="Enter complete address"
                />
                {errors.address && (
                  <p className={styles.errorMessage}>{errors.address}</p>
                )}
              </div>

              {errors.general && (
                <p className={styles.generalError}>{errors.general}</p>
              )}

              <div className={styles.formActions}>
                <button
                  type="button"
                  onClick={() => navigate('/admin/dashboard')}
                  className={styles.cancelButton}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={styles.submitButton}
                >
                  {isLoading ? 'Adding Student...' : 'Add Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddStudent;