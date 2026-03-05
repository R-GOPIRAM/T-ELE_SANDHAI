const OrderRepository = require('../repositories/orderRepository');
const ProductRepository = require('../repositories/productRepository');
const PaymentService = require('./paymentService');
const AppError = require('../utils/AppError');
const mongoose = require('mongoose');

class OrderService {
    async createOrder(userId, orderData) {
        const { items, shippingAddress, paymentInfo } = orderData;

        // Verify payment first (in a real scenario, you'd likely create order as 'Pending' then confirm)
        // For this flow: frontend calls payment verify -> then calls create order

        let totalAmount = 0;
        const enrichedItems = [];

        // Validate items and stock
        for (const item of items) {
            const product = await ProductRepository.findById(item.product);
            if (!product) {
                throw new AppError(`Product not found: ${item.product}`, 404);
            }
            if (product.stock < item.quantity) {
                throw new AppError(`Insufficient stock for product: ${product.name}`, 400);
            }

            totalAmount += product.price * item.quantity;
            enrichedItems.push({
                product: product._id,
                name: product.name,
                price: product.price,
                quantity: item.quantity,
                image: product.images && product.images.length > 0 ? product.images[0] : null,
                seller: product.shopOwnerId ? product.shopOwnerId._id : null
            });
        }

        // Final safety check for sellers
        if (enrichedItems.some(item => !item.seller)) {
            throw new AppError('One or more products have invalid seller information', 400);
        }

        // Start Transaction
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // 1. Create Order
            const order = await OrderRepository.create({
                orderId: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                user: userId,
                items: enrichedItems,
                shippingAddress,
                paymentInfo,
                totalAmount
            });

            // 2. Update Stock
            for (const item of enrichedItems) {
                await ProductRepository.update(item.product, {
                    $inc: { stock: -item.quantity, soldCount: item.quantity }
                });
            }

            await session.commitTransaction();
            session.endSession();

            return order;
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }

    async getUserOrders(userId, page = 1, limit = 10) {
        return await OrderRepository.findByUser(userId, page, limit);
    }

    async getSellerOrders(sellerId, page = 1, limit = 10) {
        return await OrderRepository.findBySeller(sellerId, page, limit);
    }

    async getOrder(id, userId, role) {
        const order = await OrderRepository.findById(id);
        if (!order) {
            throw new AppError('Order not found', 404);
        }

        if (role !== 'admin' && order.user._id.toString() !== userId) {
            // Check if user is a seller of one of the items
            const isSeller = order.items.some(item => item.seller._id.toString() === userId);
            if (!isSeller) {
                throw new AppError('Not authorized to view this order', 403);
            }
        }

        return order;
    }

    async updatePaymentStatus(id, userId, role, status, method, transactionId) {
        const order = await this.getOrder(id, userId, role);

        // Update payment info
        order.paymentInfo.status = status;
        order.paymentInfo.method = method || order.paymentInfo.method;
        if (transactionId) order.paymentInfo.id = transactionId;

        // If paid, ensure order status is at least Processing
        if (status === 'completed' || status === 'success') {
            order.orderStatus = 'Processing';
        }

        await order.save();
        return order;
    }

    async updatePaymentStatusByRazorpayId(razorpayOrderId, { paymentId, status, method }) {
        const order = await OrderRepository.findByRazorpayOrderId(razorpayOrderId);
        if (!order) {
            throw new AppError(`Order with Razorpay ID ${razorpayOrderId} not found`, 404);
        }

        // Prevent invalid transitions (e.g., don't go from 'captured' back to 'pending')
        if (order.paymentInfo.status === 'captured' && status !== 'refunded') {
            return order;
        }

        order.paymentInfo.razorpayPaymentId = paymentId || order.paymentInfo.razorpayPaymentId;
        order.paymentInfo.status = status;
        if (method) order.paymentInfo.method = method;

        if (status === 'captured') {
            order.orderStatus = 'Processing';
        }

        await order.save();

        // Emit real-time dashboard update to all sellers involved in the order
        try {
            const { getIo } = require('../socket');
            let io;
            try {
                io = getIo();
            } catch (err) {
                // Socket not initialized, skip notification
                return order;
            }

            const uniqueSellers = [...new Set(order.items.map(item => item.seller.toString()))];

            uniqueSellers.forEach(sellerId => {
                io.to(`seller_${sellerId}`).emit('dashboard_update', {
                    message: 'New order received!',
                    orderId: order.orderId
                });
            });
        } catch (err) {
            console.error('Socket notification failed', err);
        }

        return order;
    }
}

module.exports = new OrderService();
