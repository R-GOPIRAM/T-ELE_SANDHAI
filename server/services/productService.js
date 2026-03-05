const ProductRepository = require('../repositories/productRepository');
const AppError = require('../utils/AppError');

class ProductService {
    async createProduct(data, userId) {
        return await ProductRepository.create({ ...data, shopOwnerId: userId });
    }

    async getProduct(id) {
        const product = await ProductRepository.findById(id);
        if (!product) {
            throw new AppError('Product not found', 404);
        }
        return product;
    }

    async updateProduct(id, data, userId, role) {
        const product = await ProductRepository.findById(id);
        if (!product) {
            throw new AppError('Product not found', 404);
        }

        // Check ownership
        if (product.shopOwnerId._id.toString() !== userId && role !== 'admin') {
            throw new AppError('You are not authorized to update this product', 403);
        }

        return await ProductRepository.update(id, data);
    }

    async deleteProduct(id, userId, role) {
        const product = await ProductRepository.findById(id);
        if (!product) {
            throw new AppError('Product not found', 404);
        }

        // Check ownership
        if (product.shopOwnerId._id.toString() !== userId && role !== 'admin') {
            throw new AppError('You are not authorized to delete this product', 403);
        }

        return await ProductRepository.delete(id);
    }

    async getProducts(queryParams) {
        const {
            page = 1,
            limit = 12,
            sort,
            category,
            search,
            minPrice,
            maxPrice,
            rating
        } = queryParams;

        // Build filter object
        const filter = { isAvailable: true };

        if (category) {
            filter.category = new RegExp(`^${category}$`, 'i');
        }

        if (search) {
            filter.$text = { $search: search };
        }

        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }

        if (rating) {
            filter.rating = { $gte: Number(rating) };
        }

        // Determine sort
        let sortBy = '-createdAt'; // Default
        if (sort) {
            const sortMap = {
                'price-low': 'price',
                'price-high': '-price',
                'rating': '-rating',
                'newest': '-createdAt'
            };
            sortBy = sortMap[sort] || '-createdAt';
        }

        return await ProductRepository.findAll(filter, Number(page), Number(limit), sortBy);
    }

    async getSellerProducts(sellerId, page = 1, limit = 12) {
        return await ProductRepository.findBySeller(sellerId, page, limit);
    }
}

module.exports = new ProductService();
