import { useState, useEffect } from 'react';
import {
    User,
    ShoppingBag,
    Heart,
    History,
    MapPin,
    Settings,
    ChevronRight,
    LogOut,
    Package,
    TrendingUp,
    Clock,
    Star,
    Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import MyOrdersPage from './MyOrdersPage';
import WishlistPage from './WishlistPage';
import OrderTrackingTimeline from './OrderTrackingTimeline';
import BargainPage from '../BargainPage';
import ProfileSection from './ProfileSection';
import AddressSection from './AddressSection';
import ReviewsPage from './ReviewsPage';
import api from '../../services/apiClient';
import { Product, Order } from '../../types';

import { useNavigate } from 'react-router-dom';

type TabId = 'overview' | 'profile' | 'orders' | 'wishlist' | 'bargains' | 'addresses' | 'settings' | 'reviews';

export default function UserDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<TabId>('overview');

    useEffect(() => {
        if (user) {
            if (user.role === 'seller') navigate('/dashboard/seller');
            if (user.role === 'admin') navigate('/admin');
        }
    }, [user, navigate]);

    const menuItems = [
        { id: 'overview', label: 'Overview', icon: TrendingUp },
        { id: 'profile', label: 'My Profile', icon: User },
        { id: 'orders', label: 'My Orders', icon: ShoppingBag },
        { id: 'wishlist', label: 'Wishlist', icon: Heart },
        { id: 'bargains', label: 'Bargain History', icon: History },
        { id: 'reviews', label: 'My Reviews', icon: Star },
        { id: 'addresses', label: 'Addresses', icon: MapPin },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return <DashboardOverview onTabChange={setActiveTab} />;
            case 'profile':
                return <ProfileSection />;
            case 'orders':
                return <MyOrdersPage />;
            case 'wishlist':
                return <WishlistPage />;
            case 'bargains':
                return <BargainPage />;
            case 'reviews':
                return <ReviewsPage />;
            case 'addresses':
                return <AddressSection />;
            default:
                return (
                    <div className="flex flex-col items-center justify-center min-h-[400px] text-center bg-card rounded-3xl border border-border p-12">
                        <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center mb-6 text-text-secondary/50">
                            <Settings className="w-10 h-10" />
                        </div>
                        <h2 className="text-2xl font-black text-text-primary uppercase tracking-tight mb-2">{activeTab} Coming Soon</h2>
                        <p className="text-text-secondary font-medium max-w-xs">We're working hard to bring this feature to your neighborhood dashboard.</p>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-background pb-24 pt-8 relative overflow-hidden">
            {/* Background Orbs */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -z-10" />
            <div className="absolute bottom-1/4 -left-1/4 w-[800px] h-[800px] bg-bargain/5 rounded-full blur-[150px] -z-10" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Sidebar */}
                    <aside className={`lg:w-72 flex-shrink-0`}>
                        <div className="glass-panel overflow-hidden sticky top-28 p-2">
                            {/* User Profile Summary */}
                            <div className="p-6 border-b border-border bg-background/50 rounded-t-[2rem]">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-primary/30">
                                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <div className="overflow-hidden">
                                        <h3 className="font-heading font-black text-text-primary truncate">{user?.name || 'Customer'}</h3>
                                        <p className="text-[10px] text-text-secondary font-black uppercase tracking-widest truncate">{user?.email}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Navigation Menu */}
                            <nav className="p-4 space-y-2">
                                {menuItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = activeTab === item.id;

                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => setActiveTab(item.id as TabId)}
                                            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black uppercase text-[11px] tracking-widest transition-all group ${isActive
                                                ? 'bg-primary text-white shadow-xl shadow-primary/30 translate-x-2'
                                                : 'text-text-secondary hover:bg-white/50 hover:text-text-primary'
                                                }`}
                                        >
                                            <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-text-secondary group-hover:text-primary'}`} />
                                            <span className="flex-1 text-left">{item.label}</span>
                                            {isActive && <ChevronRight className="w-4 h-4" />}
                                        </button>
                                    );
                                })}

                                <div className="pt-6 mt-6 border-t border-border/50">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black uppercase text-[11px] tracking-widest text-danger hover:bg-danger/10 transition-all group"
                                    >
                                        <LogOut className="w-5 h-5 text-danger transition-transform group-hover:scale-110" />
                                        <span className="flex-1 text-left">Sign Out</span>
                                    </button>
                                </div>
                            </nav>
                        </div>
                    </aside>

                    {/* Main Content Area */}
                    <main className="flex-1 min-w-0">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {renderContent()}
                            </motion.div>
                        </AnimatePresence>
                    </main>
                </div>
            </div>
        </div>
    );
}

