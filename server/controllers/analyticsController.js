const AnalyticsService = require('../services/analyticsService');

exports.getSellerAnalytics = async (req, res, next) => {
    try {
        const sellerId = req.user.id;
        const analytics = await AnalyticsService.getSellerAnalytics(sellerId);

        res.status(200).json({
            success: true,
            data: analytics
        });
    } catch (error) {
        next(error);
    }
};
