import React from 'react';
import { FaCheckCircle, FaTruck, FaBox, FaFlagCheckered } from 'react-icons/fa';
import './DeliveryProgress.css';
import VerificationDetails from './VerificationDetails';

const DeliveryProgress = ({ donation }) => {
  const getStatusInfo = (status) => {
    const statusMap = {
      'available': { label: 'Available', step: 0, color: '#9E9E9E' },
      'claimed': { label: 'Claimed', step: 0, color: '#9E9E9E' },
      'assigned': { label: 'Accepted', step: 1, color: '#10b981' },
      'ASSIGNED': { label: 'Accepted', step: 1, color: '#10b981' },
      'picked-up': { label: 'Picked Up', step: 2, color: '#10b981' },
      'PICKED_UP': { label: 'Picked Up', step: 2, color: '#10b981' },
      'in-transit': { label: 'En Route', step: 3, color: '#10b981' },
      'ON_THE_WAY': { label: 'En Route', step: 3, color: '#10b981' },
      'delivered': { label: 'Delivered', step: 4, color: '#10b981' },
      'DELIVERED': { label: 'Delivered', step: 4, color: '#10b981' },
      'rejected': { label: 'Rejected', step: 0, color: '#ef4444' },
      'cancelled': { label: 'Cancelled', step: 0, color: '#ef4444' }
    };

    return statusMap[status] || { label: status, step: 0, color: '#9E9E9E' };
  };

  const currentStatus = getStatusInfo(donation?.status);

  const steps = [
    { id: 1, label: 'Accepted', icon: <FaCheckCircle />, step: 1 },
    { id: 2, label: 'Picked Up', icon: <FaBox />, step: 2 },
    { id: 3, label: 'En Route', icon: <FaTruck />, step: 3 },
    { id: 4, label: 'Delivered', icon: <FaFlagCheckered />, step: 4 }
  ];

  const isCompleted = (step) => step <= currentStatus.step;
  const isCurrent = (step) => step === currentStatus.step;

  // Show verification status if available
  const verificationStatus = donation?.verification?.verificationStatus;

  return (
    <div className="delivery-progress-card">
      <div className="delivery-header">
        <h3>Delivery Progress</h3>
        <span className="from-to">
          From <strong>{donation?.donor?.name || 'Donor'}</strong> → Hope Shelter
        </span>
      </div>

      {/* Verification Status Badge */}
      {verificationStatus && (
        <div className={`verification-badge ${verificationStatus}`}>
          {verificationStatus === 'safe' && (
            <>
              <FaCheckCircle /> Safe - Quality Verified
            </>
          )}
          {verificationStatus === 'consume-soon' && (
            <>
              ⚠️ Consume within {donation.verification.consumeWithinHours} hours
            </>
          )}
          {verificationStatus === 'rejected' && (
            <>
              ❌ Rejected - {donation.verification.rejectionReason}
            </>
          )}
        </div>
      )}

      {/* Progress Timeline */}
      <div className="progress-timeline">
        {steps.map((step, index) => (
          <div key={step.id} className="progress-step-wrapper">
            <div
              className={`progress-step ${isCompleted(step.step) ? 'completed' : ''} ${
                isCurrent(step.step) ? 'current' : ''
              }`}
            >
              <div className="step-icon">{step.icon}</div>
              <div className="step-label">{step.label}</div>
            </div>
            {index < steps.length - 1 && (
              <div className={`progress-line ${isCompleted(step.step + 1) ? 'completed' : ''}`} />
            )}
          </div>
        ))}
      </div>

      {/* Contact Buttons */}
      <div className="progress-actions">
        {donation?.assignedTo?.volunteer && (
          <button className="contact-btn volunteer-btn">
            <FaTruck /> Call Volunteer
          </button>
        )}
        <button className="contact-btn map-btn">
          📍 View Map
        </button>
      </div>

      {/* Verification Details - Expandable */}
      {donation?.verification && <VerificationDetails verification={donation.verification} />}
    </div>
  );
};

export default DeliveryProgress;
