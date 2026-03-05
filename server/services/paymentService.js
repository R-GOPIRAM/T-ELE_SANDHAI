const AppError = require('../utils/AppError');
const logger = require('../utils/logger');
const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay
// We use fallback keys for development if env variables are missing
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock_key_id_123',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'rzp_test_mock_secret_456'
});

class PaymentService {
    async createOrder(amount, userId) {
        if (!amount) {
            throw new AppError('Payment amount is required', 400);
        }

        const options = {
            amount: Math.round(amount * 100), // Razorpay expects amount in paise
            currency: 'INR',
            receipt: `receipt_order_${Date.now()}_${userId}`,
            payment_capture: 1 // Auto capture
        };

        try {
            // Mock order generation if we don't have production keys to prevent 500 error
            if (!process.env.RAZORPAY_KEY_ID) {
                logger.info('Using simulated Razorpay Order generator since keys are missing.');
                return {
                    id: `order_mock_${Date.now()}`,
                    currency: 'INR',
                    amount: options.amount
                };
            }

            const order = await razorpay.orders.create(options);
            return {
                id: order.id,
                currency: order.currency,
                amount: order.amount
            };
        } catch (error) {
            throw new AppError(error.message || 'Error generating Razorpay order', 500);
        }
    }

    verifySignature(orderId, paymentId, signature) {
        if (!orderId || (!paymentId && process.env.RAZORPAY_KEY_ID) || (!signature && process.env.RAZORPAY_KEY_ID)) {
            throw new AppError('Missing Razorpay verification parameters', 400);
        }

        // Cryptographic signature verification (Only if we have real keys)
        if (process.env.RAZORPAY_KEY_ID) {
            const secret = process.env.RAZORPAY_KEY_SECRET;
            const shasum = crypto.createHmac('sha256', secret);
            shasum.update(`${orderId}|${paymentId}`);
            const digest = shasum.digest('hex');

            if (digest !== signature) {
                throw new AppError('Payment verification failed. Invalid Signature.', 400);
            }
        } else {
            logger.info('Skipping cryptographic verification because Razorpay keys are mocked. Approving dummy payment.');
        }

        return true;
    }

    async handleWebhookEvent(event, payload) {
        const OrderService = require('./orderService');

        switch (event) {
            case 'order.paid':
                const orderData = payload.order.entity;
                const paymentData = payload.payment.entity;

                logger.info(`Webhook: Processing order.paid for Razorpay Order ${orderData.id}`);

                await OrderService.updatePaymentStatusByRazorpayId(orderData.id, {
                    paymentId: paymentData.id,
                    status: 'captured',
                    method: paymentData.method
                });
                break;

            case 'payment.failed':
                const failedPayment = payload.payment.entity;

                logger.error(`Webhook: Payment failed for Razorpay Order ${failedPayment.order_id}. Reason: ${failedPayment.error_description}`);

                await OrderService.updatePaymentStatusByRazorpayId(failedPayment.order_id, {
                    paymentId: failedPayment.id,
                    status: 'failed',
                    method: failedPayment.method
                });
                break;

            default:
                logger.info(`Webhook: Received unhandled event ${event}`);
        }
    }
}

module.exports = new PaymentService();
