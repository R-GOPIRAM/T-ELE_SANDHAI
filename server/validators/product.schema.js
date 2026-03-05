const { z } = require('zod');

const createProductSchema = z.object({
    body: z.object({
        name: z.string().min(2, 'Name must be at least 2 characters'),
        price: z.number().min(0, 'Price must be positive'),
        originalPrice: z.number().min(0).optional(),
        category: z.string().min(1, 'Category is required'),
        subcategory: z.string().optional(),
        description: z.string().min(10, 'Description must be at least 10 characters'),
        stock: z.number().min(0).default(0),
        images: z.array(z.string()).optional(),
        brand: z.string().optional(),
        isAvailable: z.boolean().optional(),
        features: z.array(z.string()).optional(),
        specifications: z.record(z.string()).optional(),
    }),
});

const updateProductSchema = z.object({
    params: z.object({
        id: z.string(),
    }),
    body: z.object({
        name: z.string().min(2).optional(),
        price: z.number().min(0).optional(),
        originalPrice: z.number().min(0).optional(),
        category: z.string().optional(),
        subcategory: z.string().optional(),
        description: z.string().min(10).optional(),
        stock: z.number().min(0).optional(),
        images: z.array(z.string()).optional(),
        brand: z.string().optional(),
        isAvailable: z.boolean().optional(),
        features: z.array(z.string()).optional(),
        specifications: z.record(z.string()).optional(),
    }),
});

module.exports = {
    createProductSchema,
    updateProductSchema,
};
