const AnalyticsService = require('../services/analyticsService');
const catchAsync = require('../utils/catchAsync');

exports.getSellerAnalytics = catchAsync(async (req, res, next) => {
    const sellerId = req.user.id;
    const analytics = await AnalyticsService.getSellerAnalytics(sellerId);

    res.status(200).json({
        success: true,
        data: analytics
    });
});
