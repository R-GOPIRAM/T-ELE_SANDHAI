const express = require('express');
const reviewController = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateResource');
const { createReviewSchema, markHelpfulSchema } = require('../validators/review.schema');

const router = express.Router();

router.post('/', protect, validate(createReviewSchema), reviewController.createReview);
router.get('/product/:productId', reviewController.getProductReviews);
router.get('/my-reviews', protect, reviewController.getMyReviews);
router.patch('/:id/helpful', protect, validate(markHelpfulSchema), reviewController.markHelpful);

module.exports = router;
