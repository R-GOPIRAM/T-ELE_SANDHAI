const WishlistRepository = require('../repositories/wishlistRepository');
const ProductRepository = require('../repositories/productRepository');
const AppError = require('../utils/AppError');

class WishlistService {
    async getWishlist(userId) {
        let wishlist = await WishlistRepository.findByUser(userId);
        if (!wishlist) {
            wishlist = await WishlistRepository.createForUser(userId);
        }

        // Map and filter wishlist items
        if (wishlist.items) {
            wishlist.items = wishlist.items
                .filter(item => item.product) // Filter out items where product might have been deleted
                .map(item => {
                    const itemObj = item.toObject ? item.toObject() : item;
                    if (itemObj.product && itemObj.product.shopOwnerId) {
                        itemObj.product.sellerName = itemObj.product.shopOwnerId.name;
                        itemObj.product.sellerId = itemObj.product.shopOwnerId._id;
                        delete itemObj.product.shopOwnerId;
                    }
                    return itemObj;
                });
        }

        return wishlist;
    }

    async addProductToWishlist(userId, productId) {
        // Verify product exists
        const product = await ProductRepository.findById(productId);
        if (!product) {
            throw new AppError('Product not found', 404);
        }

        const wishlist = await WishlistRepository.addProduct(userId, productId);
        return this._formatWishlist(wishlist);
    }

    async removeProductFromWishlist(userId, productId) {
        const wishlist = await WishlistRepository.removeProduct(userId, productId);
        return this._formatWishlist(wishlist);
    }

    _formatWishlist(wishlist) {
        if (!wishlist) return null;

        const wishlistObj = wishlist.toObject ? wishlist.toObject() : wishlist;
        if (wishlistObj.items) {
            wishlistObj.items = wishlistObj.items
                .filter(item => item.product)
                .map(item => {
                    if (item.product && item.product.shopOwnerId) {
                        item.product.sellerName = item.product.shopOwnerId.name;
                        item.product.sellerId = item.product.shopOwnerId._id;
                        delete item.product.shopOwnerId;
                    }
                    return item;
                });
        }
        return wishlistObj;
    }
}

module.exports = new WishlistService();
