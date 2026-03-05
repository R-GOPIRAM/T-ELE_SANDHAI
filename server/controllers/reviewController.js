const ReviewService = require('../services/reviewService');
const catchAsync = require('../utils/catchAsync');
const { sendResponse } = require('../utils/response');

exports.createReview = catchAsync(async (req, res) => {
    const review = await ReviewService.createReview(req.user._id, req.body);
    return sendResponse(res, 201, true, 'Review created successfully', review);
});

exports.getProductReviews = catchAsync(async (req, res) => {
    const data = await ReviewService.getProductReviews(req.params.productId, req.query);
    const { reviews, ...metadata } = data;

    return sendResponse(res, 200, true, 'Product reviews fetched successfully', reviews, null, metadata);
});

exports.getMyReviews = catchAsync(async (req, res) => {
    const reviews = await ReviewService.getMyReviews(req.user._id);
    return sendResponse(res, 200, true, 'User reviews fetched successfully', reviews);
});

exports.markHelpful = catchAsync(async (req, res) => {
    const review = await ReviewService.markHelpful(req.params.id);
    return sendResponse(res, 200, true, 'Review marked as helpful', review);
});
