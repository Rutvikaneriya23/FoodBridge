import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaLock, FaShieldAlt } from 'react-icons/fa';
import '../Auth/Auth.css';
import './Admin.css';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { adminLogin } = useAuth();
  const [formData, setFormData] = useState({
    adminId: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await adminLogin(formData);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container admin-auth-container">
      <div className="auth-card admin-auth-card fade-in">
        <div className="admin-header">
          <div className="admin-icon" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <img src="/Foodbridge_black.svg" alt="FoodBridge" style={{ height: '100px', width: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 6px 12px rgba(255, 140, 0, 0.4))' }} />
            <h2 style={{ margin: 0, fontFamily: 'Poppins, sans-serif', fontSize: '38px', fontWeight: '800', background: 'linear-gradient(135deg, #FF8C00 0%, #FF6B00 50%, #FFB347 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-1px', textShadow: '0 2px 4px rgba(255, 140, 0, 0.2)' }}>Food Bridge</h2>
          </div>
          <h1>Admin Access</h1>
          <p className="admin-subtitle">
            <FaLock /> Restricted Area - Authorized Personnel Only
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="adminId">Admin ID</label>
            <input
              type="text"
              id="adminId"
              name="adminId"
              placeholder="Enter admin ID"
              value={formData.adminId}
              onChange={handleChange}
              required
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter admin password"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-admin btn-large btn-block"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Authenticating...
              </>
            ) : (
              <>
                <FaLock /> Login as Admin
              </>
            )}
          </button>
        </form>

        <div className="admin-footer">
          <p className="text-sm text-center">
            <FaShieldAlt size={12} /> All admin activities are logged and monitored
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
