import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dashboardAPI, studentsAPI, scholarshipsAPI } from '../../services';
import scholer from './Scholarship.module.css';

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
          // Sync with the formal application data if it exists
          let hasFormalApp = false;
          try {
            const appsRes = await scholarshipsAPI.getMyApplications();
            const apps = appsRes.data || appsRes;
            
            if (Array.isArray(apps) && apps.length > 0) {
              const latestApp = apps[0];
              hasFormalApp = true;
              
              // Override profile data with the actual application/scholarship details
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

    if (!formData.familyIncome || parseFloat(formData.familyIncome) <= 0) {
      newErrors.familyIncome = 'Please enter a valid family income';
    }

    if (!formData.academicPerformance || parseFloat(formData.academicPerformance) < 0 || parseFloat(formData.academicPerformance) > 100) {
      newErrors.academicPerformance = 'Please enter a valid percentage (0-100)';
    }

    if (!formData.mahadbtId.trim()) {
      newErrors.mahadbtId = 'Please enter your MahaDBT Application ID';
    }

    if (!formData.schemeName) {
      newErrors.schemeName = 'Please select a scholarship scheme';
    }

    if (!formData.casteCategory) {
      newErrors.casteCategory = 'Caste category is required';
    }

    if (!formData.previousYearMarks || parseFloat(formData.previousYearMarks) < 0) {
      newErrors.previousYearMarks = 'Previous year marks are required';
    }

    if (!formData.bankDetails.accountNumber) {
      newErrors.accountNumber = 'Account number is required';
    }

    if (formData.documents.length < 3) {
      newErrors.documents = 'Please upload at least 3 required documents';
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
      alert('Scholarship application submitted successfully for review!');
    } catch (error) {
      console.error('Error submitting scholarship application:', error);
      setErrors({ 
        general: error.response?.data?.message || error.message || 'Failed to submit application. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingStudent) {
    return (
      <div className={scholer.scholerLoadingContainer}>
        <div className={scholer.scholerLoadingSpinner}></div>
        <p className={scholer.scholerLoadingText}>Loading student data...</p>
      </div>
    );
  }

  if (!studentData) {
    return (
      <div className={scholer.scholerErrorContainer}>
        <p className={scholer.scholerErrorText}>Student data not found.</p>
      </div>
    );
  }

  return (
    <div className={scholer.scholerMainContainer}>
      <div className={scholer.scholerContentWrapper}>
        <div className={scholer.scholerHeaderSection}>
          <h1 className={scholer.scholerHeaderTitle}>Scholarship Application</h1>
          <p className={scholer.scholerHeaderSubtitle}>Unlock financial aid opportunities</p>
        </div>

        <div className={scholer.scholerGridLayout}>
          <div className={scholer.scholerSidebar}>
            <div className={scholer.scholerStatusCard}>
              <h3 className={scholer.scholerCardTitle}>Application Status</h3>
              <div className={scholer.scholerStatusDetails}>
                <div className={scholer.scholerStatusItem}>
                  <span className={scholer.scholerStatusLabel}>Eligibility</span>
                  <span className={`${scholer.scholerStatusBadge} ${studentData.scholarship.eligible ? scholer.scholerBadgeSuccess : scholer.scholerBadgeError}`}>
                    {studentData.scholarship.eligible ? 'Eligible' : 'Not Eligible'}
                  </span>
                </div>
                <div className={scholer.scholerStatusItem}>
                  <span className={scholer.scholerStatusLabel}>Status</span>
                  <span className={`${scholer.scholerStatusBadge} ${
                    (studentData.scholarship.status === 'Under Review' || studentData.scholarship.status === 'Pending') ? scholer.scholerBadgeInfo :
                    studentData.scholarship.status === 'Approved' ? scholer.scholerBadgeSuccess :
                    studentData.scholarship.status === 'Not Applied' ? scholer.scholerBadgeNeutral : scholer.scholerBadgeError
                  }`}>
                    {studentData.scholarship.status === 'Pending' ? 'Under Review' : studentData.scholarship.status}
                  </span>
                </div>
                {studentData.scholarship.status === 'Approved' && studentData.scholarship.amount > 0 && (
                  <div className={scholer.scholerStatusItem}>
                    <span className={scholer.scholerStatusLabel}>Awarded Amount</span>
                    <span className={scholer.scholerStatusValue}>
                      ₹{studentData.scholarship.amount.toLocaleString()}
                    </span>
                  </div>
                )}
                {studentData.scholarship.mahadbtId && (
                  <div className={scholer.scholerStatusItem}>
                    <span className={scholer.scholerStatusLabel}>MahaDBT ID</span>
                    <span className={scholer.scholerStatusValue}>{studentData.scholarship.mahadbtId}</span>
                  </div>
                )}
                {studentData.scholarship.mahadbtStatus && (
                  <div className={scholer.scholerStatusItem}>
                    <span className={scholer.scholerStatusLabel}>MahaDBT Status</span>
                    <span className={`${scholer.scholerStatusBadge} ${scholer.scholerBadgeInfo}`}>
                      {studentData.scholarship.mahadbtStatus}
                    </span>
                  </div>
                )}
                {(studentData.scholarship.status === 'Under Review' || studentData.scholarship.status === 'Pending') && (
                  <div className={scholer.scholerStatusItem}>
                    <span className={scholer.scholerStatusLabel}>Estimated Award</span>
                    <span className={scholer.scholerStatusValue}>
                      ₹{(studentData.scholarship.amount || 3000).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className={scholer.scholerCriteriaCard}>
              <h3 className={scholer.scholerCardTitle}>Eligibility Criteria</h3>
              <ul className={scholer.scholerCriteriaList}>
                {[
                  'Family income below ₹8,00,000 per annum',
                  'Academic performance above 75%',
                  'No pending fees',
                  'Good attendance record'
                ].map((criterion, index) => (
                  <li key={index} className={scholer.scholerCriterionItem}>
                    <span className={scholer.scholerCriterionDot}></span>
                    <span className={scholer.scholerCriterionText}>{criterion}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className={scholer.scholerFormSection}>
            <div className={scholer.scholerFormCard}>
              <h3 className={scholer.scholerCardTitle}>Apply Now</h3>
              {isSubmitted ? (
                <div className={scholer.scholerSuccessMessage}>
                  <div className={scholer.scholerSuccessIcon}>
                    <svg className={scholer.scholerCheckmark} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className={scholer.scholerSuccessTitle}>Application Submitted!</h3>
                  <p className={scholer.scholerSuccessText}>
                    Your scholarship application was successfully submitted. Expect a response within 2-3 weeks.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className={scholer.scholerForm}>
                  {/* Section 1: MahaDBT & Scheme */}
                  <div className={scholer.scholerFormSectionTitle}>
                    <h4>1. MahaDBT & Scheme Selection</h4>
                  </div>
                  <div className={scholer.scholerFormGrid}>
                    <div className={scholer.scholerInputGroup}>
                      <label htmlFor="mahadbtId" className={scholer.scholerInputLabel}>MahaDBT Application ID *</label>
                      <input type="text" id="mahadbtId" name="mahadbtId" value={formData.mahadbtId} onChange={handleChange} className={scholer.scholerInputField} placeholder="e.g. 2324MH1234567" />
                      {errors.mahadbtId && <p className={scholer.scholerErrorText}>{errors.mahadbtId}</p>}
                    </div>
                    <div className={scholer.scholerInputGroup}>
                      <label htmlFor="schemeName" className={scholer.scholerInputLabel}>Scholarship Scheme *</label>
                      <select id="schemeName" name="schemeName" value={formData.schemeName} onChange={handleChange} className={scholer.scholerInputField}>
                        <option value="">Select Scheme</option>
                        <option value="Rajarshi Chhatrapati Shahu Maharaj Fee Reimbursement">EBC (Rajarshi Shahu Maharaj)</option>
                        <option value="Post-Matric Scholarship to OBC Students">Post-Matric (OBC)</option>
                        <option value="Post-Matric Scholarship to SC Students">Post-Matric (SC)</option>
                        <option value="Post-Matric Scholarship to ST Students">Post-Matric (ST)</option>
                        <option value="Dr. Panjabrao Deshmukh Hostel Allowance">Panjabrao Deshmukh (Hostel)</option>
                        <option value="State Minority Scholarship Purshottam Das">State Minority</option>
                      </select>
                      {errors.schemeName && <p className={scholer.scholerErrorText}>{errors.schemeName}</p>}
                    </div>
                  </div>

                  {/* Section 2: Personal & Category */}
                  <div className={scholer.scholerFormSectionTitle}>
                    <h4>2. Personal & Category Details</h4>
                  </div>
                  <div className={scholer.scholerFormGrid}>
                    <div className={scholer.scholerInputGroup}>
                      <label htmlFor="casteCategory" className={scholer.scholerInputLabel}>Caste Category *</label>
                      <select id="casteCategory" name="casteCategory" value={formData.casteCategory} onChange={handleChange} className={scholer.scholerInputField}>
                        <option value="">Select Category</option>
                        <option value="General">General / Open</option>
                        <option value="OBC">OBC</option>
                        <option value="SC">SC</option>
                        <option value="ST">ST</option>
                        <option value="VJNT">VJNT / SBC</option>
                        <option value="EWS">EWS</option>
                      </select>
                      {errors.casteCategory && <p className={scholer.scholerErrorText}>{errors.casteCategory}</p>}
                    </div>
                    <div className={scholer.scholerInputGroup}>
                      <label className={scholer.scholerInputLabel}>Is Religious Minority?</label>
                      <div className={scholer.scholerCheckboxWrapper}>
                        <input type="checkbox" id="isMinority" name="isMinority" checked={formData.isMinority} onChange={handleChange} className={scholer.scholerCheckbox} />
                        <label htmlFor="isMinority">Yes, I belong to a minority community</label>
                      </div>
                    </div>
                  </div>
                  <div className={scholer.scholerInputGroup}>
                    <label htmlFor="familyIncome" className={scholer.scholerInputLabel}>Annual Family Income (₹) *</label>
                    <input type="number" id="familyIncome" name="familyIncome" value={formData.familyIncome} onChange={handleChange} className={scholer.scholerInputField} placeholder="Enter annual income" />
                    {errors.familyIncome && <p className={scholer.scholerErrorText}>{errors.familyIncome}</p>}
                  </div>

                  {/* Section 3: Academic Details */}
                  <div className={scholer.scholerFormSectionTitle}>
                    <h4>3. Academic Performance</h4>
                  </div>
                  <div className={scholer.scholerFormGrid}>
                    <div className={scholer.scholerInputGroup}>
                      <label htmlFor="academicPerformance" className={scholer.scholerInputLabel}>Current Year Attendance (%) *</label>
                      <input type="number" id="academicPerformance" name="academicPerformance" value={formData.academicPerformance} onChange={handleChange} className={scholer.scholerInputField} placeholder="Current year attendance" />
                    </div>
                    <div className={scholer.scholerInputGroup}>
                      <label htmlFor="previousYearMarks" className={scholer.scholerInputLabel}>Previous Year Marks (%) *</label>
                      <input type="number" id="previousYearMarks" name="previousYearMarks" value={formData.previousYearMarks} onChange={handleChange} className={scholer.scholerInputField} placeholder="Last year percentage" />
                      {errors.previousYearMarks && <p className={scholer.scholerErrorText}>{errors.previousYearMarks}</p>}
                    </div>
                  </div>

                  {/* Section 4: Bank Details */}
                  <div className={scholer.scholerFormSectionTitle}>
                    <h4>4. Disbursement Bank Details</h4>
                  </div>
                  <div className={scholer.scholerFormGrid}>
                    <div className={scholer.scholerInputGroup}>
                      <label htmlFor="bankDetails.accountNumber" className={scholer.scholerInputLabel}>Bank Account Number *</label>
                      <input type="text" id="bankDetails.accountNumber" name="bankDetails.accountNumber" value={formData.bankDetails.accountNumber} onChange={handleChange} className={scholer.scholerInputField} placeholder="Enter account number" />
                      {errors.accountNumber && <p className={scholer.scholerErrorText}>{errors.accountNumber}</p>}
                    </div>
                    <div className={scholer.scholerInputGroup}>
                      <label htmlFor="bankDetails.ifscCode" className={scholer.scholerInputLabel}>IFSC Code *</label>
                      <input type="text" id="bankDetails.ifscCode" name="bankDetails.ifscCode" value={formData.bankDetails.ifscCode} onChange={handleChange} className={scholer.scholerInputField} placeholder="e.g. SBIN0001234" />
                    </div>
                  </div>

                  {/* Section 5: Document Uploads */}
                  <div className={scholer.scholerFormSectionTitle}>
                    <h4>5. Document Verification (MANDATORY)</h4>
                  </div>
                  <div className={scholer.scholerDocGrid}>
                    <div className={scholer.scholerDocItem}>
                      <label>Aadhar Card *</label>
                      <input type="file" name="doc_aadharCard" onChange={handleFileChange} accept=".pdf,.jpg,.png" />
                    </div>
                    <div className={scholer.scholerDocItem}>
                      <label>Income Certificate *</label>
                      <input type="file" name="doc_incomeCertificate" onChange={handleFileChange} accept=".pdf,.jpg,.png" />
                    </div>
                    <div className={scholer.scholerDocItem}>
                      <label>Caste Certificate</label>
                      <input type="file" name="doc_casteCertificate" onChange={handleFileChange} accept=".pdf,.jpg,.png" />
                    </div>
                    <div className={scholer.scholerDocItem}>
                      <label>Previous Marksheet *</label>
                      <input type="file" name="doc_previousMarksheet" onChange={handleFileChange} accept=".pdf,.jpg,.png" />
                    </div>
                  </div>

                  <div className={scholer.scholerInputGroup}>
                    <label htmlFor="reason" className={scholer.scholerInputLabel}>Reason for Application</label>
                    <textarea id="reason" name="reason" rows={3} value={formData.reason} onChange={handleChange} className={scholer.scholerTextareaField} placeholder="Explain why you are applying..." />
                  </div>

                  {errors.general && <p className={scholer.scholerGeneralError}>{errors.general}</p>}
                  <div className={scholer.scholerFormActions}>
                    <button type="submit" disabled={isLoading} className={`${scholer.scholerSubmitButton} ${isLoading ? scholer.scholerButtonDisabled : ''}`}>
                      {isLoading ? 'Verifying & Submitting...' : 'Submit Application'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scholarship;
