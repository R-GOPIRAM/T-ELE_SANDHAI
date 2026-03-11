import { useState, useEffect } from 'react';
import {
    Users,
    Store,
    ShoppingBag,
    TrendingUp,
    DollarSign,
    Package,
    BarChart2,
    Activity
} from 'lucide-react';
import {
    AreaChart,
    Area,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import { motion } from 'framer-motion';
import api from '../../services/apiClient';
import { Card } from '../../components/ui/Card';

interface Metrics {
    totalUsers: number;
    totalSellers: number;
    totalOrders: number;
    totalRevenue: number;
    ordersToday: number;
}

interface SalesPoint {
    label: string;
    revenue: number;
    orders: number;
}

interface GrowthPoint {
    label: string;
    users: number;
}

interface OverviewData {
    metrics: Metrics;
    dailySales: SalesPoint[];
    platformGrowth: GrowthPoint[];
}

const KPI_CARDS = [
    {
        key: 'totalUsers',
        label: 'Total Customers',
        icon: Users,
        color: 'text-blue-500',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20',
        format: (v: number) => v.toLocaleString()
    },
    {
        key: 'totalSellers',
        label: 'Active Sellers',
        icon: Store,
        color: 'text-violet-500',
        bg: 'bg-violet-500/10',
        border: 'border-violet-500/20',
        format: (v: number) => v.toLocaleString()
    },
    {
        key: 'totalOrders',
        label: 'Total Orders',
        icon: ShoppingBag,
        color: 'text-amber-500',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
        format: (v: number) => v.toLocaleString()
    },
    {
        key: 'totalRevenue',
        label: 'Platform Revenue',
        icon: DollarSign,
        color: 'text-emerald-500',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
        format: (v: number) => `₹${(v / 100000).toFixed(1)}L`
    },
];

// Custom recharts tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-card border border-border rounded-2xl p-4 shadow-2xl shadow-black/20 min-w-[160px]">
            <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-3">{label}</p>
            {payload.map((entry: any, i: number) => (
                <div key={i} className="flex items-center justify-between gap-6">
                    <span className="text-xs font-bold" style={{ color: entry.color }}>{entry.name}</span>
                    <span className="text-sm font-black text-text-primary">
                        {entry.name === 'Revenue' ? `₹${entry.value.toLocaleString()}` : entry.value}
                    </span>
                </div>
            ))}
        </div>
    );
};

