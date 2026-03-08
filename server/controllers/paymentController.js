const PaymentService = require('../services/paymentService');
const OrderService = require('../services/orderService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { sendResponse } = require('../utils/response');

exports.createOrder = catchAsync(async (req, res, next) => {
    const { amount } = req.body;

    if (!amount) {
        return next(new AppError('Payment amount is required', 400));
    }

    try {
        const orderData = await PaymentService.createOrder(amount, req.user._id);
        return sendResponse(res, 200, true, 'Payment order created successfully', orderData);
    } catch (error) {
        return next(new AppError(error.message || 'Error generating Razorpay order', 500));
    }
});

exports.verifyPayment = catchAsync(async (req, res, next) => {
    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        orderData // The actual cart/shipping data sent from frontend to save the final order
    } = req.body;

    if (!razorpay_order_id || (!razorpay_payment_id && process.env.RAZORPAY_KEY_ID) || (!razorpay_signature && process.env.RAZORPAY_KEY_ID)) {
        return next(new AppError('Missing Razorpay verification parameters', 400));
    }

    // Cryptographic signature verification (Only if we have real keys)
    PaymentService.verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);

    // Payment is securely verified! Let's save the order to our database.
    try {
        const enrichedOrderData = {
            ...orderData,
            paymentInfo: {
                razorpayOrderId: razorpay_order_id,
                razorpayPaymentId: razorpay_payment_id || `mock_pay_${Date.now()}`,
                razorpaySignature: razorpay_signature,
                status: 'captured', // Initial client-side success
                method: 'card'
            }
        };

        const newOrder = await OrderService.createOrder(req.user._id, enrichedOrderData);

        return sendResponse(res, 200, true, 'Payment verified successfully and order created', newOrder);
    } catch (error) {
        return next(new AppError('Payment verified but failed to save order: ' + error.message, 500));
    }
});

exports.handleWebhook = catchAsync(async (req, res, next) => {
    const { event, payload } = req.body;

    // Process the event asynchronously
    // Note: Signature validation happened in middleware
    PaymentService.handleWebhookEvent(event, payload).catch(err => {
        logger.error(`Webhook Processing Error: ${err.message}`, { event });
    });

    // Always respond with 200 OK to Razorpay to prevent retries
    return sendResponse(res, 200, true, 'Webhook received');
});
