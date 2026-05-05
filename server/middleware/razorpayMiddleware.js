const crypto = require('crypto');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

/**
 * Middleware to validate Razorpay Webhook Signatures
 * Razorpay sends a signature in the 'x-razorpay-signature' header.
 * We must verify this against the raw request body using our Webhook Secret.
 */
exports.validateWebhookSignature = (req, res, next) => {
    const signature = req.headers['x-razorpay-signature'];
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!signature) {
        logger.error('Webhook Error: Missing x-razorpay-signature header');
        return next(new AppError('Missing signature', 400));
    }

    if (!secret) {
        logger.warning('RAZORPAY_WEBHOOK_SECRET not set. Skipping signature validation (NOT SECURE FOR PROD)');
        return next();
    }

    // Razorpay webhooks require the raw body for signature verification
    // Note: This assumes express.raw() or similar is used for the webhook route
    const body = req.body.toString();
    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(body)
        .digest('hex');

    if (expectedSignature !== signature) {
        logger.error('Webhook Error: Invalid signature detected');
        return next(new AppError('Invalid webhook signature', 400));
    }

    next();
};
