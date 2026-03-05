const { z } = require('zod');

const startBargainSchema = z.object({
    body: z.object({
        productId: z.string({ required_error: 'Product ID is required' }),
        offeredPrice: z.number({ required_error: 'Offered price is required' })
            .positive('Price must be positive'),
        message: z.string().optional()
    })
});

const sendMessageSchema = z.object({
    body: z.object({
        bargainId: z.string({ required_error: 'Bargain ID is required' }),
        message: z.string({ required_error: 'Message is required' })
            .min(1, 'Message cannot be empty')
            .max(500, 'Message too long'),
        offeredPrice: z.number().positive().optional()
    })
});

const updateStatusSchema = z.object({
    body: z.object({
        bargainId: z.string({ required_error: 'Bargain ID is required' }),
        status: z.enum(['accepted', 'rejected']),
        finalPrice: z.number().positive().optional() // Only for accepted
    })
});

module.exports = {
    startBargainSchema,
    sendMessageSchema,
    updateStatusSchema
};
