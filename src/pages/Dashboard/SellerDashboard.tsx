import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import {
  BarChart2,
  Package,
  ShoppingBag,
  MessageSquare,
  ChevronRight,
  LogOut,
  Bell,
  X,
  TrendingUp,
  History,
  ArrowUpRight,
  Zap,
  Search
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../hooks/useSocket';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import api from '../../services/apiClient';
import BargainAnalytics from '../../features/bargain/BargainAnalytics';
import SellerInventory from './SellerInventory';
import SellerAnalytics from './SellerAnalytics';
import SellerOrdersPage from './SellerOrdersPage';
import { Skeleton } from '../../components/ui/Skeleton';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

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

type TabId = 'overview' | 'products' | 'orders' | 'analytics' | 'bargains' | 'settings' | 'inventory';

const MENU_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'orders', label: 'Orders', icon: ShoppingBag },
  { id: 'bargains', label: 'Bargains', icon: MessageSquare },
  { id: 'inventory', label: 'Inventory', icon: Boxes },
  { id: 'analytics', label: 'Analytics', icon: BarChart2 },
] as const;

const Sidebar = memo(({
  user,
  activeTab,
  setActiveTab,
  verificationStatus,
  onLogout
}: {
  user: { name?: string; role?: string; id?: string; email?: string } | null,
  activeTab: TabId,
  setActiveTab: (id: TabId) => void,
  verificationStatus: string,
  onLogout: () => void
}) => {
  return (
    <aside className="lg:w-72 flex-shrink-0">
      <div className="glass-panel overflow-hidden sticky top-28 p-2">
        <div className="p-8 border-b border-border bg-background/50 rounded-t-[2.5rem]">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-seller rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-seller/30">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <h3 className="font-heading font-black text-text-primary truncate uppercase text-sm leading-tight">{user?.name}</h3>
              <p className={`text-[10px] font-black uppercase tracking-widest truncate mt-1 ${verificationStatus === 'approved' ? 'text-seller' : 'text-warning'}`}>
                {verificationStatus === 'approved' ? 'Verified Node' : 'Awaiting Hub'}
              </p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as TabId)}
                className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-black uppercase text-[11px] tracking-widest transition-all group ${isActive
                  ? 'bg-seller text-white shadow-xl shadow-seller/20 translate-x-1'
                  : 'text-text-secondary hover:bg-background hover:text-text-primary'
                  }`}
              >
                <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-text-secondary group-hover:text-seller'}`} />
                <span className="flex-1 text-left">{item.label}</span>
                {isActive && <ChevronRight className="w-3 h-3" />}
              </button>
            );
          })}

          <div className="pt-4 mt-4 border-t border-border">
            <button onClick={onLogout} className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-black uppercase text-[11px] tracking-widest text-danger hover:bg-danger/10 transition-all group">
              <LogOut className="w-4 h-4 text-danger transition-transform group-hover:scale-110" />
              <span className="flex-1 text-left">Sign Out</span>
            </button>
          </div>
        </nav>
      </div>
    </aside>
  );
});

const colorMap: Record<string, string> = {
  emerald: 'text-seller bg-seller/10 border-seller/20',
  blue: 'text-primary bg-primary/10 border-primary/20',
  amber: 'text-warning bg-warning/10 border-warning/20',
  indigo: 'text-bargain bg-bargain/10 border-bargain/20',
};

const StatCard = memo(({ stat }: { stat: { title: string; value: string | number; icon: React.ElementType; color: string } }) => {
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
});

