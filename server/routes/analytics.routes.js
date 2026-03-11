const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/seller', restrictTo('seller', 'admin'), analyticsController.getSellerAnalytics);
router.get('/admin', restrictTo('admin'), analyticsController.getAdminOverview);
router.get('/admin/reports', restrictTo('admin'), analyticsController.getAdminAnalytics);

module.exports = router;
