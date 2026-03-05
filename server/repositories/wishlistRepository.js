const Wishlist = require('../models/Wishlist');

class WishlistRepository {
    async findByUser(userId) {
        return await Wishlist.findOne({ user: userId }).populate({
            path: 'items.product',
            select: 'name price originalPrice images brand rating reviewCount shopOwnerId'
        });
    }

    async createForUser(userId) {
        return await Wishlist.create({ user: userId, items: [] });
    }

    async addProduct(userId, productId) {
        let wishlist = await Wishlist.findOne({ user: userId });
        if (!wishlist) {
            wishlist = await this.createForUser(userId);
        }

        // Check if product already exists
        const exists = wishlist.items.some(item => item.product && item.product.toString() === productId.toString());
        if (!exists) {
            wishlist.items.push({ product: productId });
            await wishlist.save();
        }

        return await this.findByUser(userId);
    }

    async removeProduct(userId, productId) {
        const wishlist = await Wishlist.findOne({ user: userId });
        if (!wishlist) return null;

        wishlist.items = wishlist.items.filter(item => item.product.toString() !== productId.toString());
        await wishlist.save();

        return await this.findByUser(userId);
    }
}

module.exports = new WishlistRepository();
