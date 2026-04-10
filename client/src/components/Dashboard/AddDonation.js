import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import {
  FaUtensils,
  FaArrowLeft,
  FaCamera,
  FaMapMarkerAlt,
  FaPhone,
  FaUser,
  FaInfoCircle,
  FaClock,
  FaCalendarAlt,
  FaWeight
} from 'react-icons/fa';
import '../Auth/Admin.css';
import './Donation.css';

const AddDonation = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userChecked, setUserChecked] = useState(false);

  // Check if user has donor role - ALWAYS fetch from server
  React.useEffect(() => {
    const checkAndSyncUserRole = async () => {
      if (!user) {
        navigate('/login');
        return;
      }
      
      // Always fetch fresh data from server
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get('http://localhost:5000/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.data.success && response.data.user) {
          const serverUser = response.data.user;
          console.log('✅ Fresh user data from server:', serverUser);
          
          // Update localStorage and context with fresh data
          localStorage.setItem('user', JSON.stringify(serverUser));
          updateUser(serverUser);
          
          if (serverUser.role !== 'donor') {
            setError(`Your current role is "${serverUser.role}". You need the Donor role to create donations. Redirecting to profile...`);
            setTimeout(() => navigate('/profile'), 3000);
          } else {
            console.log('✅ User has donor role, ready to create donation');
            setUserChecked(true);
          }
        }
      } catch (err) {
        console.error('Error fetching user:', err);
        setError('Unable to verify your role. Please login again.');
        setTimeout(() => navigate('/login'), 2000);
      }
    };
    
    checkAndSyncUserRole();
  }, []); // Run only once on mount
  
  const [formData, setFormData] = useState({
    donorName: user?.name || '',
    donorPhone: user?.phone || '',
    donorLocation: user?.location || '',
    foodType: 'Cooked Food',
    foodName: '',
    foodDescription: '',
    quantity: '',
    quantityUnit: 'servings',
    preparedOn: new Date().toISOString().split('T')[0],
    expiryDate: '',
    foodImage: '',
    notes: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image size should be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          foodImage: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    if (!formData.donorName.trim()) return 'Please enter your name';
    if (!formData.donorPhone.trim()) return 'Please enter your contact number';
    if (!formData.donorLocation.trim()) return 'Please enter pickup location';
    if (!formData.foodName.trim()) return 'Please enter food name';
    if (!formData.foodDescription.trim()) return 'Please enter food description';
    if (!formData.quantity || formData.quantity <= 0) return 'Please enter valid quantity';
    if (!formData.expiryDate) return 'Please enter expiry date';
    
    const prepDate = new Date(formData.preparedOn);
    const expDate = new Date(formData.expiryDate);
    const now = new Date();
    
    if (prepDate > now) return 'Preparation date cannot be in the future';
    if (expDate <= now) return 'Expiry date must be in the future';
    if (expDate <= prepDate) return 'Expiry date must be after preparation date';
    
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post(
        'http://localhost:5000/api/donations',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setSuccess('Donation created successfully! Redirecting...');
        setTimeout(() => {
          navigate('/donor-dashboard');
        }, 2000);
      }
    } catch (err) {
      console.error('Donation creation error:', err);
      setError(err.response?.data?.message || 'Failed to create donation. Please try again.');
    } finally {
      setLoading(false);
    }
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
        <div className="container" style={{ maxWidth: '800px' }}>
          <div className="card">
            <div className="donation-form-header">
              <h2><FaUtensils /> Add New Donation</h2>
              <p className="text-muted">Fill in the details about the food you want to donate</p>
            </div>

            {error && (
              <div className="alert alert-error">
                <strong>Error:</strong> {error}
              </div>
            )}

            {success && (
              <div className="alert alert-success">
                <strong>Success:</strong> {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="donation-form">
              {/* Donor Information Section */}
              <div className="form-section">
                <h3 className="section-title">
                  <FaUser /> Your Information
                </h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="donorName">
                      <FaUser /> Full Name *
                    </label>
                    <input
                      type="text"
                      id="donorName"
                      name="donorName"
                      value={formData.donorName}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="donorPhone">
                      <FaPhone /> Contact Number *
                    </label>
                    <input
                      type="tel"
                      id="donorPhone"
                      name="donorPhone"
                      value={formData.donorPhone}
                      onChange={handleChange}
                      placeholder="Enter your phone number"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="donorLocation">
                    <FaMapMarkerAlt /> Pickup Location *
                  </label>
                  <input
                    type="text"
                    id="donorLocation"
                    name="donorLocation"
                    value={formData.donorLocation}
                    onChange={handleChange}
                    placeholder="Enter complete pickup address"
                    required
                  />
                </div>
              </div>

              {/* Food Information Section */}
              <div className="form-section">
                <h3 className="section-title">
                  <FaInfoCircle /> Food Information
                </h3>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="foodType">
                      Food Category *
                    </label>
                    <select
                      id="foodType"
                      name="foodType"
                      value={formData.foodType}
                      onChange={handleChange}
                      required
                    >
                      <option value="Cooked Food">Cooked Food</option>
                      <option value="Raw Food">Raw Food</option>
                      <option value="Packaged Food">Packaged Food</option>
                      <option value="Baked Goods">Baked Goods</option>
                      <option value="Fruits & Vegetables">Fruits & Vegetables</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="foodName">
                      <FaUtensils /> Food Name *
                    </label>
                    <input
                      type="text"
                      id="foodName"
                      name="foodName"
                      value={formData.foodName}
                      onChange={handleChange}
                      placeholder="e.g., Rice & Curry, Bread, Fruits"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="foodDescription">
                    <FaInfoCircle /> Description *
                  </label>
                  <textarea
                    id="foodDescription"
                    name="foodDescription"
                    value={formData.foodDescription}
                    onChange={handleChange}
                    placeholder="Describe the food, ingredients, preparation method, etc."
                    rows="4"
                    maxLength="500"
                    required
                  />
                  <small className="form-text">{formData.foodDescription.length}/500 characters</small>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="quantity">
                      <FaWeight /> Quantity *
                    </label>
                    <input
                      type="number"
                      id="quantity"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleChange}
                      placeholder="Enter quantity"
                      min="1"
                      step="any"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="quantityUnit">
                      Unit *
                    </label>
                    <select
                      id="quantityUnit"
                      name="quantityUnit"
                      value={formData.quantityUnit}
                      onChange={handleChange}
                      required
                    >
                      <option value="servings">Servings</option>
                      <option value="kg">Kilograms (kg)</option>
                      <option value="plates">Plates</option>
                      <option value="pieces">Pieces</option>
                      <option value="packets">Packets</option>
                      <option value="liters">Liters</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="preparedOn">
                      <FaClock /> Prepared On *
                    </label>
                    <input
                      type="date"
                      id="preparedOn"
                      name="preparedOn"
                      value={formData.preparedOn}
                      onChange={handleChange}
                      max={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="expiryDate">
                      <FaCalendarAlt /> Expiry Date/Time *
                    </label>
                    <input
                      type="datetime-local"
                      id="expiryDate"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleChange}
                      min={new Date().toISOString().slice(0, 16)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="foodImage">
                    <FaCamera /> Food Picture (Optional)
                  </label>
                  <div className="image-upload-container">
                    <input
                      type="file"
                      id="foodImage"
                      name="foodImage"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="file-input"
                    />
                    {formData.foodImage && (
                      <div className="image-preview">
                        <img src={formData.foodImage} alt="Food preview" />
                        <button 
                          type="button" 
                          className="remove-image"
                          onClick={() => setFormData(prev => ({ ...prev, foodImage: '' }))}
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                  <small className="form-text">Maximum file size: 5MB (JPG, PNG, WEBP)</small>
                </div>

                <div className="form-group">
                  <label htmlFor="notes">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Any special instructions or additional information"
                    rows="3"
                    maxLength="300"
                  />
                  <small className="form-text">{formData.notes.length}/300 characters</small>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="form-actions">
                <button 
                  type="button" 
                  onClick={() => navigate('/donor-dashboard')} 
                  className="btn btn-secondary"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Creating Donation...' : 'Create Donation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddDonation;
