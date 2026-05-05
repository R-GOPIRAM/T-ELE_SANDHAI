const Seller = require('../models/Seller');

class SellerRepository {
    async findAll() {
        return await Seller.find().populate('userId', 'name email');
    }

    async findById(id) {
        return await Seller.findById(id).populate('userId', 'name email');
    }

    async findByUserId(userId) {
        return await Seller.findOne({ userId }).populate('userId', 'name email');
    }

    async create(sellerData) {
        return await Seller.create(sellerData);
    }

    async update(id, sellerData) {
        return await Seller.findByIdAndUpdate(id, sellerData, { new: true, runValidators: true });
    }

    async updateVerificationStatus(id, status, reason = null) {
        const update = {
            sellerStatus: status,
            [(status === 'approved' ? 'approvedAt' : 'rejectedAt')]: new Date()
        };

        if (reason) {
            update.rejectionReason = reason;
        }

        return await Seller.findByIdAndUpdate(id, update, { new: true });
    }

    async findNearby(lat, lng, radiusKm = 50) {
        // Approximate degrees for the given radius
        // 1 degree latitude is approx 111km
        const latDelta = radiusKm / 111;
        const lngDelta = radiusKm / (111 * Math.cos(lat * Math.PI / 180));

        return await Seller.find({
            latitude: { $gte: lat - latDelta, $lte: lat + latDelta },
            longitude: { $gte: lng - lngDelta, $lte: lng + lngDelta },
            sellerStatus: 'approved'
        }).populate('userId', 'name email').lean();
    }
}

module.exports = new SellerRepository();
