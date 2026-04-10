import express from 'express';
import Donation from '../models/Donation.js';
import User from '../models/User.js';
import { authenticateUser } from '../middleware/auth.js';
import { checkRole } from '../middleware/roleCheck.js';

const router = express.Router();

// @route   POST /api/donations
// @desc    Create a new donation
// @access  Private (Donor only)
router.post('/', authenticateUser, checkRole(['donor']), async (req, res) => {
  try {
    const {
      donorName,
      donorPhone,
      donorLocation,
      foodType,
      foodName,
      foodDescription,
      quantity,
      quantityUnit,
      preparedOn,
      expiryDate,
      foodImage,
      notes
    } = req.body;

    // Validate required fields
    if (!donorName || !donorPhone || !donorLocation || !foodType || !foodName || !foodDescription || !quantity || !preparedOn || !expiryDate) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields' 
      });
    }

    // Validate dates
    const prepDate = new Date(preparedOn);
    const expDate = new Date(expiryDate);
    const now = new Date();

    if (expDate <= now) {
      return res.status(400).json({ 
        success: false, 
        message: 'Expiry date must be in the future' 
      });
    }

    if (prepDate > now) {
      return res.status(400).json({ 
        success: false, 
        message: 'Preparation date cannot be in the future' 
      });
    }

    // Create donation
    const donation = new Donation({
      donor: req.user._id,
      donorName,
      donorPhone,
      donorLocation,
      foodType,
      foodName,
      foodDescription,
      quantity,
      quantityUnit: quantityUnit || 'servings',
      preparedOn: prepDate,
      expiryDate: expDate,
      foodImage: foodImage || null,
      notes: notes || ''
    });

    await donation.save();

    // Update donor stats
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 'donorStats.totalDonations': 1 },
      $set: { 'donorStats.lastDonationDate': new Date() }
    });

    res.status(201).json({
      success: true,
      message: 'Donation created successfully',
      donation
    });
  } catch (error) {
    console.error('Create donation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while creating donation',
      error: error.message 
    });
  }
});

// @route   GET /api/donations
// @desc    Get all donations (filtered by role)
// @access  Private
router.get('/', authenticateUser, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const userId = req.user._id;
    const userRole = req.user.role;

    let query = {};

    // Filter based on role
    if (userRole === 'donor') {
      query.donor = userId;
    } else if (userRole === 'volunteer') {
      if (status === 'assigned') {
        query['assignedTo.volunteer'] = userId;
      } else {
        query.status = 'available';
      }
    } else if (userRole === 'receiver') {
      if (status === 'assigned' || status === 'delivered') {
        query['assignedTo.receiver'] = userId;
      } else {
        query.status = 'available';
      }
    }

    // Add status filter if provided
    if (status && userRole === 'donor') {
      query.status = status;
    }

    const donations = await Donation.find(query)
      .populate('donor', 'name email phone')
      .populate('assignedTo.volunteer', 'name phone')
      .populate('assignedTo.receiver', 'name phone location')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Donation.countDocuments(query);

    res.json({
      success: true,
      donations,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Get donations error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching donations',
      error: error.message 
    });
  }
});

// @route   GET /api/donations/:id
// @desc    Get single donation by ID
// @access  Private
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate('donor', 'name email phone location')
      .populate('assignedTo.volunteer', 'name phone')
      .populate('assignedTo.receiver', 'name phone location');

    if (!donation) {
      return res.status(404).json({ 
        success: false, 
        message: 'Donation not found' 
      });
    }

    // Check if user has permission to view this donation
    const userId = req.user._id.toString();
    const userRole = req.user.role;
    
    if (
      userRole === 'donor' && donation.donor._id.toString() !== userId ||
      userRole === 'volunteer' && donation.assignedTo.volunteer?._id.toString() !== userId && donation.status !== 'available' ||
      userRole === 'receiver' && donation.assignedTo.receiver?._id.toString() !== userId && donation.status !== 'available'
    ) {
      return res.status(403).json({ 
        success: false, 
        message: 'You do not have permission to view this donation' 
      });
    }

    res.json({
      success: true,
      donation
    });
  } catch (error) {
    console.error('Get donation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching donation',
      error: error.message 
    });
  }
});

