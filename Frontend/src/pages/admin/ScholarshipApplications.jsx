import React, { useState, useEffect } from 'react';
import styles from '../../styles/ScholarshipApplications.module.css';
import { scholarshipsAPI } from '../../services';
import { Check, X, Eye, Clock, AlertCircle } from 'lucide-react';

const ScholarshipApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const [expandedApp, setExpandedApp] = useState(null);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await scholarshipsAPI.getAllApplications();
      setApplications(res.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleReview = async (id, status, remarks) => {
    try {
      await scholarshipsAPI.reviewApplication(id, { status, adminComments: remarks });
      fetchApplications();
    } catch (err) {
      alert('Error updating application');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Scholarship Applications</h1>
        <p className={styles.subtitle}>Review and process student scholarship requests with full verification</p>
      </div>

      {loading ? <p>Loading...</p> : (
        <div className={styles.list}>
          {applications.length === 0 ? <p className={styles.empty}>No applications found.</p> : (
            applications.map((app, index) => (
              <div key={app._id || index} className={`${styles.card} ${expandedApp === app._id ? styles.expandedCard : ''}`}>
                <div className={styles.cardHeader}>
                  <div className={styles.studentInfo}>
                    <div className={styles.avatar}>
                      {(app.studentId?.name || 'Student').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3>{app.studentId?.name || 'Unknown Student'}</h3>
                      <p>
                        {app.studentId?.studentId || 'N/A'} • {app.studentId?.department || 'General'}
                      </p>
                    </div>
                  </div>
                  <div className={styles.headerRight}>
                    <div className={`${styles.status} ${styles[(app.status === 'Pending' ? 'UnderReview' : (app.status || 'Under Review').replace(' ', ''))]}`}>
                      {(app.status === 'Under Review' || app.status === 'Pending' || !app.status) ? <Clock size={14}/> : <Check size={14}/>}
                      {app.status === 'Pending' ? 'Under Review' : (app.status || 'Under Review')}
                    </div>
                    <button 
                      className={styles.expandBtn}
                      onClick={() => setExpandedApp(expandedApp === app._id ? null : app._id)}
                    >
                      {expandedApp === app._id ? 'Close' : 'View Full Details'}
                    </button>
                  </div>
                </div>

                <div className={styles.appDetails}>
                  <div className={styles.detailItem}>
                    <label>Scholarship</label>
                    <p>{app.scholarshipId?.name || 'General Scholarship'}</p>
                  </div>
                  <div className={styles.detailItem}>
                    <label>MahaDBT ID</label>
                    <p className={styles.mahadbtId}>{app.mahadbtId || 'Not Provided'}</p>
                  </div>
                  <div className={styles.detailItem}>
                    <label>Scheme</label>
                    <p className={styles.schemeName}>{app.schemeName || 'N/A'}</p>
                  </div>
                  <div className={styles.detailItem}>
                    <label>Est. Amount</label>
                    <p>₹{(app.studentId?.scholarship?.amount || app.scholarshipId?.amount || 0).toLocaleString()}</p>
                  </div>
                </div>

                {expandedApp === app._id && (
                  <div className={styles.expandedContent}>
                    <div className={styles.infoSection}>
                      <h4>Personal & Verification</h4>
                      <div className={styles.infoGrid}>
                        <div className={styles.infoItem}><label>Category</label><span>{app.casteCategory || 'N/A'}</span></div>
                        <div className={styles.infoItem}><label>Minority</label><span>{app.isMinority ? 'Yes' : 'No'}</span></div>
                        <div className={styles.infoItem}><label>Income</label><span>₹{app.familyIncome?.toLocaleString() || 'N/A'}</span></div>
                      </div>
                    </div>

                    <div className={styles.infoSection}>
                      <h4>Academic Records</h4>
                      <div className={styles.infoGrid}>
                        <div className={styles.infoItem}><label>Attendance</label><span>{app.academicPerformance}%</span></div>
                        <div className={styles.infoItem}><label>Prev. Year Marks</label><span>{app.previousYearMarks}%</span></div>
                      </div>
                    </div>

                    <div className={styles.infoSection}>
                      <h4>Bank Details</h4>
                      <div className={styles.infoGrid}>
                        <div className={styles.infoItem}><label>Bank</label><span>{app.bankDetails?.bankName || 'N/A'}</span></div>
                        <div className={styles.infoItem}><label>Account No</label><span>{app.bankDetails?.accountNumber || 'N/A'}</span></div>
                        <div className={styles.infoItem}><label>IFSC</label><span>{app.bankDetails?.ifscCode || 'N/A'}</span></div>
                      </div>
                    </div>

                    <div className={styles.infoSection}>
                      <h4>Documents Submitted</h4>
                      <div className={styles.docLinks}>
                        {app.documentUrls && Object.entries(app.documentUrls).map(([key, val]) => (
                          val && <div key={key} className={styles.docTag}><Eye size={12}/> {key.replace(/([A-Z])/g, ' $1').trim()}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {(app.status === 'Under Review' || app.status === 'Pending' || !app.status) && (
                  <div className={styles.actions}>
                    <button 
                      className={styles.approveBtn}
                      onClick={() => handleReview(app._id, 'Approved', 'Application verified and approved.')}
                    >
                      <Check size={16}/> Approve
                    </button>
                    <button 
                      className={styles.rejectBtn}
                      onClick={() => {
                        const reason = prompt('Reason for rejection?');
                        if (reason) handleReview(app._id, 'Rejected', reason);
                      }}
                    >
                      <X size={16}/> Reject
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ScholarshipApplications;
