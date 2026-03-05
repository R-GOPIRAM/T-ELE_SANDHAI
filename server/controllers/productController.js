const ProductService = require('../services/productService');
const catchAsync = require('../utils/catchAsync');
const { sendResponse } = require('../utils/response');

exports.createProduct = catchAsync(async (req, res) => {
    const product = await ProductService.createProduct(req.body, req.user._id);
    return sendResponse(res, 201, true, 'Product created successfully', product);
});

exports.getProducts = catchAsync(async (req, res) => {
    const { products, total } = await ProductService.getProducts(req.query);
    return sendResponse(res, 200, true, 'Products fetched successfully', products, null, {
        count: products.length,
        total
    });
});

exports.getProduct = catchAsync(async (req, res) => {
    const product = await ProductService.getProduct(req.params.id);
    return sendResponse(res, 200, true, 'Product fetched successfully', product);
});

exports.updateProduct = catchAsync(async (req, res) => {
    const product = await ProductService.updateProduct(
        req.params.id,
        req.body,
        req.user._id.toString(),
        req.user.role
    );

    return sendResponse(res, 200, true, 'Product updated successfully', product);
});

exports.deleteProduct = catchAsync(async (req, res) => {
    await ProductService.deleteProduct(
        req.params.id,
        req.user._id.toString(),
        req.user.role
    );

    return sendResponse(res, 200, true, 'Product deleted successfully');
});

// Seller specific routes
exports.getSellerProducts = catchAsync(async (req, res) => {
    const sellerId = req.query.sellerId || req.user._id;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;

    const { products, total } = await ProductService.getSellerProducts(sellerId, page, limit);

    return sendResponse(res, 200, true, 'Seller products fetched successfully', products, null, {
        count: products.length,
        total,
        page,
        totalPages: Math.ceil(total / limit)
    });
});
