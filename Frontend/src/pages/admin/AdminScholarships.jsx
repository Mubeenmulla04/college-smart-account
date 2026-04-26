import React, { useState, useEffect } from 'react';
import { scholarshipsAPI } from '../../services';
import styles from '../../styles/AdminScholarships.module.css';
import { Plus, Trash2, Edit2, Award, Users, CheckCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminScholarships = () => {
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ name: '', amount: '', description: '', eligibility: '' });

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
    try {
      await scholarshipsAPI.create(formData);
      setIsAdding(false);
      setFormData({ name: '', amount: '', description: '', eligibility: '' });
      fetchScholarships();
    } catch (err) {
      alert('Error saving scholarship');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Scholarship Programs</h1>
          <p className={styles.subtitle}>Manage available scholarships and funding amounts</p>
        </div>
        <div className={styles.headerActions}>
          <Link to="/admin/scholarships/applications" className={styles.secondaryBtn}>
            <Users size={18} /> View Applications
          </Link>
          <button className={styles.addBtn} onClick={() => setIsAdding(true)}>
            <Plus size={18} /> New Scholarship
          </button>
        </div>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <Award className={styles.statIcon} size={24} />
          <div>
            <div className={styles.statValue}>{scholarships.length}</div>
            <div className={styles.statLabel}>Active Programs</div>
          </div>
        </div>
      </div>

      {isAdding && (
        <div className={styles.modalOverlay}>
          <form className={styles.modal} onSubmit={handleSubmit}>
            <h2>Create New Scholarship</h2>
            <div className={styles.inputGroup}>
              <label>Program Name</label>
              <input 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="e.g. Merit Scholarship 2024"
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Amount (₹)</label>
              <input 
                type="number"
                value={formData.amount}
                onChange={e => setFormData({...formData, amount: e.target.value})}
                placeholder="e.g. 25000"
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Eligibility Criteria</label>
              <textarea 
                value={formData.eligibility}
                onChange={e => setFormData({...formData, eligibility: e.target.value})}
                placeholder="Minimum GPA, Attendance, etc."
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Description</label>
              <textarea 
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>
            <div className={styles.modalActions}>
              <button type="button" onClick={() => setIsAdding(false)}>Cancel</button>
              <button type="submit" className={styles.primaryBtn}>Save Scholarship</button>
            </div>
          </form>
        </div>
      )}

      {loading ? <p>Loading...</p> : (
        <div className={styles.tableCard}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Scholarship Program</th>
                <th>Amount</th>
                <th>Eligibility</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {scholarships.map(s => (
                <tr key={s._id}>
                  <td>
                    <div className={styles.progName}>{s.name}</div>
                    <div className={styles.progDesc}>{s.description}</div>
                  </td>
                  <td className={styles.amount}>₹{s.amount?.toLocaleString()}</td>
                  <td className={styles.eligibility}>{s.eligibility}</td>
                  <td>
                    <span className={styles.statusBadge}>Active</span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button className={styles.edit}><Edit2 size={16}/></button>
                      <button className={styles.delete}><Trash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminScholarships;
