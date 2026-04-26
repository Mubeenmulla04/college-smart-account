import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { dashboardAPI, feeReceiptsAPI, studentsAPI } from '../../services';
import styles from '../../styles/Dashboard.module.css';

const FeePayment = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [studentData, setStudentData] = useState(null);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    paymentMethod: 'online',
    description: 'Fee Payment'
  });
  const [receiptData, setReceiptData] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStudent, setLoadingStudent] = useState(true);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoadingStudent(true);
        const data = await dashboardAPI.getStudentStats(user?.email);
        setStudentData(data);
        
        // Fetch receipt data after getting student data to use the correct student ID
        if (data?.id) {
          // Prefer the custom studentId field (e.g. STU1234), fall back to MongoDB _id
          const studentId = data.studentId || data.id;
          console.log("Fetching receipts for studentId:", studentId, "from student data:", data);
          const data2 = await dashboardAPI.getFeesReceiptByStudentId(studentId);
          setReceiptData(data2);
          
          // Set suggested amount to pending fees
          if (data?.fees?.pending > 0) {
            const remainingPending = data2 ? (data.fees.pending - data2.amount) : data.fees.pending;
            setPaymentData(prev => ({
              ...prev,
              amount: Math.max(0, remainingPending) // Ensure amount is not negative
            }));
          }
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
    setPaymentData(prev => ({
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

    if (!paymentData.amount || parseFloat(paymentData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }

    if (parseFloat(paymentData.amount) > studentData?.fees?.pending) {
      newErrors.amount = 'Amount cannot exceed pending fees';
    }

    if (!paymentData.paymentMethod) {
      newErrors.paymentMethod = 'Please select a payment method';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!studentData?.id) {
      setErrors({ general: 'Student data is invalid. Please refresh the page and try again.' });
      return;
    }

    setIsLoading(true);

    try {
      const amount = parseFloat(paymentData.amount);
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      const rand = (n) => Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
      const receiptNumber = `RCP-${rand(4)}-${rand(3)}`; // e.g. RCP-K7X2-3A9
      const paymentDate = new Date().toISOString().split('T')[0];

      // Create fee receipt
      const receiptData2 = {
        studentId: studentData.studentId || studentData.id,  // Use custom STUxxxx ID, fallback to _id
        studentName: studentData.name,
        amount: amount, // Store just the current payment amount
        date: paymentDate, // Backend expects 'date', not 'paymentDate'
        paymentMethod: paymentData.paymentMethod,
        description: paymentData.description,
        receiptNumber: receiptNumber,
        status: 'Completed'
      };

      // Always create a receipt when a payment is made
      console.log('Creating receipt with data:', receiptData2);
      
      // Validate student ID before creating receipt
      const studentIdToUse = studentData.studentId || studentData.id;
      if (!studentIdToUse) {
        console.error('Cannot create receipt - no valid student ID found');
        setErrors({ general: 'Unable to create receipt - student ID not found. Please contact support.' });
        return;
      }
      
      // Update receipt data with validated student ID
      receiptData2.studentId = studentIdToUse;
      
      try {
        const createdReceipt = await feeReceiptsAPI.create(receiptData2);
        console.log('Receipt created successfully:', createdReceipt);
      } catch (receiptError) {
        console.error('Error creating receipt:', receiptError);
        // Don't fail the entire payment if receipt creation fails, but log the error
        setErrors({ general: 'Payment processed but receipt creation failed. Please contact support.' });
        // Still proceed with updating student data since payment was successful
      }
      

      // Update student's fee information
      const updatedFees = {
        ...studentData.fees,
        paid: studentData.fees.paid + amount,
        pending: studentData.fees.pending - amount,
        lastPayment: paymentDate,
        paymentHistory: [
          ...(studentData.fees.paymentHistory || []),
          {
            id: receiptNumber,
            date: paymentDate,
            amount: amount,
            method: paymentData.paymentMethod,
            receiptNumber: receiptNumber,
            status: 'Completed'
          }
        ]
      };

      const updateResult = await studentsAPI.updateFees(studentData.id, updatedFees);
      
      if (updateResult && updateResult.success === false) {
        throw new Error(updateResult.error || 'Failed to update student data');
      }



      setPaymentSuccess(true);
      window.scrollTo(0, 0); // Scroll to top to show success message
      
      // Update local state
      setStudentData(prev => ({
        ...prev,
        fees: updatedFees
      }));
      
      // Update receipt data to reflect the new total amount paid
      setReceiptData({
        amount: updatedFees.paid,
        count: receiptData?.count ? receiptData.count + 1 : 1
      });

    } catch (error) {
      console.error('Error processing payment:', error);
      setErrors({ general: 'Failed to process payment. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingStudent) {
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

  if (paymentSuccess) {
    return (
      <div className={styles.dashboardContainer}>
        <div className={styles.dashboardContent}>
          <div className={styles.statCard}>
            <div className={styles.statCardContent}>
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{ 
                  width: '4rem', 
                  height: '4rem', 
                  backgroundColor: '#dcfce7', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  margin: '0 auto 1rem' 
                }}>
                  <svg style={{ width: '2rem', height: '2rem', color: '#16a34a' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem' }}>
                  Payment Successful!
                </h2>
                <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
                  Your fee payment of ₹{paymentData.amount} has been processed successfully.
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                  <button 
                    onClick={() => {
                      navigate('/student/dashboard', { replace: true });
                    }}
                    className={styles.actionButton}
                  >
                    Back to Dashboard
                  </button>
                  <button 
                    onClick={() => navigate('/student/receipt')}
                    className={styles.actionButton}
                  >
                    Download Receipt
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.dashboardContent}>
        <div className={styles.dashboardHeader}>
          <h1 className={styles.dashboardTitle}>Fee Payment</h1>
          <p className={styles.dashboardSubtitle}>Pay your college fees online</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
          {/* Fee Summary */}
          <div className={styles.statCard}>
            <div className={styles.statCardContent}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1e293b', marginBottom: '1.5rem' }}>
                Fee Summary
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b' }}>Total Fees</span>
                  <span style={{ fontWeight: '600', color: '#1e293b' }}>₹{studentData.fees.total.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b' }}>Amount Paid</span>
                  <span style={{ fontWeight: '600', color: '#16a34a' }}>₹{studentData.fees.paid.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                  <span style={{ color: '#64748b', fontWeight: '600' }}>Pending Amount</span>
                  <span style={{ fontWeight: '700', color: '#dc2626', fontSize: '1.125rem' }}>₹{studentData.fees.pending.toLocaleString()}</span>
                </div>
              </div>

              {studentData?.fees?.pending === 0 && (
                <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#dcfce7', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                  <p style={{ color: '#166534', textAlign: 'center', fontWeight: '600' }}>
                    🎉 All fees have been paid!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Form */}
          <div className={styles.statCard}>
            <div className={styles.statCardContent}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1e293b', marginBottom: '1.5rem' }}>
                Make Payment
              </h3>

              {studentData?.fees?.pending === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <p style={{ color: '#64748b' }}>No pending fees to pay.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                      Payment Amount (₹) *
                    </label>
                    <input
                      type="number"
                      name="amount"
                      value={paymentData.amount}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: errors.amount ? '1px solid #dc2626' : '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem'
                      }}
                      placeholder="Enter amount to pay"
                      min="1"
                      max={studentData?.fees?.pending || 0}
                    />
                    {errors.amount && (
                      <p style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.amount}</p>
                    )}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                      Payment Method *
                    </label>
                    <select
                      name="paymentMethod"
                      value={paymentData.paymentMethod}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: errors.paymentMethod ? '1px solid #dc2626' : '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem'
                      }}
                    >
                      <option value="online">Online Payment</option>
                      <option value="upi">UPI</option>
                      <option value="netbanking">Net Banking</option>
                      <option value="card">Credit/Debit Card</option>
                    </select>
                    {errors.paymentMethod && (
                      <p style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.paymentMethod}</p>
                    )}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                      Description
                    </label>
                    <input
                      type="text"
                      name="description"
                      value={paymentData.description}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem'
                      }}
                      placeholder="Payment description"
                    />
                  </div>

                  {errors.general && (
                    <div style={{ padding: '0.75rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.375rem' }}>
                      <p style={{ color: '#dc2626', fontSize: '0.875rem' }}>{errors.general}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1.5rem',
                      backgroundColor: isLoading ? '#9ca3af' : '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    {isLoading ? 'Processing Payment...' : `Pay ₹${paymentData.amount || '0'}`}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeePayment;