import { useState, useEffect, useCallback } from 'react';
import {
    BarChart2,
    TrendingUp,
    Store,
    Package,
    DollarSign,
    CreditCard,
    Trophy,
    RefreshCw
} from 'lucide-react';
import {
    AreaChart, Area,
    BarChart, Bar,
    PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend
} from 'recharts';
import { motion } from 'framer-motion';
import api from '../../services/apiClient';
import { Card } from '../../components/ui/Card';
import { toast } from 'react-hot-toast';

interface DayData { label: string; revenue: number; orders: number; paid: number; }
interface StatusDist { _id: string; count: number; }
interface TopSeller { _id: string; businessName: string; revenue: number; orders: number; unitsSold: number; }
interface TopProduct { _id: string; name: string; revenue: number; unitsSold: number; orders: number; }
interface PayMethod { _id: string; revenue: number; count: number; }

interface AnalyticsData {
    revenueByDay: DayData[];
    ordersByStatus: StatusDist[];
    topSellers: TopSeller[];
    topProducts: TopProduct[];
    revenueByMethod: PayMethod[];
}

const PERIOD_OPTIONS = [
    { label: '7D', value: '7' },
    { label: '30D', value: '30' },
    { label: '90D', value: '90' },
];

const STATUS_COLORS: Record<string, string> = {
    Processing: '#f59e0b',
    Shipped: '#3b82f6',
    Delivered: '#22c55e',
    Cancelled: '#ef4444',
};

const PIE_COLORS = ['#6366f1', '#f59e0b', '#22c55e', '#ef4444', '#8b5cf6'];

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

export default function AdminAnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('30');

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const { data: res } = await api.get('/analytics/admin/reports', { params: { period } });
            if (res.success) setData(res.data);
        } catch {
            toast.error('Failed to load analytics');
        } finally {
            setLoading(false);
        }
    }, [period]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const totalRevenue = data?.revenueByDay.reduce((acc, d) => acc + d.revenue, 0) || 0;
    const totalOrders = data?.revenueByDay.reduce((acc, d) => acc + d.orders, 0) || 0;
    const maxSeller = data?.topSellers[0]?.revenue || 1;
    const maxProduct = data?.topProducts[0]?.revenue || 1;

    return (
        <div className="p-6 lg:p-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-primary/10 rounded-xl">
                            <BarChart2 className="w-5 h-5 text-primary" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-primary">Intelligence Hub</span>
                    </div>
                    <h1 className="text-3xl font-black text-text-primary uppercase tracking-tighter">Platform Analytics</h1>
                    <p className="text-text-secondary font-medium mt-1 text-sm">Revenue · Orders · Top Sellers · Top Products</p>
                </div>
                <div className="flex items-center gap-3 self-start">
                    {/* Period selector */}
                    <div className="flex bg-card border border-border rounded-xl overflow-hidden">
                        {PERIOD_OPTIONS.map(opt => (
                            <button
                                key={opt.value}
                                onClick={() => setPeriod(opt.value)}
                                className={`px-4 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all ${period === opt.value
                                    ? 'bg-primary text-white'
                                    : 'text-text-secondary hover:text-text-primary'
                                    }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                    <button onClick={fetchData} className="p-2.5 border border-border rounded-xl text-text-secondary hover:border-primary hover:text-primary transition-all">
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Summary KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { icon: DollarSign, label: 'Period Revenue', value: `₹${(totalRevenue / 100000).toFixed(1)}L`, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
                    { icon: Package, label: 'Period Orders', value: totalOrders.toLocaleString(), color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
                    { icon: Store, label: 'Top Sellers', value: (data?.topSellers.length || 0).toString(), color: 'text-violet-500', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
                    { icon: Trophy, label: 'Top Products', value: (data?.topProducts.length || 0).toString(), color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20' },
                ].map((kpi, i) => {
                    const Icon = kpi.icon;
                    return (
                        <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                            <Card className={`p-5 border ${kpi.border} rounded-[2rem]`}>
                                <div className={`w-10 h-10 ${kpi.bg} rounded-xl flex items-center justify-center mb-4`}>
                                    <Icon className={`w-5 h-5 ${kpi.color}`} />
                                </div>
                                <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-1">{kpi.label}</p>
                                {loading ? (
                                    <div className="h-8 w-20 bg-border animate-pulse rounded-xl" />
                                ) : (
                                    <p className="text-2xl font-black text-text-primary">{kpi.value}</p>
                                )}
                            </Card>
                        </motion.div>
                    );
                })}
            </div>

            {/* Revenue & Orders Chart */}
            <Card className="p-6 lg:p-8 border-border/50 rounded-[2rem]">
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Revenue Trend</span>
                    </div>
                    <h2 className="text-xl font-black text-text-primary uppercase tracking-tight">Revenue & Orders</h2>
                    <p className="text-xs text-text-secondary font-bold mt-0.5">Last {period} days · Paid orders only for revenue</p>
                </div>
                {loading ? (
                    <div className="h-72 bg-background/50 rounded-2xl animate-pulse" />
                ) : (
                    <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={data?.revenueByDay || []} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                            <defs>
                                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.25} />
                                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="ordGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                            <XAxis dataKey="label" tick={{ fontSize: 10, fontWeight: 700, fill: 'var(--color-text-secondary)' }} tickLine={false} axisLine={false}
                                interval={Math.floor((data?.revenueByDay.length || 1) / 7)}
                            />
                            <YAxis tick={{ fontSize: 10, fontWeight: 700, fill: 'var(--color-text-secondary)' }} tickLine={false} axisLine={false} width={45} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 700, paddingTop: '12px' }} />
                            <Area type="monotone" dataKey="revenue" name="Revenue" stroke="var(--color-primary)" strokeWidth={2.5} fill="url(#revGrad)" dot={false} />
                            <Area type="monotone" dataKey="orders" name="Orders" stroke="#f59e0b" strokeWidth={2} fill="url(#ordGrad)" dot={false} />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </Card>

            {/* Order Status + Payment Methods row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Order Status Distribution */}
                <Card className="p-6 lg:p-8 border-border/50 rounded-[2rem]">
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-1">
                            <Package className="w-4 h-4 text-amber-500" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">Order Pipeline</span>
                        </div>
                        <h2 className="text-xl font-black text-text-primary uppercase tracking-tight">Order Status</h2>
                    </div>
                    {loading ? (
                        <div className="h-52 bg-background/50 rounded-2xl animate-pulse" />
                    ) : (
                        <div className="flex items-center gap-6">
                            <ResponsiveContainer width="50%" height={200}>
                                <PieChart>
                                    <Pie data={data?.ordersByStatus || []} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="count" paddingAngle={3}>
                                        {(data?.ordersByStatus || []).map((entry, i) => (
                                            <Cell key={i} fill={STATUS_COLORS[entry._id] || PIE_COLORS[i % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(v) => [v, 'Orders']} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex-1 space-y-3">
                                {(data?.ordersByStatus || []).map((s, i) => (
                                    <div key={s._id} className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full" style={{ background: STATUS_COLORS[s._id] || PIE_COLORS[i % PIE_COLORS.length] }} />
                                            <span className="text-xs font-black text-text-primary">{s._id}</span>
                                        </div>
                                        <span className="text-xs font-black text-text-secondary">{s.count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </Card>

                {/* Payment Methods */}
                <Card className="p-6 lg:p-8 border-border/50 rounded-[2rem]">
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-1">
                            <CreditCard className="w-4 h-4 text-emerald-500" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">Payment Mix</span>
                        </div>
                        <h2 className="text-xl font-black text-text-primary uppercase tracking-tight">Revenue by Method</h2>
                    </div>
                    {loading ? (
                        <div className="h-52 bg-background/50 rounded-2xl animate-pulse" />
                    ) : (
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={data?.revenueByMethod || []} layout="vertical" margin={{ left: 40, right: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
                                <XAxis type="number" tick={{ fontSize: 9, fontWeight: 700, fill: 'var(--color-text-secondary)' }} tickLine={false} axisLine={false} />
                                <YAxis type="category" dataKey="_id" tick={{ fontSize: 10, fontWeight: 900, fill: 'var(--color-text-primary)' }} tickLine={false} axisLine={false} />
                                <Tooltip formatter={(v) => [`₹${Number(v).toLocaleString()}`, 'Revenue']} />
                                <Bar dataKey="revenue" radius={[0, 8, 8, 0]} maxBarSize={28}>
                                    {(data?.revenueByMethod || []).map((_, i) => (
                                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </Card>
            </div>

            {/* Top Sellers + Top Products */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Sellers */}
                <Card className="p-6 lg:p-8 border-border/50 rounded-[2rem]">
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-1">
                            <Store className="w-4 h-4 text-violet-500" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-500">Seller Leaderboard</span>
                        </div>
                        <h2 className="text-xl font-black text-text-primary uppercase tracking-tight">Top Sellers</h2>
                        <p className="text-xs text-text-secondary font-bold mt-0.5">Ranked by revenue generated</p>
                    </div>
                    {loading ? (
                        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-background/50 rounded-xl animate-pulse" />)}</div>
                    ) : (data?.topSellers || []).length === 0 ? (
                        <p className="text-text-secondary font-medium text-sm text-center py-8">No sales data yet.</p>
                    ) : (
                        <div className="space-y-4">
                            {(data?.topSellers || []).map((seller, i) => (
                                <motion.div key={seller._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                                    <div className="flex items-center gap-3 mb-1.5">
                                        <span className={`text-[10px] font-black w-5 ${i === 0 ? 'text-amber-400' : i === 1 ? 'text-slate-400' : i === 2 ? 'text-amber-600' : 'text-text-secondary/40'}`}>
                                            #{i + 1}
                                        </span>
                                        <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center border border-violet-500/20 shrink-0">
                                            <Store className="w-4 h-4 text-violet-500" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-black text-text-primary truncate uppercase tracking-tight">{seller.businessName}</p>
                                            <p className="text-[10px] text-text-secondary font-bold">{seller.unitsSold} units · {seller.orders} orders</p>
                                        </div>
                                        <p className="text-sm font-black text-text-primary shrink-0">₹{seller.revenue.toLocaleString()}</p>
                                    </div>
                                    <div className="pl-8 h-1.5 bg-background rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-gradient-to-r from-violet-500 to-violet-400 rounded-full"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(seller.revenue / maxSeller) * 100}%` }}
                                            transition={{ delay: i * 0.07 + 0.2, duration: 0.6 }}
                                        />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </Card>

                {/* Top Products */}
                <Card className="p-6 lg:p-8 border-border/50 rounded-[2rem]">
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-1">
                            <Package className="w-4 h-4 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Product Leaderboard</span>
                        </div>
                        <h2 className="text-xl font-black text-text-primary uppercase tracking-tight">Top Products</h2>
                        <p className="text-xs text-text-secondary font-bold mt-0.5">Ranked by revenue generated</p>
                    </div>
                    {loading ? (
                        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-background/50 rounded-xl animate-pulse" />)}</div>
                    ) : (data?.topProducts || []).length === 0 ? (
                        <p className="text-text-secondary font-medium text-sm text-center py-8">No sales data yet.</p>
                    ) : (
                        <div className="space-y-4">
                            {(data?.topProducts || []).map((product, i) => (
                                <motion.div key={product._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                                    <div className="flex items-center gap-3 mb-1.5">
                                        <span className={`text-[10px] font-black w-5 ${i === 0 ? 'text-amber-400' : i === 1 ? 'text-slate-400' : i === 2 ? 'text-amber-600' : 'text-text-secondary/40'}`}>
                                            #{i + 1}
                                        </span>
                                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
                                            <Package className="w-4 h-4 text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-black text-text-primary truncate uppercase tracking-tight">{product.name || 'Unnamed Product'}</p>
                                            <p className="text-[10px] text-text-secondary font-bold">{product.unitsSold} units · {product.orders} orders</p>
                                        </div>
                                        <p className="text-sm font-black text-text-primary shrink-0">₹{product.revenue.toLocaleString()}</p>
                                    </div>
                                    <div className="pl-8 h-1.5 bg-background rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(product.revenue / maxProduct) * 100}%` }}
                                            transition={{ delay: i * 0.07 + 0.2, duration: 0.6 }}
                                        />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
