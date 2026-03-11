import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  MapPin,
  Truck,
  Store,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  ShoppingBag,
  Zap,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../hooks/useCart';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useCartStore } from '../store/cartStore';
import { CartItemSkeleton, CartSummarySkeleton } from '../components/ui/CartSkeleton';

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, clearCart, getTotalPrice, isLoading } = useCart();
  const { user } = useAuthStore();
  const { fetchCart } = useCartStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleCheckout = () => {
    if (!user) {
      navigate('/login/customer');
      return;
    }
    navigate('/checkout');
  };

  const subtotal = getTotalPrice();
  const total = subtotal;

  const validItems = items.filter(item => item.product);

  const itemsBySeller = validItems.reduce((acc, item) => {
    const product = item.product!;
    const sellerId = product.sellerId || 'unknown';

    if (!acc[sellerId]) {
      acc[sellerId] = {
        seller: {
          id: sellerId,
          name: product.sellerName || 'Local Retailer',
          location: product.sellerLocation || 'Neighborhood'
        },
        items: []
      };
    }
    acc[sellerId].items.push(item);
    return acc;
  }, {} as Record<string, { seller: { id: string; name: string; location: string }; items: typeof items }>);

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  if (items.length === 0 && !isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-1/4 -right-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] animate-pulse-slow -z-10" />
        <EmptyState
          title="Manifest Empty"
          description="Your hyper-local acquisition manifest is currently empty. Explore the neighborhood marketplace for premium electronics."
          icon={ShoppingBag}
          actionText="Find Gear"
          onAction={() => navigate('/products')}
          illustrationColor="primary"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 pt-8 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-bargain/5 rounded-full blur-[120px] -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">

        {/* Header Console */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <button
              onClick={() => navigate('/products')}
              className="flex items-center gap-2 text-text-secondary hover:text-primary font-black uppercase tracking-widest text-[10px] mb-4 transition-all group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Return to Catalog
            </button>
            <h1 className="text-4xl sm:text-5xl font-heading font-black text-text-primary tracking-tight flex items-center gap-4">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/20">
                <ShoppingCart className="w-8 h-8" />
              </div>
              Acquisition Bag
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="px-6 py-2 border-border text-text-secondary font-black uppercase tracking-widest text-[10px] bg-card/50 backdrop-blur-md">
              Encrypted Pulse Node
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

          {/* LEFT: Items Manifest */}
          <div className="lg:col-span-8 space-y-10">
            {isLoading && items.length === 0 ? (
              <div className="bg-card rounded-[2.5rem] border border-border shadow-soft overflow-hidden divide-y divide-gray-50">
                {Array.from({ length: 3 }).map((_, i) => (
                  <CartItemSkeleton key={i} />
                ))}
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {Object.values(itemsBySeller).map((sellerGroup) => (
                  <motion.div
                    key={sellerGroup.seller.id}
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="bg-card rounded-[2.5rem] border border-border shadow-soft overflow-hidden mb-12"
                  >
                    {/* Seller Header */}
                    <div className="bg-background/50 px-8 py-6 border-b border-border flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-card rounded-2xl shadow-sm border border-border flex items-center justify-center text-primary">
                          <Store className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-black text-text-primary uppercase tracking-tighter text-lg">{sellerGroup.seller.name}</h3>
                          <div className="flex items-center text-[10px] text-text-secondary/50 font-black uppercase tracking-widest">
                            <MapPin className="w-3 h-3 mr-1 text-primary/50" />
                            {sellerGroup.seller.location || 'Neighborhood'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {isLoading && <RefreshCw className="w-4 h-4 text-primary animate-spin" />}
                        <Badge variant="seller" className="py-1 text-[8px] uppercase font-black tracking-widest">Local Authorized</Badge>
                      </div>
                    </div>

                    {/* Items list */}
                    <div className="divide-y divide-gray-50">
                      {sellerGroup.items.map((item) => (
                        <motion.div
                          key={item.id}
                          layout
                          className="p-8 group relative hover:bg-background/30 transition-colors"
                        >
                          <div className="flex flex-col sm:flex-row items-center gap-8">
                            {/* Image Node */}
                            <div className="w-28 h-28 bg-card rounded-3xl flex-shrink-0 p-3 overflow-hidden border border-border shadow-sm group-hover:border-primary/50 transition-all duration-500">
                              {item.product?.images?.[0] ? (
                                <img
                                  src={item.product!.images[0]}
                                  alt={item.product!.name}
                                  className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700"
                                />
                              ) : (
                                <div className="w-full h-full bg-background flex items-center justify-center">
                                  <ShoppingBag className="w-8 h-8 text-text-secondary/20" />
                                </div>
                              )}
                            </div>

                            {/* Info Node */}
                            <div className="flex-1 text-center sm:text-left">
                              <h4 className="font-black text-text-primary text-xl leading-tight mb-1 group-hover:text-primary transition-colors tracking-tight">
                                {item.product?.name || 'Loading item...'}
                              </h4>
                              <p className="text-[10px] text-text-secondary/50 font-black uppercase tracking-[0.2em] mb-4">{item.product?.brand || 'Electronics'} / electronics</p>

                              <div className="flex items-center justify-center sm:justify-start gap-5">
                                <div className="text-2xl font-black text-text-primary tracking-tighter">
                                  <span className="text-sm align-top mr-1 font-bold">₹</span>{item.price.toLocaleString('en-IN')}
                                </div>
                                {item.product?.originalPrice && (
                                  <span className="text-sm text-text-secondary/50 font-bold line-through ml-1 opacity-50">
                                    ₹{item.product!.originalPrice.toLocaleString('en-IN')}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Controller Node */}
                            <div className="flex items-center gap-4">
                              <div className="flex items-center bg-background rounded-2xl p-1 border border-border shadow-inner">
                                <button
                                  onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                  className="w-10 h-10 rounded-xl flex items-center justify-center text-text-secondary/50 hover:bg-card hover:text-primary hover:shadow-sm transition-all"
                                  disabled={isLoading}
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                                <div className="w-12 text-center font-black text-text-primary text-lg">
                                  {item.quantity}
                                </div>
                                <button
                                  onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                  className="w-10 h-10 rounded-xl flex items-center justify-center text-text-secondary/50 hover:bg-card hover:text-primary hover:shadow-sm transition-all disabled:opacity-20"
                                  disabled={isLoading || (item.product?.stock ? item.quantity >= item.product.stock : false)}
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>

                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="w-12 h-12 rounded-2xl flex items-center justify-center text-text-secondary/30 hover:text-danger hover:bg-danger/10 transition-all border border-transparent hover:border-red-100"
                                disabled={isLoading}
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>

                          {/* Stock status bubble */}
                          {item.product?.stock && item.quantity >= item.product.stock && (
                            <div className="mt-6 inline-flex items-center gap-2 px-3 py-1 bg-warning/10 text-warning text-[8px] font-black uppercase tracking-widest rounded-full border border-amber-100">
                              <Zap className="w-3 h-3 fill-current" />
                              Maximum allocated stock reached
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6">
              <button
                onClick={() => confirm('Purge entire manifest?') && clearCart()}
                className="group flex items-center gap-3 text-text-secondary/50 hover:text-danger font-black uppercase tracking-widest text-[9px] transition-all"
              >
                <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center group-hover:bg-danger/10 group-hover:border-red-100 transition-all">
                  <Trash2 className="w-4 h-4" />
                </div>
                Purge All Items
              </button>

              <div className="bg-text-primary rounded-3xl p-8 text-white max-w-sm flex items-start gap-5 shadow-2xl shadow-text-primary/20">
                <div className="w-12 h-12 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center shrink-0">
                  <Truck className="w-6 h-6 text-primary-light" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-primary-light">Neighborhood Logistics</p>
                  <p className="text-sm text-white/70 font-medium leading-relaxed">Your acquisition manifest is optimized for hyperlocal fulfillment through our verified store network.</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Financial Terminal */}
          <div className="lg:col-span-4 lg:sticky lg:top-24">
            {isLoading && items.length === 0 ? (
              <CartSummarySkeleton />
            ) : (
              <div className="bg-card rounded-[2.5rem] p-10 border border-border shadow-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-primary-hover to-primary" />

                <h3 className="text-xl font-black text-text-primary mb-10 uppercase tracking-tighter flex items-center gap-3">
                  Acquisition Summary
                </h3>

                <div className="space-y-6 mb-10">
                  <div className="flex justify-between items-center text-text-secondary font-bold uppercase tracking-widest text-[10px]">
                    <span>Subtotal Segment</span>
                    <span className="text-text-primary font-black text-sm">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center text-text-secondary font-bold uppercase tracking-widest text-[10px]">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-primary" />
                      <span>Est. Logistics</span>
                    </div>
                    <span className="text-text-secondary/50 font-black text-[9px] uppercase italic">Next step</span>
                  </div>

                  <div className="pt-8 border-t border-border mt-8">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-text-secondary/50 font-black text-[10px] uppercase tracking-[0.2em] mb-1">Estimated Commitment</p>
                        <div className="text-4xl font-black text-text-primary tracking-tighter">
                          <span className="text-xl align-top mr-1 font-bold">₹</span>{total.toLocaleString('en-IN')}
                        </div>
                      </div>
                      <Badge variant="primary" className="text-[10px] py-0 px-3 bg-gray-900">Final</Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Button
                    onClick={handleCheckout}
                    className="w-full py-8 text-xl font-heading font-black rounded-3xl shadow-xl shadow-primary/20 group uppercase tracking-widest"
                  >
                    {!user ? 'Log In to Continue' : (
                      <span className="flex items-center justify-center gap-3">
                        Initialize Acquisition <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                      </span>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => navigate('/products')}
                    className="w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] border-2 border-border"
                  >
                    Continue Shopping
                  </Button>
                </div>

                <div className="mt-10 pt-8 border-t border-border grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 justify-center opacity-30 group hover:opacity-100 transition-opacity">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-[8px] font-black uppercase tracking-widest">Secured Node</span>
                  </div>
                  <div className="flex items-center gap-2 justify-center opacity-30 group hover:opacity-100 transition-opacity">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-[8px] font-black uppercase tracking-widest">Premium Hub</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}