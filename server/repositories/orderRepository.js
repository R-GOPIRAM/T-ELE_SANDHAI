const Order = require('../models/Order');

class OrderRepository {
    async create(data) {
        return await Order.create(data);
    }

    async findById(id) {
        return await Order.findById(id)
            .populate('user', 'name email')
            .populate('items.product', 'name images')
            .populate('items.seller', 'name email address')
            .lean();
    }

    async findByUser(userId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [orders, total] = await Promise.all([
            Order.find({ user: userId })
                .sort('-createdAt')
                .skip(skip)
                .limit(limit)
                .lean(),
            Order.countDocuments({ user: userId })
        ]);

        return { orders, total };
    }

    async findBySeller(sellerId, page = 1, limit = 10) {
        // Advanced query to find orders containing items from this seller
        const skip = (page - 1) * limit;
        const [orders, total] = await Promise.all([
            Order.find({ 'items.seller': sellerId })
                .sort('-createdAt')
                .skip(skip)
                .limit(limit)
                .lean(),
            Order.countDocuments({ 'items.seller': sellerId })
        ]);

        return { orders, total };
    }

    async updateStatus(id, status) {
        const update = { orderStatus: status };
        if (status === 'Delivered') update.deliveredAt = Date.now();
        if (status === 'Shipped') update.shippedAt = Date.now();
        if (status === 'Cancelled') update.cancelledAt = Date.now();

        return await Order.findByIdAndUpdate(id, update, { new: true });
    }

    async findAll(page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [orders, total] = await Promise.all([
            Order.find()
                .populate('user', 'name email')
                .skip(skip)
                .limit(limit)
                .sort('-createdAt')
                .lean(),
            Order.countDocuments()
        ]);
        return { orders, total };
    }
    async findByRazorpayOrderId(razorpayOrderId) {
        return await Order.findOne({ 'paymentInfo.razorpayOrderId': razorpayOrderId })
            .populate('user', 'name email')
            .lean();
    }

    async updatePayment(id, paymentData) {
        return await Order.findByIdAndUpdate(
            id,
            { $set: { paymentInfo: paymentData } },
            { new: true }
        );
    }
}

module.exports = new OrderRepository();
