import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { FaCheckCircle, FaTruck, FaMapMarkerAlt, FaUser, FaChevronDown, FaSignOutAlt } from 'react-icons/fa';
import '../Auth/Admin.css';
import './VolunteerDashboardNew.css';
import BottomNav from './BottomNav';

const VolunteerDashboardNew = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Registration form states
  const [volunteerData, setVolunteerData] = useState({
    fullName: user?.name || '',
    phoneNumber: user?.phone || '',
    vehicleType: '',
    availability: {
      morning: false,
      afternoon: false,
      evening: false
    },
    serviceRadius: 5
  });

  // Delivery states
  const [availableDeliveries, setAvailableDeliveries] = useState([]);
  const [activeDeliveries, setActiveDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    fetchDeliveries();
    const interval = setInterval(fetchDeliveries, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDeliveries = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      // Get available deliveries
      const availableRes = await axios.get(
        'http://localhost:5000/api/receiver-volunteer/available-for-volunteers',
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Get my active deliveries
      const myRes = await axios.get('http://localhost:5000/api/donations', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (availableRes.data.success) {
        setAvailableDeliveries(availableRes.data.donations);
      }

      if (myRes.data.success) {
        const active = myRes.data.donations.filter(
          d => d.assignedTo?.volunteer === user._id && d.status === 'in_transit'
        );
        setActiveDeliveries(active);
      }

      setLoading(false);
    } catch (err) {
      console.error('Fetch deliveries error:', err);
      setError(err.response?.data?.message || 'Failed to fetch deliveries');
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('authToken');
      // Here you can save volunteer preferences
      await axios.patch(
        'http://localhost:5000/api/profile',
        {
          name: volunteerData.fullName,
          phone: volunteerData.phoneNumber
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsRegistered(true);
      alert('Registered successfully! You can now accept delivery tasks.');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
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
      setError(err.response?.data?.message || 'Failed to accept delivery');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setVolunteerData({ ...volunteerData, [name]: value });
  };

  const handleAvailabilityChange = (e) => {
    const { name, checked } = e.target;
    setVolunteerData({
      ...volunteerData,
      availability: {
        ...volunteerData.availability,
        [name]: checked
      }
    });
  };

  const handleRadiusChange = (e) => {
    setVolunteerData({ ...volunteerData, serviceRadius: e.target.value });
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/login');
    }
  };

  const getUserInitial = () => {
    return user?.name ? user.name.charAt(0).toUpperCase() : 'V';
  };

  const calculateDistance = (donation) => {
    // Mock distance calculation - in real app, use Haversine formula
    return (Math.random() * 5 + 1).toFixed(1);
  };

  const calculateReward = (donation) => {
    // Mock reward calculation based on distance
    const distance = parseFloat(calculateDistance(donation));
    return Math.round(distance * 15);
  };

  const getTimeSince = (date) => {
    const minutes = Math.floor((new Date() - new Date(date)) / 60000);
    if (minutes < 60) return `${minutes} mins ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours} hours ago`;
  };

  return (
    <div className="volunteer-dashboard-new">
      {/* Header with Logo */}
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

      {/* Main Content */}
      <div className="volunteer-content-grid">
        {/* Left Side - Registration Form */}
        <div className="volunteer-register-section">
          <div className="register-card">
            <h2 className="register-title">Register as Volunteer</h2>

            <form onSubmit={handleRegister} className="register-form">
              <div className="form-group-volunteer">
                <label>Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={volunteerData.fullName}
                  onChange={handleInputChange}
                  required
                  className="form-input-volunteer"
                />
              </div>

              <div className="form-group-volunteer">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={volunteerData.phoneNumber}
                  onChange={handleInputChange}
                  required
                  className="form-input-volunteer"
                />
              </div>

              <div className="form-group-volunteer">
                <label>Vehicle Type</label>
                <select
                  name="vehicleType"
                  value={volunteerData.vehicleType}
                  onChange={handleInputChange}
                  required
                  className="form-select-volunteer"
                >
                  <option value="">Select</option>
                  <option value="bike">Bike</option>
                  <option value="scooter">Scooter</option>
                  <option value="car">Car</option>
                  <option value="van">Van</option>
                </select>
              </div>

              <div className="form-group-volunteer">
                <label>Availability</label>
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="morning"
                      checked={volunteerData.availability.morning}
                      onChange={handleAvailabilityChange}
                    />
                    <span>Morning (6AM - 12PM)</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="afternoon"
                      checked={volunteerData.availability.afternoon}
                      onChange={handleAvailabilityChange}
                    />
                    <span>Afternoon (12PM - 6PM)</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="evening"
                      checked={volunteerData.availability.evening}
                      onChange={handleAvailabilityChange}
                    />
                    <span>Evening (6PM - 10PM)</span>
                  </label>
                </div>
              </div>

              <div className="form-group-volunteer">
                <label>Service Area (km radius)</label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={volunteerData.serviceRadius}
                  onChange={handleRadiusChange}
                  className="range-slider"
                />
                <div className="range-value">{volunteerData.serviceRadius} km</div>
              </div>

              <button type="submit" className="register-button-volunteer">
                Register
              </button>
            </form>
          </div>

          {/* Active Deliveries Section */}
          <div className="active-deliveries-section">
            <h2 className="section-title">Active Deliveries</h2>
            {activeDeliveries.length === 0 ? (
              <div className="no-deliveries">
                <FaTruck className="no-deliveries-icon" />
                <p>No active deliveries</p>
              </div>
            ) : (
              <div className="active-deliveries-list">
                {activeDeliveries.map((delivery) => (
                  <div 
                    key={delivery._id} 
                    className="delivery-card-active"
                  >
                    <div className="delivery-header-active">
                      <span className="delivery-status">In Transit</span>
                      <span className="delivery-time">{getTimeSince(delivery.claimedAt)}</span>
                    </div>
                    <div className="delivery-route">
                      <div className="route-point">
                        <FaMapMarkerAlt className="marker-icon pickup" />
                        <span>{delivery.pickupLocation}</span>
                      </div>
                      <div className="route-line"></div>
                      <div className="route-point">
                        <FaMapMarkerAlt className="marker-icon dropoff" />
                        <span>{delivery.receiverLocation}</span>
                      </div>
                    </div>
                    <div className="view-tracking-hint">Click to view tracking</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Available Tasks */}
        <div className="available-tasks-section">
          <div className="tasks-header">
            <h2 className="section-title">Available Pickup Tasks</h2>
            <span className="available-badge">
              Available
              <span className="tasks-count">{availableDeliveries.length} tasks nearby</span>
            </span>
          </div>

          {loading ? (
            <div className="loading-tasks">Loading tasks...</div>
          ) : availableDeliveries.length === 0 ? (
            <div className="no-tasks">
              <p>No pickup tasks available at the moment</p>
            </div>
          ) : (
            <div className="tasks-list">
              {availableDeliveries.map((delivery) => (
                <div key={delivery._id} className="task-card">
                  <div className="task-header">
                    <h3 className="task-title">
                      Pickup from {delivery.donor?.name || 'Restaurant'}
                    </h3>
                    <span className="distance-badge">
                      {calculateDistance(delivery)} km
                    </span>
                  </div>
                  <div className="task-time">{getTimeSince(delivery.claimedAt)}</div>

                  <div className="task-route">
                    <div className="route-item">
                      <span className="route-dot pickup-dot"></span>
                      <div className="route-details">
                        <strong>Pickup</strong>
                        <p>{delivery.pickupLocation}</p>
                      </div>
                    </div>
                    <div className="route-item">
                      <span className="route-dot dropoff-dot"></span>
                      <div className="route-details">
                        <strong>Dropoff</strong>
                        <p>{delivery.receiverLocation}</p>
                      </div>
                    </div>
                  </div>

                  <div className="task-footer">
                    <span className="reward-text">
                      Reward: <strong>₹{calculateReward(delivery)}</strong>
                    </span>
                    <button
                      className="accept-button"
                      onClick={() => handleAcceptDelivery(delivery._id)}
                    >
                      <FaCheckCircle /> Accept
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="error-toast">
          {error}
          <button onClick={() => setError('')}>×</button>
        </div>
      )}
    </div>
  );
};

export default VolunteerDashboardNew;
