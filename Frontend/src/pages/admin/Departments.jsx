import React, { useState, useEffect } from 'react';
import { departmentsAPI } from '../../services';
import styles from '../../styles/Departments.module.css';
import { Plus, Trash2, Edit2, Save, X, Building } from 'lucide-react';

const AdminDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
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
    try {
      await departmentsAPI.create(formData);
      setFormData({ name: '', code: '', description: '' });
      setIsAdding(false);
      fetchDepartments();
    } catch (err) {
      alert('Error creating department');
    }
  };

  const handleUpdate = async (id) => {
    try {
      await departmentsAPI.update(id, formData);
      setEditingId(null);
      setFormData({ name: '', code: '', description: '' });
      fetchDepartments();
    } catch (err) {
      alert('Error updating department');
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Delete ${name} department?`)) {
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
    setFormData({ name: dept.name, code: dept.code, description: dept.description });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Department Management</h1>
          <p className={styles.subtitle}>Configure college departments and codes</p>
        </div>
        <button 
          className={styles.addBtn}
          onClick={() => { setIsAdding(true); setEditingId(null); setFormData({ name: '', code: '', description: '' }); }}
        >
          <Plus size={18} /> Add Department
        </button>
      </div>

      {isAdding && (
        <form className={styles.formCard} onSubmit={handleAdd}>
          <div className={styles.formGrid}>
            <input 
              placeholder="Dept Name (e.g. Computer Science)" 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              required
            />
            <input 
              placeholder="Code (e.g. CS)" 
              value={formData.code}
              onChange={e => setFormData({...formData, code: e.target.value})}
              required
            />
            <input 
              placeholder="Description" 
              className={styles.fullWidth}
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>
          <div className={styles.formActions}>
            <button type="button" onClick={() => setIsAdding(false)} className={styles.cancelBtn}>Cancel</button>
            <button type="submit" className={styles.saveBtn}>Create</button>
          </div>
        </form>
      )}

      {loading ? <p>Loading...</p> : (
        <div className={styles.grid}>
          {departments.map(dept => (
            <div key={dept._id} className={styles.card}>
              {editingId === dept._id ? (
                <div className={styles.editForm}>
                   <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                   <input value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} />
                   <div className={styles.editActions}>
                     <button onClick={() => handleUpdate(dept._id)}><Save size={16}/> Save</button>
                     <button onClick={() => setEditingId(null)} className={styles.cancelBtn}><X size={16}/> Cancel</button>
                   </div>
                </div>
              ) : (
                <>
                  <div className={styles.cardHeader}>
                    <div className={styles.iconBox}><Building size={20}/></div>
                    <div className={styles.badge}>{dept.code}</div>
                  </div>
                  <h3 className={styles.deptName}>{dept.name}</h3>
                  <p className={styles.deptDesc}>{dept.description || 'No description provided'}</p>
                  <div className={styles.cardActions}>
                    <button onClick={() => startEdit(dept)} className={styles.iconBtn}><Edit2 size={16}/></button>
                    <button onClick={() => handleDelete(dept._id, dept.name)} className={`${styles.iconBtn} ${styles.delete}`}><Trash2 size={16}/></button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDepartments;
