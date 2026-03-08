const Bargain = require('../models/Bargain');

class BargainRepository {
    async create(data) {
        return await Bargain.create(data);
    }

    async findById(id) {
        return await Bargain.findById(id)
            .populate('productId', 'name images price')
            .populate('customerId', 'name email')
            .populate('sellerId', 'name')
            .lean();
    }

    async findActiveBargain(productId, customerId) {
        return await Bargain.findOne({
            productId,
            customerId,
            status: { $in: ['pending', 'countered'] }
        }).lean();
    }

    async findBySeller(sellerId, filter = {}, page = 1, limit = 15) {
        const skip = (page - 1) * limit;
        const [bargains, total] = await Promise.all([
            Bargain.find({ sellerId, ...filter })
                .sort({ updatedAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('productId', 'name images')
                .populate('customerId', 'name')
                .lean(),
            Bargain.countDocuments({ sellerId, ...filter })
        ]);

        return { bargains, total };
    }

    async findByCustomer(customerId, filter = {}, page = 1, limit = 15) {
        const skip = (page - 1) * limit;
        const [bargains, total] = await Promise.all([
            Bargain.find({ customerId, ...filter })
                .sort({ updatedAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('productId', 'name images sellerName')
                .lean(),
            Bargain.countDocuments({ customerId, ...filter })
        ]);

        return { bargains, total };
    }

    async updateStatus(id, status, finalPrice = null) {
        const update = { status };
        if (finalPrice !== null) {
            update.finalPrice = finalPrice;
        }
        return await Bargain.findByIdAndUpdate(id, update, { new: true });
    }

    async addMessage(id, messageData) {
        return await Bargain.findByIdAndUpdate(
            id,
            {
                $push: { chatMessages: messageData },
                $set: {
                    // Update offeredPrice at top level if message has price
                    ...(messageData.offeredPrice ? { offeredPrice: messageData.offeredPrice } : {}),
                    // Map status based on sender? handled in service.
                }
            },
            { new: true }
        );
    }

    async aggregateAnalytics(matchStage) {
        return await Bargain.aggregate(matchStage);
    }
}

module.exports = new BargainRepository();
