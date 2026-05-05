const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    senderRole: {
        type: String,
        enum: ['customer', 'seller'],
        required: true
    },
    message: {
        type: String,
        required: true,
        // Note: We will encrypt this before saving in the service layer
        // or utilizing a pre-save hook if we want to enforce it at model level.
        // For transparent usage, better to handle in Service.
    },
    offeredPrice: {
        type: Number
    },
    isRead: {
        type: Boolean,
        default: false
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const bargainSchema = new mongoose.Schema(
    {
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
        sellerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // Seller is also a User
            required: true
        },
        originalPrice: {
            type: Number,
            required: true
        },
        offeredPrice: {
            type: Number,
            required: true
        },
        finalPrice: {
            type: Number
        },
        status: {
            type: String,
            enum: ['pending', 'countered', 'accepted', 'rejected', 'expired'],
            default: 'pending'
        },
        chatMessages: [chatMessageSchema],
        expiresAt: {
            type: Date,
            required: true,
            default: () => new Date(+new Date() + 24 * 60 * 60 * 1000) // 24 hours from now
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

// Indexes for faster queries
bargainSchema.index({ sellerId: 1, status: 1 });
bargainSchema.index({ customerId: 1, status: 1 });
bargainSchema.index({ productId: 1, customerId: 1 }, { unique: true, partialFilterExpression: { status: { $in: ['pending', 'countered'] } } }); // Prevent duplicate active negotiations
bargainSchema.index({ status: 1 });
bargainSchema.index({ createdAt: -1 });
// Critical analytical indices
bargainSchema.index({ sellerId: 1, updatedAt: -1 });
bargainSchema.index({ customerId: 1, updatedAt: -1 });

module.exports = mongoose.model('Bargain', bargainSchema);
