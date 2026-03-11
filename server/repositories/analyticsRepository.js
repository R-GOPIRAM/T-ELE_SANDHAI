const Order = require('../models/Order');
const mongoose = require('mongoose');

class AnalyticsRepository {
    async getSellerRevenue(sellerId) {
        const monthsAgo = new Date();
        monthsAgo.setMonth(monthsAgo.getMonth() - 6);
        const sellerObjId = new mongoose.Types.ObjectId(sellerId);

        return await Order.aggregate([
            {
                $match: {
                    'items.seller': sellerObjId,
                    'paymentInfo.status': 'captured',
                    createdAt: { $gt: monthsAgo }
                }
            },
            {
                $project: {
                    createdAt: 1,
                    items: {
                        $filter: {
                            input: '$items',
                            as: 'item',
                            cond: { $eq: ['$$item.seller', sellerObjId] }
                        }
                    }
                }
            },
            { $unwind: '$items' },
            {
                $group: {
                    _id: {
                        month: { $month: '$createdAt' },
                        year: { $year: '$createdAt' }
                    },
                    revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
                    orderCount: { $addToSet: '$_id' }
                }
            },
            {
                $project: {
                    _id: 0,
                    month: '$_id.month',
                    year: '$_id.year',
                    revenue: 1,
                    orderCount: { $size: '$orderCount' }
                }
            },
            { $sort: { year: 1, month: 1 } }
        ]);
    }

    async getOrderStatusStats(sellerId) {
        return await Order.aggregate([
            {
                $match: {
                    'items.seller': new mongoose.Types.ObjectId(sellerId)
                }
            },
            {
                $group: {
                    _id: '$orderStatus',
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    status: '$_id',
                    count: 1
                }
            }
        ]);
    }

    async getTopProducts(sellerId, limit = 5) {
        const sellerObjId = new mongoose.Types.ObjectId(sellerId);
        return await Order.aggregate([
            {
                $match: {
                    'items.seller': sellerObjId,
                    'paymentInfo.status': 'captured'
                }
            },
            {
                $project: {
                    items: {
                        $filter: {
                            input: '$items',
                            as: 'item',
                            cond: { $eq: ['$$item.seller', sellerObjId] }
                        }
                    }
                }
            },
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.product',
                    name: { $first: '$items.name' },
                    revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
                    sales: { $sum: '$items.quantity' },
                    image: { $first: '$items.image' }
                }
            },
            { $sort: { revenue: -1 } },
            { $limit: limit }
        ]);
    }

    async getSellerSummary(sellerId) {
        const sellerObjId = new mongoose.Types.ObjectId(sellerId);
        const stats = await Order.aggregate([
            {
                $match: {
                    'items.seller': sellerObjId
                }
            },
            {
                $facet: {
                    totals: [
                        {
                            $project: {
                                paymentStatus: '$paymentInfo.status',
                                filteredItems: {
                                    $filter: {
                                        input: '$items',
                                        as: 'item',
                                        cond: { $eq: ['$$item.seller', sellerObjId] }
                                    }
                                }
                            }
                        },
                        { $unwind: '$filteredItems' },
                        {
                            $group: {
                                _id: null,
                                totalRevenue: {
                                    $sum: {
                                        $cond: [
                                            { $eq: ['$paymentStatus', 'captured'] },
                                            { $multiply: ['$filteredItems.price', '$filteredItems.quantity'] },
                                            0
                                        ]
                                    }
                                },
                                totalSales: { $sum: '$filteredItems.quantity' }
                            }
                        }
                    ],
                    orderCount: [
                        { $count: 'count' }
                    ],
                    ordersToday: [
                        {
                            $match: {
                                createdAt: {
                                    $gte: new Date(new Date().setHours(0, 0, 0, 0))
                                }
                            }
                        },
                        { $count: 'count' }
                    ],
                    uniqueCustomers: [
                        { $group: { _id: '$user' } },
                        { $count: 'count' }
                    ]
                }
            }
        ]);

        return {
            totalRevenue: stats[0].totals[0]?.totalRevenue || 0,
            totalSales: stats[0].totals[0]?.totalSales || 0,
            totalOrders: stats[0].orderCount[0]?.count || 0,
            ordersToday: stats[0].ordersToday[0]?.count || 0,
            uniqueCustomers: stats[0].uniqueCustomers[0]?.count || 0
        };
    }
}

module.exports = new AnalyticsRepository();
