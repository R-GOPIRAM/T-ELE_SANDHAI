const express = require('express');
const cartController = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateResource');
const { addToCartSchema, updateQuantitySchema } = require('../validators/cart.schema');

const router = express.Router();

router.use(protect);

router.get('/', cartController.getCart);
router.post('/', validate(addToCartSchema), cartController.addToCart);
router.post('/merge', cartController.mergeCart);
router.put('/:productId', validate(updateQuantitySchema), cartController.updateQuantity);
router.delete('/:productId', cartController.removeFromCart);
router.delete('/', cartController.clearCart);

module.exports = router;
