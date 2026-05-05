const Product = require('../models/Product');

class ProductRepository {
    async create(data) {
        return await Product.create(data);
    }

    async findById(id) {
        return await Product.findById(id).populate('shopOwnerId', 'name email address').lean();
    }

    async update(id, data) {
        return await Product.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();
    }

    async delete(id) {
        return await Product.findByIdAndDelete(id);
    }

    async findAll(queryObj, page = 1, limit = 12, sort = '-createdAt') {
        const skip = (page - 1) * limit;

        // Execute queries in parallel
        const [products, total] = await Promise.all([
            Product.find(queryObj)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .populate('shopOwnerId', 'name')
                .lean(),
            Product.countDocuments(queryObj)
        ]);

        return { products, total };
    }

    async findBySeller(sellerId, page = 1, limit = 12) {
        const skip = (page - 1) * limit;
        const [products, total] = await Promise.all([
            Product.find({ shopOwnerId: sellerId })
                .sort('-createdAt')
                .skip(skip)
                .limit(limit)
                .lean(),
            Product.countDocuments({ shopOwnerId: sellerId })
        ]);
        return { products, total };
    }
}

module.exports = new ProductRepository();
