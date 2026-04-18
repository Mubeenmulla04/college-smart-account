import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentsAPI } from '../../services';
import html2pdf from 'html2pdf.js';
import receipt from './FeeReceipt.module.css';

const FeeReceipt = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [receiptData, setReceiptData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoadingStudents(true);
        const response = await studentsAPI.getAll();
        setStudents(response.data || []);
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setLoadingStudents(false);
      }
    };

    fetchStudents();
  }, []);

  const handleStudentSelect = (studentId) => {
    setSelectedStudent(studentId);
    const student = students.find(s => s.id === studentId);
    if (student) {
      setReceiptData({
        ...student,
        receiptNumber: `REC${Date.now()}`,
        date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      });
    }
  };

  const generateReceipt = async () => {
    if (!selectedStudent) return;

    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowReceipt(true);
    } catch (error) {
      console.error('Error generating receipt:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const receiptStyles = `
    body {
      font-family: 'Inter', sans-serif;
      margin: 40px;
      color: #111827;
      line-height: 1.6;
      background: #ffffff;
      font-size: 10pt;
    }
    .receiptContainer {
      max-width: 800px;
      margin: 0 auto;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 2rem;
      background: #ffffff;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }
    .receiptHeader {
      text-align: center;
      margin-bottom: 2rem;
      padding-bottom: 1.5rem;
      border-bottom: 3px solid #2dd4bf;
      position: relative;
      background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
    }
    .receiptHeader::before {
      content: '';
      position: absolute;
      top: -30px;
      left: 50%;
      transform: translateX(-50%);
      width: 80px;
      height: 80px;
      background: url('https://via.placeholder.com/80?text=Logo') no-repeat center;
      background-size: contain;
    }
    .receiptTitle {
      font-size: 1.75rem;
      font-weight: 800;
      color: #111827;
      margin: 0;
    }
    .receiptSubtitle {
      font-size: 0.875rem;
      color: #6b7280;
      margin-top: 0.5rem;
      font-weight: 400;
    }
    .receiptDetails {
      margin-bottom: 1.5rem;
      font-size: 0.875rem;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
      background: #f8fafc;
      padding: 1rem;
      border-radius: 8px;
    }
    .detailRow {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
    }
    .detailLabel {
      font-weight: 500;
      color: #374151;
    }
    .section {
      margin-bottom: 2rem;
      padding-top: 1rem;
      border-top: 1px solid #e5e7eb;
    }
    .sectionTitle {
      font-size: 1rem;
      font-weight: 600;
      color: #111827;
      margin-bottom: 0.75rem;
      position: relative;
    }
    .sectionTitle::after {
      content: '';
      position: absolute;
      bottom: -4px;
      left: 0;
      width: 50px;
      height: 2px;
      background: linear-gradient(90deg, #2dd4bf, #fb7185);
    }
    .studentInfo {
      font-size: 0.875rem;
      color: #4b5563;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
      padding: 1rem;
      background: #f8fafc;
      border-radius: 8px;
    }
    .feeBreakdown {
      font-size: 0.875rem;
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 0.75rem;
      background: #f8fafc;
      padding: 1rem;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
    }
    .total {
      font-weight: 600;
      font-size: 1rem;
      border-top: 2px solid #2dd4bf;
      padding-top: 1rem;
      background: linear-gradient(90deg, #2dd4bf10, #fb718510);
      padding: 1rem;
      border-radius: 8px;
      display: flex;
      justify-content: space-between;
    }
    .paymentHistory {
      font-size: 0.875rem;
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 0.75rem;
      padding: 1rem;
      background: #f8fafc;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
    }
    .paymentItem {
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 0.75rem;
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 0.5rem;
    }
    .noHistory {
      color: #6b7280;
      font-style: italic;
      text-align: center;
      padding: 1rem;
    }
    .receiptFooter {
      text-align: center;
      margin-top: 2.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid #e5e7eb;
      font-size: 0.75rem;
      color: #6b7280;
      font-style: italic;
    }
    @media print {
      body { margin: 0; }
      .receiptContainer { box-shadow: none; border: none; }
      .noPrint { display: none; }
    }
  `;

  const printReceipt = () => {
    const printWindow = window.open('', '_blank');
    const receiptContent = document.getElementById('receipt-content').innerHTML;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Fee Receipt</title>
          <style>
            ${receiptStyles}
          </style>
        </head>
        <body>
          <div class="receiptContainer">
            ${receiptContent}
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const downloadReceipt = () => {
    const element = document.getElementById('receipt-content');
    const opt = {
      margin: 40,
      filename: `fee-receipt-${receiptData?.receiptNumber}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'px', format: 'a4', orientation: 'portrait' }
    };

    // Wrap content in a container with styles for PDF
    const pdfContent = `
      <div style="max-width: 800px; margin: 40px auto; padding: 2rem; border: 1px solid #e5e7eb; border-radius: 12px; background: #ffffff; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
        ${element.innerHTML}
      </div>
    `;

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = `
      <style>${receiptStyles}</style>
      ${pdfContent}
    `;
    document.body.appendChild(tempDiv);

    html2pdf().from(tempDiv).set(opt).save().then(() => {
      document.body.removeChild(tempDiv);
    });
  };

  if (loadingStudents) {
    return (
      <div className={receipt.receiptLoadingContainer}>
        <div className={receipt.receiptLoadingSpinner}>
          <div className={receipt.receiptSpinnerInner}></div>
        </div>
        <p className={receipt.receiptLoadingText}>Loading students...</p>
      </div>
    );
  }

  return (
    <div className={receipt.receiptMainContainer}>
      <div className={receipt.receiptContentWrapper}>
        <div className={receipt.receiptHeaderSection}>
          <div className={receipt.receiptHeaderContent}>
            <div>
              <h1 className={receipt.receiptHeaderTitle}>Generate Fee Receipt</h1>
              <p className={receipt.receiptHeaderSubtitle}>Create and manage student fee receipts with ease</p>
            </div>
            <button
              onClick={() => navigate('/admin/dashboard')}
              className={receipt.receiptBackButton}
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        <div className={receipt.receiptGridLayout}>
          {/* Student Selection */}
          <div className={receipt.receiptSelectionCard}>
            <h2 className={receipt.receiptCardTitle}>Select Student</h2>
            <div className={receipt.receiptSelectGroup}>
              <label className={receipt.receiptSelectLabel}>Choose Student</label>
              <select
                value={selectedStudent}
                onChange={(e) => handleStudentSelect(e.target.value)}
                className={receipt.receiptSelectInput}
              >
                <option value="">Select a student...</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name} - {student.studentId || student.id} ({student.department})
                  </option>
                ))}
              </select>
            </div>

            {selectedStudent && receiptData && (
              <div className={receipt.receiptInfoCard}>
                <h3 className={receipt.receiptInfoTitle}>Student Details</h3>
                <div className={receipt.receiptInfoDetails}>
                  <p><span className={receipt.receiptInfoLabel}>Name:</span> {receiptData.name}</p>
                  <p><span className={receipt.receiptInfoLabel}>ID:</span> {receiptData.studentId || receiptData.id}</p>
                  <p><span className={receipt.receiptInfoLabel}>Department:</span> {receiptData.department}</p>
                  <p><span className={receipt.receiptInfoLabel}>Year:</span> {receiptData.year}</p>
                  <p><span className={receipt.receiptInfoLabel}>Total Fees:</span> ₹{receiptData.fees?.total?.toLocaleString('en-IN')}</p>
                  <p><span className={receipt.receiptInfoLabel}>Paid:</span> ₹{receiptData.fees?.paid?.toLocaleString('en-IN')}</p>
                  <p><span className={receipt.receiptInfoLabel}>Pending:</span> ₹{receiptData.fees?.pending?.toLocaleString('en-IN')}</p>
                </div>
              </div>
            )}

            <button
              onClick={generateReceipt}
              disabled={!selectedStudent || isLoading}
              className={`${receipt.receiptGenerateButton} ${!selectedStudent || isLoading ? receipt.receiptButtonDisabled : ''}`}
            >
              {isLoading ? (
                <span className={receipt.receiptButtonLoading}>
                  Generating...
                  <span className={receipt.receiptButtonSpinner}></span>
                </span>
              ) : (
                'Generate Receipt'
              )}
            </button>
          </div>

          {/* Receipt Preview */}
          {showReceipt && receiptData && (
            <div className={receipt.receiptPreviewCard}>
              <div className={receipt.receiptPreviewHeader}>
                <h2 className={receipt.receiptCardTitle}>Receipt Preview</h2>
                <div className={receipt.receiptActionButtons}>
                  <button
                    onClick={printReceipt}
                    className={receipt.receiptPrintButton}
                  >
                    <span className={receipt.receiptButtonIcon}>🖨️</span> Print
                  </button>
                  <button
                    onClick={downloadReceipt}
                    className={receipt.receiptDownloadButton}
                  >
                    <span className={receipt.receiptButtonIcon}>⬇️</span> Download PDF
                  </button>
                </div>
              </div>

              <div id="receipt-content" className={receipt.receiptContent}>
                <div className={receipt.receiptHeader}>
                  <h1 className={receipt.receiptTitle}>COLLEGE FEE RECEIPT</h1>
                  <p className={receipt.receiptSubtitle}>Bharat Ratna Indira Gandhi College of Engineering</p>
                </div>

                <div className={receipt.receiptDetails}>
                  <div className={receipt.receiptDetailRow}>
                    <span className={receipt.receiptDetailLabel}>Receipt No:</span>
                    <span>{receiptData.receiptNumber}</span>
                  </div>
                  <div className={receipt.receiptDetailRow}>
                    <span className={receipt.receiptDetailLabel}>Date:</span>
                    <span>{receiptData.date}</span>
                  </div>
                  <div className={receipt.receiptDetailRow}>
                    <span className={receipt.receiptDetailLabel}>Time:</span>
                    <span>{receiptData.time}</span>
                  </div>
                </div>

                <div className={receipt.receiptSection}>
                  <div className={receipt.receiptSectionTitle}>Student Information</div>
                  <div className={receipt.receiptStudentInfo}>
                    <p><span className={receipt.receiptInfoLabel}>Name:</span> {receiptData.name}</p>
                    <p><span className={receipt.receiptInfoLabel}>Student ID:</span> {receiptData.studentId || receiptData.id}</p>
                    <p><span className={receipt.receiptInfoLabel}>Department:</span> {receiptData.department}</p>
                    <p><span className={receipt.receiptInfoLabel}>Year:</span> {receiptData.year}</p>
                    <p><span className={receipt.receiptInfoLabel}>Email:</span> {receiptData.email}</p>
                    <p><span className={receipt.receiptInfoLabel}>Phone:</span> {receiptData.phone}</p>
                  </div>
                </div>

                <div className={receipt.receiptSection}>
                  <div className={receipt.receiptSectionTitle}>Fee Breakdown</div>
                  <div className={receipt.receiptFeeBreakdown}>
                    <div className={receipt.receiptDetailRow}>
                      <span>Total Course Fees:</span>
                      <span>₹{receiptData.fees?.total?.toLocaleString('en-IN')}</span>
                    </div>
                    <div className={receipt.receiptDetailRow}>
                      <span>Amount Paid:</span>
                      <span>₹{receiptData.fees?.paid?.toLocaleString('en-IN')}</span>
                    </div>
                    <div className={receipt.receiptDetailRow}>
                      <span>Amount Pending:</span>
                      <span>₹{receiptData.fees?.pending?.toLocaleString('en-IN')}</span>
                    </div>
                    <div className={`${receipt.receiptDetailRow} ${receipt.receiptTotal}`}>
                      <span>Total Amount:</span>
                      <span>₹{receiptData.fees?.total?.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                <div className={receipt.receiptSection}>
                  <div className={receipt.receiptSectionTitle}>Payment History</div>
                  {receiptData.fees?.paymentHistory?.length > 0 ? (
                    <div className={receipt.receiptPaymentHistory}>
                      {receiptData.fees.paymentHistory.map((payment, index) => (
                        <div key={index} className={receipt.receiptPaymentItem}>
                          <p><span className={receipt.receiptInfoLabel}>Date:</span> {payment.date}</p>
                          <p><span className={receipt.receiptInfoLabel}>Amount:</span> ₹{payment.amount?.toLocaleString('en-IN')}</p>
                          <p><span className={receipt.receiptInfoLabel}>Receipt:</span> {payment.receiptNumber}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className={receipt.receiptNoHistory}>No payment history available</p>
                  )}
                </div>

                <div className={receipt.receiptFooter}>
                  <p className={receipt.receiptFooterText}>
                    This is a computer-generated receipt and does not require a signature.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeeReceipt;