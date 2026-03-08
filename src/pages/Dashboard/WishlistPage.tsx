import { Heart, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../../components/ui/EmptyState';
import { useWishlist } from '../../context/WishlistContext';
import ProductCard from '../../features/products/ProductCard';
import { Product } from '../../types';

interface WishlistApiItem {
    product: {
        id?: string;
        _id?: string;
        name: string;
        price: number;
        originalPrice?: number;
        images: string[];
        brand: string;
        rating: number;
        sellerName: string;
        description?: string;
        category?: string;
        stock?: number;
        sellerId?: string;
        sellerLocation?: string;
        isAvailable?: boolean;
        features?: string[];
        specifications?: Record<string, string>;
        reviewCount?: number;
    };
    addedAt: string;
}

export default function WishlistPage() {
    const { wishlistItems, isLoading } = useWishlist();
    const navigate = useNavigate();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-danger"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background font-sans py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/')}
                            className="p-2 bg-card rounded-xl shadow-sm hover:shadow-md transition-shadow border border-border"
                        >
                            <ArrowLeft className="w-5 h-5 text-text-secondary" />
                        </button>
                        <h1 className="text-3xl font-extrabold text-text-primary flex items-center gap-3">
                            <Heart className="w-8 h-8 text-danger fill-current" />
                            My Wishlist
                        </h1>
                    </div>
                    <p className="text-text-secondary font-medium bg-card px-4 py-2 rounded-full border border-border shadow-sm">
                        {wishlistItems.length} {wishlistItems.length === 1 ? 'Item' : 'Items'}
                    </p>
                </div>

                {/* Content */}
                {wishlistItems.length === 0 ? (
                    <div className="bg-card rounded-3xl border border-border p-12 shadow-sm">
                        <EmptyState
                            title="Wishlist is Empty"
                            description="Save your favorite local items here while shopping to easily find and purchase them later. Support your neighborhood artisans!"
                            icon={Heart}
                            actionText="Start Exploring"
                            onAction={() => navigate('/products')}
                            illustrationColor="danger"
                        />
                    </div>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        {wishlistItems.map((item: WishlistApiItem) => {
                            const p = item.product;
                            const productObj: Product = {
                                id: p.id || p._id || '',
                                name: p.name,
                                price: p.price,
                                originalPrice: p.originalPrice,
                                images: p.images,
                                brand: p.brand,
                                rating: p.rating,
                                sellerName: p.sellerName,
                                description: p.description || '',
                                category: p.category || '',
                                stock: p.stock || 10,
                                sellerId: p.sellerId || '',
                                sellerLocation: p.sellerLocation || '',
                                isAvailable: p.isAvailable ?? true,
                                features: p.features || [],
                                specifications: p.specifications || {},
                                createdAt: item.addedAt,
                                updatedAt: item.addedAt,
                                reviewCount: p.reviewCount || 0
                            };

                            return (
                                <ProductCard
                                    key={productObj.id}
                                    product={productObj}
                                />
                            );
                        })}
                    </div>
                )}

            </div>
        </div>
    );
}
