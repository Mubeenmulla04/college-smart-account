import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Students API
export const studentsAPI = {
  getAll: (params) => api.get('/students', { params }),
  getProfile: () => api.get('/students/profile'),
  getById: (id) => api.get(`/students/${id}`),
  getByEmail: (email) => api.get(`/students?email=${email}`),
  create: (student) => api.post('/students', student),
  update: (id, student) => api.put(`/students/${id}`, student),
  delete: (id) => api.delete(`/students/${id}`),
  updateFees: (id, fees) => {
    return api.get(`/students/${id}`).then(studentRes => {
      return api.put(`/students/${id}`, { ...studentRes.data, fees });
    });
  },
  updateScholarship: (id, scholarship) => {
    return api.get(`/students/${id}`).then(studentRes => {
      return api.put(`/students/${id}`, { ...studentRes.data, scholarship });
    });
  },
};

// Admins API
export const adminsAPI = {
  getAll: () => api.get('/admins'),
  getByEmail: (email) => api.get(`/admins?email=${email}`),
  create: (admin) => api.post('/admins', admin),
  update: (id, admin) => api.put(`/admins/${id}`, admin),
  delete: (id) => api.delete(`/admins/${id}`),
};

// Departments API
export const departmentsAPI = {
  getAll: () => api.get('/departments'),
  getById: (id) => api.get(`/departments/${id}`),
  create: (department) => api.post('/departments', department),
  update: (id, department) => api.put(`/departments/${id}`, department),
  delete: (id) => api.delete(`/departments/${id}`),
};

// Scholarships API
export const scholarshipsAPI = {
  getAll: () => api.get('/scholarships'),
  getById: (id) => api.get(`/scholarships/${id}`),
  create: (scholarship) => api.post('/scholarships', scholarship),
  update: (id, scholarship) => api.put(`/scholarships/${id}`, scholarship),
  delete: (id) => api.delete(`/scholarships/${id}`),
  
  // Application endpoints
  apply: (applicationData) => api.post('/scholarships/apply', applicationData),
  getMyApplications: () => api.get('/scholarships/my-applications'),
  getAllApplications: () => api.get('/scholarships/admin/all-applications'),
  reviewApplication: (id, reviewData) => api.put(`/scholarships/admin/review/${id}`, reviewData),
};

// Fee Receipts API
export const feeReceiptsAPI = {
  getAll: () => api.get('/feeReceipts'),
  getById: (id) => api.get(`/feeReceipts/${id}`),
  getByStudentId: (studentId) => api.get(`/feeReceipts/student/${studentId}`),
  create: (receipt) => api.post('/feeReceipts', receipt),
  update: (id, receipt) => api.put(`/feeReceipts/${id}`, receipt),
  delete: (id) => api.delete(`/feeReceipts/${id}`),
};

// Authentication API
export const authAPI = {
  login: async (email, password, role) => {
    try {
      const response = await api.post('/auth/login', { email, password, role });
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  },
  verifyOtp: async (email, otp, role) => {
    try {
      const response = await api.post('/auth/verify-otp', { email, otp, role });
      return response.data;
    } catch (error) {
      console.error('OTP verification error:', error);
      return { success: false, message: error.response?.data?.message || 'OTP verification failed' };
    }
  },
  register: async (studentData) => {
    try {
      const response = await api.post('/auth/register', studentData);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: error.response?.data?.message || 'Registration failed' };
    }
  },
  socialLogin: async (data) => {
    try {
      const response = await api.post('/auth/social-login', data);
      return response.data;
    } catch (error) {
      console.error('Social login error:', error);
      return { success: false, message: error.response?.data?.message || 'Social login failed' };
    }
  },
};

// Dashboard Statistics API
export const dashboardAPI = {
  getAdminStats: async () => {
    try {
      const response = await api.get('/dashboard/admin');
      return response.data;
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      return {
        totalStudents: 0,
        totalFees: 0,
        pendingFees: 0,
        scholarshipApplications: 0,
        recentStudents: []
      };
    }
  },

  getStudentStats: async () => {
    try {
      const response = await studentsAPI.getProfile();
      return response.data || null;
    } catch (error) {
      console.error('Error fetching student stats:', error);
      return null;
    }
  },
  
  getFeesReceiptByStudentId: async (studentId) => {
    try {
      const response = await feeReceiptsAPI.getByStudentId(studentId);
      const receipts = response.data || response;
      
      if (Array.isArray(receipts) && receipts.length > 0) {
        const totalAmount = receipts.reduce((sum, receipt) => sum + (receipt.amount || 0), 0);
        return {
          amount: totalAmount,
          count: receipts.length,
          latestReceipt: receipts[0]
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching fees receipt by student ID:', error);
      return null;
    }
  }
};

export default api;