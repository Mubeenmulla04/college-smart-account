import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { dashboardAPI } from '../../services';
import styles from '../../styles/Dashboard.module.css';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true);

        const data = await dashboardAPI.getStudentStats();
        setStudentData(data);
        console.log("Fetched student data:", data);
      } catch (error) {
        console.error('Error fetching student data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.email) {
      fetchStudentData();
    }
  }, [user]);

  // Fetch fee receipt when student data is available
  useEffect(() => {
    const fetchFeesReceipt = async () => {
      if (studentData?.id) {
        console.log("Fetching fees receipt for student:", studentData.id);
        try {
          const receipt = await dashboardAPI.getFeesReceiptByStudentId(studentData.id);
          console.log("Fetched fees receipt:", receipt);
        } catch (error) {
          console.error('Error fetching fees receipt:', error);
        }
      }
    };

    fetchFeesReceipt();
  }, [studentData?.id]);  // Only run when studentData.id changes, not the entire object

  // Add effect to refresh data when component becomes visible (user returns from other pages)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user?.email) {
        // Refresh data when page becomes visible
        const fetchFreshData = async () => {
          try {
  
            const data = await dashboardAPI.getStudentStats();
            setStudentData(data);
                
            // Also refresh fee receipt data
            if (data?.id) {
              await dashboardAPI.getFeesReceiptByStudentId(data.id);
            }
          } catch (error) {
            console.error('Error refreshing student data:', error);
          }
        };
        fetchFreshData();
      }
    };
  
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user]);

  // Refresh data when location changes (user navigates back from other pages)
  useEffect(() => {
    if (user?.email && location.pathname === '/student/dashboard') {
      const refreshData = async () => {
        try {

          const data = await dashboardAPI.getStudentStats();
          setStudentData(data);
          
          // Also refresh fee receipt data
          if (data?.id) {
            await dashboardAPI.getFeesReceiptByStudentId(data.id);
          }
        } catch (error) {
          console.error('Error refreshing student data on navigation:', error);
        }
      };
      refreshData();
    }
  }, [location.pathname, user]);

  // Manual refresh function
  const _handleRefresh = async () => {
    if (refreshing || !user?.email) return;
    
    try {
      setRefreshing(true);

      const data = await dashboardAPI.getStudentStats();
      setStudentData(data);
      
      // Also refresh fee receipt data
      if (data?.id) {
        await dashboardAPI.getFeesReceiptByStudentId(data.id);
      }
    } catch (error) {
      console.error('Error refreshing student data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.dashboardContainer}>
        <div className={styles.dashboardContent}>
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <div className={styles.loadingSpinner}></div>
            <p style={{ marginTop: '1rem', color: '#64748b' }}>Loading student data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!studentData) {
    return (
      <div className={styles.dashboardContainer}>
        <div className={styles.dashboardContent}>
          <div className={styles.emptyState}>
            <p>Student data not found.</p>
          </div>
        </div>
      </div>
    );
  }

  const paymentProgress = (studentData.fees.paid / studentData.fees.total) * 100;
  // studentData.fees.pending - feesReciept?.amount

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.dashboardContent}>
        {/* Header */}
        <div className={styles.dashboardHeader}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div className={styles.studentAvatar} style={{ width: '4rem', height: '4rem', fontSize: '1.5rem' }}>
                {studentData.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h1 className={styles.dashboardTitle}>Welcome back, {studentData.name}!</h1>
                <p className={styles.dashboardSubtitle}>{studentData.department} • {studentData.year}rd Year</p>
              </div>
            </div>
            {/* <button
              onClick={handleRefresh}
              disabled={refreshing}
              className={styles.actionButton}
              style={{ 
                padding: '0.5rem 1rem', 
                fontSize: '0.875rem',
                opacity: refreshing ? 0.6 : 1,
                cursor: refreshing ? 'not-allowed' : 'pointer'
              }}
            >
              <svg 
                style={{ 
                  width: '1rem', 
                  height: '1rem', 
                  marginRight: '0.5rem',
                  animation: refreshing ? 'spin 1s linear infinite' : 'none'
                }} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button> */}
          </div>
        </div>

        {/* Stats Cards */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statCardContent}>
              <div className={styles.statCardHeader}>
                <div className={`${styles.statIcon} ${styles.statIconGreen}`}>
                  <svg className={styles.statIconWhite} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className={styles.statInfo}>
                  <div className={styles.statLabel}>Total Fees</div>
                  <div className={styles.statValue}>₹{studentData.fees.total.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statCardContent}>
              <div className={styles.statCardHeader}>
                <div className={`${styles.statIcon} ${styles.statIconBlue}`}>
                  <svg className={styles.statIconWhite} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className={styles.statInfo}>
                  <div className={styles.statLabel}>Amount Paid</div>
                  <div className={styles.statValue}>₹{studentData.fees.paid.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statCardContent}>
              <div className={styles.statCardHeader}>
                <div className={`${styles.statIcon} ${styles.statIconYellow}`}>
                  <svg className={styles.statIconWhite} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className={styles.statInfo}>
                  <div className={styles.statLabel}>Pending Amount</div>
                  <div className={styles.statValue}>₹{studentData.fees.pending.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statCardContent}>
              <div className={styles.statCardHeader}>
                <div className={`${styles.statIcon} ${styles.statIconPurple}`}>
                  <svg className={styles.statIconWhite} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className={styles.statInfo}>
                  <div className={styles.statLabel}>Scholarship Status</div>
                  <div className={styles.statValue} style={{ fontSize: '1rem' }}>
                    <span className={`${styles.statusBadge} ${
                      studentData.scholarship.status === 'Under Review' ? styles.pending :
                      studentData.scholarship.status === 'Approved' ? styles.paid : styles.pending
                    }`}>
                      {studentData.scholarship.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fee Progress Section */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 className={styles.sectionTitle}>Fee Payment Progress</h2>
          <div className={styles.statCard}>
            <div className={styles.statCardContent}>
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#64748b' }}>
                  <span>Payment Progress</span>
                  <span>{paymentProgress.toFixed(1)}%</span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      height: '100%', 
                      backgroundColor: '#3b82f6', 
                      borderRadius: '4px',
                      width: `${paymentProgress}%`,
                      transition: 'width 0.3s ease'
                    }}
                  ></div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div style={{ padding: '1rem', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                  <p style={{ color: '#166534', fontWeight: '600', marginBottom: '0.25rem' }}>Paid</p>
                  <p style={{ color: '#15803d', fontSize: '1.125rem', fontWeight: '700' }}>₹{studentData.fees.paid.toLocaleString()}</p>
                </div>
                <div style={{ padding: '1rem', backgroundColor: '#fffbeb', borderRadius: '8px', border: '1px solid #fed7aa' }}>
                  <p style={{ color: '#92400e', fontWeight: '600', marginBottom: '0.25rem' }}>Pending</p>
                  <p style={{ color: '#d97706', fontSize: '1.125rem', fontWeight: '700' }}>₹{studentData.fees.pending.toLocaleString()}</p>
                </div>
                {studentData.fees.lastPayment && (
                  <div style={{ padding: '1rem', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                    <p style={{ color: '#1e40af', fontWeight: '600', marginBottom: '0.25rem' }}>Last Payment</p>
                    <p style={{ color: '#2563eb', fontSize: '0.875rem' }}>{studentData.fees.lastPayment}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className={styles.quickActions}>
          <h2 className={styles.sectionTitle}>Quick Actions</h2>
          <div className={styles.actionButtons}>
            <button 
              className={styles.actionButton}
              onClick={() => navigate('/student/fee-payment')}
              disabled={studentData?.fees?.pending === 0}
              style={{ 
                opacity: studentData?.fees?.pending === 0 ? 0.5 : 1,
                cursor: studentData?.fees?.pending === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              {studentData?.fees?.pending === 0 ? 'No Pending Fees' : 'Pay Fees Online'}
            </button>

            <button 
              className={styles.actionButton}
              onClick={() => navigate('/student/receipt')}
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download Fee Receipt
            </button>

            <button 
              className={styles.actionButton}
              onClick={() => navigate('/student/scholarship')}
              disabled={studentData?.scholarship?.status === 'Under Review'}
              style={{ 
                opacity: studentData?.scholarship?.status === 'Under Review' ? 0.5 : 1,
                cursor: studentData?.scholarship?.status === 'Under Review' ? 'not-allowed' : 'pointer'
              }}
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              {studentData?.scholarship?.status === 'Under Review' ? 'Application Under Review' : 
               studentData?.scholarship?.status === 'Not Applied' ? 'Apply for Scholarship' : 'View Scholarship'}
            </button>
          </div>
        </div>

        {/* Payment History */}
        {studentData.fees.paymentHistory && studentData.fees.paymentHistory.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <h2 className={styles.sectionTitle}>Payment History</h2>
            <div className={styles.statCard}>
              <div className={styles.statCardContent}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Date
                        </th>
                        <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Amount
                        </th>
                        <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Payment Method
                        </th>
                        <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Receipt No.
                        </th>
                        <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentData.fees.paymentHistory.map((payment, index) => (
                        <tr key={payment.id || index} style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '1rem 0.75rem', fontSize: '0.875rem', color: '#1e293b' }}>
                            {payment.date}
                          </td>
                          <td style={{ padding: '1rem 0.75rem', fontSize: '0.875rem', color: '#1e293b', fontWeight: '600' }}>
                            ₹{payment.amount.toLocaleString()}
                          </td>
                          <td style={{ padding: '1rem 0.75rem', fontSize: '0.875rem', color: '#1e293b' }}>
                            {payment.method}
                          </td>
                          <td style={{ padding: '1rem 0.75rem', fontSize: '0.875rem', color: '#1e293b' }}>
                            {payment.receiptNumber}
                          </td>
                          <td style={{ padding: '1rem 0.75rem' }}>
                            <span className={`${styles.statusBadge} ${styles.paid}`}>
                              Completed
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Student Information */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 className={styles.sectionTitle}>Student Information</h2>
          <div className={styles.statCard}>
            <div className={styles.statCardContent}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#64748b', marginBottom: '0.25rem' }}>Student ID</p>
                    <p style={{ fontSize: '0.875rem', color: '#1e293b' }}>{studentData.id}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#64748b', marginBottom: '0.25rem' }}>Name</p>
                    <p style={{ fontSize: '0.875rem', color: '#1e293b' }}>{studentData.name}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#64748b', marginBottom: '0.25rem' }}>Email</p>
                    <p style={{ fontSize: '0.875rem', color: '#1e293b' }}>{studentData.email}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#64748b', marginBottom: '0.25rem' }}>Phone</p>
                    <p style={{ fontSize: '0.875rem', color: '#1e293b' }}>{studentData.phone}</p>
                  </div>
                  {studentData.address && (
                    <div>
                      <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#64748b', marginBottom: '0.25rem' }}>Address</p>
                      <p style={{ fontSize: '0.875rem', color: '#1e293b' }}>{studentData.address}</p>
                    </div>
                  )}
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#64748b', marginBottom: '0.25rem' }}>Department</p>
                    <p style={{ fontSize: '0.875rem', color: '#1e293b' }}>{studentData.department}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#64748b', marginBottom: '0.25rem' }}>Year</p>
                    <p style={{ fontSize: '0.875rem', color: '#1e293b' }}>{studentData.year}rd Year</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#64748b', marginBottom: '0.5rem' }}>Scholarship Status</p>
                    <span className={`${styles.statusBadge} ${
                      studentData.scholarship.status === 'Under Review' ? styles.pending :
                      studentData.scholarship.status === 'Approved' ? styles.paid : styles.pending
                    }`}>
                      {studentData.scholarship.status}
                    </span>
                  </div>
                  {studentData.scholarship.amount > 0 && (
                    <div>
                      <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#64748b', marginBottom: '0.25rem' }}>Scholarship Amount</p>
                      <p style={{ fontSize: '0.875rem', color: '#1e293b', fontWeight: '600' }}>₹{studentData.scholarship.amount.toLocaleString()}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard; 