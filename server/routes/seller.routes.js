const express = require('express');
const path = require('path');
const fs = require('fs');
const upload = require('../middleware/uploadMiddleware');
const sellerController = require('../controllers/sellerController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateResource');
const { registerSellerSchema, verifySellerSchema } = require('../validators/seller.schema');

const router = express.Router();



router.post(
    '/register',
    protect,
    upload.fields([
        { name: 'aadhaar', maxCount: 1 },
        { name: 'pan', maxCount: 1 },
        { name: 'gstin', maxCount: 1 },
        { name: 'laborCert', maxCount: 1 },
        { name: 'businessLicense', maxCount: 1 }
    ]),
    validate(registerSellerSchema),
    sellerController.register
);

router.get('/profile', protect, restrictTo('seller', 'admin'), sellerController.getProfile);
router.get('/store/:id', sellerController.getStoreProfile); // Public route for store profiles
router.get('/admin/all', protect, restrictTo('admin'), sellerController.getAllSellers);
router.patch('/:id/verify', protect, restrictTo('admin'), validate(verifySellerSchema), sellerController.verifySeller);

// Stock Alert Routes
router.get('/alerts/stock', protect, restrictTo('seller'), sellerController.getStockAlerts);
router.patch('/alerts/stock/:id/read', protect, restrictTo('seller'), sellerController.markStockAlertRead);

module.exports = router;
