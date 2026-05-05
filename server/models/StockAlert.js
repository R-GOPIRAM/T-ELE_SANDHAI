const mongoose = require('mongoose');

const stockAlertSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    productName: String,
    currentStock: {
        type: Number,
        required: true
    },
    threshold: {
        type: Number,
        default: 5
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Index for quick lookup of unread alerts per seller
stockAlertSchema.index({ sellerId: 1, isRead: 1 });

module.exports = mongoose.model('StockAlert', stockAlertSchema);
