import { useState, useEffect } from 'react';
import {
    BarChart as BarChartIcon,
    TrendingUp,
    PieChart as PieChartIcon,
    ArrowUpRight,
    Calendar,
    Filter,
    Download
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import { motion } from 'framer-motion';
import api from '../../services/apiClient';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export interface AnalyticsData {
    summary: {
        totalRevenue: number;
        totalOrders: number;
        averageOrderValue: number;
        revenueGrowth: number;
        ordersGrowth: number;
    };
    revenue: Record<string, unknown>[];
    revenueByDay: { date: string; revenue: number }[];
    topProducts: { name: string; sales: number; revenue: number }[];
}

export default function SellerAnalytics() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const { data } = await api.get('/analytics/seller');
                setData(data.data);
            } catch (_error) {
                console.error('Failed to fetch analytics');
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (loading) return (
        <div className="space-y-8 animate-pulse">
            <div className="h-12 bg-background rounded-2xl w-64" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="h-[400px] bg-background rounded-3xl" />
                <div className="h-[400px] bg-background rounded-3xl" />
            </div>
        </div>
    );

    const categoryPerformance = [
        { name: 'Sarees', sales: 45, revenue: 120000, type: 'Sarees' },
        { name: 'Jewelry', sales: 28, revenue: 85000, type: 'Jewelry' },
        { name: 'Fabrics', sales: 65, revenue: 45000, type: 'Fabrics' },
        { name: 'Home', sales: 12, revenue: 15000, type: 'Home' },
    ];

    return (
        <div className="space-y-8 animate-fade-in-up">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-4xl font-black text-text-primary uppercase tracking-tight">Market Intelligence</h1>
                    <p className="text-text-secondary font-medium mt-1">Understand your neighborhood market patterns.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="rounded-xl"><Download className="w-4 h-4 mr-2" />Export</Button>
                    <Button variant="outline" size="sm" className="rounded-xl"><Calendar className="w-4 h-4 mr-2" />Last 30 Days</Button>
                    <Button variant="outline" size="sm" className="rounded-xl"><Filter className="w-4 h-4 mr-2" />Filters</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Sales Performance */}
                <Card className="p-8 border-border shadow-sm overflow-hidden relative">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h3 className="text-sm font-black text-text-primary uppercase tracking-widest mb-1 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-primary" />
                                Sales Performance
                            </h3>
                            <p className="text-xs font-bold text-text-secondary/50 uppercase tracking-widest">Revenue vs Orders</p>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-black italic text-text-primary">₹{data?.summary.totalRevenue.toLocaleString()}</p>
                            <span className="text-[10px] font-black text-seller uppercase flex items-center justify-end gap-1">
                                <ArrowUpRight className="w-3 h-3" />
                                +12% vs LY
                            </span>
                        </div>
                    </div>

                    <div className="h-[300px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data?.revenue}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="month"
                                    tickFormatter={(v) => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][v - 1]}
                                    stroke="#94a3b8"
                                    fontSize={10}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    labelStyle={{ display: 'none' }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={4} fill="url(#colorRev)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Category Performance */}
                <Card className="p-8 border-border shadow-sm overflow-hidden">
                    <h3 className="text-sm font-black text-text-primary uppercase tracking-widest mb-8 flex items-center gap-2">
                        <BarChartIcon className="w-4 h-4 text-primary" />
                        Category Share
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={categoryPerformance} layout="vertical" margin={{ left: 20 }}>
                                <XAxis type="number" hide />
                                <YAxis dataKey="type" type="category" stroke="#9ca3af" fontSize={10} axisLine={false} tickLine={false} width={80} />
                                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey="sales" fill="#3b82f6" radius={[0, 10, 10, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Top Product Analytics */}
                <Card className="p-8 border-border shadow-sm xl:col-span-2">
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="text-sm font-black text-text-primary uppercase tracking-widest flex items-center gap-2">
                            <PieChartIcon className="w-4 h-4 text-primary" />
                            Product Performance
                        </h3>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-primary-500" />
                                <span className="text-[10px] font-black uppercase text-text-secondary/50">Total Sales</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-primary/20" />
                                <span className="text-[10px] font-black uppercase text-text-secondary/50">Avg. Margin</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {data?.topProducts.map((product: { name: string; sales: number }, idx: number) => (
                            <div key={idx} className="space-y-4">
                                <div className="h-1.5 w-full bg-background rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(product.sales / data.topProducts[0].sales) * 100}%` }}
                                        className="h-full bg-primary"
                                        transition={{ duration: 1, delay: idx * 0.1 }}
                                    />
                                </div>
                                <div className="flex justify-between items-end">
                                    <div className="flex-1">
                                        <p className="text-[10px] font-black text-text-secondary/50 uppercase tracking-widest truncate">{product.name}</p>
                                        <p className="text-xl font-black text-text-primary font-mono">{product.sales}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] font-black uppercase bg-seller/10 text-seller px-2 py-0.5 rounded-lg">Best Seller</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Deep Insights Card */}
            <div className="bg-gray-900 rounded-[40px] p-10 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-12 opacity-5 translate-x-10 translate-y-[-20%] group-hover:scale-110 transition-transform duration-1000">
                    <TrendingUp className="w-64 h-64" />
                </div>
                <div className="relative z-10 max-w-xl">
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-primary-400 mb-4">AI Prediction</h4>
                    <h3 className="text-3xl font-black tracking-tight mb-4 uppercase italic">Surge in 'Silk' demand expected this weekend.</h3>
                    <p className="text-text-secondary/50 font-medium text-lg leading-relaxed mb-8">Data shows a 45% increase in local searches for wedding ethnic wear. We recommend boosting your silk inventory by Friday.</p>
                    <Button className="rounded-2xl px-8 font-black uppercase tracking-widest py-4">Optimize Stock</Button>
                </div>
            </div>
        </div>
    );
}
