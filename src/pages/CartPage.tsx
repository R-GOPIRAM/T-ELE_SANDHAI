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
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import { useNavigate } from 'react-router-dom';

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, clearCart, getTotalPrice } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!user) {
      navigate('/login');
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

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background/50 flex items-center justify-center p-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
        <EmptyState
          title="Inventory Void"
          description="Your hyper-local acquisition manifest is currently empty. Explore the neighborhood marketplace for premium electronics."
          icon={ShoppingBag}
          actionText="Explore Marketplace"
          onAction={() => navigate('/products')}
          illustrationColor="blue"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background/50 pb-20 pt-8 mt-16 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header Console */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <button
              onClick={() => navigate('/products')}
              className="flex items-center gap-2 text-text-secondary/50 hover:text-text-primary font-black uppercase tracking-widest text-[10px] mb-4 transition-all group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Return to Catalog
            </button>
            <h1 className="text-4xl font-black text-text-primary tracking-tighter flex items-center gap-4">
              <ShoppingCart className="w-10 h-10 text-primary" />
              Acquisition Bag
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="px-4 py-1.5 border-border text-text-secondary/50 font-black uppercase tracking-widest text-[9px]">
              Secured via Pulse Node
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

          {/* LEFT: Items Manifest */}
          <div className="lg:col-span-8 space-y-10">
            <AnimatePresence mode="popLayout">
              {Object.values(itemsBySeller).map((sellerGroup) => (
                <motion.div
                  key={sellerGroup.seller.id}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="bg-card rounded-[2.5rem] border border-card shadow-2xl shadow-border/50 overflow-hidden"
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
                          {sellerGroup.seller.location}
                        </div>
                      </div>
                    </div>
                    <Badge variant="success" className="bg-seller/10 text-seller-hover py-1 text-[8px] uppercase font-black">Local Authorized</Badge>
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
                            <img
                              src={item.product!.images[0]}
                              alt={item.product!.name}
                              className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700"
                            />
                          </div>

                          {/* Info Node */}
                          <div className="flex-1 text-center sm:text-left">
                            <h4 className="font-black text-text-primary text-xl leading-tight mb-1 group-hover:text-primary transition-colors tracking-tight">
                              {item.product!.name}
                            </h4>
                            <p className="text-[10px] text-text-secondary/50 font-black uppercase tracking-[0.2em] mb-4">{item.product!.brand} / electronics</p>

                            <div className="flex items-center justify-center sm:justify-start gap-5">
                              <div className="text-2xl font-black text-text-primary tracking-tighter">
                                <span className="text-sm align-top mr-1 font-bold">₹</span>{item.price.toLocaleString('en-IN')}
                              </div>
                              {item.product!.originalPrice && (
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
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <div className="w-12 text-center font-black text-text-primary text-lg">
                                {item.quantity}
                              </div>
                              <button
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                className="w-10 h-10 rounded-xl flex items-center justify-center text-text-secondary/50 hover:bg-card hover:text-primary hover:shadow-sm transition-all disabled:opacity-20"
                                disabled={item.quantity >= item.product!.stock}
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>

                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="w-12 h-12 rounded-2xl flex items-center justify-center text-text-secondary/30 hover:text-danger hover:bg-danger/10 transition-all border border-transparent hover:border-red-100"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>

                        {/* Stock status bubble */}
                        {item.quantity >= item.product!.stock && (
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

              <div className="bg-primary-900 rounded-[2rem] p-6 text-white max-w-sm flex items-start gap-5 shadow-2xl shadow-primary-900/20">
                <div className="w-12 h-12 bg-card/10 backdrop-blur rounded-2xl flex items-center justify-center shrink-0">
                  <Truck className="w-6 h-6 text-primary-200" />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-1 text-primary-200">Neighborhood Logistics</p>
                  <p className="text-xs text-primary-100/70 font-medium leading-relaxed">Your acquisition manifest is optimized for hyperlocal fulfillment. Delivery nodes are pre-warmed.</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Financial Terminal */}
          <div className="lg:col-span-4 lg:sticky lg:top-24">
            <div className="bg-card rounded-[2.5rem] p-10 border border-card shadow-2xl shadow-border/50 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-600 via-primary-500 to-indigo-600" />

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
                  className="w-full py-7 text-lg font-black rounded-[1.5rem] shadow-2xl shadow-primary/20 group uppercase tracking-widest"
                >
                  {!user ? 'Authenticate Portal' : (
                    <span className="flex items-center justify-center gap-3">
                      Initialize Checkout <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => navigate('/products')}
                  className="w-full py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] border-border"
                >
                  Review Catalog
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
          </div>
        </div>
      </div>
    </div>
  );
}