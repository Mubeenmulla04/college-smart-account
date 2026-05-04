import React, { useState, useEffect } from 'react';
import { scholarshipsAPI } from '../../services';
import { 
  Check, X, Eye, Clock, AlertCircle, 
  Search, Filter, ChevronDown, ChevronUp,
  FileText, IndianRupee, MapPin, Building2,
  CalendarDays, Download, Mail, Phone,
  CheckCircle2, XCircle, SearchX
} from 'lucide-react';

const ScholarshipApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedApp, setExpandedApp] = useState(null);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await scholarshipsAPI.getAllApplications();
      setApplications(res.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleReview = async (id, status, remarks) => {
    try {
      await scholarshipsAPI.reviewApplication(id, { status, adminComments: remarks });
      fetchApplications();
    } catch (err) {
      alert('Error updating application');
    }
  };

  const filteredApps = applications.filter(app => {
    const matchesFilter = filter === 'All' || 
                         (filter === 'Pending' && (app.status === 'Pending' || app.status === 'Under Review' || !app.status)) ||
                         app.status === filter;
                         
    const searchLower = search.toLowerCase();
    const studentName = app.studentId?.name?.toLowerCase() || '';
    const mahadbtId = app.mahadbtId?.toLowerCase() || '';
    
    const matchesSearch = studentName.includes(searchLower) || mahadbtId.includes(searchLower);
    
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="w-full py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-50 to-pink-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-70 pointer-events-none"></div>
          
          <div className="flex items-center gap-5 z-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-200 transform -rotate-3">
              <FileText size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Scholarship Applications</h1>
              <p className="text-gray-500 mt-1 font-medium">Review and process student financial aid requests.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 z-10">
            <div className="px-4 py-2 bg-purple-50 text-purple-700 font-semibold rounded-xl border border-purple-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
              {applications.filter(a => a.status === 'Pending' || a.status === 'Under Review' || !a.status).length} Pending
            </div>
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
              placeholder="Search by student name or MahaDBT ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none"
            />
          </div>
          
          <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-200 w-full md:w-auto overflow-x-auto">
            {['All', 'Pending', 'Approved', 'Rejected'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${filter === f ? 'bg-white text-purple-700 shadow-sm border border-gray-200/50' : 'text-gray-500 hover:text-gray-900'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 font-medium">Loading applications...</p>
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 px-4 text-center bg-white rounded-3xl border border-gray-100 shadow-sm">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <SearchX size={32} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">No Applications Found</h3>
            <p className="text-gray-500 max-w-sm mb-6">There are no scholarship applications matching your current filters.</p>
            {filter !== 'All' && (
              <button onClick={() => setFilter('All')} className="text-purple-600 font-semibold hover:underline">View All Applications</button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApps.map((app, index) => {
              const isPending = app.status === 'Under Review' || app.status === 'Pending' || !app.status;
              const isApproved = app.status === 'Approved';
              const isExpanded = expandedApp === app._id;
              
              return (
                <div key={app._id || index} className={`bg-white rounded-2xl shadow-sm border transition-all overflow-hidden ${isExpanded ? 'border-purple-200 shadow-md ring-1 ring-purple-100' : 'border-gray-100 hover:border-purple-200'}`}>
                  
                  {/* Card Header (Always Visible) */}
                  <div className="p-5 sm:p-6 cursor-pointer" onClick={() => setExpandedApp(isExpanded ? null : app._id)}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      
                      {/* Left: Student Info */}
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${isPending ? 'bg-amber-100 text-amber-700' : isApproved ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                          {(app.studentId?.name || 'S').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg">{app.studentId?.name || (app.studentName ? `${app.studentName} (Legacy)` : 'Unknown Student')}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                            <span>{app.studentId?.studentId || app.studentRollNo || 'N/A'}</span>
                            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                            <span>{app.studentId?.department || app.department || 'General'}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Middle: Brief Details */}
                      <div className="hidden lg:flex flex-1 items-center justify-around gap-4 px-6 border-x border-gray-100">
                        <div>
                          <p className="text-xs text-gray-400 font-semibold uppercase mb-1">MahaDBT ID</p>
                          <p className="font-mono text-sm text-gray-900">{app.mahadbtId || 'Not Provided'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 font-semibold uppercase mb-1">Est. Amount</p>
                          <p className="font-bold text-emerald-600">₹{(app.estimatedAmount || app.studentId?.scholarship?.amount || app.scholarshipId?.amount || 0).toLocaleString()}</p>
                        </div>
                      </div>

                      {/* Right: Status & Action */}
                      <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold ${
                          isPending ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          isApproved ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {isPending ? <Clock size={14}/> : isApproved ? <CheckCircle2 size={14}/> : <XCircle size={14}/>}
                          {isPending ? 'Under Review' : app.status}
                        </span>
                        
                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 bg-gray-50/50 p-5 sm:p-6 animate-in slide-in-from-top-2 duration-300">
                      
                      {/* Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                        
                        {/* Scheme Details */}
                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm col-span-1 md:col-span-2">
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Application Details</h4>
                          <div className="space-y-3">
                            <div>
                              <p className="text-xs text-gray-500 mb-0.5">Scholarship Category</p>
                              <p className="font-semibold text-gray-900">{app.scholarshipId?.name || 'General Scholarship'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-0.5">Applied Scheme</p>
                              <p className="font-semibold text-purple-700 bg-purple-50 inline-block px-2 py-0.5 rounded border border-purple-100">{app.schemeName || 'N/A'}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100 mt-2">
                              <div>
                                <p className="text-xs text-gray-500 mb-0.5">Caste Category</p>
                                <p className="font-semibold text-gray-900">{app.casteCategory || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 mb-0.5">Religious Minority</p>
                                <p className="font-semibold text-gray-900">{app.isMinority ? 'Yes' : 'No'}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Academic & Financial */}
                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-4">
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Metrics</h4>
                          <div>
                            <p className="text-xs text-gray-500 mb-0.5">Family Income</p>
                            <p className="font-bold text-gray-900">₹{app.familyIncome?.toLocaleString() || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-0.5">Previous Year Marks</p>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${app.previousYearMarks || 0}%` }}></div>
                              </div>
                              <span className="font-bold text-gray-900 text-sm">{app.previousYearMarks}%</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-0.5">Current Attendance</p>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${app.academicPerformance || 0}%` }}></div>
                              </div>
                              <span className="font-bold text-gray-900 text-sm">{app.academicPerformance}%</span>
                            </div>
                          </div>
                        </div>

                        {/* Bank Details */}
                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-3">
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Disbursement Bank</h4>
                          <div>
                            <p className="text-xs text-gray-500 mb-0.5">Bank Name</p>
                            <p className="font-semibold text-gray-900">{app.bankDetails?.bankName || 'Not Provided'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-0.5">Account Number</p>
                            <p className="font-mono font-bold text-gray-900">{app.bankDetails?.accountNumber || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-0.5">IFSC Code</p>
                            <p className="font-mono text-sm text-gray-900">{app.bankDetails?.ifscCode || 'N/A'}</p>
                          </div>
                        </div>

                      </div>

                      {/* Documents Section */}
                      <div className="mb-8">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Verified Documents</h4>
                        <div className="flex flex-wrap gap-3">
                          {app.documentUrls && Object.entries(app.documentUrls).map(([key, val]) => (
                            val && (
                              <div key={key} className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 shadow-sm hover:border-purple-300 hover:text-purple-700 cursor-pointer transition-colors">
                                <FileText size={16} className="text-gray-400" />
                                {key.replace(/([A-Z])/g, ' $1').trim().replace(/^\w/, c => c.toUpperCase())}
                                <Eye size={14} className="ml-1 opacity-50" />
                              </div>
                            )
                          ))}
                          {(!app.documentUrls || Object.values(app.documentUrls).filter(Boolean).length === 0) && (
                            <p className="text-sm text-gray-500 italic">No documents provided for verification.</p>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons (Only for Pending) */}
                      {isPending && (
                        <div className="flex flex-col sm:flex-row items-center gap-3 pt-6 border-t border-gray-200">
                          <button 
                            className="w-full sm:w-auto flex-1 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-md shadow-emerald-200 flex items-center justify-center gap-2"
                            onClick={() => handleReview(app._id, 'Approved', 'Application verified and approved.')}
                          >
                            <CheckCircle2 size={20}/> Approve Application
                          </button>
                          <button 
                            className="w-full sm:w-auto px-6 py-3 bg-white border-2 border-rose-200 text-rose-600 hover:bg-rose-50 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                            onClick={() => {
                              const reason = prompt('Reason for rejection? (e.g. Invalid documents, Low attendance)');
                              if (reason) handleReview(app._id, 'Rejected', reason);
                            }}
                          >
                            <XCircle size={20}/> Reject
                          </button>
                        </div>
                      )}

                      {/* Read-only remarks for processed apps */}
                      {!isPending && app.adminComments && (
                        <div className="p-4 bg-white rounded-xl border border-gray-200 mt-4">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Admin Remarks</p>
                          <p className="text-gray-700 text-sm">{app.adminComments}</p>
                        </div>
                      )}

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScholarshipApplications;
