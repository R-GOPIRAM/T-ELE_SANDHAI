import { useState, useEffect } from 'react';
import { Shield, Check, X, Store, Calendar, Search } from 'lucide-react';
import api from '../../services/apiClient';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import toast from 'react-hot-toast';

interface SellerUI {
    _id: string;
    businessName: string;
    businessAddress: string;
    sellerStatus: 'pending' | 'approved' | 'rejected';
    userId?: {
        name: string;
        email: string;
    };
    createdAt: string;
}

export default function SellerApprovalPage() {
    const [sellers, setSellers] = useState<SellerUI[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchSellers = async () => {
        try {
            const { data } = await api.get('/sellers/admin/all');
            setSellers(data.data || []);
        } catch (_error) {
            toast.error('Failed to fetch sellers for approval');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSellers();
    }, []);

    const handleAction = async (id: string, status: 'approved' | 'rejected') => {
        try {
            await api.patch(`/sellers/${id}/verify`, { status });
            toast.success(`Seller ${status} successfully`);
            fetchSellers();
        } catch (_error) {
            toast.error(`Failed to update seller status`);
        }
    };

    const filteredSellers = sellers.filter(s =>
        s.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.userId?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.userId?.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <div className="p-8 text-center text-text-secondary">Loading Seller Management...</div>;
    }

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between gap-6 md:items-end">
                <div>
                    <h1 className="text-3xl font-black text-text-primary flex items-center gap-3 italic">
                        <Shield className="w-8 h-8 text-primary" /> Seller Verification
                    </h1>
                    <p className="text-sm font-bold text-text-secondary/50 mt-2 uppercase tracking-widest">Neighborhood Moderation Terminal</p>
                </div>
                <div className="flex bg-card rounded-2xl shadow-sm border border-border p-2 items-center">
                    <Search className="w-5 h-5 text-text-secondary/50 mx-3" />
                    <input
                        type="text"
                        placeholder="Search sellers..."
                        className="outline-none border-none text-sm font-bold w-64"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-card rounded-[2.5rem] border border-border shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-background/50 border-b border-gray-50 text-[10px] font-black text-text-secondary/50 uppercase tracking-[0.2em]">
                                <th className="px-8 py-6">Store Entity</th>
                                <th className="px-8 py-6">Owner Identity</th>
                                <th className="px-8 py-6">Registration Date</th>
                                <th className="px-8 py-6">Current Status</th>
                                <th className="px-8 py-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredSellers.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center text-text-secondary/50 font-bold italic">No pending applications found.</td>
                                </tr>
                            )}
                            {filteredSellers.map((seller) => (
                                <tr key={seller._id} className="group hover:bg-primary/10/20 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center text-white shrink-0">
                                                <Store className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-text-primary text-sm uppercase">{seller.businessName}</h4>
                                                <p className="text-[10px] text-text-secondary/50 font-bold max-w-[200px] truncate">{seller.businessAddress}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-text-secondary text-sm">{seller.userId?.name}</span>
                                            <span className="text-[10px] text-text-secondary/50 font-bold">{seller.userId?.email}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2 text-xs font-bold text-text-secondary uppercase">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {new Date(seller.createdAt).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <Badge className={`
                                            ${seller.sellerStatus === 'pending' ? 'bg-warning/10 text-warning border-amber-100' : ''}
                                            ${seller.sellerStatus === 'approved' ? 'bg-seller/10 text-seller border-seller/20' : ''}
                                            ${seller.sellerStatus === 'rejected' ? 'bg-danger/10 text-danger border-red-100' : ''}
                                            font-black uppercase text-[9px] tracking-widest px-3 py-1
                                        `}>
                                            {seller.sellerStatus}
                                        </Badge>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end gap-2">
                                            {seller.sellerStatus === 'pending' && (
                                                <>
                                                    <Button
                                                        onClick={() => handleAction(seller._id, 'approved')}
                                                        className="bg-seller-hover hover:bg-green-700 p-2.5 rounded-xl shadow-lg shadow-green-100"
                                                    >
                                                        <Check className="w-4 h-4 text-white" />
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleAction(seller._id, 'rejected')}
                                                        className="bg-red-500 hover:bg-red-600 p-2.5 rounded-xl shadow-lg shadow-red-100"
                                                    >
                                                        <X className="w-4 h-4 text-white" />
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
