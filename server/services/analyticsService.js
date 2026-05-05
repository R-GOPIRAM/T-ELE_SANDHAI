const AnalyticsRepository = require('../repositories/analyticsRepository');

class AnalyticsService {
    async getSellerAnalytics(sellerId) {
        const [revenue, statusStats, topProducts, summary] = await Promise.all([
            AnalyticsRepository.getSellerRevenue(sellerId),
            AnalyticsRepository.getOrderStatusStats(sellerId),
            AnalyticsRepository.getTopProducts(sellerId),
            AnalyticsRepository.getSellerSummary(sellerId)
        ]);

        return {
            revenue,
            statusStats,
            topProducts,
            summary
        };
    }
}

module.exports = new AnalyticsService();
