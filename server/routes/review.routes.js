const express = require('express');
const reviewController = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, reviewController.createReview);
router.get('/product/:productId', reviewController.getProductReviews);
router.get('/my-reviews', protect, reviewController.getMyReviews);
router.patch('/:id/helpful', protect, reviewController.markHelpful);

module.exports = router;
