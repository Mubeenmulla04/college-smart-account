import React, { useState, useEffect } from 'react';
import { departmentsAPI } from '../../services';
import { 
  Building2, Plus, Trash2, Edit2, Save, X, 
  Settings, Hash, Loader2, AlertCircle, BookOpen 
} from 'lucide-react';

const AdminDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({ name: '', code: '', description: '' });

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await departmentsAPI.getAll();
      setDepartments(res.data || []);
    } catch (err) {
      setError('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await departmentsAPI.create(formData);
      setFormData({ name: '', code: '', description: '' });
      setIsAdding(false);
      fetchDepartments();
    } catch (err) {
      alert('Error creating department');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (e, id) => {
    e.preventDefault();
    setSaving(true);
    try {
      await departmentsAPI.update(id, formData);
      setEditingId(null);
      setFormData({ name: '', code: '', description: '' });
      fetchDepartments();
    } catch (err) {
      alert('Error updating department');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete the ${name} department? This might affect students assigned to it.`)) {
      try {
        await departmentsAPI.delete(id);
        fetchDepartments();
      } catch (err) {
        alert('Error deleting department');
      }
    }
  };

  const startEdit = (dept) => {
    setEditingId(dept._id);
    setIsAdding(false);
    setFormData({ name: dept.name, code: dept.code, description: dept.description });
  };

  return (
    <div className="w-full py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-70 pointer-events-none"></div>
          
          <div className="flex items-center gap-5 z-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-indigo-200 transform -rotate-3">
              <Settings size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Departments</h1>
              <p className="text-gray-500 mt-1 font-medium">Configure and manage academic departments.</p>
            </div>
          </div>
          
          <div className="z-10">
            {!isAdding && (
              <button 
                onClick={() => { setIsAdding(true); setEditingId(null); setFormData({ name: '', code: '', description: '' }); }}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-md shadow-indigo-200 flex items-center gap-2"
              >
                <Plus size={18} /> New Department
              </button>
            )}
          </div>
        </div>

        {/* Add Form */}
        {isAdding && (
          <form onSubmit={handleAdd} className="bg-white p-6 sm:p-8 rounded-3xl shadow-md border border-indigo-100 relative overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="absolute top-0 left-0 w-2 h-full bg-indigo-600"></div>
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2"><Building2 className="text-indigo-600" size={24}/> Add New Department</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Department Name *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <BookOpen size={18} />
                  </div>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Computer Science" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none text-gray-900"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Department Code *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <Hash size={18} />
                  </div>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. CSE" 
                    value={formData.code}
                    onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none font-mono text-gray-900"
                  />
                </div>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <input 
                  type="text"
                  placeholder="Brief description of the department..." 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none text-gray-900"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
              <button 
                type="submit" 
                disabled={saving}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-xl transition-all shadow-md shadow-indigo-200 flex items-center gap-2"
              >
                {saving ? <Loader2 size={18} className="animate-spin"/> : <Save size={18}/>}
                {saving ? 'Creating...' : 'Create Department'}
              </button>
              <button 
                type="button" 
                onClick={() => setIsAdding(false)} 
                disabled={saving}
                className="px-6 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Departments Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <Loader2 size={40} className="text-indigo-600 animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Loading departments...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm text-center px-4">
            <AlertCircle size={48} className="text-rose-400 mb-4" />
            <p className="text-gray-900 font-semibold">{error}</p>
          </div>
        ) : departments.length === 0 && !isAdding ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm text-center px-4">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Building2 size={32} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Departments Yet</h3>
            <p className="text-gray-500 max-w-sm mb-6">Create your first department to start organizing your college structure.</p>
            <button 
              onClick={() => { setIsAdding(true); setEditingId(null); setFormData({ name: '', code: '', description: '' }); }}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-md shadow-indigo-200 flex items-center gap-2"
            >
              <Plus size={18} /> Add First Department
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {departments.map(dept => (
              <div key={dept._id} className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-gray-100 transition-all overflow-hidden flex flex-col group relative">
                
                {editingId === dept._id ? (
                  <form onSubmit={(e) => handleUpdate(e, dept._id)} className="p-6 bg-indigo-50/50 flex-1 flex flex-col">
                    <div className="space-y-4 flex-1">
                      <div>
                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Name</label>
                        <input 
                          required
                          value={formData.name} 
                          onChange={e => setFormData({...formData, name: e.target.value})}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:border-indigo-500 outline-none transition-colors text-sm font-semibold" 
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Code</label>
                        <input 
                          required
                          value={formData.code} 
                          onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:border-indigo-500 outline-none transition-colors text-sm font-mono" 
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Description</label>
                        <textarea 
                          rows={2}
                          value={formData.description} 
                          onChange={e => setFormData({...formData, description: e.target.value})}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:border-indigo-500 outline-none transition-colors text-sm resize-none" 
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 mt-6 pt-4 border-t border-indigo-100">
                      <button type="submit" disabled={saving} className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-sm flex items-center justify-center gap-1.5 transition-colors">
                        {saving ? <Loader2 size={16} className="animate-spin"/> : <Save size={16}/>} Save
                      </button>
                      <button type="button" onClick={() => setEditingId(null)} disabled={saving} className="flex-1 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-lg text-sm transition-colors flex items-center justify-center gap-1.5">
                        <X size={16}/> Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                      <button onClick={() => startEdit(dept)} className="w-8 h-8 bg-white border border-gray-200 text-gray-500 hover:text-indigo-600 rounded-lg flex items-center justify-center shadow-sm transition-colors">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(dept._id, dept.name)} className="w-8 h-8 bg-white border border-rose-100 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg flex items-center justify-center shadow-sm transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                    
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                          <Building2 size={24} />
                        </div>
                        <div className="pt-1">
                          <span className="inline-block px-2.5 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 font-mono text-xs font-bold rounded mb-2">
                            {dept.code}
                          </span>
                          <h3 className="text-xl font-bold text-gray-900 leading-tight pr-12">{dept.name}</h3>
                        </div>
                      </div>
                      <p className="text-gray-500 text-sm mt-auto">{dept.description || 'No description provided.'}</p>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDepartments;
