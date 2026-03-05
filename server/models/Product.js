const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      minlength: [2, 'Product name must be at least 2 characters']
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative']
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      minlength: [10, 'Description must be at least 10 characters']
    },
    images: {
      type: [String],
      default: []
    },
    shopOwnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Shop owner ID is required']
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, 'Stock cannot be negative']
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
    brand: {
      type: String,
      trim: true
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
      set: val => Math.round(val * 10) / 10 // Round to 1 decimal place
    },
    reviewCount: {
      type: Number,
      default: 0
    },
    soldCount: {
      type: Number,
      default: 0
    },
    features: {
      type: [String],
      default: []
    },
    specifications: {
      type: Map,
      of: String,
      default: {}
    },
    warranty: {
      type: String,
      default: 'No warranty'
    },
    returnPolicy: {
      type: String,
      default: 'No returns'
    },
    originalPrice: {
      type: Number,
      min: [0, 'Original price cannot be negative']
    },
    deliveryTime: {
      type: String,
      default: '3-5 business days'
    }
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes
productSchema.index({ name: 'text', category: 'text', description: 'text', brand: 'text' });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ shopOwnerId: 1 });
productSchema.index({ isAvailable: 1 });

module.exports = mongoose.model('Product', productSchema);
