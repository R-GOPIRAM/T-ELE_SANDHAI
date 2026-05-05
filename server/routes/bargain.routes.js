const express = require('express');
const router = express.Router();
const bargainController = require('../controllers/bargainController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const validateResource = require('../middleware/validateResource');
const { startBargainSchema, sendMessageSchema, updateStatusSchema } = require('../validators/bargainValidator');

// Protect all routes
router.use(protect);

router.post('/start', validateResource(startBargainSchema), bargainController.initiateBargain);
router.post('/message', validateResource(sendMessageSchema), bargainController.sendMessage);
router.post('/action', validateResource(updateStatusSchema), bargainController.updateStatus);

router.get('/analytics', bargainController.getAnalytics);
router.get('/my', bargainController.getMyBargains);
router.get('/:id', bargainController.getBargainDetails);

module.exports = router;
