import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dashboardAPI } from '../../services';
import styles from '../../styles/Dashboard.module.css';

const PaymentHistory = () => {
  const { user } = useAuth();
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        const data = await dashboardAPI.getStudentStats(user?.email);
        setStudentData(data);
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

  const formatDate = (dateStr) => {
    if (!dateStr || dateStr === 'N/A') return 'N/A';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric'
      });
    } catch { return dateStr; }
  };

  if (loading) {
    return (
      <div className={styles.dashboardContainer}>
        <div className={styles.dashboardContent}>
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <div className={styles.loadingSpinner}></div>
            <p style={{ marginTop: '1rem', color: '#64748b' }}>Loading payment history...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!studentData || !studentData.fees.paymentHistory || studentData.fees.paymentHistory.length === 0) {
    return (
      <div className={styles.dashboardContainer}>
        <div className={styles.dashboardContent}>
          <h2 className={styles.sectionTitle}>Payment History</h2>
          <div className={styles.emptyState}>
            <p>No payment history found.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.dashboardContent}>
        <h2 className={styles.sectionTitle}>Full Payment History</h2>
        <div className={styles.statCard}>
          <div className={styles.statCardContent}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '1rem 0.75rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Date
                    </th>
                    <th style={{ padding: '1rem 0.75rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Amount
                    </th>
                    <th style={{ padding: '1rem 0.75rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Payment Method
                    </th>
                    <th style={{ padding: '1rem 0.75rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Receipt No.
                    </th>
                    <th style={{ padding: '1rem 0.75rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[...studentData.fees.paymentHistory]
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .map((payment, index) => (
                    <tr key={payment.id || index} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '1rem 0.75rem', fontSize: '0.875rem', color: '#1e293b' }}>
                        {formatDate(payment.date)}
                      </td>
                      <td style={{ padding: '1rem 0.75rem', fontSize: '0.875rem', color: '#1e293b', fontWeight: '700' }}>
                        ₹{payment.amount.toLocaleString()}
                      </td>
                      <td style={{ padding: '1rem 0.75rem', fontSize: '0.875rem', color: '#1e293b', textTransform: 'capitalize' }}>
                        {payment.method}
                      </td>
                      <td style={{ padding: '1rem 0.75rem', fontSize: '0.875rem', color: '#64748b', fontFamily: 'monospace' }}>
                        #{payment.receiptNumber || 'N/A'}
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
    </div>
  );
};

export default PaymentHistory;
