import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, ThumbsUp } from 'lucide-react';
import { motion } from 'framer-motion';
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
            <div className="space-y-8">
                {reviews.length === 0 && !showReviewForm && (
                    <div className="text-center py-20 bg-background/50 rounded-[2rem] border-2 border-dashed border-border/50">
                        <div className="w-20 h-20 bg-card rounded-3xl flex items-center justify-center mx-auto mb-6 text-text-secondary/20">
                            <Star className="w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-bold text-text-primary mb-2">No Reviews Yet</h3>
                        <p className="text-text-secondary font-medium max-w-xs mx-auto">Be the first to share your experience with this product and help others make a choice!</p>
                    </div>
                )}

                {reviews.map((review, idx) => (
                    <motion.div
                        key={review._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="group relative bg-background/30 hover:bg-background/50 p-6 rounded-[2rem] border border-transparent hover:border-border/50 transition-all duration-500"
                    >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-primary/10 to-primary/20 rounded-2xl flex items-center justify-center text-primary font-black text-xl shadow-inner border border-primary/10">
                                    {review.customerId.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-black text-text-primary uppercase tracking-tight text-lg">{review.customerId.name}</span>
                                        <div className="flex items-center gap-1 bg-success/10 px-2 py-0.5 rounded-full border border-success/20">
                                            <div className="w-1 h-1 bg-success rounded-full" />
                                            <span className="text-[9px] font-black text-success uppercase tracking-widest">Verified Purchase</span>
                                        </div>
                                    </div>
                                    <span className="text-xs text-text-secondary font-bold uppercase tracking-wider opacity-60">
                                        Posted {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center bg-card/80 backdrop-blur-sm self-start px-3 py-1.5 rounded-xl border border-border/50 shadow-sm">
                                <div className="flex gap-0.5">
                                    {renderStars(review.rating)}
                                </div>
                                <span className="ml-2 font-black text-text-primary text-xs">{review.rating}.0</span>
                            </div>
                        </div>

                        <div className="pl-0 sm:pl-[72px]">
                            <h4 className="font-black text-text-primary mb-2 text-xl uppercase tracking-tight leading-tight group-hover:text-primary transition-colors">{review.title}</h4>
                            <p className="text-text-secondary leading-relaxed text-base font-medium mb-6 opacity-90">{review.comment}</p>

                            <div className="flex items-center justify-between pt-6 border-t border-border/30">
                                <button className="flex items-center gap-2.5 text-xs text-text-secondary hover:text-primary transition-all font-black uppercase tracking-widest group/btn">
                                    <div className="p-2 bg-card rounded-lg group-hover/btn:bg-primary group-hover/btn:text-white transition-colors border border-border/50">
                                        <ThumbsUp className="w-4 h-4" />
                                    </div>
                                    Helpful ({review.helpfulVotes})
                                </button>

                                <div className="p-2 text-text-secondary/20 hover:text-danger cursor-pointer transition-colors opacity-0 group-hover:opacity-100">
                                    <MessageSquare className="w-4 h-4" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
