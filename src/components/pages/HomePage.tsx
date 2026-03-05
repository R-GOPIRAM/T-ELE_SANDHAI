import React, { useState, useEffect } from 'react';
import {
  Store, ShieldCheck, MapPin, Star, TrendingUp, ChevronRight,
  Search, ChevronDown, Clock, ShoppingBag, ArrowRight
} from 'lucide-react';
import Button from '../common/Button';
import api from '../../services/api';
import { Product } from '../../types';
import MakeOfferButton from '../bargain/MakeOfferButton';

interface HomePageProps {
  onPageChange: (page: string) => void;
}

const CATEGORIES = [
  { name: 'Groceries', icon: '🍎', color: 'bg-green-100' },
  { name: 'Electronics', icon: '📱', color: 'bg-blue-100' },
  { name: 'Fashion', icon: '👕', color: 'bg-purple-100' },
  { name: 'Home', icon: '🏠', color: 'bg-orange-100' },
  { name: 'Beauty', icon: '💄', color: 'bg-pink-100' },
  { name: 'Toys', icon: '🧸', color: 'bg-yellow-100' },
  { name: 'Books', icon: '📚', color: 'bg-teal-100' },
  { name: 'More', icon: '✨', color: 'bg-gray-100' },
];

const FEATURED_SELLERS = [
  { name: 'A-Z Supermarket', location: 'Anna Nagar', rating: 4.8, type: 'Groceries', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=200' },
  { name: 'Tech World', location: 'T Nagar', rating: 4.9, type: 'Electronics', image: 'https://images.unsplash.com/photo-1531297172868-b40b15277801?auto=format&fit=crop&q=80&w=200' },
  { name: 'Fresh Fruits Village', location: 'Mylapore', rating: 4.7, type: 'Organic', image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&q=80&w=200' },
  { name: 'Fashion Hub', location: 'Velachery', rating: 4.6, type: 'Clothing', image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80&w=200' }
];

export default function HomePage({ onPageChange }: HomePageProps) {
  const [location, setLocation] = useState('Chennai, Tamil Nadu');
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const { data } = await api.get('/products?limit=6&sort=rating');
        if (data.success) {
          setTrendingProducts(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch trending products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">

      {/* 1. Zepto-style Hero & Location Header */}
      <section className="bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 pt-8 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Abstract shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-1/2 -left-1/4 w-full h-full bg-blue-500/20 blur-3xl rounded-full" />
          <div className="absolute top-1/2 -right-1/4 w-3/4 h-full bg-purple-500/20 blur-3xl rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">

          {/* Location Picker */}
          <div className="flex justify-between items-center mb-10">
            <div className="relative group cursor-pointer" onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}>
              <div className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md px-4 py-2.5 rounded-full border border-white/20 transition-all">
                <MapPin className="text-pink-400 w-5 h-5" />
                <div className="flex flex-col">
                  <span className="text-white/70 text-xs font-bold uppercase tracking-wider">Delivery to</span>
                  <div className="flex items-center gap-1 text-white font-bold text-sm sm:text-base">
                    <span className="truncate max-w-[150px] sm:max-w-xs">{location}</span>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Location Dropdown */}
              {isLocationDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100 z-50 animate-fade-in-up">
                  <div className="p-3 text-sm font-bold text-gray-500 bg-gray-50 border-b border-gray-100">Select City</div>
                  {['Chennai, Tamil Nadu', 'Coimbatore, Tamil Nadu', 'Madurai, Tamil Nadu', 'Trichy, Tamil Nadu'].map(city => (
                    <button
                      key={city}
                      onClick={() => setLocation(city)}
                      className="w-full text-left px-4 py-3 hover:bg-blue-50 hover:text-blue-600 transition-colors text-gray-700 font-medium font-sans border-b border-gray-50 last:border-0"
                    >
                      {city}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange('seller-register')}
              className="border-white/30 text-white bg-white/10 hover:bg-white/20 backdrop-blur-md hidden sm:flex"
            >
              Become a Seller
            </Button>
          </div>

          {/* Hero Content text */}
          <div className="text-center max-w-3xl mx-auto mt-4 mb-10 animate-fade-in-up">
            <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-4 drop-shadow-lg leading-tight">
              Your Local Stores, <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-yellow-400">Delivered in Minutes.</span>
            </h1>
            <p className="text-lg md:text-xl text-blue-100/90 font-medium">
              Shop fresh groceries, electronics, and daily essentials from trusted retailers right in your neighborhood.
            </p>
          </div>

          {/* Massive Search Bar Prototype */}
          <div className="max-w-3xl mx-auto relative animate-fade-in-up" onClick={() => onPageChange('browse')}>
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-gray-400" />
            </div>
            <input
              type="text"
              readOnly
              placeholder={`Search for "Fresh Milk" or "Smartphones" in ${location.split(',')[0]}...`}
              className="block w-full pl-14 pr-4 py-5 bg-white rounded-2xl shadow-2xl focus:ring-4 focus:ring-blue-500/30 text-lg sm:text-xl text-gray-900 font-medium cursor-text border-2 border-transparent transition-all"
            />
            <Button className="absolute right-2 top-2 bottom-2 bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 border-0 rounded-xl px-6 text-lg font-bold shadow-lg shadow-pink-500/30">
              Search
            </Button>
          </div>

        </div>
      </section>

      {/* 2. Quick Categories (Horizontal Scroll) */}
      <section className="py-8 bg-white border-b border-gray-100 shadow-sm relative z-20 -mt-6 rounded-t-[3rem]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Shop by Category</h2>
          </div>
          <div className="flex overflow-x-auto hide-scrollbar gap-6 pb-4 pt-2 -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth snap-x">
            {CATEGORIES.map((cat, idx) => (
              <div
                key={idx}
                onClick={() => onPageChange('browse')}
                className="flex flex-col items-center gap-3 cursor-pointer group flex-shrink-0 snap-start"
              >
                <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full ${cat.color} flex items-center justify-center text-4xl sm:text-4xl shadow-sm border border-black/5 group-hover:scale-110 group-hover:shadow-md transition-all duration-300`}>
                  {cat.icon}
                </div>
                <span className="text-gray-700 font-bold text-sm sm:text-base group-hover:text-blue-600 transition-colors">
                  {cat.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Trending Products Carousel */}
      <section className="py-16 bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
              <TrendingUp className="text-pink-500 w-8 h-8" />
              Trending Near You
            </h2>
            <button
              onClick={() => onPageChange('browse')}
              className="text-blue-600 font-bold flex items-center gap-1 hover:gap-2 transition-all"
            >
              See All <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {loading ? (
            <div className="flex gap-6 overflow-x-auto pb-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-64 h-80 bg-gray-200 animate-pulse rounded-2xl flex-shrink-0"></div>
              ))}
            </div>
          ) : trendingProducts.length > 0 ? (
            <div className="flex overflow-x-auto hide-scrollbar gap-6 pb-6 pt-2 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x">
              {trendingProducts.map((product) => (
                <div
                  key={product.id || (product as any)._id}
                  onClick={() => onPageChange(`product:${product.id || (product as any)._id}`)}
                  className="bg-white w-64 sm:w-72 rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex-shrink-0 group cursor-pointer hover:shadow-xl hover:-translate-y-2 transition-all duration-300 snap-center flex flex-col"
                >
                  <div className="h-48 relative bg-gray-50 p-4">
                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500" />
                    {product.originalPrice && (
                      <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-bold shadow-md">
                        {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-1">{product.name}</h3>
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-bold text-gray-700">{product.rating}</span>
                      <span className="text-xs text-gray-500">({product.reviewCount})</span>
                    </div>
                    <div className="flex items-end gap-2 mb-4 mt-auto">
                      <span className="text-2xl font-extrabold text-gray-900">₹{product.price}</span>
                      {product.originalPrice && <span className="text-sm text-gray-400 line-through mb-1">₹{product.originalPrice}</span>}
                    </div>

                    {/* Compact Add actions */}
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1 font-bold rounded-xl" onClick={(e) => { e.stopPropagation(); onPageChange(`product:${product.id || (product as any)._id}`) }}>
                        Buy Now
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-white rounded-3xl border border-dashed border-gray-300">
              <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No trending products right now.</p>
              <Button className="mt-4" onClick={() => onPageChange('browse')}>Browse All Products</Button>
            </div>
          )}
        </div>
      </section>

      {/* 4. Top Stores Near You Grid */}
      <section className="py-16 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
              Top Rated Local Stores
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Shop from the highest-rated verified sellers in your neighborhood. Support local business, get guaranteed quality.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURED_SELLERS.map((seller, idx) => (
              <div key={idx} className="bg-white rounded-3xl border border-gray-200 p-6 flex flex-col items-center text-center hover:border-blue-500 hover:shadow-xl transition-all duration-300 group cursor-pointer" onClick={() => onPageChange('browse')}>
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-50 mb-4 group-hover:scale-105 transition-transform">
                  <img src={seller.image} alt={seller.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex items-center justify-center gap-1 mb-1 text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Verified</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{seller.name}</h3>
                <p className="text-sm text-gray-500 font-medium mb-3">{seller.type}</p>

                <div className="flex items-center justify-between w-full mt-auto pt-4 border-t border-gray-100">
                  <div className="flex items-center text-sm font-bold text-gray-700">
                    <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                    {seller.rating}
                  </div>
                  <div className="flex items-center text-sm font-medium text-gray-500">
                    <MapPin className="w-4 h-4 mr-1" />
                    {seller.location}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Big Stats & Trust Banners */}
      <section className="py-16 bg-gradient-to-br from-indigo-900 to-blue-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-white/10">
            {[
              { num: '500+', label: 'Verified Stores', color: 'text-pink-400' },
              { num: '15,000+', label: 'Products', color: 'text-yellow-400' },
              { num: '30 Min', label: 'Fast Delivery', color: 'text-green-400' },
              { num: '50,000+', label: 'Happy Users', color: 'text-blue-300' }
            ].map((stat, idx) => (
              <div key={idx} className="text-center px-4">
                <div className={`text-4xl sm:text-5xl font-extrabold mb-2 ${stat.color} drop-shadow-md`}>{stat.num}</div>
                <div className="text-blue-100 font-medium uppercase tracking-wider text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Professional Footer */}
      <footer className="bg-gray-950 text-gray-400 py-16 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
            {/* Brand Col */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center transform -rotate-6 shadow-lg shadow-blue-500/20">
                  <Store className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-extrabold text-white tracking-tight">T-ELE Sandhai</span>
              </div>
              <p className="text-gray-400 leading-relaxed mb-6 max-w-sm">
                Revolutionizing hyperlocal e-commerce by connecting communities directly with verified local businesses. Fast, reliable, and fair.
              </p>
              <div className="flex gap-4">
                {/* Social placeholders */}
                {['Facebook', 'Twitter', 'Instagram', 'LinkedIn'].map(social => (
                  <div key={social} className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors cursor-pointer border border-gray-700">
                    <span className="text-xs font-bold">{social[0]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Links Columns */}
            <div>
              <h4 className="text-white font-bold mb-6 tracking-wider uppercase text-sm">Company</h4>
              <ul className="space-y-4">
                {['About Us', 'Careers', 'Press', 'Blog'].map(link => (
                  <li key={link}><a href="#" className="hover:text-white transition-colors flex items-center gap-2 group"><ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity -ml-6 group-hover:ml-0 text-blue-500" />{link}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6 tracking-wider uppercase text-sm">For Sellers</h4>
              <ul className="space-y-4">
                <li><button onClick={() => onPageChange('seller-register')} className="hover:text-white transition-colors">Partner with Us</button></li>
                <li><a href="#" className="hover:text-white transition-colors">Seller Dashboard</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Seller FAQs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Store Guidelines</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6 tracking-wider uppercase text-sm">Support</h4>
              <ul className="space-y-4">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Return Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm">© {new Date().getFullYear()} T-ELE Sandhai Technologies Pvt Ltd. All rights reserved.</p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="hover:text-white">Terms of Service</a>
              <a href="#" className="hover:text-white">Privacy Policy</a>
              <a href="#" className="hover:text-white">Sitemap</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}