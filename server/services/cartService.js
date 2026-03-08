const Cart = require('../models/Cart');
const Product = require('../models/Product');
const AppError = require('../utils/AppError');

class CartService {
    async getCart(userId) {
        let cart = await Cart.findOne({ userId }).populate('items.productId');
        if (!cart) {
            cart = await Cart.create({ userId, items: [] });
        }
        return cart;
    }

    async addToCart(userId, productId, quantity = 1) {
        const product = await Product.findById(productId);
        if (!product) {
            throw new AppError('Product not found', 404);
        }

        let cart = await Cart.findOne({ userId });
        if (!cart) {
            cart = new Cart({ userId, items: [] });
        }

        const existingItemIndex = cart.items.findIndex(
            (item) => item.productId.toString() === productId
        );

        if (existingItemIndex > -1) {
            cart.items[existingItemIndex].quantity += quantity;
            cart.items[existingItemIndex].price = product.price; // Update to latest price
        } else {
            cart.items.push({
                productId,
                quantity,
                price: product.price,
                sellerId: product.shopOwnerId
            });
        }

        await cart.save();
        return cart.populate('items.productId');
    }

    async updateQuantity(userId, productId, quantity) {
        if (quantity < 1) {
            return this.removeFromCart(userId, productId);
        }

        const cart = await Cart.findOne({ userId });
        if (!cart) {
            throw new AppError('Cart not found', 404);
        }

        const itemIndex = cart.items.findIndex(
            (item) => item.productId.toString() === productId
        );

        if (itemIndex === -1) {
            throw new AppError('Item not found in cart', 404);
        }

        cart.items[itemIndex].quantity = quantity;
        await cart.save();
        return cart.populate('items.productId');
    }

    async removeFromCart(userId, productId) {
        const cart = await Cart.findOne({ userId });
        if (!cart) {
            throw new AppError('Cart not found', 404);
        }

        cart.items = cart.items.filter(
            (item) => item.productId.toString() !== productId
        );

        await cart.save();
        return cart.populate('items.productId');
    }

    async clearCart(userId) {
        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return Cart.create({ userId, items: [] });
        }

        cart.items = [];
        await cart.save();
        return cart;
    }

    async mergeCart(userId, localItems) {
        let cart = await Cart.findOne({ userId });
        if (!cart) {
            cart = new Cart({ userId, items: [] });
        }

        for (const localItem of localItems) {
            const existingItemIndex = cart.items.findIndex(
                (item) => item.productId.toString() === localItem.productId
            );

            if (existingItemIndex > -1) {
                // Option: merge quantities or take local? Usually merge or max. 
                // Let's merge but cap it if there's stock logic later.
                cart.items[existingItemIndex].quantity += localItem.quantity;
            } else {
                // Verify product exists before adding
                const product = await Product.findById(localItem.productId);
                if (product) {
                    cart.items.push({
                        productId: localItem.productId,
                        quantity: localItem.quantity,
                        price: product.price,
                        sellerId: product.shopOwnerId
                    });
                }
            }
        }

        await cart.save();
        return cart.populate('items.productId');
    }
}

module.exports = new CartService();
