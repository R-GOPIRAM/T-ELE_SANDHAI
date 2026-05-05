const mongoose = require('mongoose');
const bargainRepository = require('../repositories/bargainRepository');
const productRepository = require('../repositories/productRepository');
const AppError = require('../utils/AppError');
const { encrypt, decrypt } = require('../utils/encryption');

class BargainService {
    async initiateBargain(customerId, { productId, offeredPrice, message }) {
        // 1. Check active bargain
        const existing = await bargainRepository.findActiveBargain(productId, customerId);
        if (existing) {
            throw new AppError('You already have an active negotiation for this product', 400);
        }

        // 2. Validate Product
        const product = await productRepository.findById(productId);
        if (!product) {
            throw new AppError('Product not found', 404);
        }

        if (offeredPrice >= product.price) {
            throw new AppError('Offer must be less than original price', 400);
        }

        // 3. Minimum Price Check (70% rule - configurable)
        const minPrice = product.price * 0.7;
        if (offeredPrice < minPrice) {
            throw new AppError(`Offer too low. Minimum allowed is ₹${Math.ceil(minPrice)}`, 400);
        }

        // 4. Create Bargain
        const initialMessage = {
            senderId: customerId,
            senderRole: 'customer',
            message: message ? encrypt(message) : encrypt(`Started negotiation at ₹${offeredPrice}`),
            offeredPrice,
            timestamp: new Date()
        };

        const bargain = await bargainRepository.create({
            productId,
            customerId,
            sellerId: product.seller || product.sellerId || product.shopOwnerId, // Handle schema variations
            originalPrice: product.price,
            offeredPrice,
            status: 'pending', // 'pending' means waiting for seller response
            chatMessages: [initialMessage]
        });

        return bargain;
    }

    async addMessage(userId, userRole, { bargainId, message, offeredPrice }) {
        const bargain = await bargainRepository.findById(bargainId);
        if (!bargain) throw new AppError('Negotiation not found', 404);

        if (['accepted', 'rejected', 'completed', 'expired'].includes(bargain.status)) {
            throw new AppError(`Negotiation is ${bargain.status}`, 400);
        }

        // Check Authorization
        if (userRole === 'customer' && bargain.customerId.toString() !== userId) {
            throw new AppError('Not authorized', 403);
        }
        if (userRole === 'seller' && bargain.sellerId.toString() !== userId && bargain.sellerId.toString() !== userId.toString()) { // Handle potential ObjectId mismatch
            throw new AppError('Not authorized', 403);
        }

        // Encrypt message
        const encryptedMessage = encrypt(message);

        // Determine New Status
        let newStatus = bargain.status;

        // State Machine for Counter Offers
        if (offeredPrice && offeredPrice !== bargain.offeredPrice) {
            if (userRole === 'seller') {
                newStatus = 'countered'; // Seller proposes new price -> Status: Countered (Waiting for Customer)
            } else {
                newStatus = 'pending'; // Customer proposes new price -> Status: Pending (Waiting for Seller)
            }
        }

        // Execute Update
        await bargainRepository.addMessage(bargainId, {
            senderId: userId,
            senderRole: userRole,
            message: encryptedMessage,
            offeredPrice: offeredPrice || bargain.offeredPrice, // Keep old price if not updated
            timestamp: new Date()
        });

        if (newStatus !== bargain.status) {
            await bargainRepository.updateStatus(bargainId, newStatus);
        }

        // Return updated bargain (decrypted)
        return await this.getBargainDetails(bargainId, userId);
    }

    async updateStatus(userId, userRole, { bargainId, status }) {
        const bargain = await bargainRepository.findById(bargainId);
        if (!bargain) throw new AppError('Negotiation not found', 404);

        // Current status validation
        if (['accepted', 'rejected', 'completed'].includes(bargain.status)) {
            throw new AppError('Negotiation is already closed', 400);
        }

        // REJECT LOGIC
        if (status === 'rejected') {
            // Anyone involved can reject at any time
            await bargainRepository.updateStatus(bargainId, 'rejected');
            return { ...(bargain.toObject ? bargain.toObject() : bargain), status: 'rejected' };
        }

        // ACCEPT LOGIC
        if (status === 'accepted') {
            // Strict Rule: Only the RECIPIENT of the offer can accept

            // Case 1: Status is 'pending' (Customer made last offer) -> Only Seller can accept
            if (bargain.status === 'pending') {
                if (userRole !== 'seller') {
                    throw new AppError('You cannot accept your own offer. Wait for the seller.', 400);
                }
            }
            // Case 2: Status is 'countered' (Seller made last offer) -> Only Customer can accept
            else if (bargain.status === 'countered') {
                if (userRole !== 'customer') {
                    throw new AppError('You cannot accept your own offer. Wait for the customer.', 400);
                }
            }
            else {
                throw new AppError('Invalid state for acceptance', 400);
            }

            // Lock the final price
            await bargainRepository.updateStatus(bargainId, 'accepted', bargain.offeredPrice);
            return { ...(bargain.toObject ? bargain.toObject() : bargain), status: 'accepted', finalPrice: bargain.offeredPrice };
        }

        throw new AppError('Invalid status update', 400);
    }

    async getBargains(userId, role, page = 1, limit = 15) {
        let result;
        if (role === 'seller') {
            result = await bargainRepository.findBySeller(userId, {}, page, limit);
        } else {
            result = await bargainRepository.findByCustomer(userId, {}, page, limit);
        }

        // Decrypt messages
        result.bargains = result.bargains.map(b => {
            // Already lean objects from repository
            b.chatMessages = b.chatMessages.map(m => ({
                ...m,
                message: decrypt(m.message)
            }));
            return b;
        });

        return result;
    }

    async getBargainDetails(bargainId, userId) {
        const bargain = await bargainRepository.findById(bargainId);
        if (!bargain) throw new AppError('Not found', 404);

        const obj = bargain.toObject ? bargain.toObject() : bargain;
        obj.chatMessages = obj.chatMessages.map(m => ({
            ...m,
            message: decrypt(m.message)
        }));
        return obj;
    }

    async getAnalytics(sellerId) {
        const stats = await bargainRepository.aggregateAnalytics([
            { $match: { sellerId: new mongoose.Types.ObjectId(sellerId) } },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    accepted: { $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] } },
                    rejected: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
                    totalRevenue: { $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, '$finalPrice', 0] } }
                }
            }
        ]);
        return stats[0] || { total: 0, accepted: 0, rejected: 0, totalRevenue: 0 };
    }
}

module.exports = new BargainService();
