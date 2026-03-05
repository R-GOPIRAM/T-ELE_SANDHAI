import { useState, useEffect } from 'react';
import { ArrowLeft, ShoppingCart, Share2, MapPin, Clock, Truck, ShieldCheck, Tag, Info, List } from 'lucide-react';
import Button from '../common/Button';
import api from '../../services/api';
import MakeOfferButton from '../bargain/MakeOfferButton';
import { Product } from '../../types';
import { useCart } from '../../hooks/useCart';
import ProductReviews from './ProductReviews';
import { ProductDetailSkeleton } from './ProductDetailSkeleton';

interface ProductDetailPageProps {
  onPageChange: (page: string) => void;
  productId?: string;
}

export default function ProductDetailPage({ onPageChange, productId }: ProductDetailPageProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    // Scroll to top when opening a new product
    window.scrollTo(0, 0);
    const fetchProduct = async () => {
      if (!productId) return;
      setLoading(true);
      try {
        const { data } = await api.get(`/products/${productId}`);
        setProduct(data.data);
      } catch (error) {
        console.error('Failed to fetch product', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      alert(`${quantity} item(s) added to cart!`);
      setQuantity(1);
    }
  };

  const handleBuyNow = () => {
    if (product) {
      addToCart(product, quantity);
      onPageChange('checkout');
    }
  };

  if (loading || !product) {
    return <ProductDetailSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Premium Header */}
      <div className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <button
            onClick={() => onPageChange('browse')}
            className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 font-semibold transition-all group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Browse</span>
          </button>

          <div className="flex gap-3 hidden sm:flex">
            <Button variant="outline" size="sm" icon={Share2} onClick={() => navigator.share?.({ title: product.name, text: `Check out ${product.name}` })}>Share</Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up">
        {/* Main Grid: Info Left (2/3), Sticky Actions Right (1/3) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

          {/* LEFT COLUMN: Gallery & Details */}
          <div className="lg:col-span-8 space-y-12">

            {/* Gallery Section */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4 sm:p-8 flex flex-col items-center">
              <div className="w-full relative rounded-2xl overflow-hidden bg-gray-50 mb-6 group aspect-square max-h-[600px] flex items-center justify-center">
                {product.originalPrice && (
                  <div className="absolute top-4 left-4 z-10 bg-red-500 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg shadow-red-500/30">
                    {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                  </div>
                )}
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-contain mix-blend-multiply hover:scale-110 transition-transform duration-700 cursor-crosshair"
                />
              </div>

              {/* Thumbnails */}
              {product.images && product.images.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2 w-full justify-center hide-scrollbar">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all duration-300 ${selectedImage === index
                        ? 'border-blue-600 shadow-md ring-2 ring-blue-600/20 ring-offset-2'
                        : 'border-transparent bg-gray-50 hover:bg-gray-100 hover:border-gray-200'
                        }`}
                    >
                      <img src={image} alt={`View ${index + 1}`} className="w-full h-full object-cover mix-blend-multiply" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Description & Overview */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
              <div className="flex items-center gap-2 mb-6">
                <Info className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Product Overview</h2>
              </div>
              <p className="text-gray-700 leading-relaxed text-lg">
                {product.description}
              </p>
            </div>

            {/* Premium Specifications Grid */}
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                <div className="flex items-center gap-2 mb-8">
                  <List className="w-6 h-6 text-blue-600" />
                  <h2 className="text-2xl font-bold text-gray-900">Specifications & Features</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-6">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex flex-col p-4 bg-gray-50 rounded-xl hover:bg-white hover:shadow-md hover:ring-1 hover:ring-gray-200 transition-all duration-300">
                      <span className="text-sm text-gray-500 font-medium uppercase tracking-wider mb-1">{key}</span>
                      <span className="text-gray-900 font-semibold text-lg">{value as React.ReactNode}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Features list text if any */}
            {product.features && product.features.length > 0 && (
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                <div className="flex items-center gap-2 mb-8">
                  <ShieldCheck className="w-6 h-6 text-blue-600" />
                  <h2 className="text-2xl font-bold text-gray-900">Key Highlights</h2>
                </div>

                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {product.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="mt-1 w-2 h-2 rounded-full bg-blue-500"></div>
                      <span className="text-gray-700 text-lg">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          </div>

          {/* RIGHT COLUMN: Sticky Buying Actions & Info */}
          <div className="lg:col-span-4 rounded-3xl">
            <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6 sm:p-8 sticky xl:top-28">

              {/* Brand & Title */}
              <div className="mb-2 text-sm font-bold text-blue-600 tracking-wider uppercase">{product.brand}</div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 leading-tight">{product.name}</h1>

              {/* Ratings */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-full border border-yellow-200">
                  <span className="font-bold text-yellow-700 mr-1">{product.rating}</span>
                  <span className="text-yellow-500">★</span>
                </div>
                <span className="text-gray-500 font-medium underline decoration-gray-300 underline-offset-4 cursor-pointer hover:text-blue-600">
                  {product.reviewCount} Ratings
                </span>
              </div>

              {/* Price Block */}
              <div className="mb-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-xl"></div>

                {product.originalPrice && (
                  <div className="text-gray-500 font-medium text-lg line-through decoration-2 decoration-red-400 mb-1">
                    ₹{product.originalPrice.toLocaleString('en-IN')}
                  </div>
                )}
                <div className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-2">
                  <span className="text-2xl align-top mr-1">₹</span>
                  {product.price.toLocaleString('en-IN')}
                </div>
                <div className="text-sm font-medium text-green-600 flex items-center">
                  <span className="relative flex h-2 w-2 mr-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  In Stock ({product.stock} available)
                </div>
              </div>

              {/* Seller Trust Box */}
              <div className="flex items-center justify-between p-4 mb-8 border border-gray-200 rounded-xl bg-gray-50/50">
                <div>
                  <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Sold By</div>
                  <div className="font-bold text-gray-900">{product.sellerName}</div>
                  <div className="flex items-center mt-1 text-sm text-gray-600">
                    <MapPin className="w-3.5 h-3.5 mr-1" />
                    {product.sellerLocation || 'Local Store'}
                  </div>
                </div>
                <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                  <ShieldCheck className="w-6 h-6" />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">

                {/* Quantity Selector */}
                <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl p-2 mb-6">
                  <span className="font-medium text-gray-700 ml-3">Quantity</span>
                  <div className="flex items-center bg-white rounded-lg border border-gray-200 shadow-sm">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors font-medium text-lg rounded-l-lg hover:border-blue-600">-</button>
                    <div className="w-12 h-10 flex items-center justify-center font-bold text-gray-900 border-x border-gray-200">{quantity}</div>
                    <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors font-medium text-lg rounded-r-lg hover:border-blue-600">+</button>
                  </div>
                </div>

                {/* Primary Buy Button */}
                <Button onClick={handleBuyNow} className="w-full text-lg py-4 bg-gray-900 hover:bg-black text-white rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
                  Buy Now Instantly
                </Button>

                {/* Add to Cart */}
                <Button onClick={handleAddToCart} variant="outline" className="w-full text-lg py-4 border-2 border-gray-200 hover:border-gray-900 hover:bg-gray-50 rounded-xl transition-all flex items-center justify-center gap-2">
                  <ShoppingCart className="w-5 h-5" /> Add to Cart
                </Button>

                {/* Make Offer / Bargain Button */}
                <div className="pt-2">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="px-3 bg-white text-xs font-semibold text-gray-500 uppercase tracking-wider">Or</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <MakeOfferButton
                      productId={product.id || (product as any)._id}
                      productName={product.name}
                      originalPrice={product.originalPrice || product.price}
                      sellerId={product.sellerId || ''}
                      image={product.images[0]}
                      onOfferSuccess={() => onPageChange('bargain')}
                    />
                  </div>
                  <p className="text-center text-xs text-gray-500 mt-2 flex items-center justify-center gap-1">
                    <Tag className="w-3 h-3" /> Negotiate directly with the seller
                  </p>
                </div>
              </div>

              {/* Trust & Delivery Pledges */}
              <div className="mt-8 pt-8 border-t border-gray-100 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Fast Delivery</h4>
                    <p className="text-sm text-gray-600 mt-0.5">{product.deliveryTime || 'Usually ships in 2-3 business days'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-2 bg-green-50 text-green-600 rounded-lg">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Return Policy</h4>
                    <p className="text-sm text-gray-600 mt-0.5">{product.returnPolicy || '7-day hassle-free returns'}</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12 w-full">
          <ProductReviews productId={product.id || (product as any)._id} />
        </div>
      </div>
    </div>
  );
}
