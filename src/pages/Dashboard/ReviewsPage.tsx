import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, Camera, Send, ArrowLeft, Filter, CheckCircle } from 'lucide-react';
import api from '../../services/apiClient';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useNavigate } from 'react-router-dom';

interface ReviewsPageProps {
  productId?: string;
}

interface Review {
  _id: string;
  id?: string;
  user: {
    _id: string;
    name: string;
  };
  product: {
    _id: string;
    name: string;
    images: string[];
  };
  rating: number;
  title: string;
  comment: string;
  images: string[];
  isVerifiedPurchase: boolean;
  helpfulVotes: number;
  createdAt: string;
}

interface PurchaseItem {
  productId: string;
  productName: string;
  orderId: string;
  image: string;
  sellerName: string;
}

export default function ReviewsPage({ productId }: ReviewsPageProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'write' | 'my-reviews' | 'product-reviews'>('write');
  const [reviews, setReviews] = useState<Review[]>([]); // For product-specific reviews
  const [myReviews, setMyReviews] = useState<Review[]>([]); // For user's reviews
  const [purchasedProducts, setPurchasedProducts] = useState<PurchaseItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [newReview, setNewReview] = useState({
    productId: productId || '',
    orderId: '',
    rating: 0,
    title: '',
    comment: '',
    images: [] as string[]
  });

  // Fetch data based on active tab
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      setLoading(true);
      try {
        if (activeTab === 'write') {
          // Fetch user's orders to find purchased products
          const response = await api.get('/orders/my-orders');
          const products: PurchaseItem[] = [];

          if (response.data && response.data.data) {
            response.data.data.forEach((order: { _id: string, items: Array<{ product: { _id: string, name: string, images?: string[] }, seller: { name: string } }> }) => {
              order.items.forEach((item) => {
                // Avoid duplicates
                if (!products.some(p => p.productId === item.product._id)) {
                  products.push({
                    productId: item.product._id,
                    productName: item.product.name,
                    orderId: order._id,
                    image: item.product.images?.[0] || '',
                    sellerName: item.seller.name
                  });
                }
              });
            });
          }
          setPurchasedProducts(products);
          if (productId && !newReview.productId) {
            setNewReview(prev => ({ ...prev, productId: productId }));
          }
        } else if (activeTab === 'my-reviews') {
          const response = await api.get('/reviews/my-reviews');
          setMyReviews(response.data.data || []);
        } else if (activeTab === 'product-reviews' && productId) {
          const response = await api.get(`/reviews/product/${productId}`);
          setReviews(response.data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, user, productId]);

  const handleRatingClick = (rating: number) => {
    setNewReview({ ...newReview, rating });
  };

  const handleSubmitReview = async () => {
    if (!newReview.rating || !newReview.title || !newReview.comment || !newReview.productId) {
      alert('Please fill in all required fields');
      return;
    }

    // Find orderId if not set (auto-select from purchased products)
    let orderId = newReview.orderId;
    if (!orderId) {
      const product = purchasedProducts.find(p => p.productId === newReview.productId);
      if (product) orderId = product.orderId;
    }

    try {
      await api.post('/reviews', {
        ...newReview,
        orderId
      });
      alert('Review submitted successfully!');
      // Reset form
      setNewReview({
        productId: '',
        orderId: '',
        rating: 0,
        title: '',
        comment: '',
        images: []
      });
      setActiveTab('my-reviews');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      console.error('Failed to submit review', error);
      alert(error.response?.data?.message || 'Failed to submit review');
    }
  };

  const handleImageUpload = (_e: React.ChangeEvent<HTMLInputElement>) => {
    alert("Image upload requires backend integration. Feature coming soon.");
  };

  const markHelpful = async (reviewId: string) => {
    try {
      await api.patch(`/reviews/${reviewId}/helpful`);
      // Update local state
      const updateReviews = (list: Review[]) => list.map(r =>
        r._id === reviewId || r.id === reviewId ? { ...r, helpfulVotes: r.helpfulVotes + 1 } : r
      );
      setReviews(prev => updateReviews(prev));
      setMyReviews(prev => updateReviews(prev));
    } catch (error) {
      console.error('Failed to mark helpful', error);
    }
  };

  const renderStars = (rating: number, interactive = false, size = 'w-5 h-5') => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => interactive && handleRatingClick(star)}
            className={`${size} ${star <= rating
              ? 'text-warning fill-current'
              : 'text-border'
              } ${interactive ? 'cursor-pointer hover:text-warning' : ''}`}
            disabled={!interactive}
          >
            <Star className="w-full h-full" />
          </button>
        ))}
      </div>
    );
  };

  const renderWriteReview = () => (
    <div className="bg-card rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold text-text-primary mb-6">Write a Review</h3>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="space-y-6">
          {/* Product Selection */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Select Product *
            </label>
            <select
              value={newReview.productId}
              onChange={(e) => setNewReview({ ...newReview, productId: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Choose a product you purchased</option>
              {purchasedProducts.map(product => (
                <option key={product.productId} value={product.productId}>
                  {product.productName} - {product.sellerName}
                </option>
              ))}
            </select>
            {purchasedProducts.length === 0 && (
              <p className="text-sm text-danger mt-1">You haven't purchased any products yet or they are not available for review.</p>
            )}
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Rating *
            </label>
            <div className="flex items-center space-x-2">
              {renderStars(newReview.rating, true, 'w-8 h-8')}
              <span className="text-sm text-text-secondary ml-3">
                {newReview.rating > 0 && `${newReview.rating} star${newReview.rating > 1 ? 's' : ''}`}
              </span>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Review Title *
            </label>
            <input
              type="text"
              value={newReview.title}
              onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Summarize your experience"
              maxLength={100}
            />
            <p className="text-xs text-text-secondary mt-1">{newReview.title.length}/100 characters</p>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Review Details *
            </label>
            <textarea
              rows={5}
              value={newReview.comment}
              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="What did you like or dislike? How was the quality?"
              maxLength={1000}
            />
            <p className="text-xs text-text-secondary mt-1">{newReview.comment.length}/1000 characters</p>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Add Photos (Optional)
            </label>
            <div className="border-2 border-dashed border-border rounded-lg p-4">
              <div className="text-center">
                <Camera className="w-8 h-8 text-text-secondary/50 mx-auto mb-2" />
                <div className="flex text-sm text-text-secondary">
                  <label htmlFor="review-images" className="relative cursor-pointer bg-card rounded-md font-medium text-primary hover:text-primary-hover">
                    <span>Upload photos</span>
                    <input
                      id="review-images"
                      name="review-images"
                      type="file"
                      multiple
                      accept="image/*"
                      className="sr-only"
                      onChange={handleImageUpload}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-text-secondary">PNG, JPG, GIF up to 5MB each (Max 5 images)</p>
              </div>

              {newReview.images.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-2">
                  {newReview.images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Review ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => setNewReview({
                          ...newReview,
                          images: newReview.images.filter((_, i) => i !== index)
                        })}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-danger text-white rounded-full flex items-center justify-center hover:bg-danger/80"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              variant="primary"
              onClick={handleSubmitReview}
              disabled={loading || purchasedProducts.length === 0 || !newReview.productId || !newReview.rating || !newReview.title || !newReview.comment}
            >
              <Send className="w-4 h-4 mr-2" />
              Submit Review
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  const renderReviewList = (reviewList: Review[], emptyMessage: string) => (
    <div className="space-y-6">
      {loading ? (
        <LoadingSpinner />
      ) : reviewList.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg shadow-md">
          <Star className="w-12 h-12 text-border mx-auto mb-3" />
          <p className="text-text-secondary">{emptyMessage}</p>
        </div>
      ) : (
        reviewList.map((review) => (
          <div key={review._id || review.id} className="bg-card rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {(review.user?.name || 'User').charAt(0)}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-text-primary">{review.user?.name || 'User'}</h4>
                  <div className="flex items-center text-xs text-text-secondary mt-1">
                    {review.isVerifiedPurchase && (
                      <span className="flex items-center text-seller mr-2">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified Purchase
                      </span>
                    )}
                    <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              {review.product && (
                <div className="text-sm text-text-secondary">
                  Product: <span className="font-medium text-text-primary">{review.product.name}</span>
                </div>
              )}
            </div>

            <div className="mb-4">
              <div className="flex items-center mb-2">
                {renderStars(review.rating)}
                <h3 className="ml-3 text-lg font-semibold text-text-primary">{review.title}</h3>
              </div>
              <p className="text-text-secondary whitespace-pre-line">{review.comment}</p>
            </div>

            {review.images && review.images.length > 0 && (
              <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
                {review.images.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`Review ${index + 1}`}
                    className="w-20 h-20 object-cover rounded-lg border border-border"
                  />
                ))}
              </div>
            )}

            <div className="flex items-center space-x-4 pt-4 border-t border-border">
              <button
                onClick={() => markHelpful(review._id || review.id!)}
                className="flex items-center text-sm text-text-secondary hover:text-primary transition-colors"
              >
                <ThumbsUp className="w-4 h-4 mr-1" />
                Helpful ({review.helpfulVotes})
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-card rounded-lg shadow-md p-8">
            <Star className="w-16 h-16 text-border mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-text-primary mb-4">Please Sign In</h2>
            <p className="text-text-secondary mb-6">You need to be logged in to write and view reviews.</p>
            <Button onClick={() => navigate('/login')}>
              Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => navigate('/products')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Shopping
          </Button>
          <h1 className="text-3xl font-bold text-text-primary mb-2">Customer Reviews</h1>
          <p className="text-text-secondary">Share your experience and help others make better choices</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg shadow-md overflow-hidden">
              <nav className="flex flex-col">
                <button
                  onClick={() => setActiveTab('write')}
                  className={`px-4 py-3 text-left font-medium flex items-center ${activeTab === 'write'
                    ? 'bg-primary/10 text-primary border-l-4 border-primary'
                    : 'text-text-secondary hover:bg-background hover:text-text-primary'
                    }`}
                >
                  <Star className="w-5 h-5 mr-3" />
                  Write a Review
                </button>
                <button
                  onClick={() => setActiveTab('my-reviews')}
                  className={`px-4 py-3 text-left font-medium flex items-center ${activeTab === 'my-reviews'
                    ? 'bg-primary/10 text-primary border-l-4 border-primary'
                    : 'text-text-secondary hover:bg-background hover:text-text-primary'
                    }`}
                >
                  <ThumbsUp className="w-5 h-5 mr-3" />
                  My Reviews
                </button>
                {productId && (
                  <button
                    onClick={() => setActiveTab('product-reviews')}
                    className={`px-4 py-3 text-left font-medium flex items-center ${activeTab === 'product-reviews'
                      ? 'bg-primary/10 text-primary border-l-4 border-primary'
                      : 'text-text-secondary hover:bg-background hover:text-text-primary'
                      }`}
                  >
                    <Filter className="w-5 h-5 mr-3" />
                    Product Reviews
                  </button>
                )}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'write' && renderWriteReview()}
            {activeTab === 'my-reviews' && renderReviewList(myReviews, "You haven't written any reviews yet.")}
            {activeTab === 'product-reviews' && renderReviewList(reviews, "No reviews for this product yet.")}
          </div>
        </div>
      </div>
    </div>
  );
}