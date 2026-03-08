const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, 'Product ID is required']
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity is required'],
        min: [1, 'Quantity must be at least 1'],
        default: 1
    },
    price: {
        type: Number,
        required: [true, 'Price is required']
    },
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { _id: false });

const cartSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required'],
            unique: true
        },
        items: [cartItemSchema]
    },
    {
        timestamps: true,
        versionKey: false
    }
);

// Virtual for total items
cartSchema.virtual('totalItems').get(function () {
    return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Virtual for total price
cartSchema.virtual('totalPrice').get(function () {
    return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
});

cartSchema.set('toJSON', { virtuals: true });
cartSchema.set('toObject', { virtuals: true });

// Indexes
cartSchema.index({ userId: 1 });

module.exports = mongoose.model('Cart', cartSchema);
