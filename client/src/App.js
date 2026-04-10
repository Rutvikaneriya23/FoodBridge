import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/Common/ProtectedRoute';

// Auth Components
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import RoleSelection from './components/Auth/RoleSelection';
import AdminLogin from './components/Auth/AdminLogin';

// Dashboard Components
import DonorDashboard from './components/Dashboard/DonorDashboard';
import ReceiverDashboard from './components/Dashboard/ReceiverDashboardNew';
import VolunteerDashboard from './components/Dashboard/VolunteerDashboardNew';
import AdminDashboard from './components/Dashboard/AdminDashboard';
import AddDonation from './components/Dashboard/AddDonation';
import ViewDonations from './components/Dashboard/ViewDonations';
import Chat from './components/Dashboard/Chat';
import ContactSupport from './components/Dashboard/ContactSupport';
import VerifyPickup from './components/Dashboard/VerifyPickup';

// Tracking Components
import ReceiverTracking from './components/Dashboard/ReceiverTracking';

// Profile Component
import UserProfile from './components/Profile/UserProfile';

// Styles
import './styles/theme.css';

// Google OAuth Client ID
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '414177393833-nm79k3h9t1gsv7pjor36190forgj81dm.apps.googleusercontent.com';

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Protected User Routes */}
            <Route
              path="/select-role"
              element={
                <ProtectedRoute>
                  <RoleSelection />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              }
            />

            {/* Role-Based Dashboards */}
            <Route
              path="/donor-dashboard"
              element={
                <ProtectedRoute requireRole="donor">
                  <DonorDashboard />
                </ProtectedRoute>
              }
            />

            {/* Donor Routes */}
            <Route
              path="/add-donation"
              element={
                <ProtectedRoute requireRole="donor">
                  <AddDonation />
                </ProtectedRoute>
              }
            />

            <Route
              path="/view-donations"
              element={
                <ProtectedRoute requireRole="donor">
                  <ViewDonations />
                </ProtectedRoute>
              }
            />

            <Route
              path="/receiver-dashboard"
              element={
                <ProtectedRoute requireRole="receiver">
                  <ReceiverDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/volunteer-dashboard"
              element={
                <ProtectedRoute requireRole="volunteer">
                  <VolunteerDashboard />
                </ProtectedRoute>
              }
            />

            {/* Verify Pickup Route */}
            <Route
              path="/verify-pickup/:donationId"
              element={
                <ProtectedRoute requireRole="volunteer">
                  <VerifyPickup />
                </ProtectedRoute>
              }
            />

            {/* Chat Route - Accessible to all authenticated users */}
            <Route
              path="/chat/:donationId"
              element={
                <ProtectedRoute>
                  <Chat />
                </ProtectedRoute>
              }
            />

            {/* Live Tracking Routes */}
            <Route
              path="/receiver-tracking/:deliveryId"
              element={
                <ProtectedRoute requireRole="receiver">
                  <ReceiverTracking />
                </ProtectedRoute>
              }
            />

            {/* Contact Support Route */}
            <Route
              path="/contact-support"
              element={
                <ProtectedRoute>
                  <ContactSupport />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* 404 Not Found */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
