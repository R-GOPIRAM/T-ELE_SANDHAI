import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowUpRight,
  BarChart2,
  Bell,
  Boxes,
  DollarSign,
  Package,
  Plus,
  ShoppingBag,
  X
} from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import toast from 'react-hot-toast';
import api from '../../services/apiClient';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../hooks/useSocket';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { Product } from '../../types';

interface AnalyticsData {
  summary: {
    totalRevenue: number;
    totalOrders: number;
    ordersToday?: number;
    uniqueCustomers: number;
  };
  revenue: Array<{ month: number; year: number; revenue: number; orderCount: number }>;
  topProducts: Array<{ name: string; sales: number; revenue?: number }>;
}

interface StockAlertUI {
  _id: string;
  productName: string;
  currentStock: number;
  threshold: number;
  createdAt: string;
}

const colorMap: Record<string, string> = {
  emerald: 'text-seller bg-seller/10 border-seller/20',
  blue: 'text-primary bg-primary/10 border-primary/20',
  amber: 'text-warning bg-warning/10 border-warning/20',
  indigo: 'text-bargain bg-bargain/10 border-bargain/20',
};

function StatCard({ stat }: { stat: { title: string; value: string | number; icon: React.ElementType; color: string } }) {
  const Icon = stat.icon;
  const colorClass = colorMap[stat.color] || 'text-text-primary bg-background border-border';
  return (
    <Card className="p-8 border-border card-hover-lift shadow-sm hover:shadow-xl transition-all duration-300">
      <div className={`w-16 h-16 rounded-2xl mb-8 flex items-center justify-center border shadow-inner ${colorClass}`}>
        <Icon size={32} />
      </div>
      <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.25em] mb-2">{stat.title}</p>
      <h3 className="text-[44px] leading-none font-black text-text-primary tracking-tighter">{stat.value}</h3>
    </Card>
  );
}

