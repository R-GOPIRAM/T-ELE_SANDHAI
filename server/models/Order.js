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
      phone: { type: String, required: true },
      latitude: Number,
      longitude: Number
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
      paymentStatus: {
        type: String,
        enum: ['Pending', 'Paid', 'Refunded'],
        default: 'Pending'
      },
      paymentReceived: { type: Boolean, default: false },
      paymentDate: Date,
      transactionId: String,
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
    shipments: [{
      sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      storeName: String,
      pickupLocation: String,
      distanceFromCustomer: Number,
      courierName: String,
      courierId: String,
      estimatedDeliveryDays: String,
      shippingCost: Number,
      shipmentId: String,
      awb: String,
      pickupDate: Date,
      trackingUrl: String,
      status: {
        type: String,
        enum: ['Pending', 'Pickup Scheduled', 'Shipped', 'Out for Delivery', 'Delivered', 'Returned', 'Cancelled'],
        default: 'Pending'
      }
    }],
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
orderSchema.index({ 'items.seller': 1, 'paymentInfo.status': 1, createdAt: -1 }); // Compound for analytics
orderSchema.index({ 'shipments.status': 1, 'shipments.awb': 1 }); // For sync job
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);