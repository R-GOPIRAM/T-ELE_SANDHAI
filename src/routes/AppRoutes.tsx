import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import DashboardLayout from '../components/layout/DashboardLayout';
import AuthLayout from '../components/layout/AuthLayout';
import ProtectedRoute from './ProtectedRoute';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ScrollToTop from '../components/common/ScrollToTop';

// Lazy load pages
const HomePage = lazy(() => import('../pages/HomePage'));
const ProductsPage = lazy(() => import('../pages/ProductsPage'));
const ProductDetailsPage = lazy(() => import('../pages/ProductDetailsPage'));
const StorePage = lazy(() => import('../pages/StorePage'));
const CartPage = lazy(() => import('../pages/CartPage'));
const CheckoutPage = lazy(() => import('../pages/CheckoutPage'));
const OrderConfirmationPage = lazy(() => import('../pages/OrderConfirmationPage'));
const OrderTrackingPage = lazy(() => import('../pages/OrderTrackingPage'));
const CustomerLoginPage = lazy(() => import('../pages/auth/CustomerLoginPage'));
const SellerLoginPage = lazy(() => import('../pages/auth/SellerLoginPage'));
const AdminLoginPage = lazy(() => import('../pages/auth/AdminLoginPage'));
const BargainPage = lazy(() => import('../pages/BargainPage'));

// Dashboard Pages
const UserDashboard = lazy(() => import('../pages/Dashboard/UserDashboard'));
const SellerDashboard = lazy(() => import('../pages/Dashboard/SellerDashboard'));
const MyOrdersPage = lazy(() => import('../pages/Dashboard/MyOrdersPage'));
const WishlistPage = lazy(() => import('../pages/Dashboard/WishlistPage'));
const SellerOrdersPage = lazy(() => import('../pages/Dashboard/SellerOrdersPage'));
const SellerRegistrationPage = lazy(() => import('../pages/Dashboard/SellerRegistrationPage'));
const SellerVerificationPage = lazy(() => import('../pages/Dashboard/SellerVerificationPage'));
const AddProductPage = lazy(() => import('../pages/Dashboard/AddProductPage'));
const ReviewsPage = lazy(() => import('../pages/Dashboard/ReviewsPage'));
const LogisticsDashboard = lazy(() => import('../pages/Admin/LogisticsDashboard'));
const StoreManagement = lazy(() => import('../pages/Admin/StoreManagement'));
const SellerApprovalPage = lazy(() => import('../pages/Admin/SellerApprovalPage'));

const AppRoutes = () => {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>}>
            <ScrollToTop />
            <Routes>
                {/* Auth Routes */}
                <Route path="/login" element={<AuthLayout />}>
                    <Route path="customer" element={<CustomerLoginPage />} />
                    <Route path="seller" element={<SellerLoginPage />} />
                    <Route path="admin" element={<AdminLoginPage />} />
                    <Route index element={<Navigate to="customer" replace />} />
                </Route>

                {/* Main Shop Routes */}
                <Route path="/" element={<MainLayout />}>
                    <Route index element={<HomePage />} />
                    <Route path="products" element={<ProductsPage />} />
                    <Route path="product/:id" element={<ProductDetailsPage />} />
                    <Route path="store/:id" element={<StorePage />} />
                    <Route path="cart" element={<CartPage />} />

                    {/* Customer Protected Flow */}
                    <Route element={<ProtectedRoute allowedRoles={['customer']} />}>
                        <Route path="checkout" element={<CheckoutPage />} />
                        <Route path="order-confirmation" element={<OrderConfirmationPage />} />
                        <Route path="track/:awb" element={<OrderTrackingPage />} />
                    </Route>
                </Route>

                {/* Seller Registration (Independent) */}
                <Route element={<ProtectedRoute allowedRoles={['seller']} />}>
                    <Route path="/seller-register" element={<SellerRegistrationPage />} />
                </Route>

                {/* User Dashboard */}
                <Route path="/dashboard" element={<ProtectedRoute />}>
                    <Route element={<DashboardLayout />}>
                        <Route index element={<UserDashboard />} />
                        <Route path="orders" element={<MyOrdersPage />} />
                        <Route path="wishlist" element={<WishlistPage />} />
                        <Route path="bargains" element={<BargainPage />} />
                        <Route path="reviews" element={<ReviewsPage />} />
                        <Route path="settings" element={<div>Settings (Coming Soon)</div>} />

                        {/* Seller Dashboard Nesting */}
                        <Route element={<ProtectedRoute allowedRoles={['seller']} />}>
                            <Route path="seller" element={<SellerDashboard />} />
                            <Route path="seller/orders" element={<SellerOrdersPage />} />
                            <Route path="seller/add-product" element={<AddProductPage />} />
                            <Route path="seller/verification" element={<SellerVerificationPage />} />
                        </Route>
                    </Route>
                </Route>

                {/* Admin Panel */}
                <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']} />}>
                    <Route element={<DashboardLayout />}>
                        <Route index element={<Navigate to="logistics" replace />} />
                        <Route path="logistics" element={<LogisticsDashboard />} />
                        <Route path="stores" element={<StoreManagement />} />
                        <Route path="seller-approval" element={<SellerApprovalPage />} />
                        <Route path="settings" element={<div>Admin Settings (Coming Soon)</div>} />
                    </Route>
                </Route>

                {/* Redirects */}
                <Route path="/customer/dashboard" element={<Navigate to="/dashboard" replace />} />
                <Route path="/seller/dashboard" element={<Navigate to="/dashboard/seller" replace />} />
                <Route path="/admin/dashboard" element={<Navigate to="/admin/logistics" replace />} />

                {/* 404 Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Suspense>
    );
};

export default AppRoutes;
