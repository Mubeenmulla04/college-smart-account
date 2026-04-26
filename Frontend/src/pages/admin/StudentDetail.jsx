import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { studentsAPI, feeReceiptsAPI } from '../../services';
import styles from '../../styles/AdminStudentDetail.module.css';
import { 
  User, Mail, Phone, MapPin, Building2, 
  CalendarDays, ShieldCheck, IndianRupee, 
  FileText, History, Trash2, ArrowLeft,
  GraduationCap, Clock, CheckCircle, AlertCircle,
  Hash
} from 'lucide-react';

const InfoItem = ({ icon: Icon, label, value, color }) => (
  <div className={styles.infoItem}>
    <div className={`${styles.infoIcon} ${color ? styles[color] : ''}`}>
      <Icon size={18} strokeWidth={2} />
    </div>
    <div className={styles.infoContent}>
      <span className={styles.infoLabel}>{label}</span>
      <span className={styles.infoValue}>{value ?? '—'}</span>
    </div>
  </div>
);

const AdminStudentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [studentRes, receiptsRes] = await Promise.allSettled([
        studentsAPI.getById(id),
        feeReceiptsAPI.getByStudentId(id)
      ]);

      if (studentRes.status === 'fulfilled') {
        setStudent(studentRes.value.data);
      } else {
        throw new Error('Student not found');
      }

      if (receiptsRes.status === 'fulfilled') {
        const data = receiptsRes.value.data;
        setReceipts(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching student detail:', err);
      setError('Failed to load student details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to remove ${student?.name}? This action cannot be undone.`)) {
      try {
        await studentsAPI.delete(id);
        navigate('/admin/students');
      } catch (err) {
        console.error('Error deleting student:', err);
        alert('Failed to remove student.');
      }
    }
  };

  if (loading) return (
    <div className={styles.loaderContainer}>
      <div className={styles.loader}></div>
      <p>Fetching Student Profile...</p>
    </div>
  );

  if (error || !student) return (
    <div className={styles.errorState}>
      <AlertCircle size={48} className={styles.errorIcon} />
      <h2>Student Not Found</h2>
      <p>{error || 'The student record you are looking for does not exist or has been removed.'}</p>
      <button onClick={() => navigate('/admin/students')} className={styles.backBtn}>
        <ArrowLeft size={16} /> Back to Students
      </button>
    </div>
  );

  const feesTotal = student.fees?.total || 0;
  const feesPaid = student.fees?.paid || 0;
  const feesPending = student.fees?.pending || 0;
  const feesPct = feesTotal > 0 ? Math.round((feesPaid / feesTotal) * 100) : 0;
  const scholarship = student.scholarship || {};
  const schStatus = scholarship.status || 'Not Applied';

  return (
    <div className={styles.dashboardPage}>
      <div className={styles.pageContent}>
        
        {/* Top Header / Actions */}
        <div className={styles.pageHeader}>
          <button onClick={() => navigate(-1)} className={styles.simpleBack}>
            <ArrowLeft size={18} /> Back
          </button>
          <div className={styles.headerActions}>
            <button onClick={handleDelete} className={styles.actionBtnDelete}>
              <Trash2 size={16} /> Remove Record
            </button>
            <Link to="/admin/fee-receipt" className={styles.actionBtnPrimary}>
              <IndianRupee size={16} /> Generate Receipt
            </Link>
          </div>
        </div>

        {/* Profile Snapshot */}
        <div className={styles.profileHero}>
          <div className={styles.heroLeft}>
            <div className={styles.heroAvatar}>
              {student.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className={styles.heroInfo}>
              <h1>{student.name}</h1>
              <div className={styles.heroMeta}>
                <span><Mail size={14} /> {student.email}</span>
                <span><Hash size={14} /> PRN: {student.studentId}</span>
              </div>
              <div className={styles.heroBadges}>
                <span className={styles.heroBadge}>{student.department}</span>
                <span className={styles.heroBadge}>Year {student.year}</span>
                <span className={`${styles.heroBadge} ${student.isVerified ? styles.verified : styles.unverified}`}>
                  {student.isVerified ? <CheckCircle size={12} /> : <Clock size={12} />}
                  {student.isVerified ? 'Verified' : 'Pending Verification'}
                </span>
              </div>
            </div>
          </div>
          
          <div className={styles.heroStats}>
            <div className={styles.heroStatCard}>
              <span className={styles.heroStatLabel}>Pending Balance</span>
              <span className={`${styles.heroStatValue} ${feesPending > 0 ? styles.textRed : ''}`}>
                ₹{feesPending.toLocaleString()}
              </span>
            </div>
            <div className={styles.heroStatCard}>
              <span className={styles.heroStatLabel}>Payment Progress</span>
              <span className={styles.heroStatValue}>{feesPct}%</span>
              <div className={styles.miniProgress}>
                <div className={styles.miniFill} style={{ width: `${feesPct}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className={styles.tabNav}>
          <button onClick={() => setActiveTab('overview')} className={`${styles.tabBtn} ${activeTab === 'overview' ? styles.tabActive : ''}`}>
            <User size={16} /> Profile Details
          </button>
          <button onClick={() => setActiveTab('fees')} className={`${styles.tabBtn} ${activeTab === 'fees' ? styles.tabActive : ''}`}>
            <IndianRupee size={16} /> Fee Status
          </button>
          <button onClick={() => setActiveTab('scholarship')} className={`${styles.tabBtn} ${activeTab === 'scholarship' ? styles.tabActive : ''}`}>
            <GraduationCap size={16} /> Scholarship
          </button>
          <button onClick={() => setActiveTab('receipts')} className={`${styles.tabBtn} ${activeTab === 'receipts' ? styles.tabActive : ''}`}>
            <FileText size={16} /> History
          </button>
        </div>

        {/* Main Content Area */}
        <div className={styles.tabContent}>
          
          {activeTab === 'overview' && (
            <div className={styles.detailsGrid}>
              <div className={styles.detailCard}>
                <h3>Personal Information</h3>
                <div className={styles.infoList}>
                  <InfoItem icon={User} label="Full Name" value={student.name} />
                  <InfoItem icon={Mail} label="Email Address" value={student.email} />
                  <InfoItem icon={Phone} label="Contact Number" value={student.phone} />
                  <InfoItem icon={MapPin} label="Permanent Address" value={student.address} />
                  <InfoItem icon={Clock} label="Account Created" value={student.createdAt ? new Date(student.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' }) : 'N/A'} />
                </div>
              </div>
              <div className={styles.detailCard}>
                <h3>Academic Context</h3>
                <div className={styles.infoList}>
                  <InfoItem icon={Building2} label="Department" value={student.department} color="blue" />
                  <InfoItem icon={CalendarDays} label="Current Academic Year" value={`${student.year}${student.year === 1 ? 'st' : student.year === 2 ? 'nd' : student.year === 3 ? 'rd' : 'th'} Year`} color="blue" />
                  <InfoItem icon={FileText} label="Enrollment ID / PRN" value={student.studentId} color="blue" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'fees' && (
            <div className={styles.feeLayout}>
              <div className={styles.feeOverviewCard}>
                <h3>Financial Standing</h3>
                <div className={styles.mainProgressContainer}>
                  <div className={styles.progressText}>
                    <span>Fees Reconciliation</span>
                    <span>{feesPct}% Completed</span>
                  </div>
                  <div className={styles.fullProgressBar}>
                    <div className={styles.fullProgressFill} style={{ width: `${feesPct}%` }} />
                  </div>
                </div>
                <div className={styles.feeStatsGrid}>
                  <div className={styles.feeStatBox}>
                    <span className={styles.statLabel}>Payable Amount</span>
                    <span className={styles.statValue}>₹{feesTotal.toLocaleString()}</span>
                  </div>
                  <div className={styles.feeStatBox}>
                    <span className={styles.statLabel}>Recovered</span>
                    <span className={`${styles.statValue} ${styles.textGreen}`}>₹{feesPaid.toLocaleString()}</span>
                  </div>
                  <div className={styles.feeStatBox}>
                    <span className={styles.statLabel}>Outstanding</span>
                    <span className={`${styles.statValue} ${styles.textRed}`}>₹{feesPending.toLocaleString()}</span>
                  </div>
                  <div className={styles.feeStatBox}>
                    <span className={styles.statLabel}>Last Transaction</span>
                    <span className={styles.statValue}>
                      {student.fees?.lastPayment ? new Date(student.fees.lastPayment).toLocaleDateString('en-IN') : 'None'}
                    </span>
                  </div>
                </div>
              </div>
              
              {student.fees?.paymentHistory?.length > 0 && (
                <div className={styles.historySection}>
                  <div className={styles.historyHeaderRow}>
                    <History size={18} />
                    <h3>Internal Payment Logs</h3>
                  </div>
                  <div className={styles.sleekTable}>
                    <table>
                      <thead>
                        <tr>
                          <th>Transaction Date</th>
                          <th>Amount Recovered</th>
                          <th>Payment Method</th>
                          <th>Reference ID</th>
                        </tr>
                      </thead>
                      <tbody>
                        {student.fees.paymentHistory.map((p, i) => (
                          <tr key={i}>
                            <td>{p.date ? new Date(p.date).toLocaleDateString('en-IN') : '—'}</td>
                            <td className={styles.textGreen}>+₹{(p.amount || 0).toLocaleString()}</td>
                            <td>{p.method}</td>
                            <td className={styles.mono}>{p.receiptId}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'scholarship' && (
            <div className={styles.scholarshipCard}>
              <div className={styles.schHeader}>
                <div className={styles.schTitle}>
                  <GraduationCap size={24} />
                  <h3>Scholarship Assessment</h3>
                </div>
                <span className={`${styles.schStatus} ${styles[`status${schStatus.replace(/\s+/g, '')}`]}`}>
                  {schStatus}
                </span>
              </div>
              <div className={styles.schGrid}>
                <InfoItem icon={CheckCircle} label="Eligibility" value={scholarship.eligible ? 'Qualified' : 'Not Qualified'} />
                <InfoItem icon={FileText} label="Application Status" value={scholarship.applied ? 'Submitted' : 'Not Submitted'} />
                <InfoItem icon={IndianRupee} label="Approved Amount" value={`₹${(scholarship.amount || 0).toLocaleString()}`} />
                <InfoItem icon={CalendarDays} label="Application Date" value={scholarship.applicationDate ? new Date(scholarship.applicationDate).toLocaleDateString('en-IN') : 'N/A'} />
              </div>
            </div>
          )}

          {activeTab === 'receipts' && (
            <div className={styles.receiptsSection}>
              <div className={styles.sectionHeading}>
                <FileText size={20} />
                <h3>Generated Fee Receipts</h3>
              </div>
              {receipts.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>No formal receipts have been generated yet for this account.</p>
                  <Link to="/admin/fee-receipt" className={styles.actionBtnPrimary}>Generate First Receipt</Link>
                </div>
              ) : (
                <div className={styles.sleekTable}>
                  <table>
                    <thead>
                      <tr>
                        <th>Receipt No.</th>
                        <th>Issued Date</th>
                        <th>Amount</th>
                        <th>Channel</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {receipts.map((r, i) => (
                        <tr key={r._id || i}>
                          <td className={styles.mono}>{r.receiptNumber || r._id?.slice(-8)}</td>
                          <td>{r.date ? new Date(r.date).toLocaleDateString('en-IN') : '—'}</td>
                          <td className={styles.textBlue}>₹{(r.amount || 0).toLocaleString()}</td>
                          <td>{r.paymentMethod}</td>
                          <td><span className={styles.successBadge}>{r.status || 'Paid'}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminStudentDetail;
