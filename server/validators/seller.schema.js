const { z } = require('zod');

const registerSellerSchema = z.object({
    body: z.object({
        businessName: z.string().min(2, 'Business Name is required'),
        businessAddress: z.string().min(5, 'Business Address is required'),
        businessPhone: z.string().min(10, 'Business Phone is required'),
        panNumber: z.string().min(10, 'Valid PAN Number is required'),
        businessCategory: z.string().min(2, 'Business Category is required'),
        businessDescription: z.string().optional(),
    }),
    // Note: file uploads (req.files) are handled by multer, not zod directly.
});

const verifySellerSchema = z.object({
    body: z.object({
        status: z.enum(['approved', 'rejected', 'pending']),
        reason: z.string().optional(),
    }),
    params: z.object({
        id: z.string().min(1, 'Seller ID is required'),
    }),
});

module.exports = {
    registerSellerSchema,
    verifySellerSchema
};
