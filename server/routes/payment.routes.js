const express = require('express');
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// 1. Generate a Razorpay Order ID for a given amount
router.post('/create-order', protect, paymentController.createOrder);

// 2. Cryptographically verify the payment signature and save the order
router.post('/verify', protect, paymentController.verifyPayment);

// 3. Razorpay Webhook Handler (Public & Secure)
const { validateWebhookSignature } = require('../middleware/razorpayMiddleware');
router.post('/webhook', validateWebhookSignature, paymentController.handleWebhook);

module.exports = router;
