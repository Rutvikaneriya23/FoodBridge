import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminAPI } from '../../utils/api';
import {
  FaUsers,
  FaUserCheck,
  FaUserTimes,
  FaChartLine,
  FaSignOutAlt,
  FaShieldAlt,
  FaUtensils,
  FaTruck,
  FaUser,
  FaIdCard,
  FaEye,
  FaTimes,
  FaCheckCircle
} from 'react-icons/fa';
import '../Auth/Admin.css';
import './ReceiverDashboardNew.css';
import BottomNav from './BottomNav';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { admin, adminLogout } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showAadharModal, setShowAadharModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getUsers({ limit: 10 })
      ]);
      
      setStats(statsRes.data.stats);
      setUsers(usersRes.data.users);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    adminLogout();
    navigate('/admin/login');
  };

  const handleProfileClick = () => {
    setShowProfileMenu(false);
    navigate('/profile');
  };

  const handleVerifyUser = async (userId) => {
    try {
      await adminAPI.verifyUser(userId);
      fetchData();
    } catch (err) {
      alert('Failed to verify user');
    }
  };


  const handleSuspendUser = async (userId, suspend) => {
    try {
      await adminAPI.suspendUser(userId, suspend);
      fetchData();
    } catch (err) {
      alert('Failed to update user status');
    }
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-large spinner-primary"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <header className="dashboard-header">
        <div className="container">
          <div className="dashboard-logo">
            <img src="/Foodbridge_black.svg" alt="FoodBridge" style={{ height: '60px', width: 'auto', objectFit: 'contain' }} />
            <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '32px', fontWeight: '800', letterSpacing: '-0.5px' }}>Food Bridge</span>
          </div>
        </div>
      </header>

      {/* Top Right Navigation */}
      <BottomNav role="admin" />

      {/* Content */}
      <div className="dashboard-content">
        <div className="container">
          {error && (
            <div className="alert alert-error mb-3">
              {error}
            </div>
          )}

          <div className="card admin-dashboard-header mb-4">
            <h2 className="mb-1">Command Center</h2>
            <p className="text-muted mb-0">
              Monitor and manage the entire FoodBridge platform
            </p>
          </div>

          {/* Statistics */}
          <div className="stats-grid">
            <div className="stat-card admin-stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#607D8B15', color: '#607D8B' }}>
                <FaUsers />
              </div>
              <div className="stat-content">
                <div className="stat-label">Total Users</div>
                <div className="stat-value">{stats?.totalUsers || 0}</div>
              </div>
            </div>

            <div className="stat-card admin-stat-card">
              <div className="stat-icon donor-stat-icon">
                <FaUtensils />
              </div>
              <div className="stat-content">
                <div className="stat-label">Donors</div>
                <div className="stat-value">{stats?.usersByRole?.donors || 0}</div>
              </div>
            </div>

            <div className="stat-card admin-stat-card">
              <div className="stat-icon receiver-stat-icon">
                <FaUsers />
              </div>
              <div className="stat-content">
                <div className="stat-label">Receivers</div>
                <div className="stat-value">{stats?.usersByRole?.receivers || 0}</div>
              </div>
            </div>

            <div className="stat-card admin-stat-card">
              <div className="stat-icon volunteer-stat-icon">
                <FaTruck />
              </div>
              <div className="stat-content">
                <div className="stat-label">Volunteers</div>
                <div className="stat-value">{stats?.usersByRole?.volunteers || 0}</div>
              </div>
            </div>

            <div className="stat-card admin-stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#4CAF5015', color: '#4CAF50' }}>
                <FaUserCheck />
              </div>
              <div className="stat-content">
                <div className="stat-label">Verified Users</div>
                <div className="stat-value">{stats?.verifiedUsers || 0}</div>
              </div>
            </div>

            <div className="stat-card admin-stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#F4433615', color: '#F44336' }}>
                <FaUserTimes />
              </div>
              <div className="stat-content">
                <div className="stat-label">Suspended</div>
                <div className="stat-value">{stats?.suspendedUsers || 0}</div>
              </div>
            </div>
          </div>

          {/* Recent Users Table */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Recent Users</h3>
              <p className="card-subtitle">Latest user registrations</p>
            </div>

            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className="status-badge status-active">
                          {user.role || 'Pending'}
                        </span>
                      </td>
                      <td>
                        {user.isSuspended ? (
                          <span className="status-badge status-suspended">Suspended</span>
                        ) : user.isVerified ? (
                          <span className="status-badge status-verified">Verified</span>
                        ) : (
                          <span className="status-badge status-pending">Pending</span>
                        )}
                      </td>
                      <td>
                        <div className="action-buttons">
                          {!user.isVerified && (
                            <button
                              onClick={() => handleVerifyUser(user._id)}
                              className="btn btn-primary btn-small"
                              title="Verify User"
                            >
                              <FaUserCheck />
                            </button>
                          )}
                          <button
                            onClick={() => handleSuspendUser(user._id, !user.isSuspended)}
                            className={`btn btn-small ${user.isSuspended ? 'btn-primary' : 'btn-danger'}`}
                            title={user.isSuspended ? 'Activate' : 'Suspend'}
                          >
                            <FaUserTimes />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
