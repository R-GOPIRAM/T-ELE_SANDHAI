import { useState, useEffect } from 'react';
import {
  Store, ShieldCheck,
  ShoppingBag, ArrowRight,
  Smartphone, Laptop, Headphones, Watch, Gamepad, Tv, Speaker, Zap, MessageSquare, Info
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import api from '../services/apiClient';
import { Product } from '../types';
import { motion } from 'framer-motion';
import ProductCard from '../features/products/ProductCard';
import { CategoryCard } from '../components/ui/CategoryCard';
import { StoreCard } from '../components/ui/StoreCard';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const CATEGORIES = [
  { name: 'Mobiles', icon: Smartphone, query: 'category=Smartphones' },
  { name: 'Laptops', icon: Laptop, query: 'category=Laptops' },
  { name: 'Accessories', icon: Headphones, query: 'category=Accessories' },
  { name: 'TVs', icon: Tv, query: 'category=Televisions' },
  { name: 'Smart Devices', icon: Speaker, query: 'category=Smart%20Home' },
];

const FEATURED_SELLERS = [
  { name: 'Tech World', location: 'T Nagar', rating: 4.9, type: 'Authorized Apple Reseller', image: 'https://images.unsplash.com/photo-1522204657746-fc8fc6b5860b?w=400&h=400&fit=crop' },
  { name: 'ElectroHub', location: 'Anna Nagar', rating: 4.8, type: 'Multi-Brand Electronics', image: 'https://images.unsplash.com/photo-1550009158-9c5ce7c85856?w=400&h=400&fit=crop' },
  { name: 'Gadget Galaxy', location: 'Velachery', rating: 4.7, type: 'Mobiles & Accessories', image: 'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?w=400&h=400&fit=crop' },
  { name: 'Smart Home Depot', location: 'Mylapore', rating: 4.6, type: 'Home Appliances', image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400&h=400&fit=crop' }
];

import { ProductCardSkeleton } from '../components/ui/Skeleton';
import SearchBar from '../features/search/SearchBar';

export default function HomePage() {
  // useCart logic removed or updated in Phase 5
  const navigate = useNavigate();
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [bargainProducts, setBargainProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const [trendingRes, bargainRes] = await Promise.all([
          api.get('/products?limit=8&sort=rating', { signal: controller.signal }),
          api.get('/products?limit=4&isBargainable=true', { signal: controller.signal })
        ]);

        if (!controller.signal.aborted) {
          if (trendingRes.data.success) setTrendingProducts(trendingRes.data.data);
          if (bargainRes.data.success) setBargainProducts(bargainRes.data.data);
        }
      } catch (err) {
        const error = err as { name?: string; response?: { data?: { message?: string } } };
        if (error.name === 'CanceledError' || error.name === 'AbortError') return;
        const message = error.response?.data?.message || 'Failed to load trending products';
        setError(message);
        toast.error(message);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };
    fetchProducts();
    return () => controller.abort();
  }, []);

  if (error && trendingProducts.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="bg-card p-8 rounded-3xl shadow-xl border border-border text-center max-w-md">
          <div className="w-20 h-20 bg-danger/10 text-danger rounded-full flex items-center justify-center mx-auto mb-6">
            <Info className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-extrabold text-text-primary mb-2">Service Temporarily Unavailable</h2>
          <p className="text-text-secondary mb-8">{error}</p>
          <div className="flex gap-4">
            <Button className="flex-1" onClick={() => window.location.reload()}>Retry Connection</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col font-sans w-full">

      {/* 1. Modern Hero Section */}
      <section className="relative w-full bg-card overflow-hidden pt-12 pb-24 lg:pt-24 lg:pb-32">
        {/* Animated Background Gradients */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] -translate-y-1/2 -z-10 animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-bargain/20 rounded-full blur-[100px] translate-y-1/2 -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-center">

            {/* Left: Typography & CTAs */}
            <div className="mb-12 lg:mb-0 lg:col-span-6 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full border border-primary/20 mb-8 shadow-sm">
                  <Badge variant="primary" className="bg-primary text-white border-none py-1">Hyperlocal</Badge>
                  <span className="text-sm font-black text-primary uppercase tracking-widest">Electronics Marketplace</span>
                </div>

                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-heading font-black text-text-primary tracking-tighter leading-[1.1] mb-8">
                  Get <span className="text-primary">Gear</span> from <br />
                  <span className="relative inline-block mt-2">
                    Nearby Stores.
                    <svg className="absolute -bottom-2 left-0 w-full h-3 text-bargain -z-10 opacity-60" viewBox="0 0 100 10" preserveAspectRatio="none">
                      <path d="M0 5 Q 25 0, 50 5 T 100 5" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
                    </svg>
                  </span>
                </h1>

                <p className="text-xl text-text-secondary mb-10 max-w-2xl mx-auto lg:mx-0 font-medium leading-relaxed">
                  Connect with verified local retailers. Search electronics near you and get authentic products with live bargaining options.
                </p>

                <div className="max-w-xl mx-auto lg:mx-0 mb-12">
                  <SearchBar />
                </div>

                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                  {CATEGORIES.map((cat, idx) => (
                    <button
                      key={idx}
                      onClick={() => navigate(`/products?${cat.query}`)}
                      className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-border hover:border-primary hover:bg-primary/5 rounded-full transition-all group"
                    >
                      <cat.icon className="w-4 h-4 text-primary" />
                      <span className="text-xs font-bold text-text-secondary group-hover:text-primary">{cat.name}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Right: Floating Product Cards */}
            <div className="hidden lg:block lg:col-span-6 relative h-[600px] w-full">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                className="absolute right-10 top-10 w-64 z-20"
              >
                <div className="card shadow-2xl shadow-primary/20 bg-card rounded-2xl overflow-hidden group hover:-translate-y-2 transition-transform duration-300">
                  <div className="h-40 bg-background relative flex items-center justify-center p-4">
                    <img src="https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&q=80" alt="Apple Watch" className="object-contain h-full mix-blend-multiply" />
                    <Badge className="absolute top-2 right-2 bg-bargain text-white">Bargainable</Badge>
                  </div>
                  <div className="p-4 border-t border-border">
                    <h4 className="font-bold text-text-primary leading-tight mb-1">Apple Watch Series 9</h4>
                    <p className="text-xs font-bold text-text-secondary uppercase mb-2">ElectroHub</p>
                    <div className="flex items-center justify-between">
                      <p className="font-black text-lg text-text-primary">₹39,999</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                className="absolute right-48 top-64 w-60 z-30"
              >
                <div className="card shadow-2xl shadow-primary/20 bg-card rounded-2xl overflow-hidden group hover:-translate-y-2 transition-transform duration-300 border-4 border-card">
                  <div className="h-32 bg-background relative flex items-center justify-center p-4">
                    <img src="https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=500&q=80" alt="MacBook Pro" className="object-contain h-full mix-blend-multiply" />
                  </div>
                  <div className="p-4 border-t border-border">
                    <h4 className="font-bold text-text-primary leading-tight mb-1">MacBook Pro M3</h4>
                    <p className="text-xs font-bold text-text-secondary uppercase mb-2">Tech World</p>
                    <div className="flex items-center justify-between">
                      <p className="font-black text-lg text-text-primary">₹1,49,900</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
                className="absolute right-0 top-80 w-64 z-10"
              >
                <div className="card shadow-2xl shadow-primary/20 bg-card rounded-2xl overflow-hidden group hover:-translate-y-2 transition-transform duration-300">
                  <div className="h-40 bg-background relative flex items-center justify-center p-4">
                    <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80" alt="Headphones" className="object-contain h-full mix-blend-multiply" />
                    <Badge className="absolute top-2 right-2 bg-bargain text-white">Bargainable</Badge>
                  </div>
                  <div className="p-4 border-t border-border">
                    <h4 className="font-bold text-text-primary leading-tight mb-1">Sony WH-1000XM5</h4>
                    <p className="text-xs font-bold text-text-secondary uppercase mb-2">Gadget Galaxy</p>
                    <div className="flex items-center justify-between">
                      <p className="font-black text-lg text-text-primary">₹26,990</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Top Stores Near You */}
      <section id="stores" className="py-24 bg-background border-b border-border overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-16 gap-4 text-center sm:text-left">
            <div>
              <h2 className="text-4xl font-heading font-black text-text-primary tracking-tighter">
                Popular <span className="text-primary">Stores</span> Nearby
              </h2>
              <p className="text-text-secondary mt-2 font-medium">Verified authorized dealers in your immediate vicinity.</p>
            </div>
          </div>

          <div className="flex overflow-x-auto hide-scrollbar gap-8 pb-4 snap-x">
            {loading ? (
              [1, 2, 3, 4].map(i => (
                <div key={i} className="flex-shrink-0 w-80 h-48 bg-border/20 animate-pulse rounded-[2.5rem]"></div>
              ))
            ) : (
              FEATURED_SELLERS.map((seller, idx) => (
                <div key={idx} className="flex-shrink-0 w-80 snap-start">
                  <StoreCard
                    name={seller.name}
                    rating={seller.rating}
                    location={seller.location}
                    logoUrl={seller.image}
                    productCount={Math.floor(Math.random() * 50) + 10}
                    onClick={() => navigate('/products')}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* 4. Trending Products Grid */}
      <section className="py-20 bg-background border-border relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-16 gap-4 text-center sm:text-left">
            <h2 className="text-4xl font-heading font-black text-text-primary tracking-tighter flex items-center gap-4">
              Trending <span className="text-primary">Near You</span>
            </h2>
            <Button variant="ghost" onClick={() => navigate('/products')} className="text-primary font-bold hover:bg-primary/10 rounded-full px-6">
              View Gear <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : trendingProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {trendingProducts.map((product: Product) => (
                <ProductCard
                  key={product.id || (product as { _id?: string })._id}
                  product={product}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-card rounded-2xl border border-dashed border-border shadow-sm">
              <ShoppingBag className="w-16 h-16 text-border mx-auto mb-4" />
              <p className="text-text-secondary font-medium text-lg">Inventory updating. Check back soon for trending gear.</p>
            </div>
          )}
        </div>
      </section>

      {/* 5. Highlighted Bargain Deals Section */}
      <section className="py-24 bg-gradient-to-br from-bargain/10 via-card to-primary/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <Badge variant="bargain" className="mb-6 px-4 py-1.5 rounded-full text-white">Live Negotiation</Badge>
            <h2 className="text-4xl md:text-5xl font-heading font-black text-text-primary tracking-tighter mb-4">
              Best <span className="text-primary">Deals</span> Nearby.
            </h2>
            <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto font-medium leading-relaxed">
              Spot the bargain tag, chat directly with store owners, and lock in the best price in your neighborhood.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map(i => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : bargainProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {bargainProducts.map((product: Product) => (
                <ProductCard
                  key={product.id || (product as { _id?: string })._id}
                  product={product}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 px-4 bg-card rounded-[2rem] border border-border mt-8 shadow-sm">
              <MessageSquare className="w-16 h-16 text-border mx-auto mb-4" />
              <p className="text-text-secondary font-medium text-lg max-w-md mx-auto">
                No active bargain deals yet. Explore products and send your first offer.
              </p>
              <Button onClick={() => navigate('/products')} className="mt-6 rounded-xl">Explore Products</Button>
            </div>
          )}
        </div>
      </section>

      {/* 6. How Bargaining Works */}
      <section className="py-24 bg-card border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading font-black text-text-primary tracking-tighter">
              How Bargaining Works
            </h2>
            <p className="text-text-secondary mt-2 font-medium">Three simple steps to lock in the deals you want.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center lg:px-12 relative">
            <div className="hidden md:block absolute top-[50px] left-[20%] right-[20%] h-0.5 bg-border -z-0 border-dashed border-2"></div>

            <div className="flex flex-col items-center relative z-10 bg-card">
              <div className="w-24 h-24 bg-background border-4 border-card shadow-lg rounded-[2rem] flex items-center justify-center mb-6 text-primary hover:scale-110 transition-transform">
                <Store className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-black text-text-primary mb-3">1. Find a Store</h3>
              <p className="text-text-secondary font-medium leading-relaxed">Browse products from verified local retailers that accept bargain requests.</p>
            </div>
            <div className="flex flex-col items-center relative z-10 bg-card">
              <div className="w-24 h-24 bg-background border-4 border-card shadow-lg rounded-[2rem] flex items-center justify-center mb-6 text-bargain hover:scale-110 transition-transform">
                <MessageSquare className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-black text-text-primary mb-3">2. Make an Offer</h3>
              <p className="text-text-secondary font-medium leading-relaxed">Click "Make Offer" and submit your best price. The seller gets instantly notified.</p>
            </div>
            <div className="flex flex-col items-center relative z-10 bg-card">
              <div className="w-24 h-24 bg-background border-4 border-card shadow-lg rounded-[2rem] flex items-center justify-center mb-6 text-seller hover:scale-110 transition-transform">
                <ShieldCheck className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-black text-text-primary mb-3">3. Pick Up or Delivery</h3>
              <p className="text-text-secondary font-medium leading-relaxed">Once accepted, buy immediately and walk into the store to collect, or get it delivered.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Massive Store Owner CTA */}
      <section className="py-20 bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="bg-primary-hover text-white hover:bg-primary-hover border-card/20 mb-6 text-sm px-4">For Retailers</Badge>
          <h2 className="text-4xl md:text-5xl font-heading font-extrabold text-white tracking-tight mb-6">
            Are you a local electronics retailer? <br className="hidden md:block" />
            Take your store online today.
          </h2>
          <p className="text-xl text-primary/80 mb-10 max-w-2xl mx-auto font-medium text-white/90">
            Join T-ELE Sandhai to reach thousands of buyers in your city. Zero setup fees, powerful bargaining tools, and instant settlement.
          </p>
          <Button
            size="lg"
            className="text-lg px-10 py-6 bg-card text-primary hover:bg-background rounded-2xl shadow-xl shadow-black/20 font-bold"
            onClick={() => navigate('/seller-register')}
          >
            Become a Seller
          </Button>
        </div>
      </section>

      {/* 8. Trust Indicators */}
      <section className="py-20 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-heading font-extrabold text-text-primary tracking-tight mb-12">
            Trusted by Local Communities
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            <div className="flex flex-col items-center group">
              <div className="w-20 h-20 bg-seller/10 rounded-3xl flex items-center justify-center text-seller mb-6 border border-seller/20 shadow-inner group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-10 h-10" />
              </div>
              <h4 className="text-4xl font-heading font-black text-text-primary">100%</h4>
              <p className="text-[10px] uppercase font-black text-text-secondary tracking-[0.2em] mt-2">Verified Nodes</p>
            </div>
            <div className="flex flex-col items-center group">
              <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mb-6 border border-primary/20 shadow-inner group-hover:scale-110 transition-transform">
                <Store className="w-10 h-10" />
              </div>
              <h4 className="text-4xl font-heading font-black text-text-primary">240+</h4>
              <p className="text-[10px] uppercase font-black text-text-secondary tracking-[0.2em] mt-2">Active Hubs</p>
            </div>
            <div className="flex flex-col items-center group">
              <div className="w-20 h-20 bg-bargain/10 rounded-3xl flex items-center justify-center text-bargain mb-6 border border-bargain/20 shadow-inner group-hover:scale-110 transition-transform">
                <ShoppingBag className="w-10 h-10" />
              </div>
              <h4 className="text-4xl font-heading font-black text-text-primary">8.5k</h4>
              <p className="text-[10px] uppercase font-black text-text-secondary tracking-[0.2em] mt-2">Gear Units</p>
            </div>
            <div className="flex flex-col items-center group">
              <div className="w-20 h-20 bg-warning/10 rounded-3xl flex items-center justify-center text-warning mb-6 border border-warning/20 shadow-inner group-hover:scale-110 transition-transform">
                <MessageSquare className="w-10 h-10" />
              </div>
              <h4 className="text-4xl font-heading font-black text-text-primary tracking-tighter shrink-0">Live Deal</h4>
              <p className="text-[10px] uppercase font-black text-text-secondary tracking-[0.2em] mt-2 text-center">Open Negotiation</p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Professional Footer */}
      <footer className="bg-text-primary text-text-secondary py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 border-b border-border/10 pb-16">
            {/* Brand Col */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                  <Store className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-heading font-extrabold text-card tracking-tight">T-ELE Sandhai</span>
              </div>
              <p className="text-text-secondary/80 font-medium leading-relaxed mb-6 max-w-sm">
                Revolutionizing hyperlocal e-commerce by connecting communities directly with verified local electronics businesses.
              </p>
            </div>

            {/* Links Columns */}
            <div>
              <h4 className="text-card font-bold mb-6 tracking-wider uppercase text-sm">Company</h4>
              <ul className="space-y-4">
                <li><button className="hover:text-card transition-colors font-medium cursor-pointer">About Us</button></li>
                <li><button className="hover:text-card transition-colors font-medium cursor-pointer">Careers</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-card font-bold mb-6 tracking-wider uppercase text-sm">For Sellers</h4>
              <ul className="space-y-4">
                <li><button onClick={() => navigate('/seller-register')} className="hover:text-card transition-colors font-medium cursor-pointer">Partner with Us</button></li>
                <li><button onClick={() => navigate('/dashboard/seller')} className="hover:text-card transition-colors font-medium cursor-pointer">Seller Dashboard</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-card font-bold mb-6 tracking-wider uppercase text-sm">Support</h4>
              <ul className="space-y-4">
                <li><button className="hover:text-card transition-colors font-medium cursor-pointer">Help Center</button></li>
                <li><button className="hover:text-card transition-colors font-medium cursor-pointer">Contact Us</button></li>
              </ul>
            </div>
          </div>

          <div className="mt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm font-medium">© {new Date().getFullYear()} T-ELE Sandhai Technologies Pvt Ltd. All rights reserved.</p>
            <div className="flex gap-6 text-sm font-medium">
              <button className="hover:text-card cursor-pointer">Terms of Service</button>
              <button className="hover:text-card cursor-pointer">Privacy Policy</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}