const OverviewTab = memo(({
  analytics,
  products,
  onTabChange,
  verificationStatus,
  stockAlerts,
  onMarkRead
}: {
  analytics: AnalyticsData | null,
  products: Product[],
  onTabChange: (tab: TabId) => void,
  verificationStatus: string,
  stockAlerts: StockAlertUI[],
  onMarkRead: (id: string) => void
}) => {
  const navigate = useNavigate();

  const stats = useMemo(() => [
    { title: 'Total Revenue', value: `₹${analytics?.summary.totalRevenue.toLocaleString() || '0'}`, icon: DollarSign, color: 'emerald' },
    { title: 'Orders Today', value: analytics?.summary.ordersToday || 0, icon: ShoppingBag, color: 'blue' },
    { title: 'Total Orders', value: analytics?.summary.totalOrders || 0, icon: ShoppingBag, color: 'indigo' },
    { title: 'Inventory', value: products.length, icon: Package, color: 'amber' },
  ], [analytics, products.length]);

  const handleAddProduct = useCallback(() => navigate('/dashboard/seller/add-product'), [navigate]);
  const handleViewBargains = useCallback(() => onTabChange('bargains'), [onTabChange]);
  const handleViewAnalytics = useCallback(() => onTabChange('analytics'), [onTabChange]);

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-5xl font-heading font-black text-text-primary uppercase tracking-tight">Seller Command</h1>
          <p className="text-text-secondary font-bold text-lg mt-2">Managing your local marketplace presence.</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="rounded-2xl w-14 h-14 p-0 border-2 border-border hover:border-primary"><Bell className="w-5 h-5" /></Button>
          <Button className="rounded-2xl px-8 h-14 text-sm font-black uppercase tracking-widest shadow-xl shadow-primary/20" onClick={handleAddProduct}><Plus className="w-5 h-5 mr-2" />New Offering</Button>
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
                  onClick={() => onMarkRead(alert._id)}
                  className="p-2 text-red-400 hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {verificationStatus === 'pending' && (
        <div className="bg-warning/10 border border-amber-100 rounded-[32px] p-8 flex items-start gap-6 shadow-sm">
          <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center flex-shrink-0 text-warning">
            <AlertCircle size={32} />
          </div>
          <div>
            <h4 className="text-lg font-black text-amber-900 uppercase tracking-tight mb-1">Verification in Progress</h4>
            <p className="text-amber-700 font-medium max-w-2xl leading-relaxed">Our neighborhood moderation team is reviewing your shop details. You can still set up your products, but they'll be visible to locals once verified.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <StatCard key={idx} stat={stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* CHART SECTION */}
        <Card className="xl:col-span-2 p-8 border-border shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-sm font-black text-text-primary uppercase tracking-widest flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-seller" />
                Revenue Growth
              </h3>
              <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mt-1">Monthly performance scaling</p>
            </div>
            <div className="flex gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1 bg-seller/10 text-seller rounded-full text-[10px] font-black uppercase tracking-widest">
                <TrendingUp className="w-3 h-3" /> +12.5%
              </span>
            </div>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.revenue || []}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis
                  dataKey="month"
                  stroke="#9ca3af"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => {
                    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    return months[val - 1];
                  }}
                />
                <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* QUICK ACTIONS SECTION */}
        <div className="xl:col-span-1 space-y-6">
          <Card className="p-0 border-border overflow-hidden shadow-sm bg-primary/5">
            <div className="px-8 py-6 border-b border-primary/10">
              <h3 className="text-sm font-black text-text-primary uppercase tracking-widest flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                Quick Operations
              </h3>
            </div>
            <div className="p-4 grid grid-cols-1 gap-3">
              <button onClick={handleAddProduct} className="flex items-center gap-4 bg-background p-4 rounded-2xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <Plus size={20} />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="text-[11px] font-black text-text-primary uppercase">Add New Product</h4>
                  <p className="text-[9px] font-bold text-text-secondary uppercase">Expand your local catalog</p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              <button onClick={() => onTabChange('inventory')} className="flex items-center gap-4 bg-background p-4 rounded-2xl border border-border hover:border-amber-100 hover:bg-amber-50/50 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center text-warning group-hover:scale-110 transition-transform">
                  <Boxes size={20} />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="text-[11px] font-black text-text-primary uppercase">Manage Inventory</h4>
                  <p className="text-[9px] font-bold text-text-secondary uppercase">Quick stock adjustments</p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              <button onClick={() => onTabChange('orders')} className="flex items-center gap-4 bg-background p-4 rounded-2xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <ShoppingBag size={20} />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="text-[11px] font-black text-text-primary uppercase">View Orders</h4>
                  <p className="text-[9px] font-bold text-text-secondary uppercase">Pending local pickups</p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              <button onClick={handleViewAnalytics} className="flex items-center gap-4 bg-background p-4 rounded-2xl border border-border hover:border-bargain/50 hover:bg-bargain/5 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-bargain/10 flex items-center justify-center text-bargain group-hover:scale-110 transition-transform">
                  <BarChart2 size={20} />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="text-[11px] font-black text-text-primary uppercase">Business Analytics</h4>
                  <p className="text-[9px] font-bold text-text-secondary uppercase">Sales & Hub insights</p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          </Card>

          <div className="bg-gradient-to-br from-seller to-emerald-700 rounded-3xl p-8 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-500">
              <History className="w-24 h-24" />
            </div>
            <h4 className="text-lg font-black text-white uppercase tracking-tight mb-2">Seller Hub Status</h4>
            <p className="text-white/60 text-[10px] font-medium max-w-[200px] mb-6 uppercase tracking-widest">Store verified and live on the network.</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span className="text-[9px] text-white font-black uppercase tracking-widest">Operational • Localmart Node 42</span>
            </div>
          </div>
        </div>

        <Card className="xl:col-span-2 p-0 border-border overflow-hidden shadow-sm">
          <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between bg-background/30">
            <h3 className="text-sm font-black text-text-primary uppercase tracking-widest">Top Selling Products</h3>
            <button onClick={handleViewAnalytics} className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Full Report</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-background/50 text-[10px] font-black text-text-secondary/50 uppercase tracking-widest">
                <tr>
                  <th className="px-8 py-5">Product</th>
                  <th className="px-8 py-5 text-center">Sales</th>
                  <th className="px-8 py-5 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {analytics?.topProducts.slice(0, 5).map((p, idx) => (
                  <tr key={idx} className="group hover:bg-background/30">
                    <td className="px-8 py-4 font-black text-text-primary uppercase text-xs truncate max-w-[200px]">{p.name}</td>
                    <td className="px-8 py-4 text-center font-bold text-text-secondary/50">{p.sales}</td>
                    <td className="px-8 py-4 text-right font-black text-text-primary font-mono italic">₹{(p.revenue || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="xl:col-span-1 p-0 border-border overflow-hidden shadow-sm">
          <div className="px-8 py-6 border-b border-gray-50 bg-warning/10/20">
            <h3 className="text-sm font-black text-text-primary uppercase tracking-widest">Bargain Activity</h3>
          </div>
          <div className="p-8">
            <BargainAnalytics />
            <Button variant="outline" className="w-full rounded-2xl mt-4 font-black uppercase text-[10px] tracking-widest border-2 py-4" onClick={handleViewBargains}>View Requests</Button>
          </div>
        </Card>
      </div>
    </div>
  );
});

