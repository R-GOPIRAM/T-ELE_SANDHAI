const OrderService = require('../services/orderService');
const PaymentService = require('../services/paymentService');
const catchAsync = require('../utils/catchAsync');
const { sendResponse } = require('../utils/response');

exports.createOrder = catchAsync(async (req, res) => {
    const order = await OrderService.createOrder(req.user._id, req.body);
    return sendResponse(res, 201, true, 'Order created successfully', order);
});

exports.getMyOrders = catchAsync(async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const result = await OrderService.getUserOrders(req.user._id, page, limit);

    return sendResponse(res, 200, true, 'User orders fetched successfully', {
        orders: result.orders,
        pagination: {
            count: result.orders.length,
            total: result.total,
            page,
            totalPages: Math.ceil(result.total / limit)
        }
    });
});

exports.getSellerOrders = catchAsync(async (req, res) => {
    // Ensure user is a seller
    if (req.user.role !== 'seller') {
        return sendResponse(res, 403, false, 'Access denied. Only sellers can view seller orders.');
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const result = await OrderService.getSellerOrders(req.user._id, page, limit);

    return sendResponse(res, 200, true, 'Seller orders fetched successfully', {
        orders: result.orders,
        pagination: {
            count: result.orders.length,
            total: result.total,
            page,
            totalPages: Math.ceil(result.total / limit)
        }
    });
});

exports.getOrder = catchAsync(async (req, res) => {
    const order = await OrderService.getOrder(req.params.id, req.user._id.toString(), req.user.role);
    return sendResponse(res, 200, true, 'Order fetched successfully', order);
});

exports.createPaymentIntent = catchAsync(async (req, res) => {
    const { amount, currency } = req.body;
    // this handles older payment intent logic, routing to sendResponse
    const paymentIntent = await PaymentService.createOrder(amount, req.user._id);
    return sendResponse(res, 200, true, 'Payment intent created', paymentIntent);
});

exports.verifyPayment = catchAsync(async (req, res) => {
    const { paymentId, signature } = req.body;
    const isValid = PaymentService.verifySignature(null, paymentId, signature);
    return sendResponse(res, 200, true, 'Payment verified', { verified: isValid });
});

exports.updatePaymentStatus = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { status, method, transactionId } = req.body;

    const order = await OrderService.updatePaymentStatus(id, req.user._id.toString(), req.user.role, status, method, transactionId);

    return sendResponse(res, 200, true, 'Payment status updated successfully', order);
});

exports.updateOrderStatus = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const order = await OrderService.updateOrderStatus(id, req.user._id.toString(), req.user.role, status);

    return sendResponse(res, 200, true, 'Order status updated successfully', order);
});
