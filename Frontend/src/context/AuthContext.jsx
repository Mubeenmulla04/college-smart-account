import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user data on app load
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password, role) => {
    try {
      console.log('Login attempt:', { email, role });
      
      const result = await authAPI.login(email, password, role);
      
      if (result.success && result.token) {
        const userData = { ...result.user };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', result.token);
        return true;
      }
      
      console.log('Login failed:', result.message);
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const resetPassword = async (email) => {
    try {
      // In a production app, this would be a dedicated API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log(`Password reset requested for ${email}`);
      return true;
    } catch (error) {
      console.error('Reset password error:', error);
      return false;
    }
  };

  const value = {
    user,
    login,
    logout,
    resetPassword,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isStudent: user?.role === 'student'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};