const WishlistService = require('../services/wishlistService');
const catchAsync = require('../utils/catchAsync');
const { sendResponse } = require('../utils/response');

exports.getWishlist = catchAsync(async (req, res) => {
    const wishlist = await WishlistService.getWishlist(req.user._id);
    return sendResponse(res, 200, true, 'Wishlist fetched successfully', wishlist);
});

exports.addToWishlist = catchAsync(async (req, res) => {
    const { productId } = req.body;

    if (!productId) {
        return sendResponse(res, 400, false, 'Product ID is required');
    }

    const wishlist = await WishlistService.addProductToWishlist(req.user._id, productId);
    return sendResponse(res, 200, true, 'Product added to wishlist', wishlist);
});

exports.removeFromWishlist = catchAsync(async (req, res) => {
    const wishlist = await WishlistService.removeProductFromWishlist(req.user._id, req.params.productId);
    return sendResponse(res, 200, true, 'Product removed from wishlist', wishlist);
});
