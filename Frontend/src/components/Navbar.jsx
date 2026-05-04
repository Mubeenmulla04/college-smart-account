import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Users, Plus, FileText, Building, Award, LogOut, 
  ChevronDown, Menu, X, LayoutDashboard, CreditCard, 
  GraduationCap, Bell, Search, Settings, Shield
} from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAdmin, isStudent } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isManagementOpen, setIsManagementOpen] = useState(false);
  const dropdownRef = useRef(null);
  const managementRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (managementRef.current && !managementRef.current.contains(event.target)) {
        setIsManagementOpen(false);
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

  const isActive = (path) => location.pathname === path;

  return (
    <>
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all duration-300">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md group-hover:shadow-lg transition-all duration-300 transform group-hover:-translate-y-0.5">
              <GraduationCap size={24} />
            </div>
            <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
              Smart Account
            </span>
          </Link>

          {/* Desktop Navigation */}
          {user && (
            <div className="hidden md:flex items-center gap-6">
              <div className="flex items-center gap-1">
                {isAdmin && (
                  <>
                    <Link
                      to="/admin/dashboard"
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                        isActive('/admin/dashboard')
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <LayoutDashboard size={18} />
                      Dashboard
                    </Link>
                    
                    <div className="relative" ref={managementRef}>
                      <button
                        onClick={() => setIsManagementOpen(!isManagementOpen)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                          isManagementOpen ? 'bg-gray-50 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <Shield size={18} />
                        Management
                        <ChevronDown size={16} className={`transition-transform duration-200 ${isManagementOpen ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {isManagementOpen && (
                        <div className="absolute top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 animate-in fade-in slide-in-from-top-2">
                          <div className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Admin Control</div>
                          <Link to="/admin/students" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">
                            <Users size={16} /> All Students
                          </Link>
                          <Link to="/admin/add-student" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">
                            <Plus size={16} /> Add Student
                          </Link>
                          <Link to="/admin/departments" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">
                            <Building size={16} /> Departments
                          </Link>
                          <Link to="/admin/scholarships" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">
                            <Award size={16} /> Scholarships
                          </Link>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {isStudent && (
                  <>
                    <Link
                      to="/student/dashboard"
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                        isActive('/student/dashboard')
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <LayoutDashboard size={18} />
                      Dashboard
                    </Link>
                    <Link
                      to="/student/fee-payment"
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                        isActive('/student/fee-payment')
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <CreditCard size={18} />
                      Pay Fees
                    </Link>
                    <Link
                      to="/student/scholarship"
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                        isActive('/student/scholarship')
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <GraduationCap size={18} />
                      Scholarship
                    </Link>
                  </>
                )}
              </div>

              {/* Tools & Profile */}
              <div className="flex items-center gap-4 border-l border-gray-100 pl-6 ml-2">
                <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all relative">
                  <Bell size={20} />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
                </button>

                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-3 p-1 pr-3 rounded-full border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                      {user.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div className="text-left hidden lg:block">
                      <p className="text-sm font-bold text-gray-800 leading-none mb-0.5">{user.name?.split(' ')[0]}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{isAdmin ? 'Admin' : 'Student'}</p>
                    </div>
                    <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-3 w-60 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2">
                      <div className="p-4 bg-gray-50 border-b border-gray-100">
                        <p className="font-bold text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      <div className="p-2">
                        <Link to={isAdmin ? "/admin/dashboard" : "/student/dashboard"} className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors">
                          <Settings size={16} /> Account Settings
                        </Link>
                        <div className="my-1 border-t border-gray-100"></div>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <LogOut size={16} /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          {user && (
            <button
              className="md:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {user && isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-2xl absolute w-full animate-in slide-in-from-top-2">
          <div className="p-4 space-y-1">
            {isAdmin ? (
              <>
                <Link to="/admin/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl font-semibold">
                  <LayoutDashboard size={20} /> Dashboard
                </Link>
                <Link to="/admin/students" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl font-semibold">
                  <Users size={20} /> All Students
                </Link>
                <Link to="/admin/add-student" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl font-semibold">
                  <Plus size={20} /> Add Student
                </Link>
                <Link to="/admin/departments" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl font-semibold">
                  <Building size={20} /> Departments
                </Link>
              </>
            ) : (
              <>
                <Link to="/student/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl font-semibold">
                  <LayoutDashboard size={20} /> Dashboard
                </Link>
                <Link to="/student/fee-payment" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl font-semibold">
                  <CreditCard size={20} /> Pay Fees
                </Link>
                <Link to="/student/scholarship" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl font-semibold">
                  <GraduationCap size={20} /> Scholarship
                </Link>
              </>
            )}
            <div className="pt-4 border-t border-gray-100">
              <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-3 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl font-bold transition-colors">
                <LogOut size={20} /> Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Modal moved outside nav to avoid CSS containing block issues */}
    </nav>
    
    {showLogoutConfirm && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in">
        <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 animate-in zoom-in-95">
          <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-6 mx-auto transform -rotate-6">
            <LogOut size={32} />
          </div>
          <h3 className="text-2xl font-black text-center text-gray-900 mb-2">Sign Out</h3>
          <p className="text-center text-gray-500 mb-8 font-medium">Are you sure you want to end your session?</p>
          <div className="flex gap-4">
            <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all">
              Cancel
            </button>
            <button onClick={confirmLogout} className="flex-1 px-4 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-rose-200">
              Sign Out
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default Navbar;