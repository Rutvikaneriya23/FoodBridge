import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaUtensils, FaUsers, FaTruck } from 'react-icons/fa';
import './Auth.css';

const logo = '/Foodbridge_black.svg';

const RoleSelection = () => {
  const navigate = useNavigate();
  const { selectRole, user } = useAuth();
  const [selectedRole, setSelectedRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const roles = [
    {
      id: 'donor',
      icon: <FaUtensils size={48} />,
      title: 'Donor',
      description: 'I want to donate surplus food',
      color: '#4CAF50'
    },
    {
      id: 'receiver',
      icon: <FaUsers size={48} />,
      title: 'Needy / Receiver',
      description: 'I want to request food',
      color: '#8BC34A'
    },
    {
      id: 'volunteer',
      icon: <FaTruck size={48} />,
      title: 'Volunteer',
      description: 'I want to help with pickup & delivery',
      color: '#2196F3'
    }
  ];

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setError('');
  };

  const handleSubmit = async () => {
    if (!selectedRole) {
      setError('Please select a role to continue');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await selectRole(selectedRole);
      navigate(response.redirectTo);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container role-selection-container">
      <div className="role-selection-card fade-in">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', marginBottom: '32px' }}>
          <img src={logo} alt="FoodBridge" style={{ height: '85px', width: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 6px 12px rgba(255, 140, 0, 0.4))' }} />
          <h2 style={{ margin: 0, fontFamily: 'Poppins, sans-serif', fontSize: '42px', fontWeight: '800', background: 'linear-gradient(135deg, #FF8C00 0%, #FF6B00 50%, #FFB347 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-1px' }}>Food Bridge</h2>
        </div>
        <div className="auth-logo">
          <div className="logo-icon">🌱</div>
        </div>

        <div className="role-selection-content">
          <h2 className="text-center mb-1">Welcome, {user?.name}!</h2>
          <p className="text-center text-muted mb-4">
            Choose your role to get started
          </p>

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          <div className="role-cards">
            {roles.map((role) => (
              <div
                key={role.id}
                className={`role-card ${selectedRole === role.id ? 'selected' : ''}`}
                onClick={() => handleRoleSelect(role.id)}
                style={{
                  borderColor: selectedRole === role.id ? role.color : 'transparent'
                }}
              >
                <div className="role-icon" style={{ color: role.color }}>
                  {role.icon}
                </div>
                <h3 className="role-title">{role.title}</h3>
                <p className="role-description">{role.description}</p>
                <div className={`role-checkbox ${selectedRole === role.id ? 'checked' : ''}`}>
                  {selectedRole === role.id && '✓'}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleSubmit}
            className="btn btn-primary btn-large btn-block mt-4"
            disabled={loading || !selectedRole}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Setting up...
              </>
            ) : (
              'Continue to Dashboard'
            )}
          </button>

          <p className="text-sm text-muted text-center mt-3">
            You can change your role later from your profile settings
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
