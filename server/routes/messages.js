import express from 'express';
import Message from '../models/Message.js';
import Donation from '../models/Donation.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/messages/donation/:donationId
// @desc    Get all messages for a donation
// @access  Private
router.get('/donation/:donationId', authenticateUser, async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.donationId);

    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }

    // Check if user is involved in this donation
    const isInvolved =
      donation.donor.toString() === req.user._id.toString() ||
      donation.assignedTo.receiver?.toString() === req.user._id.toString() ||
      donation.assignedTo.volunteer?.toString() === req.user._id.toString();

    if (!isInvolved) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const messages = await Message.find({ donation: req.params.donationId })
      .populate('sender', 'name')
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      messages
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// @route   POST /api/messages
// @desc    Send a message
// @access  Private
router.post('/', authenticateUser, async (req, res) => {
  try {
    const { donationId, message } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Message cannot be empty' });
    }

    const donation = await Donation.findById(donationId);

    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }

    // Check if user is involved
    const isInvolved =
      donation.donor.toString() === req.user._id.toString() ||
      donation.assignedTo.receiver?.toString() === req.user._id.toString() ||
      donation.assignedTo.volunteer?.toString() === req.user._id.toString();

    if (!isInvolved) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Determine sender role
    let senderRole = 'donor';
    if (donation.assignedTo.receiver?.toString() === req.user._id.toString()) {
      senderRole = 'receiver';
    } else if (donation.assignedTo.volunteer?.toString() === req.user._id.toString()) {
      senderRole = 'volunteer';
    }

    const newMessage = await Message.create({
      donation: donationId,
      sender: req.user._id,
      senderRole,
      message: message.trim()
    });

    await newMessage.populate('sender', 'name');

    res.json({
      success: true,
      message: newMessage
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

export default router;
