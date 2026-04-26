import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI } from '../../services';
import styles from '../../styles/Dashboard.module.css';

// Memoized stat card component for better performance
const StatCard = React.memo(({ icon, label, value, color, iconColor }) => (
  <div className={styles.statCard}>
    <div className={styles.statCardContent}>
      <div className={styles.statCardHeader}>
        <div className={`${styles.statIcon} ${styles[iconColor]}`}>
          <svg className={styles.statIconWhite} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {icon}
          </svg>
        </div>
        <div className={styles.statInfo}>
          <dl>
            <dt className={styles.statLabel}>{label}</dt>
            <dd className={styles.statValue}>{value}</dd>
          </dl>
        </div>
      </div>
    </div>
  </div>
));

// Memoized recent student card
const RecentStudentCard = React.memo(({ student }) => (
  <div className={styles.recentStudentCard}>
    <div className={styles.studentAvatar}>
      <span>{student.name?.charAt(0)?.toUpperCase() || 'S'}</span>
    </div>
    <div className={styles.studentInfo}>
      <h4 className={styles.studentName}>{student.name}</h4>
      <p className={styles.studentEmail}>{student.email}</p>
      <p className={styles.studentDepartment}>{student.department}</p>
    </div>
    <div className={styles.studentStatus}>
      <span className={`${styles.statusBadge} ${student.fees?.pending > 0 ? styles.pending : styles.paid}`}>
        {student.fees?.pending > 0 ? 'Pending Fees' : 'Fees Paid'}
      </span>
    </div>
  </div>
));

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalFees: 0,
    pendingFees: 0,
    scholarshipApplications: 0
  });
  const [recentStudents, setRecentStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Memoized fetch function to prevent unnecessary re-renders
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardAPI.getAdminStats();
      setStats({
        totalStudents: data.totalStudents,
        totalFees: data.totalFees,
        pendingFees: data.pendingFees,
        scholarshipApplications: data.scholarshipApplications
      });
      
      setRecentStudents(data.recentStudents);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Memoized stat cards data
  const statCards = useMemo(() => [
    {
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />,
      label: 'Total College Fees',
      value: `₹${stats.totalFees.toLocaleString()}`,
      color: 'green',
      iconColor: 'statIconGreen'
    },
    {
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />,
      label: 'Total Students',
      value: stats.totalStudents,
      color: 'blue',
      iconColor: 'statIconBlue'
    },
    {
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
      label: 'Pending Collection',
      value: `₹${stats.pendingFees.toLocaleString()}`,
      color: 'yellow',
      iconColor: 'statIconYellow'
    },
    {
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
      label: 'Scholarship Reviews',
      value: stats.scholarshipApplications,
      color: 'purple',
      iconColor: 'statIconPurple'
    }
  ], [stats]);

  const collectionProgress = stats.totalFees > 0 
    ? Math.round(((stats.totalFees - stats.pendingFees) / stats.totalFees) * 100) 
    : 0;

  if (loading) {
    return (
      <div className={styles.dashboardContainer}>
        <div className={styles.dashboardContent}>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ 
              animation: 'spin 1s linear infinite',
              width: '3rem',
              height: '3rem',
              border: '2px solid #e5e7eb',
              borderTop: '2px solid #3b82f6',
              borderRadius: '50%',
              margin: '0 auto 1rem'
            }}></div>
            <p style={{ color: '#6b7280' }}>Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.dashboardContainer}>
        <div className={styles.dashboardContent}>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ color: '#ef4444', marginBottom: '1rem' }}>
              <svg style={{ width: '3rem', height: '3rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</p>
            <button 
              onClick={fetchDashboardData}
              style={{
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.dashboardContent}>
        {/* Header */}
        <div className={styles.dashboardHeader}>
          <h1 className={styles.dashboardTitle}>Admin Dashboard</h1>
          <p className={styles.dashboardSubtitle}>Manage students, fees, and scholarships</p>
        </div>

        {/* Stats Cards */}
        <div className={styles.statsGrid}>
          {statCards.map((card, index) => (
            <StatCard key={index} {...card} />
          ))}
        </div>

        {/* Collection & Scholarship Overview Section (Mirrored from Student Dashboard style) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
          
          {/* Fee Collection Progress */}
          <div className={styles.statCard} style={{ padding: '2rem' }}>
            <h3 className={styles.sectionTitle} style={{ marginBottom: '1.5rem', fontSize: '1.125rem' }}>Fee Collection Progress</h3>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem', color: '#64748b' }}>
                <span style={{ fontWeight: '600' }}>Overall Recovery</span>
                <span style={{ fontWeight: '700', color: '#3b82f6' }}>{collectionProgress}%</span>
              </div>
              <div style={{ width: '100%', height: '10px', backgroundColor: '#f1f5f9', borderRadius: '5px', overflow: 'hidden' }}>
                <div 
                  style={{ 
                    height: '100%', 
                    backgroundColor: '#3b82f6', 
                    width: `${collectionProgress}%`,
                    transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 0 10px rgba(59, 130, 246, 0.3)'
                  }}
                />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ padding: '1rem', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
                <p style={{ color: '#166534', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Collected</p>
                <p style={{ color: '#15803d', fontSize: '1.25rem', fontWeight: '800' }}>₹{(stats.totalFees - stats.pendingFees).toLocaleString()}</p>
              </div>
              <div style={{ padding: '1rem', background: '#fff1f2', borderRadius: '12px', border: '1px solid #fecdd3' }}>
                <p style={{ color: '#9f1239', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Outstanding</p>
                <p style={{ color: '#be123c', fontSize: '1.25rem', fontWeight: '800' }}>₹{stats.pendingFees.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Scholarship Review Summary */}
          <div className={styles.statCard} style={{ padding: '2rem' }}>
            <h3 className={styles.sectionTitle} style={{ marginBottom: '1.5rem', fontSize: '1.125rem' }}>Scholarship Review Status</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '8px', height: '8px', background: '#3b82f6', borderRadius: '50%' }} />
                  <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#475569' }}>Pending Review</span>
                </div>
                <span className={`${styles.statusBadge} ${styles.pending}`}>{stats.scholarshipApplications} Applications</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%' }} />
                  <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#475569' }}>Recently Approved</span>
                </div>
                <span className={`${styles.statusBadge} ${styles.paid}`}>Check History</span>
              </div>
              <Link to="/admin/scholarships/applications" className={styles.viewAllLink} style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                View All Pending Applications →
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className={styles.quickActions}>
          <h2 className={styles.sectionTitle}>Quick Actions</h2>
          <div className={styles.actionButtons}>
            <Link to="/admin/add-student" className={styles.actionButton}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add New Student
            </Link>
            <Link to="/admin/fee-receipt" className={styles.actionButton}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Generate Fee Receipt
            </Link>
            <Link to="/admin/scholarships" className={styles.actionButton}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Manage Scholarships
            </Link>
          </div>
        </div>

        {/* Recent Students */}
        <div className={styles.recentStudents}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Recent Students</h2>
            <Link to="/admin/students" className={styles.viewAllLink}>
              View All Students
            </Link>
          </div>
          <div className={styles.studentsList}>
            {recentStudents.length > 0 ? (
              recentStudents.map((student) => (
                <RecentStudentCard key={student.id} student={student} />
              ))
            ) : (
              <div className={styles.emptyState}>
                <p>No students found. Add your first student to get started.</p>
                <Link to="/admin/add-student" className={styles.actionButton}>
                  Add Student
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(AdminDashboard); 