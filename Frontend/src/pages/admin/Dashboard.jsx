import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI } from '../../services';
import { IndianRupee, Users, Clock, GraduationCap, Plus, FileText, Settings, ArrowRight, UserPlus, Search, ArrowUpRight, TrendingUp } from 'lucide-react';

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

  const collectionProgress = stats.totalFees > 0 
    ? Math.round(((stats.totalFees - stats.pendingFees) / stats.totalFees) * 100) 
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-16">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-500 font-medium">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-16">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 flex flex-col items-center max-w-sm w-full">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Data Error</h2>
          <p className="text-gray-500 text-center mb-6">{error}</p>
          <button onClick={fetchDashboardData} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors">Retry Connection</button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header Section */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-70 pointer-events-none"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Admin Dashboard</h1>
              <p className="text-gray-500 mt-2 text-lg">Manage students, fee collections, and scholarship applications.</p>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/admin/students" className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-sm">
                <Search size={18} /> Find Student
              </Link>
              <Link to="/admin/add-student" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all shadow-md shadow-indigo-200 flex items-center gap-2">
                <UserPlus size={18} /> Add New
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className="text-sm font-semibold text-gray-500 mb-1">Total College Fees</p>
                <h3 className="text-2xl font-bold text-gray-900">₹{stats.totalFees.toLocaleString()}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <IndianRupee size={24} strokeWidth={2} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className="text-sm font-semibold text-gray-500 mb-1">Total Students</p>
                <h3 className="text-2xl font-bold text-gray-900">{stats.totalStudents}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <Users size={24} strokeWidth={2} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className="text-sm font-semibold text-gray-500 mb-1">Pending Collection</p>
                <h3 className="text-2xl font-bold text-gray-900">₹{stats.pendingFees.toLocaleString()}</h3>
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
                <p className="text-sm font-semibold text-gray-500 mb-2">Scholarship Reviews</p>
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-bold text-gray-900">{stats.scholarshipApplications}</h3>
                  {stats.scholarshipApplications > 0 && <span className="flex h-3 w-3 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span></span>}
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                <GraduationCap size={24} strokeWidth={2} />
              </div>
            </div>
          </div>
        </div>

        {/* Collection & Quick Actions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Fee Collection Progress */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2"><TrendingUp size={24} className="text-indigo-600"/> Collection Progress</h2>
              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 font-semibold rounded-full text-sm">{collectionProgress}% Recovered</span>
            </div>
            
            <div className="mb-8">
              <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden shadow-inner">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-1000 ease-out relative" 
                  style={{ width: `${collectionProgress}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 w-full h-full" style={{ backgroundImage: 'linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent)', backgroundSize: '1rem 1rem' }}></div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10"><IndianRupee size={64}/></div>
                <p className="text-sm font-bold text-emerald-800 uppercase tracking-wider mb-2">Collected Revenue</p>
                <p className="text-3xl font-black text-emerald-600">₹{(stats.totalFees - stats.pendingFees).toLocaleString()}</p>
              </div>
              <div className="p-6 rounded-2xl bg-gradient-to-br from-rose-50 to-red-50 border border-rose-100/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10"><Clock size={64}/></div>
                <p className="text-sm font-bold text-rose-800 uppercase tracking-wider mb-2">Outstanding Dues</p>
                <p className="text-3xl font-black text-rose-600">₹{stats.pendingFees.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Scholarship Review & Actions */}
          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><GraduationCap size={20} className="text-purple-600"/> Action Required</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                    <span className="font-semibold text-gray-700">Pending Reviews</span>
                  </div>
                  <span className="px-2.5 py-1 bg-amber-100 text-amber-800 font-bold rounded-lg text-sm">{stats.scholarshipApplications}</span>
                </div>
              </div>

              <Link to="/admin/scholarships/applications" className="w-full py-3 bg-purple-50 text-purple-700 hover:bg-purple-100 font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors">
                Review Applications <ArrowRight size={18} />
              </Link>
            </div>

            <div className="bg-slate-900 rounded-3xl p-6 shadow-lg text-white">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Management Tools</h3>
              <div className="grid grid-cols-2 gap-3">
                <Link to="/admin/fee-receipt" className="p-4 bg-slate-800 hover:bg-slate-700 rounded-2xl transition-colors flex flex-col items-center justify-center text-center gap-2 group">
                  <div className="w-10 h-10 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"><FileText size={20}/></div>
                  <span className="text-xs font-semibold">Generate Receipt</span>
                </Link>
                <Link to="/admin/departments" className="p-4 bg-slate-800 hover:bg-slate-700 rounded-2xl transition-colors flex flex-col items-center justify-center text-center gap-2 group">
                  <div className="w-10 h-10 bg-teal-500/20 text-teal-400 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"><Settings size={20}/></div>
                  <span className="text-xs font-semibold">Manage Depts</span>
                </Link>
              </div>
            </div>
          </div>

        </div>

        {/* Recent Students List */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2"><Users size={24} className="text-blue-600"/> Recent Enrollments</h2>
            <Link to="/admin/students" className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              View Database <ArrowUpRight size={16}/>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {recentStudents.length > 0 ? (
              recentStudents.map((student) => (
                <div key={student.id} className="p-5 border border-gray-100 rounded-2xl hover:shadow-md transition-shadow bg-gray-50/50 hover:bg-white flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                      {student.name?.charAt(0)?.toUpperCase() || 'S'}
                    </div>
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${student.fees?.pending > 0 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {student.fees?.pending > 0 ? 'Dues Pending' : 'Fully Paid'}
                    </span>
                  </div>
                  <h4 className="font-bold text-gray-900 text-lg mb-1 truncate" title={student.name}>{student.name}</h4>
                  <p className="text-sm text-gray-500 mb-3 truncate" title={student.email}>{student.email}</p>
                  <div className="mt-auto pt-4 border-t border-gray-100 flex items-center gap-2 text-xs font-medium text-gray-600">
                    <GraduationCap size={14} className="text-indigo-500"/>
                    <span className="truncate">{student.department}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 flex flex-col items-center justify-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <Users size={48} className="text-gray-300 mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-1">No Students Found</h3>
                <p className="text-gray-500 text-sm mb-6">Your database is currently empty.</p>
                <Link to="/admin/add-student" className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors shadow-sm">
                  Add First Student
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