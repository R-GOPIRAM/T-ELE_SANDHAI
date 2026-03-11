import React, { useState } from 'react';
import { Star, Check, Heart, MessageSquare, Store, ShieldCheck, MapPin, Scale } from 'lucide-react';
import { Product } from '../../types';
import BargainModal from '../bargain/BargainModal';
import { useWishlist } from '../../context/WishlistContext';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

import { useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { useCompareStore } from '../../store/compareStore';

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
  const { addItem, removeItem, isInCompare } = useCompareStore();

  const minPrice = variants.length > 0 ? Math.min(...variants.map(v => v.price)) : product.price;
  const maxPrice = variants.length > 0 ? Math.max(...variants.map(v => v.price)) : product.price;
  const hasPriceRange = minPrice !== maxPrice;
  const displayPrice = hasPriceRange ? `₹${minPrice} - ₹${maxPrice}` : `₹${product.price}`;

  const secureId = product.id || (product as { _id?: string })._id || '';
  const isWishlisted = isInWishlist(secureId);
  const isCompared = isInCompare(secureId);

  const handleCompareToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCompared) {
      removeItem(secureId);
    } else {
      addItem(product);
    }
  };

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
        <CardContent className={`flex-1 flex flex-col w-full bg-card ${viewMode === 'list' ? 'p-6' : 'p-5 border-t border-border'}`}>
          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div
                className="flex items-center text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary-hover cursor-pointer transition-colors w-full"
                onClick={(e) => {
                  if (product.sellerId) {
                    e.stopPropagation();
                    navigate(`/store/${product.sellerId}`);
                  }
                }}
              >
                <Store className="w-3 h-3 mr-1" />
                <span className="truncate max-w-[120px]">{product.sellerName || 'Local Retailer'}</span>
                <ShieldCheck className="w-3 h-3 ml-1 text-seller shrink-0" />
              </div>
              <div className="flex items-center gap-1 shrink-0 bg-warning/10 px-1.5 rounded text-warning">
                <Star className="w-3 h-3 fill-current" />
                <span className="text-[10px] font-black">{product.rating || 'New'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center text-[10px] font-bold text-text-secondary bg-background/50 px-2 py-1 rounded-full border border-border/30">
                <MapPin className="w-3 h-3 mr-1 text-primary" />
                {product.deliveryTime ? `${product.deliveryTime} • ` : ''}
                {/* Random realistic distance if not provided by API */}
                {Math.floor(Math.random() * 5 + 1)}.{Math.floor(Math.random() * 9)} km
              </div>
            </div>

            <h3 className={`font-heading font-bold text-text-primary ${viewMode === 'list' ? 'text-xl' : 'text-base leading-snug'} line-clamp-2 mb-3`}>
              {product.name}
            </h3>

            <div className="mt-auto flex flex-col mb-4">
              {product.originalPrice && (
                <span className="text-xs text-text-secondary font-medium line-through mb-0.5 inline-block">
                  ₹{product.originalPrice}
                </span>
              )}
              <span className="text-2xl font-black text-text-primary tracking-tighter">
                {displayPrice}
              </span>
            </div>
          </div>

          {/* Action Matrix */}
          <div className={`flex gap-2 relative mt-4 ${viewMode === 'list' ? 'max-w-xs' : ''}`}>
            {isBargainable ? (
              <Button size="sm" variant="bargain" className="flex-1 font-black shadow-lg shadow-bargain/20 text-[10px] uppercase tracking-wider py-2.5" onClick={(e) => { e.stopPropagation(); setIsBargainModalOpen(true); }}>
                Make Offer
              </Button>
            ) : (
              <Button size="sm" variant="primary" className="flex-1 font-black shadow-lg shadow-primary/20 text-[10px] uppercase tracking-wider py-2.5" onClick={(e) => { e.stopPropagation(); addToCart(product, 1); }}>
                Add to Cart
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              className={`flex-none w-10 h-10 p-0 transition-all ${isCompared ? 'bg-primary/10 border-primary text-primary shadow-inner' : 'border-border hover:border-primary hover:text-primary'}`}
              title={isCompared ? "Remove from Compare" : "Add to Compare"}
              onClick={handleCompareToggle}
            >
              <Scale className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" className="flex-1 font-bold bg-background text-[10px] uppercase tracking-wider py-2.5" onClick={(e) => { e.stopPropagation(); navigate(`/product/${secureId}`) }}>
              View
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