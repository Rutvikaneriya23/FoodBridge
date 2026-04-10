import express from 'express';
import Donation from '../models/Donation.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { authenticateUser } from '../middleware/auth.js';
import { checkRole } from '../middleware/roleCheck.js';

const router = express.Router();

// @route   POST /api/donations/:id/claim
// @desc    Receiver claims a donation
// @access  Private (Receiver only)
router.post('/:id/claim', authenticateUser, checkRole(['receiver']), async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id).populate('donor');

    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }

    if (donation.status !== 'available') {
      return res.status(400).json({ success: false, message: 'This donation is no longer available' });
    }

    // Assign receiver
    donation.status = 'claimed';
    donation.assignedTo.receiver = req.user._id;
    await donation.save();

    // Create notification for donor
    await Notification.create({
      recipient: donation.donor._id,
      sender: req.user._id,
      type: 'donation_claimed',
      title: 'Your Donation was Claimed!',
      message: `${req.user.name} has claimed your donation "${donation.foodName}". A volunteer will be assigned soon.`,
      relatedDonation: donation._id
    });

    // Update receiver stats
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 'receiverStats.totalRequests': 1 },
      $set: { 'receiverStats.lastRequestDate': new Date() }
    });

    res.json({
      success: true,
      message: 'Food claimed successfully! A volunteer will be assigned soon.',
      donation
    });
  } catch (error) {
    console.error('Claim donation error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// @route   POST /api/donations/:id/accept-volunteer
// @desc    Volunteer accepts a delivery
// @access  Private (Volunteer only)
router.post('/:id/accept-volunteer', authenticateUser, checkRole(['volunteer']), async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate('donor')
      .populate('assignedTo.receiver');

    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }

    if (donation.status !== 'claimed') {
      return res.status(400).json({ success: false, message: 'This donation cannot be accepted' });
    }

    // Assign volunteer
    donation.status = 'assigned';
    donation.assignedTo.volunteer = req.user._id;
    await donation.save();

    // Notify donor
    await Notification.create({
      recipient: donation.donor._id,
      type: 'volunteer_assigned',
      title: 'Volunteer Assigned',
      message: `${req.user.name} will pick up and deliver your donation.`,
      relatedDonation: donation._id
    });

    // Notify receiver
    await Notification.create({
      recipient: donation.assignedTo.receiver._id,
      type: 'volunteer_assigned',
      title: 'Volunteer Assigned',
      message: `${req.user.name} will deliver your food.`,
      relatedDonation: donation._id
    });

    res.json({
      success: true,
      message: 'Delivery accepted!',
      donation
    });
  } catch (error) {
    console.error('Accept volunteer error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// @route   POST /api/donations/:id/verify-quality
// @desc    Volunteer verifies food quality
// @access  Private (Volunteer only)
router.post('/:id/verify-quality', authenticateUser, checkRole(['volunteer']), async (req, res) => {
  try {
    const { qualityRating, verificationNotes } = req.body;
    const donation = await Donation.findById(req.params.id)
      .populate('donor')
      .populate('assignedTo.receiver');

    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }

    if (donation.assignedTo.volunteer?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You are not assigned to this donation' });
    }

    donation.qualityVerification = {
      verified: true,
      verifiedBy: req.user._id,
      verifiedAt: new Date(),
      qualityRating: qualityRating || 5,
      verificationNotes: verificationNotes || ''
    };
    donation.status = 'verified';
    await donation.save();

    // Notify receiver
    await Notification.create({
      recipient: donation.assignedTo.receiver._id,
      type: 'food_verified',
      title: 'Food Quality Verified',
      message: `Your food has been verified with ${qualityRating}/5 rating.`,
      relatedDonation: donation._id
    });

    res.json({
      success: true,
      message: 'Food quality verified!',
      donation
    });
  } catch (error) {
    console.error('Verify quality error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// @route   POST /api/donations/:id/update-status
// @desc    Update donation status (pickup, transit, delivered)
// @access  Private (Volunteer only)
router.post('/:id/update-status', authenticateUser, checkRole(['volunteer']), async (req, res) => {
  try {
    const { status, location } = req.body;
    const donation = await Donation.findById(req.params.id)
      .populate('donor')
      .populate('assignedTo.receiver');

    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }

    if (donation.assignedTo.volunteer?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You are not assigned to this donation' });
    }

    donation.status = status;

    if (status === 'picked-up') {
      donation.pickupTime = new Date();
    } else if (status === 'delivered') {
      donation.deliveryTime = new Date();
      await User.findByIdAndUpdate(donation.assignedTo.receiver, {
        $inc: { 'receiverStats.totalMealsReceived': 1 }
      });
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { 'volunteerStats.completedDeliveries': 1 }
      });
    }

    if (location) {
      donation.tracking = {
        currentLocation: location,
        lastUpdated: new Date()
      };
    }

    await donation.save();

    // Create notifications
    const statusMessages = {
      'picked-up': 'Volunteer has picked up the food',
      'in-transit': 'Food is on the way to you',
      'delivered': 'Food has been delivered successfully'
    };

    if (statusMessages[status]) {
      await Notification.create({
        recipient: donation.assignedTo.receiver._id,
        type: status === 'delivered' ? 'delivered' : 'in_transit',
        title: 'Delivery Update',
        message: statusMessages[status],
        relatedDonation: donation._id
      });
    }

    res.json({
      success: true,
      message: 'Status updated!',
      donation
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// @route   GET /api/donations/available-for-volunteers
// @desc    Get donations that need volunteers (claimed status)
// @access  Private (Volunteer only)
router.get('/available-for-volunteers', authenticateUser, checkRole(['volunteer']), async (req, res) => {
  try {
    const donations = await Donation.find({ status: 'claimed' })
      .populate('donor', 'name phone location')
      .populate('assignedTo.receiver', 'name phone location')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      donations
    });
  } catch (error) {
    console.error('Get available donations error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

export default router;
