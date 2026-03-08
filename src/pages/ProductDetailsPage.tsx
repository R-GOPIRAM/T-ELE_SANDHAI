import React, { useState, useEffect } from 'react';
import { ArrowLeft, ShoppingCart, Share2, MapPin, Clock, Truck, ShieldCheck, Zap, Star, Info, List } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/Button';
import api from '../services/apiClient';
import { Product } from '../types';
import { useCart } from '../hooks/useCart';
import ProductReviews from '../features/products/ProductReviews';
import { ProductDetailSkeleton } from '../features/products/ProductDetailSkeleton';
import BargainModal from '../features/bargain/BargainModal';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import ProductCard from '../features/products/ProductCard';

export default function ProductDetailPage() {
  const { id: productId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCart();
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'reviews' | 'store'>('description');
  const [isBargainModalOpen, setIsBargainModalOpen] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (product?.category) {
      api.get(`/products?category=${product.category}&limit=5`)
        .then(res => {
          const fetched = res.data.data || [];
          const currentId = product.id || (product as any)._id;
          setRelatedProducts(fetched.filter((p: Product) => (p.id || (p as any)._id) !== currentId).slice(0, 4));
        })
        .catch(console.error);
    }
  }, [product?.category, product?.id]);

  useEffect(() => {
    const controller = new AbortController();
    window.scrollTo(0, 0);

    const fetchProduct = async () => {
      if (!productId) return;
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get(`/products/${productId}`, { signal: controller.signal });
        if (!controller.signal.aborted) {
          setProduct(data.data);
        }
      } catch (err) {
        const error = err as { name?: string; response?: { data?: { message?: string } } };
        if (error.name === 'CanceledError' || error.name === 'AbortError') return;
        const message = error.response?.data?.message || 'Failed to fetch product';
        setError(message);
        toast.error(message);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchProduct();
    return () => controller.abort();
  }, [productId]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      setQuantity(1);
    }
  };

  const handleBuyNow = () => {
    if (product) {
      addToCart(product, quantity);
      navigate('/checkout');
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="bg-card p-8 rounded-3xl shadow-xl border border-border text-center max-w-md">
          <div className="w-20 h-20 bg-danger-50 text-danger-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Info className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-extrabold text-text-primary mb-2">Something Went Wrong</h2>
          <p className="text-text-secondary mb-8">{error}</p>
          <div className="flex gap-4">
            <Button className="flex-1" onClick={() => navigate('/products')}>Go Back</Button>
            <Button variant="outline" className="flex-1" onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </div>
    );
  }

  if (loading || !product) {
    return <ProductDetailSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Premium Header */}
      <div className="bg-card/80 backdrop-blur-md sticky top-0 z-40 border-b border-border/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/products')}
            className="flex items-center space-x-2 text-text-secondary hover:text-primary font-semibold transition-all group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Browse</span>
          </button>

          <div className="flex gap-3 hidden sm:flex">
            <Button variant="outline" size="sm" onClick={() => navigator.share?.({ title: product.name, text: `Check out ${product.name}` })}>
              <Share2 className="w-4 h-4 mr-2" /> Share
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up">
        {/* Main Grid: Gallery Left (7/12), Info Right (5/12) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-12">

          {/* LEFT COLUMN: Gallery */}
          <div className="lg:col-span-7">
            <div className="bg-card rounded-3xl shadow-sm border border-border p-4 sm:p-8 flex flex-col items-center xl:sticky xl:top-28">
              <div className="w-full relative rounded-2xl overflow-hidden bg-background mb-6 group aspect-square max-h-[600px] flex items-center justify-center">
                {product.originalPrice && (
                  <div className="absolute top-4 left-4 z-10 bg-danger-500 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg shadow-red-500/30">
                    {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                  </div>
                )}
                <AnimatePresence mode="wait">
                  <motion.img
                    key={selectedImage}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    src={product.images[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-contain mix-blend-multiply hover:scale-110 transition-transform duration-700 cursor-crosshair"
                  />
                </AnimatePresence>
              </div>

              {/* Thumbnails */}
              {product.images && product.images.length > 1 && (
                <div className="flex gap-4 overflow-x-auto w-full pb-2 hide-scrollbar justify-start sm:justify-center">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all duration-300 ${selectedImage === index
                        ? 'border-primary shadow-md ring-2 ring-primary-600/20 ring-offset-2 scale-105'
                        : 'border-transparent bg-background hover:bg-background hover:border-border'
                        }`}
                    >
                      <img src={image} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover mix-blend-multiply" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Info & Actions */}
          <div className="lg:col-span-5">
            <div className="bg-card rounded-3xl shadow-xl shadow-border/50 border border-border p-6 sm:p-8 shrink-0 relative lg:sticky lg:top-28">

              {/* Brand & Title */}
              <div className="mb-2 text-sm font-bold text-primary tracking-wider uppercase">{product.brand}</div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-text-primary mb-4 leading-tight">{product.name}</h1>

              {/* Ratings */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center bg-accent-50 px-3 py-1 rounded-full border border-accent-200">
                  <span className="font-bold text-accent-700 mr-1">{product.rating || 'New'}</span>
                  <Star className="w-4 h-4 text-accent-500 fill-current" />
                </div>
                <span className="text-text-secondary font-medium underline decoration-gray-300 underline-offset-4 cursor-pointer hover:text-primary">
                  {product.reviewCount || 0} Ratings
                </span>
              </div>

              {/* Price Block */}
              <div className="mb-8 p-6 bg-gradient-to-br from-primary-50 to-indigo-50 border border-primary/20 rounded-2xl relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary-500/10 rounded-full blur-xl"></div>

                {product.originalPrice && (
                  <div className="text-text-secondary font-medium text-lg line-through decoration-2 decoration-danger-400 mb-1">
                    ₹{product.originalPrice.toLocaleString('en-IN')}
                  </div>
                )}

                <motion.div
                  key={product.price}
                  initial={{ scale: 1.05, color: '#F2A900' }}
                  animate={{ scale: 1, color: '#111827' }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="text-4xl sm:text-5xl font-extrabold mb-2"
                >
                  <span className="text-2xl align-top mr-1 text-text-primary">₹</span>
                  {product.price.toLocaleString('en-IN')}
                </motion.div>

                <div className="text-sm font-medium text-seller flex items-center">
                  <span className="relative flex h-2 w-2 mr-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-seller"></span>
                  </span>
                  In Stock ({product.stock} available)
                </div>
              </div>

              {/* Seller Trust Box */}
              <div className="flex items-center justify-between p-4 mb-8 border border-border rounded-xl bg-background/50">
                <div>
                  <div className="text-xs text-text-secondary uppercase font-bold tracking-wider mb-1">Sold By</div>
                  <div className="font-bold text-text-primary flex items-center gap-1.5">
                    {product.sellerName || 'Local Retailer'}
                  </div>
                  <div className="flex items-center mt-1 text-sm text-text-secondary">
                    <MapPin className="w-3.5 h-3.5 mr-1" />
                    {product.sellerLocation || 'Local Store'}
                  </div>
                </div>
                <div className="h-10 w-10 bg-seller/20 rounded-full flex items-center justify-center text-seller">
                  <ShieldCheck className="w-6 h-6" />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                {/* Quantity Selector */}
                <div className="flex items-center justify-between bg-background border border-border rounded-xl p-2 mb-6">
                  <span className="font-medium text-text-secondary ml-3">Quantity</span>
                  <div className="flex items-center bg-card rounded-lg border border-border shadow-sm">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center text-text-secondary hover:bg-background hover:text-primary transition-colors font-medium text-lg rounded-l-lg hover:border-primary">-</button>
                    <div className="w-12 h-10 flex items-center justify-center font-bold text-text-primary border-x border-border">{quantity}</div>
                    <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="w-10 h-10 flex items-center justify-center text-text-secondary hover:bg-background hover:text-primary transition-colors font-medium text-lg rounded-r-lg hover:border-primary">+</button>
                  </div>
                </div>

                {product && (
                  <Button
                    variant="bargain"
                    onClick={() => setIsBargainModalOpen(true)}
                    className="w-full text-lg py-6 relative overflow-hidden group shadow-lg"
                  >
                    <div className="absolute inset-0 w-full h-full bg-card/20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out skew-x-12"></div>
                    <Zap className="w-5 h-5 mr-2 fill-current" />
                    Start Bargain Negotiation
                  </Button>
                )}

                <div className="flex gap-3 flex-col sm:flex-row">
                  <Button onClick={handleBuyNow} className="flex-1 py-4 text-base bg-gray-900 hover:bg-black text-white hover:shadow-lg transition-all shadow-none">
                    Buy Now
                  </Button>
                  <Button onClick={handleAddToCart} variant="outline" className="flex-1 py-4 text-base bg-card hover:bg-background transition-all flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5 mr-2" /> Cart
                  </Button>
                </div>
              </div>

              {/* Trust & Delivery Pledges */}
              <div className="mt-8 pt-8 border-t border-border space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-2 bg-primary/10 text-primary rounded-lg">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-text-primary">Fast Delivery</h4>
                    <p className="text-sm text-text-secondary mt-0.5">{product.deliveryTime || 'Usually ships in 2-3 business days'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-2 bg-seller/10 text-seller rounded-lg">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-text-primary">Return Policy</h4>
                    <p className="text-sm text-text-secondary mt-0.5">{product.returnPolicy || '7-day hassle-free returns'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: Tabs */}
        <div className="bg-card rounded-3xl shadow-sm border border-border overflow-hidden">
          {/* Tabs header */}
          <div className="flex border-b border-border overflow-x-auto hide-scrollbar sticky top-20 bg-card z-10">
            {['description', 'specifications', 'reviews', 'store'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as 'description' | 'specifications' | 'reviews' | 'store')}
                className={`flex-1 min-w-[150px] py-5 px-6 font-bold text-base transition-all relative whitespace-nowrap ${activeTab === tab ? 'text-primary' : 'text-text-secondary hover:text-text-primary hover:bg-background'}`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1).replace('Store', 'Store Info')}
                {activeTab === tab && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-primary"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-8 sm:p-12 min-h-[400px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'description' && (
                  <div className="max-w-4xl mx-auto">
                    <h3 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-2"><Info className="text-primary" /> Product Overview</h3>
                    <p className="text-text-secondary leading-relaxed text-lg whitespace-pre-wrap">
                      {product.description}
                    </p>

                    {product.features && product.features.length > 0 && (
                      <div className="mt-10">
                        <h4 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
                          <ShieldCheck className="text-primary w-6 h-6" /> Key Highlights
                        </h4>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {product.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-3 bg-background p-4 rounded-xl border border-border">
                              <div className="mt-1 w-2 h-2 rounded-full bg-primary-500 shrink-0"></div>
                              <span className="text-text-primary font-medium">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'specifications' && (
                  <div className="max-w-4xl mx-auto">
                    <h3 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-2"><List className="text-primary" /> Technical Specifications</h3>
                    {product.specifications && Object.keys(product.specifications).length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(product.specifications).map(([key, value]) => (
                          <div key={key} className="flex flex-col p-4 sm:flex-row sm:items-center sm:justify-between bg-background rounded-xl border border-border hover:bg-card hover:border-border hover:shadow-sm transition-all">
                            <span className="text-sm text-text-secondary font-medium uppercase tracking-wider mb-1 sm:mb-0 w-1/3">{key}</span>
                            <span className="text-text-primary font-semibold text-lg text-left sm:text-right w-2/3 break-words">{value as React.ReactNode}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-text-secondary italic">No specifications available for this product.</p>
                    )}
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="-m-8 sm:-m-12">
                    <ProductReviews productId={product.id || (product as { _id?: string })._id || ''} />
                  </div>
                )}

                {activeTab === 'store' && (
                  <div className="max-w-4xl mx-auto">
                    <h3 className="text-2xl font-bold text-text-primary mb-6">About the Seller</h3>

                    <div className="flex flex-col md:flex-row gap-8 items-start">
                      <div className="bg-background rounded-2xl p-8 border border-border flex-1 w-full">
                        <div className="flex items-center gap-4 mb-6">
                          <div className="w-16 h-16 bg-primary/20 text-primary rounded-full flex items-center justify-center">
                            <MapPin className="w-8 h-8" />
                          </div>
                          <div>
                            <h4 className="text-2xl font-bold text-text-primary flex items-center gap-2">
                              {product.sellerName || 'Local Retailer'}
                              <ShieldCheck className="w-5 h-5 text-seller" />
                            </h4>
                            <p className="text-text-secondary font-medium">Verified Partner</p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between border-b border-border pb-4">
                            <span className="text-text-secondary">Store Rating</span>
                            <div className="flex items-center gap-1 font-bold text-text-primary">
                              <Star className="w-5 h-5 text-accent-500 fill-current" />
                              {product.rating || '4.5'}
                            </div>
                          </div>
                          <div className="flex items-start justify-between border-b border-border pb-4">
                            <span className="text-text-secondary">Location</span>
                            <span className="font-semibold text-text-primary text-right max-w-[200px]">{product.sellerLocation || 'Main Hub'}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-text-secondary">Joined</span>
                            <span className="font-semibold text-text-primary">2023</span>
                          </div>
                        </div>

                        <Button className="w-full mt-8" variant="outline" onClick={() => product.sellerId && navigate(`/store/${product.sellerId}`)}>
                          Visit Store Profile
                        </Button>
                      </div>

                      <div className="flex-1 space-y-4">
                        <h4 className="font-bold text-text-primary text-lg">Store Policies</h4>
                        <div className="p-4 bg-background rounded-xl border border-border">
                          <div className="font-semibold flex items-center gap-2 mb-1"><Truck className="w-4 h-4 text-text-secondary" /> Shipping</div>
                          <p className="text-sm text-text-secondary">This seller ships orders within 24 hours of purchase verification. Delivery time depends on your distance from the store.</p>
                        </div>
                        <div className="p-4 bg-background rounded-xl border border-border">
                          <div className="font-semibold flex items-center gap-2 mb-1"><Clock className="w-4 h-4 text-text-secondary" /> Returns</div>
                          <p className="text-sm text-text-secondary">The seller accepts returns within 7 days. Item must be in original condition.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* RELATED PRODUCTS */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 animate-fade-in-up">
            <h2 className="text-[32px] font-heading font-semibold text-text-primary mb-8">Related <span className="text-primary">Products</span></h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((rp) => (
                <ProductCard key={rp.id || (rp as any)._id} product={rp} viewMode="grid" />
              ))}
            </div>
          </div>
        )}
      </div>

      <BargainModal
        isOpen={isBargainModalOpen}
        onClose={() => setIsBargainModalOpen(false)}
        onSuccess={() => {
          setIsBargainModalOpen(false);
          navigate('/dashboard');
        }}
        productLine={{
          productId: product.id || (product as { _id?: string })._id || '',
          productName: product.name,
          originalPrice: product.originalPrice || product.price,
          sellerId: product.sellerId || '',
          image: product.images[0]
        }}
      />
    </div>
  );
}
