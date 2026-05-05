const { z } = require('zod');

const createReviewSchema = z.object({
    body: z.object({
        product: z.string().min(1, 'Product ID is required'),
        rating: z.number().min(1).max(5, 'Rating must be between 1 and 5'),
        title: z.string().min(1, 'Title is required'),
        comment: z.string().min(1, 'Comment is required'),
    }),
});

const markHelpfulSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'Review ID is required'),
    }),
});

module.exports = {
    createReviewSchema,
    markHelpfulSchema
};
