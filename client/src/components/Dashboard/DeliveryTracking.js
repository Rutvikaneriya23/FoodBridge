import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import LiveMap from '../Common/LiveMap';
import {
  startTracking,
  stopTracking,
  listenToDelivery,
  createDelivery,
  getCurrentLocation,
  autoUpdateStatus,
  calculateDistance,
  calculateETA
} from '../../utils/trackingService';
import {
  FaTruck,
  FaMapMarkerAlt,
  FaPhone,
  FaCheckCircle,
  FaArrowLeft,
  FaStop,
  FaPlay
} from 'react-icons/fa';
import './DeliveryTracking.css';

const DeliveryTracking = () => {
  const { deliveryId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [delivery, setDelivery] = useState(null);
  const [tracking, setTracking] = useState(false);
  const [volunteerLocation, setVolunteerLocation] = useState(null);
  const [donorLocation, setDonorLocation] = useState(null);
  const [receiverLocation, setReceiverLocation] = useState(null);
  const [status, setStatus] = useState('');
  const [distanceFromDonor, setDistanceFromDonor] = useState(null);
  const [distanceFromReceiver, setDistanceFromReceiver] = useState(null);
  const [eta, setEta] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const trackingCleanupRef = useRef(null);
  const deliveryListenerCleanupRef = useRef(null);

  useEffect(() => {
    fetchDelivery();
    
    return () => {
      // Cleanup tracking on unmount
      if (trackingCleanupRef.current) {
        trackingCleanupRef.current();
      }
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

        // Set locations with mock data if coordinates not available
        if (deliveryData.donorCoordinates) {
          setDonorLocation([deliveryData.donorCoordinates.lat, deliveryData.donorCoordinates.lng]);
        } else {
          // Mock donor location (Mumbai)
          setDonorLocation([19.0760, 72.8777]);
        }
        
        if (deliveryData.receiverCoordinates) {
          setReceiverLocation([deliveryData.receiverCoordinates.lat, deliveryData.receiverCoordinates.lng]);
        } else {
          // Mock receiver location (slightly offset)
          setReceiverLocation([19.0860, 72.8877]);
        }

        // Initialize Firebase delivery if not exists
        if (!deliveryData.firebaseDeliveryId) {
          await initializeFirebaseDelivery(deliveryData);
        } else {
          // Listen to Firebase updates
          setupFirebaseListener(deliveryData.firebaseDeliveryId);
        }
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching delivery:', error);
      setLoading(false);
    }
  };

  const initializeFirebaseDelivery = async (deliveryData) => {
    try {
      await createDelivery(
        deliveryId,
        {
          lat: deliveryData.donorCoordinates?.lat || 19.0760,
          lng: deliveryData.donorCoordinates?.lng || 72.8777
        },
        {
          lat: deliveryData.receiverCoordinates?.lat || 19.0760,
          lng: deliveryData.receiverCoordinates?.lng || 72.8777
        }
      );

      // Update MongoDB with Firebase ID
      const token = localStorage.getItem('authToken');
      await axios.patch(
        `http://localhost:5000/api/donations/${deliveryId}`,
        { firebaseDeliveryId: deliveryId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setupFirebaseListener(deliveryId);
    } catch (error) {
      console.error('Error initializing Firebase delivery:', error);
    }
  };

  const setupFirebaseListener = (firebaseId) => {
    const cleanup = listenToDelivery(firebaseId, (data) => {
      if (data.volunteer_location) {
        setVolunteerLocation([
          data.volunteer_location.lat,
          data.volunteer_location.lng
        ]);

        // Calculate distances and update status
        if (donorLocation && receiverLocation) {
          const distDonor = calculateDistance(
            data.volunteer_location.lat,
            data.volunteer_location.lng,
            donorLocation[0],
            donorLocation[1]
          );
          const distReceiver = calculateDistance(
            data.volunteer_location.lat,
            data.volunteer_location.lng,
            receiverLocation[0],
            receiverLocation[1]
          );

          setDistanceFromDonor(distDonor);
          setDistanceFromReceiver(distReceiver);
          setEta(calculateETA(distReceiver));

          // Auto-update status
          autoUpdateStatus(
            firebaseId,
            data.volunteer_location,
            { lat: donorLocation[0], lng: donorLocation[1] },
            { lat: receiverLocation[0], lng: receiverLocation[1] },
            data.status
          ).then(({ newStatus }) => {
            if (newStatus !== status) {
              setStatus(newStatus);
              updateMongoDBStatus(newStatus);
            }
          });
        }
      }

      if (data.status) {
        setStatus(data.status);
      }
    });

    deliveryListenerCleanupRef.current = cleanup;
  };

  const updateMongoDBStatus = async (newStatus) => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.patch(
        `http://localhost:5000/api/donations/${deliveryId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error('Error updating MongoDB status:', error);
    }
  };

  const handleStartTracking = async () => {
    try {
      const location = await getCurrentLocation();
      setVolunteerLocation([location.latitude, location.longitude]);

      // Start continuous tracking
      const cleanup = startTracking(deliveryId, (loc) => {
        setVolunteerLocation([loc.latitude, loc.longitude]);
      });

      trackingCleanupRef.current = cleanup;
      setTracking(true);
      alert('Live tracking started! Your location will be shared with donor and receiver.');
    } catch (error) {
      alert('Failed to get your location. Please enable GPS and try again.');
      console.error('Location error:', error);
    }
  };

  const handleStopTracking = async () => {
    if (trackingCleanupRef.current) {
      trackingCleanupRef.current();
    }
    await stopTracking(deliveryId);
    setTracking(false);
    alert('Tracking stopped. Delivery marked as completed.');
    navigate('/volunteer-dashboard');
  };

  if (loading) {
    return (
      <div className="tracking-loading">
        <div className="spinner"></div>
        <p>Loading delivery...</p>
      </div>
    );
  }

  if (!delivery) {
    return (
      <div className="tracking-error">
        <p>Delivery not found</p>
        <button onClick={() => navigate('/volunteer-dashboard')}>Go Back</button>
      </div>
    );
  }

  // Prepare markers for map
  const markers = [];
  
  if (donorLocation) {
    markers.push({
      id: 'donor',
      position: donorLocation,
      role: 'donor',
      name: delivery.donor?.name || delivery.donorName || 'Pickup Location',
      phone: delivery.donor?.phone || delivery.donorPhone,
      status: 'Pickup Point'
    });
  }

  if (volunteerLocation) {
    markers.push({
      id: 'volunteer',
      position: volunteerLocation,
      role: 'volunteer',
      name: user.name || 'You',
      status: status,
      distance: distanceFromReceiver ? `${Math.round(distanceFromReceiver)}m from destination` : null,
      eta: eta
    });
  }

  if (receiverLocation) {
    markers.push({
      id: 'receiver',
      position: receiverLocation,
      role: 'receiver',
      name: delivery.assignedTo?.receiver?.name || 'Delivery Location',
      status: 'Delivery Point'
    });
  }

  const mapCenter = volunteerLocation || donorLocation || [19.0760, 72.8777];
  const routePositions = [donorLocation, volunteerLocation, receiverLocation].filter(Boolean);

  return (
    <div className="delivery-tracking-page">
      <header className="tracking-header">
        <button className="back-btn" onClick={() => navigate('/volunteer-dashboard')}>
          <FaArrowLeft /> Back
        </button>
        <h2>🚴 Live Delivery Tracking</h2>
        <div className="tracking-status">
          <span className={`status-badge status-${status?.toLowerCase()}`}>
            {status}
          </span>
        </div>
      </header>

      <div className="tracking-content">
        {/* Map Section */}
        <div className="map-section">
          <LiveMap
            center={mapCenter}
            zoom={14}
            markers={markers}
            showRoute={true}
            routePositions={routePositions}
          />
        </div>

        {/* Info Section */}
        <div className="info-section">
          <div className="delivery-info-card">
            <h3>📦 {delivery.foodName || 'Food Donation'}</h3>
            <p className="food-desc">{delivery.foodDescription || 'Fresh food items'}</p>
            <div className="info-row">
              <span className="label">Quantity:</span>
              <span className="value">{delivery.quantity || '5'} {delivery.quantityUnit || 'servings'}</span>
            </div>
          </div>

          <div className="location-cards">
            <div className="location-card pickup">
              <FaMapMarkerAlt className="icon green" />
              <div>
                <h4>Pickup Point</h4>
                <p>{delivery.donor?.name || delivery.donorName || 'Donor'}</p>
                <p className="address">{delivery.pickupLocation || delivery.donorLocation || 'Mumbai, Maharashtra'}</p>
                <p className="phone"><FaPhone /> {delivery.donor?.phone || delivery.donorPhone || '+91 1234567890'}</p>
                {distanceFromDonor && (
                  <p className="distance">{Math.round(distanceFromDonor)}m away</p>
                )}
              </div>
            </div>

            <div className="location-card dropoff">
              <FaMapMarkerAlt className="icon purple" />
              <div>
                <h4>Delivery Point</h4>
                <p>{delivery.assignedTo?.receiver?.name || 'Receiver'}</p>
                <p className="address">{delivery.receiverLocation || 'Mumbai, Maharashtra'}</p>
                {distanceFromReceiver && (
                  <p className="distance">{Math.round(distanceFromReceiver)}m away</p>
                )}
                {eta && <p className="eta">🕐 ETA: {eta}</p>}
              </div>
            </div>
          </div>

          {/* Tracking Controls */}
          <div className="tracking-controls">
            {!tracking ? (
              <button className="start-tracking-btn" onClick={handleStartTracking}>
                <FaPlay /> Start Live Tracking
              </button>
            ) : (
              <>
                <div className="tracking-active">
                  <div className="pulse-dot"></div>
                  <span>Live tracking active</span>
                </div>
                <button className="stop-tracking-btn" onClick={handleStopTracking}>
                  <FaStop /> Complete Delivery
                </button>
              </>
            )}
          </div>

          {/* Status Timeline */}
          <div className="status-timeline">
            <div className={`timeline-item ${status === 'ASSIGNED' || status === 'PICKED_UP' || status === 'ON_THE_WAY' || status === 'DELIVERED' ? 'completed' : ''}`}>
              <div className="timeline-icon"><FaCheckCircle /></div>
              <div>
                <h4>Assigned</h4>
                <p>Delivery accepted</p>
              </div>
            </div>
            <div className={`timeline-item ${status === 'PICKED_UP' || status === 'ON_THE_WAY' || status === 'DELIVERED' ? 'completed' : ''}`}>
              <div className="timeline-icon"><FaCheckCircle /></div>
              <div>
                <h4>Picked Up</h4>
                <p>Food collected from donor</p>
              </div>
            </div>
            <div className={`timeline-item ${status === 'ON_THE_WAY' || status === 'DELIVERED' ? 'completed' : ''}`}>
              <div className="timeline-icon"><FaCheckCircle /></div>
              <div>
                <h4>On The Way</h4>
                <p>Heading to receiver</p>
              </div>
            </div>
            <div className={`timeline-item ${status === 'DELIVERED' ? 'completed' : ''}`}>
              <div className="timeline-icon"><FaCheckCircle /></div>
              <div>
                <h4>Delivered</h4>
                <p>Food delivered successfully</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryTracking;
