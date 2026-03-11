import { useState, useEffect, useRef } from 'react';
import {
  ShoppingCart, Store, Menu, MapPin, Bell, User, Heart,
  ChevronDown, Package, LogOut,
  X, Home, Search, LayoutDashboard,
  Smartphone, Laptop, Headphones, Watch, Gamepad, Tv, Speaker, Zap
} from 'lucide-react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SearchBar from '../../features/search/SearchBar';
import { useLocationStore } from '../../store/locationStore';
import { useAuthStore as useAuth } from '../../store/authStore';
import { useCart } from '../../hooks/useCart';
import { useWishlist } from '../../context/WishlistContext';
import LocationPicker from './LocationPicker';
import NotificationDropdown from './NotificationDropdown';
import { Notification } from '../../types';

const CATEGORIES = [
  { name: 'Smartphones', icon: Smartphone },
  { name: 'Laptops', icon: Laptop },
  { name: 'Audio', icon: Headphones },
  { name: 'Wearables', icon: Watch },
  { name: 'Gaming', icon: Gamepad },
  { name: 'TV & Home', icon: Tv },
  { name: 'Smart Home', icon: Speaker },
  { name: 'Essentials', icon: Zap },
];

export default function Header() {
  const { user, logout } = useAuth();
  const { getTotalItems } = useCart();
  const { wishlistItems } = useWishlist();
  const navigate = useNavigate();
  const { location: currentLoc } = useLocationStore();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'info',
      category: 'bargain',
      title: 'Counter Offer Received',
      message: 'The seller offered ₹4,200 for your Saree request.',
      timestamp: new Date().toISOString(),
      isRead: false,
      link: 'bargain'
    },
    {
      id: '2',
      type: 'success',
      category: 'order',
      title: 'Order Confirmed',
      message: 'Your order #ORD-123 has been accepted by the store.',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      isRead: false
    },
    {
      id: '3',
      type: 'info',
      category: 'message',
      title: 'New Message from Store',
      message: '"We have fresh stocks of Kanchipuram silk!"',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      isRead: true
    }
  ]);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    navigate('/');
  };


  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) setIsProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) setIsNotifOpen(false);
      if (categoriesRef.current && !categoriesRef.current.contains(event.target as Node)) setIsCategoriesOpen(false);
      if (locationRef.current && !locationRef.current.contains(event.target as Node)) setIsLocationOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  {/* Internal SearchBar was here */ }

  return (
    <header className="sticky top-0 z-50 w-full bg-card/70 backdrop-blur-xl shadow-sm border-b border-border/50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Main Nav Row */}
        <div className="flex items-center justify-between h-20 gap-4">

          <div className="flex items-center shrink-0">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden mr-4 text-text-secondary hover:text-primary transition-all active:scale-95 focus:outline-none"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <Link
              to="/"
              className="group flex items-center space-x-3"
            >
              <div className="p-2 bg-gradient-to-br from-primary to-primary-hover rounded-xl shadow-lg shadow-primary/20 transition-all duration-500 group-hover:rotate-12 group-hover:scale-110">
                <Store className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl md:text-2xl font-heading font-black tracking-tighter text-text-primary">
                T-ELE <span className="text-primary">Sandhai</span>
              </span>
            </Link>
          </div>

          {/* Nav Links (Desktop) */}
          <nav className="hidden xl:flex items-center gap-1 ml-8">
            {[
              { label: 'Home', path: '/' },
              { label: 'Nearby Stores', path: '/nearby-stores' },
              { label: 'Compare', path: '/compare' },
              { label: 'Become a Seller', path: '/become-seller' },
            ].map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) => `px-4 py-2 text-[11px] font-black uppercase tracking-widest transition-all rounded-xl border border-transparent hover:border-border hover:bg-white/5 ${isActive ? 'text-primary bg-primary/5 border-primary/20' : 'text-text-secondary hover:text-text-primary'}`}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Location Selector (Desktop) */}
          <div className="hidden sm:flex relative" ref={locationRef}>
            <button
              onClick={() => setIsLocationOpen(!isLocationOpen)}
              className="flex flex-col items-start px-4 py-2 hover:bg-white/10 rounded-2xl transition-all group border border-transparent hover:border-border/50 bg-background/30"
            >
              <span className="text-[9px] text-text-secondary font-black uppercase tracking-widest group-hover:text-primary transition-colors">Delivering to</span>
              <div className="flex items-center text-xs font-black text-text-primary">
                <MapPin className="h-3.5 w-3.5 mr-1.5 text-primary animate-bounce-slow" />
                <span className="truncate max-w-[140px] uppercase">
                  {currentLoc ? `${currentLoc.area || currentLoc.city}` : 'Select Node'}
                </span>
                <ChevronDown className={`h-3.5 w-3.5 ml-1 text-text-secondary/50 transition-transform ${isLocationOpen ? 'rotate-180' : ''}`} />
              </div>
            </button>
          </div>
          {/* LocationPicker Modal — rendered at header level so it escapes navbar layout */}
          <LocationPicker isOpen={isLocationOpen} onClose={() => setIsLocationOpen(false)} />

          {/* Categories Dropdown (Desktop) */}
          <div className="hidden lg:flex relative" ref={categoriesRef}>
            <button
              onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
              className="flex items-center gap-2 px-5 py-3 hover:bg-white/10 rounded-2xl transition-all text-xs font-black uppercase tracking-widest text-text-primary border border-transparent hover:border-border/50 bg-background/30"
            >
              <LayoutDashboard className="w-4 h-4 text-primary" />
              Categories
              <ChevronDown className={`w-3.5 h-3.5 text-text-secondary/50 transition-transform ${isCategoriesOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isCategoriesOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                  className="absolute top-full left-0 mt-4 w-[560px] glass-panel p-8 grid grid-cols-2 gap-4 origin-top-left shadow-2xl shadow-primary/10 border border-primary/10"
                >
                  <div className="col-span-2 pb-5 border-b border-border/50 mb-4 flex justify-between items-end">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-text-primary">Local Distribution Hubs</h3>
                    <span className="text-[9px] font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">{CATEGORIES.length} Sectors</span>
                  </div>
                  {CATEGORIES.map((cat, idx) => {
                    const Icon = cat.icon;
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          setIsCategoriesOpen(false);
                          navigate(`/products?category=${encodeURIComponent(cat.name)}`);
                        }}
                        className="flex items-center gap-5 p-4 hover:bg-primary/5 rounded-[1.5rem] transition-all group border border-transparent hover:border-primary/10 bg-background/40"
                      >
                        <div className="w-12 h-12 rounded-2xl bg-card flex items-center justify-center group-hover:bg-primary group-hover:shadow-xl group-hover:shadow-primary/20 group-hover:-rotate-6 transition-all shadow-sm border border-border/50">
                          <Icon className="w-6 h-6 text-text-primary group-hover:text-white transition-colors" />
                        </div>
                        <span className="text-sm font-black text-text-primary group-hover:text-primary transition-colors tracking-tight uppercase">{cat.name}</span>
                      </button>
                    )
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Central Search Bar */}
          <div className="flex-1 max-w-3xl mx-6 hidden md:block">
            <SearchBar />
          </div>

          {/* Nav Actions */}
          <div className="flex items-center space-x-2 md:space-x-4 shrink-0">

            {/* Wishlist & Cart (Always Visible to Customers on Desktop/Tablet) */}
            {(!user || user.role === 'customer') && (
              <div className="hidden md:flex items-center space-x-1 sm:space-x-2">
                <NavLink
                  to="/dashboard/wishlist"
                  className={({ isActive }) => `relative p-2.5 rounded-full transition-all duration-300 ${isActive ? 'text-danger bg-danger/10 shadow-inner' : 'text-text-secondary hover:bg-danger/10 hover:text-danger active:scale-95'}`}
                >
                  <Heart className="h-5 w-5" />
                  {wishlistItems && wishlistItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-danger text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-sm shadow-danger/50 animate-fade-in-up">
                      {wishlistItems.length}
                    </span>
                  )}
                </NavLink>
                <NavLink
                  to="/cart"
                  className={({ isActive }) => `relative p-2.5 rounded-full transition-all duration-300 ${isActive ? 'text-primary bg-primary/10 shadow-inner' : 'text-text-secondary hover:bg-primary/10 hover:text-primary active:scale-95'}`}
                >
                  <ShoppingCart className="h-5 w-5" />
                  {getTotalItems() > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-sm shadow-primary/50 animate-fade-in-up">
                      {getTotalItems()}
                    </span>
                  )}
                </NavLink>
              </div>
            )}

            {/* Notifications (Authenticated) */}
            {user && (
              <div className="relative hidden sm:block" ref={notifRef}>
                <button
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className={`p-2.5 rounded-full transition-all duration-300 active:scale-95 ${isNotifOpen ? 'bg-background text-primary shadow-inner' : 'text-text-secondary hover:bg-background hover:text-primary'}`}
                >
                  <Bell className="h-5 w-5" />
                  {notifications.some(n => !n.isRead) && (
                    <span className="absolute top-2.5 right-2.5 h-2.5 w-2.5 bg-danger rounded-full ring-2 ring-card animate-pulse-slow"></span>
                  )}
                </button>
                <AnimatePresence>
                  {isNotifOpen && (
                    <div className="absolute right-0 mt-3 z-50">
                      <NotificationDropdown
                        notifications={notifications}
                        onMarkAsRead={handleMarkAsRead}
                        onMarkAllAsRead={handleMarkAllAsRead}
                      />
                    </div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Profile Menu or Auth Buttons */}
            {user ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className={`flex items-center space-x-2 p-1.5 pr-3 border hover:border-primary/30 rounded-full transition-all active:scale-95 ${isProfileOpen ? 'bg-primary/5 border-primary/30 shadow-inner' : 'border-border bg-card'}`}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-primary-hover flex items-center justify-center text-white font-bold shadow-md">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden lg:flex flex-col items-start pr-1">
                    <span className="text-sm font-bold text-text-primary leading-none mb-0.5">{user.name.split(' ')[0]}</span>
                    <span className="text-[10px] text-text-secondary font-semibold uppercase tracking-wider">{user.role}</span>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-text-secondary/50 hidden sm:block transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Profile Dropdown */}
                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                      className="absolute right-0 mt-3 w-64 glass-panel py-2 z-50 origin-top-right overflow-hidden border border-border/50"
                    >
                      <div className="px-4 py-4 border-b border-border/50 mb-2 bg-background/50 backdrop-blur-sm">
                        <p className="text-base font-bold text-text-primary truncate">{user.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${user.role === 'admin' ? 'bg-danger/10 text-danger' :
                            user.role === 'seller' ? 'bg-seller/10 text-seller' :
                              'bg-primary/10 text-primary'
                            }`}>
                            {user.role}
                          </span>
                          <p className="text-xs text-text-secondary truncate">{user.email}</p>
                        </div>
                      </div>

                      <div className="px-2 space-y-1">
                        <NavLink
                          to="/dashboard/profile"
                          onClick={() => setIsProfileOpen(false)}
                          className={({ isActive }) => `flex items-center px-3 py-2.5 text-sm font-semibold rounded-xl transition-all ${isActive ? 'bg-primary text-white shadow-md' : 'text-text-primary hover:bg-black/5 dark:hover:bg-white/5'}`}
                        >
                          <User className="h-4 w-4 mr-3" /> My Profile
                        </NavLink>

                        {user.role === 'customer' && (
                          <>
                            <NavLink
                              to="/dashboard"
                              end
                              onClick={() => setIsProfileOpen(false)}
                              className={({ isActive }) => `flex items-center px-3 py-2.5 text-sm font-semibold rounded-xl transition-all ${isActive ? 'bg-primary text-white shadow-md' : 'text-text-primary hover:bg-black/5 dark:hover:bg-white/5'}`}
                            >
                              <LayoutDashboard className="h-4 w-4 mr-3" /> Dashboard
                            </NavLink>
                            <NavLink
                              to="/dashboard/orders"
                              onClick={() => setIsProfileOpen(false)}
                              className={({ isActive }) => `flex items-center px-3 py-2.5 text-sm font-semibold rounded-xl transition-all ${isActive ? 'bg-primary text-white shadow-md' : 'text-text-primary hover:bg-black/5 dark:hover:bg-white/5'}`}
                            >
                              <Package className="h-4 w-4 mr-3" /> My Orders
                            </NavLink>
                          </>
                        )}

                        {user.role === 'seller' && (
                          <NavLink
                            to="/dashboard/seller"
                            end
                            onClick={() => setIsProfileOpen(false)}
                            className={({ isActive }) => `flex items-center px-3 py-2.5 text-sm font-semibold rounded-xl transition-all ${isActive ? 'bg-primary text-white shadow-md' : 'text-text-primary hover:bg-black/5 dark:hover:bg-white/5'}`}
                          >
                            <LayoutDashboard className="h-4 w-4 mr-3" /> Seller Panel
                          </NavLink>
                        )}
                      </div>

                      <div className="h-px bg-border/50 my-2 mx-4"></div>

                      <div className="px-2 pb-1 space-y-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center px-3 py-2.5 text-sm font-semibold text-danger hover:bg-danger hover:text-white rounded-xl transition-all"
                        >
                          <LogOut className="h-4 w-4 mr-3" /> Sign out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login/customer">
                  <button className="text-[11px] font-black uppercase tracking-widest text-text-primary hover:text-primary px-4 py-2 transition-all">
                    Sign In
                  </button>
                </Link>
                <Link to="/become-seller" className="hidden sm:block">
                  <button className="bg-primary hover:bg-primary-hover text-white text-[11px] font-black uppercase tracking-[0.15em] px-6 py-2.5 rounded-full shadow-lg shadow-primary/20 transition-all active:scale-95">
                    Sell Locally
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Search Bar Row (Only visible below md threshold) */}
        <div className="md:hidden pb-4 pt-1">
          <div className="glass-panel p-1 rounded-2xl shadow-sm">
            <SearchBar isMobile={true} />
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="md:hidden border-t border-border/50 bg-card/95 backdrop-blur-xl overflow-hidden shadow-inner"
          >
            <nav className="flex flex-col py-6 px-6 space-y-2 max-h-[75vh] overflow-y-auto hide-scrollbar">
              <div className="pb-4 mb-4 border-b border-border/50">
                <button
                  onClick={() => { setIsLocationOpen(true); setIsMobileMenuOpen(false); }}
                  className="flex items-center gap-4 p-4 w-full bg-background rounded-2xl text-left hover:bg-border/50 transition-colors border border-border/30 shadow-sm"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-[10px] text-primary font-bold uppercase tracking-widest mb-0.5">Delivery Location</p>
                    <p className="text-sm font-black text-text-primary truncate">
                      {currentLoc ? `${currentLoc.area || currentLoc.city}, ${currentLoc.pincode}` : 'Select Location'}
                    </p>
                  </div>
                  <ChevronDown className="w-4 h-4 ml-auto text-text-secondary" />
                </button>
              </div>

              <NavLink
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) => `flex items-center gap-4 px-4 py-3.5 rounded-2xl text-base font-bold transition-all ${isActive ? 'bg-primary text-white shadow-md' : 'text-text-primary hover:bg-background'}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${({ isActive }: any) => isActive ? 'bg-white/20' : 'bg-background'}`}>
                  <Home className="w-4 h-4" />
                </div>
                Home
              </NavLink>

              <NavLink
                to="/products"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) => `flex items-center gap-4 px-4 py-3.5 rounded-2xl text-base font-bold transition-all ${isActive ? 'bg-primary text-white shadow-md' : 'text-text-primary hover:bg-background'}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${({ isActive }: any) => isActive ? 'bg-white/20' : 'bg-background'}`}>
                  <Search className="w-4 h-4" />
                </div>
                Shop Categories
              </NavLink>

              <div className="h-px bg-border/50 my-4" />

              <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary/50 mb-3 ml-2">My Account</p>

              {user ? (
                <>
                  <NavLink
                    to="/dashboard/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) => `flex items-center gap-4 px-4 py-3.5 rounded-2xl text-base font-bold transition-all ${isActive ? 'bg-primary text-white shadow-md' : 'text-text-primary hover:bg-background'}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${({ isActive }: any) => isActive ? 'bg-white/20' : 'bg-background'}`}>
                      <User className="w-4 h-4" />
                    </div>
                    Profile
                  </NavLink>
                  {user.role === 'customer' && (
                    <>
                      <NavLink
                        to="/dashboard/orders"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={({ isActive }) => `flex items-center gap-4 px-4 py-3.5 rounded-2xl text-base font-bold transition-all ${isActive ? 'bg-primary text-white shadow-md' : 'text-text-primary hover:bg-background'}`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${({ isActive }: any) => isActive ? 'bg-white/20' : 'bg-background'}`}>
                          <Package className="w-4 h-4" />
                        </div>
                        My Orders
                      </NavLink>
                      <NavLink
                        to="/cart"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={({ isActive }) => `flex items-center gap-4 px-4 py-3.5 rounded-2xl text-base font-bold transition-all ${isActive ? 'bg-primary text-white shadow-md' : 'text-text-primary hover:bg-background'}`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${({ isActive }: any) => isActive ? 'bg-white/20' : 'bg-background'}`}>
                          <ShoppingCart className="w-4 h-4" />
                        </div>
                        My Cart
                      </NavLink>
                    </>
                  )}
                  {user.role === 'seller' && (
                    <NavLink
                      to="/dashboard/seller"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) => `flex items-center gap-4 px-4 py-3.5 rounded-2xl text-base font-bold transition-all ${isActive ? 'bg-primary text-white shadow-md' : 'text-text-primary hover:bg-background'}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${({ isActive }: any) => isActive ? 'bg-white/20' : 'bg-background'}`}>
                        <LayoutDashboard className="w-4 h-4" />
                      </div>
                      Seller Dashboard
                    </NavLink>
                  )}
                  <button
                    onClick={() => { logout(); setIsMobileMenuOpen(false); navigate('/'); }}
                    className="flex items-center gap-4 px-4 py-3.5 rounded-2xl text-base font-bold text-danger hover:bg-danger hover:text-white transition-all text-left mt-2"
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/20">
                      <LogOut className="w-4 h-4" />
                    </div>
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <NavLink
                    to="/login/customer"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-card border border-border/50 text-sm font-bold text-text-primary hover:border-primary/30 hover:shadow-md transition-all text-center"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <User className="w-5 h-5" />
                    </div>
                    Sign In
                  </NavLink>
                  <NavLink
                    to="/login/seller"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-primary text-white shadow-md text-sm font-bold hover:bg-primary-hover hover:-translate-y-1 transition-all text-center"
                  >
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white">
                      <Store className="w-5 h-5" />
                    </div>
                    Sell Locally
                  </NavLink>
                </div>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Bottom absolute location picker is redundant due to nav-relative one above */}
    </header>
  );
}
