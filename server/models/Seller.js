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

module.exports = mongoose.model('Seller', sellerSchema);