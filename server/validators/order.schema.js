const { z } = require('zod');

const createOrderSchema = z.object({
    body: z.object({
        items: z.array(z.object({
            product: z.string(),
            quantity: z.number().min(1),
        })).min(1, 'Order must contain at least one item'),
        shippingAddress: z.object({
            street: z.string().min(1),
            city: z.string().min(1),
            state: z.string().min(1),
            zipCode: z.string().min(1),
            country: z.string().min(1),
            phone: z.string().min(10),
        }),
        paymentInfo: z.object({
            id: z.string().optional(),
            status: z.string().optional(),
            method: z.enum(['card', 'upi', 'cod']),
        }),
    }),
});

const createPaymentSchema = z.object({
    body: z.object({
        amount: z.number().min(1),
        currency: z.string().default('INR'),
    }),
});

module.exports = {
    createOrderSchema,
    createPaymentSchema
};
