import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { studentsAPI, feeReceiptsAPI } from '../../services';
import { 
  User, Mail, Phone, MapPin, Building2, 
  CalendarDays, ShieldCheck, IndianRupee, 
  FileText, History, Trash2, ArrowLeft,
  GraduationCap, Clock, CheckCircle, AlertCircle,
  Hash, SearchX
} from 'lucide-react';

const InfoItem = ({ icon: Icon, label, value, colorClass = "text-gray-500" }) => (
  <div className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white transition-colors">
    <div className={`p-2 rounded-lg bg-white shadow-sm border border-gray-100 flex-shrink-0 ${colorClass}`}>
      <Icon size={18} strokeWidth={2} />
    </div>
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="font-semibold text-gray-900">{value ?? '—'}</p>
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
        alert('Failed to remove student. They might have dependent records.');
      }
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center pt-24">
      <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
      <p className="text-gray-500 font-medium">Fetching Student Profile...</p>
    </div>
  );

  if (error || !student) return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center pt-24 px-4 text-center">
      <div className="w-24 h-24 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-6">
        <AlertCircle size={40} />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Student Not Found</h2>
      <p className="text-gray-500 max-w-md mx-auto mb-8">{error || 'The student record you are looking for does not exist or has been removed.'}</p>
      <button onClick={() => navigate('/admin/students')} className="px-6 py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl transition-colors flex items-center gap-2">
        <ArrowLeft size={18} /> Back to Students
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
    <div className="w-full py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Top Header / Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft size={16} /> Back
          </button>
          <div className="flex items-center gap-3">
            <button onClick={handleDelete} className="px-4 py-2 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 font-medium rounded-xl transition-colors flex items-center gap-2 text-sm shadow-sm">
              <Trash2 size={16} /> <span className="hidden sm:inline">Remove Record</span>
            </button>
            <Link to="/admin/fee-receipt" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors shadow-sm shadow-indigo-200 flex items-center gap-2 text-sm">
              <IndianRupee size={16} /> Generate Receipt
            </Link>
          </div>
        </div>

        {/* Profile Snapshot */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-10"></div>
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 flex-1 z-10">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-500 text-white flex items-center justify-center text-3xl font-bold shadow-lg shadow-indigo-200 flex-shrink-0">
              {student.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{student.name}</h1>
              <div className="flex flex-wrap justify-center sm:justify-start items-center gap-4 text-sm text-gray-600 mb-4 font-medium">
                <span className="flex items-center gap-1.5"><Mail size={16} className="text-gray-400"/> {student.email}</span>
                <span className="flex items-center gap-1.5"><Hash size={16} className="text-gray-400"/> PRN: <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">{student.studentId}</span></span>
              </div>
              <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                <span className="px-3 py-1 bg-blue-50 text-blue-700 font-semibold text-xs rounded-full border border-blue-100">{student.department}</span>
                <span className="px-3 py-1 bg-purple-50 text-purple-700 font-semibold text-xs rounded-full border border-purple-100">Year {student.year}</span>
                <span className={`px-3 py-1 font-semibold text-xs rounded-full border flex items-center gap-1 ${student.isVerified ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                  {student.isVerified ? <CheckCircle size={12} /> : <Clock size={12} />}
                  {student.isVerified ? 'Verified' : 'Pending Verification'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-4 min-w-[240px] z-10">
            <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pending Balance</span>
              </div>
              <span className={`text-2xl font-black ${feesPending > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                ₹{feesPending.toLocaleString()}
              </span>
            </div>
            <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment Progress</span>
                <span className="text-xs font-bold text-gray-900">{feesPct}%</span>
              </div>
              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${feesPct === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`} style={{ width: `${feesPct}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex overflow-x-auto hide-scrollbar bg-white rounded-2xl shadow-sm border border-gray-100 p-1.5 gap-1">
          {[
            { id: 'overview', icon: User, label: 'Profile Details' },
            { id: 'fees', icon: IndianRupee, label: 'Fee Status' },
            { id: 'scholarship', icon: GraduationCap, label: 'Scholarship' },
            { id: 'receipts', icon: FileText, label: 'History' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)} 
              className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-all ${activeTab === tab.id ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
            >
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 min-h-[400px]">
          
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-2">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-100 pb-2"><User size={20} className="text-indigo-600"/> Personal Information</h3>
                <div className="space-y-3">
                  <InfoItem icon={User} label="Full Name" value={student.name} colorClass="text-indigo-600" />
                  <InfoItem icon={Mail} label="Email Address" value={student.email} colorClass="text-indigo-600" />
                  <InfoItem icon={Phone} label="Contact Number" value={student.phone} colorClass="text-indigo-600" />
                  <InfoItem icon={MapPin} label="Permanent Address" value={student.address} colorClass="text-indigo-600" />
                  <InfoItem icon={Clock} label="Account Created" value={student.createdAt ? new Date(student.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' }) : 'N/A'} colorClass="text-indigo-600" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-100 pb-2"><Building2 size={20} className="text-blue-600"/> Academic Context</h3>
                <div className="space-y-3">
                  <InfoItem icon={Building2} label="Department" value={student.department} colorClass="text-blue-600" />
                  <InfoItem icon={CalendarDays} label="Current Academic Year" value={`${student.year}${student.year === 1 ? 'st' : student.year === 2 ? 'nd' : student.year === 3 ? 'rd' : 'th'} Year`} colorClass="text-blue-600" />
                  <InfoItem icon={FileText} label="Enrollment ID / PRN" value={student.studentId} colorClass="text-blue-600" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'fees' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-2">Financial Standing</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-5 bg-gray-50 border border-gray-100 rounded-2xl">
                    <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Payable Amount</span>
                    <span className="text-2xl font-bold text-gray-900">₹{feesTotal.toLocaleString()}</span>
                  </div>
                  <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-2xl">
                    <span className="block text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-2">Recovered</span>
                    <span className="text-2xl font-bold text-emerald-600">₹{feesPaid.toLocaleString()}</span>
                  </div>
                  <div className="p-5 bg-rose-50 border border-rose-100 rounded-2xl">
                    <span className="block text-xs font-semibold text-rose-800 uppercase tracking-wider mb-2">Outstanding</span>
                    <span className="text-2xl font-bold text-rose-600">₹{feesPending.toLocaleString()}</span>
                  </div>
                  <div className="p-5 bg-gray-50 border border-gray-100 rounded-2xl">
                    <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Last Transaction</span>
                    <span className="text-xl font-bold text-gray-900">
                      {student.fees?.lastPayment ? new Date(student.fees.lastPayment).toLocaleDateString('en-IN') : 'None'}
                    </span>
                  </div>
                </div>
              </div>
              
              {student.fees?.paymentHistory?.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-100 pb-2"><History size={20} className="text-indigo-600"/> Internal Payment Logs</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-y border-gray-200 text-gray-500 text-xs uppercase tracking-wider font-semibold">
                          <th className="px-6 py-4">Transaction Date</th>
                          <th className="px-6 py-4">Amount Recovered</th>
                          <th className="px-6 py-4">Payment Method</th>
                          <th className="px-6 py-4">Reference ID</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {student.fees.paymentHistory.map((p, i) => (
                          <tr key={i} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{p.date ? new Date(p.date).toLocaleDateString('en-IN') : '—'}</td>
                            <td className="px-6 py-4 text-sm font-bold text-emerald-600">+₹{(p.amount || 0).toLocaleString()}</td>
                            <td className="px-6 py-4 text-sm text-gray-600 capitalize">{p.method}</td>
                            <td className="px-6 py-4 text-sm font-mono text-gray-500">{p.receiptId}</td>
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
            <div className="animate-in fade-in slide-in-from-bottom-2 max-w-3xl">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
                    <GraduationCap size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Scholarship Assessment</h3>
                    <p className="text-sm text-gray-500">Financial aid status and details.</p>
                  </div>
                </div>
                <span className={`mt-4 sm:mt-0 px-4 py-1.5 rounded-full text-sm font-bold border ${
                  schStatus === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                  schStatus === 'Rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                  (schStatus === 'Under Review' || schStatus === 'Pending') ? 'bg-amber-50 text-amber-700 border-amber-200' :
                  'bg-gray-100 text-gray-600 border-gray-200'
                }`}>
                  {schStatus}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoItem icon={CheckCircle} label="Eligibility" value={scholarship.eligible ? 'Qualified' : 'Not Qualified'} colorClass="text-purple-600" />
                <InfoItem icon={FileText} label="Application Status" value={scholarship.applied ? 'Submitted' : 'Not Submitted'} colorClass="text-purple-600" />
                <InfoItem icon={IndianRupee} label="Approved Amount" value={`₹${(scholarship.amount || 0).toLocaleString()}`} colorClass="text-emerald-600" />
                <InfoItem icon={CalendarDays} label="Application Date" value={scholarship.applicationDate ? new Date(scholarship.applicationDate).toLocaleDateString('en-IN') : 'N/A'} colorClass="text-purple-600" />
              </div>
            </div>
          )}

          {activeTab === 'receipts' && (
            <div className="animate-in fade-in slide-in-from-bottom-2">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-100 pb-2"><FileText size={20} className="text-indigo-600"/> Generated Fee Receipts</h3>
              {receipts.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <SearchX size={24} className="text-gray-400" />
                  </div>
                  <p className="text-gray-900 font-semibold mb-2">No Receipts Found</p>
                  <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">No formal receipts have been generated yet for this account.</p>
                  <Link to="/admin/fee-receipt" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors shadow-md">Generate First Receipt</Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-y border-gray-200 text-gray-500 text-xs uppercase tracking-wider font-semibold">
                        <th className="px-6 py-4">Receipt No.</th>
                        <th className="px-6 py-4">Issued Date</th>
                        <th className="px-6 py-4">Amount</th>
                        <th className="px-6 py-4">Channel</th>
                        <th className="px-6 py-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {receipts.map((r, i) => (
                        <tr key={r._id || i} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm font-mono text-indigo-600">{r.receiptNumber || r._id?.slice(-8)}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{r.date ? new Date(r.date).toLocaleDateString('en-IN') : '—'}</td>
                          <td className="px-6 py-4 text-sm font-bold text-gray-900">₹{(r.amount || 0).toLocaleString()}</td>
                          <td className="px-6 py-4 text-sm text-gray-600 capitalize">{r.paymentMethod}</td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {r.status || 'Completed'}
                            </span>
                          </td>
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
