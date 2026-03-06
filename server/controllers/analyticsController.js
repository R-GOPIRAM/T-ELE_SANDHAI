const AnalyticsService = require('../services/analyticsService');
const catchAsync = require('../utils/catchAsync');
const { sendResponse } = require('../utils/response');

exports.getSellerAnalytics = catchAsync(async (req, res, next) => {
    const sellerId = req.user.id;
    const analytics = await AnalyticsService.getSellerAnalytics(sellerId);

    return sendResponse(res, 200, true, 'Analytics fetched successfully', analytics);
});
