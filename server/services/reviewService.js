const ReviewRepository = require('../repositories/reviewRepository');
const AppError = require('../utils/AppError');

class ReviewService {
    async createReview(customerId, reviewData) {
        const { productId, rating, title, comment, images } = reviewData;

        // Check if review already exists for this exact product by this user
        const existingReview = await ReviewRepository.findByProductAndUser(productId, customerId);

        if (existingReview) {
            throw new AppError('You have already reviewed this product', 400);
        }

        const review = await ReviewRepository.create({
            productId,
            customerId,
            rating,
            title,
            comment,
            images: images || []
        });

        return review;
    }

    async getProductReviews(productId, queryParams) {
        const { page = 1, limit = 10, sortBy = 'newest' } = queryParams;

        let sortObj = {};
        switch (sortBy) {
            case 'oldest':
                sortObj.createdAt = 1;
                break;
            case 'rating-high':
                sortObj.rating = -1;
                break;
            case 'rating-low':
                sortObj.rating = 1;
                break;
            case 'helpful':
                sortObj.helpfulVotes = -1;
                break;
            default:
                sortObj.createdAt = -1;
        }

        const { reviews, total } = await ReviewRepository.findApprovedByProduct(productId, page, limit, sortObj);
        const ratingStats = await ReviewRepository.getRatingDistribution(productId);

        return {
            reviews,
            totalPages: Math.ceil(total / limit),
            currentPage: Number(page),
            total,
            ratingStats
        };
    }

    async getMyReviews(customerId) {
        return await ReviewRepository.findByUser(customerId);
    }

    async markHelpful(reviewId) {
        const review = await ReviewRepository.findById(reviewId);
        if (!review) {
            throw new AppError('Review not found', 404);
        }

        review.helpfulVotes += 1;
        await review.save();
        return review;
    }
}

module.exports = new ReviewService();