export default function SellerDashboard() {
  const { user, loading: authLoading } = useAuth();
  const socket = useSocket();
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [stockAlerts, setStockAlerts] = useState<StockAlertUI[]>([]);
  const [verificationStatus, setVerificationStatus] = useState<string>('pending');
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const { data: analyticsRes } = await api.get('/analytics/seller');
      setAnalytics(analyticsRes?.data || null);

      const { data: productsRes } = await api.get('/products/seller/my-products', { params: { page: 1, limit: 10 } });
      const list = productsRes?.data?.products;
      setProducts(Array.isArray(list) ? list : []);

      const { data: sellerRes } = await api.get('/sellers/profile');
      if (sellerRes?.data) setVerificationStatus(sellerRes.data.sellerStatus || 'pending');

      const { data: alertsRes } = await api.get('/sellers/alerts/stock');
      const alertList = alertsRes?.data;
      setStockAlerts(Array.isArray(alertList) ? alertList : []);
    } catch (_e) {
      toast.error('Failed to load seller dashboard');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!socket) return;
    const onUpdate = (data: { message?: string }) => {
      toast.success(data.message || 'Update received!');
      fetchData();
    };
    const onStockAlert = (data: { message: string }) => {
      toast(data.message, { duration: 6000 });
      api.get('/sellers/alerts/stock').then(res => {
        const list = res?.data?.data;
        setStockAlerts(Array.isArray(list) ? list : []);
      });
    };
    socket.on('dashboard_update', onUpdate);
    socket.on('stock_alert', onStockAlert);
    return () => {
      socket.off('dashboard_update', onUpdate);
      socket.off('stock_alert', onStockAlert);
    };
  }, [socket, fetchData]);

  const markAlertRead = useCallback(async (alertId: string) => {
    try {
      await api.patch(`/sellers/alerts/stock/${alertId}/read`);
      setStockAlerts(prev => prev.filter(a => a._id !== alertId));
    } catch {
      toast.error('Failed to dismiss alert');
    }
  }, []);

  const stats = useMemo(() => ([
    { title: 'Total Revenue', value: `₹${(analytics?.summary?.totalRevenue ?? 0).toLocaleString()}`, icon: DollarSign, color: 'emerald' },
    { title: 'Orders Today', value: analytics?.summary?.ordersToday ?? 0, icon: ShoppingBag, color: 'blue' },
    { title: 'Total Orders', value: analytics?.summary?.totalOrders ?? 0, icon: ShoppingBag, color: 'indigo' },
    { title: 'Inventory', value: products.length, icon: Package, color: 'amber' },
  ]), [analytics, products.length]);

  const chartData = useMemo(() => {
    const rows = analytics?.revenue ?? [];
    return rows.map(r => ({
      label: `${r.month}/${r.year}`,
      revenue: r.revenue,
      orders: r.orderCount,
    }));
  }, [analytics]);

  if (authLoading || loading) {
    return <Skeleton variant="rect" className="h-[600px] w-full rounded-[40px]" />;
  }

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-5xl font-heading font-black text-text-primary uppercase tracking-tight">Seller Command</h1>
          <p className="text-text-secondary font-bold text-lg mt-2">
            {verificationStatus === 'approved' ? 'Verified seller hub is live.' : 'Awaiting verification approval.'}
          </p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="rounded-2xl w-14 h-14 p-0 border-2 border-border hover:border-primary" aria-label="Notifications">
            <Bell className="w-5 h-5" />
          </Button>
          <Button className="rounded-2xl px-8 h-14 text-sm font-black uppercase tracking-widest shadow-xl shadow-primary/20" onClick={() => navigate('/dashboard/seller/add-product')}>
            <Plus className="w-5 h-5 mr-2" />New Offering
          </Button>
        </div>
      </div>

      {stockAlerts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-danger" />
            <h3 className="text-xs font-black text-text-primary uppercase tracking-widest">Inventory Alerts</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stockAlerts.map(alert => (
              <div key={alert._id} className="bg-danger/10 border border-red-100 rounded-2xl p-4 flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center text-danger">
                    <Package size={20} />
                  </div>
                  <div>
                    <h5 className="font-black text-red-900 text-xs uppercase">{alert.productName}</h5>
                    <p className="text-[10px] text-red-700 font-bold">Only {alert.currentStock} units remaining (Threshold: {alert.threshold})</p>
                  </div>
                </div>
                <button
                  onClick={() => markAlertRead(alert._id)}
                  className="p-2 text-red-400 hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Dismiss alert"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {stats.map((s) => (
          <StatCard key={s.title} stat={s} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        <Card className="xl:col-span-2 p-0 border-border overflow-hidden shadow-sm">
          <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between bg-background/30">
            <h3 className="text-sm font-black text-text-primary uppercase tracking-widest">Revenue Trend</h3>
            <button onClick={() => navigate('/dashboard/seller/analytics')} className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Full Report</button>
          </div>
          <div className="p-6 h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="currentColor" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="currentColor" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="var(--tw-prose-body)" fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-0 border-border overflow-hidden shadow-sm">
          <div className="px-8 py-6 border-b border-gray-50 bg-background/30">
            <h3 className="text-sm font-black text-text-primary uppercase tracking-widest">Quick Operations</h3>
          </div>
          <div className="p-4 grid grid-cols-1 gap-3">
            <button onClick={() => navigate('/dashboard/seller/add-product')} className="flex items-center gap-4 bg-background p-4 rounded-2xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <Plus size={20} />
              </div>
              <div className="flex-1 text-left">
                <h4 className="text-[11px] font-black text-text-primary uppercase">Add New Product</h4>
                <p className="text-[9px] font-bold text-text-secondary uppercase">Expand your local catalog</p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            <button onClick={() => navigate('/dashboard/seller/inventory')} className="flex items-center gap-4 bg-background p-4 rounded-2xl border border-border hover:border-amber-100 hover:bg-amber-50/50 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center text-warning group-hover:scale-110 transition-transform">
                <Boxes size={20} />
              </div>
              <div className="flex-1 text-left">
                <h4 className="text-[11px] font-black text-text-primary uppercase">My Inventory</h4>
                <p className="text-[9px] font-bold text-text-secondary uppercase">View / edit / delete</p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            <button onClick={() => navigate('/dashboard/seller/orders')} className="flex items-center gap-4 bg-background p-4 rounded-2xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <ShoppingBag size={20} />
              </div>
              <div className="flex-1 text-left">
                <h4 className="text-[11px] font-black text-text-primary uppercase">Orders</h4>
                <p className="text-[9px] font-bold text-text-secondary uppercase">Pending local pickups</p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            <button onClick={() => navigate('/dashboard/seller/analytics')} className="flex items-center gap-4 bg-background p-4 rounded-2xl border border-border hover:border-bargain/50 hover:bg-bargain/5 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-bargain/10 flex items-center justify-center text-bargain group-hover:scale-110 transition-transform">
                <BarChart2 size={20} />
              </div>
              <div className="flex-1 text-left">
                <h4 className="text-[11px] font-black text-text-primary uppercase">Business Analytics</h4>
                <p className="text-[9px] font-bold text-text-secondary uppercase">Sales & hub insights</p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}

