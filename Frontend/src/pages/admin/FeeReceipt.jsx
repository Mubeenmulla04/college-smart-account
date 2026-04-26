import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentsAPI } from '../../services';
import html2pdf from 'html2pdf.js';
import { Input, Button } from '../../components/auth';
import { 
  Printer, Download, ArrowLeft, Search, 
  FileText, User, CreditCard, History,
  CheckCircle, Loader2, Sparkles, GraduationCap
} from 'lucide-react';
import styles from './FeeReceipt.module.css';

const FeeReceipt = () => {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
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

  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    setReceiptData({
      ...student,
      receiptNumber: `REC-${Date.now().toString().slice(-8)}`,
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    });
    setShowReceipt(false);
  };

  const generateReceipt = async () => {
    if (!selectedStudent) return;
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      setShowReceipt(true);
    } catch (error) {
      console.error('Error generating receipt:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.studentId || '').toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 5);

  const printReceipt = () => {
    const originalTitle = document.title;
    document.title = `Fee_Receipt_${receiptData.name.replace(/\s+/g, '_')}`;
    window.print();
    document.title = originalTitle;
  };

  const downloadReceipt = () => {
    const element = document.getElementById('receipt-content');
    const opt = {
      margin: 10,
      filename: `Receipt_${receiptData.studentId || 'N_A'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 3, // Increased scale for ultra-sharp output
        useCORS: true,
        letterRendering: true,
        scrollX: 0,
        scrollY: 0,
        windowWidth: 1400,
        width: element.offsetWidth + 20
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all'] }
    };
    html2pdf().set(opt).from(element).save();
  };

  if (loadingStudents) return (
    <div className={styles.loadingScreen}>
      <Loader2 className={styles.spinner} />
      <p>Loading Students...</p>
    </div>
  );

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        
        {/* Back Navigation */}
        <button onClick={() => navigate(-1)} className={styles.backLink}>
          <ArrowLeft size={16} /> Back
        </button>

        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>
              <FileText size={28} />
            </div>
            <div>
              <h1 className={styles.title}>Fee Receipt Generator</h1>
              <p className={styles.subtitle}>Issue professional receipts and manage payment records</p>
            </div>
          </div>
        </header>

        <div className={styles.layout}>
          
          {/* Left Panel: Selection */}
          <aside className={styles.panelLeft}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <Search size={18} />
                <h2>Find Student</h2>
              </div>
              
              <div className={styles.searchBox}>
                <Input 
                  placeholder="Search by Name or PRN..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    if (selectedStudent) setSelectedStudent(null);
                  }}
                  icon={Search}
                  full
                />
                
                {searchTerm && !selectedStudent && (
                  <div className={styles.searchResults}>
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map(s => (
                        <button key={s.id} onClick={() => handleStudentSelect(s)} className={styles.searchItem}>
                          <div className={styles.itemInfo}>
                            <span className={styles.itemName}>{s.name}</span>
                            <span className={styles.itemMeta}>{s.studentId} • {s.department}</span>
                          </div>
                          <CheckCircle size={16} className={styles.selectIcon} />
                        </button>
                      ))
                    ) : (
                      <div className={styles.noResults}>No students found</div>
                    )}
                  </div>
                )}
              </div>

              {selectedStudent && (
                <div className={styles.selectedStudent}>
                  <div className={styles.studentBrief}>
                    <div className={styles.avatar}>
                      {selectedStudent.name.charAt(0)}
                    </div>
                    <div>
                      <h3>{selectedStudent.name}</h3>
                      <p>{selectedStudent.studentId} • {selectedStudent.department}</p>
                    </div>
                  </div>
                  
                  <div className={styles.feeBrief}>
                    <div className={styles.feeItem}>
                      <span>Total Fees</span>
                      <strong>₹{selectedStudent.fees?.total?.toLocaleString()}</strong>
                    </div>
                    <div className={styles.feeItem}>
                      <span>Paid</span>
                      <strong className={styles.green}>₹{selectedStudent.fees?.paid?.toLocaleString()}</strong>
                    </div>
                    <div className={styles.feeItem}>
                      <span>Pending</span>
                      <strong className={styles.red}>₹{selectedStudent.fees?.pending?.toLocaleString()}</strong>
                    </div>
                  </div>

                  <Button 
                    variant="primary" full 
                    onClick={generateReceipt}
                    loading={isLoading}
                    loadingText="Processing..."
                  >
                    Generate Preview <Sparkles size={16} style={{marginLeft: '8px'}} />
                  </Button>
                </div>
              )}
            </div>

            <div className={styles.helpCard}>
              <Info size={18} />
              <p>Receipts are generated based on the current payment records in the database.</p>
            </div>
          </aside>

          {/* Right Panel: Preview */}
          <main className={styles.panelRight}>
            {showReceipt && receiptData ? (
              <div className={styles.previewCard}>
                <div className={styles.previewActions}>
                  <h2>Receipt Preview</h2>
                  <div className={styles.actionBtns}>
                    <Button variant="secondary" onClick={printReceipt} className={styles.actionBtn}>
                      <Printer size={18} /> Print
                    </Button>
                    <Button variant="primary" onClick={downloadReceipt} className={styles.actionBtn}>
                      <Download size={18} /> Download PDF
                    </Button>
                  </div>
                </div>

                <div id="receipt-download-container" className={styles.receiptContainer}>
                  <div id="receipt-content" className={styles.receiptPaper}>
                  <div className={styles.receiptDocHeader}>
                    <div className={styles.docLogo}>
                      <GraduationCap size={40} />
                    </div>
                    <div className={styles.docHeaderText}>
                      <h1 className={styles.docTitle}>ACADEMIC FEE RECEIPT</h1>
                      <p className={styles.docSubtitle}>Bharat Ratna Indira Gandhi College of Engineering, Solapur</p>
                      <p className={styles.docAddress}>Kegaon, Solapur - 413255, Maharashtra, India</p>
                    </div>
                  </div>

                  <div className={styles.docMetaGrid}>
                    <div className={styles.docMetaBox}>
                      <span className={styles.docMetaLabel}>Receipt Number</span>
                      <span className={styles.docMetaValue}>#{receiptData.receiptNumber}</span>
                    </div>
                    <div className={styles.docMetaBox}>
                      <span className={styles.docMetaLabel}>Date & Time</span>
                      <span className={styles.docMetaValue}>{receiptData.date} • {receiptData.time}</span>
                    </div>
                    <div className={styles.docMetaBox}>
                      <span className={styles.docMetaLabel}>Payment Status</span>
                      <span className={`${styles.docStatusBadge} ${receiptData.fees?.pending === 0 ? styles.statusPaid : styles.statusPending}`}>
                        {receiptData.fees?.pending === 0 ? 'Fully Paid' : 'Partial Payment'}
                      </span>
                    </div>
                  </div>

                  <div className={styles.docSection}>
                    <h3 className={styles.docSectionTitle}>Student Information</h3>
                    <div className={styles.docInfoGrid}>
                      <div className={styles.docInfoItem}>
                        <span className={styles.docLabel}>Full Name</span>
                        <span className={styles.docValue}>{receiptData.name}</span>
                      </div>
                      <div className={styles.docInfoItem}>
                        <span className={styles.docLabel}>PRN (Student ID)</span>
                        <span className={styles.docValue}>{receiptData.studentId}</span>
                      </div>
                      <div className={styles.docInfoItem}>
                        <span className={styles.docLabel}>Department</span>
                        <span className={styles.docValue}>{receiptData.department}</span>
                      </div>
                      <div className={styles.docInfoItem}>
                        <span className={styles.docLabel}>Academic Year</span>
                        <span className={styles.docValue}>{receiptData.year} Year</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.docSection}>
                    <h3 className={styles.docSectionTitle}>Financial Summary</h3>
                    <div className={styles.docFeeTable}>
                      <div className={styles.feeRow}>
                        <span>Annual Tuition Fees</span>
                        <span>₹{(receiptData.fees?.total || 0).toLocaleString()}</span>
                      </div>
                      <div className={styles.feeRow}>
                        <span>Scholarship / Adjustments</span>
                        <span>- ₹0</span>
                      </div>
                      <div className={styles.feeRow}>
                        <span>Amount Previously Paid</span>
                        <span>₹{(receiptData.fees?.paid || 0).toLocaleString()}</span>
                      </div>
                      <div className={`${styles.feeRow} ${styles.feeTotal}`}>
                        <span>Total Settled Amount</span>
                        <span>₹{(receiptData.fees?.paid || 0).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className={styles.balanceNote}>
                      <span>Remaining Balance:</span>
                      <strong className={styles.red}>₹{(receiptData.fees?.pending || 0).toLocaleString()}</strong>
                    </div>
                  </div>

                  <div className={styles.docFooter}>
                    <div className={styles.signatureArea}>
                      <div className={styles.signatureLine}></div>
                      <span>Authorized Signatory</span>
                    </div>
                    <div className={styles.docNotice}>
                      <p>This is a computer-generated electronic receipt. No physical signature is required for validity.</p>
                      <p>Issued by: College Management System • {new Date().getFullYear()}</p>
                    </div>
                    </div>
                </div>
                </div>
              </div>
            ) : (
              <div className={styles.emptyPreview}>
                <div className={styles.emptyIcon}>
                  <FileText size={48} />
                </div>
                <h3>No Preview Available</h3>
                <p>Select a student and click "Generate Preview" to see the receipt here.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

const Info = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
  </svg>
);

export default FeeReceipt;