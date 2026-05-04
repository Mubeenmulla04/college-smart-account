import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, UserPlus, Receipt, CreditCard, 
  History, GraduationCap, LogOut, Users, BookOpen, User
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const adminNavItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Students Directory', path: '/admin/students', icon: Users },
    { name: 'Add Student', path: '/admin/add-student', icon: UserPlus },
    { name: 'Generate Receipt', path: '/admin/fee-receipt', icon: Receipt },
    { name: 'Scholarships', path: '/admin/scholarships', icon: GraduationCap },
    { name: 'Departments', path: '/admin/departments', icon: BookOpen },
  ];

  const studentNavItems = [
    { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { name: 'My Profile', path: '/student/profile', icon: User },
    { name: 'Pay Fees', path: '/student/fee-payment', icon: CreditCard },
    { name: 'My Receipts', path: '/student/receipt', icon: Receipt },
    { name: 'Payment History', path: '/student/payment-history', icon: History },
    { name: 'Scholarship', path: '/student/scholarship', icon: GraduationCap },
  ];

  const navItems = isAdmin ? adminNavItems : studentNavItems;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => toggleSidebar(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-screen w-72 bg-white border-r border-gray-100 z-50 flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        
        {/* Brand Header */}
        <div className="h-20 flex items-center gap-3 px-6 border-b border-gray-100 bg-white">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-500 text-white flex items-center justify-center shadow-md shadow-indigo-200 transform -rotate-2">
            <GraduationCap size={24} />
          </div>
          <div>
            <h1 className="font-bold text-gray-900 leading-tight">College Smart</h1>
            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-widest">Account</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">
            {isAdmin ? 'Administration' : 'Student Portal'}
          </div>
          {navItems.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;
            return (
              <Link 
                key={item.path}
                to={item.path} 
                onClick={() => window.innerWidth < 1024 && toggleSidebar(false)}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all duration-200 group ${
                  active 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className={`transition-transform duration-200 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
                  <Icon size={20} className={active ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-500'} strokeWidth={active ? 2.5 : 2} />
                </div>
                {item.name}
                {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer Profile */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-blue-100 text-indigo-700 flex items-center justify-center font-bold">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{isAdmin ? 'Administrator' : 'Student'}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
