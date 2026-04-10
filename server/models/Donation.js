import mongoose from 'mongoose';

const donationSchema = new mongoose.Schema({
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  donorName: {
    type: String,
    required: [true, 'Donor name is required'],
    trim: true
  },
  donorPhone: {
    type: String,
    required: [true, 'Contact number is required'],
    trim: true
  },
  donorLocation: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  foodType: {
    type: String,
    required: [true, 'Food type is required'],
    enum: ['Cooked Food', 'Raw Food', 'Packaged Food', 'Baked Goods', 'Fruits & Vegetables', 'Other'],
    trim: true
  },
  foodName: {
    type: String,
    required: [true, 'Food name is required'],
    trim: true
  },
  foodDescription: {
    type: String,
    required: [true, 'Food description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  quantity: {
    type: String,
    required: [true, 'Quantity is required'],
    trim: true
  },
  quantityUnit: {
    type: String,
    required: [true, 'Quantity unit is required'],
    enum: ['kg', 'servings', 'plates', 'pieces', 'packets', 'liters'],
    default: 'servings'
  },
  preparedOn: {
    type: Date,
    required: [true, 'Preparation date is required']
  },
  expiryDate: {
    type: Date,
    required: [true, 'Expiry date is required']
  },
  foodImage: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['available', 'claimed', 'assigned', 'verified', 'picked-up', 'in-transit', 'delivered', 'cancelled', 'ASSIGNED', 'PICKED_UP', 'ON_THE_WAY', 'DELIVERED'],
    default: 'available'
  },
  assignedTo: {
    volunteer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  qualityVerification: {
    verified: { type: Boolean, default: false },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    verifiedAt: { type: Date, default: null },
    qualityRating: { type: Number, min: 1, max: 5, default: null },
    verificationNotes: { type: String, default: '' }
  },
  // Real-time digital verification (FoodBridge verification system)
  verification: {
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    cookingTime: { type: Date, default: null },
    temperatureRange: { 
      type: String, 
      enum: ['hot', 'warm', 'room', 'cold', ''], 
      default: '' 
    },
    smellAppearance: { 
      type: String, 
      enum: ['excellent', 'good', 'acceptable', 'poor', ''], 
      default: '' 
    },
    packagingCondition: { 
      type: String, 
      enum: ['sealed', 'intact', 'minor-damage', 'damaged', ''], 
      default: '' 
    },
    photos: [{ type: String }],
    verificationStatus: { 
      type: String, 
      enum: ['safe', 'consume-soon', 'rejected', ''], 
      default: '' 
    },
    consumeWithinHours: { type: Number, default: null },
    rejectionReason: { type: String, default: '' },
    notes: { type: String, default: '' },
    gpsLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        default: [0, 0]
      }
    },
    verifiedAt: { type: Date, default: null }
  },
  // Live tracking fields
  donorCoordinates: {
    lat: { type: Number, default: null },
    lng: { type: Number, default: null }
  },
  receiverCoordinates: {
    lat: { type: Number, default: null },
    lng: { type: Number, default: null }
  },
  firebaseDeliveryId: {
    type: String,
    default: null
  },
  tracking: {
    currentLocation: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
      address: { type: String, default: '' }
    },
    lastUpdated: { type: Date, default: null }
  },
  pickupTime: {
    type: Date,
    default: null
  },
  deliveryTime: {
    type: Date,
    default: null
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [300, 'Notes cannot exceed 300 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
donationSchema.index({ donor: 1, status: 1 });
donationSchema.index({ status: 1, createdAt: -1 });
donationSchema.index({ 'assignedTo.volunteer': 1 });
donationSchema.index({ 'assignedTo.receiver': 1 });

// Virtual for checking if donation is expired
donationSchema.virtual('isExpired').get(function() {
  return new Date() > this.expiryDate;
});

const Donation = mongoose.model('Donation', donationSchema);

export default Donation;
