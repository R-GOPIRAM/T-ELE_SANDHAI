const Review = require('../models/Review');

class ReviewRepository {
    async findByProductAndUser(productId, customerId) {
        return await Review.findOne({ productId, customerId }).lean();
    }

    async create(data) {
        return await Review.create(data);
    }

    async findApprovedByProduct(productId, page = 1, limit = 10, sortObj) {
        const skip = (page - 1) * limit;
        const reviews = await Review.find({ productId, isApproved: true })
            .populate('customerId', 'name')
            .sort(sortObj)
            .limit(limit * 1)
            .skip(skip)
            .lean();

        const total = await Review.countDocuments({ productId, isApproved: true });
        return { reviews, total };
    }

    async getRatingDistribution(productId) {
        return await Review.aggregate([
            { $match: { productId, isApproved: true } },
            { $group: { _id: '$rating', count: { $sum: 1 } } },
            { $sort: { _id: -1 } }
        ]);
    }

    async findByUser(customerId) {
        return await Review.find({ customerId })
            .populate('productId', 'name images')
            .sort({ createdAt: -1 })
            .lean();
    }

    async findById(id) {
        return await Review.findById(id);
    }
}

module.exports = new ReviewRepository();
