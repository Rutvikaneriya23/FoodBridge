import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  signup: (userData) => {
    // Check if userData is FormData (for file upload)
    const isFormData = userData instanceof FormData;
    return api.post('/auth/signup', userData, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {}
    });
  },
  login: (credentials) => api.post('/auth/login', credentials),
  googleLogin: (credential) => api.post('/auth/google', { credential }),
  selectRole: (role) => api.post('/auth/select-role', { role }),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout')
};

// Admin API
export const adminAPI = {
  login: (credentials) => api.post('/admin/login', credentials),
  getUsers: (params) => api.get('/admin/users', { params }),
  getUserById: (id) => api.get(`/admin/users/${id}`),
  verifyUser: (id) => api.patch(`/admin/users/${id}/verify`),
  suspendUser: (id, suspend) => api.patch(`/admin/users/${id}/suspend`, { suspend }),
  getStats: () => api.get('/admin/stats'),
  logout: () => api.post('/admin/logout')
};

// Profile API
export const profileAPI = {
  getProfile: () => api.get('/profile'),
  updateProfile: (data) => api.patch('/profile', data),
  changeRole: (role) => api.patch('/profile/role', { role })
};

export default api;
