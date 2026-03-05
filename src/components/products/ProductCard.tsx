import React, { useState } from 'react';
import { MapPin, Star, ShoppingCart, Check, Heart, Zap, Clock } from 'lucide-react';
import { Product } from '../../types';
import BargainModal from '../common/BargainModal';
import { useWishlist } from '../../context/WishlistContext';

interface ProductCardProps {
  product: Product;
  variants?: Product[];
  viewMode: 'grid' | 'list';
  isSelected: boolean;
  onSelect: () => void;
  onViewDetails?: (id: string) => void;
  onAddToCart: (product: Product) => void;
  showComparison: boolean;
}

export default function ProductCard({
  product,
  variants = [],
  viewMode,
  isSelected,
  onSelect,
  onViewDetails,
  onAddToCart,
  showComparison
}: ProductCardProps) {
  const [isBargainModalOpen, setIsBargainModalOpen] = useState(false);
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

  const minPrice = variants.length > 0 ? Math.min(...variants.map(v => v.price)) : product.price;
  const maxPrice = variants.length > 0 ? Math.max(...variants.map(v => v.price)) : product.price;
  const priceRange = minPrice !== maxPrice;

  // Fallback ID to support robust Mongo mapping
  const secureId = product.id || (product as any)._id;
  const isWishlisted = isInWishlist(secureId);

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isWishlisted) {
      removeFromWishlist(secureId);
    } else {
      addToWishlist(secureId);
    }
  };

  const discountPercentage = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  if (viewMode === 'list') {
    return (
      <div
        className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 hover:shadow-2xl hover:-translate-y-1.5 transform transition-all duration-500 ease-out group cursor-pointer relative"
        onClick={() => onViewDetails?.(secureId)}
      >
        <div className="flex space-x-6">
          <div className="relative overflow-hidden rounded-2xl w-40 h-40 bg-gray-50 flex-shrink-0">
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
            />
            {discountPercentage > 0 && (
              <div className="absolute top-2 left-2 bg-gradient-to-r from-pink-500 to-orange-400 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-md shadow-pink-500/20">
                {discountPercentage}% OFF
              </div>
            )}
            <button
              onClick={handleWishlistToggle}
              className="absolute top-2 right-2 p-2 bg-white/80 backdrop-blur-md rounded-full text-gray-400 hover:text-red-500 transition-colors shadow-sm"
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
            </button>

            {showComparison && (
              <button
                onClick={(e) => { e.stopPropagation(); onSelect(); }}
                className={`absolute bottom-2 left-2 w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-white border-gray-300'
                  }`}
              >
                {isSelected && <Check className="w-4 h-4" />}
              </button>
            )}
          </div>

          <div className="flex-1 flex flex-col">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">{product.name}</h3>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-gray-500 text-sm font-medium">{product.brand}</span>
                  <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                  <div className="flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                    <Star className="w-3.5 h-3.5 text-green-600 fill-current" />
                    <span className="text-xs font-bold text-green-700">
                      {product.rating} <span className="text-green-600/60 font-medium">({product.reviewCount})</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-extrabold text-gray-900">
                  {priceRange ? `₹${minPrice} - ₹${maxPrice}` : `₹${product.price}`}
                </div>
                {product.originalPrice && (
                  <div className="text-sm text-gray-400 line-through font-medium">
                    ₹{product.originalPrice}
                  </div>
                )}
              </div>
            </div>

            <p className="text-gray-500 text-sm mt-2 line-clamp-2 leading-relaxed">{product.description}</p>

            <div className="mt-auto pt-4 flex items-center justify-between relative z-10">
              <div className="flex flex-col gap-1">
                <div className="flex items-center text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md w-max">
                  <Clock className="w-3.5 h-3.5 mr-1" />
                  Delivery in 30 mins
                </div>
                <div className="flex items-center text-xs text-gray-500 font-medium">
                  <MapPin className="w-3.5 h-3.5 mr-1" />
                  Sold by <span className="font-bold text-gray-800 ml-1">{product.sellerName}</span>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                    setIsBargainModalOpen(true);
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-50 to-blue-50 text-blue-600 font-bold rounded-xl hover:from-indigo-100 hover:to-blue-100 transition-colors border border-blue-100/50 shadow-sm"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  Make Offer
                </button>
                <button
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                    onAddToCart(product);
                  }}
                  className="flex items-center justify-center gap-2 px-6 py-2 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-colors shadow-lg shadow-gray-900/20"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid View
  return (
    <div
      className="bg-white rounded-3xl shadow-sm border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transform transition-all duration-500 ease-out overflow-hidden group flex flex-col h-full cursor-pointer relative"
      onClick={() => onViewDetails?.(secureId)}
    >
      <div className="relative overflow-hidden w-full pt-[85%] bg-gray-50 p-6">
        <img
          src={product.images[0]}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-contain p-6 mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
        />

        {/* Badges Overlay */}
        {discountPercentage > 0 && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-pink-500 to-orange-400 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md shadow-pink-500/20">
            {discountPercentage}% OFF
          </div>
        )}

        <button
          onClick={handleWishlistToggle}
          className="absolute top-3 right-3 p-2.5 bg-white/80 backdrop-blur-md rounded-full text-gray-400 hover:text-red-500 hover:bg-white transition-all shadow-sm"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
        </button>

        {showComparison && (
          <button
            onClick={(e) => { e.stopPropagation(); onSelect(); }}
            className={`absolute bottom-3 left-3 w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected
              ? 'bg-blue-600 border-blue-600 text-white'
              : 'bg-white border-gray-300'
              }`}
          >
            {isSelected && <Check className="w-4 h-4" />}
          </button>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col bg-white">
        <h3 className="font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-1 text-lg">{product.name}</h3>

        <div className="flex items-center justify-between mb-3">
          <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">{product.brand}</p>
          <div className="flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
            <Star className="w-3 h-3 text-green-600 fill-current" />
            <span className="text-xs font-bold text-green-700">
              {product.rating}
            </span>
          </div>
        </div>

        <div className="mb-4 flex items-end gap-2">
          <div className="text-2xl font-extrabold text-gray-900">
            {priceRange ? `₹${minPrice} - ₹${maxPrice}` : `₹${product.price}`}
          </div>
          {product.originalPrice && (
            <div className="text-sm text-gray-400 line-through font-medium mb-1">
              ₹{product.originalPrice}
            </div>
          )}
        </div>

        <div className="mt-auto pt-4 border-t border-gray-50 flex flex-col gap-3 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-xs font-bold text-blue-600 bg-blue-50/50 px-2 py-1 rounded-md">
              <Clock className="w-3.5 h-3.5 mr-1" />
              30 mins
            </div>
            <div className="flex items-center text-xs text-gray-500 font-medium">
              <MapPin className="w-3.5 h-3.5 mr-0.5" />
              {product.sellerName}
            </div>
          </div>

          <div className="flex space-x-2 w-full">
            <button
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation();
                setIsBargainModalOpen(true);
              }}
              className="flex-1 flex flex-col items-center justify-center py-2 bg-gray-50 text-gray-700 font-bold rounded-xl hover:bg-gray-100 hover:text-blue-600 transition-colors"
            >
              <Zap className="w-4 h-4 mb-0.5 fill-current opacity-70" />
              <span className="text-[10px] uppercase tracking-wider">Offer</span>
            </button>
            <button
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation();
                onAddToCart(product);
              }}
              className="flex-[2] flex items-center justify-center gap-2 py-2 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-colors shadow-lg shadow-gray-900/20"
            >
              <ShoppingCart className="w-4 h-4" />
              Add to Cart
            </button>
          </div>
        </div>
      </div>

      <BargainModal
        isOpen={isBargainModalOpen}
        onClose={() => setIsBargainModalOpen(false)}
        productLine={{
          productId: secureId,
          productName: product.name,
          originalPrice: product.originalPrice || product.price,
          sellerId: product.sellerId || '',
          image: product.images[0]
        }}
      />
    </div>
  );
}