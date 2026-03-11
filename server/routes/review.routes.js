const express = require('express');
const reviewController = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateResource');
const { createReviewSchema, markHelpfulSchema } = require('../validators/review.schema');

const authorizeRoles = require('../middleware/roleMiddleware');

const router = express.Router();

router.post('/', protect, validate(createReviewSchema), reviewController.createReview);
router.get('/product/:productId', reviewController.getProductReviews);
router.get('/my-reviews', protect, reviewController.getMyReviews);
router.patch('/:id/helpful', protect, validate(markHelpfulSchema), reviewController.markHelpful);

// Admin Routes
router.get('/admin/all', protect, authorizeRoles('admin'), reviewController.getAllReviews);
router.patch('/admin/:id/status', protect, authorizeRoles('admin'), reviewController.updateReviewStatus);
router.delete('/admin/:id', protect, authorizeRoles('admin'), reviewController.deleteReview);

module.exports = router;
