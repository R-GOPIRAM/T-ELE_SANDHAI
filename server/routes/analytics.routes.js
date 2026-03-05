const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.use(protect);
router.use(restrictTo('seller', 'admin'));

router.get('/seller', analyticsController.getSellerAnalytics);

module.exports = router;
