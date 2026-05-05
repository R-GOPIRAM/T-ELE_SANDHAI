const { z } = require('zod');

const addToCartSchema = z.object({
    body: z.object({
        productId: z.string({
            required_error: 'Product ID is required',
        }),
        quantity: z.number({
            required_error: 'Quantity is required',
        }).int().positive('Quantity must be a positive integer'),
    }),
});

const updateQuantitySchema = z.object({
    body: z.object({
        quantity: z.number({
            required_error: 'Quantity is required',
        }).int().positive('Quantity must be a positive integer'),
    }),
    params: z.object({
        productId: z.string({
            required_error: 'Product ID is required',
        }),
    }),
});

module.exports = {
    addToCartSchema,
    updateQuantitySchema,
};
