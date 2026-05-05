const express = require('express');
const productController = require('../controllers/productController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateResource');
const { createProductSchema, updateProductSchema } = require('../validators/product.schema');

const router = express.Router();

router.route('/')
    .get(productController.getProducts)
    .post(
        protect,
        restrictTo('seller', 'admin'),
        validate(createProductSchema),
        productController.createProduct
    );

router.get('/seller/my-products', protect, restrictTo('seller'), productController.getSellerProducts);

router.route('/:id')
    .get(productController.getProduct)
    .put(
        protect,
        restrictTo('seller', 'admin'),
        validate(updateProductSchema),
        productController.updateProduct
    )
    .delete(
        protect,
        restrictTo('seller', 'admin'),
        productController.deleteProduct
    );

module.exports = router;
