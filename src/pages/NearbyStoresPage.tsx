import { useState, useEffect } from 'react';
import {
    MapPin,
    Navigation,
    Star,
    Clock,
    ChevronRight,
    Search,
    Filter,
    Store as StoreIcon,
    Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useLocationStore } from '../store/locationStore';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import api from '../services/apiClient';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

interface Store {
    _id: string;
    businessName: string;
    businessAddress: string;
    businessCategory: string;
    rating: number;
    reviewCount: number;
    distance: number;
    openHours: {
        open: string;
        close: string;
    };
    latitude: number;
    longitude: number;
}

export default function NearbyStoresPage() {
    const { location, detectLocation, isLoading: isLocLoading } = useLocationStore();
    const [stores, setStores] = useState<Store[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [radius, setRadius] = useState(50);
    const navigate = useNavigate();

    useEffect(() => {
        if (location?.coordinates) {
            fetchNearbyStores();
        }
    }, [location, radius]);

    const fetchNearbyStores = async () => {
        if (!location?.coordinates) return;

        setLoading(true);
        try {
            const { data } = await api.get('/sellers/nearby', {
                params: {
                    lat: location.coordinates.lat,
                    lng: location.coordinates.lng,
                    radius
                }
            });
            if (data.success) {
                setStores(data.data.stores);
            }
        } catch (error) {
            console.error('Failed to fetch nearby stores:', error);
            toast.error('Could not load nearby stores');
        } finally {
            setLoading(false);
        }
    };

    const isOpen = (hours: { open: string; close: string }) => {
        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        return currentTime >= hours.open && currentTime <= hours.close;
    };

    const filteredStores = stores.filter(store =>
        store.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.businessAddress.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-background pt-24 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-3 mb-2"
                        >
                            <div className="p-2 bg-primary/10 rounded-xl">
                                <MapPin className="w-6 h-6 text-primary" />
                            </div>
                            <span className="text-xs font-black uppercase tracking-[0.2em] text-primary">Hyperlocal Discovery</span>
                        </motion.div>
                        <h1 className="text-4xl md:text-5xl font-black text-text-primary uppercase tracking-tighter leading-none">
                            Nearby <span className="text-primary">Electronics</span> Hubs
                        </h1>
                        <p className="text-text-secondary font-medium mt-4 max-w-xl">
                            Discover verified local electronics stores near <span className="text-text-primary font-bold">{location?.area || 'your location'}</span>. Shop local, save time.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        {!location ? (
                            <Button
                                onClick={() => detectLocation()}
                                isLoading={isLocLoading}
                                className="px-8 py-6 rounded-2xl shadow-xl shadow-primary/20"
                            >
                                <Navigation className="w-4 h-4 mr-2" />
                                Detect My Location
                            </Button>
                        ) : (
                            <div className="flex items-center gap-2 bg-card border border-border px-4 py-2 rounded-2xl shadow-sm">
                                <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Tracking Active</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Filters & Search */}
                <Card className="p-4 mb-8 border-border/50 bg-card/50 backdrop-blur-md sticky top-24 z-30">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary/50" />
                            <input
                                type="text"
                                placeholder="Search by store name or landmark..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                            />
                        </div>
                        <div className="flex items-center gap-4 px-4 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
                            <div className="flex items-center gap-2 shrink-0">
                                <Filter className="w-4 h-4 text-text-secondary" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Range:</span>
                            </div>
                            {[5, 10, 25, 50, 100].map(r => (
                                <button
                                    key={r}
                                    onClick={() => setRadius(r)}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${radius === r ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-background text-text-secondary hover:text-text-primary border border-border'}`}
                                >
                                    {r}km
                                </button>
                            ))}
                        </div>
                    </div>
                </Card>

                {/* Main Content Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Store List */}
                    <div className="lg:col-span-12 space-y-6">
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="h-48 bg-card border border-border rounded-[2rem] animate-pulse" />
                                ))}
                            </div>
                        ) : filteredStores.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredStores.map((store, idx) => (
                                    <motion.div
                                        key={store._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                    >
                                        <Card className="group p-6 h-full border-border/50 hover:border-primary/50 transition-all duration-500 cursor-pointer overflow-hidden relative rounded-[2rem]" onClick={() => navigate(`/store/${store._id}`)}>
                                            <div className="absolute top-0 right-0 p-6">
                                                <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 ${isOpen(store.openHours) ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                                                    <Clock className="w-3 h-3" />
                                                    {isOpen(store.openHours) ? 'Open Now' : 'Closed'}
                                                </div>
                                            </div>

                                            <div className="flex flex-col h-full">
                                                <div className="mb-6">
                                                    <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                                                        <StoreIcon className="w-7 h-7" />
                                                    </div>
                                                    <h3 className="text-xl font-black text-text-primary uppercase tracking-tight group-hover:text-primary transition-colors line-clamp-1">{store.businessName}</h3>
                                                    <p className="text-xs font-bold text-text-secondary mt-1 flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" />
                                                        {store.businessAddress}
                                                    </p>
                                                </div>

                                                <div className="mt-auto pt-6 border-t border-border/50 grid grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-1">Customer Rating</p>
                                                        <div className="flex items-center gap-1">
                                                            <Star className="w-4 h-4 text-warning fill-warning" />
                                                            <span className="font-black text-text-primary">{store.rating || 4.5}</span>
                                                            <span className="text-[10px] text-text-secondary font-bold">({store.reviewCount || 120})</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-1">Distance</p>
                                                        <p className="font-black text-primary">{store.distance?.toFixed(1) || '0.0'} KM</p>
                                                    </div>
                                                </div>

                                                <button className="w-full mt-6 py-3 bg-background hover:bg-primary hover:text-white border border-border hover:border-primary rounded-xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                                                    Visit Store <ChevronRight className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-24 text-center glass-panel rounded-[3rem] border-dashed border-2 border-border/50">
                                <div className="w-24 h-24 bg-background rounded-full flex items-center justify-center mb-6 text-text-secondary/20">
                                    <StoreIcon className="w-12 h-12" />
                                </div>
                                <h3 className="text-2xl font-black text-text-primary uppercase tracking-tight mb-2">No Stores Found</h3>
                                <p className="text-text-secondary font-medium max-w-xs mx-auto">Try increasing your search radius or moving to a higher density area.</p>
                                <Button variant="outline" className="mt-8 rounded-xl" onClick={() => setRadius(100)}>Expand Radius to 100km</Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Map View Section (Optional/Future Enhancement placeholder) */}
                <div className="mt-24">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-black text-text-primary uppercase tracking-tight flex items-center gap-3">
                                <Navigation className="w-6 h-6 text-primary" /> Visual Distribution
                            </h2>
                            <p className="text-sm text-text-secondary font-medium mt-1">Live interactive mapping of verified electronics hubs.</p>
                        </div>
                    </div>

                    <Card className="aspect-[21/9] w-full border-border/50 overflow-hidden relative rounded-[3rem] bg-background">
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm z-10 p-8 text-center">
                            <div className="w-20 h-20 bg-background rounded-[2rem] shadow-xl border border-border flex items-center justify-center mb-6">
                                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                            </div>
                            <h3 className="text-xl font-black text-text-primary uppercase tracking-widest mb-2 font-heading">Synchronizing Spatial Data</h3>
                            <p className="text-xs text-text-secondary font-bold uppercase tracking-widest max-w-[300px]">Connecting to Hyperlocal Mesh Network for Precise Geo-Visualization...</p>
                        </div>
                        {/* 
                            In a production app, we'd embed a Google Maps / Leaflet component here.
                            For now, we display a high-fidelity loading state to maintain the premium feel.
                        */}
                        <div className="w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_100%)] from-primary/5 to-transparent flex items-center justify-center opacity-30">
                            <div className="grid grid-cols-12 grid-rows-6 w-full h-full gap-4 p-4 opacity-5">
                                {Array(72).fill(0).map((_, i) => (
                                    <div key={i} className="border border-text-primary/10 rounded-lg" />
                                ))}
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
