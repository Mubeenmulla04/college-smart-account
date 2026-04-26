import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Common Pages
import Login from '../pages/common/Login';
import Signup from '../pages/common/Signup';
import ForgotPassword from '../pages/common/ForgotPassword';

// Admin Pages
import AdminDashboard from '../pages/admin/Dashboard';
import AddStudent from '../pages/admin/AddStudent';
import FeeReceipt from '../pages/admin/FeeReceipt';
import AdminStudents from '../pages/admin/Students';
import AdminStudentDetail from '../pages/admin/StudentDetail';
import AdminDepartments from '../pages/admin/Departments';
import AdminScholarships from '../pages/admin/AdminScholarships';
import ScholarshipApplications from '../pages/admin/ScholarshipApplications';

// Student Pages
import StudentDashboard from '../pages/student/Dashboard';
import Scholarship from '../pages/student/Scholarship';
import FeePayment from '../pages/student/FeePayment';
import Receipt from '../pages/student/Receipt';
import PaymentHistory from '../pages/student/PaymentHistory';

// Components
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ScrollToTop from '../components/ScrollToTop';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Layout Component
const Layout = ({ children }) => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {isAuthenticated && <Navbar />}
      <main className="flex-1">
        {children}
      </main>
      {isAuthenticated && <Footer />}
    </div>
  );
};

const AppRoutes = () => {
  const { user, isAuthenticated } = useAuth();

  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* <Route path="/admin-setup" element={<AdminSetup />} /> */}

        {/* Protected Admin Routes */}
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout>
                <AdminDashboard />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/add-student" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout>
                <AddStudent />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/fee-receipt" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout>
                <FeeReceipt />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/students" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout>
                <AdminStudents />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/students/:id" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout>
                <AdminStudentDetail />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/departments" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout>
                <AdminDepartments />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/scholarships" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout>
                <AdminScholarships />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/scholarships/applications" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout>
                <ScholarshipApplications />
              </Layout>
            </ProtectedRoute>
          } 
        />

        {/* Protected Student Routes */}
        <Route 
          path="/student/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <Layout>
                <StudentDashboard />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/student/scholarship" 
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <Layout>
                <Scholarship />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/student/fee-payment" 
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <Layout>
                <FeePayment />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/student/receipt" 
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <Layout>
                <Receipt />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/student/payment-history" 
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <Layout>
                <PaymentHistory />
              </Layout>
            </ProtectedRoute>
          } 
        />

        {/* Default Route */}
        <Route 
          path="/" 
          element={
            isAuthenticated ? (
              user?.role === 'admin' ? (
                <Navigate to="/admin/dashboard" replace />
              ) : (
                <Navigate to="/student/dashboard" replace />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;