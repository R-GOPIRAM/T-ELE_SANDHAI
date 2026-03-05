import { useState, useEffect } from 'react';
import { bargainService, Bargain } from '../../services/bargainService';
import BargainList from './BargainList';
import BargainChat from './BargainChat';

interface BargainPageProps {
    onPageChange: (page: string) => void;
}

export default function BargainPage({ onPageChange }: BargainPageProps) {
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

    if (loading) return <div className="p-8 text-center">Loading negotiations...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-bold mb-6">Negotiations</h1>

            <div className="flex flex-col md:flex-row gap-6">
                <BargainList
                    bargains={bargains}
                    selectedId={selectedId}
                    onSelect={setSelectedId}
                />

                <div className="w-full md:w-2/3">
                    {selectedId ? (
                        <BargainChat bargainId={selectedId} onPageChange={onPageChange} />
                    ) : (
                        <div className="bg-white h-[600px] rounded-lg shadow border flex items-center justify-center text-gray-400">
                            <div>
                                <p className="text-lg">Select a negotiation to view chat</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