export default function AdminOverviewPage() {
    const [data, setData] = useState<OverviewData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/analytics/admin')
            .then(res => {
                if (res.data.success) setData(res.data.data);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const metrics = data?.metrics;
    const dailySales = data?.dailySales || [];
    const platformGrowth = data?.platformGrowth || [];

    return (
        <div className="p-6 lg:p-8 space-y-10">
            {/* Page Header */}
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-primary/10 rounded-xl">
                        <Activity className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-primary">Mission Control</span>
                </div>
                <h1 className="text-3xl font-black text-text-primary uppercase tracking-tighter">Platform Overview</h1>
                <p className="text-text-secondary font-medium mt-1 text-sm">
                    Real-time metrics and growth intelligence for T-ELE Sandhai.
                </p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {KPI_CARDS.map((kpi, idx) => {
                    const Icon = kpi.icon;
                    const value = metrics
                        ? (metrics[kpi.key as keyof Metrics] as number)
                        : null;
                    return (
                        <motion.div
                            key={kpi.key}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.08 }}
                        >
                            <Card className={`p-6 border ${kpi.border} hover:scale-[1.02] transition-all duration-500 group rounded-[2rem]`}>
                                <div className={`w-12 h-12 ${kpi.bg} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-500`}>
                                    <Icon className={`w-6 h-6 ${kpi.color}`} />
                                </div>
                                <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-2">{kpi.label}</p>
                                {loading ? (
                                    <div className="h-10 w-24 bg-card animate-pulse rounded-xl" />
                                ) : (
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-3xl font-black text-text-primary tracking-tight"
                                    >
                                        {value !== null ? kpi.format(value) : '—'}
                                    </motion.p>
                                )}
                            </Card>
                        </motion.div>
                    );
                })}
            </div>

            {/* Secondary metric: Orders Today */}
            {!loading && metrics && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="flex items-center gap-4 px-6 py-4 bg-primary/5 border border-primary/20 rounded-2xl w-fit"
                >
                    <div className="p-2.5 bg-primary/10 rounded-xl">
                        <Package className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Orders Today</p>
                        <p className="text-2xl font-black text-primary">{metrics.ordersToday}</p>
                    </div>
                    <div className="w-px h-10 bg-border/50 mx-2" />
                    <div className="flex items-center gap-2 text-success">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-xs font-black uppercase tracking-widest">Live Tracking</span>
                    </div>
                </motion.div>
            )}

            {/* Charts */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Daily Sales Chart */}
                <Card className="p-6 lg:p-8 border-border/50 rounded-[2rem]">
                    <div className="flex items-start justify-between mb-8">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <BarChart2 className="w-4 h-4 text-primary" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Revenue Intelligence</span>
                            </div>
                            <h2 className="text-xl font-black text-text-primary uppercase tracking-tight">Daily Sales</h2>
                            <p className="text-xs text-text-secondary font-bold mt-0.5">Last 14 days · Paid orders only</p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="h-64 bg-background/50 rounded-2xl animate-pulse" />
                    ) : (
                        <ResponsiveContainer width="100%" height={260}>
                            <AreaChart data={dailySales} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                                <defs>
                                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="ordersGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                                <XAxis dataKey="label" tick={{ fontSize: 10, fontWeight: 700, fill: 'var(--color-text-secondary)' }} tickLine={false} axisLine={false} />
                                <YAxis tick={{ fontSize: 10, fontWeight: 700, fill: 'var(--color-text-secondary)' }} tickLine={false} axisLine={false} width={40} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 700, paddingTop: '16px' }} />
                                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="var(--color-primary)" strokeWidth={2.5} fill="url(#revenueGrad)" dot={false} />
                                <Area type="monotone" dataKey="orders" name="Orders" stroke="#f59e0b" strokeWidth={2} fill="url(#ordersGrad)" dot={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </Card>

                {/* Platform Growth Chart */}
                <Card className="p-6 lg:p-8 border-border/50 rounded-[2rem]">
                    <div className="flex items-start justify-between mb-8">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <TrendingUp className="w-4 h-4 text-violet-500" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-500">Growth Signal</span>
                            </div>
                            <h2 className="text-xl font-black text-text-primary uppercase tracking-tight">Platform Growth</h2>
                            <p className="text-xs text-text-secondary font-bold mt-0.5">Last 30 days · New user signups</p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="h-64 bg-background/50 rounded-2xl animate-pulse" />
                    ) : (
                        <ResponsiveContainer width="100%" height={260}>
                            <LineChart data={platformGrowth} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                                <defs>
                                    <linearGradient id="usersGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                                <XAxis dataKey="label" tick={{ fontSize: 10, fontWeight: 700, fill: 'var(--color-text-secondary)' }} tickLine={false} axisLine={false}
                                    interval={Math.floor(platformGrowth.length / 6)}
                                />
                                <YAxis tick={{ fontSize: 10, fontWeight: 700, fill: 'var(--color-text-secondary)' }} tickLine={false} axisLine={false} width={40} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 700, paddingTop: '16px' }} />
                                <Line
                                    type="monotone"
                                    dataKey="users"
                                    name="New Users"
                                    stroke="#8b5cf6"
                                    strokeWidth={2.5}
                                    dot={{ r: 3, fill: '#8b5cf6', strokeWidth: 0 }}
                                    activeDot={{ r: 5, fill: '#8b5cf6', strokeWidth: 0 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </Card>
            </div>

            {/* Revenue Snapshot bottom banner */}
            {!loading && metrics && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                    {[
                        { label: 'Avg. Order Value', value: metrics.totalOrders > 0 ? `₹${Math.round(metrics.totalRevenue / metrics.totalOrders).toLocaleString()}` : '₹0' },
                        { label: 'Seller Density', value: metrics.totalSellers > 0 && metrics.totalUsers > 0 ? `1 per ${Math.round(metrics.totalUsers / metrics.totalSellers)} users` : 'N/A' },
                        { label: 'Order Conversion Rate', value: metrics.totalUsers > 0 ? `${((metrics.totalOrders / metrics.totalUsers) * 100).toFixed(1)}%` : 'N/A' },
                    ].map((stat, i) => (
                        <Card key={i} className="p-5 border-border/30 rounded-2xl flex items-center gap-4 bg-background/30">
                            <div>
                                <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                                <p className="text-2xl font-black text-text-primary">{stat.value}</p>
                            </div>
                        </Card>
                    ))}
                </motion.div>
            )}
        </div>
    );
}
