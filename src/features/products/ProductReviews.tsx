import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, ThumbsUp } from 'lucide-react';
import api from '../../services/apiClient';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';

interface Review {
    _id: string;
    rating: number;
    title: string;
    comment: string;
    customerId: { name: string; _id: string };
    createdAt: string;
    helpfulVotes: number;
}

interface ProductReviewsProps {
    productId: string;
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
    const { user } = useAuth();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalReviews, setTotalReviews] = useState(0);

    // Form State
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [newRating, setNewRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [newTitle, setNewTitle] = useState('');
    const [newComment, setNewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchReviews = React.useCallback(async () => {
        try {
            const { data } = await api.get(`/reviews/${productId}`);
            setReviews(data.reviews);
            setTotalReviews(data.total);
            // setRatingStats(data.ratingStats);
        } catch (error) {
            console.error('Failed to fetch reviews', error);
        } finally {
            setLoading(false);
        }
    }, [productId]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            toast.error('Please login to leave a review.');
            return;
        }
        if (newRating === 0) {
            toast.error('Please select a star rating.');
            return;
        }

        setSubmitting(true);
        try {
            await api.post('/reviews', {
                productId,
                rating: newRating,
                title: newTitle,
                comment: newComment
            });
            toast.success('Review submitted successfully!');
            setShowReviewForm(false);
            setNewRating(0);
            setNewTitle('');
            setNewComment('');
            fetchReviews(); // Refresh the reviews list
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            toast.error(error.response?.data?.message || 'Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    const renderStars = (rating: number) => {
        return [...Array(5)].map((_, i) => (
            <Star
                key={i}
                className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`}
            />
        ));
    };

    if (loading) return <div className="animate-pulse h-32 bg-background rounded-2xl w-full"></div>;

    return (
        <div className="bg-card rounded-3xl shadow-sm border border-border p-8 mt-8">
            <div className="flex items-center gap-2 mb-8 border-b border-border pb-4">
                <MessageSquare className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-text-primary">Customer Reviews</h2>
                <span className="bg-background text-text-secondary px-3 py-1 rounded-full text-sm font-bold ml-2">
                    {totalReviews}
                </span>
            </div>

            {!showReviewForm && (
                <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                    <div className="text-center sm:text-left">
                        <h3 className="text-lg font-bold text-text-primary">Share your thoughts</h3>
                        <p className="text-text-secondary text-sm mt-1">If you've bought this product, let others know what you think.</p>
                    </div>
                    <Button onClick={() => setShowReviewForm(true)} className="w-full sm:w-auto px-8 rounded-xl bg-blue-600 hover:bg-blue-700">
                        Write a Review
                    </Button>
                </div>
            )}

            {showReviewForm && (
                <form onSubmit={handleSubmitReview} className="mb-10 bg-background p-6 rounded-2xl border border-border">
                    <h3 className="text-xl font-bold text-text-primary mb-4">Write a Review</h3>

                    <div className="mb-6">
                        <label className="block text-sm font-bold text-text-secondary mb-2">Overall Rating *</label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    type="button"
                                    key={star}
                                    onClick={() => setNewRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    className="p-1 focus:outline-none transition-transform hover:scale-110"
                                >
                                    <Star
                                        className={`w-8 h-8 ${star <= (hoverRating || newRating)
                                            ? 'text-yellow-400 fill-yellow-400'
                                            : 'text-text-secondary/30'
                                            } transition-colors duration-200`}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-bold text-text-secondary mb-2">Review Title *</label>
                        <input
                            type="text"
                            required
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            placeholder="Give a short summary of your review"
                            className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow outline-none"
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-bold text-text-secondary mb-2">Detailed Review *</label>
                        <textarea
                            required
                            rows={4}
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="What did you like or dislike? What should other buyers know?"
                            className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow outline-none resize-none"
                        ></textarea>
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={() => setShowReviewForm(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={submitting}>
                            {submitting ? 'Submitting...' : 'Submit Review'}
                        </Button>
                    </div>
                </form>
            )}

            {/* Review List */}
            <div className="space-y-6">
                {reviews.length === 0 && !showReviewForm && (
                    <div className="text-center py-10 bg-background rounded-2xl border border-dashed border-border">
                        <Star className="w-12 h-12 text-text-secondary/30 mx-auto mb-3" />
                        <p className="text-text-secondary font-medium">No reviews yet. Be the first to review this product!</p>
                    </div>
                )}

                {reviews.map((review) => (
                    <div key={review._id} className="border-b border-border pb-6 last:border-0 last:pb-0">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-lg">
                                {review.customerId.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <span className="font-bold text-text-primary block leading-tight">{review.customerId.name}</span>
                                <span className="text-xs text-text-secondary">{new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            </div>
                        </div>

                        <div className="flex gap-1 mb-3">
                            {renderStars(review.rating)}
                        </div>

                        <h4 className="font-bold text-text-primary mb-1 text-lg">{review.title}</h4>
                        <p className="text-text-secondary leading-relaxed">{review.comment}</p>

                        <div className="mt-4 flex items-center gap-2">
                            <button className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-blue-600 transition-colors font-medium border border-border px-3 py-1.5 rounded-full hover:bg-blue-50">
                                <ThumbsUp className="w-4 h-4" />
                                Helpful ({review.helpfulVotes})
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
