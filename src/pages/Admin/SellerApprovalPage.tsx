import { useState, useEffect, useCallback } from 'react';
import {
    Shield,
    CheckCircle,
    XCircle,
    Store,
    Phone,
    MapPin,
    Tag,
    Calendar,
    Search,
    Filter,
    RefreshCw,
    FileText,
    AlertTriangle,
    User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/apiClient';
import { Badge } from '../../components/ui/Badge';
import toast from 'react-hot-toast';

interface SellerUI {
    _id: string;
    businessName: string;
    businessAddress: string;
    businessPhone: string;
    panNumber: string;
    businessCategory?: string;
    businessDescription?: string;
    sellerStatus: 'pending' | 'approved' | 'rejected';
    rejectionReason?: string;
    rating: number;
    reviewCount: number;
    createdAt: string;
    approvedAt?: string;
    rejectedAt?: string;
    userId?: { name: string; email: string; _id: string };
    documents?: {
        aadhaar?: string;
        pan?: string;
        gstin?: string;
        laborCert?: string;
        businessLicense?: string;
    };
}

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

const STATUS_FILTERS: { label: string; value: StatusFilter; color: string }[] = [
    { label: 'All', value: 'all', color: '' },
    { label: 'Pending', value: 'pending', color: 'text-warning' },
    { label: 'Approved', value: 'approved', color: 'text-success' },
    { label: 'Rejected', value: 'rejected', color: 'text-danger' },
];

const STATUS_STYLES: Record<string, string> = {
    pending: 'bg-warning/10 text-warning border-warning/20',
    approved: 'bg-success/10 text-success border-success/20',
    rejected: 'bg-danger/10 text-danger border-danger/20',
};

export default function SellerApprovalPage() {
    const [sellers, setSellers] = useState<SellerUI[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending');
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [rejectTarget, setRejectTarget] = useState<string | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const fetchSellers = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/sellers/admin/all');
            setSellers(data.data || []);
        } catch {
            toast.error('Failed to fetch sellers');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchSellers(); }, [fetchSellers]);

    const handleApprove = async (id: string) => {
        setActionLoading(id);
        try {
            await api.patch(`/sellers/${id}/verify`, { status: 'approved' });
            toast.success('Seller approved successfully');
            setSellers(prev => prev.map(s => s._id === id ? { ...s, sellerStatus: 'approved', approvedAt: new Date().toISOString() } : s));
        } catch {
            toast.error('Failed to approve seller');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (id: string) => {
        if (!rejectionReason.trim()) {
            toast.error('Please enter a rejection reason');
            return;
        }
        setActionLoading(id);
        try {
            await api.patch(`/sellers/${id}/verify`, { status: 'rejected', reason: rejectionReason });
            toast.success('Seller rejected');
            setSellers(prev => prev.map(s => s._id === id ? { ...s, sellerStatus: 'rejected', rejectionReason, rejectedAt: new Date().toISOString() } : s));
            setRejectTarget(null);
            setRejectionReason('');
        } catch {
            toast.error('Failed to reject seller');
        } finally {
            setActionLoading(null);
        }
    };

    const filtered = sellers.filter(s => {
        const matchesStatus = statusFilter === 'all' || s.sellerStatus === statusFilter;
        const q = search.toLowerCase();
        const matchesSearch = !search ||
            s.businessName.toLowerCase().includes(q) ||
            s.userId?.name.toLowerCase().includes(q) ||
            s.userId?.email.toLowerCase().includes(q) ||
            s.businessCategory?.toLowerCase().includes(q);
        return matchesStatus && matchesSearch;
    });

    const counts = {
        all: sellers.length,
        pending: sellers.filter(s => s.sellerStatus === 'pending').length,
        approved: sellers.filter(s => s.sellerStatus === 'approved').length,
        rejected: sellers.filter(s => s.sellerStatus === 'rejected').length,
    };

    return (
        <div className="p-6 lg:p-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-primary/10 rounded-xl">
                            <Shield className="w-5 h-5 text-primary" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-primary">Verification Terminal</span>
                    </div>
                    <h1 className="text-3xl font-black text-text-primary uppercase tracking-tighter">Seller Approvals</h1>
                    <p className="text-text-secondary font-medium mt-1 text-sm">
                        <span className="text-warning font-black">{counts.pending}</span> applications awaiting review
                    </p>
                </div>
                <button onClick={fetchSellers} className="flex items-center gap-2 px-5 py-3 border border-border rounded-xl text-text-secondary hover:text-text-primary hover:border-primary transition-all text-sm font-black uppercase tracking-widest self-start">
                    <RefreshCw className="w-4 h-4" /> Refresh
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary/50" />
                    <input
                        type="text"
                        placeholder="Search by business name, owner, category..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-card border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-sm"
                    />
                </div>
                {/* Status Tabs */}
                <div className="flex items-center gap-2 flex-wrap">
                    <Filter className="w-4 h-4 text-text-secondary shrink-0" />
                    {STATUS_FILTERS.map(f => (
                        <button
                            key={f.value}
                            onClick={() => setStatusFilter(f.value)}
                            className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border flex items-center gap-1.5 ${statusFilter === f.value
                                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                                    : 'bg-card text-text-secondary hover:text-text-primary border-border'
                                }`}
                        >
                            {f.label}
                            <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-black ${statusFilter === f.value ? 'bg-white/20 text-white' : 'bg-border text-text-secondary'}`}>
                                {counts[f.value]}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Card Grid */}
            {loading ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-52 bg-card border border-border rounded-[2rem] animate-pulse" />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center bg-card border-2 border-dashed border-border/50 rounded-[2rem]">
                    <Store className="w-16 h-16 text-text-secondary/20 mb-4" />
                    <h3 className="text-xl font-black text-text-primary uppercase">No Applications Found</h3>
                    <p className="text-text-secondary font-medium mt-1 text-sm">
                        {statusFilter === 'pending' ? 'All caught up! No pending applications.' : 'Try changing the status filter.'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <AnimatePresence>
                        {filtered.map((seller, idx) => (
                            <motion.div
                                key={seller._id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.97 }}
                                transition={{ delay: idx * 0.04 }}
                                className="bg-card border border-border/50 rounded-[2rem] overflow-hidden hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500"
                            >
                                {/* Card Top: Status bar */}
                                <div className={`h-1 w-full ${seller.sellerStatus === 'pending' ? 'bg-warning' : seller.sellerStatus === 'approved' ? 'bg-success' : 'bg-danger'}`} />

                                <div className="p-6 space-y-5">
                                    {/* Store Header */}
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-gradient-to-br from-primary/10 to-primary/20 rounded-2xl flex items-center justify-center shrink-0 border border-primary/10">
                                                <Store className="w-7 h-7 text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="font-black text-text-primary uppercase tracking-tight text-lg leading-tight">{seller.businessName}</h3>
                                                {seller.businessCategory && (
                                                    <div className="flex items-center gap-1 mt-0.5">
                                                        <Tag className="w-3 h-3 text-text-secondary/50" />
                                                        <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest">{seller.businessCategory}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <Badge className={`shrink-0 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 border ${STATUS_STYLES[seller.sellerStatus]}`}>
                                            {seller.sellerStatus}
                                        </Badge>
                                    </div>

                                    {/* Details Grid */}
                                    <div className="grid grid-cols-1 gap-2.5">
                                        <div className="flex items-start gap-2.5 text-sm">
                                            <MapPin className="w-3.5 h-3.5 text-text-secondary/50 mt-0.5 shrink-0" />
                                            <span className="text-text-secondary font-medium text-xs leading-snug">{seller.businessAddress}</span>
                                        </div>
                                        <div className="flex items-center gap-2.5">
                                            <Phone className="w-3.5 h-3.5 text-text-secondary/50 shrink-0" />
                                            <span className="text-text-secondary font-medium text-xs">{seller.businessPhone}</span>
                                        </div>
                                        <div className="flex items-center gap-2.5">
                                            <User className="w-3.5 h-3.5 text-text-secondary/50 shrink-0" />
                                            <span className="text-text-secondary font-medium text-xs">
                                                <span className="text-text-primary font-black">{seller.userId?.name}</span> · {seller.userId?.email}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2.5">
                                            <Calendar className="w-3.5 h-3.5 text-text-secondary/50 shrink-0" />
                                            <span className="text-text-secondary font-medium text-xs">
                                                Applied {new Date(seller.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Business Description Toggle */}
                                    {seller.businessDescription && (
                                        <button
                                            onClick={() => setExpandedId(expandedId === seller._id ? null : seller._id)}
                                            className="flex items-center gap-1.5 text-[10px] font-black text-text-secondary hover:text-primary transition-colors uppercase tracking-widest"
                                        >
                                            <FileText className="w-3.5 h-3.5" />
                                            {expandedId === seller._id ? 'Hide Description' : 'View Description'}
                                        </button>
                                    )}
                                    <AnimatePresence>
                                        {expandedId === seller._id && seller.businessDescription && (
                                            <motion.p
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="text-xs text-text-secondary font-medium leading-relaxed px-4 py-3 bg-background/50 rounded-xl border border-border/50"
                                            >
                                                {seller.businessDescription}
                                            </motion.p>
                                        )}
                                    </AnimatePresence>

                                    {/* Rejection reason display */}
                                    {seller.sellerStatus === 'rejected' && seller.rejectionReason && (
                                        <div className="flex items-start gap-2 p-3 bg-danger/5 border border-danger/20 rounded-xl">
                                            <AlertTriangle className="w-3.5 h-3.5 text-danger mt-0.5 shrink-0" />
                                            <p className="text-xs text-danger font-bold leading-snug">{seller.rejectionReason}</p>
                                        </div>
                                    )}

                                    {/* Inline Rejection Form */}
                                    <AnimatePresence>
                                        {rejectTarget === seller._id && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="space-y-3"
                                            >
                                                <textarea
                                                    placeholder="Reason for rejection (required)..."
                                                    value={rejectionReason}
                                                    onChange={e => setRejectionReason(e.target.value)}
                                                    rows={3}
                                                    className="w-full px-4 py-3 bg-background border border-danger/30 rounded-xl focus:ring-2 focus:ring-danger/20 focus:border-danger transition-all font-medium text-sm resize-none"
                                                />
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleReject(seller._id)}
                                                        disabled={actionLoading === seller._id}
                                                        className="flex-1 py-3 bg-danger text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-danger/90 transition-all disabled:opacity-50"
                                                    >
                                                        Confirm Rejection
                                                    </button>
                                                    <button
                                                        onClick={() => { setRejectTarget(null); setRejectionReason(''); }}
                                                        className="px-5 py-3 bg-background text-text-secondary text-[10px] font-black uppercase tracking-widest rounded-xl border border-border hover:text-text-primary transition-all"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Action Buttons */}
                                    {seller.sellerStatus === 'pending' && rejectTarget !== seller._id && (
                                        <div className="flex gap-3 pt-2">
                                            <button
                                                onClick={() => handleApprove(seller._id)}
                                                disabled={actionLoading === seller._id}
                                                className="flex-1 flex items-center justify-center gap-2 py-3 bg-success/10 hover:bg-success text-success hover:text-white text-[10px] font-black uppercase tracking-widest rounded-xl border border-success/20 hover:border-success transition-all disabled:opacity-50"
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => { setRejectTarget(seller._id); setRejectionReason(''); }}
                                                className="flex-1 flex items-center justify-center gap-2 py-3 bg-danger/10 hover:bg-danger text-danger hover:text-white text-[10px] font-black uppercase tracking-widest rounded-xl border border-danger/20 hover:border-danger transition-all"
                                            >
                                                <XCircle className="w-4 h-4" />
                                                Reject
                                            </button>
                                        </div>
                                    )}

                                    {/* Re-evaluate approved/rejected */}
                                    {seller.sellerStatus !== 'pending' && rejectTarget !== seller._id && (
                                        <div className="flex gap-3 pt-2">
                                            {seller.sellerStatus === 'rejected' && (
                                                <button
                                                    onClick={() => handleApprove(seller._id)}
                                                    disabled={actionLoading === seller._id}
                                                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-success/10 hover:bg-success text-success hover:text-white text-[10px] font-black uppercase tracking-widest rounded-xl border border-success/20 hover:border-success transition-all disabled:opacity-50"
                                                >
                                                    <CheckCircle className="w-4 h-4" /> Approve Anyway
                                                </button>
                                            )}
                                            {seller.sellerStatus === 'approved' && (
                                                <button
                                                    onClick={() => { setRejectTarget(seller._id); setRejectionReason(''); }}
                                                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-danger/10 hover:bg-danger text-danger hover:text-white text-[10px] font-black uppercase tracking-widest rounded-xl border border-danger/20 hover:border-danger transition-all"
                                                >
                                                    <XCircle className="w-4 h-4" /> Revoke Approval
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
