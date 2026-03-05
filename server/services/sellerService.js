const SellerRepository = require('../repositories/sellerRepository');
const AppError = require('../utils/AppError');
const User = require('../models/User');

class SellerService {
    async getAllSellers() {
        return await SellerRepository.findAll();
    }

    async getSellerByUserId(userId) {
        return await SellerRepository.findByUserId(userId);
    }

    async createSeller(data) {
        // Create the seller profile
        const seller = await SellerRepository.create(data);

        // Update user role to seller contextually inside the Service
        await User.findByIdAndUpdate(data.userId, { role: 'seller' });

        return seller;
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
}

module.exports = new SellerService();
