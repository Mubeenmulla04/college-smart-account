import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from '../styles/Navbar.module.css';

const Navbar = () => {
  const { user, logout, isAdmin, isStudent } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
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
                    <Link 
                      to="/admin/add-student" 
                      className={`${styles.navLink} ${isActive('/admin/add-student') ? styles.active : ''}`}
                    >
                      <svg className={styles.navIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span className={styles.navText}>Add Student</span>
                    </Link>
                  </li>
                  <li className={styles.navItem}>
                    <Link 
                      to="/admin/fee-receipt" 
                      className={`${styles.navLink} ${isActive('/admin/fee-receipt') ? styles.active : ''}`}
                    >
                      <svg className={styles.navIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className={styles.navText}>Fee Receipt</span>
                    </Link>
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

            {/* User Menu */}
            <div className={styles.userMenu}>
              <div className={styles.userInfo}>
                <div className={styles.userAvatar}>
                  <span>{user.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                </div>
                <div>
                  <div className={styles.userName}>{user.name}</div>
                  <div className={styles.userRole}>{isAdmin ? 'Admin' : 'Student'}</div>
                </div>
              </div>
              <button onClick={handleLogout} className={styles.logoutButton}>
                <svg className={styles.logoutIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Logout</span>
              </button>
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
                <li className={styles.mobileNavItem}>
                  <Link 
                    to="/admin/add-student" 
                    className={`${styles.mobileNavLink} ${isActive('/admin/add-student') ? styles.active : ''}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <svg className={styles.navIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Student
                  </Link>
                </li>
                <li className={styles.mobileNavItem}>
                  <Link 
                    to="/admin/fee-receipt" 
                    className={`${styles.mobileNavLink} ${isActive('/admin/fee-receipt') ? styles.active : ''}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <svg className={styles.navIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Fee Receipt
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
    </nav>
  );
};

export default Navbar; 