import React, { useState, useEffect } from 'react';
import { scholarshipsAPI } from '../../services';
import { 
  Plus, Trash2, Edit2, Award, Users, 
  CheckCircle, IndianRupee, FileText, Loader2, X
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminScholarships = () => {
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ name: '', amount: '', description: '', eligibility: '' });
  const [saving, setSaving] = useState(false);

  const fetchScholarships = async () => {
    try {
      setLoading(true);
      const res = await scholarshipsAPI.getAll();
      setScholarships(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScholarships();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await scholarshipsAPI.create(formData);
      setIsAdding(false);
      setFormData({ name: '', amount: '', description: '', eligibility: '' });
      fetchScholarships();
    } catch (err) {
      alert('Error saving scholarship');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete the "${name}" scholarship program?`)) {
      try {
        await scholarshipsAPI.delete(id);
        fetchScholarships();
      } catch (err) {
        alert('Error deleting scholarship');
      }
    }
  };

  return (
    <div className="w-full py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-purple-50 to-pink-50 rounded-full blur-3xl -ml-32 -mt-32 opacity-70 pointer-events-none"></div>
          
          <div className="flex items-center gap-5 z-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-200 transform -rotate-3">
              <Award size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Scholarship Programs</h1>
              <p className="text-gray-500 mt-1 font-medium">Manage available scholarships and funding amounts.</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 z-10">
            <Link 
              to="/admin/scholarships/applications" 
              className="px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl transition-colors flex items-center gap-2 shadow-sm"
            >
              <Users size={18} /> View Applications
            </Link>
            <button 
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-all shadow-md shadow-purple-200 flex items-center gap-2"
              onClick={() => setIsAdding(true)}
            >
              <Plus size={18} /> New Scholarship
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
              <Award size={24} />
            </div>
            <div>
              <p className="text-3xl font-black text-gray-900">{scholarships.length}</p>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Active Programs</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <IndianRupee size={24} />
            </div>
            <div>
              <p className="text-3xl font-black text-gray-900">
                ₹{(scholarships.reduce((acc, curr) => acc + (curr.amount || 0), 0)).toLocaleString()}
              </p>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Funding Pool</p>
            </div>
          </div>
        </div>

        {/* Add Modal / Overlay */}
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Award size={20} className="text-purple-600" /> Create New Scholarship
                </h2>
                <button onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Program Name *</label>
                  <input 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Merit Scholarship 2024"
                    required
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Amount (₹) *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                      <IndianRupee size={16} />
                    </div>
                    <input 
                      type="number"
                      value={formData.amount}
                      onChange={e => setFormData({...formData, amount: e.target.value})}
                      placeholder="e.g. 25000"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none text-gray-900"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Eligibility Criteria</label>
                  <textarea 
                    value={formData.eligibility}
                    onChange={e => setFormData({...formData, eligibility: e.target.value})}
                    placeholder="Minimum GPA, Attendance, etc."
                    rows={2}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none resize-none text-gray-900 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
                  <textarea 
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    placeholder="Brief overview of the program..."
                    rows={3}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none resize-none text-gray-900 text-sm"
                  />
                </div>
                <div className="pt-4 flex items-center gap-3 border-t border-gray-100">
                  <button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold rounded-xl transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors shadow-md shadow-purple-200 flex items-center justify-center gap-2">
                    {saving ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                    {saving ? 'Saving...' : 'Save Scholarship'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Table Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <Loader2 size={40} className="text-purple-600 animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Loading programs...</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            {scholarships.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center px-4">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <FileText size={32} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Scholarships Available</h3>
                <p className="text-gray-500 max-w-sm mx-auto mb-6">Create the first scholarship program to allow students to apply.</p>
                <button 
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-all shadow-md shadow-purple-200"
                  onClick={() => setIsAdding(true)}
                >
                  Add Scholarship
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider font-semibold">
                      <th className="px-6 py-4">Scholarship Program</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4">Eligibility</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {scholarships.map(s => (
                      <tr key={s._id} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900">{s.name}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{s.description || 'No description provided'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-emerald-600">₹{s.amount?.toLocaleString()}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600">{s.eligibility || 'Standard criteria applies'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Active
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Edit Program">
                              <Edit2 size={18} />
                            </button>
                            <button 
                              onClick={() => handleDelete(s._id, s.name)} 
                              className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" 
                              title="Delete Program"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
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
  );
};

export default AdminScholarships;
