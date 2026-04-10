import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { profileAPI } from '../../utils/api';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaArrowLeft, FaEdit, FaStar, FaComments, FaTwitter, FaLinkedin, FaGithub, FaCamera } from 'react-icons/fa';
import '../Auth/Admin.css';
import './Profile.css';

const UserProfile = () => {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imagePreview, setImagePreview] = useState(user?.profileImage || null);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    location: user?.location || '',
    profileImage: user?.profileImage || null
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }

      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setImagePreview(base64String);
        setFormData({
          ...formData,
          profileImage: base64String
        });
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await profileAPI.updateProfile(formData);
      updateUser(response.data.profile);
      setSuccess('Profile updated successfully');
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (newRole) => {
    if (window.confirm(`Are you sure you want to switch to ${newRole} role?`)) {
      try {
        setLoading(true);
        const response = await profileAPI.changeRole(newRole);
        updateUser(response.data.profile);
        navigate(response.data.redirectTo);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to change role');
        setLoading(false);
      }
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/login');
    }
  };

  const roleColor = 
    user?.role === 'donor' ? '#4CAF50' :
    user?.role === 'receiver' ? '#8BC34A' :
    user?.role === 'volunteer' ? '#2196F3' :
    '#607D8B';

  return (
    <div className="profile-page-simple">
      {/* Logout Button */}
      <button className="logout-btn-top" onClick={handleLogout}>
        <span className="logout-icon">⏻</span> Logout
      </button>

      {/* Profile Container */}
      <div className="profile-simple-container">
        <div className="profile-content-simple">
          {/* Profile Photo and Info */}
          <div className="profile-top-section">
            {/* Large Profile Photo */}
            <div className="profile-photo-wrapper">
              <div className="profile-photo-circle">
                {imagePreview ? (
                  <img src={imagePreview} alt="Profile" className="profile-image-display" />
                ) : (
                  user?.name?.charAt(0).toUpperCase()
                )}
              </div>
              <label htmlFor="profile-image-upload" className="camera-button">
                <FaCamera />
                <input
                  type="file"
                  id="profile-image-upload"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
              </label>
            </div>

            {/* Profile Details */}
            <div className="profile-details-simple">
              <h1 className="profile-name-simple">{user?.name}</h1>
              <p className="profile-bio">
                {user?.role === 'donor' && 'Food Donor based in ' + (user?.location || 'Your Location') + '. Reducing food waste by sharing surplus food.'}
                {user?.role === 'receiver' && 'Receiver based in ' + (user?.location || 'Your Location') + '. Grateful member of FoodBridge community.'}
                {user?.role === 'volunteer' && 'Volunteer based in ' + (user?.location || 'Your Location') + '. Helping bridge the gap between donors and receivers.'}
              </p>

              {/* Social Icons */}
              <div className="social-icons-simple">
                <a href="#" className="social-icon"><FaTwitter /></a>
                <a href="#" className="social-icon"><FaLinkedin /></a>
                <a href="#" className="social-icon"><FaGithub /></a>
                <a href={`mailto:${user?.email}`} className="social-icon"><FaEnvelope /></a>
              </div>

              {/* Contact Details */}
              <div className="contact-details-simple">
                <div className="detail-item-simple">
                  <strong>Phone:</strong> {user?.phone || '+1 (555) 123-4567'}
                </div>
                <div className="detail-item-simple">
                  <strong>Email:</strong> {user?.email}
                </div>
                <div className="detail-item-simple">
                  <strong>Location:</strong> {user?.location || 'Not specified'}
                </div>
                <div className="detail-item-simple">
                  <strong>Role:</strong> {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                </div>
              </div>

              {/* Edit Profile Button */}
              {!editing ? (
                <button className="wdi-profile-btn" onClick={() => setEditing(true)}>
                  <FaEdit /> Edit Profile
                </button>
              ) : (
                <button className="wdi-profile-btn" onClick={() => setEditing(false)}>
                  Cancel Edit
                </button>
              )}
            </div>
          </div>

          {/* Edit Form (shown when editing) */}
          {editing && (
            <div className="edit-section-simple">
              {error && (
                <div className="alert alert-error mb-3 fade-in">
                  {error}
                </div>
              )}

              {success && (
                <div className="alert alert-success mb-3 fade-in">
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="edit-form-simple">
                <div className="form-row-simple">
                  <label>
                    <FaUser /> Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="form-input-simple"
                  />
                </div>

                <div className="form-row-simple">
                  <label>
                    <FaPhone /> Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="form-input-simple"
                  />
                </div>

                <div className="form-row-simple">
                  <label>
                    <FaMapMarkerAlt /> Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    className="form-input-simple"
                  />
                </div>

                <button 
                  type="submit" 
                  className="save-changes-btn"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          )}

          {/* Back to Dashboard */}
          <button 
            onClick={() => navigate(`/${user?.role}-dashboard`)} 
            className="back-to-dashboard-simple"
          >
            <FaArrowLeft /> Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
