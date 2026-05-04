import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { dashboardAPI } from '../../services';
import { IndianRupee, CreditCard, Clock, GraduationCap, Download, ArrowRight, User, Mail, Phone, BookOpen, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        const data = await dashboardAPI.getStudentStats();
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

  useEffect(() => {
    const fetchFeesReceipt = async () => {
      if (studentData?.id) {
        try {
          await dashboardAPI.getFeesReceiptByStudentId(studentData.id);
        } catch (error) {
          console.error('Error fetching fees receipt:', error);
        }
      }
    };
    fetchFeesReceipt();
  }, [studentData?.id]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user?.email) {
        const fetchFreshData = async () => {
          try {
            const data = await dashboardAPI.getStudentStats();
            setStudentData(data);
            if (data?.id) await dashboardAPI.getFeesReceiptByStudentId(data.id);
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

  useEffect(() => {
    if (user?.email && location.pathname === '/student/dashboard') {
      const refreshData = async () => {
        try {
          const data = await dashboardAPI.getStudentStats();
          setStudentData(data);
          if (data?.id) await dashboardAPI.getFeesReceiptByStudentId(data.id);
        } catch (error) {
          console.error('Error refreshing student data on navigation:', error);
        }
      };
      refreshData();
    }
  }, [location.pathname, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-16">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-500 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!studentData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-16">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
          <AlertCircle size={48} className="text-red-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Data Unavailable</h2>
          <p className="text-gray-500">We couldn't load your student data.</p>
        </div>
      </div>
    );
  }

  const paymentProgress = (studentData.fees.paid / studentData.fees.total) * 100;

  return (
    <div className="w-full py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header Section */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-teal-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-70 pointer-events-none"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-200">
                {studentData.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Welcome back, {studentData.name.split(' ')[0]}!</h1>
                <p className="text-gray-500 mt-1 flex items-center gap-2">
                  <BookOpen size={16} /> {studentData.department} • Year {studentData.year}
                </p>
              </div>
            </div>
            {studentData.fees.pending > 0 && (
              <button 
                onClick={() => navigate('/student/fee-payment')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-md shadow-blue-200 flex items-center justify-center gap-2 w-full md:w-auto"
              >
                Pay Pending Fees <ArrowRight size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className="text-sm font-semibold text-gray-500 mb-1">Total Fees</p>
                <h3 className="text-2xl font-bold text-gray-900">₹{studentData.fees.total.toLocaleString()}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <IndianRupee size={24} strokeWidth={2} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className="text-sm font-semibold text-gray-500 mb-1">Amount Paid</p>
                <h3 className="text-xl sm:text-2xl font-heading font-bold tracking-tight text-gray-900">₹{studentData.fees.paid.toLocaleString()}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <CreditCard size={24} strokeWidth={2} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className="text-sm font-semibold text-gray-500 mb-1">Pending Amount</p>
                <h3 className="text-xl sm:text-2xl font-heading font-bold tracking-tight text-gray-900">₹{studentData.fees.pending.toLocaleString()}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                <Clock size={24} strokeWidth={2} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className="text-sm font-semibold text-gray-500 mb-2">Scholarship</p>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  studentData.scholarship.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                  studentData.scholarship.status === 'Under Review' ? 'bg-amber-100 text-amber-700' :
                  studentData.scholarship.status === 'Not Applied' ? 'bg-gray-100 text-gray-600' : 'bg-red-100 text-red-700'
                }`}>
                  {studentData.scholarship.status}
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                <GraduationCap size={24} strokeWidth={2} />
              </div>
            </div>
          </div>
        </div>

        {/* Middle Section: Fee Progress & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Fee Progress */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2"><CreditCard size={20} className="text-blue-600"/> Fee Progress</h2>
            
            <div className="mb-8">
              <div className="flex justify-between text-sm font-medium mb-2">
                <span className="text-gray-500">Overall Payment</span>
                <span className="text-blue-600">{paymentProgress.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-1000 ease-out" 
                  style={{ width: `${paymentProgress}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-emerald-800 mb-1">Total Paid</p>
                  <p className="text-xl sm:text-2xl font-heading font-bold tracking-tight text-emerald-600">₹{studentData.fees.paid.toLocaleString()}</p>
                </div>
                <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center"><CheckCircle2 size={20}/></div>
              </div>
              <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-100 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-amber-800 mb-1">Remaining Due</p>
                  <p className="text-xl sm:text-2xl font-heading font-bold tracking-tight text-amber-600">₹{studentData.fees.pending.toLocaleString()}</p>
                </div>
                <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center"><Clock size={20}/></div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-b from-slate-900 to-slate-800 rounded-3xl p-8 shadow-lg text-white">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">Quick Actions</h2>
            <div className="space-y-4">
              <button 
                onClick={() => navigate('/student/fee-payment')}
                disabled={studentData.fees.pending === 0}
                className={`w-full p-4 rounded-2xl flex items-center justify-between transition-all ${
                  studentData.fees.pending === 0 
                  ? 'bg-slate-800/50 text-slate-500 cursor-not-allowed border border-slate-700/50' 
                  : 'bg-white/10 hover:bg-white/20 border border-white/10 group'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${studentData.fees.pending === 0 ? 'bg-slate-800' : 'bg-blue-500/20 text-blue-400'}`}>
                    <CreditCard size={20} />
                  </div>
                  <span className="font-medium">{studentData.fees.pending === 0 ? 'No Dues Pending' : 'Pay Fees Online'}</span>
                </div>
                {studentData.fees.pending > 0 && <ArrowRight size={18} className="text-white/50 group-hover:text-white transition-colors" />}
              </button>

              <button 
                onClick={() => navigate('/student/receipt')}
                className="w-full p-4 rounded-2xl flex items-center justify-between bg-white/10 hover:bg-white/20 border border-white/10 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400">
                    <Download size={20} />
                  </div>
                  <span className="font-medium">Download Receipts</span>
                </div>
                <ArrowRight size={18} className="text-white/50 group-hover:text-white transition-colors" />
              </button>

              <button 
                onClick={() => navigate('/student/scholarship')}
                className="w-full p-4 rounded-2xl flex items-center justify-between bg-white/10 hover:bg-white/20 border border-white/10 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                    <GraduationCap size={20} />
                  </div>
                  <span className="font-medium">
                    {studentData.scholarship.status === 'Not Applied' ? 'Apply for Scholarship' : 'Scholarship Details'}
                  </span>
                </div>
                <ArrowRight size={18} className="text-white/50 group-hover:text-white transition-colors" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Section: History & Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Payment History */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><FileText size={20} className="text-blue-600"/> Recent Payments</h2>
            </div>
            
            {studentData.fees.paymentHistory && studentData.fees.paymentHistory.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="pb-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                      <th className="pb-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Amount</th>
                      <th className="pb-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Method</th>
                      <th className="pb-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {studentData.fees.paymentHistory.slice(0, 5).map((payment, idx) => (
                      <tr key={payment.id || idx} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 text-sm text-gray-600">{payment.date}</td>
                        <td className="py-4 text-sm font-bold text-gray-900">₹{payment.amount.toLocaleString()}</td>
                        <td className="py-4 text-sm text-gray-600">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-100 text-gray-600 text-xs font-medium">
                            {payment.method}
                          </span>
                        </td>
                        <td className="py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Success
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FileText size={24} className="text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm">No payment history found.</p>
              </div>
            )}
          </div>

          {/* Student Profile Overview */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2"><User size={20} className="text-blue-600"/> Profile Summary</h2>
            
            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-50 rounded-lg text-gray-400 mt-0.5"><User size={16} /></div>
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase">Student ID</p>
                  <p className="font-semibold text-gray-900">{studentData.id}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-50 rounded-lg text-gray-400 mt-0.5"><Mail size={16} /></div>
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase">Email</p>
                  <p className="font-medium text-gray-700">{studentData.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-50 rounded-lg text-gray-400 mt-0.5"><Phone size={16} /></div>
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase">Phone</p>
                  <p className="font-medium text-gray-700">{studentData.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-50 rounded-lg text-gray-400 mt-0.5"><BookOpen size={16} /></div>
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase">Course</p>
                  <p className="font-medium text-gray-700">{studentData.department}</p>
                  <p className="text-sm text-gray-500">Year {studentData.year}</p>
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