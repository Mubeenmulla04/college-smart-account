import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { studentsAPI } from '../../services';
import { 
  Users, Search, Filter, Download, Plus, 
  MoreVertical, Trash2, Eye, Mail, Phone, 
  MapPin, Loader2, ChevronRight, AlertCircle
} from 'lucide-react';

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const navigate = useNavigate();

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (search) params.search = search;
      if (filterDept) params.department = filterDept;
      
      const res = await studentsAPI.getAll(params);
      const data = res.data || [];
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Failed to load students. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [search, filterDept]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStudents();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchStudents]);

  const handleDelete = async (e, id, name) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to remove ${name}? This action cannot be undone.`)) {
      try {
        await studentsAPI.delete(id);
        fetchStudents();
      } catch (err) {
        console.error('Error deleting student:', err);
        alert('Failed to remove student. They might have dependent records.');
      }
    }
  };

  const departments = [...new Set(students.map(s => s.department).filter(Boolean))];

  const filtered = students.filter(s => {
    const matchSearch =
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase()) ||
      s.studentId?.toLowerCase().includes(search.toLowerCase());
    const matchDept = filterDept ? s.department === filterDept : true;
    return matchSearch && matchDept;
  });

  return (
    <div className="w-full py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-70 pointer-events-none"></div>
          
          <div className="flex items-center gap-5 z-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-indigo-200 transform -rotate-3">
              <Users size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Student Directory</h1>
              <p className="text-gray-500 mt-1 font-medium">{students.length} total students registered</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 z-10">
            <button 
              onClick={() => window.open('http://localhost:5000/api/exports/students', '_blank')}
              className="px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl transition-colors flex items-center gap-2 shadow-sm"
            >
              <Download size={18} /> <span className="hidden sm:inline">Export</span>
            </button>
            <Link 
              to="/admin/add-student" 
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-md shadow-indigo-200 flex items-center gap-2"
            >
              <Plus size={18} /> New Student
            </Link>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between z-20 relative">
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Search by name, email or PRN..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
            />
          </div>
          
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Filter size={18} />
            </div>
            <select
              value={filterDept}
              onChange={e => setFilterDept(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none appearance-none"
            >
              <option value="">All Departments</option>
              {departments.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 size={40} className="text-indigo-600 animate-spin mb-4" />
              <p className="text-gray-500 font-medium">Loading student database...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
              <AlertCircle size={48} className="text-rose-400 mb-4" />
              <p className="text-gray-900 font-semibold mb-2">{error}</p>
              <button onClick={fetchStudents} className="text-indigo-600 font-medium hover:underline">Try Again</button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <Search size={32} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">No Students Found</h3>
              <p className="text-gray-500 max-w-sm mb-6">
                {search || filterDept ? 'Try adjusting your search or filters to find what you are looking for.' : 'Get started by adding your first student to the system.'}
              </p>
              {(!search && !filterDept) && (
                <Link to="/admin/add-student" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-md">
                  Add First Student
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider font-semibold">
                    <th className="px-6 py-4">Student</th>
                    <th className="px-6 py-4">Details</th>
                    <th className="px-6 py-4">Fees Status</th>
                    <th className="px-6 py-4">Scholarship</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map(student => {
                    const feesPaid = student.fees?.paid || 0;
                    const feesTotal = student.fees?.total || 0;
                    const feesPct = feesTotal > 0 ? Math.round((feesPaid / feesTotal) * 100) : 0;
                    const scholarshipStatus = student.scholarship?.status || 'Not Applied';
                    
                    return (
                      <tr 
                        key={student._id || student.id}
                        onClick={() => navigate(`/admin/students/${student._id || student.id}`)}
                        className="hover:bg-gray-50/80 transition-colors cursor-pointer group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-blue-100 text-indigo-700 flex items-center justify-center font-bold shadow-inner">
                              {student.name?.charAt(0)?.toUpperCase() || 'S'}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{student.name}</p>
                              <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                                <Mail size={12} /> {student.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold text-gray-900">{student.studentId}</p>
                          <p className="text-xs text-gray-500">{student.department || '—'} • Year {student.year || '—'}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 max-w-[100px]">
                              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${feesPct === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`} style={{ width: `${feesPct}%` }}></div>
                              </div>
                            </div>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${student.fees?.pending > 0 ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'}`}>
                              {student.fees?.pending > 0 ? `₹${student.fees.pending.toLocaleString()} due` : 'Paid'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                            scholarshipStatus === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            scholarshipStatus === 'Rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                            (scholarshipStatus === 'Under Review' || scholarshipStatus === 'Pending') ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                            'bg-gray-100 text-gray-600 border-gray-200'
                          }`}>
                            {scholarshipStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={(e) => handleDelete(e, student._id || student.id, student.name)}
                              className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                              title="Delete Student"
                            >
                              <Trash2 size={18} />
                            </button>
                            <button 
                              className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <ChevronRight size={20} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminStudents;
