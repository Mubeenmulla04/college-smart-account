import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dashboardAPI, scholarshipsAPI } from '../../services';
import { 
  GraduationCap, AlertCircle, CheckCircle2, ShieldCheck, Clock, FileText, 
  IndianRupee, Percent, UploadCloud, Info, Banknote, Bookmark
} from 'lucide-react';

const Scholarship = () => {
  const { user } = useAuth();
  const [studentData, setStudentData] = useState(null);
  const [formData, setFormData] = useState({
    familyIncome: '',
    academicPerformance: '',
    reason: '',
    documents: [],
    mahadbtId: '',
    schemeName: '',
    mahadbtStatus: 'Applied',
    casteCategory: '',
    isMinority: false,
    previousYearMarks: '',
    bankDetails: {
      accountNumber: '',
      ifscCode: '',
      bankName: ''
    },
    documentUrls: {
      aadharCard: '',
      incomeCertificate: '',
      casteCertificate: '',
      previousMarksheet: '',
      rationCard: ''
    }
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loadingStudent, setLoadingStudent] = useState(true);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoadingStudent(true);
        const data = await dashboardAPI.getStudentStats(user?.email);
        
        if (data) {
          let hasFormalApp = false;
          try {
            const appsRes = await scholarshipsAPI.getMyApplications();
            const apps = appsRes.data || appsRes;
            
            if (Array.isArray(apps) && apps.length > 0) {
              const latestApp = apps[0];
              hasFormalApp = true;
              
              if (latestApp.scholarshipId) {
                data.scholarship.amount = latestApp.estimatedAmount || latestApp.scholarshipId.amount;
                data.scholarship.status = latestApp.status;
                data.scholarship.mahadbtId = latestApp.mahadbtId;
                data.scholarship.mahadbtStatus = latestApp.mahadbtStatus;
              }
            }
          } catch (appError) {
            console.error('Error fetching scholarship applications:', appError);
          }

          setStudentData(data);
          setIsSubmitted(data.scholarship.applied && hasFormalApp);
        }
      } catch (error) {
        console.error('Error fetching student data:', error);
      } finally {
        setLoadingStudent(false);
      }
    };

    if (user?.email) {
      fetchStudentData();
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const fileList = Array.from(files);
    
    if (name.startsWith('doc_')) {
      const field = name.replace('doc_', '');
      setFormData(prev => ({
        ...prev,
        documentUrls: {
          ...prev.documentUrls,
          [field]: fileList[0]?.name || ''
        },
        documents: [...prev.documents, ...fileList]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        documents: [...prev.documents, ...fileList]
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.familyIncome || parseFloat(formData.familyIncome) <= 0) newErrors.familyIncome = 'Valid family income is required';
    if (!formData.academicPerformance || parseFloat(formData.academicPerformance) < 0 || parseFloat(formData.academicPerformance) > 100) newErrors.academicPerformance = 'Valid percentage required';
    if (!formData.mahadbtId.trim()) newErrors.mahadbtId = 'MahaDBT Application ID is required';
    if (!formData.schemeName) newErrors.schemeName = 'Scheme selection is required';
    if (!formData.casteCategory) newErrors.casteCategory = 'Caste category is required';
    if (!formData.previousYearMarks || parseFloat(formData.previousYearMarks) < 0) newErrors.previousYearMarks = 'Previous year marks are required';
    if (!formData.bankDetails.accountNumber) newErrors.accountNumber = 'Account number is required';
    if (formData.documents.length < 3) newErrors.documents = 'Please upload at least 3 mandatory documents';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const scholarshipsRes = await scholarshipsAPI.getAll();
      const scholarships = scholarshipsRes.data || scholarshipsRes;
      const activeScholarship = scholarships.find(s => s.status === 'Active') || scholarships[0];

      if (!activeScholarship) {
        throw new Error('No active scholarships found. Please contact administration.');
      }

      const applicationData = {
        scholarshipId: activeScholarship._id || activeScholarship.id,
        ...formData,
        familyIncome: parseFloat(formData.familyIncome),
        academicPerformance: parseFloat(formData.academicPerformance),
        previousYearMarks: parseFloat(formData.previousYearMarks),
        documents: formData.documents.map(file => file.name)
      };

      await scholarshipsAPI.apply(applicationData);
      
      const updatedScholarshipStatus = {
        ...studentData.scholarship,
        applied: true,
        status: 'Under Review',
        mahadbtId: formData.mahadbtId,
        schemeName: formData.schemeName,
        mahadbtStatus: formData.mahadbtStatus,
        applicationDate: new Date().toISOString().split('T')[0]
      };

      setStudentData(prev => ({
        ...prev,
        scholarship: updatedScholarshipStatus
      }));
      
      setIsSubmitted(true);
      window.scrollTo(0, 0);
    } catch (error) {
      console.error('Error submitting application:', error);
      setErrors({ 
        general: error.response?.data?.message || error.message || 'Failed to submit application.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingStudent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-16">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-500 font-medium">Loading scholarship profile...</p>
        </div>
      </div>
    );
  }

  if (!studentData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-16">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
          <AlertCircle size={48} className="text-red-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Data Unavailable</h2>
          <p className="text-gray-500">We couldn't load your profile. Please try again.</p>
        </div>
      </div>
    );
  }

  const InputField = ({ label, name, type="text", error, icon: Icon, ...props }) => (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            <Icon size={18} />
          </div>
        )}
        {type === 'select' ? (
          <select
            name={name}
            className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-10 py-3 rounded-xl border appearance-none ${error ? 'border-red-300 focus:ring-red-100 bg-red-50/50' : 'border-gray-200 focus:border-purple-500 focus:ring-purple-100 bg-gray-50/50'} focus:bg-white outline-none focus:ring-4 transition-all duration-200 text-gray-900`}
            {...props}
          >
            <option value="" disabled hidden>{props.placeholder}</option>
            {props.options.map(o => (
              <option key={o.value || o} value={o.value || o}>{o.label || o}</option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            name={name}
            className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3 rounded-xl border ${error ? 'border-red-300 focus:ring-red-100 bg-red-50/50' : 'border-gray-200 focus:border-purple-500 focus:ring-purple-100 bg-gray-50/50'} focus:bg-white outline-none focus:ring-4 transition-all duration-200 text-gray-900`}
            {...props}
          />
        )}
      </div>
      {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
    </div>
  );

  return (
    <div className="w-full py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex items-center gap-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-50 to-pink-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-70 pointer-events-none"></div>
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-200 transform -rotate-3 z-10 flex-shrink-0">
            <GraduationCap size={32} />
          </div>
          <div className="z-10">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Scholarships</h1>
            <p className="text-gray-500 mt-1">Unlock financial aid opportunities and track your application status.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Sidebar: Status & Criteria */}
          <aside className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2"><Clock size={20} className="text-purple-600"/> Application Status</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-gray-600 font-medium">Eligibility</span>
                  <span className={`px-3 py-1 text-xs font-bold rounded-lg ${studentData.scholarship.eligible ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                    {studentData.scholarship.eligible ? 'Eligible' : 'Not Eligible'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-gray-600 font-medium">Status</span>
                  <span className={`px-3 py-1 text-xs font-bold rounded-lg ${
                    (studentData.scholarship.status === 'Under Review' || studentData.scholarship.status === 'Pending') ? 'bg-amber-100 text-amber-700' :
                    studentData.scholarship.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                    studentData.scholarship.status === 'Not Applied' ? 'bg-gray-200 text-gray-700' : 'bg-rose-100 text-rose-700'
                  }`}>
                    {studentData.scholarship.status === 'Pending' ? 'Under Review' : studentData.scholarship.status}
                  </span>
                </div>

                {studentData.scholarship.status === 'Approved' && studentData.scholarship.amount > 0 && (
                  <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100 text-center">
                    <p className="text-sm font-bold text-emerald-800 mb-1">Awarded Amount</p>
                    <p className="text-3xl font-black text-emerald-600">₹{studentData.scholarship.amount.toLocaleString()}</p>
                  </div>
                )}

                {studentData.scholarship.mahadbtId && (
                  <div className="flex items-center justify-between p-3.5 bg-indigo-50 rounded-xl border border-indigo-100">
                    <span className="text-indigo-800 font-medium text-sm">MahaDBT ID</span>
                    <span className="text-indigo-900 font-bold font-mono text-sm">{studentData.scholarship.mahadbtId}</span>
                  </div>
                )}
                
                {(studentData.scholarship.status === 'Under Review' || studentData.scholarship.status === 'Pending') && (
                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 text-center">
                    <p className="text-xs font-bold text-amber-800 uppercase mb-1">Estimated Award</p>
                    <p className="text-2xl font-black text-amber-600">₹{(studentData.scholarship.amount || 3000).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><ShieldCheck size={20} className="text-emerald-600"/> Eligibility Criteria</h3>
              <ul className="space-y-3">
                {[
                  'Family income below ₹8,00,000 per annum',
                  'Academic performance above 75%',
                  'No pending fees',
                  'Good attendance record'
                ].map((criterion, index) => (
                  <li key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                    <CheckCircle2 size={18} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-700 leading-snug">{criterion}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Right Area: Form or Success */}
          <main className="lg:col-span-8">
            <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-gray-100 relative overflow-hidden h-full">
              
              {isSubmitted ? (
                <div className="flex flex-col items-center justify-center text-center h-full py-12 animate-in zoom-in-95 duration-500">
                  <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6 relative">
                    <div className="absolute inset-0 border-4 border-emerald-200 rounded-full animate-ping opacity-20"></div>
                    <CheckCircle2 size={48} className="text-emerald-600" />
                  </div>
                  <h2 className="text-2xl font-black text-gray-900 mb-3">Application Under Review</h2>
                  <p className="text-gray-500 max-w-md mx-auto mb-8 text-lg">Your scholarship application has been successfully submitted. Please expect a response within 2-3 weeks.</p>
                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl text-blue-800 text-sm max-w-md">
                    <Info size={20} className="inline mr-2 -mt-0.5" />
                    You will be notified via email once the status changes.
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-100">
                    <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
                      <FileText size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Application Form</h2>
                      <p className="text-sm text-gray-500">Fill in the details precisely as per your documents.</p>
                    </div>
                  </div>

                  {errors.general && (
                    <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100 flex gap-3 items-start animate-in fade-in">
                      <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
                      <p>{errors.general}</p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-10">
                    
                    {/* Section 1 */}
                    <div className="space-y-6">
                      <h4 className="text-sm font-bold text-purple-600 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-xs">1</span>
                        MahaDBT & Scheme Selection
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField label="MahaDBT Application ID" name="mahadbtId" value={formData.mahadbtId} onChange={handleChange} icon={Bookmark} placeholder="e.g. 2324MH1234567" error={errors.mahadbtId} />
                        <InputField label="Scholarship Scheme" name="schemeName" type="select" value={formData.schemeName} onChange={handleChange} error={errors.schemeName} placeholder="Select Scheme" options={[
                          {value: 'Rajarshi Chhatrapati Shahu Maharaj Fee Reimbursement', label: 'EBC (Rajarshi Shahu Maharaj)'},
                          {value: 'Post-Matric Scholarship to OBC Students', label: 'Post-Matric (OBC)'},
                          {value: 'Post-Matric Scholarship to SC Students', label: 'Post-Matric (SC)'},
                          {value: 'Post-Matric Scholarship to ST Students', label: 'Post-Matric (ST)'},
                          {value: 'Dr. Panjabrao Deshmukh Hostel Allowance', label: 'Panjabrao Deshmukh (Hostel)'},
                          {value: 'State Minority Scholarship Purshottam Das', label: 'State Minority'}
                        ]} />
                      </div>
                    </div>

                    {/* Section 2 */}
                    <div className="space-y-6">
                      <h4 className="text-sm font-bold text-purple-600 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-xs">2</span>
                        Personal & Category Details
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                        <InputField label="Caste Category" name="casteCategory" type="select" value={formData.casteCategory} onChange={handleChange} error={errors.casteCategory} placeholder="Select Category" options={['General', 'OBC', 'SC', 'ST', 'VJNT', 'EWS']} />
                        <div className="h-[52px] flex items-center bg-gray-50 border border-gray-200 rounded-xl px-4 cursor-pointer hover:bg-gray-100 transition-colors">
                          <label className="flex items-center gap-3 w-full cursor-pointer">
                            <input type="checkbox" name="isMinority" checked={formData.isMinority} onChange={handleChange} className="w-5 h-5 text-purple-600 rounded border-gray-300 focus:ring-purple-500" />
                            <span className="font-medium text-gray-700">Religious Minority?</span>
                          </label>
                        </div>
                      </div>
                      <InputField label="Annual Family Income (₹)" name="familyIncome" type="number" value={formData.familyIncome} onChange={handleChange} icon={IndianRupee} placeholder="Enter annual income" error={errors.familyIncome} />
                    </div>

                    {/* Section 3 */}
                    <div className="space-y-6">
                      <h4 className="text-sm font-bold text-purple-600 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-xs">3</span>
                        Academic Performance
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField label="Current Year Attendance (%)" name="academicPerformance" type="number" value={formData.academicPerformance} onChange={handleChange} icon={Percent} placeholder="Attendance percentage" error={errors.academicPerformance} />
                        <InputField label="Previous Year Marks (%)" name="previousYearMarks" type="number" value={formData.previousYearMarks} onChange={handleChange} icon={Percent} placeholder="Last year percentage" error={errors.previousYearMarks} />
                      </div>
                    </div>

                    {/* Section 4 */}
                    <div className="space-y-6">
                      <h4 className="text-sm font-bold text-purple-600 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-xs">4</span>
                        Bank Details
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField label="Bank Account Number" name="bankDetails.accountNumber" value={formData.bankDetails.accountNumber} onChange={handleChange} icon={Banknote} placeholder="Enter account number" error={errors.accountNumber} />
                        <InputField label="IFSC Code" name="bankDetails.ifscCode" value={formData.bankDetails.ifscCode} onChange={handleChange} placeholder="e.g. SBIN0001234" />
                      </div>
                    </div>

                    {/* Section 5 */}
                    <div className="space-y-6 bg-gray-50/50 p-6 rounded-2xl border border-gray-200">
                      <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs">5</span>
                        Document Uploads (MANDATORY)
                      </h4>
                      <p className="text-xs text-gray-500 -mt-2">Only .pdf, .jpg, .png allowed. Max 2MB per file.</p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                          {name: 'doc_aadharCard', label: 'Aadhar Card *'},
                          {name: 'doc_incomeCertificate', label: 'Income Certificate *'},
                          {name: 'doc_casteCertificate', label: 'Caste Certificate'},
                          {name: 'doc_previousMarksheet', label: 'Previous Marksheet *'}
                        ].map((doc) => (
                          <div key={doc.name} className="relative group">
                            <label className="flex flex-col items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-xl appearance-none cursor-pointer hover:border-purple-400 hover:bg-purple-50 group-focus-within:ring-4 group-focus-within:ring-purple-100">
                                <span className="flex items-center space-x-2">
                                    <UploadCloud className="w-6 h-6 text-gray-400" />
                                    <span className="font-medium text-sm text-gray-600">
                                      {formData.documentUrls[doc.name.replace('doc_','')] 
                                        ? <span className="text-purple-600 truncate max-w-[150px] inline-block">{formData.documentUrls[doc.name.replace('doc_','')]}</span> 
                                        : doc.label}
                                    </span>
                                </span>
                                <input type="file" name={doc.name} className="hidden" onChange={handleFileChange} accept=".pdf,.jpg,.png" />
                            </label>
                          </div>
                        ))}
                      </div>
                      {errors.documents && <p className="text-sm text-red-500 font-medium">{errors.documents}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Reason for Application</label>
                      <textarea name="reason" rows={3} value={formData.reason} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-purple-500 focus:ring-purple-100 outline-none focus:ring-4 transition-all resize-none text-gray-900" placeholder="Briefly explain why you are applying..."></textarea>
                    </div>

                    <div className="pt-6 border-t border-gray-100">
                      <button type="submit" disabled={isLoading} className="w-full py-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:text-gray-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-200 disabled:shadow-none">
                        {isLoading ? 'Submitting Application...' : 'Submit Application Securely'}
                      </button>
                    </div>

                  </form>
                </>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Scholarship;
