import { useCallback, useEffect, useState } from 'react';
import { ChevronRight, Package, TrendingUp, Clock, Star, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import OrderTrackingTimeline from './OrderTrackingTimeline';
import api from '../../services/apiClient';
import { Order, Product } from '../../types';

export default function UserDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) return;
        if (user.role === 'seller') navigate('/dashboard/seller');
        if (user.role === 'admin') navigate('/admin');
    }, [user, navigate]);

    return <DashboardOverview />;
}

function DashboardOverview() {
    const navigate = useNavigate();
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);
    const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
    const [nearbyStores, setNearbyStores] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const getProductId = useCallback((p: Product) => {
        return (p as unknown as { id?: string; _id?: string }).id || (p as unknown as { _id?: string })._id || '';
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [ordersRes, productsRes] = await Promise.all([
                    api.get('/orders/my-orders?limit=2'),
                    api.get('/products?limit=4&sort=-soldCount'),
                ]);

                if (ordersRes.data.success) {
                    setRecentOrders(ordersRes.data.data.orders);
                }

                if (productsRes.data.success) {
                    const payload = productsRes.data?.data;
                    const products = Array.isArray(payload)
                        ? payload
                        : Array.isArray(payload?.products)
                            ? payload.products
                            : [];
                    setRecommendedProducts(products);
                }

                // For nearby stores, we'll fetch top rated sellers
                const storesRes = await api.get('/products?limit=3&sort=-rating');
                if (storesRes.data.success) {
                    const payload = storesRes.data?.data;
                    const products = (Array.isArray(payload)
                        ? payload
                        : Array.isArray(payload?.products)
                            ? payload.products
                            : []) as Product[];

                    const sellerIds = Array.from(new Set(products.map((p) => p.sellerId)));
                    const uniqueSellers = sellerIds
                        .map((id) => products.find((p) => p.sellerId === id))
                        .filter((p): p is Product => Boolean(p));
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

    type TimelineStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    const toTimelineStatus = (status: string | undefined): TimelineStatus => {
        const s = (status || '').toLowerCase();
        if (s === 'confirmed') return 'confirmed';
        if (s === 'processing') return 'processing';
        if (s === 'shipped') return 'shipped';
        if (s === 'delivered') return 'delivered';
        if (s === 'cancelled') return 'cancelled';
        return 'pending';
    };

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
                        <h2 className="text-5xl font-black tracking-tighter mt-2">₹1,240</h2>
                    </div>
                    <div className="relative z-10 flex items-center gap-2 mt-4 text-xs font-black uppercase tracking-widest">
                        <TrendingUp className="w-4 h-4" />
                        <span>Via Local Bargains</span>
                    </div>
                </div>

                <div className="bg-card rounded-3xl border border-border p-8 shadow-sm min-h-[160px] flex flex-col justify-between">
                    <div>
                        <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-1">Active Orders</p>
                        <h2 className="text-5xl font-black tracking-tighter text-text-primary mt-2">00</h2>
                    </div>
                    <button
                        onClick={() => navigate('/dashboard/orders')}
                        className="text-primary font-bold text-xs uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all"
                    >
                        View All <ChevronRight className="w-4 h-4" />
                    </button>
                </div>

                <div className="bg-card rounded-3xl border border-border p-8 shadow-sm min-h-[160px] flex flex-col justify-between">
                    <div>
                        <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-1">Pending Deals</p>
                        <h2 className="text-5xl font-black tracking-tighter text-text-primary mt-2">01</h2>
                    </div>
                    <button
                        onClick={() => navigate('/dashboard/bargains')}
                        className="text-primary font-bold text-xs uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all"
                    >
                        Open Chat <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Recent Orders */}
                <Card className="xl:col-span-2 p-0 border-border overflow-hidden shadow-md">
                    <div className="px-8 py-6 border-b border-border flex items-center justify-between bg-background/30">
                        <h3 className="text-sm font-black text-text-primary uppercase tracking-widest flex items-center gap-2">
                            <Clock className="w-4 h-4 text-primary" />
                            Recent Orders
                        </h3>
                        <button
                            onClick={() => navigate('/dashboard/orders')}
                            className="text-xs font-bold text-primary uppercase hover:underline"
                        >
                            See Path
                        </button>
                    </div>

                    <div className="p-8">
                        {recentOrders.length === 0 ? (
                            <div className="min-h-[260px] flex items-center justify-center text-center">
                                <p className="text-text-secondary/60 font-black uppercase tracking-widest text-xs">No Recent Activity</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-card rounded-xl shadow-sm border border-border flex items-center justify-center text-primary">
                                        <Package className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest leading-none">
                                            Status for {recentOrders[0].orderId}
                                        </p>
                                        <p className="text-sm font-black text-text-primary uppercase">{recentOrders[0].orderStatus}</p>
                                    </div>
                                </div>
                                <OrderTrackingTimeline currentStatus={toTimelineStatus(recentOrders[0].orderStatus)} />
                            </div>
                        )}
                    </div>
                </Card>

                <div className="space-y-8">
                    {/* Recommended Products */}
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
                                    Array(2)
                                        .fill(0)
                                        .map((_, i) => (
                                            <div key={i} className="h-48 bg-border/50 animate-pulse rounded-2xl" />
                                        ))
                                ) : (
                                    (Array.isArray(recommendedProducts) ? recommendedProducts : [])
                                        .slice(0, 2)
                                        .map((product) => {
                                            const productId = getProductId(product);
                                            if (!productId) return null;

                                            return (
                                                <div
                                                    key={productId}
                                                    className="group cursor-pointer"
                                                    onClick={() => navigate(`/product/${productId}`)}
                                                >
                                                    <div className="aspect-square bg-background rounded-2xl overflow-hidden mb-3 border border-border group-hover:border-primary/50 transition-colors">
                                                        <img
                                                            src={product.images?.[0]}
                                                            alt={product.name}
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                        />
                                                    </div>
                                                    <h4 className="text-[10px] font-black text-text-primary uppercase truncate">{product.name}</h4>
                                                    <p className="text-[10px] font-black text-primary">₹{product.price.toLocaleString()}</p>
                                                </div>
                                            );
                                        })
                                )}
                            </div>
                        </div>
                    </Card>

                    {/* Nearby Deals */}
                    <Card className="p-0 border-border overflow-hidden shadow-md">
                        <div className="px-8 py-6 border-b border-border flex items-center justify-between bg-seller/5">
                            <h3 className="text-sm font-black text-text-primary uppercase tracking-widest flex items-center gap-2">
                                <Star className="w-4 h-4 text-seller" />
                                Top-Rated Nearby
                            </h3>
                        </div>
                        <div className="p-6 space-y-4">
                            {isLoading ? (
                                Array(2)
                                    .fill(0)
                                    .map((_, i) => <div key={i} className="h-16 bg-border/5 animate-pulse rounded-xl" />)
                            ) : (
                                nearbyStores.map((store) => (
                                    <div
                                        key={getProductId(store) || store.name}
                                        className="flex items-center gap-4 bg-background p-3 rounded-2xl border border-border hover:border-seller/50 transition-all cursor-pointer"
                                        onClick={() => {
                                            const productId = getProductId(store);
                                            if (productId) navigate(`/product/${productId}`);
                                        }}
                                    >
                                        <div className="w-12 h-12 rounded-xl bg-seller/10 flex items-center justify-center text-seller">
                                            <Package className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-[10px] font-black text-text-primary uppercase">
                                                {store.sellerName || 'Local Tech Hub'}
                                            </h4>
                                            <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest">
                                                Verified Seller • {store.rating || 5}★
                                            </p>
                                        </div>
                                        <Button variant="ghost" size="sm" className="p-2">
                                            <ChevronRight className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>

                    {/* Membership / Rewards Card */}
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-500">
                            <Zap className="w-24 h-24" />
                        </div>
                        <h4 className="text-lg font-black text-white uppercase tracking-tight mb-2">Neighborhood Elite</h4>
                        <p className="text-white/60 text-xs font-medium max-w-[200px] mb-6">
                            Enjoy free deliveries on orders above ₹500 from verified stores.
                        </p>
                        <div className="flex items-center gap-4">
                            <div className="flex-1 h-2 bg-card/10 rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: '65%' }} className="h-full bg-primary" />
                            </div>
                            <span className="text-[10px] text-white font-black uppercase tracking-widest">650 / 1000 Pts</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