// @route   PUT /api/donations/:id
// @desc    Update donation
// @access  Private (Donor only - own donations)
router.put('/:id', authenticateUser, checkRole(['donor']), async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({ 
        success: false, 
        message: 'Donation not found' 
      });
    }

    // Check if user owns this donation
    if (donation.donor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'You can only update your own donations' 
      });
    }

    // Don't allow updates if donation is already assigned or picked up
    if (['assigned', 'picked-up', 'delivered'].includes(donation.status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot update donation that is already in progress' 
      });
    }

    const allowedUpdates = [
      'donorName', 'donorPhone', 'donorLocation', 'foodType', 
      'foodName', 'foodDescription', 'quantity', 'quantityUnit',
      'preparedOn', 'expiryDate', 'foodImage', 'notes'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        donation[field] = req.body[field];
      }
    });

    await donation.save();

    res.json({
      success: true,
      message: 'Donation updated successfully',
      donation
    });
  } catch (error) {
    console.error('Update donation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while updating donation',
      error: error.message 
    });
  }
});

// @route   DELETE /api/donations/:id
// @desc    Delete/Cancel donation
// @access  Private (Donor only - own donations)
router.delete('/:id', authenticateUser, checkRole(['donor']), async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({ 
        success: false, 
        message: 'Donation not found' 
      });
    }

    // Check if user owns this donation
    if (donation.donor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'You can only delete your own donations' 
      });
    }

    // If donation is in progress, cancel it instead of deleting
    if (['assigned', 'picked-up'].includes(donation.status)) {
      donation.status = 'cancelled';
      await donation.save();
      
      return res.json({
        success: true,
        message: 'Donation cancelled successfully'
      });
    }

    await donation.deleteOne();

    // Update donor stats
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 'donorStats.totalDonations': -1 }
    });

    res.json({
      success: true,
      message: 'Donation deleted successfully'
    });
  } catch (error) {
    console.error('Delete donation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while deleting donation',
      error: error.message 
    });
  }
});

// @route   POST /api/donations/:id/verify-pickup
// @desc    Volunteer verifies food quality at pickup with real-time verification
// @access  Private (Volunteer only)
router.post('/:id/verify-pickup', authenticateUser, checkRole(['volunteer']), async (req, res) => {
  try {
    const {
      cookingTime,
      temperatureRange,
      smellAppearance,
      packagingCondition,
      photos,
      status,
      consumeWithinHours,
      rejectionReason,
      notes,
      gpsLocation,
      timestamp
    } = req.body;

    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }

    // Check if volunteer is assigned
    if (donation.assignedTo.volunteer?.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not assigned to this delivery'
      });
    }

    // Update donation with verification data
    donation.verification = {
      verifiedBy: req.user._id,
      cookingTime: new Date(cookingTime),
      temperatureRange,
      smellAppearance,
      packagingCondition,
      photos,
      verificationStatus: status,
      consumeWithinHours: status === 'consume-soon' ? consumeWithinHours : null,
      rejectionReason: status === 'rejected' ? rejectionReason : null,
      notes,
      gpsLocation: {
        type: 'Point',
        coordinates: [gpsLocation.lng, gpsLocation.lat]
      },
      verifiedAt: timestamp || new Date()
    };

    // Update donation status based on verification
    if (status === 'rejected') {
      donation.status = 'rejected';
    } else {
      donation.status = 'picked-up';
      donation.pickupTime = new Date();
    }

    await donation.save();

    res.json({
      success: true,
      message: 'Verification completed successfully',
      donation
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during verification',
      error: error.message
    });
  }
});

export default router;
