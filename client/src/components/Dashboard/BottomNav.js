import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaHome, FaUser, FaComments } from 'react-icons/fa';
import './BottomNav.css';

const BottomNav = ({ role }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    {
      icon: <FaHome />,
      title: 'Home',
      path: `/${role}-dashboard`
    },
    {
      icon: <FaComments />,
      title: 'Chat',
      path: '/contact-support'
    },
    {
      icon: <FaUser />,
      title: 'Profile',
      path: '/profile'
    }
  ];

  return (
    <nav className="bottom-nav-menu">
      {navItems.map((item, index) => (
        <button
          key={index}
          className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
          onClick={() => navigate(item.path)}
        >
          <span className="link-icon">{item.icon}</span>
          <span className="link-title">{item.title}</span>
        </button>
      ))}
    </nav>
  );
};

export default BottomNav;
