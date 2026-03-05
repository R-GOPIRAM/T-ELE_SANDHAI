import { Heart, ArrowLeft } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import ProductCard from '../products/ProductCard';
import Button from '../common/Button';
import { useCart } from '../../hooks/useCart';
import { Product } from '../../types';

interface WishlistPageProps {
    onPageChange: (page: string) => void;
}

export default function WishlistPage({ onPageChange }: WishlistPageProps) {
    const { wishlistItems, isLoading } = useWishlist();
    const { addToCart } = useCart();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => onPageChange('home')}
                            className="p-2 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                            <Heart className="w-8 h-8 text-pink-500 fill-current" />
                            My Wishlist
                        </h1>
                    </div>
                    <p className="text-gray-500 font-medium bg-white px-4 py-2 rounded-full border border-gray-100 shadow-sm">
                        {wishlistItems.length} {wishlistItems.length === 1 ? 'Item' : 'Items'}
                    </p>
                </div>

                {/* Content */}
                {wishlistItems.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-dashed border-gray-300 p-16 flex flex-col items-center justify-center text-center shadow-sm">
                        <div className="w-24 h-24 bg-pink-50 rounded-full flex items-center justify-center mb-6">
                            <Heart className="w-12 h-12 text-pink-300" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
                        <p className="text-gray-500 mb-8 max-w-md">
                            Save your favorite items here while shopping to easily find and purchase them later.
                        </p>
                        <Button size="lg" onClick={() => onPageChange('browse')} className="px-10 rounded-xl shadow-lg shadow-blue-500/20">
                            Start Shopping
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {wishlistItems.map((item) => {
                            // Map wishlist backend type to frontend Product type conceptually
                            const productObj: Product = {
                                id: item.product.id || item.product._id,
                                name: item.product.name,
                                price: item.product.price,
                                originalPrice: item.product.originalPrice,
                                images: item.product.images,
                                brand: item.product.brand,
                                rating: item.product.rating,
                                sellerName: item.product.sellerName,
                                description: '',
                                category: '',
                                stock: 10,
                                sellerId: '',
                                sellerLocation: '',
                                isAvailable: true,
                                createdAt: item.addedAt,
                                reviewCount: 0
                            };

                            return (
                                <ProductCard
                                    key={productObj.id}
                                    product={productObj}
                                    viewMode="grid"
                                    isSelected={false}
                                    onSelect={() => { }}
                                    onViewDetails={(id) => onPageChange(`product:${id}`)}
                                    showComparison={false}
                                    onAddToCart={addToCart}
                                />
                            );
                        })}
                    </div>
                )}

            </div>
        </div>
    );
}
