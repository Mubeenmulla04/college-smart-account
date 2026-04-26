import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from '../styles/Navbar.module.css';
import { Users, Plus, FileText, Building, Award } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAdmin, isStudent } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const dropdownRef = useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
    setIsProfileOpen(false);
  };

  const confirmLogout = () => {
    logout();
    navigate('/login');
    setShowLogoutConfirm(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarContainer}>
        {/* Brand */}
        <Link to="/" className={styles.navbarBrand}>
          <div className={styles.navbarLogo}>
            <span className={styles.navbarLogoIcon}>🎓</span>
          </div>
          <span className={styles.navbarTitle}>College Smart Account</span>
        </Link>

        {/* Desktop Navigation */}
        {user && (
          <>
            <ul className={styles.navbarNav}>
              {isAdmin && (
                <>
                  <li className={styles.navItem}>
                    <Link 
                      to="/admin/dashboard" 
                      className={`${styles.navLink} ${isActive('/admin/dashboard') ? styles.active : ''}`}
                    >
                      <svg className={styles.navIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
                      </svg>
                      <span className={styles.navText}>Dashboard</span>
                    </Link>
                  </li>
                  <li className={styles.navItem}>
                    <div className={styles.navDropdown}>
                      <button className={`${styles.navLink} ${styles.dropdownTrigger}`}>
                        <svg className={styles.navIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                        </svg>
                        <span className={styles.navText}>Management</span>
                        <svg className={styles.dropdownArrow} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      <div className={styles.navDropdownMenu}>
                        <Link 
                          to="/admin/students" 
                          className={`${styles.dropdownLink} ${isActive('/admin/students') ? styles.active : ''}`}
                        >
                          <div className={styles.dropdownIcon}><Users size={18}/></div>
                          <div className={styles.dropdownInfo}>
                            <span className={styles.dropdownLabel}>All Students</span>
                            <span className={styles.dropdownDesc}>View & manage database</span>
                          </div>
                        </Link>
                        
                        <Link 
                          to="/admin/add-student" 
                          className={`${styles.dropdownLink} ${isActive('/admin/add-student') ? styles.active : ''}`}
                        >
                          <div className={styles.dropdownIcon}><Plus size={18}/></div>
                          <div className={styles.dropdownInfo}>
                            <span className={styles.dropdownLabel}>Add Student</span>
                            <span className={styles.dropdownDesc}>Register new student</span>
                          </div>
                        </Link>
                        
                        <Link 
                          to="/admin/fee-receipt" 
                          className={`${styles.dropdownLink} ${isActive('/admin/fee-receipt') ? styles.active : ''}`}
                        >
                          <div className={styles.dropdownIcon}><FileText size={18}/></div>
                          <div className={styles.dropdownInfo}>
                            <span className={styles.dropdownLabel}>Fee Receipt</span>
                            <span className={styles.dropdownDesc}>Generate payments</span>
                          </div>
                        </Link>

                        <div className={styles.dropdownDivider}></div>
                        
                        <Link 
                          to="/admin/departments" 
                          className={`${styles.dropdownLink} ${isActive('/admin/departments') ? styles.active : ''}`}
                        >
                          <div className={styles.dropdownIcon}><Building size={18}/></div>
                          <div className={styles.dropdownInfo}>
                            <span className={styles.dropdownLabel}>Departments</span>
                            <span className={styles.dropdownDesc}>Configure college</span>
                          </div>
                        </Link>
                        
                        <Link 
                          to="/admin/scholarships" 
                          className={`${styles.dropdownLink} ${isActive('/admin/scholarships') ? styles.active : ''}`}
                        >
                          <div className={styles.dropdownIcon}><Award size={18}/></div>
                          <div className={styles.dropdownInfo}>
                            <span className={styles.dropdownLabel}>Scholarships</span>
                            <span className={styles.dropdownDesc}>Programs & reviews</span>
                          </div>
                        </Link>
                      </div>
                    </div>
                  </li>
                </>
              )}

              {isStudent && (
                <>
                  <li className={styles.navItem}>
                    <Link 
                      to="/student/dashboard" 
                      className={`${styles.navLink} ${isActive('/student/dashboard') ? styles.active : ''}`}
                    >
                      <svg className={styles.navIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
                      </svg>
                      <span className={styles.navText}>Dashboard</span>
                    </Link>
                  </li>
                  <li className={styles.navItem}>
                    <Link 
                      to="/student/scholarship" 
                      className={`${styles.navLink} ${isActive('/student/scholarship') ? styles.active : ''}`}
                    >
                      <svg className={styles.navIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      <span className={styles.navText}>Scholarship</span>
                    </Link>
                  </li>
                </>
              )}
            </ul>

            {/* User Menu Dropdown */}
            <div className={styles.userMenu} ref={dropdownRef}>
              <div 
                className={`${styles.userInfo} ${isProfileOpen ? styles.active : ''}`} 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <div className={styles.userAvatar}>
                  <span>{user.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                </div>
                <div className={styles.userText}>
                  <div className={styles.userName}>{user.name}</div>
                  <div className={styles.userRole}>{isAdmin ? 'Admin' : 'Student'}</div>
                </div>
                <svg className={`${styles.dropdownArrow} ${isProfileOpen ? styles.open : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {isProfileOpen && (
                <div className={styles.dropdownMenu}>
                  <div className={styles.dropdownHeader}>
                    <p className={styles.dropdownName}>{user.name}</p>
                    <p className={styles.dropdownEmail}>{user.email}</p>
                  </div>
                  <div className={styles.dropdownDivider}></div>
                  <div className={styles.dropdownBody}>
                    <div className={styles.dropdownItem}>
                      <span className={styles.itemLabel}>ID:</span>
                      <span className={styles.itemValue}>{user.id || 'N/A'}</span>
                    </div>
                    {isStudent && (
                      <div className={styles.dropdownItem}>
                        <span className={styles.itemLabel}>Role:</span>
                        <span className={styles.itemValue}>Student Account</span>
                      </div>
                    )}
                  </div>
                  <div className={styles.dropdownDivider}></div>
                  <div className={styles.dropdownLogoutContainer}>
                    <button onClick={handleLogout} className={styles.dropdownLogout}>
                      <svg className={styles.logoutIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button 
              className={`${styles.mobileMenuButton} ${isMobileMenuOpen ? styles.active : ''}`}
              onClick={toggleMobileMenu}
            >
              <span className={styles.mobileMenuLine}></span>
              <span className={styles.mobileMenuLine}></span>
              <span className={styles.mobileMenuLine}></span>
            </button>
          </>
        )}
      </div>

      {/* Mobile Menu */}
      {user && isMobileMenuOpen && (
        <div className={`${styles.mobileMenu} ${styles.show}`}>
          <div className={styles.mobileUserInfo}>
            <div className={styles.userAvatar}>
              <span>{user.name?.charAt(0)?.toUpperCase() || 'U'}</span>
            </div>
            <div>
              <div className={styles.userName}>{user.name}</div>
              <div className={styles.userRole}>{isAdmin ? 'Admin' : 'Student'}</div>
            </div>
          </div>
          
          <ul className={styles.mobileNav}>
            {isAdmin && (
              <>
                <li className={styles.mobileNavItem}>
                  <Link 
                    to="/admin/dashboard" 
                    className={`${styles.mobileNavLink} ${isActive('/admin/dashboard') ? styles.active : ''}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <svg className={styles.navIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
                    </svg>
                    Dashboard
                  </Link>
                </li>
                
                <li className={styles.mobileSectionTitle}>Management</li>
                
                <li className={styles.mobileNavItem}>
                  <Link to="/admin/students" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>
                    <Users size={18}/> All Students
                  </Link>
                </li>
                <li className={styles.mobileNavItem}>
                  <Link to="/admin/add-student" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>
                    <Plus size={18}/> Add Student
                  </Link>
                </li>
                <li className={styles.mobileNavItem}>
                  <Link to="/admin/fee-receipt" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>
                    <FileText size={18}/> Fee Receipt
                  </Link>
                </li>
                <li className={styles.mobileNavItem}>
                  <Link to="/admin/departments" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>
                    <Building size={18}/> Departments
                  </Link>
                </li>
                <li className={styles.mobileNavItem}>
                  <Link to="/admin/scholarships" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>
                    <Award size={18}/> Scholarships
                  </Link>
                </li>
              </>
            )}

            {isStudent && (
              <>
                <li className={styles.mobileNavItem}>
                  <Link 
                    to="/student/dashboard" 
                    className={`${styles.mobileNavLink} ${isActive('/student/dashboard') ? styles.active : ''}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <svg className={styles.navIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
                    </svg>
                    Dashboard
                  </Link>
                </li>
                <li className={styles.mobileNavItem}>
                  <Link 
                    to="/student/scholarship" 
                    className={`${styles.mobileNavLink} ${isActive('/student/scholarship') ? styles.active : ''}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <svg className={styles.navIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    Scholarship
                  </Link>
                </li>
              </>
            )}
          </ul>
          
          <button onClick={handleLogout} className={styles.mobileLogoutButton}>
            <svg className={styles.logoutIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      )}
      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <div className={styles.modalIcon}>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <h3>Confirm Logout</h3>
              <p>Are you sure you want to sign out of your account?</p>
            </div>
            <div className={styles.modalFooter}>
              <button 
                className={styles.cancelButton} 
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </button>
              <button 
                className={styles.confirmButton} 
                onClick={confirmLogout}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 