import { useState, useEffect, useCallback } from 'react';
import {
    Users,
    Search,
    Filter,
    ShieldOff,
    ShieldCheck,
    Trash2,
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

interface UserRecord {
    _id: string;
    name: string;
    email: string;
    role: 'customer' | 'seller' | 'admin';
    isActive: boolean;
    isVerified: boolean;
    createdAt: string;
    phone?: string;
}

type RoleFilter = 'all' | 'customer' | 'seller' | 'admin';

const ROLE_FILTERS: { label: string; value: RoleFilter }[] = [
    { label: 'All', value: 'all' },
    { label: 'Customers', value: 'customer' },
    { label: 'Sellers', value: 'seller' },
    { label: 'Admins', value: 'admin' },
];

const ROLE_STYLES: Record<string, string> = {
    customer: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    seller: 'bg-violet-500/10 text-violet-500 border-violet-500/20',
    admin: 'bg-primary/10 text-primary border-primary/20',
};

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 400);
        return () => clearTimeout(timer);
    }, [search]);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const params: Record<string, string | number> = { page, limit: 15 };
            if (roleFilter !== 'all') params.role = roleFilter;
            if (debouncedSearch) params.search = debouncedSearch;

            const { data } = await api.get('/admin/users', { params });
            if (data.success) {
                setUsers(data.data.users);
                setTotal(data.data.total);
                setTotalPages(data.data.totalPages);
            }
        } catch {
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    }, [page, roleFilter, debouncedSearch]);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);
    useEffect(() => { setPage(1); }, [roleFilter, debouncedSearch]);

    const handleSuspend = async (userId: string) => {
        setActionLoading(userId);
        try {
            const { data } = await api.patch(`/admin/users/${userId}/suspend`);
            toast.success(data.message);
            setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive: data.data.isActive } : u));
        } catch {
            toast.error('Failed to update user status');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (userId: string) => {
        setActionLoading(userId);
        try {
            await api.delete(`/admin/users/${userId}`);
            toast.success('User deleted permanently');
            setDeleteConfirm(null);
            setUsers(prev => prev.filter(u => u._id !== userId));
            setTotal(t => t - 1);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to delete user');
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="p-6 lg:p-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-primary/10 rounded-xl">
                            <Users className="w-5 h-5 text-primary" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-primary">User Administration</span>
                    </div>
                    <h1 className="text-3xl font-black text-text-primary uppercase tracking-tighter">User Management</h1>
                    <p className="text-text-secondary font-medium mt-1 text-sm">
                        <span className="text-text-primary font-black">{total}</span> registered accounts on the platform
                    </p>
                </div>
                <Button variant="outline" onClick={fetchUsers} className="rounded-xl px-6 py-3 self-start">
                    <RefreshCw className="w-4 h-4 mr-2" /> Refresh
                </Button>
            </div>

            {/* Filters */}
            <Card className="p-4 border-border/50 bg-card/50 backdrop-blur-md">
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary/50" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-sm"
                        />
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <Filter className="w-4 h-4 text-text-secondary shrink-0" />
                        {ROLE_FILTERS.map(f => (
                            <button
                                key={f.value}
                                onClick={() => setRoleFilter(f.value)}
                                className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${roleFilter === f.value
                                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                                    : 'bg-background text-text-secondary hover:text-text-primary border-border'
                                    }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>
            </Card>

            {/* User Table */}
            <Card className="border-border/50 overflow-hidden rounded-[2rem]">
                {/* Table Header */}
                <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-background/50 border-b border-border/50">
                    {['User', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map((h, i) => (
                        <div key={h} className={`text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] ${i === 0 ? 'col-span-3' : i === 1 ? 'col-span-3' : i === 5 ? 'col-span-2 text-right' : 'col-span-1'}`}>{h}</div>
                    ))}
                </div>

                {loading ? (
                    <div className="space-y-0">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="grid grid-cols-12 gap-4 px-6 py-5 border-b border-border/30 animate-pulse">
                                <div className="col-span-3 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-border/50 rounded-xl" />
                                    <div className="h-4 w-24 bg-border/50 rounded-lg" />
                                </div>
                                <div className="col-span-3 flex items-center"><div className="h-4 w-36 bg-border/50 rounded-lg" /></div>
                                <div className="col-span-2 flex items-center"><div className="h-6 w-16 bg-border/50 rounded-full" /></div>
                                <div className="col-span-2 flex items-center"><div className="h-6 w-16 bg-border/50 rounded-full" /></div>
                                <div className="col-span-2 flex items-center"><div className="h-4 w-20 bg-border/50 rounded-lg" /></div>
                            </div>
                        ))}
                    </div>
                ) : users.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <Users className="w-16 h-16 text-text-secondary/20 mb-4" />
                        <h3 className="text-xl font-black text-text-primary uppercase">No Users Found</h3>
                        <p className="text-text-secondary font-medium mt-1 text-sm">Try adjusting the search or filter.</p>
                    </div>
                ) : (
                    <AnimatePresence>
                        {users.map((user, idx) => (
                            <motion.div
                                key={user._id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ delay: idx * 0.025 }}
                                className="grid grid-cols-1 md:grid-cols-12 gap-y-3 md:gap-4 px-6 py-4 border-b border-border/30 last:border-0 hover:bg-background/30 transition-colors group"
                            >
                                {/* Avatar + Name */}
                                <div className="md:col-span-3 flex items-center gap-3">
                                    <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center text-primary font-black text-base border border-primary/10">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-black text-text-primary truncate">{user.name}</p>
                                        <p className="text-[10px] font-bold text-text-secondary md:hidden truncate">{user.email}</p>
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="hidden md:col-span-3 md:flex items-center">
                                    <p className="text-sm text-text-secondary font-medium truncate">{user.email}</p>
                                </div>

                                {/* Role */}
                                <div className="md:col-span-1 flex items-center">
                                    <span className={`px-2.5 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${ROLE_STYLES[user.role] || ''}`}>
                                        {user.role}
                                    </span>
                                </div>

                                {/* Status */}
                                <div className="md:col-span-2 flex items-center">
                                    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${user.isActive
                                        ? 'bg-success/10 text-success border-success/20'
                                        : 'bg-danger/10 text-danger border-danger/20'
                                        }`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-success' : 'bg-danger'}`} />
                                        {user.isActive ? 'Active' : 'Suspended'}
                                    </span>
                                </div>

                                {/* Joined */}
                                <div className="hidden md:col-span-2 md:flex items-center">
                                    <p className="text-xs text-text-secondary font-bold">
                                        {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="md:col-span-2 flex items-center justify-start md:justify-end gap-2">
                                    {user.role !== 'admin' && (
                                        <>
                                            <button
                                                onClick={() => handleSuspend(user._id, user.isActive)}
                                                disabled={actionLoading === user._id}
                                                title={user.isActive ? 'Suspend User' : 'Activate User'}
                                                className={`p-2 rounded-xl border transition-all disabled:opacity-40 ${user.isActive
                                                    ? 'bg-warning/10 text-warning border-warning/20 hover:bg-warning hover:text-white hover:border-warning'
                                                    : 'bg-success/10 text-success border-success/20 hover:bg-success hover:text-white hover:border-success'
                                                    }`}
                                            >
                                                {user.isActive ? <ShieldOff className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                                            </button>

                                            {deleteConfirm === user._id ? (
                                                <div className="flex gap-1.5">
                                                    <button
                                                        onClick={() => handleDelete(user._id)}
                                                        disabled={actionLoading === user._id}
                                                        className="px-3 py-1.5 bg-danger text-white text-[9px] font-black uppercase tracking-widest rounded-lg disabled:opacity-40"
                                                    >
                                                        Confirm
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteConfirm(null)}
                                                        className="px-3 py-1.5 bg-background text-text-secondary text-[9px] font-black uppercase tracking-widest rounded-lg border border-border"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setDeleteConfirm(user._id)}
                                                    title="Delete User"
                                                    className="p-2 rounded-xl border bg-danger/10 text-danger border-danger/20 hover:bg-danger hover:text-white hover:border-danger transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </>
                                    )}
                                    {user.role === 'admin' && (
                                        <span className="text-[9px] font-black text-text-secondary uppercase tracking-widest px-2 py-1.5 border border-border rounded-xl bg-background/50 flex items-center gap-1">
                                            <AlertTriangle className="w-3 h-3" /> Protected
                                        </span>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </Card>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-xs font-black text-text-secondary uppercase tracking-widest">
                        Page {page} of {totalPages} · {total} total
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
