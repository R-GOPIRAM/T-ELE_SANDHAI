import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/common/ErrorBoundary';

import Header from './components/common/Header';
import HomePage from './components/pages/HomePage';
import LoginPage from './components/auth/LoginPage';
import SellerRegistrationPage from './components/seller/SellerRegistrationPage';
import ProductBrowser from './components/products/ProductBrowser';
import SellerVerificationPage from './components/admin/SellerVerificationPage';
import SellerDashboard from './components/seller/SellerDashboard';
import AddProductPage from './components/seller/AddProductPage';
import SellerOrdersPage from './components/seller/SellerOrdersPage';
import CartPage from './components/cart/CartPage';
import OrderConfirmationPage from './components/cart/OrderConfirmationPage';
import MyOrdersPage from './components/customer/MyOrdersPage';
import ReviewsPage from './components/customer/ReviewsPage';
import ProductDetailPage from './components/products/ProductDetailPage';
import PaymentPage from './components/payment/PaymentPage';
import BargainPage from './components/bargain/BargainPage';
import WishlistPage from './components/customer/WishlistPage';

import { WishlistProvider } from './context/WishlistContext';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onPageChange={setCurrentPage} />;
      case 'login':
        return <LoginPage onPageChange={setCurrentPage} />;
      case 'seller-register':
        return <SellerRegistrationPage onPageChange={setCurrentPage} />;
      case 'browse':
        return <ProductBrowser onPageChange={setCurrentPage} />;
      case 'seller-verification':
        return <SellerVerificationPage onPageChange={setCurrentPage} />;
      case 'seller-dashboard':
        return <SellerDashboard onPageChange={setCurrentPage} />;
      case 'add-product':
        return <AddProductPage onPageChange={setCurrentPage} />;
      case 'seller-orders':
        return <SellerOrdersPage onPageChange={setCurrentPage} />;
      case 'cart':
        return <CartPage onPageChange={setCurrentPage} />;
      case 'checkout':
      case 'payment':
        return <PaymentPage onPageChange={setCurrentPage} />;
      case 'my-orders':
        return <MyOrdersPage onPageChange={setCurrentPage} />;
      case 'order-confirmation':
        return <OrderConfirmationPage onPageChange={setCurrentPage} />;
      case 'reviews':
        return <ReviewsPage onPageChange={setCurrentPage} />;
      case 'wishlist':
        return <WishlistPage onPageChange={setCurrentPage} />;
      case 'profile':
        return <div>Profile Page (Coming Soon)</div>;
      case 'bargain':
        return <BargainPage onPageChange={setCurrentPage} />;
      default:
        if (currentPage.startsWith('product:')) {
          const productId = currentPage.split(':')[1];
          return <ProductDetailPage onPageChange={setCurrentPage} productId={productId} />;
        }
        if (currentPage.startsWith('payment:')) {
          const orderId = currentPage.split(':')[1];
          return <PaymentPage onPageChange={setCurrentPage} orderId={orderId} />;
        }
        return <HomePage onPageChange={setCurrentPage} />;
    }
  };

  return (
    <ErrorBoundary>
      <WishlistProvider>
        <div className="min-h-screen bg-gray-50">
          <Toaster position="top-right" />
          <Header currentPage={currentPage} onPageChange={setCurrentPage} />
          {renderPage()}
        </div>
      </WishlistProvider>
    </ErrorBoundary>
  );
}

export default App;