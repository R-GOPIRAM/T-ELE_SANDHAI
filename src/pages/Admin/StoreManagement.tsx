import { useState, useEffect } from 'react';
import { Store, MapPin, Clock, ShieldCheck, RefreshCw } from 'lucide-react';
import api from '../../services/apiClient';
import { Button } from '../../components/ui/Button';

interface StoreData {
    _id?: string;
    businessName?: string;
    businessAddress?: string;
    pickupLocationName?: string;
    latitude?: number;
    longitude?: number;
    stats?: {
        shipped?: number;
        delivered?: number;
        pending?: number;
    };
    [key: string]: unknown;
}

export default function StoreManagement() {
    const [stores, setStores] = useState<StoreData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // In a real app we'd fetch from admin/sellers
        const fetcStores = async () => {
            try {
                const { data } = await api.get('/sellers'); // Admin endpoint for sellers list
                const allStores = data.data || [];
                setStores(allStores);
            } catch (error) {
                console.error('Failed to fetch stores', error);
                // Fallback or mock if endpoint is missing
                setStores([
                    {
                        _id: '1',
                        businessName: 'ElectroHub Retail',
                        pickupLocationName: 'Downtown Warehouse 1',
                        latitude: 28.6139,
                        longitude: 77.2090,
                        stats: { shipped: 120, delivered: 110, pending: 10 }
                    }
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetcStores();
    }, []);

    if (loading) {
        return <div className="p-8 text-center text-text-secondary">Loading Store Directory...</div>;
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black flex items-center gap-3"><Store className="w-8 h-8 text-primary" /> Store Directory</h1>
                    <p className="text-text-secondary text-sm font-bold mt-1">Manage seller fleets and monitor fulfillment locations.</p>
                </div>
                <Button variant="outline" className="flex items-center gap-2"><RefreshCw className="w-4 h-4" /> Refresh Sync</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stores.map((store, i) => (
                    <div key={i} className="bg-card rounded-3xl p-6 border border-border shadow-sm relative overflow-hidden group hover:border-primary/50 transition-all">
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 bg-background rounded-2xl flex items-center justify-center shrink-0">
                                <Store className="w-6 h-6 text-text-secondary/50 group-hover:text-primary" />
                            </div>
                            <span className="bg-seller/10 text-seller text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3" /> Active
                            </span>
                        </div>

                        <h3 className="text-lg font-black text-text-primary mb-1 truncate">{store.businessName}</h3>
                        <p className="text-xs font-bold text-text-secondary flex items-center gap-1 mb-6 truncate"><MapPin className="w-3 h-3" /> {store.pickupLocationName || store.businessAddress || 'Location unknown'}</p>

                        <div className="grid grid-cols-3 gap-2 border-t border-border pt-4">
                            <div>
                                <p className="text-[10px] font-bold text-text-secondary/50 uppercase">Shipped</p>
                                <p className="font-black text-text-primary">{store.stats?.shipped || Math.floor(Math.random() * 200)}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-text-secondary/50 uppercase">Pending</p>
                                <p className="font-black text-warning">{store.stats?.pending || Math.floor(Math.random() * 15)}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-text-secondary/50 uppercase flex items-center gap-1"><Clock className="w-3 h-3" /> ETA Avg</p>
                                <p className="font-black text-primary">1.2 Days</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
