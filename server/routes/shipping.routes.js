const express = require('express');
const router = express.Router();
const shippingController = require('../controllers/shippingController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateResource');
const { createShipmentSchema, checkServiceabilitySchema } = require('../validators/shipping.schema');

router.post('/create', protect, restrictTo('admin', 'seller'), validate(createShipmentSchema), shippingController.createShipment);
router.get('/track/:awb', shippingController.trackShipment);
router.get('/serviceability', validate(checkServiceabilitySchema), shippingController.checkServiceability);

module.exports = router;
