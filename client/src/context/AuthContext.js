import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI, adminAPI } from '../utils/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const adminToken = localStorage.getItem('adminToken');
      
      if (adminToken) {
        const storedAdmin = JSON.parse(localStorage.getItem('admin') || '{}');
        setAdmin(storedAdmin);
      } else if (token) {
        const response = await authAPI.getMe();
        setUser(response.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('admin');
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    try {
      setError(null);
      const response = await authAPI.signup(userData);
      const { token, user: newUser } = response.data;
      
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(newUser));
      setUser(newUser);
      
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Signup failed';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const login = async (credentials) => {
    try {
      setError(null);
      const response = await authAPI.login(credentials);
      const { token, user: loggedUser } = response.data;
      
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(loggedUser));
      setUser(loggedUser);
      
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Login failed';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const googleLogin = async (credential) => {
    try {
      setError(null);
      const response = await authAPI.googleLogin(credential);
      const { token, user: loggedUser } = response.data;
      
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(loggedUser));
      setUser(loggedUser);
      
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Google login failed';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const adminLogin = async (credentials) => {
    try {
      setError(null);
      const response = await adminAPI.login(credentials);
      const { token, admin: loggedAdmin } = response.data;
      
      localStorage.setItem('adminToken', token);
      localStorage.setItem('admin', JSON.stringify(loggedAdmin));
      localStorage.setItem('authToken', token); // Use same token for API calls
      setAdmin(loggedAdmin);
      
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Admin login failed';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const selectRole = async (role) => {
    try {
      setError(null);
      const response = await authAPI.selectRole(role);
      const updatedUser = response.data.user;
      const newToken = response.data.token; // ✅ Get new token from backend
      
      console.log('Role selection response:', response.data);
      console.log('Updated user:', updatedUser);
      console.log('New token received:', newToken ? 'Yes' : 'No');
      
      // ✅ CRITICAL: Save new token with updated role
      if (newToken) {
        localStorage.setItem('authToken', newToken);
        console.log('✅ New token saved to localStorage');
      }
      
      // Create complete user object with all fields
      const completeUser = {
        ...user,
        ...updatedUser,
        role: updatedUser.role // Ensure role is explicitly set
      };
      
      console.log('Complete user object:', completeUser);
      
      setUser(completeUser);
      localStorage.setItem('user', JSON.stringify(completeUser));
      
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Role selection failed';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
    setError(null);
  };

  const adminLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin');
    localStorage.removeItem('authToken');
    setAdmin(null);
    setError(null);
  };

  const updateUser = (updatedData) => {
    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    admin,
    loading,
    error,
    signup,
    login,
    googleLogin,
    adminLogin,
    selectRole,
    logout,
    adminLogout,
    updateUser,
    isAuthenticated: !!user,
    isAdmin: !!admin
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
