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

      if (!result.success) {
        console.log('Login failed:', result.message);
        return { success: false, message: result.message || 'Invalid credentials' };
      }

      // Backend requires OTP verification before issuing a token
      if (result.requiresOTP) {
        // In development, the OTP may be returned directly in the response
        return { success: true, requiresOTP: true, email, role: result.role, devOtp: result.otp || null };
      }

      // Direct token (no OTP) — fallback case
      if (result.token) {
        const userData = { ...result.user };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', result.token);
        return { success: true, requiresOTP: false, role: userData.role };
      }

      return { success: false, message: 'Unexpected server response' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'An error occurred during login' };
    }
  };

  const verifyOtp = async (email, otp, role) => {
    try {
      const result = await authAPI.verifyOtp(email, otp, role);

      if (result.success && result.token) {
        const userData = { ...result.user };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', result.token);
        return { success: true };
      }

      return { success: false, message: result.message || 'Invalid OTP' };
    } catch (error) {
      console.error('OTP verification error:', error);
      return { success: false, message: 'An error occurred during OTP verification' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const socialLogin = async (provider) => {
    try {
      setLoading(true);
      // Simulate OAuth redirect or popup delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // For demo: Generate a mock user based on the provider
      const mockEmail = `demo.${provider.toLowerCase()}@example.com`;
      const mockName = `Demo ${provider} User`;
      
      const result = await authAPI.socialLogin({
        email: mockEmail,
        name: mockName,
        provider: provider
      });

      if (result.success && result.token) {
        const userData = { ...result.user };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', result.token);
        return { success: true };
      }

      return { success: false, message: result.message || 'Social login failed' };
    } catch (error) {
      console.error('Social login error:', error);
      return { success: false, message: 'An error occurred during social login' };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email) => {
    try {
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
    verifyOtp,
    socialLogin,
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