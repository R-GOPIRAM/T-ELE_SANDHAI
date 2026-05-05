const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
    // Made optional so we can add reviews without strict order binding for demo/testing
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    required: true
  },
  comment: {
    type: String,
    required: true
  },
  images: [String],
  isVerifiedPurchase: {
    type: Boolean,
    default: true
  },
  helpfulVotes: {
    type: Number,
    default: 0
  },
  isApproved: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Ensure one review per customer per product
reviewSchema.index({ productId: 1, customerId: 1 }, { unique: true });

// Static method to calculate average rating
reviewSchema.statics.calcAverageRatings = async function (productId) {
  const stats = await this.aggregate([
    {
      $match: { productId: productId }
    },
    {
      $group: {
        _id: '$productId',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);

  if (stats.length > 0) {
    await mongoose.model('Product').findByIdAndUpdate(productId, {
      reviewCount: stats[0].nRating,
      rating: Math.round(stats[0].avgRating * 10) / 10 // Round to 1 decimal place
    });
  } else {
    await mongoose.model('Product').findByIdAndUpdate(productId, {
      reviewCount: 0,
      rating: 0
    });
  }
};

// Call calcAverageRatings after save
reviewSchema.post('save', function () {
  this.constructor.calcAverageRatings(this.productId);
});

// Call calcAverageRatings after update/delete
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne().clone();
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  if (this.r) {
    await this.r.constructor.calcAverageRatings(this.r.productId);
  }
});

module.exports = mongoose.model('Review', reviewSchema);