function DashboardOverview({ onTabChange }: { onTabChange: (tab: TabId) => void }) {
    const navigate = useNavigate();
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);
    const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
    const [nearbyStores, setNearbyStores] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [ordersRes, productsRes] = await Promise.all([
                    api.get('/orders/my-orders?limit=2'),
                    api.get('/products?limit=4&sort=-soldCount')
                ]);

                if (ordersRes.data.success) {
                    setRecentOrders(ordersRes.data.data.orders);
                }
                if (productsRes.data.success) {
                    setRecommendedProducts(productsRes.data.data);
                }

                // For nearby stores, we'll fetch top rated sellers
                const storesRes = await api.get('/products?limit=3&sort=-rating');
                if (storesRes.data.success) {
                    const uniqueSellers = Array.from(new Set(storesRes.data.data.map((p: any) => p.sellerId))).map(id => {
                        return storesRes.data.data.find((p: any) => p.sellerId === id);
                    });
                    setNearbyStores(uniqueSellers);
                }
            } catch (err) {
                console.error('Failed to fetch dashboard data', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);


    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-5xl font-heading font-black text-text-primary uppercase tracking-tight">Neighborhood Portal</h1>
                    <p className="text-text-secondary font-bold mt-2 text-lg">Managing transactions in your local hub.</p>
                </div>
                <div className="bg-card px-8 py-4 rounded-3xl border border-border shadow-sm flex items-center gap-4">
                    <div className="w-3 h-3 bg-seller rounded-full animate-pulse shadow-seller shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
                    <span className="text-xs font-black text-text-primary uppercase tracking-widest">Live Node Connection</span>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-primary rounded-3xl p-8 text-white shadow-xl shadow-primary/20 flex flex-col justify-between min-h-[160px] relative overflow-hidden group">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-card/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700" />
                    <div className="relative z-10">
                        <p className="text-xs font-bold text-white/70 uppercase tracking-widest mb-1">Total Savings</p>
                        <h3 className="text-4xl font-black italic">₹1,240</h3>
                    </div>
                    <div className="relative z-10 flex items-center gap-2 text-xs font-bold uppercase tracking-widest mt-4">
                        <TrendingUp className="w-4 h-4" />
                        <span>Via Local Bargains</span>
                    </div>
                </div>

                <div className="bg-card rounded-3xl p-8 border border-border shadow-sm flex flex-col justify-between min-h-[160px]">
                    <div>
                        <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-1">Active Orders</p>
                        <h3 className="text-4xl font-black text-text-primary">{recentOrders.length.toString().padStart(2, '0')}</h3>
                    </div>
                    <button onClick={() => onTabChange('orders')} className="text-primary font-bold text-xs uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all">
                        View All <ChevronRight className="w-4 h-4" />
                    </button>
                </div>

                <div className="bg-card rounded-3xl p-8 border border-border shadow-sm flex flex-col justify-between min-h-[160px]">
                    <div>
                        <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-1">Pending Deals</p>
                        <h3 className="text-4xl font-black text-text-primary">01</h3>
                    </div>
                    <button onClick={() => onTabChange('bargains')} className="text-primary font-bold text-xs uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all">
                        Open Chat <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Main Grid: Orders + Tracking */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

                {/* Recent Orders Card */}
                <Card className="p-0 border-border overflow-hidden shadow-md">
                    <div className="px-8 py-6 border-b border-border flex items-center justify-between bg-background">
                        <h3 className="text-sm font-black text-text-primary uppercase tracking-widest flex items-center gap-2">
                            <ShoppingBag className="w-4 h-4 text-primary" />
                            Recent Orders
                        </h3>
                        <button onClick={() => onTabChange('orders')} className="text-xs font-bold text-primary uppercase hover:underline">See Path</button>
                    </div>
                    <div className="divide-y divide-border">
                        {isLoading ? (
                            Array(2).fill(0).map((_, i) => (
                                <div key={i} className="px-8 py-6 animate-pulse">
                                    <div className="h-4 bg-border rounded w-1/4 mb-4" />
                                    <div className="h-3 bg-border rounded w-1/2" />
                                </div>
                            ))
                        ) : recentOrders.length > 0 ? (
                            recentOrders.map((order) => (
                                <div key={order._id} className="px-8 py-6 hover:bg-background/50 transition-colors group">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-black text-text-primary uppercase text-sm">{order.orderId}</span>
                                        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${order.orderStatus === 'Delivered' ? 'bg-seller/10 text-seller' : 'bg-primary/10 text-primary'
                                            }`}>
                                            {order.orderStatus}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-xs font-bold text-text-secondary uppercase tracking-wider">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-3 h-3" />
                                            <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                                            <span className="mx-1">•</span>
                                            <span>{order.items.length} Items</span>
                                        </div>
                                        <span className="text-text-primary font-black">₹{order.totalAmount.toLocaleString()}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="px-8 py-12 text-center">
                                <p className="text-text-secondary font-black uppercase text-[10px] tracking-widest">No Recent Activity</p>
                            </div>
                        )}
                    </div>

                    {recentOrders.length > 0 && (
                        <div className="p-8 bg-background/50 border-t border-border">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-10 h-10 bg-card rounded-xl shadow-sm border border-border flex items-center justify-center text-primary">
                                    <Package className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest leading-none">Status for {recentOrders[0].orderId}</p>
                                    <p className="text-sm font-black text-text-primary uppercase">{recentOrders[0].orderStatus}</p>
                                </div>
                            </div>
                            <OrderTrackingTimeline currentStatus={recentOrders[0].orderStatus.toLowerCase() as any} />
                        </div>
                    )}
                </Card>

                <div className="space-y-8">
                    {/* RECOMMENDED PRODUCTS SECTION */}
                    <Card className="p-0 border-border overflow-hidden shadow-md">
                        <div className="px-8 py-6 border-b border-border flex items-center justify-between bg-primary/5">
                            <h3 className="text-sm font-black text-text-primary uppercase tracking-widest flex items-center gap-2">
                                <Zap className="w-4 h-4 text-primary" />
                                Recommended for You
                            </h3>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-2 gap-4">
                                {isLoading ? (
                                    Array(2).fill(0).map((_, i) => <div key={i} className="h-48 bg-border/50 animate-pulse rounded-2xl" />)
                                ) : recommendedProducts.slice(0, 2).map((product) => (
                                    <div key={product.id} className="group cursor-pointer" onClick={() => navigate(`/product/${product.id}`)}>
                                        <div className="aspect-square bg-background rounded-2xl overflow-hidden mb-3 border border-border group-hover:border-primary/50 transition-colors">
                                            <img src={(product as any).images?.[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        </div>
                                        <h4 className="text-[10px] font-black text-text-primary uppercase truncate">{product.name}</h4>
                                        <p className="text-[10px] font-black text-primary">₹{product.price.toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>

                    {/* NEARBY DEALS SECTION */}
                    <Card className="p-0 border-border overflow-hidden shadow-md">
                        <div className="px-8 py-6 border-b border-border flex items-center justify-between bg-seller/5">
                            <h3 className="text-sm font-black text-text-primary uppercase tracking-widest flex items-center gap-2">
                                <Star className="w-4 h-4 text-seller" />
                                Top-Rated Nearby
                            </h3>
                        </div>
                        <div className="p-6 space-y-4">
                            {isLoading ? (
                                Array(2).fill(0).map((_, i) => <div key={i} className="h-16 bg-border/5 animate-pulse rounded-xl" />)
                            ) : nearbyStores.map((store: any, i) => (
                                <div key={i} className="flex items-center gap-4 bg-background p-3 rounded-2xl border border-border hover:border-seller/50 transition-all cursor-pointer">
                                    <div className="w-12 h-12 rounded-xl bg-seller/10 flex items-center justify-center text-seller">
                                        <Package className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-[10px] font-black text-text-primary uppercase">{store.storeName || 'Local Tech Hub'}</h4>
                                        <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest">Verified Seller • {store.rating || 5}★</p>
                                    </div>
                                    <Button variant="ghost" size="sm" className="p-2">
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Membership / Rewards Card */}
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-500">
                            <Heart className="w-24 h-24" />
                        </div>
                        <h4 className="text-lg font-black text-white uppercase tracking-tight mb-2">Neighborhood Elite</h4>
                        <p className="text-white/60 text-xs font-medium max-w-[200px] mb-6">Enjoy free deliveries on orders above ₹500 from verified stores.</p>
                        <div className="flex items-center gap-4">
                            <div className="flex-1 h-2 bg-card/10 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: '65%' }}
                                    className="h-full bg-primary"
                                />
                            </div>
                            <span className="text-[10px] text-white font-black uppercase tracking-widest">650 / 1000 Pts</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

