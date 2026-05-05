import { Bargain } from '../../services/bargainService';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface BargainListProps {
    bargains: Bargain[];
    selectedId: string | null;
    onSelect: (id: string) => void;
}

export default function BargainList({ bargains, selectedId, onSelect }: BargainListProps) {
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'accepted': return <CheckCircle className="w-4 h-4 text-seller" />;
            case 'rejected': return <XCircle className="w-4 h-4 text-danger" />;
            case 'expired': return <Clock className="w-4 h-4 text-text-secondary" />;
            default: return <AlertCircle className="w-4 h-4 text-blue-500" />;
        }
    };

    return (
        <div className="bg-card rounded-[2rem] shadow-sm h-[700px] overflow-hidden w-full md:w-1/3 border border-border flex flex-col">
            <div className="p-6 border-b border-gray-50 font-black text-text-primary uppercase tracking-widest text-xs">Negotiations</div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {bargains.length === 0 ? (
                    <div className="p-8 text-text-secondary/50 text-center font-medium italic">No active negotiations</div>
                ) : (
                    bargains.map(bargain => (
                        <div
                            key={bargain._id}
                            onClick={() => onSelect(bargain._id)}
                            className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer group ${selectedId === bargain._id
                                ? 'bg-primary/10 border-primary/50 shadow-md translate-x-1'
                                : 'bg-card border-border hover:border-primary/20 hover:shadow-sm'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-black text-text-primary text-xs uppercase truncate leading-tight w-full pr-4">{bargain.productId.name}</h4>
                                <span className="text-[9px] font-black text-text-secondary/50 uppercase tracking-widest whitespace-nowrap">{new Date(bargain.updatedAt || bargain.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest mb-4">
                                {getStatusIcon(bargain.status)}
                                <span className={bargain.status === 'accepted' ? 'text-seller' : bargain.status === 'rejected' ? 'text-danger' : 'text-primary'}>
                                    {bargain.status}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="bg-background text-text-secondary px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                    Offer: ₹{bargain.offeredPrice.toLocaleString('en-IN')}
                                </span>
                                {bargain.finalPrice && (
                                    <span className="bg-seller/10 text-seller-hover px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                        Final: ₹{bargain.finalPrice.toLocaleString('en-IN')}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
