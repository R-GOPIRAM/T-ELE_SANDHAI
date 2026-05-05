const express = require('express');

const router = express.Router();

router.use('/auth', require('./auth.routes'));
router.use('/products', require('./product.routes'));
router.use('/orders', require('./order.routes'));
router.use('/bargain', require('./bargain.routes'));
router.use('/sellers', require('./seller.routes'));
router.use('/reviews', require('./review.routes'));
router.use('/wishlist', require('./wishlist.routes'));
router.use('/payment', require('./payment.routes'));
router.use('/analytics', require('./analytics.routes'));
router.use('/cart', require('./cart.routes'));
router.use('/shipping', require('./shipping.routes'));
router.use('/admin', require('./admin.routes'));

module.exports = router;

