import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';
import './AuthSplit.css';

const logo = '/Foodbridge_black.svg';

const Signup = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    location: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setFieldErrors({});
  };

  const validateForm = () => {
    const errors = {};

    if (formData.name.length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }

    if (!/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/.test(formData.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }

    if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]/.test(formData.password)) {
      errors.password = 'Password must contain uppercase, lowercase, number and special character';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (formData.location.length < 3) {
      errors.location = 'Please enter a valid location';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const dataToSend = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        location: formData.location
      };

      const response = await signup(dataToSend);
      
      if (response.requiresRoleSelection) {
        navigate('/select-role');
      } else {
        navigate(`/${response.user.role}-dashboard`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split-container">
      {/* Left Side - Illustration */}
      <div className="auth-left-panel">
        <div className="auth-left-content">
          <div className="auth-brand">
            <img src={logo} alt="FoodBridge" className="brand-logo" />
          </div>
          <h1 className="brand-title">Food Bridge</h1>
          <p className="brand-subtitle">Connecting surplus food with communities in need</p>
          
          <div className="feature-list">
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <span>Real-time food tracking</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <span>Connect with NGOs & volunteers</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <span>Make an impact on hunger</span>
            </div>
          </div>
          
          <div className="illustration-overlay"></div>
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="auth-right-panel">
        <div className="auth-form-container">
          <div className="auth-form-card">
            <h2 className="form-title">Create Account</h2>
            <p className="form-subtitle">Join us in fighting hunger</p>

            {error && (
              <div className="alert alert-error">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="modern-form">
              {/* Name Input */}
              <div className="form-group">
                <div className="input-with-icon">
                  <span className="input-icon">👤</span>
                  <input
                    type="text"
                    name="name"
                    className={`modern-input ${fieldErrors.name ? 'error' : ''}`}
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                {fieldErrors.name && <span className="error-text">{fieldErrors.name}</span>}
              </div>

              {/* Email Input */}
              <div className="form-group">
                <div className="input-with-icon">
                  <span className="input-icon">📧</span>
                  <input
                    type="email"
                    name="email"
                    className={`modern-input ${fieldErrors.email ? 'error' : ''}`}
                    placeholder="Email address"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                {fieldErrors.email && <span className="error-text">{fieldErrors.email}</span>}
              </div>

              {/* Phone Input */}
              <div className="form-group">
                <div className="input-with-icon">
                  <span className="input-icon">📱</span>
                  <input
                    type="tel"
                    name="phone"
                    className={`modern-input ${fieldErrors.phone ? 'error' : ''}`}
                    placeholder="Phone number"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
                {fieldErrors.phone && <span className="error-text">{fieldErrors.phone}</span>}
              </div>

              {/* Location Input */}
              <div className="form-group">
                <div className="input-with-icon">
                  <span className="input-icon">📍</span>
                  <input
                    type="text"
                    name="location"
                    className={`modern-input ${fieldErrors.location ? 'error' : ''}`}
                    placeholder="Location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                  />
                </div>
                {fieldErrors.location && <span className="error-text">{fieldErrors.location}</span>}
              </div>

              {/* Password Input */}
              <div className="form-group">
                <div className="input-with-icon">
                  <span className="input-icon">🔒</span>
                  <input
                    type="password"
                    name="password"
                    className={`modern-input ${fieldErrors.password ? 'error' : ''}`}
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
                {fieldErrors.password && <span className="error-text">{fieldErrors.password}</span>}
              </div>

              {/* Confirm Password Input */}
              <div className="form-group">
                <div className="input-with-icon">
                  <span className="input-icon">🔒</span>
                  <input
                    type="password"
                    name="confirmPassword"
                    className={`modern-input ${fieldErrors.confirmPassword ? 'error' : ''}`}
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
                {fieldErrors.confirmPassword && <span className="error-text">{fieldErrors.confirmPassword}</span>}
              </div>

              <button
                type="submit"
                className="modern-btn modern-btn-primary"
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Sign Up'}
              </button>
            </form>

            <div className="form-footer">
              <p>Already have an account? <Link to="/login" className="link-primary">Sign in</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
