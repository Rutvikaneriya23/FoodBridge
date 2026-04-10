import express from 'express';
import { authenticateUser } from '../middleware/auth.js';
import User from '../models/User.js';
import Donation from '../models/Donation.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// @route   GET /api/profile
// @desc    Get user profile
// @access  Private
router.get('/', authenticateUser, async (req, res) => {
  try {
    const user = req.user;

    res.json({
      success: true,
      profile: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        location: user.location,
        role: user.role,
        profileImage: user.profileImage,
        isVerified: user.isVerified,
        profileComplete: user.profileComplete,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        stats: user.role === 'donor' ? user.donorStats :
               user.role === 'receiver' ? user.receiverStats :
               user.role === 'volunteer' ? user.volunteerStats : null
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message
    });
  }
});

// @route   GET /api/profile/stats
// @desc    Get user statistics based on role
// @access  Private
router.get('/stats', authenticateUser, async (req, res) => {
  try {
    const user = req.user;
    let stats = {};

    if (user.role === 'donor') {
      // Get donor statistics from donations collection
      const donations = await Donation.find({ donor: user._id });
      
      const totalDonations = donations.length;
      const totalMealsProvided = donations.reduce((sum, donation) => {
        return sum + (parseInt(donation.quantity) || 0);
      }, 0);
      
      const pendingPickups = donations.filter(d => 
        d.status === 'pending' || d.status === 'claimed'
      ).length;
      
      const completedDonations = donations.filter(d => 
        d.status === 'completed'
      ).length;
      
      // Calculate impact score (percentage of completed donations)
      const impactScore = totalDonations > 0 
        ? Math.round((completedDonations / totalDonations) * 100) 
        : 95; // Default score for new users

      stats = {
        totalDonations,
        mealsProvided: totalMealsProvided,
        pendingPickups,
        impactScore,
        completedDonations
      };
    } else if (user.role === 'receiver') {
      // Get receiver statistics
      const claimedDonations = await Donation.find({ receiver: user._id });
      
      stats = {
        totalRequests: claimedDonations.length,
        totalMealsReceived: claimedDonations.reduce((sum, d) => sum + (parseInt(d.quantity) || 0), 0),
        activeClaims: claimedDonations.filter(d => d.status === 'claimed' || d.status === 'in-transit').length
      };
    } else if (user.role === 'volunteer') {
      // Get volunteer statistics
      const deliveries = await Donation.find({ volunteer: user._id });
      
      stats = {
        totalDeliveries: deliveries.length,
        completedDeliveries: deliveries.filter(d => d.status === 'completed').length,
        activeDeliveries: deliveries.filter(d => d.status === 'in-transit').length
      };
    }

    res.json({
      success: true,
      stats
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

// @route   PATCH /api/profile
// @desc    Update user profile
// @access  Private
router.patch('/', authenticateUser, [
  body('name').optional().trim().isLength({ min: 2, max: 100 }),
  body('location').optional().trim().isLength({ min: 3 }),
  body('phone').optional().matches(/^[+]?[0-9]{10,15}$/),
  body('profileImage').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { name, location, phone, profileImage } = req.body;
    const user = req.user;

    if (name) user.name = name;
    if (location) user.location = location;
    if (profileImage !== undefined) user.profileImage = profileImage;
    if (phone) {
      // Check if phone already exists for another user
      const existingUser = await User.findOne({ 
        phone, 
        _id: { $ne: user._id } 
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Phone number already in use'
        });
      }
      user.phone = phone;
    }

    user.checkProfileComplete();
    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      profile: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        location: user.location,
        role: user.role,
        profileImage: user.profileImage,
        profileComplete: user.profileComplete
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
});

// @route   PATCH /api/profile/role
// @desc    Change user role
// @access  Private
router.patch('/role', authenticateUser, [
  body('role').isIn(['donor', 'receiver', 'volunteer'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { role } = req.body;
    const user = req.user;

    console.log('=== PROFILE ROLE CHANGE DEBUG ===');
    console.log('Requested role:', role);
    console.log('Request body:', req.body);
    console.log('User before update:', { id: user._id, currentRole: user.role });

    user.role = role;
    await user.save();

    console.log('User after update:', { id: user._id, newRole: user.role });
    console.log('=================================');

    res.json({
      success: true,
      message: `Role changed to ${role} successfully`,
      profile: {
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
    console.error('Change role error:', error);
    res.status(500).json({
      success: false,
      message: 'Error changing role',
      error: error.message
    });
  }
});

export default router;
