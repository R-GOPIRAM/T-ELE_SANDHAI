import { useState, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
import { bargainService, Bargain } from '../services/bargainService';
import BargainList from '../features/bargain/BargainList';
import BargainChat from '../features/bargain/BargainChat';


export default function BargainPage() {
    const [bargains, setBargains] = useState<Bargain[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBargains = async () => {
            try {
                const { data } = await bargainService.getMyBargains();
                setBargains(data.data);
            } catch (error) {
                console.error('Failed to fetch bargains', error);
            } finally {
                setLoading(false);
            }
        };
        fetchBargains();
    }, []);

    if (loading) return (
        <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-primary/50 border-t-primary-600 rounded-full animate-spin" />
            <p className="text-text-secondary font-bold uppercase tracking-widest text-xs animate-pulse">Syncing Negotiations...</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="mb-12">
                <h1 className="text-4xl font-heading font-black text-text-primary tracking-tighter">Your <span className="text-primary">Negotiations</span></h1>
                <p className="text-text-secondary font-medium mt-2">Bargain directly with local store owners in real-time.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                <BargainList
                    bargains={bargains}
                    selectedId={selectedId}
                    onSelect={setSelectedId}
                />

                <div className="w-full md:w-2/3">
                    {selectedId ? (
                        <BargainChat bargainId={selectedId} />
                    ) : (
                        <div className="bg-card h-[700px] rounded-[2.5rem] border border-border flex flex-col items-center justify-center text-center p-12 shadow-sm relative overflow-hidden group">
                            {/* Decorative background element */}
                            <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform duration-700">
                                <MessageSquare className="w-64 h-64 text-primary-900" />
                            </div>

                            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-8">
                                <MessageSquare className="w-12 h-12 text-primary" />
                            </div>
                            <h3 className="text-2xl font-black text-text-primary mb-4 tracking-tight">Open a Conversation</h3>
                            <p className="text-text-secondary font-medium max-w-sm">Select a negotiation from the list to start chatting and finalize your deal.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
