import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateEmail, validateName, validatePhone, validateAmount } from '../../utils/validate';
import { studentsAPI } from '../../services';
import { 
  User, Mail, Phone, Building2, CalendarDays, 
  MapPin, IndianRupee, Hash, ArrowLeft, 
  PlusCircle, GraduationCap, Info, AlertCircle, CheckCircle2
} from 'lucide-react';

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
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.studentId.trim()) newErrors.studentId = 'PRN number is required';
    if (!validateName(formData.name)) newErrors.name = 'Please enter a valid full name';
    if (!validateEmail(formData.email)) newErrors.email = 'Please enter a valid email address';
    if (!validatePhone(formData.phone)) newErrors.phone = 'Please enter a valid 10-digit phone number';
    if (!formData.department) newErrors.department = 'Please select a department';
    if (!formData.year) newErrors.year = 'Please select the current year';
    if (!validateAmount(formData.totalFees)) newErrors.totalFees = 'Please enter a valid fee amount';
    if (!formData.address.trim()) newErrors.address = 'Please enter the student\'s address';

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

  const InputField = ({ label, name, type="text", icon: Icon, error, ...props }) => (
    <div className={`${props.full ? 'col-span-1 md:col-span-2' : ''}`}>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
          <Icon size={18} />
        </div>
        {type === 'select' ? (
          <select
            name={name}
            className={`w-full pl-10 pr-4 py-3 rounded-xl border appearance-none ${error ? 'border-red-300 focus:ring-red-100 bg-red-50/50' : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-100 bg-gray-50/50'} focus:bg-white outline-none focus:ring-4 transition-all duration-200 text-gray-900`}
            {...props}
          >
            <option value="" disabled hidden>{props.placeholder}</option>
            {props.options && props.options.map(o => {
              const val = typeof o === 'string' ? o : o.value;
              const lbl = typeof o === 'string' ? o : o.label;
              return <option key={val} value={val}>{lbl}</option>;
            })}
          </select>
        ) : type === 'textarea' ? (
          <textarea
            name={name}
            className={`w-full pl-10 pr-4 py-3 rounded-xl border ${error ? 'border-red-300 focus:ring-red-100 bg-red-50/50' : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-100 bg-gray-50/50'} focus:bg-white outline-none focus:ring-4 transition-all duration-200 text-gray-900 resize-none`}
            {...props}
          />
        ) : (
          <input
            type={type}
            name={name}
            className={`w-full pl-10 pr-4 py-3 rounded-xl border ${error ? 'border-red-300 focus:ring-red-100 bg-red-50/50' : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-100 bg-gray-50/50'} focus:bg-white outline-none focus:ring-4 transition-all duration-200 text-gray-900`}
            {...props}
          />
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
    <div className="w-full py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors mb-6">
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/40 border border-gray-100 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-full blur-3xl -mr-48 -mt-48 opacity-70 pointer-events-none"></div>
          
          <div className="px-8 sm:px-12 pt-12 pb-8 relative z-10 border-b border-gray-100">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-indigo-200 transform -rotate-3">
                <PlusCircle size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Add New Student</h1>
                <p className="text-gray-500 mt-1">Register a new student and initialize their account profile.</p>
              </div>
            </div>
          </div>

          <div className="p-8 sm:p-12 relative z-10 bg-gray-50/30">
            {successMessage && (
              <div className="mb-8 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 animate-in fade-in">
                <CheckCircle2 size={24} className="text-emerald-600" />
                <p className="font-medium">{successMessage}</p>
              </div>
            )}
            
            {errors.general && (
              <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-800 animate-in fade-in">
                <AlertCircle size={24} className="text-red-600" />
                <p className="font-medium">{errors.general}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-10">
              
              {/* Personal Information */}
              <div>
                <div className="flex items-center gap-2 mb-6 border-b border-gray-200 pb-2">
                  <User size={20} className="text-indigo-600" />
                  <h3 className="text-lg font-bold text-gray-900">Personal Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField label="Full Name" name="name" value={formData.name} onChange={handleChange} icon={User} placeholder="Enter student's full name" error={errors.name} />
                  <InputField label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} icon={Mail} placeholder="student@college.edu" error={errors.email} />
                  <InputField label="Phone Number" name="phone" type="tel" value={formData.phone} onChange={handleChange} icon={Phone} placeholder="10-digit mobile number" error={errors.phone} />
                  <InputField label="PRN (Student ID)" name="studentId" value={formData.studentId} onChange={handleChange} icon={Hash} placeholder="Enter PRN number" error={errors.studentId} />
                </div>
              </div>

              {/* Academic & Fee Details */}
              <div>
                <div className="flex items-center gap-2 mb-6 border-b border-gray-200 pb-2">
                  <GraduationCap size={20} className="text-indigo-600" />
                  <h3 className="text-lg font-bold text-gray-900">Academic & Fee Details</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField full label="Department" name="department" type="select" options={departments} value={formData.department} onChange={handleChange} icon={Building2} placeholder="Select Department" error={errors.department} />
                  <InputField label="Current Year" name="year" type="select" options={[{label: '1st Year', value: '1'}, {label: '2nd Year', value: '2'}, {label: '3rd Year', value: '3'}, {label: '4th Year', value: '4'}]} value={formData.year} onChange={handleChange} icon={CalendarDays} placeholder="Select Year" error={errors.year} />
                  <InputField label="Total Fees (₹)" name="totalFees" type="number" value={formData.totalFees} onChange={handleChange} icon={IndianRupee} placeholder="e.g. 75000" error={errors.totalFees} />
                  <InputField full label="Permanent Address" name="address" type="textarea" rows="2" value={formData.address} onChange={handleChange} icon={MapPin} placeholder="Full residential address" error={errors.address} />
                </div>
              </div>

              <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-start gap-3 text-indigo-800 text-sm">
                <Info size={20} className="text-indigo-600 mt-0.5" />
                <p>New students are automatically assigned <strong className="font-mono bg-indigo-100 px-1.5 py-0.5 rounded text-indigo-900">password123</strong> as their default password. They will be prompted to change it upon their first login.</p>
              </div>

              <div className="pt-6 border-t border-gray-100 flex items-center justify-end gap-4">
                <button type="button" onClick={() => navigate('/admin/students')} className="px-6 py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isLoading} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-indigo-200 flex items-center gap-2 disabled:opacity-70">
                  {isLoading ? 'Registering...' : <>Register Student</>}
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