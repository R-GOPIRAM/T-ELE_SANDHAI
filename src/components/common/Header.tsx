import React from 'react';
import { ShoppingCart, User, Store, Menu, Home, Heart } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { useWishlist } from '../../context/WishlistContext';
import Button from './Button';

interface HeaderProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export default function Header({ currentPage, onPageChange }: HeaderProps) {
  const { user, logout } = useAuth();
  const { getTotalItems } = useCart();
  const { wishlistItems } = useWishlist();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    onPageChange('home');
  };

  const MobileMenu = () => {
    if (!isMobileMenuOpen) return null;
    return (
      <div className="md:hidden bg-white border-t border-gray-200 py-2 px-4 shadow-lg absolute w-full left-0 top-16">
        <nav className="flex flex-col space-y-4">
          <button
            onClick={() => { onPageChange('home'); setIsMobileMenuOpen(false); }}
            className={`text-left text-sm font-medium ${currentPage === 'home' ? 'text-blue-600' : 'text-gray-700'}`}
          >
            Home
          </button>
          <button
            onClick={() => { onPageChange('browse'); setIsMobileMenuOpen(false); }}
            className={`text-left text-sm font-medium ${currentPage === 'browse' ? 'text-blue-600' : 'text-gray-700'}`}
          >
            Browse Products
          </button>

          {user?.role === 'seller' && (
            <>
              <button
                onClick={() => { onPageChange('seller-dashboard'); setIsMobileMenuOpen(false); }}
                className={`text-left text-sm font-medium ${currentPage === 'seller-dashboard' ? 'text-blue-600' : 'text-gray-700'}`}
              >
                My Dashboard
              </button>
              <button
                onClick={() => { onPageChange('seller-orders'); setIsMobileMenuOpen(false); }}
                className={`text-left text-sm font-medium ${currentPage === 'seller-orders' ? 'text-blue-600' : 'text-gray-700'}`}
              >
                My Orders
              </button>
            </>
          )}

          {user?.role === 'customer' && (
            <button
              onClick={() => { onPageChange('my-orders'); setIsMobileMenuOpen(false); }}
              className={`text-left text-sm font-medium ${currentPage === 'my-orders' ? 'text-blue-600' : 'text-gray-700'}`}
            >
              My Orders
            </button>
          )}

          {user?.role === 'admin' && (
            <button
              onClick={() => { onPageChange('seller-verification'); setIsMobileMenuOpen(false); }}
              className={`text-left text-sm font-medium ${currentPage === 'seller-verification' ? 'text-blue-600' : 'text-gray-700'}`}
            >
              Verify Sellers
            </button>
          )}

          {user && (
            <button
              onClick={() => { onPageChange('profile'); setIsMobileMenuOpen(false); }}
              className={`text-left text-sm font-medium ${currentPage === 'profile' ? 'text-blue-600' : 'text-gray-700'}`}
            >
              Edit Profile
            </button>
          )}
        </nav>
      </div>
    );
  };

  const NavLink = ({ page, label, icon: Icon }: { page: string, label: string, icon?: any }) => (
    <button
      onClick={() => onPageChange(page)}
      className={`group flex items-center space-x-1.5 text-sm font-bold transition-all duration-300 relative py-2 ${currentPage === page
        ? 'text-blue-600'
        : 'text-gray-500 hover:text-gray-900'
        }`}
    >
      {Icon && <Icon className={`h-4 w-4 transition-transform duration-300 ${currentPage === page ? 'text-blue-600' : 'group-hover:-translate-y-0.5 group-hover:text-blue-500'}`} />}
      <span>{label}</span>
      <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-transform origin-left duration-300 ${currentPage === page ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
    </button>
  );

  return (
    <header className="bg-white/70 backdrop-blur-xl shadow-sm sticky top-0 z-50 border-b border-gray-100 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden mr-2 text-gray-500 hover:text-blue-600 focus:outline-none transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
            <button
              onClick={() => onPageChange('home')}
              className="flex items-center space-x-2 text-2xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-700 transition-transform duration-300 hover:scale-105"
            >
              <div className="p-1.5 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg shadow-md shadow-blue-500/20">
                <Store className="h-6 w-6 text-white" />
              </div>
              <span className="hidden sm:inline ml-2">T-ELE Sandhai</span>
            </button>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <NavLink page="home" label="Home" icon={Home} />
            <NavLink page="browse" label="Browse Products" />

            {user?.role === 'seller' && (
              <>
                <NavLink page="seller-dashboard" label="My Dashboard" />
                <NavLink page="seller-orders" label="My Orders" />
              </>
            )}

            {user?.role === 'customer' && (
              <NavLink page="my-orders" label="My Orders" />
            )}

            {user?.role === 'admin' && (
              <NavLink page="seller-verification" label="Verify Sellers" />
            )}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-4 lg:space-x-6">
            {user?.role === 'customer' && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onPageChange('wishlist')}
                  className="relative p-2 text-gray-600 hover:text-pink-500 transition-all duration-300 hover:scale-110"
                >
                  <Heart className="h-6 w-6" />
                  {wishlistItems && wishlistItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-md">
                      {wishlistItems.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => onPageChange('cart')}
                  className="relative p-2 text-gray-600 hover:text-blue-600 transition-all duration-300 hover:scale-110"
                >
                  <ShoppingCart className="h-6 w-6" />
                  {getTotalItems() > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-rose-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-md">
                      {getTotalItems()}
                    </span>
                  )}
                </button>
              </div>
            )}

            {user ? (
              <div className="flex items-center space-x-3">
                <div className="hidden lg:flex items-center space-x-3 text-sm px-4 py-1.5 bg-gray-50 rounded-full border border-gray-100 shadow-sm">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 flex items-center justify-center">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-900 leading-tight">{user.name}</span>
                    <span className="text-xs text-blue-600 capitalize font-medium">{user.role}</span>
                  </div>
                </div>
                <div className="hidden sm:block">
                  <Button onClick={() => onPageChange('profile')} variant="outline" size="sm">
                    Edit Profile
                  </Button>
                </div>
                <Button onClick={handleLogout} variant="outline" size="sm">
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Button onClick={() => onPageChange('login')} variant="outline" size="sm">
                  Sign In
                </Button>
                <div className="hidden sm:block">
                  <Button onClick={() => onPageChange('seller-register')} size="sm">
                    Become a Seller
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <MobileMenu />
    </header>
  );
}
