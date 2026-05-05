import { useState, useEffect } from 'react';
import { ShieldCheck, MapPin, Clock, Star, MessageSquare, Phone, Store, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import api from '../services/apiClient';
import { Product } from '../types';
import ProductCard from '../features/products/ProductCard';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

interface StoreData {
    _id: string;
    businessName: string;
    businessAddress: string;
    businessCategory?: string;
    businessDescription?: string;
    verificationStatus: string;
    rating: number;
    joinedAt: string;
}

export default function StoreProfilePage() {
    const { id: storeId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [store, setStore] = useState<StoreData | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();
        window.scrollTo(0, 0);

        const fetchStoreData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch store metadata
                const storeRes = await api.get(`/sellers/store/${storeId}`, { signal: controller.signal });
                if (!controller.signal.aborted) {
                    setStore(storeRes.data.data);
                }

                // Fetch store inventory
                const productsRes = await api.get(`/products?sellerId=${storeId}&limit=50`, { signal: controller.signal });
                if (!controller.signal.aborted && productsRes.data && productsRes.data.data) {
                    setProducts(productsRes.data.data.products || productsRes.data.data);
                }
            } catch (err) {
                const error = err as { name?: string; response?: { data?: { message?: string } } };
                if (error.name !== 'CanceledError' && error.name !== 'AbortError') {
                    const message = error.response?.data?.message || 'Failed to load store profile';
                    setError(message);
                    toast.error(message);
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        if (storeId) fetchStoreData();

        return () => {
            controller.abort();
        };
    }, [storeId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center">
                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
                <h2 className="text-xl font-bold text-text-secondary animate-pulse">Loading Storefront...</h2>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
                <div className="bg-card p-8 rounded-3xl shadow-xl border border-border text-center max-w-md">
                    <div className="w-20 h-20 bg-danger/10 text-danger rounded-full flex items-center justify-center mx-auto mb-6">
                        <Store className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-extrabold text-text-primary mb-2">Oops! Store Unavailable</h2>
                    <p className="text-text-secondary mb-8">{error}</p>
                    <div className="flex gap-4">
                        <Button className="flex-1" onClick={() => navigate('/products')}>Browse Others</Button>
                        <Button variant="outline" className="flex-1" onClick={() => window.location.reload()}>Retry</Button>
                    </div>
                </div>
            </div>
        );
    }

    if (!store && !loading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
                <Store className="w-24 h-24 text-border mb-4" />
                <h2 className="text-2xl font-bold text-text-primary mb-2">Store Not Found</h2>
                <p className="text-text-secondary mb-6">The retailer profile you are looking for does not exist or has been removed.</p>
                <Button onClick={() => navigate('/')}>Return Home</Button>
            </div>
        );
    }

    if (!store) return null;

    const initials = store.businessName?.substring(0, 2).toUpperCase() || 'ST';
    const isVerified = store.verificationStatus === 'approved';

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header Nav */}
            <div className="bg-card/80 backdrop-blur-md sticky top-0 z-40 border-b border-border shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center">
                    <button
                        onClick={() => navigate('/products')}
                        className="flex items-center space-x-2 text-text-secondary hover:text-primary font-semibold transition-colors group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span>Back to Marketplace</span>
                    </button>
                </div>
            </div>

            {/* Hero / Store Banner */}
            <div className="relative bg-gradient-to-r from-primary to-primary-hover text-white overflow-hidden">
                {/* Abstract Pattern Overlay */}
                <div className="absolute inset-0 opacity-10 mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 relative z-10 flex flex-col lg:flex-row items-center lg:items-end gap-8">
                    {/* Store Logo/Avatar */}
                    <div className="w-40 h-40 bg-card rounded-3xl p-2 shadow-2xl shrink-0 -mb-8 lg:-mb-32 relative z-20 overflow-visible border-4 border-background">
                        <div className="w-full h-full bg-primary/10 rounded-2xl flex items-center justify-center text-5xl font-extrabold text-primary shadow-inner">
                            {initials}
                        </div>
                        {isVerified && (
                            <div className="absolute -bottom-2 -right-2 bg-card rounded-full p-1 shadow-lg">
                                <div className="bg-seller rounded-full p-1.5 text-white">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Store Title & Meta */}
                    <div className="flex-1 text-center lg:text-left pt-6 lg:pt-0">
                        <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-6 mb-4">
                            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">{store.businessName}</h1>
                            {isVerified && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-seller/20 text-seller-hover text-sm font-bold uppercase tracking-wider rounded-full border border-seller/30 w-fit mx-auto lg:mx-0">
                                    <ShieldCheck className="w-4 h-4" /> Verified Partner
                                </span>
                            )}
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 sm:gap-8 text-primary/80 font-medium text-lg text-white">
                            <div className="flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-bargain" />
                                <span>{store.businessAddress}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Star className="w-5 h-5 text-warning fill-current" />
                                <span>{store.rating} / 5 Rating</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5 text-bargain" />
                                <span>Since {new Date(store.joinedAt).getFullYear()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Contact Actions */}
                    <div className="flex gap-3 w-full lg:w-auto mt-6 lg:mt-0 flex-col sm:flex-row">
                        <Button className="flex-1 lg:flex-none justify-center bg-card text-primary hover:bg-background shadow-lg text-lg px-8 py-6 rounded-2xl"
                            onClick={() => alert('Message interface would open here')}>
                            <MessageSquare className="w-5 h-5 mr-2" /> Chat Store
                        </Button>
                        <Button variant="outline" className="flex-1 lg:flex-none justify-center bg-transparent border-2 border-card/30 text-white hover:bg-card/10 hover:border-card shadow-lg text-lg px-8 py-6 rounded-2xl"
                            onClick={() => alert(`Calling store...`)}>
                            <Phone className="w-5 h-5 mr-2" /> Call
                        </Button>
                    </div>
                </div>
            </div>

            {/* Analytics & Metrics Ribbon */}
            <div className="bg-card border-b border-border shadow-sm relative z-10 pt-10 pb-6 lg:pt-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:ml-56">
                        <div className="p-4 rounded-xl bg-background border border-border">
                            <div className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-1">Response Time</div>
                            <div className="text-xl font-extrabold text-text-primary">&lt; 2 Hours</div>
                        </div>
                        <div className="p-4 rounded-xl bg-background border border-border">
                            <div className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-1">Delivery Time</div>
                            <div className="text-xl font-extrabold text-text-primary">1-2 Days</div>
                        </div>
                        <div className="p-4 rounded-xl bg-background border border-border">
                            <div className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-1">Total Products</div>
                            <div className="text-xl font-extrabold text-text-primary">{products.length || '50+'}</div>
                        </div>
                        <div className="p-4 rounded-xl bg-background border border-border">
                            <div className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-1">Return Rate</div>
                            <div className="text-xl font-extrabold text-seller">&lt; 1%</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left Column: About & Policies */}
                    <div className="lg:col-span-3 space-y-6">
                        <Card className="p-6 border-border">
                            <h3 className="font-bold text-text-primary text-lg mb-4">About the Store</h3>
                            <p className="text-text-secondary leading-relaxed text-sm">
                                {store.businessDescription || `${store.businessName} is a verified local retailer specializing in high-quality electronics and home appliances. Shopping local guarantees faster delivery and authentic products.`}
                            </p>
                        </Card>

                        <Card className="p-6 border-border">
                            <h3 className="font-bold text-text-primary text-lg mb-4">Store Policies</h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="text-sm font-bold text-text-primary flex items-center gap-1.5 mb-1"><Store className="w-4 h-4 text-primary" /> Pickup Available</div>
                                    <p className="text-xs text-text-secondary">You can pick up items directly from this store within 2 hours of booking.</p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Right Column: Inventory */}
                    <div className="lg:col-span-9">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-extrabold text-text-primary">Products from {store.businessName}</h2>
                        </div>

                        {products.length === 0 ? (
                            <div className="bg-card rounded-2xl border border-border p-12 text-center shadow-sm">
                                <Store className="w-16 h-16 text-border mx-auto border-2 border-border rounded-lg p-2 mb-4" />
                                <h3 className="text-xl font-bold text-text-primary mb-2">No Products Listed Yet</h3>
                                <p className="text-text-secondary max-w-md mx-auto">This store hasn't added any products to their hyperlocal catalogue yet. Check back soon!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                {products.map((product) => (
                                    <ProductCard
                                        key={product.id || (product as { _id?: string })._id}
                                        product={product}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
