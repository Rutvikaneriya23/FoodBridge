import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaCamera,
  FaMapMarkerAlt,
  FaThermometerHalf,
  FaClock,
  FaBox,
  FaEye
} from 'react-icons/fa';
import '../Auth/Admin.css';
import './VerifyPickup.css';
import BottomNav from './BottomNav';

const VerifyPickup = () => {
  const { donationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [pickupAddress, setPickupAddress] = useState('');
  
  const [verificationData, setVerificationData] = useState({
    cookingTime: '',
    temperatureRange: '',
    smellAppearance: '',
    packagingCondition: '',
    photos: [],
    status: 'safe', // 'safe', 'consume-soon', 'rejected'
    consumeWithinHours: '',
    rejectionReason: '',
    notes: ''
  });

  const [checklist, setChecklist] = useState({
    timeOfCooking: false,
    temperatureCheck: false,
    smellAppearanceCheck: false,
    packagingCheck: false,
    photosUploaded: false
  });

  useEffect(() => {
    fetchDonation();
    getCurrentLocation();
  }, [donationId]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          // Set default location (New Delhi) if GPS fails
          setCurrentLocation({ lat: 28.6139, lng: 77.2090 });
        }
      );
    } else {
      // Set default location if geolocation not supported
      setCurrentLocation({ lat: 28.6139, lng: 77.2090 });
    }
  };

  const fetchDonation = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(
        `http://localhost:5000/api/donations/${donationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setDonation(response.data.donation);
        setPickupAddress(response.data.donation.pickupAddress || '');
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching donation:', err);
      alert('Failed to load donation details');
      navigate(-1);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setVerificationData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleChecklistChange = (field) => {
    setChecklist(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const readers = files.map(file => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
      });

      Promise.all(readers).then(results => {
        setVerificationData(prev => ({
          ...prev,
          photos: [...prev.photos, ...results]
        }));
        setChecklist(prev => ({ ...prev, photosUploaded: true }));
      });
    }
  };

  const handleStatusChange = (status) => {
    setVerificationData(prev => ({
      ...prev,
      status
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!verificationData.cookingTime) {
      alert('Please enter the cooking time');
      return;
    }

    if (!verificationData.temperatureRange) {
      alert('Please select the temperature range');
      return;
    }

    if (!verificationData.smellAppearance) {
      alert('Please select smell & appearance condition');
      return;
    }

    if (!verificationData.packagingCondition) {
      alert('Please select packaging condition');
      return;
    }

    if (verificationData.photos.length === 0) {
      alert('Please upload at least one photo');
      return;
    }

    if (verificationData.status === 'rejected' && !verificationData.rejectionReason) {
      alert('Please provide a reason for rejection');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post(
        `http://localhost:5000/api/donations/${donationId}/verify-pickup`,
        {
          ...verificationData,
          gpsLocation: currentLocation,
          timestamp: new Date().toISOString()
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert('Verification completed successfully!');
        navigate('/volunteer-dashboard');
      }
    } catch (err) {
      console.error('Verification error:', err);
      alert(err.response?.data?.message || 'Failed to submit verification');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading donation details...</p>
      </div>
    );
  }

  return (
    <div className="verify-pickup-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="container">
          <div className="dashboard-logo">
            <img src="/Foodbridge_black.svg" alt="FoodBridge" style={{ height: '60px', width: 'auto', objectFit: 'contain' }} />
            <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '32px', fontWeight: '800', letterSpacing: '-0.5px' }}>Food Bridge</span>
          </div>
        </div>
      </header>

      <BottomNav role="volunteer" />

      <div className="verify-content">
        <div className="container">
          <h2 className="verify-title">Food Pickup Verification</h2>
          <p className="verify-subtitle">Real-time digital verification for food safety</p>

          <div className="verification-grid">
            {/* Left Column - Donation Info & Map */}
            <div className="verification-left">
              {/* Donation Details */}
              <div className="info-card">
                <h3>Donation Information</h3>
                <div className="info-row">
                  <span className="info-label">Food Item:</span>
                  <span className="info-value">{donation?.foodName}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Type:</span>
                  <span className="info-value">{donation?.foodType}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Quantity:</span>
                  <span className="info-value">{donation?.quantity} {donation?.quantityUnit}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Donor:</span>
                  <span className="info-value">{donation?.donor?.name}</span>
                </div>
              </div>

              {/* Pickup Location Map */}
              <div className="map-card">
                <h3><FaMapMarkerAlt /> Pickup Location</h3>
                <div className="location-input">
                  <input 
                    type="text" 
                    value={pickupAddress} 
                    onChange={(e) => setPickupAddress(e.target.value)}
                    placeholder="Enter pickup address"
                    className="location-field"
                  />
                </div>
                <div className="map-container-verify">
                  {currentLocation && (
                    <MapContainer
                      center={[currentLocation.lat, currentLocation.lng]}
                      zoom={15}
                      style={{ height: '300px', width: '100%', borderRadius: '8px' }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      />
                      <Marker position={[currentLocation.lat, currentLocation.lng]}>
                        <Popup>Your current location</Popup>
                      </Marker>
                    </MapContainer>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Verification Form */}
            <div className="verification-right">
              <form onSubmit={handleSubmit} className="verification-form">
                <div className="verification-section">
                  <h3><FaCheckCircle /> Hygiene & Safety Checklist</h3>
                  
                  {/* Time of Cooking */}
                  <div className="form-group-verify">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={checklist.timeOfCooking}
                        onChange={() => handleChecklistChange('timeOfCooking')}
                      />
                      <span>Time of Cooking Verified</span>
                    </label>
                    <input
                      type="datetime-local"
                      name="cookingTime"
                      value={verificationData.cookingTime}
                      onChange={handleInputChange}
                      className="verify-input"
                      required
                    />
                  </div>

                  {/* Temperature Range */}
                  <div className="form-group-verify">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={checklist.temperatureCheck}
                        onChange={() => handleChecklistChange('temperatureCheck')}
                      />
                      <span>Temperature Range Checked</span>
                    </label>
                    <select
                      name="temperatureRange"
                      value={verificationData.temperatureRange}
                      onChange={handleInputChange}
                      className="verify-input"
                      required
                    >
                      <option value="">Select temperature range</option>
                      <option value="hot">Hot (Above 60°C)</option>
                      <option value="warm">Warm (40-60°C)</option>
                      <option value="room">Room Temperature (20-40°C)</option>
                      <option value="cold">Cold (Below 20°C)</option>
                    </select>
                  </div>

                  {/* Smell/Appearance */}
                  <div className="form-group-verify">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={checklist.smellAppearanceCheck}
                        onChange={() => handleChecklistChange('smellAppearanceCheck')}
                      />
                      <span>Smell & Appearance Verified</span>
                    </label>
                    <select
                      name="smellAppearance"
                      value={verificationData.smellAppearance}
                      onChange={handleInputChange}
                      className="verify-input"
                      required
                    >
                      <option value="">Select condition</option>
                      <option value="excellent">Excellent - Fresh and appealing</option>
                      <option value="good">Good - Normal appearance</option>
                      <option value="acceptable">Acceptable - Minor issues</option>
                      <option value="poor">Poor - Concerning signs</option>
                    </select>
                  </div>

                  {/* Packaging Condition */}
                  <div className="form-group-verify">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={checklist.packagingCheck}
                        onChange={() => handleChecklistChange('packagingCheck')}
                      />
                      <span>Packaging Condition Checked</span>
                    </label>
                    <select
                      name="packagingCondition"
                      value={verificationData.packagingCondition}
                      onChange={handleInputChange}
                      className="verify-input"
                      required
                    >
                      <option value="">Select packaging condition</option>
                      <option value="sealed">Properly Sealed</option>
                      <option value="intact">Intact and Clean</option>
                      <option value="minor-damage">Minor Damage</option>
                      <option value="damaged">Damaged/Compromised</option>
                    </select>
                  </div>

                  {/* Photo Upload */}
                  <div className="form-group-verify">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={checklist.photosUploaded}
                        readOnly
                      />
                      <span>Photos Uploaded with Timestamp & GPS</span>
                    </label>
                    <div className="photo-upload-area">
                      <input
                        type="file"
                        id="photo-upload"
                        multiple
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        style={{ display: 'none' }}
                      />
                      <label htmlFor="photo-upload" className="upload-label">
                        <FaCamera size={32} />
                        <p>Click or drag images here</p>
                        <span className="upload-hint">Upload photos with timestamp + GPS location</span>
                      </label>
                    </div>
                    {verificationData.photos.length > 0 && (
                      <div className="photo-preview-grid">
                        {verificationData.photos.map((photo, index) => (
                          <img key={index} src={photo} alt={`Preview ${index + 1}`} className="photo-preview" />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Status Selection */}
                  <div className="status-section">
                    <h4>Verification Status</h4>
                    <div className="status-buttons">
                      <button
                        type="button"
                        className={`status-btn safe ${verificationData.status === 'safe' ? 'active' : ''}`}
                        onClick={() => handleStatusChange('safe')}
                      >
                        <FaCheckCircle /> Safe
                      </button>
                      <button
                        type="button"
                        className={`status-btn consume-soon ${verificationData.status === 'consume-soon' ? 'active' : ''}`}
                        onClick={() => handleStatusChange('consume-soon')}
                      >
                        <FaExclamationTriangle /> Consume Soon
                      </button>
                      <button
                        type="button"
                        className={`status-btn rejected ${verificationData.status === 'rejected' ? 'active' : ''}`}
                        onClick={() => handleStatusChange('rejected')}
                      >
                        <FaTimesCircle /> Rejected
                      </button>
                    </div>

                    {verificationData.status === 'consume-soon' && (
                      <div className="conditional-field">
                        <label>Consume Within (hours):</label>
                        <input
                          type="number"
                          name="consumeWithinHours"
                          value={verificationData.consumeWithinHours}
                          onChange={handleInputChange}
                          className="verify-input"
                          placeholder="Enter hours"
                          required
                        />
                      </div>
                    )}

                    {verificationData.status === 'rejected' && (
                      <div className="conditional-field">
                        <label>Rejection Reason:</label>
                        <textarea
                          name="rejectionReason"
                          value={verificationData.rejectionReason}
                          onChange={handleInputChange}
                          className="verify-textarea"
                          placeholder="Explain why the food is being rejected"
                          required
                        />
                      </div>
                    )}
                  </div>

                  {/* Additional Notes */}
                  <div className="form-group-verify">
                    <label>Additional Notes (Optional):</label>
                    <textarea
                      name="notes"
                      value={verificationData.notes}
                      onChange={handleInputChange}
                      className="verify-textarea"
                      placeholder="Any additional observations..."
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="submit-verification-btn"
                    disabled={submitting}
                  >
                    {submitting ? 'Submitting...' : 'Complete Verification & Start Delivery'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyPickup;
