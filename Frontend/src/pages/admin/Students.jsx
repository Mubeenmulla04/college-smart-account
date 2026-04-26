import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { studentsAPI } from '../../services';
import styles from '../../styles/AdminStudents.module.css';

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
    }, 300); // Debounce search
    return () => clearTimeout(timer);
  }, [fetchStudents]);

  const handleDelete = async (e, id, name) => {
    e.stopPropagation(); // Prevent row click navigation
    if (window.confirm(`Are you sure you want to remove ${name}?`)) {
      try {
        await studentsAPI.delete(id);
        fetchStudents(); // Refresh the list
      } catch (err) {
        console.error('Error deleting student:', err);
        alert('Failed to remove student.');
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
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>All Students</h1>
            <p className={styles.subtitle}>{students.length} total students registered</p>
          </div>
          <div className={styles.headerActions}>
            <button 
              className={styles.exportBtn}
              onClick={() => window.open('http://localhost:5000/api/exports/students', '_blank')}
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Excel
            </button>
            <Link to="/admin/add-student" className={styles.addBtn}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Student
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className={styles.filters}>
          <div className={styles.searchWrapper}>
            <svg className={styles.searchIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name, email or ID…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <select
            value={filterDept}
            onChange={e => setFilterDept(e.target.value)}
            className={styles.select}
          >
            <option value="">All Departments</option>
            {departments.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* Content */}
        {loading ? (
          <div className={styles.center}>
            <div className={styles.spinner}></div>
            <p>Loading students…</p>
          </div>
        ) : error ? (
          <div className={styles.center}>
            <p className={styles.errText}>{error}</p>
            <button onClick={fetchStudents} className={styles.retryBtn}>Retry</button>
          </div>
        ) : students.length === 0 ? (
          <div className={styles.empty}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p>No students found{search || filterDept ? ' matching your filters' : ''}.</p>
            {!search && !filterDept && (
              <Link to="/admin/add-student" className={styles.addBtn}>Add First Student</Link>
            )}
          </div>
        ) : (
          <div className={styles.table}>
            <div className={styles.tableHeader}>
              <span>Student</span>
              <span>ID</span>
              <span>Department</span>
              <span>Year</span>
              <span>Fees Status</span>
              <span>Scholarship</span>
              <span></span>
              <span></span>
            </div>
            {students.map(student => {
              const feesPaid = student.fees?.paid || 0;
              const feesTotal = student.fees?.total || 0;
              const feesPct = feesTotal > 0 ? Math.round((feesPaid / feesTotal) * 100) : 0;
              const scholarshipStatus = student.scholarship?.status || 'Not Applied';
              return (
                <div
                  key={student._id || student.id}
                  className={styles.row}
                  onClick={() => navigate(`/admin/students/${student._id || student.id}`)}
                >
                  <div className={styles.studentCell}>
                    <div className={styles.avatar}>
                      {student.name?.charAt(0)?.toUpperCase() || 'S'}
                    </div>
                    <div>
                      <p className={styles.name}>{student.name}</p>
                      <p className={styles.email}>{student.email}</p>
                    </div>
                  </div>
                  <span className={styles.id}>{student.studentId}</span>
                  <span className={styles.dept}>{student.department || '—'}</span>
                  <span className={styles.year}>Year {student.year || '—'}</span>
                  <div className={styles.feeCell}>
                    <div className={styles.feeBar}>
                      <div className={styles.feeFill} style={{ width: `${feesPct}%` }}></div>
                    </div>
                    <span className={`${styles.badge} ${student.fees?.pending > 0 ? styles.badgePending : styles.badgePaid}`}>
                      {student.fees?.pending > 0 ? `₹${student.fees.pending.toLocaleString()} due` : 'Paid'}
                    </span>
                  </div>
                  <span className={`${styles.badge} ${
                    scholarshipStatus === 'Approved' ? styles.badgeApproved :
                    scholarshipStatus === 'Rejected' ? styles.badgeRejected :
                    scholarshipStatus === 'Under Review' ? styles.badgeReview :
                    styles.badgeNA
                  }`}>
                    {scholarshipStatus}
                  </span>
                  <button 
                    className={styles.deleteBtn}
                    onClick={(e) => handleDelete(e, student._id || student.id, student.name)}
                    title="Remove Student"
                  >
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                  <button className={styles.viewBtn}>
                    View →
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminStudents;
