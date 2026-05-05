import { useState, useEffect, useCallback } from 'react';
import {
    MessageSquare,
    Star,
    CheckCircle,
    Trash2,
    Filter,
    Search,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/apiClient';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { toast } from 'react-hot-toast';

interface Review {
    _id: string;
    rating: number;
    title: string;
    comment: string;
    isApproved: boolean;
    helpfulVotes: number;
    createdAt: string;
    customerId: { name: string; email: string; _id: string };
    productId: { name: string; _id: string };
}

type StatusFilter = 'all' | 'approved' | 'pending';

const STATUSES: { label: string; value: StatusFilter; color: string }[] = [
    { label: 'All Reviews', value: 'all', color: 'text-text-primary' },
    { label: 'Approved', value: 'approved', color: 'text-success' },
    { label: 'Pending', value: 'pending', color: 'text-warning' },
];

export default function ReviewModerationPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [search, setSearch] = useState('');
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    const fetchReviews = useCallback(async () => {
        setLoading(true);
        try {
            const params: Record<string, string | number> = { page, limit: 15 };
            if (statusFilter !== 'all') params.status = statusFilter;

            const { data } = await api.get('/reviews/admin/all', { params });
            if (data.success) {
                setReviews(data.data.reviews);
                setTotal(data.data.total);
                setTotalPages(data.data.totalPages);
            }
        } catch {
            toast.error('Failed to load reviews');
        } finally {
            setLoading(false);
        }
    }, [page, statusFilter]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    const handleApprove = async (reviewId: string, isApproved: boolean) => {
        setActionLoading(reviewId);
        try {
            await api.patch(`/reviews/admin/${reviewId}/status`, {
                status: isApproved ? 'approved' : 'rejected'
            });
            toast.success(`Review ${isApproved ? 'approved' : 'rejected'}`);
            fetchReviews();
        } catch {
            toast.error('Failed to update review status');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (reviewId: string) => {
        setActionLoading(reviewId);
        try {
            await api.delete(`/reviews/admin/${reviewId}`);
            toast.success('Review deleted permanently');
            setDeleteConfirm(null);
            fetchReviews();
        } catch {
            toast.error('Failed to delete review');
        } finally {
            setActionLoading(null);
        }
    };

    const filteredReviews = reviews.filter(r =>
        !search ||
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.customerId?.name?.toLowerCase().includes(search.toLowerCase()) ||
        r.productId?.name?.toLowerCase().includes(search.toLowerCase())
    );

    const renderStars = (rating: number) =>
        [...Array(5)].map((_, i) => (
            <Star key={i} className={`w-3.5 h-3.5 ${i < rating ? 'text-warning fill-warning' : 'text-text-secondary/20'}`} />
        ));

    return (
        <div className="p-6 lg:p-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-primary/10 rounded-xl">
                            <MessageSquare className="w-5 h-5 text-primary" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-primary">Content Moderation</span>
                    </div>
                    <h1 className="text-3xl font-black text-text-primary uppercase tracking-tighter">
                        Review Management
                    </h1>
                    <p className="text-text-secondary font-medium mt-1">
                        <span className="text-text-primary font-black">{total}</span> total reviews across the platform
                    </p>
                </div>
                <Button variant="outline" onClick={fetchReviews} className="rounded-xl px-6 py-3 self-start">
                    <RefreshCw className="w-4 h-4 mr-2" /> Refresh
                </Button>
            </div>

            {/* Filters */}
            <Card className="p-4 border-border/50 bg-card/50 backdrop-blur-md">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary/50" />
                        <input
                            type="text"
                            placeholder="Search by review title, customer or product..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-sm"
                        />
                    </div>
                    {/* Status Filter */}
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-text-secondary shrink-0" />
                        {STATUSES.map(s => (
                            <button
                                key={s.value}
                                onClick={() => { setStatusFilter(s.value); setPage(1); }}
                                className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${statusFilter === s.value
                                        ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                                        : 'bg-background text-text-secondary hover:text-text-primary border-border'
                                    }`}
                            >
                                {s.label}
                            </button>
                        ))}
                    </div>
                </div>
            </Card>

            {/* Review List */}
            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-36 bg-card border border-border rounded-3xl animate-pulse" />
                    ))}
                </div>
            ) : filteredReviews.length === 0 ? (
                <Card className="py-24 flex flex-col items-center justify-center text-center border-dashed border-2 border-border/50 rounded-[2rem]">
                    <MessageSquare className="w-16 h-16 text-text-secondary/20 mb-4" />
                    <h3 className="text-xl font-black text-text-primary uppercase tracking-tight">No Reviews Found</h3>
                    <p className="text-text-secondary font-medium mt-1">Try changing the status filter or search term.</p>
                </Card>
            ) : (
                <div className="space-y-4">
                    <AnimatePresence>
                        {filteredReviews.map((review, idx) => (
                            <motion.div
                                key={review._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ delay: idx * 0.04 }}
                            >
                                <Card className="p-6 border-border/50 hover:border-primary/20 transition-all rounded-[2rem] relative overflow-hidden">
                                    {/* Status Badge */}
                                    <div className="absolute top-5 right-5">
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${review.isApproved
                                                ? 'bg-success/10 text-success border-success/20'
                                                : 'bg-warning/10 text-warning border-warning/20'
                                            }`}>
                                            {review.isApproved ? 'Approved' : 'Pending'}
                                        </span>
                                    </div>

                                    <div className="flex flex-col lg:flex-row gap-6 pr-24">
                                        {/* Review Content */}
                                        <div className="flex-1 space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className="flex gap-0.5">
                                                    {renderStars(review.rating)}
                                                </div>
                                                <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest">
                                                    {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-black text-text-primary uppercase tracking-tight leading-tight">{review.title}</h3>
                                            <p className="text-text-secondary font-medium text-sm leading-relaxed line-clamp-2">{review.comment}</p>

                                            <div className="flex flex-wrap items-center gap-4 pt-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-black text-xs">
                                                        {review.customerId?.name?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-black text-text-primary">{review.customerId?.name}</p>
                                                        <p className="text-[10px] text-text-secondary font-bold">{review.customerId?.email}</p>
                                                    </div>
                                                </div>
                                                <div className="w-px h-8 bg-border/50" />
                                                <div>
                                                    <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Product</p>
                                                    <p className="text-xs font-black text-text-primary truncate max-w-[200px]">{review.productId?.name}</p>
                                                </div>
                                                <div className="w-px h-8 bg-border/50" />
                                                <p className="text-[10px] font-black text-text-secondary uppercase">
                                                    👍 {review.helpfulVotes} found helpful
                                                </p>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex lg:flex-col gap-3 lg:min-w-[160px] shrink-0">
                                            {!review.isApproved ? (
                                                <button
                                                    onClick={() => handleApprove(review._id, true)}
                                                    disabled={actionLoading === review._id}
                                                    className="flex items-center justify-center gap-2 px-4 py-3 bg-success/10 hover:bg-success text-success hover:text-white text-[10px] font-black uppercase tracking-widest rounded-xl border border-success/20 hover:border-success transition-all disabled:opacity-50"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                    Approve
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleApprove(review._id, false)}
                                                    disabled={actionLoading === review._id}
                                                    className="flex items-center justify-center gap-2 px-4 py-3 bg-warning/10 hover:bg-warning text-warning hover:text-white text-[10px] font-black uppercase tracking-widest rounded-xl border border-warning/20 hover:border-warning transition-all disabled:opacity-50"
                                                >
                                                    <AlertTriangle className="w-4 h-4" />
                                                    Unpublish
                                                </button>
                                            )}

                                            {deleteConfirm === review._id ? (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleDelete(review._id)}
                                                        disabled={actionLoading === review._id}
                                                        className="flex-1 px-3 py-3 bg-danger text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all hover:bg-danger/90 disabled:opacity-50"
                                                    >
                                                        Confirm
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteConfirm(null)}
                                                        className="flex-1 px-3 py-3 bg-background text-text-secondary text-[10px] font-black uppercase tracking-widest rounded-xl border border-border hover:text-text-primary transition-all"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setDeleteConfirm(review._id)}
                                                    className="flex items-center justify-center gap-2 px-4 py-3 bg-danger/10 hover:bg-danger text-danger hover:text-white text-[10px] font-black uppercase tracking-widest rounded-xl border border-danger/20 hover:border-danger transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    Delete
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                    <p className="text-xs font-black text-text-secondary uppercase tracking-widest">
                        Page {page} of {totalPages}
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="p-2.5 rounded-xl bg-card border border-border hover:border-primary hover:text-primary transition-all disabled:opacity-30"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="p-2.5 rounded-xl bg-card border border-border hover:border-primary hover:text-primary transition-all disabled:opacity-30"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
