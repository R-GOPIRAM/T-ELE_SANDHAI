const AnalyticsService = require('../services/analyticsService');
const catchAsync = require('../utils/catchAsync');
const { sendResponse } = require('../utils/response');
const User = require('../models/User');
const Seller = require('../models/Seller');
const Order = require('../models/Order');

exports.getSellerAnalytics = catchAsync(async (req, res, next) => {
    const sellerId = req.user.id;
    const analytics = await AnalyticsService.getSellerAnalytics(sellerId);
    return sendResponse(res, 200, true, 'Analytics fetched successfully', analytics);
});

exports.getAdminOverview = catchAsync(async (req, res) => {
    const now = new Date();
    const last14Days = new Date(now);
    last14Days.setDate(last14Days.getDate() - 13);
    last14Days.setHours(0, 0, 0, 0);

    const last30Days = new Date(now);
    last30Days.setDate(last30Days.getDate() - 29);
    last30Days.setHours(0, 0, 0, 0);

    // --- Aggregate counts in parallel ---
    const [
        totalUsers,
        totalSellers,
        totalOrders,
        revenueAgg,
        ordersToday,
        dailySales,
        dailyGrowth
    ] = await Promise.all([
        User.countDocuments({ role: 'customer' }),
        Seller.countDocuments({ sellerStatus: 'approved' }),
        Order.countDocuments(),
        Order.aggregate([
            { $match: { 'paymentInfo.paymentStatus': 'paid' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]),
        Order.countDocuments({
            createdAt: {
                $gte: new Date(new Date().setHours(0, 0, 0, 0)),
                $lt: new Date(new Date().setHours(23, 59, 59, 999))
            }
        }),
        // Daily sales (last 14 days)
        Order.aggregate([
            { $match: { createdAt: { $gte: last14Days }, 'paymentInfo.paymentStatus': 'paid' } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    revenue: { $sum: '$totalAmount' },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]),
        // Daily registrations (last 30 days)
        User.aggregate([
            { $match: { createdAt: { $gte: last30Days } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    users: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ])
    ]);

    // Fill gaps in daily sales (last 14 days) with zero values
    const salesMap = Object.fromEntries(dailySales.map(d => [d._id, d]));
    const filledSales = [];
    for (let i = 13; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split('T')[0];
        filledSales.push({
            date: key,
            label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            revenue: salesMap[key]?.revenue || 0,
            orders: salesMap[key]?.orders || 0
        });
    }

    // Fill gaps in growth (last 30 days)
    const growthMap = Object.fromEntries(dailyGrowth.map(d => [d._id, d]));
    const filledGrowth = [];
    for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split('T')[0];
        filledGrowth.push({
            date: key,
            label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            users: growthMap[key]?.users || 0
        });
    }

    const totalRevenue = revenueAgg[0]?.total || 0;

    return sendResponse(res, 200, true, 'Admin overview fetched successfully', {
        metrics: {
            totalUsers,
            totalSellers,
            totalOrders,
            totalRevenue,
            ordersToday
        },
        dailySales: filledSales,
        platformGrowth: filledGrowth
    });
});

exports.getAdminAnalytics = catchAsync(async (req, res) => {
    const { period = '30' } = req.query;
    const days = parseInt(period) || 30;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (days - 1));
    startDate.setHours(0, 0, 0, 0);

    const [
        revenueByDay,
        ordersByStatus,
        topSellers,
        topProducts,
        revenueByMethod
    ] = await Promise.all([

        // Revenue & orders by day
        Order.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    revenue: {
                        $sum: {
                            $cond: [{ $eq: ['$paymentInfo.paymentStatus', 'Paid'] }, '$totalAmount', 0]
                        }
                    },
                    orders: { $sum: 1 },
                    paid: { $sum: { $cond: [{ $eq: ['$paymentInfo.paymentStatus', 'Paid'] }, 1, 0] } }
                }
            },
            { $sort: { _id: 1 } }
        ]),

        // Orders by status
        Order.aggregate([
            { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]),

        // Top sellers by revenue
        Order.aggregate([
            { $match: { 'paymentInfo.paymentStatus': 'Paid' } },
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.seller',
                    revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
                    orders: { $sum: 1 },
                    unitsSold: { $sum: '$items.quantity' }
                }
            },
            { $sort: { revenue: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: 'sellers',
                    localField: '_id',
                    foreignField: 'userId',
                    as: 'sellerInfo'
                }
            },
            {
                $project: {
                    revenue: 1, orders: 1, unitsSold: 1,
                    businessName: { $ifNull: [{ $arrayElemAt: ['$sellerInfo.businessName', 0] }, 'Unknown Store'] }
                }
            }
        ]),

        // Top products by revenue
        Order.aggregate([
            { $match: { 'paymentInfo.paymentStatus': 'Paid' } },
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.product',
                    name: { $first: '$items.name' },
                    revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
                    unitsSold: { $sum: '$items.quantity' },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { revenue: -1 } },
            { $limit: 10 }
        ]),

        // Revenue by payment method
        Order.aggregate([
            { $match: { 'paymentInfo.paymentStatus': 'Paid' } },
            {
                $group: {
                    _id: '$paymentInfo.method',
                    revenue: { $sum: '$totalAmount' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { revenue: -1 } }
        ])
    ]);

    // Zero-fill revenueByDay for the full period
    const dayMap = Object.fromEntries(revenueByDay.map(d => [d._id, d]));
    const filledRevenue = [];
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split('T')[0];
        filledRevenue.push({
            date: key,
            label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            revenue: dayMap[key]?.revenue || 0,
            orders: dayMap[key]?.orders || 0,
            paid: dayMap[key]?.paid || 0
        });
    }

    return sendResponse(res, 200, true, 'Analytics fetched successfully', {
        revenueByDay: filledRevenue,
        ordersByStatus,
        topSellers,
        topProducts,
        revenueByMethod
    });
});


