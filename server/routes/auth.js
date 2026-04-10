import express from 'express';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import { authenticateUser } from '../middleware/auth.js';
import {
  validateSignup,
  validateLogin,
  validateRoleSelection,
  handleValidationErrors
} from '../utils/validators.js';

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @route   POST /api/auth/signup
// @desc    Register a new user
// @access  Public
router.post('/signup', validateSignup, handleValidationErrors, async (req, res) => {
  try {
    const { name, email, phone, password, location } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.email === email 
          ? 'Email already registered' 
          : 'Phone number already registered'
      });
    }

    // Create new user
    const userData = {
      name,
      email,
      phone,
      password,
      location
    };

    const user = new User(userData);

    await user.save();

    // Generate JWT token (role included for faster validation)
    const token = jwt.sign(
      { 
        userId: user._id, 
        type: 'user',
        role: user.role // Include role in JWT
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    console.log('🔑 Signup - Token generated for user:', user.email, 'Role:', user.role);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        location: user.location,
        role: user.role,
        profileComplete: user.profileComplete
      },
      requiresRoleSelection: !user.role
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating account',
      error: error.message
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', validateLogin, handleValidationErrors, async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;

    // Find user by email or phone
    const user = await User.findOne({
      $or: [
        { email: emailOrPhone },
        { phone: emailOrPhone }
      ]
    }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if account is suspended
    if (user.isSuspended) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact support.'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    await user.updateLastLogin();

    // Generate JWT token (role included for faster validation)
    const token = jwt.sign(
      { 
        userId: user._id, 
        type: 'user',
        role: user.role // Include role in JWT
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    console.log('🔑 Login - Token generated for user:', user.email, 'Role:', user.role);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        location: user.location,
        role: user.role,
        profileComplete: user.profileComplete,
        isVerified: user.isVerified
      },
      requiresRoleSelection: !user.role
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during login',
      error: error.message
    });
  }
});

// @route   POST /api/auth/google
// @desc    Google OAuth login/signup
// @access  Public
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;

    console.log('🔐 Google OAuth Request Received');
    console.log('Client ID from env:', process.env.GOOGLE_CLIENT_ID);
    console.log('Credential received:', credential ? 'Yes' : 'No');

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: 'No credential provided'
      });
    }

    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    console.log('🔐 Google Login - Email:', email, 'Name:', name);

    // Check if user exists
    let user = await User.findOne({ email });

    if (user) {
      // User exists, update Google ID if not set
      if (!user.googleId) {
        user.googleId = googleId;
        user.profilePic = picture;
        await user.save();
      }

      // Check if account is suspended
      if (user.isSuspended) {
        return res.status(403).json({
          success: false,
          message: 'Your account has been suspended. Please contact support.'
        });
      }

      // Update last login
      await user.updateLastLogin();
      console.log('✅ Existing user logged in:', email);
    } else {
      // Create new user with Google account
      user = new User({
        name,
        email,
        googleId,
        profilePic: picture,
        isVerified: true, // Google accounts are pre-verified
        password: Math.random().toString(36).slice(-8) + 'Aa1!' // Random secure password (not used)
      });

      await user.save();
      console.log('✅ New user created with Google:', email);
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        type: 'user',
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    console.log('🔑 Google Login - Token generated for user:', user.email, 'Role:', user.role);

    res.json({
      success: true,
      message: 'Google login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        location: user.location,
        role: user.role,
        profileComplete: user.profileComplete,
        isVerified: user.isVerified,
        profilePic: user.profilePic
      },
      requiresRoleSelection: !user.role
    });
  } catch (error) {
    console.error('❌ Google login error:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Google authentication failed',
      error: error.message
    });
  }
});

// @route   POST /api/auth/select-role
// @desc    Select user role (first time or change)
// @access  Private
router.post('/select-role', authenticateUser, validateRoleSelection, handleValidationErrors, async (req, res) => {
  try {
    const { role } = req.body;
    const user = req.user;

    console.log('=== ROLE SELECTION DEBUG ===');
    console.log('Requested role:', role);
    console.log('Request body:', req.body);
    console.log('User before update:', { id: user._id, currentRole: user.role });

    // Update user role
    user.role = role;
    user.checkProfileComplete();
    await user.save();

    console.log('User after update:', { id: user._id, newRole: user.role });
    console.log('===========================');

    // ✅ CRITICAL FIX: Generate NEW token with updated role
    const newToken = jwt.sign(
      { 
        userId: user._id, 
        type: 'user',
        role: user.role // Include NEW role in JWT
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    console.log('🔑 Role Selection - NEW token generated with role:', user.role);

    res.json({
      success: true,
      message: `Role updated to ${role}`,
      token: newToken, // ✅ Send new token to frontend
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        location: user.location,
        role: user.role,
        profileComplete: user.profileComplete,
        isVerified: user.isVerified,
        donorStats: user.donorStats,
        receiverStats: user.receiverStats,
        volunteerStats: user.volunteerStats
      },
      redirectTo: `/${role}-dashboard`
    });
  } catch (error) {
    console.error('Role selection error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating role',
      error: error.message
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', authenticateUser, async (req, res) => {
  try {
    const user = req.user;

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        location: user.location,
        role: user.role,
        profileComplete: user.profileComplete,
        isVerified: user.isVerified,
        isSuspended: user.isSuspended,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        stats: user.role === 'donor' ? user.donorStats :
               user.role === 'receiver' ? user.receiverStats :
               user.role === 'volunteer' ? user.volunteerStats : null
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user data',
      error: error.message
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', authenticateUser, async (req, res) => {
  // In JWT authentication, logout is primarily handled client-side
  // This endpoint can be used for logging purposes
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

export default router;
