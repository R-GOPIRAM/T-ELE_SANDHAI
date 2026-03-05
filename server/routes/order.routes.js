const express = require('express');
const orderController = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateResource');
const { createOrderSchema, createPaymentSchema } = require('../validators/order.schema');

const router = express.Router();

router.use(protect);

router.post('/', validate(createOrderSchema), orderController.createOrder);
router.get('/my-orders', orderController.getMyOrders);
router.get('/seller-orders', orderController.getSellerOrders);
router.get('/:id', orderController.getOrder);

router.post('/payment/create', validate(createPaymentSchema), orderController.createPaymentIntent);
router.post('/payment/verify', orderController.verifyPayment);
router.put('/:id/pay', orderController.updatePaymentStatus);

module.exports = router;
