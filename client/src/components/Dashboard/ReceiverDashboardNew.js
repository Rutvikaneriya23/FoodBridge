import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  FaUtensils,
  FaMapMarkerAlt,
  FaStar,
  FaSync,
  FaDownload,
  FaBox,
  FaUser,
  FaSignOutAlt,
  FaChevronDown
} from 'react-icons/fa';
import '../Auth/Admin.css';
import './ReceiverDashboardNew.css';
import BottomNav from './BottomNav';
import DeliveryProgress from './DeliveryProgress';

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom marker icons
const createIcon = (color) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};

const donorIcon = createIcon('#10b981');

const ReceiverDashboardNew = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [availableDonations, setAvailableDonations] = useState([]);
  const [filteredDonations, setFilteredDonations] = useState([]);
  const [myDeliveries, setMyDeliveries] = useState([]);
  const [activeTab, setActiveTab] = useState('available'); // 'available' or 'my-deliveries'
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterDistance, setFilterDistance] = useState('any');
  const [mapCenter] = useState([28.6139, 77.2090]); // Delhi coordinates
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const fetchDonations = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get('http://localhost:5000/api/donations', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const available = response.data.donations.filter(
          d => d.status === 'available' || d.status === 'pending'
        );
        
        // Add mock distance and time for demo
        const enriched = available.map((donation, index) => ({
          ...donation,
          distance: (Math.random() * 5 + 0.5).toFixed(1),
          timeAgo: getRandomTimeAgo(),
          lat: 28.6139 + (Math.random() - 0.5) * 0.1,
          lng: 77.2090 + (Math.random() - 0.5) * 0.1,
          meals: Math.floor(Math.random() * 30) + 10
        }));
        
        setAvailableDonations(enriched);
      }
    } catch (err) {
      console.error('Error fetching donations:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterDonations = () => {
    let filtered = [...availableDonations];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(d =>
        d.foodName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.donorName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(d => d.foodType === filterType);
    }

    // Distance filter
    if (filterDistance !== 'any') {
      const maxDistance = parseFloat(filterDistance);
      filtered = filtered.filter(d => parseFloat(d.distance) <= maxDistance);
    }

    setFilteredDonations(filtered);
  };

  const getRandomTimeAgo = () => {
    const options = ['30 mins ago', '1 hour ago', '2 hours ago', '3 hours ago'];
    return options[Math.floor(Math.random() * options.length)];
  };

  useEffect(() => {
    fetchDonations();
    fetchMyDeliveries();
    const interval = setInterval(() => {
      fetchDonations();
      fetchMyDeliveries();
    }, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    filterDonations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, filterType, filterDistance, availableDonations]);

  const handleClaimFood = async (donationId) => {
    if (!window.confirm('Are you sure you want to claim this food?')) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post(
        `http://localhost:5000/api/receiver-volunteer/${donationId}/claim`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert('Food claimed successfully! Check "My Deliveries" tab to track it.');
        fetchDonations();
        fetchMyDeliveries();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to claim food');
    }
  };

  const fetchMyDeliveries = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get('http://localhost:5000/api/donations/my-deliveries', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        // Filter for deliveries assigned to a volunteer (claimed by receiver)
        const claimed = response.data.donations.filter(
          d => d.status !== 'available' && d.status !== 'pending' && d.receiver?._id === user._id
        );
        setMyDeliveries(claimed);
      }
    } catch (err) {
      console.error('Error fetching my deliveries:', err);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'ASSIGNED':
      case 'ACCEPTED':
        return 'assigned';
      case 'PICKED_UP':
        return 'picked-up';
      case 'ON_THE_WAY':
        return 'on-the-way';
      case 'DELIVERED':
        return 'delivered';
      default:
        return 'pending';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'ASSIGNED':
      case 'ACCEPTED':
        return 'Assigned';
      case 'PICKED_UP':
        return 'Picked Up';
      case 'ON_THE_WAY':
        return 'On The Way';
      case 'DELIVERED':
        return 'Delivered';
      default:
        return 'Pending';
    }
  };

  const getDonorInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'D';
  };

  const getDonorColor = (index) => {
    const colors = ['#10b981', '#14b8a6', '#f59e0b', '#3b82f6', '#8b5cf6'];
    return colors[index % colors.length];
  };

  const handleRefresh = () => {
    setLoading(true);
    fetchDonations();
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/login');
    }
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const getUserInitial = () => {
    return user?.name ? user.name.charAt(0).toUpperCase() : 'U';
  };

  if (loading && availableDonations.length === 0) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading available donations...</p>
      </div>
    );
  }

  return (
    <div className="receiver-dashboard-new">
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
      <BottomNav role="receiver" />

      <div className="dashboard-content">
        <div className="container">
          <div className="dashboard-header-new">
            <h1 className="page-title">Available Food Donations</h1>
          </div>

          {/* Tabs */}
          <div className="tabs-container">
            <button
              className={`tab-button ${activeTab === 'available' ? 'active' : ''}`}
              onClick={() => setActiveTab('available')}
            >
          <FaUtensils /> Available Donations
        </button>
        <button
          className={`tab-button ${activeTab === 'my-deliveries' ? 'active' : ''}`}
          onClick={() => setActiveTab('my-deliveries')}
        >
          <FaBox /> My Deliveries ({myDeliveries.length})
        </button>
      </div>

      {/* Search and Filters Bar - Only for Available Donations */}
      {activeTab === 'available' && (
        <div className="filters-bar">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search food items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-group">
            <select
              value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Types</option>
            <option value="Cooked Food">Cooked Food</option>
            <option value="Raw Food">Raw Food</option>
            <option value="Packaged Food">Packaged Food</option>
            <option value="Baked Goods">Baked Goods</option>
            <option value="Fruits & Vegetables">Fruits & Vegetables</option>
          </select>
        </div>

        <div className="filter-group">
          <select
            value={filterDistance}
            onChange={(e) => setFilterDistance(e.target.value)}
            className="filter-select"
          >
            <option value="any">Any Distance</option>
            <option value="1">Within 1 km</option>
            <option value="2">Within 2 km</option>
            <option value="5">Within 5 km</option>
            <option value="10">Within 10 km</option>
          </select>
        </div>

            <button className="refresh-btn" onClick={handleRefresh}>
              <FaSync /> Refresh
            </button>
          </div>
          )}

          {/* Main Content - Two Columns */}
          <div className="main-content-new">
        {/* Left Panel - Donation/Delivery List */}
        <div className="donations-list-panel">
          {activeTab === 'available' ? (
            // Available Donations
            <>
              {filteredDonations.length === 0 ? (
                <div className="no-donations">
                  <FaUtensils size={48} />
                  <p>No donations available</p>
                  <small>Check back soon or adjust your filters</small>
                </div>
              ) : (
                filteredDonations.map((donation, index) => (
                  <div key={donation._id} className="donation-card-new">
                <div className="card-header-new">
                  <h3 className="food-name-new">{donation.foodName}</h3>
                  <span className="status-badge-new available">Available</span>
                </div>

                <div className="card-details-new">
                  <div className="detail-row-new">
                    <div className="detail-item-new">
                      <FaBox className="detail-icon-new" />
                      <span>{donation.quantity} {donation.quantityUnit}</span>
                    </div>
                    <div className="detail-item-new">
                      <FaUtensils className="detail-icon-new" />
                      <span>{donation.meals} meals</span>
                    </div>
                  </div>

                  <div className="detail-row-new">
                    <div className="detail-item-new">
                      <FaMapMarkerAlt className="detail-icon-new" />
                      <span>{donation.distance} km</span>
                    </div>
                    <div className="detail-item-new">
                      <span className="time-badge-new">{donation.timeAgo}</span>
                    </div>
                  </div>
                </div>

                <div className="card-footer-new">
                  <div className="donor-info-new">
                    <div
                      className="donor-avatar-new"
                      style={{ backgroundColor: getDonorColor(index) }}
                    >
                      {getDonorInitial(donation.donorName)}
                    </div>
                    <div className="donor-details-new">
                      <span className="donor-name-new">{donation.donorName}</span>
                      <div className="donor-rating-new">
                        <FaStar className="star-icon-new" />
                        <span>{(Math.random() * 1.5 + 3.5).toFixed(1)}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    className="claim-btn-new"
                    onClick={() => handleClaimFood(donation._id)}
                  >
                    <FaDownload /> Claim
                  </button>
                </div>
              </div>
                ))
              )}
            </>
          ) : (
            // My Deliveries
            <>
              {myDeliveries.length === 0 ? (
                <div className="no-donations">
                  <FaBox size={48} />
                  <p>No active deliveries</p>
                  <small>Claim some food to see your deliveries here</small>
                </div>
              ) : (
                <>
                  {myDeliveries.map((delivery) => (
                    <DeliveryProgress key={delivery._id} donation={delivery} />
                  ))}
                </>
              )}
            </>
          )}
        </div>

        {/* Right Panel - Map */}
        <div className="map-panel-new">
          <h3 className="map-title-new">Map View</h3>
          <div className="map-container-new">
            <MapContainer
              center={mapCenter}
              zoom={12}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Donor Markers */}
              {filteredDonations.map((donation) => (
                <Marker
                  key={donation._id}
                  position={[donation.lat, donation.lng]}
                  icon={donorIcon}
                >
                  <Popup>
                    <div className="map-popup">
                      <h4>{donation.foodName}</h4>
                      <p><strong>{donation.donorName}</strong></p>
                      <p>{donation.distance} km away</p>
                      <p>{donation.quantity} {donation.quantityUnit}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          {/* Map Legend */}
          <div className="map-legend-new">
            <div className="legend-item-new">
              <div className="legend-dot-new" style={{ backgroundColor: '#10b981' }}></div>
              <span>Donors</span>
            </div>
            <div className="legend-item-new">
              <div className="legend-dot-new" style={{ backgroundColor: '#14b8a6' }}></div>
              <span>NGOs</span>
            </div>
            <div className="legend-item-new">
              <div className="legend-dot-new" style={{ backgroundColor: '#f59e0b' }}></div>
              <span>Volunteers</span>
            </div>
          </div>
        </div>
      </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiverDashboardNew;
