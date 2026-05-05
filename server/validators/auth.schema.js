const { z } = require('zod');

const registerCustomerSchema = z.object({
    body: z.object({
        name: z.string().min(2, 'Name must be at least 2 characters'),
        email: z.string().email('Invalid email address'),
        password: z.string()
            .min(8, 'Password must be at least 8 characters')
            .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
            .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
            .regex(/[0-9]/, 'Password must contain at least one number')
            .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
        role: z.literal('customer').optional().default('customer'),
    }),
});

const registerSellerSchema = z.object({
    body: z.object({
        name: z.string().min(2, 'Name must be at least 2 characters'),
        email: z.string().email('Invalid email address'),
        password: z.string()
            .min(8, 'Password must be at least 8 characters')
            .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
            .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
            .regex(/[0-9]/, 'Password must contain at least one number')
            .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
        role: z.literal('seller').optional().default('seller'),
        // Seller onboarding is multi-step; allow initial signup with minimal fields.
        businessName: z.string().min(2, 'Business Name is required').optional(),
        businessAddress: z.string().min(5, 'Business Address is required').optional(),
        phone: z.string().min(10, 'Valid Phone Number is required').optional(),
        panNumber: z.string().length(10, 'Valid PAN Number is required').optional()
    }),
});

const signupSchema = z.object({
    body: z.object({
        name: z.string().min(2, 'Name must be at least 2 characters'),
        email: z.string().email('Invalid email address'),
        password: z.string()
            .min(8, 'Password must be at least 8 characters')
            .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
            .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
            .regex(/[0-9]/, 'Password must contain at least one number')
            .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
        role: z.enum(['customer', 'seller']).optional().default('customer'),
        businessName: z.string().min(2, 'Business Name is required').optional(),
        businessAddress: z.string().min(5, 'Business Address is required').optional(),
        phone: z.string().min(10, 'Valid Phone Number is required').optional(),
        panNumber: z.string().length(10, 'Valid PAN Number is required').optional()
    })
});

const loginSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email address'),
        password: z.string().min(6, 'Password is required'),
    }),
});

const updateProfileSchema = z.object({
    body: z.object({
        name: z.string().min(2, 'Name must be at least 2 characters').optional(),
        phone: z.string().optional(),
        address: z.object({
            street: z.string().optional(),
            city: z.string().optional(),
            state: z.string().optional(),
            zipCode: z.string().optional(),
            country: z.string().optional(),
        }).optional(),
    }),
});

module.exports = {
    registerCustomerSchema,
    registerSellerSchema,
    signupSchema,
    loginSchema,
    updateProfileSchema,
};
