const { z } = require('zod');

const createOrderSchema = z.object({
    body: z.object({
        amount: z.number().min(1, 'Amount must be at least 1'),
    }),
});

const verifyPaymentSchema = z.object({
    body: z.object({
        razorpay_order_id: z.string().min(1, 'Razorpay Order ID is required'),
        razorpay_payment_id: z.string().optional(),
        razorpay_signature: z.string().optional(),
        orderData: z.object({
            items: z.array(z.any()).min(1),
            shippingAddress: z.object({
                street: z.string().min(1),
                city: z.string().min(1),
                state: z.string().min(1),
                zipCode: z.string().min(1),
                country: z.string().min(1),
                phone: z.string().min(10),
            }),
            totalAmount: z.number().min(1),
        })
    }),
});

module.exports = {
    createOrderSchema,
    verifyPaymentSchema
};
