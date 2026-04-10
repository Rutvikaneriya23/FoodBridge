import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: false, // Made optional for Google OAuth users
    unique: true,
    sparse: true, // Allows multiple null values
    trim: true,
    match: [/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, 'Please enter a valid phone number']
  },
  password: {
    type: String,
    required: false, // Made optional for Google OAuth users
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true // Allows null values without uniqueness constraint
  },
  profilePic: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ['donor', 'receiver', 'volunteer', null],
    default: null
  },
  location: {
    type: String,
    required: false, // Made optional for Google OAuth users (can be filled later)
    trim: true
  },
  profileImage: {
    type: String,
    default: null
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isSuspended: {
    type: Boolean,
    default: false
  },
  profileComplete: {
    type: Boolean,
    default: false
  },
  // Role-specific data
  donorStats: {
    totalDonations: { type: Number, default: 0 },
    totalMealsProvided: { type: Number, default: 0 },
    lastDonationDate: Date
  },
  receiverStats: {
    totalRequests: { type: Number, default: 0 },
    totalMealsReceived: { type: Number, default: 0 },
    lastRequestDate: Date
  },
  volunteerStats: {
    totalDeliveries: { type: Number, default: 0 },
    completedDeliveries: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    lastDeliveryDate: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Update last login
userSchema.methods.updateLastLogin = async function() {
  this.lastLogin = new Date();
  return await this.save();
};

// Check if profile is complete
userSchema.methods.checkProfileComplete = function() {
  // For Google users, phone is optional. For regular users, all fields required.
  if (this.googleId) {
    this.profileComplete = !!(this.name && this.email && this.location && this.role);
  } else {
    this.profileComplete = !!(this.name && this.email && this.phone && this.location && this.role);
  }
  return this.profileComplete;
};

const User = mongoose.model('User', userSchema);

export default User;
