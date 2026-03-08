import { useState, useEffect, useRef } from 'react';
import {
  ShoppingCart, Store, Menu, MapPin, Bell, User, Heart,
  ChevronDown, Package, LogOut, Settings, MessageSquare,
  X, TrendingUp, Home, Search, LayoutDashboard, ShieldCheck
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
import { Button } from '../ui/Button';
import { Notification } from '../../types';

const CATEGORIES = [
  { name: 'Smartphones', icon: TrendingUp },
  { name: 'Laptops & PCs', icon: Store },
  { name: 'Audio', icon: MessageSquare },
  { name: 'Wearables', icon: User },
  { name: 'Gaming', icon: Package },
  { name: 'Televisions', icon: Settings },
  { name: 'Smart Home', icon: Bell },
  { name: 'Accessories', icon: TrendingUp },
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
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const categoriesRef = useRef<HTMLDivElement>(null);

  {/* Internal SearchBar was here */ }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/80 backdrop-blur-md shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Main Nav Row */}
        <div className="flex items-center justify-between h-20 gap-4">

          <div className="flex items-center shrink-0">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden mr-3 text-text-secondary hover:text-primary transition-colors focus:outline-none"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <Link
              to="/"
              className="group flex items-center space-x-2.5"
            >
              <div className="p-2 bg-primary rounded-xl shadow-md transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg">
                <Store className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl md:text-[26px] font-heading font-extrabold tracking-tight text-text-primary">
                T-ELE <span className="text-primary">Sandhai</span>
              </span>
            </Link>
          </div>

          {/* Location Selector (Desktop) */}
          <div className="hidden sm:flex" ref={locationRef}>
            <button
              onClick={() => setIsLocationOpen(!isLocationOpen)}
              className="flex flex-col items-start px-3 py-1 hover:bg-background rounded-lg transition-colors"
            >
              <span className="text-[10px] text-text-secondary font-medium uppercase tracking-wider">Delivering to</span>
              <div className="flex items-center text-sm font-semibold text-text-primary">
                <MapPin className="h-4 w-4 mr-1 text-primary" />
                <span className="truncate max-w-[120px]">
                  {currentLoc ? `${currentLoc.area || currentLoc.city}` : 'Select'}
                </span>
                <ChevronDown className="h-4 w-4 ml-1 text-text-secondary/50" />
              </div>
            </button>
          </div>

          {/* Categories Dropdown (Desktop) */}
          <div className="hidden lg:flex relative" ref={categoriesRef}>
            <button
              onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
              className="flex items-center gap-2 px-4 py-2 hover:bg-background rounded-xl transition-all text-sm font-bold text-text-secondary"
            >
              <Menu className="w-4 h-4 text-primary" />
              Categories
              <ChevronDown className={`w-4 h-4 text-text-secondary/50 transition-transform ${isCategoriesOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isCategoriesOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 mt-2 w-[480px] bg-card border border-border shadow-2xl rounded-2xl z-50 p-6 grid grid-cols-2 gap-4"
                >
                  <div className="col-span-2 pb-4 border-b border-gray-50 mb-2">
                    <h3 className="text-xs font-black uppercase tracking-widest text-text-secondary/50">Electronic Categories</h3>
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
                        className="flex items-center gap-4 p-3 hover:bg-primary/10 rounded-xl transition-all group border border-transparent hover:border-primary/20"
                      >
                        <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center group-hover:bg-card group-hover:shadow-sm transition-all">
                          <Icon className="w-5 h-5 text-text-secondary group-hover:text-primary" />
                        </div>
                        <span className="text-sm font-bold text-text-secondary group-hover:text-primary-hover">{cat.name}</span>
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
          <div className="flex items-center space-x-3 md:space-x-5 shrink-0">

            {/* Wishlist & Cart (Always Visible to Customers on Desktop/Tablet) */}
            {(!user || user.role === 'customer') && (
              <div className="hidden md:flex items-center space-x-2 sm:space-x-3">
                <NavLink
                  to="/dashboard/wishlist"
                  className={({ isActive }) => `relative p-2.5 rounded-full transition-all duration-300 ${isActive ? 'text-danger bg-danger/10' : 'text-text-secondary hover:bg-background hover:text-danger hover:scale-105'}`}
                >
                  <Heart className="h-6 w-6" />
                  {wishlistItems && wishlistItems.length > 0 && (
                    <span className="absolute top-0 right-0 bg-pink-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center ring-2 ring-white">
                      {wishlistItems.length}
                    </span>
                  )}
                </NavLink>
                <NavLink
                  to="/cart"
                  className={({ isActive }) => `relative p-2.5 rounded-full transition-all duration-300 ${isActive ? 'text-primary bg-primary/10' : 'text-text-secondary hover:bg-background hover:text-primary hover:scale-105'}`}
                >
                  <ShoppingCart className="h-6 w-6" />
                  {getTotalItems() > 0 && (
                    <span className="absolute top-0 right-0 bg-bargain text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center ring-2 ring-white">
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
                  className="p-2.5 text-text-secondary hover:bg-background hover:text-primary rounded-full transition-all duration-300 hover:scale-105"
                >
                  <Bell className="h-6 w-6" />
                  {notifications.some(n => !n.isRead) && (
                    <span className="absolute top-2 right-2.5 h-2 w-2 bg-red-500 rounded-full ring-2 ring-white"></span>
                  )}
                </button>
                <AnimatePresence>
                  {isNotifOpen && (
                    <NotificationDropdown
                      notifications={notifications}
                      onMarkAsRead={handleMarkAsRead}
                      onMarkAllAsRead={handleMarkAllAsRead}
                    />
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Profile Menu or Auth Buttons */}
            {user ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 p-1 pr-3 border border-border hover:bg-background rounded-full transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary-hover font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden lg:flex flex-col items-start pr-1">
                    <span className="text-sm font-semibold text-text-primary leading-none">{user.name.split(' ')[0]}</span>
                    <span className="text-[10px] text-text-secondary capitalize">{user.role}</span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-text-secondary/50 hidden sm:block" />
                </button>

                {/* Profile Dropdown */}
                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-56 bg-card rounded-xl shadow-xl border border-border py-1 z-50 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-border mb-1 lg:hidden">
                        <p className="text-sm font-semibold text-text-primary">{user.name}</p>
                        <p className="text-xs text-text-secondary capitalize">{user.role}</p>
                      </div>

                      <NavLink
                        to="/dashboard/profile"
                        onClick={() => setIsProfileOpen(false)}
                        className={({ isActive }) => `flex items-center px-4 py-2.5 text-sm transition-colors ${isActive ? 'bg-primary/10 text-primary-hover font-bold' : 'text-text-secondary hover:bg-background'}`}
                      >
                        <User className="h-4 w-4 mr-3 opacity-70" /> My Profile
                      </NavLink>

                      {user.role === 'customer' && (
                        <>
                          <NavLink
                            to="/dashboard"
                            end
                            onClick={() => setIsProfileOpen(false)}
                            className={({ isActive }) => `flex items-center px-4 py-2.5 text-sm transition-colors ${isActive ? 'bg-primary/10 text-primary-hover font-bold' : 'text-text-secondary hover:bg-background'}`}
                          >
                            <LayoutDashboard className="h-4 w-4 mr-3 opacity-70" /> Dashboard
                          </NavLink>
                          <NavLink
                            to="/dashboard/orders"
                            onClick={() => setIsProfileOpen(false)}
                            className={({ isActive }) => `flex items-center px-4 py-2.5 text-sm transition-colors ${isActive ? 'bg-primary/10 text-primary-hover font-bold' : 'text-text-secondary hover:bg-background'}`}
                          >
                            <Package className="h-4 w-4 mr-3 opacity-70" /> My Orders
                          </NavLink>
                          <NavLink
                            to="/dashboard/bargains"
                            onClick={() => setIsProfileOpen(false)}
                            className={({ isActive }) => `flex items-center px-4 py-2.5 text-sm transition-colors ${isActive ? 'bg-primary/10 text-primary-hover font-bold' : 'text-text-secondary hover:bg-background'}`}
                          >
                            <MessageSquare className="h-4 w-4 mr-3 opacity-70" /> My Bargains
                          </NavLink>
                        </>
                      )}

                      {user.role === 'seller' && (
                        <>
                          <NavLink
                            to="/dashboard/seller"
                            end
                            onClick={() => setIsProfileOpen(false)}
                            className={({ isActive }) => `flex items-center px-4 py-2.5 text-sm transition-colors ${isActive ? 'bg-primary/10 text-primary-hover font-bold' : 'text-text-secondary hover:bg-background'}`}
                          >
                            <LayoutDashboard className="h-4 w-4 mr-3 opacity-70" /> Seller Panel
                          </NavLink>
                          <NavLink
                            to="/dashboard/seller/orders"
                            onClick={() => setIsProfileOpen(false)}
                            className={({ isActive }) => `flex items-center px-4 py-2.5 text-sm transition-colors ${isActive ? 'bg-primary/10 text-primary-hover font-bold' : 'text-text-secondary hover:bg-background'}`}
                          >
                            <Package className="h-4 w-4 mr-3 opacity-70" /> Store Orders
                          </NavLink>
                        </>
                      )}

                      {user.role === 'admin' && (
                        <NavLink
                          to="/dashboard/logistics"
                          onClick={() => setIsProfileOpen(false)}
                          className={({ isActive }) => `flex items-center px-4 py-2.5 text-sm transition-colors ${isActive ? 'bg-primary/10 text-primary-hover font-bold' : 'text-text-secondary hover:bg-background'}`}
                        >
                          <ShieldCheck className="h-4 w-4 mr-3 opacity-70" /> Admin Console
                        </NavLink>
                      )}

                      <div className="h-px bg-background my-1"></div>
                      <NavLink
                        to="/dashboard/settings"
                        onClick={() => setIsProfileOpen(false)}
                        className={({ isActive }) => `flex items-center px-4 py-2.5 text-sm transition-colors ${isActive ? 'bg-primary/10 text-primary-hover font-bold' : 'text-text-secondary hover:bg-background'}`}
                      >
                        <Settings className="h-4 w-4 mr-3 opacity-70" /> Settings
                      </NavLink>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-2.5 text-sm text-danger hover:bg-danger/10 transition-colors"
                      >
                        <LogOut className="h-4 w-4 mr-3 opacity-70" /> Sign out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login/customer" className="text-sm font-black text-text-secondary hover:text-primary transition-colors tracking-tight uppercase">
                  Sign In
                </Link>
                <div className="hidden sm:block">
                  <Link to="/login/seller">
                    <Button size="sm" className="rounded-full shadow-lg shadow-primary/20 px-6">
                      Sell Locally
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Search Bar Row (Only visible below md threshold) */}
        <div className="md:hidden pb-4 px-2">
          <SearchBar isMobile={true} />
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-border bg-card overflow-hidden shadow-inner"
          >
            <nav className="flex flex-col py-6 px-6 space-y-2 max-h-[70vh] overflow-y-auto">
              <div className="pb-4 mb-4 border-b border-border">
                <button
                  onClick={() => { setIsLocationOpen(true); setIsMobileMenuOpen(false); }}
                  className="flex items-center gap-3 p-3 w-full bg-background rounded-xl text-left hover:bg-background transition-colors"
                >
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Delivery Location</p>
                    <p className="text-sm font-black text-text-primary truncate">
                      {currentLoc ? `${currentLoc.area || currentLoc.city}, ${currentLoc.pincode}` : 'Select Location'}
                    </p>
                  </div>
                </button>
              </div>

              <NavLink
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold transition-all ${isActive ? 'bg-primary/10 text-primary' : 'text-text-secondary hover:bg-background'}`}
              >
                <Home className="w-5 h-5" /> Home
              </NavLink>

              <NavLink
                to="/products"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold transition-all ${isActive ? 'bg-primary/10 text-primary' : 'text-text-secondary hover:bg-background'}`}
              >
                <Search className="w-5 h-5" /> Shop Categories
              </NavLink>

              <div className="h-px bg-background my-4" />

              <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary/50 mb-2">My Account</p>

              {user ? (
                <>
                  <NavLink
                    to="/dashboard/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold transition-all ${isActive ? 'bg-primary/10 text-primary' : 'text-text-secondary hover:bg-background'}`}
                  >
                    <User className="w-5 h-5" /> Profile
                  </NavLink>
                  {user.role === 'customer' && (
                    <>
                      <NavLink
                        to="/dashboard/orders"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold transition-all ${isActive ? 'bg-primary/10 text-primary' : 'text-text-secondary hover:bg-background'}`}
                      >
                        <Package className="w-5 h-5" /> My Orders
                      </NavLink>
                      <NavLink
                        to="/cart"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold transition-all ${isActive ? 'bg-primary/10 text-primary' : 'text-text-secondary hover:bg-background'}`}
                      >
                        <ShoppingCart className="w-5 h-5" /> My Cart
                      </NavLink>
                    </>
                  )}
                  {user.role === 'seller' && (
                    <NavLink
                      to="/dashboard/seller"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold transition-all ${isActive ? 'bg-primary/10 text-primary' : 'text-text-secondary hover:bg-background'}`}
                    >
                      <LayoutDashboard className="w-5 h-5" /> Seller Dashboard
                    </NavLink>
                  )}
                  <button
                    onClick={() => { logout(); setIsMobileMenuOpen(false); navigate('/'); }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold text-danger hover:bg-danger/10 transition-all text-left"
                  >
                    <LogOut className="w-5 h-5" /> Sign Out
                  </button>
                </>
              ) : (
                <>
                  <NavLink
                    to="/login/customer"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-black text-primary hover:bg-primary/10 transition-all uppercase tracking-tight"
                  >
                    <User className="w-5 h-5" /> Sign In
                  </NavLink>
                  <NavLink
                    to="/login/seller"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-black text-bargain hover:bg-bargain/10 transition-all uppercase tracking-tight"
                  >
                    <Store className="w-5 h-5" /> Sell Locally
                  </NavLink>
                </>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
      <LocationPicker isOpen={isLocationOpen} onClose={() => setIsLocationOpen(false)} />
    </header>
  );
}
