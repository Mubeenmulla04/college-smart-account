import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateEmail, validateName, validatePhone, validateStudentId, validateAmount } from '../../utils/validate';
import { studentsAPI } from '../../services';
import { Input, Button } from '../../components/auth';
import { 
  User, Mail, Phone, Building2, CalendarDays, 
  MapPin, IndianRupee, Hash, ArrowLeft, 
  PlusCircle, GraduationCap, Info
} from 'lucide-react';
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
    'Computer Science Engineering',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Biomedical Engineering',
    'Electronics & Telecomm. Engg.',
    'Information Technology',
    'MCA',
    'MTech Civil Engg. (WRE)',
    'Diploma in Mechanical Engineering',
    'Diploma in Electrical Engineering'
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
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.studentId.trim()) {
      newErrors.studentId = 'PRN number is required';
    }

    if (!validateName(formData.name)) {
      newErrors.name = 'Please enter a valid full name';
    }

    if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    if (!formData.department) {
      newErrors.department = 'Please select a department';
    }

    if (!formData.year) {
      newErrors.year = 'Please select the current year';
    }

    if (!validateAmount(formData.totalFees)) {
      newErrors.totalFees = 'Please enter a valid fee amount';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Please enter the student\'s address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const newStudent = {
        studentId: formData.studentId.trim(),
        rollNumber: formData.studentId.trim(),
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        department: formData.department,
        year: parseInt(formData.year),
        address: formData.address.trim(),
        password: 'password123',
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

      const response = await studentsAPI.create(newStudent);
      
      if (response.status === 201) {
        setSuccessMessage('Student registered successfully! Redirecting...');
        setTimeout(() => navigate('/admin/students'), 2000);
      }
    } catch (error) {
      console.error('Error adding student:', error);
      setErrors({ 
        general: error.response?.data?.error || 'Failed to register student. PRN or Email might already exist.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.addStudentContainer}>
      <div className={styles.addStudentContent}>
        
        {/* Back Navigation */}
        <button onClick={() => navigate(-1)} className={styles.backLink}>
          <ArrowLeft size={16} /> Back
        </button>

        {/* Header Section */}
        <div className={styles.addStudentHeader}>
          <div className={styles.headerInfo}>
            <div className={styles.headerIconContainer}>
              <PlusCircle size={28} className={styles.iconGradient} />
            </div>
            <div>
              <h1 className={styles.addStudentTitle}>Add New Student</h1>
              <p className={styles.addStudentSubtitle}>Register a student and initialize their account</p>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className={styles.formContainer}>
          {successMessage && <div className={styles.successBanner}>{successMessage}</div>}
          {errors.general && <div className={styles.errorBanner}>{errors.general}</div>}

          <form onSubmit={handleSubmit} className={styles.form}>
            
            <div className={styles.sectionHeader}>
              <User size={18} />
              <h3>Personal Information</h3>
            </div>
            
            <div className={styles.formGrid}>
              <Input 
                label="Full Name" name="name" value={formData.name}
                icon={User} onChange={handleChange}
                placeholder="Enter student's full name" error={errors.name}
              />
              <Input 
                label="Email Address" name="email" type="email" value={formData.email}
                icon={Mail} onChange={handleChange}
                placeholder="student@college.edu" error={errors.email}
              />
              <Input 
                label="Phone Number" name="phone" type="tel" value={formData.phone}
                icon={Phone} onChange={handleChange}
                placeholder="10-digit mobile number" error={errors.phone}
              />
              <Input 
                label="PRN (Student ID)" name="studentId" value={formData.studentId}
                icon={Hash} onChange={handleChange}
                placeholder="Enter PRN number" error={errors.studentId}
              />
            </div>

            <div className={styles.sectionHeader}>
              <GraduationCap size={18} />
              <h3>Academic & Fee Details</h3>
            </div>

            <div className={styles.formGrid}>
              <Input 
                label="Department" name="department" type="select" value={formData.department}
                icon={Building2} onChange={handleChange}
                options={departments} placeholder="Select Department" error={errors.department}
              />
              <Input 
                label="Current Year" name="year" type="select" value={formData.year}
                icon={CalendarDays} onChange={handleChange}
                options={[
                  { label: '1st Year', value: '1' },
                  { label: '2nd Year', value: '2' },
                  { label: '3rd Year', value: '3' },
                  { label: '4th Year', value: '4' }
                ]}
                placeholder="Select Year" error={errors.year}
              />
              <Input 
                label="Total Fees (₹)" name="totalFees" type="number" value={formData.totalFees}
                icon={IndianRupee} onChange={handleChange}
                placeholder="e.g. 75000" error={errors.totalFees}
              />
              <Input 
                label="Permanent Address" name="address" type="textarea" value={formData.address}
                icon={MapPin} onChange={handleChange}
                placeholder="Full residential address" error={errors.address}
                rows={2}
              />
            </div>

            <div className={styles.infoNote}>
              <Info size={16} />
              <p>New students are assigned <b>"password123"</b> as their default password.</p>
            </div>

            <div className={styles.formActions}>
              <Button 
                type="button" variant="secondary" 
                onClick={() => navigate('/admin/students')}
              >
                Cancel
              </Button>
              <Button 
                type="submit" variant="primary" 
                loading={isLoading} loadingText="Registering..."
              >
                Register Student
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddStudent;