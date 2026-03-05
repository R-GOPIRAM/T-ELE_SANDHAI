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
            case 'accepted': return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'rejected': return <XCircle className="w-4 h-4 text-red-500" />;
            case 'expired': return <Clock className="w-4 h-4 text-gray-500" />;
            default: return <AlertCircle className="w-4 h-4 text-blue-500" />;
        }
    };

    return (
        <div className="bg-white rounded-lg shadow h-[600px] overflow-y-auto w-full md:w-1/3 border-r">
            <div className="p-4 border-b font-bold text-gray-700">Negotiations</div>
            {bargains.length === 0 ? (
                <div className="p-4 text-gray-500 text-center">No active negotiations</div>
            ) : (
                bargains.map(bargain => (
                    <div
                        key={bargain._id}
                        onClick={() => onSelect(bargain._id)}
                        className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition ${selectedId === bargain._id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
                    >
                        <div className="flex justify-between items-start mb-1">
                            <h4 className="font-semibold text-sm truncate w-32">{bargain.productId.name}</h4>
                            <span className="text-xs text-gray-500">{new Date(bargain.updatedAt || bargain.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                            {getStatusIcon(bargain.status)}
                            <span className="capitalize">{bargain.status}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="bg-gray-100 px-2 py-1 rounded">
                                Offer: ₹{bargain.offeredPrice}
                            </span>
                            {bargain.finalPrice && (
                                <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                                    Final: ₹{bargain.finalPrice}
                                </span>
                            )}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}
