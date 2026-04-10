import express from 'express';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import User from '../models/User.js';
import { authenticateAdmin } from '../middleware/auth.js';
import { validateAdminLogin, handleValidationErrors } from '../utils/validators.js';

const router = express.Router();

// @route   POST /api/admin/login
// @desc    Admin login
// @access  Public
router.post('/login', validateAdminLogin, handleValidationErrors, async (req, res) => {
  try {
    const { adminId, password } = req.body;

    // Find admin
    let admin = await Admin.findOne({ adminId }).select('+password');

    // Create default admin if doesn't exist (first-time setup)
    if (!admin && adminId === process.env.ADMIN_ID) {
      admin = new Admin({
        adminId: process.env.ADMIN_ID,
        password: process.env.ADMIN_PASSWORD,
        name: 'Super Administrator'
      });
      await admin.save();
      admin = await Admin.findOne({ adminId }).select('+password');
    }

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials'
      });
    }

    // Check if account is locked
    if (admin.isLocked()) {
      return res.status(423).json({
        success: false,
        message: 'Account locked due to too many failed attempts. Try again later.'
      });
    }

    // Verify password
    const isPasswordValid = await admin.comparePassword(password);

    if (!isPasswordValid) {
      await admin.incLoginAttempts();
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials',
        attemptsRemaining: Math.max(0, 5 - admin.loginAttempts)
      });
    }

    // Reset login attempts and update last login
    await admin.resetLoginAttempts();

    // Generate admin JWT token
    const token = jwt.sign(
      { adminId: admin.adminId, type: 'admin' },
      process.env.JWT_ADMIN_SECRET,
      { expiresIn: process.env.JWT_ADMIN_EXPIRE }
    );

    res.json({
      success: true,
      message: 'Admin login successful',
      token,
      admin: {
        adminId: admin.adminId,
        name: admin.name,
        permissions: admin.permissions,
        lastLogin: admin.lastLogin
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during admin login',
      error: error.message
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with filters
// @access  Private (Admin only)
router.get('/users', authenticateAdmin, async (req, res) => {
  try {
    const { role, isVerified, isSuspended, search, page = 1, limit = 20 } = req.query;

    // Build filter
    const filter = {};
    if (role) filter.role = role;
    if (isVerified !== undefined) filter.isVerified = isVerified === 'true';
    if (isSuspended !== undefined) filter.isSuspended = isSuspended === 'true';
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      users,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
});

// @route   GET /api/admin/users/:id
// @desc    Get specific user details
// @access  Private (Admin only)
router.get('/users/:id', authenticateAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
});

// @route   PATCH /api/admin/users/:id/verify
// @desc    Verify user account
// @access  Private (Admin only)
router.patch('/users/:id/verify', authenticateAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isVerified = true;
    await user.save();

    res.json({
      success: true,
      message: 'User verified successfully',
      user: {
        id: user._id,
        name: user.name,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Verify user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying user',
      error: error.message
    });
  }
});

// @route   PATCH /api/admin/users/:id/suspend
// @desc    Suspend/Unsuspend user account
// @access  Private (Admin only)
router.patch('/users/:id/suspend', authenticateAdmin, async (req, res) => {
  try {
    const { suspend } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isSuspended = suspend !== undefined ? suspend : !user.isSuspended;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.isSuspended ? 'suspended' : 'activated'} successfully`,
      user: {
        id: user._id,
        name: user.name,
        isSuspended: user.isSuspended
      }
    });
  } catch (error) {
    console.error('Suspend user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user status',
      error: error.message
    });
  }
});

// @route   GET /api/admin/stats
// @desc    Get platform statistics
// @access  Private (Admin only)
router.get('/stats', authenticateAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const donors = await User.countDocuments({ role: 'donor' });
    const receivers = await User.countDocuments({ role: 'receiver' });
    const volunteers = await User.countDocuments({ role: 'volunteer' });
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    const suspendedUsers = await User.countDocuments({ isSuspended: true });
    const pendingRoleSelection = await User.countDocuments({ role: null });

    // Recent users (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    res.json({
      success: true,
      stats: {
        totalUsers,
        usersByRole: {
          donors,
          receivers,
          volunteers,
          pendingRoleSelection
        },
        verifiedUsers,
        suspendedUsers,
        recentUsers,
        verificationRate: totalUsers > 0 ? ((verifiedUsers / totalUsers) * 100).toFixed(2) : 0
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
});

// @route   POST /api/admin/logout
// @desc    Admin logout
// @access  Private (Admin only)
router.post('/logout', authenticateAdmin, async (req, res) => {
  res.json({
    success: true,
    message: 'Admin logged out successfully'
  });
});

export default router;
