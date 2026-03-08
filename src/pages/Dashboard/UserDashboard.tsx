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
    Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import MyOrdersPage from './MyOrdersPage';
import WishlistPage from './WishlistPage';
import OrderTrackingTimeline from './OrderTrackingTimeline';
import BargainPage from '../BargainPage';
import ReviewsPage from './ReviewsPage';
import ProfileSection from './ProfileSection';

import { useNavigate } from 'react-router-dom';

type TabId = 'overview' | 'profile' | 'orders' | 'wishlist' | 'bargains' | 'addresses' | 'settings' | 'reviews';

export default function UserDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<TabId>('overview');

    useEffect(() => {
        if (user) {
            if (user.role === 'seller') navigate('/dashboard/seller');
            if (user.role === 'admin') navigate('/dashboard/admin');
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
        <div className="min-h-screen bg-background/50 pt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Sidebar */}
                    <aside className={`lg:w-72 flex-shrink-0`}>
                        <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden sticky top-24">
                            {/* User Profile Summary */}
                            <div className="p-6 border-b border-border bg-background">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-primary/20">
                                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <div className="overflow-hidden">
                                        <h3 className="font-black text-text-primary truncate">{user?.name || 'Customer'}</h3>
                                        <p className="text-xs text-text-secondary font-bold uppercase tracking-widest truncate">{user?.email}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Navigation Menu */}
                            <nav className="p-4 space-y-1">
                                {menuItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = activeTab === item.id;

                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => setActiveTab(item.id as TabId)}
                                            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all group ${isActive
                                                ? 'bg-primary text-white shadow-md shadow-primary/20 translate-x-1'
                                                : 'text-text-secondary hover:bg-background hover:text-text-primary'
                                                }`}
                                        >
                                            <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-text-secondary group-hover:text-primary'}`} />
                                            <span className="flex-1 text-left">{item.label}</span>
                                            {isActive && <ChevronRight className="w-4 h-4" />}
                                        </button>
                                    );
                                })}

                                <div className="pt-4 mt-4 border-t border-border">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-danger hover:bg-danger/10 transition-all group"
                                    >
                                        <LogOut className="w-5 h-5 text-danger transition-transform group-hover:scale-110" />
                                        <span className="flex-1 text-left">Logout</span>
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
    // Mock data for overview
    const recentOrders = [
        { id: 'ORD-82736', date: '2 hours ago', status: 'shipped', amount: 2450, items: 3 },
        { id: 'ORD-81622', date: 'Yesterday', status: 'delivered', amount: 1200, items: 1 },
    ];

    const activeBargains = [
        { id: 'BGN-102', product: 'Traditional Silk Saree', lastOffer: 4500, status: 'countered' },
    ];

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-4xl font-black text-text-primary uppercase tracking-tight">Your Dashboard</h1>
                    <p className="text-text-secondary font-medium mt-1">Manage your local neighborhood orders and deals.</p>
                </div>
                <div className="bg-card px-6 py-3 rounded-2xl border border-border shadow-sm flex items-center gap-3">
                    <div className="w-2 h-2 bg-seller rounded-full animate-pulse" />
                    <span className="text-xs font-black text-text-primary uppercase tracking-widest">Active Session</span>
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
                        <h3 className="text-4xl font-black text-text-primary">03</h3>
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
                        {recentOrders.map((order) => (
                            <div key={order.id} className="px-8 py-6 hover:bg-background/50 transition-colors group">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-black text-text-primary uppercase text-sm">{order.id}</span>
                                    <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${order.status === 'delivered' ? 'bg-seller/10 text-seller' : 'bg-primary/10 text-primary'
                                        }`}>
                                        {order.status}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-xs font-bold text-text-secondary uppercase tracking-wider">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-3 h-3" />
                                        <span>{order.date}</span>
                                        <span className="mx-1">•</span>
                                        <span>{order.items} Items</span>
                                    </div>
                                    <span className="text-text-primary font-black">₹{order.amount.toLocaleString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-8 bg-background/50 border-t border-border">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-10 h-10 bg-card rounded-xl shadow-sm border border-border flex items-center justify-center text-primary">
                                <Package className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest leading-none">Status for {recentOrders[0].id}</p>
                                <p className="text-sm font-black text-text-primary uppercase">Incoming Shipment</p>
                            </div>
                        </div>
                        <OrderTrackingTimeline currentStatus="shipped" />
                    </div>
                </Card>

                <div className="space-y-8">
                    {/* Active Bargains Card */}
                    <Card className="p-0 border-border overflow-hidden shadow-md">
                        <div className="px-8 py-6 border-b border-border flex items-center justify-between bg-warning/10">
                            <h3 className="text-sm font-black text-text-primary uppercase tracking-widest flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-warning" />
                                Active Bargains
                            </h3>
                            <span className="bg-warning/20 text-warning px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Action Needed</span>
                        </div>
                        <div className="p-8">
                            {activeBargains.map((bargain) => (
                                <div key={bargain.id} className="flex flex-col gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-20 h-20 bg-background rounded-2xl p-2 border border-border">
                                            {/* Product Image Placeholder */}
                                            <div className="w-full h-full bg-border/50 rounded-lg animate-pulse" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-black text-text-primary uppercase text-sm leading-tight mb-1">{bargain.product}</h4>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-text-secondary uppercase tracking-widest">Counter Offer:</span>
                                                <span className="text-sm font-black text-warning font-mono">₹{bargain.lastOffer.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 mt-2">
                                        <Button size="sm" variant="seller" className="rounded-xl font-black text-[10px] uppercase shadow-md shadow-seller/20">Accept Deal</Button>
                                        <Button variant="outline" size="sm" className="rounded-xl font-black text-[10px] uppercase border-2">Post Offer</Button>
                                    </div>
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
