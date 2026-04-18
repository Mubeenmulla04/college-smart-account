import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dashboardAPI, studentsAPI } from '../../services';
import scholer from './Scholarship.module.css';

const Scholarship = () => {
  const { user } = useAuth();
  const [studentData, setStudentData] = useState(null);
  const [formData, setFormData] = useState({
    familyIncome: '',
    academicPerformance: '',
    reason: '',
    documents: []
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
          setStudentData(data);
          setIsSubmitted(data.scholarship.applied);
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

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      documents: files
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.familyIncome || parseFloat(formData.familyIncome) <= 0) {
      newErrors.familyIncome = 'Please enter a valid family income';
    }

    if (!formData.academicPerformance || parseFloat(formData.academicPerformance) < 0 || parseFloat(formData.academicPerformance) > 100) {
      newErrors.academicPerformance = 'Please enter a valid percentage (0-100)';
    }

    if (!formData.reason.trim()) {
      newErrors.reason = 'Please provide a reason for scholarship application';
    }

    if (formData.documents.length === 0) {
      newErrors.documents = 'Please upload required documents';
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
      const applicationData = {
        ...studentData.scholarship,
        applied: true,
        status: 'Under Review',
        applicationDate: new Date().toISOString().split('T')[0],
        documents: formData.documents.map(file => file.name),
        familyIncome: parseFloat(formData.familyIncome),
        academicPerformance: parseFloat(formData.academicPerformance),
        reason: formData.reason
      };

      await studentsAPI.updateScholarship(studentData.id, applicationData);
      
      setStudentData(prev => ({
        ...prev,
        scholarship: applicationData
      }));
      
      setIsSubmitted(true);
      alert('Scholarship application submitted successfully!');
    } catch (error) {
      console.error('Error submitting scholarship application:', error);
      setErrors({ general: 'Failed to submit application. Please try again.' });
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
          {/* Sidebar: Status & Criteria */}
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
                    studentData.scholarship.status === 'Under Review' ? scholer.scholerBadgeInfo :
                    studentData.scholarship.status === 'Not Applied' ? scholer.scholerBadgeNeutral : scholer.scholerBadgeError
                  }`}>
                    {studentData.scholarship.status}
                  </span>
                </div>
                {studentData.scholarship.amount > 0 && (
                  <div className={scholer.scholerStatusItem}>
                    <span className={scholer.scholerStatusLabel}>Awarded Amount</span>
                    <span className={scholer.scholerStatusValue}>
                      ₹{studentData.scholarship.amount.toLocaleString()}
                    </span>
                  </div>
                )}
                {studentData.scholarship.status === 'Under Review' && (
                  <div className={scholer.scholerStatusMessage}>
                    <p className={scholer.scholerMessageText}>
                      Your application is under review. We'll notify you soon.
                    </p>
                  </div>
                )}
                {studentData.scholarship.status === 'Not Applied' && (
                  <div className={scholer.scholerStatusMessage}>
                    <p className={scholer.scholerMessageText}>
                      Start your scholarship journey by completing the form.
                    </p>
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

          {/* Application Form */}
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
                  <div className={scholer.scholerFormGrid}>
                    <div className={scholer.scholerInputGroup}>
                      <label htmlFor="familyIncome" className={scholer.scholerInputLabel}>
                        Annual Family Income (₹) *
                      </label>
                      <input
                        type="number"
                        id="familyIncome"
                        name="familyIncome"
                        value={formData.familyIncome}
                        onChange={handleChange}
                        className={`${scholer.scholerInputField} ${errors.familyIncome ? scholer.scholerInputError : ''}`}
                        placeholder="Enter annual family income"
                      />
                      {errors.familyIncome && (
                        <p className={scholer.scholerErrorText}>{errors.familyIncome}</p>
                      )}
                    </div>
                    <div className={scholer.scholerInputGroup}>
                      <label htmlFor="academicPerformance" className={scholer.scholerInputLabel}>
                        Academic Performance (%) *
                      </label>
                      <input
                        type="number"
                        id="academicPerformance"
                        name="academicPerformance"
                        value={formData.academicPerformance}
                        onChange={handleChange}
                        className={`${scholer.scholerInputField} ${errors.academicPerformance ? scholer.scholerInputError : ''}`}
                        placeholder="Enter percentage"
                        min="0"
                        max="100"
                      />
                      {errors.academicPerformance && (
                        <p className={scholer.scholerErrorText}>{errors.academicPerformance}</p>
                      )}
                    </div>
                  </div>
                  <div className={scholer.scholerInputGroup}>
                    <label htmlFor="reason" className={scholer.scholerInputLabel}>
                      Reason for Scholarship Application *
                    </label>
                    <textarea
                      id="reason"
                      name="reason"
                      rows={4}
                      value={formData.reason}
                      onChange={handleChange}
                      className={`${scholer.scholerTextareaField} ${errors.reason ? scholer.scholerInputError : ''}`}
                      placeholder="Explain why you need this scholarship..."
                    />
                    {errors.reason && (
                      <p className={scholer.scholerErrorText}>{errors.reason}</p>
                    )}
                  </div>
                  <div className={scholer.scholerInputGroup}>
                    <label htmlFor="documents" className={scholer.scholerInputLabel}>
                      Required Documents *
                    </label>
                    <input
                      type="file"
                      id="documents"
                      name="documents"
                      multiple
                      onChange={handleFileChange}
                      className={`${scholer.scholerFileInput} ${errors.documents ? scholer.scholerInputError : ''}`}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />
                    <p className={scholer.scholerInputHint}>
                      Upload: Income certificate, Academic records, ID proof (PDF, DOC, or images)
                    </p>
                    {errors.documents && (
                      <p className={scholer.scholerErrorText}>{errors.documents}</p>
                    )}
                    {formData.documents.length > 0 && (
                      <div className={scholer.scholerFileList}>
                        <p className={scholer.scholerFileListTitle}>Selected files:</p>
                        <ul className={scholer.scholerFileItems}>
                          {formData.documents.map((file, index) => (
                            <li key={index} className={scholer.scholerFileItem}>{file.name}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  {errors.general && (
                    <p className={scholer.scholerGeneralError}>{errors.general}</p>
                  )}
                  <div className={scholer.scholerFormActions}>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`${scholer.scholerSubmitButton} ${isLoading ? scholer.scholerButtonDisabled : ''}`}
                    >
                      {isLoading ? 'Submitting...' : 'Submit Application'}
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