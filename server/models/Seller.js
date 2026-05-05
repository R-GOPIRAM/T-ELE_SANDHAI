const mongoose = require('mongoose');

const sellerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  businessName: {
    type: String,
    required: true
  },
  businessAddress: {
    type: String,
    required: true
  },
  pincode: String,
  latitude: Number,
  longitude: Number,
  pickupLocationName: String,
  businessPhone: {
    type: String,
    required: true
  },
  gstin: String,
  panNumber: {
    type: String,
    required: true
  },
  laborDeptCert: String,
  businessCategory: String,
  businessDescription: String,
  yearsInBusiness: Number,
  rating: {
    type: Number,
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  openHours: {
    open: { type: String, default: '09:00' },
    close: { type: String, default: '21:00' }
  },
  sellerStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  documents: {
    aadhaar: String,
    pan: String,
    gstin: String,
    laborCert: String,
    businessLicense: String
  },
  bankDetails: {
    accountNumber: String,
    ifscCode: String
  },
  approvedAt: Date,
  rejectedAt: Date,
  rejectionReason: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for primary lookup by userId (one seller profile per user)
sellerSchema.index({ userId: 1 }, { unique: true });

module.exports = mongoose.model('Seller', sellerSchema);