const ProductsTab = memo(({
  products,
  onPageChange,
  onRefresh,
  pagination,
  onNavigatePage,
  onSearch: handleSearch,
  searchTerm
}: {
  products: Product[],
  onPageChange: (page: string) => void,
  onRefresh: () => void,
  pagination: { page: number; totalPages: number; total: number } | null,
  onNavigatePage: (page: number) => void,
  onSearch: (term: string) => void,
  searchTerm: string
}) => {
  const navigate = useNavigate();
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [editStockValue, setEditStockValue] = useState<number>(0);
  const [isUpdatingStock, setIsUpdatingStock] = useState(false);

  const handleDelete = useCallback(async (id: string) => {
    if (confirm('Deploying removal sequence? This will delist the product from the local marketplace.')) {
      try {
        await api.delete(`/products/${id}`);
        toast.success('Product delisted successfully');
        onRefresh();
      } catch (_e) {
        toast.error('Manifest deletion failed');
      }
    }
  }, [onRefresh]);

  const handleUpdateStock = async (id: string) => {
    setIsUpdatingStock(true);
    try {
      await api.patch(`/products/${id}/stock`, { stock: editStockValue });
      toast.success('Inventory synchronized');
      setEditingStockId(null);
      onRefresh();
    } catch (_e) {
      toast.error('Inventory sync failed');
    } finally {
      setIsUpdatingStock(false);
    }
  };

  const handleAddNewItem = useCallback(() => onPageChange('seller/add-product'), [onPageChange]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black text-text-primary uppercase tracking-tight">Product Manifest</h1>
          <p className="text-text-secondary font-medium mt-1">Full control over your hyper-local marketplace offerings.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary/50" />
            <input
              type="text"
              placeholder="Filter manifest..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-12 pr-4 h-14 bg-card border border-border rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none shadow-sm transition-all"
            />
          </div>
          <Button className="rounded-2xl px-8 h-14 text-sm font-black uppercase tracking-widest shadow-xl shadow-primary/20" onClick={handleAddNewItem}>
            <Plus className="w-5 h-5 mr-2" />New Offloading
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-[40px] border border-border shadow-2xl shadow-border/5 p-2 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-background/50 border-b border-border text-[10px] font-black text-text-secondary/50 uppercase tracking-widest">
              <tr>
                <th className="px-8 py-6">Identity</th>
                <th className="px-8 py-6">Segment</th>
                <th className="px-8 py-6">Cost nodes</th>
                <th className="px-8 py-6">Inventory status</th>
                <th className="px-8 py-6 text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {products.length > 0 ? products.map((p) => (
                <tr key={p.id} className="group hover:bg-background/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-card border border-border rounded-2xl p-1 overflow-hidden flex-shrink-0 shadow-sm transition-transform group-hover:scale-105">
                        <img src={p.images[0]} alt="" className="w-full h-full object-contain" />
                      </div>
                      <div>
                        <h4 className="font-black text-text-primary uppercase text-xs leading-none mb-1.5">{p.name}</h4>
                        <p className="text-[10px] text-text-secondary/50 font-bold uppercase tracking-widest">{p.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-[10px] font-black text-text-secondary/50 uppercase tracking-widest leading-none">
                    <span className="bg-background px-3 py-1.5 rounded-lg border border-border">{p.category}</span>
                  </td>
                  <td className="px-8 py-6 font-black text-text-primary font-mono italic">₹{p.price.toLocaleString()}</td>
                  <td className="px-8 py-6">
                    {editingStockId === p.id ? (
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="number"
                          autoFocus
                          value={editStockValue}
                          onChange={(e) => setEditStockValue(parseInt(e.target.value) || 0)}
                          className="w-20 h-10 px-3 bg-background border border-primary/30 rounded-xl text-xs font-black focus:ring-2 focus:ring-primary/10 outline-none"
                        />
                        <button
                          onClick={() => handleUpdateStock(p.id)}
                          disabled={isUpdatingStock}
                          className="p-2 bg-seller text-white rounded-lg hover:bg-seller/90 transition-all shadow-lg shadow-seller/20"
                        >
                          {isUpdatingStock ? <Zap className="w-3 h-3 animate-pulse" /> : <ChevronRight className="w-3 h-3" />}
                        </button>
                        <button onClick={() => setEditingStockId(null)} className="p-2 text-text-secondary hover:text-danger"><X size={14} /></button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setEditingStockId(p.id); setEditStockValue(p.stock); }}
                        className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all hover:scale-105 ${p.stock > 10 ? 'bg-seller/5 text-seller border-seller/20' :
                          p.stock > 0 ? 'bg-warning/10 text-warning border-warning/20' :
                            'bg-danger/10 text-danger border-danger/20'
                          }`}
                      >
                        {p.stock > 0 ? `${p.stock} Units` : 'Depleted'}
                      </button>
                    )}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                      <button onClick={() => onPageChange(`product:${p.id}`)} className="p-3 bg-card border border-border rounded-xl text-text-secondary/50 hover:text-primary hover:border-primary/20 shadow-sm transition-all hover:-translate-y-1"><Eye size={16} /></button>
                      <button onClick={() => onPageChange(`seller/edit-product/${p.id}`)} className="p-3 bg-card border border-border rounded-xl text-text-secondary/50 hover:text-warning hover:border-amber-100 shadow-sm transition-all hover:-translate-y-1"><Edit size={16} /></button>
                      <button onClick={() => handleDelete(p.id)} className="p-3 bg-card border border-border rounded-xl text-text-secondary/50 hover:text-danger hover:border-red-100 shadow-sm transition-all hover:-translate-y-1"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-20">
                      <Package size={64} />
                      <p className="text-sm font-black uppercase tracking-widest">No matching manifest items</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="p-8 border-t border-border flex items-center justify-between bg-background/30">
            <p className="text-[10px] font-black text-text-secondary/50 uppercase tracking-widest">
              Showing Page {pagination.page} of {pagination.totalPages} ({pagination.total} Total)
            </p>
            <div className="flex gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => onNavigatePage(pagination.page - 1)}
                className="px-4 py-2 border border-border rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-30 hover:bg-card transition-all"
              >
                Previous
              </button>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(num => (
                <button
                  key={num}
                  onClick={() => onNavigatePage(num)}
                  className={`w-10 h-10 rounded-xl text-[10px] font-black transition-all ${pagination.page === num ? 'bg-seller text-white shadow-lg shadow-seller/20' : 'border border-border hover:bg-card'
                    }`}
                >
                  {num}
                </button>
              ))}
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => onNavigatePage(pagination.page + 1)}
                className="px-4 py-2 border border-border rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-30 hover:bg-card transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

// --- Main Dashboard ---

export default function SellerDashboard({ initialTab = 'overview' }: { initialTab?: string }) {
  const { user, logout, loading: authLoading } = useAuth();
  const socket = useSocket();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>(initialTab as TabId);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [stockAlerts, setStockAlerts] = useState<StockAlertUI[]>([]);
  const [verificationStatus, setVerificationStatus] = useState<string>('pending');

  // Pagination & Search State
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Handle Search Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset to first page on search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchData = useCallback(async (targetPage = page, search = debouncedSearch) => {
    if (!user?.id) return;
    setLoading(true);
    try {
      // Fetch Analytics (only on load or refresh)
      const { data: analyticsRes } = await api.get('/analytics/seller');
      setAnalytics(analyticsRes.data);

      // Fetch Paginated Products
      const { data: productsRes } = await api.get('/products/seller/my-products', {
        params: {
          page: targetPage,
          limit,
          search: search || undefined
        }
      });
      setProducts(productsRes.data.products);
      setTotalPages(productsRes.data.pagination.totalPages);
      setTotalProducts(productsRes.data.pagination.total);

      const { data: sellerRes } = await api.get('/sellers/profile');
      if (sellerRes.data) setVerificationStatus(sellerRes.data.sellerStatus || 'pending');

      const { data: alertsRes } = await api.get('/sellers/alerts/stock');
      setStockAlerts(alertsRes.data || []);
    } catch (_error) {
      console.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  }, [user?.id, limit, page, debouncedSearch]);

  useEffect(() => {
    fetchData(page, debouncedSearch);
  }, [fetchData, page, debouncedSearch]);

  useEffect(() => {
    if (socket) {
      const handleDashboardUpdate = (data: { message?: string }) => {
        toast.success(data.message || 'Update received!', { icon: '📦' });
        fetchData();
      };

      const handleStockAlert = (data: { message: string }) => {
        toast(data.message, { icon: '⚠️', duration: 6000 });
        api.get('/sellers/alerts/stock').then(res => setStockAlerts(res.data.data));
      };

      socket.on('dashboard_update', handleDashboardUpdate);
      socket.on('stock_alert', handleStockAlert);

      return () => {
        socket.off('dashboard_update', handleDashboardUpdate);
        socket.off('stock_alert', handleStockAlert);
      };
    }
  }, [socket, fetchData]);

  const markAlertRead = useCallback(async (alertId: string) => {
    try {
      await api.patch(`/sellers/alerts/stock/${alertId}/read`);
      setStockAlerts(prev => prev.filter(a => a._id !== alertId));
    } catch (_err) {
      console.error('Failed to mark alert as read');
    }
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/');
  }, [logout, navigate]);

  const handlePageChange = useCallback((route: string) => {
    if (route.startsWith('product:')) {
      navigate(`/product/${route.split(':')[1]}`);
    } else {
      navigate(`/dashboard/${route}`);
    }
  }, [navigate]);

  const content = useMemo(() => {
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewTab
            analytics={analytics}
            products={products}
            onTabChange={setActiveTab}
            verificationStatus={verificationStatus}
            stockAlerts={stockAlerts}
            onMarkRead={markAlertRead}
          />
        );
      case 'products':
        return (
          <ProductsTab
            products={products}
            onPageChange={handlePageChange}
            onRefresh={() => fetchData(page, debouncedSearch)}
            pagination={{ page, totalPages, total: totalProducts }}
            onNavigatePage={setPage}
            onSearch={setSearchTerm}
            searchTerm={searchTerm}
          />
        );
      case 'orders':
        return <SellerOrdersPage />;
      case 'bargains':
        return <div className="space-y-8"><BargainAnalytics /></div>;
      case 'inventory':
        return <SellerInventory />;
      case 'analytics':
        return <SellerAnalytics />;
      default:
        return null;
    }
  }, [activeTab, analytics, products, verificationStatus, stockAlerts, markAlertRead, handlePageChange, fetchData, page, debouncedSearch, totalPages, totalProducts, searchTerm]);

  if (authLoading || (loading && !analytics)) {
    return <div className="pt-32 px-8 max-w-7xl mx-auto"><Skeleton variant="rect" className="h-[600px] w-full rounded-[40px]" /></div>;
  }

  return (
    <div className="min-h-screen bg-background pb-24 pt-8 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-seller/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-1/4 -left-1/4 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px] -z-10" />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="flex flex-col lg:flex-row gap-8">
          <Sidebar
            user={user}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            verificationStatus={verificationStatus}
            onLogout={handleLogout}
          />
          <main className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {content}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}