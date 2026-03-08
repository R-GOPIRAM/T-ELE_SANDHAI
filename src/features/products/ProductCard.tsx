import React, { useState } from 'react';
import { Star, Check, Heart, MessageSquare, Store, ShieldCheck } from 'lucide-react';
import { Product } from '../../types';
import BargainModal from '../bargain/BargainModal';
import { useWishlist } from '../../context/WishlistContext';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

import { useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';

interface ProductCardProps {
  product: Product;
  variants?: Product[];
  viewMode?: 'grid' | 'list';
  isSelected?: boolean;
  onSelect?: () => void;
  showComparison?: boolean;
}

const ProductCard = React.memo(({
  product,
  variants = [],
  viewMode = 'grid',
  isSelected = false,
  onSelect,
  showComparison = false
}: ProductCardProps) => {
  const [isBargainModalOpen, setIsBargainModalOpen] = useState(false);
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const minPrice = variants.length > 0 ? Math.min(...variants.map(v => v.price)) : product.price;
  const maxPrice = variants.length > 0 ? Math.max(...variants.map(v => v.price)) : product.price;
  const hasPriceRange = minPrice !== maxPrice;
  const displayPrice = hasPriceRange ? `₹${minPrice} - ₹${maxPrice}` : `₹${product.price}`;

  const secureId = product.id || (product as { _id?: string })._id || '';
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

  const isBargainable = (product as { isBargainable?: boolean }).isBargainable;

  return (
    <>
      <Card
        onClick={() => navigate(`/product/${secureId}`)}
        className={`cursor-pointer group flex card-hover-lift overflow-hidden relative ${viewMode === 'list' ? 'flex-row items-center h-48' : 'flex-col h-full'}`}
      >
        {/* ... (rest of the component) */}
        {/* Image Container */}
        <div className={`relative bg-background p-6 flex flex-shrink-0 items-center justify-center ${viewMode === 'list' ? 'w-48 h-full border-r border-border' : 'w-full h-56 rounded-t-xl overflow-hidden'}`}>
          <img src={product.images[0]} alt={product.name} className="max-w-full max-h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500" />

          {/* Badges Overlay */}
          <div className="absolute top-3 left-3 flex flex-col gap-2 z-10 w-full items-start pointer-events-none">
            {discountPercentage > 0 && (
              <Badge variant="danger" className="shadow-md px-2 py-0.5 text-xs">
                {discountPercentage}% OFF
              </Badge>
            )}
            {isBargainable && (
              <Badge variant="bargain" className="shadow-md px-2 py-0.5 text-xs flex items-center gap-1">
                <MessageSquare className="w-3 h-3" /> Bargainable
              </Badge>
            )}
          </div>

          <button
            onClick={handleWishlistToggle}
            className="absolute top-3 right-3 p-2 bg-card/80 backdrop-blur-md rounded-full text-text-secondary hover:text-danger hover:bg-card transition-all shadow-sm z-20"
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-danger text-danger' : ''}`} />
          </button>

          {showComparison && onSelect && (
            <button
              onClick={(e) => { e.stopPropagation(); onSelect(); }}
              className={`absolute bottom-3 left-3 w-6 h-6 rounded-full border-2 flex items-center justify-center z-20 ${isSelected
                ? 'bg-primary border-primary text-white'
                : 'bg-card border-border'
                }`}
            >
              {isSelected && <Check className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Content Container */}
        <CardContent className={`flex-1 flex flex-col bg-background/30 w-full ${viewMode === 'list' ? 'p-6' : 'p-5 border-t border-border'}`}>
          <div className="flex items-start justify-between mb-2">
            <h3 className={`font-bold text-text-primary ${viewMode === 'list' ? 'text-xl' : 'text-lg leading-tight'} line-clamp-2`}>{product.name}</h3>
          </div>

          <div
            className="flex items-center text-sm font-medium transition-colors mb-3 text-primary hover:text-primary-hover cursor-pointer"
            onClick={(e) => {
              if (product.sellerId) {
                e.stopPropagation();
                navigate(`/store/${product.sellerId}`);
              }
            }}
          >
            <Store className="w-4 h-4 mr-1.5" />
            <span className="truncate">{product.sellerName || 'Local Retailer'}</span>
            <ShieldCheck className="w-4 h-4 ml-1.5 text-seller" />
          </div>

          <div className="flex items-center gap-1 mb-auto">
            <Star className="w-4 h-4 text-warning fill-current" />
            <span className="text-sm font-bold text-text-primary">{product.rating || 'New'}</span>
            <span className="text-xs text-text-secondary">({product.reviewCount || 0})</span>
          </div>

          <div className="flex flex-wrap items-end justify-between mt-4 gap-2">
            <div>
              {product.originalPrice && <span className="text-sm text-text-secondary line-through block mb-0.5">₹{product.originalPrice}</span>}
              <span className="text-2xl font-extrabold text-text-primary tracking-tight">{displayPrice}</span>
            </div>
          </div>

          {/* Action Matrix */}
          <div className={`flex gap-2 mt-4 z-20 relative pt-2 ${viewMode === 'list' ? 'max-w-xs' : ''}`}>
            {isBargainable ? (
              <Button size="sm" variant="bargain" className="flex-1 shadow-none" onClick={(e) => { e.stopPropagation(); setIsBargainModalOpen(true); }}>
                Make Offer
              </Button>
            ) : (
              <Button size="sm" variant="primary" className="flex-1 shadow-none" onClick={(e) => { e.stopPropagation(); addToCart(product, 1); }}>
                Add to Cart
              </Button>
            )}
            <Button size="sm" variant="outline" className="flex-1 shadow-none bg-background hover:bg-card" onClick={(e) => { e.stopPropagation(); navigate(`/product/${secureId}`) }}>
              View Product
            </Button>
          </div>
        </CardContent>
      </Card>

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
    </>
  );
});

export default ProductCard;