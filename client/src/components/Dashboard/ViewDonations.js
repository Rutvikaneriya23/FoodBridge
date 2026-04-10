import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import {
  FaUtensils,
  FaArrowLeft,
  FaEdit,
  FaTrash,
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaPhone,
  FaBox,
  FaCheckCircle,
  FaTruck,
  FaTimesCircle,
  FaSpinner
} from 'react-icons/fa';
import '../Auth/Admin.css';
import './Donation.css';

const ViewDonations = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Sync user data from server on component mount
  useEffect(() => {
    const syncUserFromServer = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success && response.data.user) {
          updateUser(response.data.user);
          console.log('User synced from server:', response.data.user);
        }
      } catch (error) {
        console.error('Failed to sync user from server:', error);
        if (error.response?.status === 403 || error.response?.status === 401) {
          // Token invalid or user not authorized
          navigate('/select-role');
        }
      }
    };
    syncUserFromServer();
  }, []);

  useEffect(() => {
    fetchDonations();
  }, [filter]);

  const fetchDonations = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('authToken');
      const url = filter === 'all' 
        ? 'http://localhost:5000/api/donations'
        : `http://localhost:5000/api/donations?status=${filter}`;
      
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setDonations(response.data.donations);
      }
    } catch (err) {
      console.error('Fetch donations error:', err);
      const errorMsg = err.response?.data?.message || 'Failed to fetch donations';
      setError(errorMsg);
      
      // If role selection required, redirect
      if (err.response?.data?.requiresRoleSelection) {
        setTimeout(() => navigate('/select-role'), 2000);
      }
      // If wrong role, redirect to correct dashboard
      else if (err.response?.data?.userRole) {
        const userRole = err.response.data.userRole;
        setTimeout(() => navigate(`/${userRole}-dashboard`), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.delete(
        `http://localhost:5000/api/donations/${id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setDonations(donations.filter(d => d._id !== id));
        setShowDeleteModal(false);
        setSelectedDonation(null);
      }
    } catch (err) {
      console.error('Delete donation error:', err);
      setError(err.response?.data?.message || 'Failed to delete donation');
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'available': { icon: <FaBox />, class: 'status-available', text: 'Available' },
      'assigned': { icon: <FaTruck />, class: 'status-assigned', text: 'Assigned' },
      'picked-up': { icon: <FaTruck />, class: 'status-picked', text: 'Picked Up' },
      'delivered': { icon: <FaCheckCircle />, class: 'status-delivered', text: 'Delivered' },
      'cancelled': { icon: <FaTimesCircle />, class: 'status-cancelled', text: 'Cancelled' }
    };
    
    const badge = badges[status] || badges['available'];
    return (
      <span className={`status-badge ${badge.class}`}>
        {badge.icon} {badge.text}
      </span>
    );
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isExpired = (expiryDate) => {
    return new Date(expiryDate) < new Date();
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
          <button onClick={() => navigate('/donor-dashboard')} className="btn btn-secondary btn-small">
            <FaArrowLeft /> Back to Dashboard
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="dashboard-content">
        <div className="container">
          <div className="donations-header card mb-4">
            <div className="donations-title">
              <h2><FaBox /> My Donations</h2>
              <p className="text-muted">View and manage all your donations</p>
            </div>
            <button 
              onClick={() => navigate('/add-donation')} 
              className="btn btn-primary"
            >
              <FaUtensils /> Add New Donation
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="filter-tabs card mb-4">
            <button 
              className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All Donations
            </button>
            <button 
              className={`filter-tab ${filter === 'available' ? 'active' : ''}`}
              onClick={() => setFilter('available')}
            >
              Available
            </button>
            <button 
              className={`filter-tab ${filter === 'assigned' ? 'active' : ''}`}
              onClick={() => setFilter('assigned')}
            >
              Assigned
            </button>
            <button 
              className={`filter-tab ${filter === 'delivered' ? 'active' : ''}`}
              onClick={() => setFilter('delivered')}
            >
              Delivered
            </button>
            <button 
              className={`filter-tab ${filter === 'cancelled' ? 'active' : ''}`}
              onClick={() => setFilter('cancelled')}
            >
              Cancelled
            </button>
          </div>

          {error && (
            <div className="alert alert-error mb-4">
              <strong>Error:</strong> {error}
              {error.includes('select a role') && (
                <div style={{ marginTop: '10px' }}>
                  <p>Redirecting to role selection...</p>
                  <button 
                    onClick={() => navigate('/select-role')} 
                    className="btn btn-primary"
                    style={{ marginTop: '10px' }}
                  >
                    Select Role Now
                  </button>
                </div>
              )}
              {error.includes('Access denied') && !error.includes('select a role') && (
                <div style={{ marginTop: '10px' }}>
                  <p>This page is for donors only. You will be redirected to your dashboard.</p>
                  <button 
                    onClick={() => navigate(`/${user?.role}-dashboard`)} 
                    className="btn btn-primary"
                    style={{ marginTop: '10px' }}
                  >
                    Go to My Dashboard
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="loading-container card">
              <FaSpinner className="spinner" size={48} />
              <p>Loading donations...</p>
            </div>
          ) : donations.length === 0 ? (
            <div className="empty-state card">
              <FaBox size={64} opacity={0.3} />
              <h3>No donations found</h3>
              <p className="text-muted">
                {filter === 'all' 
                  ? "You haven't created any donations yet" 
                  : `No ${filter} donations found`}
              </p>
              <button 
                onClick={() => navigate('/add-donation')} 
                className="btn btn-primary mt-3"
              >
                Create Your First Donation
              </button>
            </div>
          ) : (
            <div className="donations-grid">
              {donations.map(donation => (
                <div key={donation._id} className="flip-card">
                  <div className="flip-card-inner">
                    {/* Front: Food Image */}
                    <div className="flip-card-front">
                      {donation.foodImage ? (
                        <img src={donation.foodImage} alt={donation.foodName} />
                      ) : (
                        <div className="image-placeholder">
                          <FaUtensils size={64} />
                          <p>No Image</p>
                        </div>
                      )}
                      <div className="front-overlay">
                        <h3>{donation.foodName}</h3>
                        {getStatusBadge(donation.status)}
                      </div>
                    </div>

                    {/* Back: Food Details */}
                    <div className="flip-card-back">
                      <div className="back-content">
                        <h3 className="back-title">{donation.foodName}</h3>
                        
                        <div className="back-info">
                          <div className="info-row">
                            <FaBox />
                            <span>{donation.quantity} {donation.quantityUnit}</span>
                          </div>
                          <div className="info-row">
                            <FaMapMarkerAlt />
                            <span>{donation.donorLocation}</span>
                          </div>
                          <div className="info-row">
                            <FaPhone />
                            <span>{donation.donorPhone}</span>
                          </div>
                          <div className="info-row">
                            <FaClock />
                            <span>{formatDate(donation.preparedOn)}</span>
                          </div>
                          <div className={`info-row ${isExpired(donation.expiryDate) ? 'expired' : ''}`}>
                            <FaCalendarAlt />
                            <span>Expires: {formatDate(donation.expiryDate)}</span>
                          </div>
                        </div>

                        <div className="back-actions">
                          {donation.status === 'available' && !isExpired(donation.expiryDate) && (
                            <>
                              <button 
                                className="btn-icon btn-edit"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/edit-donation/${donation._id}`);
                                }}
                                title="Edit"
                              >
                                <FaEdit />
                              </button>
                              <button 
                                className="btn-icon btn-delete"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedDonation(donation);
                                  setShowDeleteModal(true);
                                }}
                                title="Delete"
                              >
                                <FaTrash />
                              </button>
                            </>
                          )}
                          {(donation.status === 'assigned' || donation.status === 'picked-up') && (
                            <button 
                              className="btn-icon btn-cancel"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedDonation(donation);
                                setShowDeleteModal(true);
                              }}
                              title="Cancel"
                            >
                              <FaTimesCircle />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedDonation && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>
              {['assigned', 'picked-up'].includes(selectedDonation.status) 
                ? 'Cancel Donation?' 
                : 'Delete Donation?'}
            </h3>
            <p>
              {['assigned', 'picked-up'].includes(selectedDonation.status)
                ? `Are you sure you want to cancel "${selectedDonation.foodName}"? This donation is already ${selectedDonation.status}.`
                : `Are you sure you want to delete "${selectedDonation.foodName}"? This action cannot be undone.`}
            </p>
            <div className="modal-actions">
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedDonation(null);
                }}
                disabled={deletingId}
              >
                No, Keep It
              </button>
              <button 
                className="btn btn-danger"
                onClick={() => handleDelete(selectedDonation._id)}
                disabled={deletingId === selectedDonation._id}
              >
                {deletingId === selectedDonation._id ? (
                  <>
                    <FaSpinner className="spinner" /> Processing...
                  </>
                ) : (
                  <>
                    <FaTrash /> Yes, {['assigned', 'picked-up'].includes(selectedDonation.status) ? 'Cancel' : 'Delete'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewDonations;
