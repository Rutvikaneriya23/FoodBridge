import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import LiveMap from '../Common/LiveMap';
import {
  listenToDelivery,
  calculateDistance,
  calculateETA
} from '../../utils/trackingService';
import {
  FaTruck,
  FaMapMarkerAlt,
  FaPhone,
  FaCheckCircle,
  FaArrowLeft,
  FaClock,
  FaBox,
  FaUser,
  FaEnvelope,
  FaRoute
} from 'react-icons/fa';
import './ReceiverTracking.css';

const ReceiverTracking = () => {
  const { deliveryId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [delivery, setDelivery] = useState(null);
  const [volunteerLocation, setVolunteerLocation] = useState(null);
  const [receiverLocation, setReceiverLocation] = useState(null);
  const [status, setStatus] = useState('');
  const [distanceFromReceiver, setDistanceFromReceiver] = useState(null);
  const [eta, setEta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  
  const deliveryListenerCleanupRef = useRef(null);

  useEffect(() => {
    fetchDelivery();
    
    return () => {
      if (deliveryListenerCleanupRef.current) {
        deliveryListenerCleanupRef.current();
      }
    };
  }, [deliveryId]);

  const fetchDelivery = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(
        `http://localhost:5000/api/donations/${deliveryId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        const deliveryData = response.data.donation;
        setDelivery(deliveryData);
        setStatus(deliveryData.status);

        if (deliveryData.receiverCoordinates) {
          setReceiverLocation([deliveryData.receiverCoordinates.lat, deliveryData.receiverCoordinates.lng]);
        }

        if (deliveryData.firebaseDeliveryId) {
          setupFirebaseListener(deliveryData.firebaseDeliveryId);
        }
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching delivery:', error);
      setLoading(false);
    }
  };

  const setupFirebaseListener = (firebaseId) => {
    const cleanup = listenToDelivery(firebaseId, (data) => {
      if (data.volunteer_location) {
        setVolunteerLocation([
          data.volunteer_location.lat,
          data.volunteer_location.lng
        ]);
        setLastUpdate(new Date(data.volunteer_location.timestamp));

        if (receiverLocation) {
          const distance = calculateDistance(
            data.volunteer_location.lat,
            data.volunteer_location.lng,
            receiverLocation[0],
            receiverLocation[1]
          );
          setDistanceFromReceiver(distance);
          setEta(calculateETA(distance));
        }
      }

      if (data.status) {
        setStatus(data.status);
      }
    });

    deliveryListenerCleanupRef.current = cleanup;
  };

  const getStatusMessage = (status) => {
    switch (status) {
      case 'ASSIGNED':
        return '🤝 Volunteer has been assigned to your delivery';
      case 'PICKED_UP':
        return '✅ Food has been picked up from donor';
      case 'ON_THE_WAY':
        return '🚴 Volunteer is on the way to you';
      case 'DELIVERED':
        return '🎉 Food delivered successfully!';
      default:
        return 'Waiting for updates...';
    }
  };

  if (loading) {
    return (
      <div className="receiver-tracking-loading">
        <div className="spinner"></div>
        <p>Loading tracking information...</p>
      </div>
    );
  }

  if (!delivery) {
    return (
      <div className="receiver-tracking-error">
        <p>Delivery not found</p>
        <button onClick={() => navigate('/receiver-dashboard')}>Go Back</button>
      </div>
    );
  }

  const markers = [];
  
  if (volunteerLocation) {
    markers.push({
      id: 'volunteer',
      position: volunteerLocation,
      role: 'volunteer',
      name: 'Your Volunteer',
      status: status,
      distance: distanceFromReceiver ? `${Math.round(distanceFromReceiver)}m away` : null,
      eta: eta
    });
  }

  if (receiverLocation) {
    markers.push({
      id: 'receiver',
      position: receiverLocation,
      role: 'receiver',
      name: 'Your Location',
      status: 'Delivery Point'
    });
  }

  const mapCenter = volunteerLocation || receiverLocation || [19.0760, 72.8777];

  const getStatusBadgeClass = () => {
    switch (status) {
      case 'ON_THE_WAY':
        return 'on-the-way';
      case 'DELIVERED':
        return 'delivered';
      case 'PICKED_UP':
        return 'in-transit';
      default:
        return 'pending';
    }
  };

  return (
    <div className="receiver-tracking-container">
      {/* Sidebar */}
      <aside className="receiver-sidebar">
        <div className="sidebar-header">
          <button className="back-button" onClick={() => navigate('/receiver-dashboard')}>
            <FaArrowLeft />
          </button>
          <h2>Track Delivery</h2>
        </div>

        {/* Delivery Card */}
        <div className="delivery-card">
          <div className="delivery-card-header">
            <FaBox className="package-icon" />
            <div className="delivery-id">
              <span className="id-label">Delivery ID</span>
              <span className="id-value">#{delivery._id?.slice(-6).toUpperCase()}</span>
            </div>
            <span className={`status-badge ${getStatusBadgeClass()}`}>
              {status === 'ON_THE_WAY' ? 'ON THE WAY' : status.replace('_', ' ')}
            </span>
          </div>

          <div className="delivery-timeline">
            <div className={`timeline-item ${status === 'ASSIGNED' || status === 'PICKED_UP' || status === 'ON_THE_WAY' || status === 'DELIVERED' ? 'completed' : ''}`}>
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <span className="timeline-label">Order Placed</span>
                <span className="timeline-time">
                  {new Date(delivery.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
            <div className={`timeline-item ${status === 'PICKED_UP' || status === 'ON_THE_WAY' || status === 'DELIVERED' ? 'completed' : ''}`}>
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <span className="timeline-label">Picked Up</span>
                <span className="timeline-time">
                  {status === 'PICKED_UP' || status === 'ON_THE_WAY' || status === 'DELIVERED' ? 'Completed' : 'Pending'}
                </span>
              </div>
            </div>
            <div className={`timeline-item ${status === 'ON_THE_WAY' || status === 'DELIVERED' ? 'completed' : ''}`}>
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <span className="timeline-label">On The Way</span>
                <span className="timeline-time">
                  {status === 'ON_THE_WAY' || status === 'DELIVERED' ? 'In Progress' : 'Pending'}
                </span>
              </div>
            </div>
            <div className={`timeline-item ${status === 'DELIVERED' ? 'completed' : ''}`}>
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <span className="timeline-label">Delivered</span>
                <span className="timeline-time">
                  {status === 'DELIVERED' ? 'Completed' : 'Pending'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Food Details */}
        <div className="sidebar-section">
          <h3 className="section-title">
            <FaBox /> Food Details
          </h3>
          <div className="details-grid">
            <div className="detail-item">
              <span className="detail-label">Item Name</span>
              <span className="detail-value">{delivery.foodName}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Quantity</span>
              <span className="detail-value">{delivery.quantity} {delivery.quantityUnit}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Description</span>
              <span className="detail-value">{delivery.foodDescription}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Pickup Location</span>
              <span className="detail-value">{delivery.pickupAddress}</span>
            </div>
          </div>
        </div>

        {/* Volunteer Details */}
        {delivery.volunteer && (
          <div className="sidebar-section volunteer-section">
            <h3 className="section-title">
              <FaUser /> Your Volunteer
            </h3>
            <div className="volunteer-card">
              <div className="volunteer-avatar">
                {delivery.volunteer.profileImage ? (
                  <img src={delivery.volunteer.profileImage} alt={delivery.volunteer.name} />
                ) : (
                  <FaUser />
                )}
              </div>
              <div className="volunteer-info">
                <h4 className="volunteer-name">{delivery.volunteer.name}</h4>
                <p className="volunteer-detail">
                  <FaPhone /> {delivery.volunteer.phone}
                </p>
                {volunteerLocation && distanceFromReceiver && (
                  <p className="volunteer-detail">
                    <FaMapMarkerAlt /> {Math.round(distanceFromReceiver)}m away
                  </p>
                )}
                {eta && status !== 'DELIVERED' && (
                  <p className="volunteer-detail eta-info">
                    <FaClock /> Arriving in {eta}
                  </p>
                )}
              </div>
            </div>
            <button className="contact-button">
              <FaEnvelope /> Contact Volunteer
            </button>
          </div>
        )}

        {lastUpdate && (
          <div className="last-update-info">
            <FaClock /> Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
        )}
      </aside>

      {/* Main Map Section */}
      <main className="receiver-main">
        <div className="map-container">
          <LiveMap
            center={mapCenter}
            zoom={15}
            markers={markers}
            showRoute={volunteerLocation && receiverLocation}
          />

          {!volunteerLocation && status !== 'DELIVERED' && (
            <div className="map-overlay-message">
              <div className="overlay-content">
                <FaTruck className="overlay-icon" />
                <p>Waiting for volunteer to start tracking...</p>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Info Bar */}
        <div className="bottom-info-bar">
          <div className="info-item">
            <FaRoute className="info-icon" />
            <div className="info-text">
              <span className="info-label">From</span>
              <span className="info-value">{delivery.pickupAddress?.split(',')[0] || 'Donor Location'}</span>
            </div>
          </div>
          <div className="info-item">
            <FaMapMarkerAlt className="info-icon" />
            <div className="info-text">
              <span className="info-label">To</span>
              <span className="info-value">{delivery.dropoffAddress?.split(',')[0] || 'Your Location'}</span>
            </div>
          </div>
          {volunteerLocation && (
            <div className="info-item">
              <FaTruck className="info-icon" />
              <div className="info-text">
                <span className="info-label">Current Location</span>
                <span className="info-value">
                  {volunteerLocation[0].toFixed(4)}, {volunteerLocation[1].toFixed(4)}
                </span>
              </div>
            </div>
          )}
          {distanceFromReceiver && (
            <div className="info-item">
              <FaMapMarkerAlt className="info-icon" />
              <div className="info-text">
                <span className="info-label">Distance</span>
                <span className="info-value">{Math.round(distanceFromReceiver)}m</span>
              </div>
            </div>
          )}
        </div>

        {status === 'DELIVERED' && (
          <div className="delivery-success-overlay">
            <div className="success-card">
              <FaCheckCircle className="success-icon" />
              <h2>Delivery Completed!</h2>
              <p>Thank you for using FoodBridge. Enjoy your meal! 🍽️</p>
              <button onClick={() => navigate('/receiver-dashboard')} className="success-button">
                Back to Dashboard
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ReceiverTracking;
