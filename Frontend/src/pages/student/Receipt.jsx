import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dashboardAPI, feeReceiptsAPI } from '../../services';
import styles from '../../styles/Dashboard.module.css';

const Receipt = () => {
  const { user } = useAuth();
  const [studentData, setStudentData] = useState(null);
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await dashboardAPI.getStudentStats(user?.email);
        setStudentData(data);
        
        if (data?.id) {
          // Use student_id if available, otherwise fallback to id
          const studentId = data.student_id || data.id;
          console.log("Fetching receipts for studentId:", studentId, "from student data:", data);
          const receiptData = await feeReceiptsAPI.getByStudentId(studentId);
          console.log("Received receipt data:", receiptData);
          
          // Normalize receipt data to ensure consistent field names
          const normalizedReceipts = Array.isArray(receiptData) ? 
            receiptData.map(receipt => ({
              ...receipt,
              receiptNumber: receipt.receiptNumber || receipt.receipt_number || receipt.receipt_id || receipt.id,
              paymentDate: receipt.paymentDate || receipt.date || receipt.payment_date,
              paymentMethod: receipt.paymentMethod || receipt.payment_method,
              description: receipt.description || receipt.desc,
              status: receipt.status || 'Completed'
            })) :
            [];
          
          setReceipts(normalizedReceipts);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.email) {
      fetchData();
    }
  }, [user]);

  const generateReceiptPDF = (receipt) => {
    // Create a new window for the receipt
    const receiptWindow = window.open('', '_blank');
    
    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Fee Receipt - ${receipt.receiptNumber || 'N/A'}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.6;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .college-name {
            font-size: 24px;
            font-weight: bold;
            color: #333;
            margin-bottom: 5px;
          }
          .college-address {
            color: #666;
            font-size: 14px;
          }
          .receipt-title {
            font-size: 20px;
            font-weight: bold;
            text-align: center;
            margin: 20px 0;
            color: #333;
          }
          .receipt-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
          }
          .info-section {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
          }
          .info-title {
            font-weight: bold;
            color: #333;
            margin-bottom: 10px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
          }
          .info-label {
            color: #666;
          }
          .info-value {
            font-weight: bold;
            color: #333;
          }
          .amount-section {
            background: #e8f5e8;
            border: 2px solid #4caf50;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 30px 0;
          }
          .amount-label {
            font-size: 16px;
            color: #333;
            margin-bottom: 10px;
          }
          .amount-value {
            font-size: 32px;
            font-weight: bold;
            color: #2e7d32;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            text-align: center;
            color: #666;
            font-size: 12px;
          }
          .signature-section {
            display: flex;
            justify-content: space-between;
            margin-top: 50px;
          }
          .signature {
            text-align: center;
            width: 200px;
          }
          .signature-line {
            border-top: 1px solid #333;
            margin-top: 40px;
            padding-top: 5px;
          }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="college-name">Smart College Management System</div>
          <div class="college-address">
            BaratRatna indira gandhi college of engineering Solapur, Maharashtra - 413003<br>
            Phone: +91 93707 34943 | Email: info@smartcollege.edu
          </div>
        </div>

        <div class="receipt-title">FEE PAYMENT RECEIPT</div>

        <div class="receipt-info">
          <div class="info-section">
            <div class="info-title">Student Information</div>
            <div class="info-row">
              <span class="info-label">Student ID:</span>
              <span class="info-value">${studentData?.id || 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Name:</span>
              <span class="info-value">${studentData?.name || 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Department:</span>
              <span class="info-value">${studentData?.department || 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Year:</span>
              <span class="info-value">${studentData?.year || 'N/A'}rd Year</span>
            </div>
          </div>

          <div class="info-section">
            <div class="info-title">Payment Details</div>
            <div class="info-row">
              <span class="info-label">Receipt No:</span>
              <span class="info-value">${receipt.receiptNumber || 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Payment Date:</span>
              <span class="info-value">${receipt.paymentDate || 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Payment Method:</span>
              <span class="info-value">${receipt.paymentMethod || 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Description:</span>
              <span class="info-value">${receipt.description || 'N/A'}</span>
            </div>
          </div>
        </div>

        <div class="amount-section">
          <div class="amount-label">Amount Paid</div>
          <div class="amount-value">₹${(receipt.amount || 0).toLocaleString()}</div>
        </div>

        <div class="signature-section">
          <div class="signature">
            <div class="signature-line">Student Signature</div>
          </div>
          <div class="signature">
            <div class="signature-line">Authorized Signature</div>
          </div>
        </div>

        <div class="footer">
          <p>This is a computer-generated receipt and does not require a physical signature.</p>
          <p>For any queries, please contact the accounts department.</p>
          <p>Generated on: ${new Date().toLocaleString()}</p>
        </div>

        <div class="no-print" style="text-align: center; margin-top: 30px;">
          <button onclick="window.print()" style="background: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-right: 10px;">Print Receipt</button>
          <button onclick="window.close()" style="background: #6b7280; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Close</button>
        </div>
      </body>
      </html>
    `;

    receiptWindow.document.write(receiptHTML);
    receiptWindow.document.close();
  };

  if (loading) {
    return (
      <div className={styles.dashboardContainer}>
        <div className={styles.dashboardContent}>
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <div className={styles.loadingSpinner}></div>
            <p style={{ marginTop: '1rem', color: '#64748b' }}>Loading receipts...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.dashboardContent}>
        <div className={styles.dashboardHeader}>
          <h1 className={styles.dashboardTitle}>Fee Receipts</h1>
          <p className={styles.dashboardSubtitle}>Download and view your fee payment receipts</p>
        </div>

        {!receipts || receipts.length === 0 ? (
          <div className={styles.emptyState}>
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <svg style={{ width: '4rem', height: '4rem', color: '#9ca3af', margin: '0 auto 1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                No Receipts Found
              </h3>
              <p style={{ color: '#6b7280' }}>
                You haven't made any fee payments yet. Make a payment to generate receipts.
              </p>
              <button 
                onClick={() => window.location.href = '/student/fee-payment'}
                className={styles.actionButton}
                style={{ marginTop: '1rem' }}
              >
                Make Payment
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {Array.isArray(receipts) && receipts.map((receipt) => (
              <div key={receipt.id || receipt.receiptNumber} className={styles.statCard}>
                <div className={styles.statCardContent}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.5rem' }}>
                        Receipt #{receipt.receiptNumber}
                      </h3>
                      <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
                        {receipt.description || 'Fee Payment'}
                      </p>
                    </div>
                    
                    <div>
                      <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>Payment Date</p>
                      <p style={{ fontWeight: '600', color: '#1e293b' }}>{receipt.paymentDate}</p>
                    </div>
                    
                    <div>
                      <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>Payment Method</p>
                      <p style={{ fontWeight: '600', color: '#1e293b' }}>{receipt.paymentMethod}</p>
                    </div>
                    
                    <div>
                      <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>Amount</p>
                      <p style={{ fontSize: '1.25rem', fontWeight: '700', color: '#16a34a' }}>
                        ₹{(receipt.amount || 0).toLocaleString()}
                      </p>
                    </div>
                    
                    <div>
                      <span className={`${styles.statusBadge} ${styles.paid}`}>
                        {receipt.status}
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => generateReceiptPDF(receipt)}
                        className={styles.actionButton}
                        style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                      >
                        <svg style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download
                      </button>
                      <button
                        onClick={() => setSelectedReceipt(receipt)}
                        className={styles.actionButton}
                        style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                      >
                        <svg style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Receipt Preview Modal */}
        {selectedReceipt && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '2rem',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '80vh',
              overflowY: 'auto'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1e293b' }}>
                  Receipt Preview
                </h3>
                <button
                  onClick={() => setSelectedReceipt(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    color: '#6b7280'
                  }}
                >
                  ×
                </button>
              </div>
              
              <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1.5rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                  <h4 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1e293b' }}>
                    Smart College Management System
                  </h4>
                  <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Fee Payment Receipt</p>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>Receipt Number</p>
                    <p style={{ fontWeight: '600', color: '#1e293b' }}>{selectedReceipt.receiptNumber}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>Payment Date</p>
                    <p style={{ fontWeight: '600', color: '#1e293b' }}>{selectedReceipt.paymentDate}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>Student Name</p>
                    <p style={{ fontWeight: '600', color: '#1e293b' }}>{studentData?.name}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>Student ID</p>
                    <p style={{ fontWeight: '600', color: '#1e293b' }}>{studentData?.id}</p>
                  </div>
                </div>
                
                <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                  <p style={{ fontSize: '0.875rem', color: '#166534', marginBottom: '0.5rem' }}>Amount Paid</p>
                  <p style={{ fontSize: '2rem', fontWeight: '700', color: '#15803d' }}>
                    ₹{selectedReceipt.amount.toLocaleString()}
                  </p>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'center' }}>
                <button
                  onClick={() => generateReceiptPDF(selectedReceipt)}
                  className={styles.actionButton}
                >
                  Download PDF
                </button>
                <button
                  onClick={() => setSelectedReceipt(null)}
                  className={styles.actionButton}
                  style={{ backgroundColor: '#6b7280' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Receipt;