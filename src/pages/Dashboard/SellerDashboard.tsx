import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import {
  BarChart2,
  Package,
  ShoppingBag,
  MessageSquare,
  Users,
  DollarSign,
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  Eye,
  LayoutDashboard,
  Boxes,
  ChevronRight,
  LogOut,
  Bell,
  X
} from 'lucide-react';
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
    uniqueCustomers: number;
  };
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
      <div className="bg-card rounded-[32px] border border-border shadow-sm overflow-hidden sticky top-24">
        <div className="p-8 border-b border-border bg-background">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-seller rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-seller/20">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <h3 className="font-black text-text-primary truncate uppercase text-sm">{user?.name}</h3>
              <p className={`text-[10px] font-black uppercase tracking-widest truncate ${verificationStatus === 'approved' ? 'text-seller' : 'text-warning'}`}>
                {verificationStatus === 'approved' ? 'Verified Seller' : 'Verification Pending'}
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
  emerald: 'text-seller bg-seller/10',
  blue: 'text-primary bg-primary/10',
  amber: 'text-warning bg-warning/10',
  indigo: 'text-bargain bg-bargain/10',
};

const StatCard = memo(({ stat }: { stat: { title: string; value: string | number; icon: React.ElementType; color: string } }) => {
  const Icon = stat.icon;
  const colorClass = colorMap[stat.color] || 'text-text-primary bg-background';
  return (
    <Card className="p-8 border-border card-hover-lift">
      <div className={`w-14 h-14 rounded-2xl mb-6 flex items-center justify-center ${colorClass}`}>
        <Icon size={28} />
      </div>
      <p className="text-xs font-black text-text-secondary uppercase tracking-[0.2em] mb-2">{stat.title}</p>
      <h3 className="text-[40px] leading-none font-extrabold text-text-primary tracking-tight">{stat.value}</h3>
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
    { title: 'Revenue', value: `₹${analytics?.summary.totalRevenue.toLocaleString() || '0'}`, icon: DollarSign, color: 'emerald' },
    { title: 'Orders', value: analytics?.summary.totalOrders || 0, icon: ShoppingBag, color: 'blue' },
    { title: 'Inventory', value: products.length, icon: Package, color: 'amber' },
    { title: 'Customers', value: analytics?.summary.uniqueCustomers || 0, icon: Users, color: 'indigo' },
  ], [analytics, products.length]);

  const handleAddProduct = useCallback(() => navigate('/dashboard/add-product'), [navigate]);
  const handleViewBargains = useCallback(() => onTabChange('bargains'), [onTabChange]);
  const handleViewAnalytics = useCallback(() => onTabChange('analytics'), [onTabChange]);

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black text-text-primary uppercase tracking-tight">Store Overview</h1>
          <p className="text-text-secondary font-medium mt-1">Real-time performance of your local storefront.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-2xl py-3 border-border"><Bell className="w-4 h-4" /></Button>
          <Button className="rounded-2xl py-3 px-6 shadow-xl shadow-primary-100" onClick={handleAddProduct}><Plus className="w-4 h-4 mr-2" />Add Product</Button>
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

const ProductsTab = memo(({ products, onPageChange, onRefresh }: { products: Product[], onPageChange: (page: string) => void, onRefresh: () => void }) => {
  const handleDelete = useCallback(async (id: string) => {
    if (confirm('Delete this product from your local listing?')) {
      try {
        await api.delete(`/products/${id}`);
        toast.success('Product removed');
        onRefresh();
      } catch (_e) {
        toast.error('Failed to remove product');
      }
    }
  }, [onRefresh]);

  const handleAddNewItem = useCallback(() => onPageChange('add-product'), [onPageChange]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-text-primary uppercase tracking-tight">My Products</h1>
          <p className="text-text-secondary font-medium">Manage your catalog for the neighborhood.</p>
        </div>
        <Button className="rounded-2xl px-8 shadow-xl shadow-primary-100" onClick={handleAddNewItem}><Plus className="w-4 h-4 mr-2" />Add New Item</Button>
      </div>

      <div className="bg-card rounded-[40px] border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-background/50 border-b border-border text-[10px] font-black text-text-secondary/50 uppercase tracking-widest">
              <tr>
                <th className="px-8 py-6">Item Details</th>
                <th className="px-8 py-6">Category</th>
                <th className="px-8 py-6">Price</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((p) => (
                <tr key={p.id} className="group hover:bg-background/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-card border border-border rounded-2xl p-1 overflow-hidden flex-shrink-0 shadow-sm">
                        <img src={p.images[0]} alt="" className="w-full h-full object-contain" />
                      </div>
                      <div>
                        <h4 className="font-black text-text-primary uppercase text-xs leading-none mb-1.5">{p.name}</h4>
                        <p className="text-[10px] text-text-secondary/50 font-bold uppercase tracking-widest">{p.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-[10px] font-black text-text-secondary/50 uppercase tracking-widest">{p.category}</td>
                  <td className="px-8 py-6 font-black text-text-primary font-mono italic">₹{p.price.toLocaleString()}</td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${p.stock > 0 ? 'bg-seller/10 text-seller' : 'bg-danger/10 text-danger'}`}>
                      {p.stock > 0 ? 'In Stock' : 'Sold Out'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => onPageChange(`product:${p.id}`)} className="p-3 bg-card border border-border rounded-xl text-text-secondary/50 hover:text-primary hover:border-primary/20 shadow-sm"><Eye size={16} /></button>
                      <button className="p-3 bg-card border border-border rounded-xl text-text-secondary/50 hover:text-warning hover:border-amber-100 shadow-sm"><Edit size={16} /></button>
                      <button onClick={() => handleDelete(p.id)} className="p-3 bg-card border border-border rounded-xl text-text-secondary/50 hover:text-danger hover:border-red-100 shadow-sm"><Trash2 size={16} /></button>
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

  const fetchData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const { data: analyticsRes } = await api.get('/analytics/seller');
      setAnalytics(analyticsRes.data);

      const { data: productsRes } = await api.get('/products/seller/my-products');
      setProducts(productsRes.data);

      const { data: sellerRes } = await api.get('/sellers/profile');
      if (sellerRes.data) setVerificationStatus(sellerRes.data.sellerStatus || 'pending');

      const { data: alertsRes } = await api.get('/sellers/alerts/stock');
      setStockAlerts(alertsRes.data || []);
    } catch (_error) {
      console.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
        return <ProductsTab products={products} onPageChange={handlePageChange} onRefresh={fetchData} />;
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
  }, [activeTab, analytics, products, verificationStatus, stockAlerts, markAlertRead, handlePageChange, fetchData]);

  if (authLoading || (loading && !analytics)) {
    return <div className="pt-32 px-8 max-w-7xl mx-auto"><Skeleton variant="rect" className="h-[600px] w-full rounded-[40px]" /></div>;
  }

  return (
    <div className="min-h-screen bg-background/50 pt-20">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
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