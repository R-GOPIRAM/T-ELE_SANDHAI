const CartService = require('../services/cartService');
const catchAsync = require('../utils/catchAsync');
const { sendResponse } = require('../utils/response');

exports.getCart = catchAsync(async (req, res) => {
    const cart = await CartService.getCart(req.user._id);
    return sendResponse(res, 200, true, 'Cart fetched successfully', cart);
});

exports.addToCart = catchAsync(async (req, res) => {
    const { productId, quantity } = req.body;
    const cart = await CartService.addToCart(req.user._id, productId, quantity);
    return sendResponse(res, 200, true, 'Item added to cart', cart);
});

exports.updateQuantity = catchAsync(async (req, res) => {
    const { productId } = req.params;
    const { quantity } = req.body;
    const cart = await CartService.updateQuantity(req.user._id, productId, quantity);
    return sendResponse(res, 200, true, 'Cart updated', cart);
});

exports.removeFromCart = catchAsync(async (req, res) => {
    const { productId } = req.params;
    const cart = await CartService.removeFromCart(req.user._id, productId);
    return sendResponse(res, 200, true, 'Item removed from cart', cart);
});

exports.clearCart = catchAsync(async (req, res) => {
    const cart = await CartService.clearCart(req.user._id);
    return sendResponse(res, 200, true, 'Cart cleared', cart);
});

exports.mergeCart = catchAsync(async (req, res) => {
    const { items } = req.body;
    const cart = await CartService.mergeCart(req.user._id, items);
    return sendResponse(res, 200, true, 'Cart merged successfully', cart);
});
