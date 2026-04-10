import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, requireRole, requireAdmin }) => {
  const { user, admin, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-large spinner-primary"></div>
      </div>
    );
  }

  // Admin route protection
  if (requireAdmin) {
    if (!admin) {
      return <Navigate to="/admin/login" replace />;
    }
    return children;
  }

  // User route protection
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if role selection is required
  if (!user.role && !window.location.pathname.includes('select-role')) {
    return <Navigate to="/select-role" replace />;
  }

  // Check role-specific access
  if (requireRole && user.role !== requireRole) {
    return <Navigate to={`/${user.role}-dashboard`} replace />;
  }

  return children;
};

export default ProtectedRoute;
