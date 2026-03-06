const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateResource');
const { addToWishlistSchema } = require('../validators/wishlist.schema');

router.use(protect); // All wishlist routes require authentication

router
    .route('/')
    .get(wishlistController.getWishlist)
    .post(validate(addToWishlistSchema), wishlistController.addToWishlist);

router
    .route('/:productId')
    .delete(wishlistController.removeFromWishlist);

module.exports = router;
