const ReviewService = require('../services/reviewService');
const catchAsync = require('../utils/catchAsync');
const { sendResponse } = require('../utils/response');

exports.createReview = catchAsync(async (req, res) => {
    const review = await ReviewService.createReview(req.user._id, req.body);
    return sendResponse(res, 201, true, 'Review created successfully', review);
});

exports.getProductReviews = catchAsync(async (req, res) => {
    const { productId } = req.params;
    const result = await ReviewService.getProductReviews(productId, req.query);
    return sendResponse(res, 200, true, 'Product reviews fetched successfully', result);
});

exports.getMyReviews = catchAsync(async (req, res) => {
    const reviews = await ReviewService.getMyReviews(req.user._id);
    return sendResponse(res, 200, true, 'User reviews fetched successfully', reviews);
});

exports.markHelpful = catchAsync(async (req, res) => {
    const review = await ReviewService.markHelpful(req.params.id);
    return sendResponse(res, 200, true, 'Review marked as helpful', review);
});

// Admin Moderation Methods
exports.getAllReviews = catchAsync(async (req, res) => {
    const result = await ReviewService.getAllReviews(req.query);
    return sendResponse(res, 200, true, 'All reviews fetched successfully', result);
});

exports.updateReviewStatus = catchAsync(async (req, res) => {
    const { status } = req.body;
    const review = await ReviewService.updateReviewStatus(req.params.id, status === 'approved');
    return sendResponse(res, 200, true, `Review ${status} successfully`, review);
});

exports.deleteReview = catchAsync(async (req, res) => {
    await ReviewService.deleteReview(req.params.id);
    return sendResponse(res, 200, true, 'Review deleted successfully', null);
});
