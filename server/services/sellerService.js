const SellerRepository = require('../repositories/sellerRepository');
const AppError = require('../utils/AppError');
const User = require('../models/User');
const StockAlert = require('../models/StockAlert');

class SellerService {
    // ... existing methods ...

    async getStockAlerts(sellerId) {
        return await StockAlert.find({ sellerId, isRead: false }).sort('-createdAt');
    }

    async markStockAlertRead(sellerId, alertId) {
        const alert = await StockAlert.findOneAndUpdate(
            { _id: alertId, sellerId },
            { isRead: true },
            { new: true }
        );
        if (!alert) {
            throw new AppError('Alert not found', 404);
        }
        return alert;
    }

    async getAllSellers() {
        return await SellerRepository.findAll();
    }

    async getSellerByUserId(userId) {
        return await SellerRepository.findByUserId(userId);
    }

    async getSellerById(id) {
        return await SellerRepository.findById(id);
    }

    async createSeller(data) {
        // Create the seller profile
        const seller = await SellerRepository.create(data);

        // Update user role to seller contextually inside the Service
        await User.findByIdAndUpdate(data.userId, { role: 'seller' });

        return seller;
    }

    async updateSeller(id, data) {
        return await SellerRepository.update(id, data);
    }

    async verifySeller(id, status, reason) {
        const seller = await SellerRepository.findById(id);
        if (!seller) {
            throw new AppError('Seller not found', 404);
        }

        if (!['approved', 'rejected'].includes(status)) {
            throw new AppError('Invalid verification status', 400);
        }

        return await SellerRepository.updateVerificationStatus(id, status, reason);
    }

    async getNearbyStores(lat, lng, radius = 50) {
        const sellers = await SellerRepository.findNearby(lat, lng, radius);
        const { calculateDistance } = require('../utils/distanceCalculator');

        return sellers.map(seller => ({
            ...seller,
            distance: calculateDistance(lat, lng, seller.latitude, seller.longitude)
        })).sort((a, b) => (a.distance || 0) - (b.distance || 0));
    }
}

module.exports = new SellerService();
