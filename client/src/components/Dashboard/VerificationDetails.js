import React, { useState } from 'react';
import { FaCheckCircle, FaThermometerHalf, FaEye, FaBox, FaCamera, FaMapMarkerAlt, FaClock, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import './VerificationDetails.css';

const VerificationDetails = ({ verification }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!verification || !verification.verifiedAt) {
    return null;
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTemperatureLabel = (temp) => {
    const labels = {
      'hot': 'Hot (>60°C)',
      'warm': 'Warm (30-60°C)',
      'room': 'Room Temp (15-30°C)',
      'cold': 'Cold (<15°C)'
    };
    return labels[temp] || temp;
  };

  const getConditionLabel = (condition) => {
    const labels = {
      'excellent': '⭐ Excellent',
      'good': '✅ Good',
      'acceptable': '👍 Acceptable',
      'poor': '⚠️ Poor'
    };
    return labels[condition] || condition;
  };

  const getPackagingLabel = (packaging) => {
    const labels = {
      'sealed': '🔒 Sealed',
      'intact': '✅ Intact',
      'minor-damage': '⚠️ Minor Damage',
      'damaged': '❌ Damaged'
    };
    return labels[packaging] || packaging;
  };

  return (
    <div className="verification-details-card">
      <div className="verification-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="verification-title">
          <FaCheckCircle className="verify-icon" />
          <span>Quality Verification Details</span>
        </div>
        <button className="expand-btn">
          {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
        </button>
      </div>

      {isExpanded && (
        <div className="verification-content">
          {/* Checklist Items */}
          <div className="checklist-grid">
            <div className="checklist-item">
              <div className="checklist-icon cooking">
                <FaClock />
              </div>
              <div className="checklist-info">
                <div className="checklist-label">Cooking Time</div>
                <div className="checklist-value">
                  {formatDate(verification.cookingTime)}
                </div>
              </div>
            </div>

            <div className="checklist-item">
              <div className="checklist-icon temperature">
                <FaThermometerHalf />
              </div>
              <div className="checklist-info">
                <div className="checklist-label">Temperature</div>
                <div className="checklist-value">
                  {getTemperatureLabel(verification.temperatureRange)}
                </div>
              </div>
            </div>

            <div className="checklist-item">
              <div className="checklist-icon appearance">
                <FaEye />
              </div>
              <div className="checklist-info">
                <div className="checklist-label">Smell & Appearance</div>
                <div className="checklist-value">
                  {getConditionLabel(verification.smellAppearance)}
                </div>
              </div>
            </div>

            <div className="checklist-item">
              <div className="checklist-icon packaging">
                <FaBox />
              </div>
              <div className="checklist-info">
                <div className="checklist-label">Packaging</div>
                <div className="checklist-value">
                  {getPackagingLabel(verification.packagingCondition)}
                </div>
              </div>
            </div>
          </div>

          {/* GPS Location */}
          {verification.gpsLocation && (
            <div className="gps-section">
              <div className="section-title">
                <FaMapMarkerAlt /> GPS Location Verified
              </div>
              <div className="gps-coords">
                Lat: {verification.gpsLocation.coordinates[1].toFixed(6)}, 
                Lng: {verification.gpsLocation.coordinates[0].toFixed(6)}
              </div>
            </div>
          )}

          {/* Photos */}
          {verification.photos && verification.photos.length > 0 && (
            <div className="photos-section">
              <div className="section-title">
                <FaCamera /> Verification Photos ({verification.photos.length})
              </div>
              <div className="photos-grid">
                {verification.photos.map((photo, index) => (
                  <div key={index} className="photo-thumbnail">
                    <img src={photo} alt={`Verification ${index + 1}`} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Additional Notes */}
          {verification.notes && (
            <div className="notes-section">
              <div className="section-title">📝 Volunteer Notes</div>
              <div className="notes-content">{verification.notes}</div>
            </div>
          )}

          {/* Verification Footer */}
          <div className="verification-footer">
            <div className="verified-at">
              Verified at {formatDate(verification.verifiedAt)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerificationDetails;
