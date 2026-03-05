const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true,
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true
        },
        name: String,
        price: Number,
        quantity: {
          type: Number,
          required: true,
          min: 1
        },
        image: String,
        seller: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true
        }
      }
    ],
    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      country: { type: String, required: true },
      phone: { type: String, required: true }
    },
    paymentInfo: {
      razorpayOrderId: { type: String },
      razorpayPaymentId: { type: String },
      razorpaySignature: { type: String },
      status: {
        type: String,
        enum: ['pending', 'captured', 'failed', 'refunded'],
        default: 'pending'
      },
      method: {
        type: String,
        enum: ['card', 'upi', 'cod', 'netbanking', 'wallet'],
        default: 'card'
      }
    },
    totalAmount: {
      type: Number,
      required: true
    },
    orderStatus: {
      type: String,
      enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Processing'
    },
    deliveredAt: Date,
    shippedAt: Date,
    cancelledAt: Date
  },
  {
    timestamps: true,
    versionKey: false
  }
);
// Indexes for production analytics capability
orderSchema.index({ user: 1 });
orderSchema.index({ 'items.seller': 1 }); // Essential for seller analytics aggregations
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);