import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import {
  FaUtensils,
  FaBox,
  FaChartLine,
  FaSignOutAlt,
  FaUser,
  FaCalendarAlt
} from 'react-icons/fa';
import '../Auth/Admin.css';
import './ReceiverDashboardNew.css';
import BottomNav from './BottomNav';
import DeliveryProgress from './DeliveryProgress';

const DonorDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    totalDonations: 0,
    mealsProvided: 0,
    pendingPickups: 0,
    impactScore: 95
  });
  const [activeDeliveries, setActiveDeliveries] = useState([]);
  const [recentDonations, setRecentDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchActiveDeliveries();
    fetchRecentDonations();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchStats();
      fetchActiveDeliveries();
      fetchRecentDonations();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get('http://localhost:5000/api/donations/my-donations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        const donations = response.data.donations;
        
        // Calculate real stats
        const totalDonations = donations.length;
        const mealsProvided = donations.reduce((sum, d) => {
          if (d.status === 'DELIVERED' || d.status === 'delivered') {
            return sum + (parseInt(d.quantity) || 0);
          }
          return sum;
        }, 0);
        const pendingPickups = donations.filter(d => 
          ['available', 'claimed', 'assigned', 'ASSIGNED'].includes(d.status)
        ).length;
        
        // Calculate impact score based on deliveries
        const deliveredCount = donations.filter(d => 
          d.status === 'DELIVERED' || d.status === 'delivered'
        ).length;
        const impactScore = totalDonations > 0 
          ? Math.min(95, Math.round((deliveredCount / totalDonations) * 100))
          : 95;
        
        setStats({
          totalDonations,
          mealsProvided,
          pendingPickups,
          impactScore
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveDeliveries = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get('http://localhost:5000/api/donations/my-donations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        // Filter for active deliveries (assigned, picked-up, in-transit)
        const active = response.data.donations.filter(d => 
          ['assigned', 'ASSIGNED', 'picked-up', 'PICKED_UP', 'in-transit', 'ON_THE_WAY'].includes(d.status)
        );
        setActiveDeliveries(active);
      }
    } catch (error) {
      console.error('Error fetching active deliveries:', error);
    }
  };

  const fetchRecentDonations = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get('http://localhost:5000/api/donations/my-donations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        // Get last 5 donations, sorted by creation date
        const recent = response.data.donations
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);
        setRecentDonations(recent);
      }
    } catch (error) {
      console.error('Error fetching recent donations:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfileClick = () => {
    setShowProfileMenu(false);
    navigate('/profile');
  };

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
      <BottomNav role="donor" />

      {/* Content */}
      <div className="dashboard-content">
        <div className="container">
          <div className="card donor-dashboard-header mb-4">
            <h2 className="mb-1">Welcome back, {user?.name}! 🌱</h2>
            <p className="text-muted mb-0">
              Thank you for making a difference by donating surplus food
            </p>
          </div>

          {/* Statistics */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon donor-stat-icon">
                <FaBox />
              </div>
              <div className="stat-content">
                <div className="stat-label">Total Donations</div>
                <div className="stat-value">{stats.totalDonations}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon donor-stat-icon">
                <FaUtensils />
              </div>
              <div className="stat-content">
                <div className="stat-label">Meals Provided</div>
                <div className="stat-value">{stats.mealsProvided}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon donor-stat-icon">
                <FaCalendarAlt />
              </div>
              <div className="stat-content">
                <div className="stat-label">Pending Pickups</div>
                <div className="stat-value">{stats.pendingPickups}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon donor-stat-icon">
                <FaChartLine />
              </div>
              <div className="stat-content">
                <div className="stat-label">Impact Score</div>
                <div className="stat-value">{stats.impactScore}%</div>
              </div>
            </div>
          </div>

          {/* Active Deliveries Section */}
          {activeDeliveries.length > 0 && (
            <div className="active-deliveries-section mt-4">
              <h3 className="section-title" style={{ marginBottom: '16px' }}>🚚 Active Deliveries</h3>
              {activeDeliveries.map((donation) => (
                <DeliveryProgress key={donation._id} donation={donation} />
              ))}
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-2">
            <div className="card card-clickable" onClick={() => navigate('/add-donation')}>
              <h3><FaUtensils /> Create New Donation</h3>
              <p className="text-muted">
                Have surplus food? Create a donation listing now
              </p>
              <button className="btn btn-primary mt-2" onClick={() => navigate('/add-donation')}>
                Create Donation
              </button>
            </div>

            <div className="card card-clickable" onClick={() => navigate('/view-donations')}>
              <h3><FaBox /> View My Donations</h3>
              <p className="text-muted">
                Track all your current and past donations
              </p>
              <button className="btn btn-secondary mt-2" onClick={() => navigate('/view-donations')}>
                View Donations
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card mt-4">
            <h3 className="mb-3">Recent Activity</h3>
            {recentDonations.length === 0 ? (
              <div className="text-center text-muted" style={{ padding: '40px' }}>
                <FaBox size={48} opacity={0.3} />
                <p className="mt-2">No recent donations yet</p>
                <p className="text-sm">Start making a difference by creating your first donation</p>
              </div>
            ) : (
              <div className="recent-donations-list">
                {recentDonations.map((donation) => (
                  <div key={donation._id} className="recent-donation-item">
                    <div className="donation-icon">
                      <FaUtensils />
                    </div>
                    <div className="donation-details">
                      <h4>{donation.foodName}</h4>
                      <p className="donation-meta">
                        {donation.quantity} {donation.quantityUnit} • {donation.foodType}
                      </p>
                      <p className="donation-time">
                        {new Date(donation.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="donation-status">
                      <span className={`status-badge status-${donation.status.toLowerCase()}`}>
                        {donation.status === 'available' && '🟢 Available'}
                        {donation.status === 'claimed' && '🟡 Claimed'}
                        {(donation.status === 'ASSIGNED' || donation.status === 'assigned') && '🔵 Assigned'}
                        {(donation.status === 'PICKED_UP' || donation.status === 'picked-up') && '🟠 Picked Up'}
                        {(donation.status === 'DELIVERED' || donation.status === 'delivered') && '✅ Delivered'}
                        {donation.status === 'rejected' && '🔴 Rejected'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonorDashboard;
