import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import {
  FaTruck,
  FaRoute,
  FaStar,
  FaSignOutAlt,
  FaUser,
  FaHandsHelping,
  FaCheckCircle,
  FaMapMarkerAlt,
  FaPhone,
  FaClock,
  FaComments,
  FaBox
} from 'react-icons/fa';
import '../Auth/Admin.css';
import './Donation.css';
import './ReceiverDashboardNew.css';
import BottomNav from './BottomNav';

const VolunteerDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('available');
  const [availableDeliveries, setAvailableDeliveries] = useState([]);
  const [myDeliveries, setMyDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyData, setVerifyData] = useState({
    qualityRating: 5,
    verificationNotes: ''
  });
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchDeliveries();
    fetchNotifications();
    const interval = setInterval(() => {
      fetchDeliveries();
      fetchNotifications();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDeliveries = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      // Get available deliveries (claimed status)
      const availableRes = await axios.get(
        'http://localhost:5000/api/receiver-volunteer/available-for-volunteers',
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Get my deliveries
      const myRes = await axios.get('http://localhost:5000/api/donations', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (availableRes.data.success) {
        setAvailableDeliveries(availableRes.data.donations);
      }

      if (myRes.data.success) {
        const mine = myRes.data.donations.filter(
          d => d.assignedTo?.volunteer === user._id
        );
        setMyDeliveries(mine);
      }

      setLoading(false);
    } catch (err) {
      console.error('Fetch deliveries error:', err);
      setError(err.response?.data?.message || 'Failed to fetch deliveries');
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get('http://localhost:5000/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setNotifications(response.data.notifications.slice(0, 5));
        setUnreadCount(response.data.unreadCount);
      }
    } catch (err) {
      console.error('Fetch notifications error:', err);
    }
  };

  const handleAcceptDelivery = async (donationId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post(
        `http://localhost:5000/api/receiver-volunteer/${donationId}/accept-volunteer`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        navigate(`/verify-pickup/${donationId}`);
      }
    } catch (err) {
      console.error('Accept delivery error:', err);
      alert(err.response?.data?.message || 'Failed to accept delivery');
    }
  };

  const handleVerifyQuality = (delivery) => {
    setSelectedDelivery(delivery);
    setShowVerifyModal(true);
  };

  const submitQualityVerification = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post(
        `http://localhost:5000/api/receiver-volunteer/${selectedDelivery._id}/verify-quality`,
        verifyData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert('Quality verified successfully!');
        setShowVerifyModal(false);
        setVerifyData({ qualityRating: 5, verificationNotes: '' });
        fetchDeliveries();
      }
    } catch (err) {
      console.error('Verify quality error:', err);
      alert(err.response?.data?.message || 'Failed to verify quality');
    }
  };

  const handleUpdateStatus = async (donationId, status) => {
    const statusMessages = {
      'picked-up': 'Mark as picked up?',
      'in-transit': 'Start delivery (on the way)?',
      'delivered': 'Confirm delivery completion?'
    };

    if (!window.confirm(statusMessages[status])) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      
      // For demo, using static location. In production, use geolocation
      const location = {
        lat: 28.6139,
        lng: 77.2090,
        address: 'Current Location'
      };

      const response = await axios.post(
        `http://localhost:5000/api/receiver-volunteer/${donationId}/update-status`,
        { status, location },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert('Status updated successfully!');
        fetchDeliveries();
      }
    } catch (err) {
      console.error('Update status error:', err);
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getStatusBadge = (status) => {
    const badges = {
      claimed: { label: 'Claimed', className: 'badge-claimed' },
      assigned: { label: 'Assigned to Me', className: 'badge-assigned' },
      verified: { label: 'Quality Verified', className: 'badge-verified' },
      'picked-up': { label: 'Picked Up', className: 'badge-picked' },
      'in-transit': { label: 'In Transit', className: 'badge-transit' },
      delivered: { label: 'Delivered', className: 'badge-delivered' }
    };
    const badge = badges[status] || { label: status, className: 'badge-available' };
    return <span className={`status-badge ${badge.className}`}>{badge.label}</span>;
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const stats = {
    totalDeliveries: myDeliveries.length,
    completedDeliveries: myDeliveries.filter(d => d.status === 'delivered').length,
    activeDeliveries: myDeliveries.filter(d => !['delivered', 'cancelled'].includes(d.status)).length,
    availableNow: availableDeliveries.length
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
      <BottomNav role="volunteer" />

      {/* Content */}
      <div className="dashboard-content">
        <div className="container">
          <div className="card volunteer-dashboard-header mb-4">
            <h2 className="mb-1">Welcome, {user?.name}! 🚚</h2>
            <p className="text-muted mb-0">
              Help deliver food to those in need
            </p>
          </div>

          {/* Statistics */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon volunteer-stat-icon">
                <FaTruck />
              </div>
              <div className="stat-content">
                <div className="stat-label">Total Deliveries</div>
                <div className="stat-value">{stats.totalDeliveries}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon volunteer-stat-icon">
                <FaCheckCircle />
              </div>
              <div className="stat-content">
                <div className="stat-label">Completed</div>
                <div className="stat-value">{stats.completedDeliveries}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon volunteer-stat-icon">
                <FaRoute />
              </div>
              <div className="stat-content">
                <div className="stat-label">Active Deliveries</div>
                <div className="stat-value">{stats.activeDeliveries}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon volunteer-stat-icon">
                <FaHandsHelping />
              </div>
              <div className="stat-content">
                <div className="stat-label">Available Now</div>
                <div className="stat-value">{stats.availableNow}</div>
              </div>
            </div>
          </div>

          {/* Notifications */}
          {notifications.length > 0 && (
            <div className="card mb-4" style={{ background: '#e3f2fd' }}>
              <h3 className="mb-3">Recent Notifications</h3>
              <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                {notifications.map((notif) => (
                  <div
                    key={notif._id}
                    style={{
                      padding: '10px',
                      borderBottom: '1px solid #ddd',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: notif.read ? 'transparent' : '#fff'
                    }}
                  >
                    <div>
                      <strong>{notif.title}</strong>
                      <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}>{notif.message}</p>
                    </div>
                    <small className="text-muted">{formatDateTime(notif.createdAt)}</small>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Filter Tabs */}
          <div className="filter-tabs">
            <button
              className={`filter-tab ${activeTab === 'available' ? 'active' : ''}`}
              onClick={() => setActiveTab('available')}
            >
              Available Deliveries ({availableDeliveries.length})
            </button>
            <button
              className={`filter-tab ${activeTab === 'mydeliveries' ? 'active' : ''}`}
              onClick={() => setActiveTab('mydeliveries')}
            >
              My Deliveries ({myDeliveries.length})
            </button>
          </div>

          {/* Deliveries List */}
          {loading ? (
            <div className="text-center" style={{ padding: '40px' }}>
              <p>Loading deliveries...</p>
            </div>
          ) : error ? (
            <div className="card" style={{ background: '#ffebee' }}>
              <p style={{ color: '#c62828', margin: 0 }}>{error}</p>
            </div>
          ) : (
            <div>
              {activeTab === 'available' && (
                <div className="donations-grid">
                  {availableDeliveries.length === 0 ? (
                    <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
                      <FaTruck size={48} opacity={0.3} />
                      <p className="mt-2">No deliveries available at this time</p>
                      <p className="text-sm text-muted">Check back soon for new delivery requests</p>
                    </div>
                  ) : (
                    availableDeliveries.map((delivery) => (
                      <div key={delivery._id} className="donation-card">
                        {delivery.foodImage && (
                          <div className="donation-image-container">
                            <img
                              src={delivery.foodImage}
                              alt={delivery.foodName}
                              className="donation-image"
                            />
                            {getStatusBadge(delivery.status)}
                          </div>
                        )}
                        <div className="donation-content">
                          <h3>{delivery.foodName}</h3>
                          <div className="donation-info">
                            <p><strong>Type:</strong> {delivery.foodType}</p>
                            <p><strong>Quantity:</strong> {delivery.quantity} {delivery.quantityUnit}</p>
                            
                            <div style={{ background: '#e8f5e9', padding: '10px', borderRadius: '5px', marginTop: '10px' }}>
                              <p style={{ margin: 0, fontWeight: 'bold' }}>
                                <FaMapMarkerAlt /> Pickup Location
                              </p>
                              <p style={{ margin: '5px 0 0 0' }}>
                                {delivery.donorLocation}
                              </p>
                              <p style={{ margin: '5px 0 0 0' }}>
                                <FaPhone /> {delivery.donorPhone}
                              </p>
                              <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>
                                Contact: {delivery.donorName}
                              </p>
                            </div>

                            <div style={{ background: '#fff3e0', padding: '10px', borderRadius: '5px', marginTop: '10px' }}>
                              <p style={{ margin: 0, fontWeight: 'bold' }}>
                                <FaMapMarkerAlt /> Delivery Location
                              </p>
                              <p style={{ margin: '5px 0 0 0' }}>
                                {delivery.assignedTo?.receiver?.location || 'Receiver location'}
                              </p>
                              <p style={{ margin: '5px 0 0 0' }}>
                                <FaPhone /> {delivery.assignedTo?.receiver?.phone || 'Contact info'}
                              </p>
                              <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>
                                Receiver: {delivery.assignedTo?.receiver?.name || 'Name'}
                              </p>
                            </div>

                            <p>
                              <FaClock /> <strong>Claimed:</strong> {formatDateTime(delivery.updatedAt)}
                            </p>
                          </div>
                          <div className="donation-actions">
                            <button
                              className="btn btn-primary"
                              onClick={() => handleAcceptDelivery(delivery._id)}
                            >
                              <FaCheckCircle /> Accept Delivery
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'mydeliveries' && (
                <div className="donations-grid">
                  {myDeliveries.length === 0 ? (
                    <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
                      <FaBox size={48} opacity={0.3} />
                      <p className="mt-2">You haven't accepted any deliveries yet</p>
                      <p className="text-sm text-muted">Check available deliveries and accept one</p>
                    </div>
                  ) : (
                    myDeliveries.map((delivery) => (
                      <div key={delivery._id} className="donation-card">
                        {delivery.foodImage && (
                          <div className="donation-image-container">
                            <img
                              src={delivery.foodImage}
                              alt={delivery.foodName}
                              className="donation-image"
                            />
                            {getStatusBadge(delivery.status)}
                          </div>
                        )}
                        <div className="donation-content">
                          <h3>{delivery.foodName}</h3>
                          <div className="donation-info">
                            <p><strong>Type:</strong> {delivery.foodType}</p>
                            <p><strong>Quantity:</strong> {delivery.quantity} {delivery.quantityUnit}</p>
                            <p><strong>Status:</strong> {getStatusBadge(delivery.status)}</p>

                            {/* Quality Verification Status */}
                            {delivery.qualityVerification?.verified && (
                              <div style={{ background: '#e8f5e9', padding: '10px', borderRadius: '5px', marginTop: '10px' }}>
                                <p style={{ margin: 0 }}>
                                  <FaStar style={{ color: '#ffc107' }} />{' '}
                                  <strong>Quality Verified:</strong> {delivery.qualityVerification.qualityRating}/5
                                </p>
                              </div>
                            )}

                            <div style={{ background: '#e8f5e9', padding: '10px', borderRadius: '5px', marginTop: '10px' }}>
                              <p style={{ margin: 0, fontWeight: 'bold' }}>
                                <FaMapMarkerAlt /> Pickup from
                              </p>
                              <p style={{ margin: '5px 0 0 0' }}>{delivery.donorLocation}</p>
                              <p style={{ margin: '5px 0 0 0' }}>
                                <FaPhone /> {delivery.donorPhone}
                              </p>
                            </div>

                            <div style={{ background: '#fff3e0', padding: '10px', borderRadius: '5px', marginTop: '10px' }}>
                              <p style={{ margin: 0, fontWeight: 'bold' }}>
                                <FaMapMarkerAlt /> Deliver to
                              </p>
                              <p style={{ margin: '5px 0 0 0' }}>
                                {delivery.assignedTo?.receiver?.location || 'Receiver location'}
                              </p>
                              <p style={{ margin: '5px 0 0 0' }}>
                                <FaPhone /> {delivery.assignedTo?.receiver?.phone || 'Contact'}
                              </p>
                            </div>

                            {delivery.status === 'delivered' && (
                              <div style={{ background: '#c8e6c9', padding: '10px', borderRadius: '5px', marginTop: '10px' }}>
                                <p style={{ margin: 0, color: '#2e7d32' }}>
                                  <FaCheckCircle /> Delivery completed successfully!
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="donation-actions" style={{ flexWrap: 'wrap', gap: '10px' }}>
                            {delivery.status === 'assigned' && (
                              <button
                                className="btn btn-primary"
                                onClick={() => handleVerifyQuality(delivery)}
                              >
                                <FaStar /> Verify Quality
                              </button>
                            )}
                            
                            {delivery.status === 'verified' && (
                              <button
                                className="btn btn-primary"
                                onClick={() => handleUpdateStatus(delivery._id, 'picked-up')}
                              >
                                <FaBox /> Mark Picked Up
                              </button>
                            )}

                            {delivery.status === 'picked-up' && (
                              <button
                                className="btn btn-primary"
                                onClick={() => handleUpdateStatus(delivery._id, 'in-transit')}
                              >
                                <FaTruck /> Start Delivery
                              </button>
                            )}

                            {delivery.status === 'in-transit' && (
                              <button
                                className="btn btn-primary"
                                onClick={() => handleUpdateStatus(delivery._id, 'delivered')}
                              >
                                <FaCheckCircle /> Mark Delivered
                              </button>
                            )}

                            <button
                              className="btn btn-secondary"
                              onClick={() => navigate(`/chat/${delivery._id}`)}
                            >
                              <FaComments /> Chat
                            </button>

                            {['in-transit', 'picked-up'].includes(delivery.status) && (
                              <button
                                className="btn btn-secondary"
                                onClick={() => alert('Map integration coming soon!')}
                              >
                                <FaRoute /> View Map
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quality Verification Modal */}
      {showVerifyModal && (
        <div className="modal-overlay" onClick={() => setShowVerifyModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Verify Food Quality</h3>
            <p style={{ marginBottom: '20px' }}>
              Inspect the food and rate its quality before pickup
            </p>

            <div className="form-group">
              <label>Quality Rating (1-5)</label>
              <select
                value={verifyData.qualityRating}
                onChange={(e) => setVerifyData({ ...verifyData, qualityRating: parseInt(e.target.value) })}
                className="form-input"
              >
                <option value="5">5 - Excellent</option>
                <option value="4">4 - Good</option>
                <option value="3">3 - Fair</option>
                <option value="2">2 - Poor</option>
                <option value="1">1 - Unacceptable</option>
              </select>
            </div>

            <div className="form-group">
              <label>Verification Notes (Optional)</label>
              <textarea
                value={verifyData.verificationNotes}
                onChange={(e) => setVerifyData({ ...verifyData, verificationNotes: e.target.value })}
                className="form-input"
                rows="3"
                placeholder="Add any observations about the food quality..."
              ></textarea>
            </div>

            <div className="modal-actions">
              <button className="btn btn-primary" onClick={submitQualityVerification}>
                <FaCheckCircle /> Submit Verification
              </button>
              <button className="btn btn-secondary" onClick={() => setShowVerifyModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VolunteerDashboard;
