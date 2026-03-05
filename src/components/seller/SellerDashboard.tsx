import { useState, useEffect, useCallback } from 'react';
import { Package, TrendingUp, Users, DollarSign, Plus, Edit, Trash2, MessageSquare, AlertCircle, Eye, RefreshCw } from 'lucide-react';
import { Product } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../hooks/useSocket';
import Button from '../common/Button';
import api from '../../services/api';
import BargainAnalytics from '../bargain/BargainAnalytics';
import { RevenueChart } from './RevenueChart';
import { StatusBreakdown } from './StatusBreakdown';
import { TopSellingProducts } from './TopSellingProducts';
import { Skeleton } from '../common/Skeleton';
import toast from 'react-hot-toast';

interface SellerDashboardProps {
  onPageChange: (page: string) => void;
}

interface AnalyticsData {
  revenue: any[];
  statusStats: any[];
  topProducts: any[];
  summary: {
    totalRevenue: number;
    totalSales: number;
    totalOrders: number;
    uniqueCustomers: number;
  };
}

export default function SellerDashboard({ onPageChange }: SellerDashboardProps) {
  const { user, loading: authLoading } = useAuth();
  const socket = useSocket();
  const [products, setProducts] = useState<Product[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<string>('pending');

  const fetchAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    try {
      const { data } = await api.get('/analytics/seller');
      setAnalytics(data.data);
    } catch (error) {
      console.error('Failed to fetch analytics', error);
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  const fetchData = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      // Fetch seller profile to get verification status
      try {
        const sellerRes = await api.get('/sellers/profile');
        if (sellerRes.data?.seller) {
          setVerificationStatus(sellerRes.data.seller.verificationStatus);
        }
      } catch (err) {
        console.error('Failed to fetch seller profile', err);
      }

      // Fetch products for this seller
      const { data } = await api.get('/products/seller/my-products');
      setProducts(data.data);

      // Also fetch analytics
      fetchAnalytics();
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, fetchAnalytics]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Socket listener for real-time updates
  useEffect(() => {
    if (socket) {
      socket.on('dashboard_update', (data: any) => {
        toast.success(data.message || 'New order received! Updating dashboard...', {
          icon: '📦',
          duration: 5000
        });
        fetchAnalytics();
      });

      return () => {
        socket.off('dashboard_update');
      };
    }
  }, [socket, fetchAnalytics]);

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-12">
          <Skeleton variant="text" className="h-10 w-64" />
          <div className="flex gap-4">
            <Skeleton variant="rect" className="h-12 w-40 rounded-2xl" />
            <Skeleton variant="rect" className="h-12 w-40 rounded-2xl" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} variant="rect" className="h-32 w-full rounded-3xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Skeleton variant="rect" className="h-[400px] w-full rounded-3xl" />
          <Skeleton variant="rect" className="h-[400px] w-full rounded-3xl" />
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Products',
      value: products.length.toString(),
      icon: Package,
      color: 'blue',
      change: 'Manage inventory'
    },
    {
      title: 'Total Revenue',
      value: `₹${analytics?.summary.totalRevenue.toLocaleString() || '0'}`,
      icon: DollarSign,
      color: 'green',
      change: 'Lifetime earnings'
    },
    {
      title: 'Orders',
      value: analytics?.summary.totalOrders.toString() || '0',
      icon: TrendingUp,
      color: 'purple',
      change: 'Total orders placed'
    },
    {
      title: 'Customers',
      value: analytics?.summary.uniqueCustomers.toString() || '0',
      icon: Users,
      color: 'orange',
      change: 'Unique buyers'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-600',
      green: 'bg-green-50 text-green-600',
      purple: 'bg-indigo-50 text-indigo-600',
      orange: 'bg-orange-50 text-orange-600'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const handleDeleteProduct = async (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/products/${productId}`);
        setProducts(prev => prev.filter(p => p.id !== productId));
        toast.success('Product deleted successfully');
      } catch (error) {
        toast.error('Failed to delete product');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Seller Dashboard</h1>
          <p className="text-gray-500 font-medium mt-1">Monitor your store's performance in real-time.</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <Button
            variant="outline"
            icon={MessageSquare}
            onClick={() => onPageChange('bargain')}
            className="rounded-2xl border-2 py-3"
          >
            Manage Negotiations
          </Button>
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => onPageChange('add-product')}
            className="rounded-2xl py-3 shadow-lg shadow-blue-200"
          >
            Add Product
          </Button>
          <button
            onClick={() => { fetchAnalytics(); fetchData(); }}
            className="p-3 bg-white border-2 border-gray-100 rounded-2xl text-gray-400 hover:text-blue-600 hover:border-blue-100 transition-all duration-300"
            title="Refresh Dashboard"
          >
            <RefreshCw size={24} className={analyticsLoading ? 'animate-spin text-blue-600' : ''} />
          </button>
        </div>
      </div>

      {/* Verification Status Alert */}
      {user?.role === 'seller' && verificationStatus === 'pending' && (
        <div className="bg-amber-50 border-2 border-amber-100 rounded-3xl p-6 mb-10 flex items-start gap-4">
          <div className="bg-amber-100 p-2 rounded-xl">
            <AlertCircle className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-amber-900">Account Verification Pending</h3>
            <p className="text-amber-700 font-medium mt-1">
              Your seller account is currently under review by our moderation team. Some features might be limited until your shop is verified.
            </p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 group">
              <div className="flex justify-between items-start mb-6">
                <div className={`p-4 rounded-2xl ${getColorClasses(stat.color)} group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-green-600 bg-green-50 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Live</span>
              </div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{stat.title}</p>
              <h3 className="text-3xl font-black text-gray-900 mt-2">{stat.value}</h3>
              <p className="text-xs text-gray-500 font-medium mt-4 flex items-center gap-1 opacity-70">
                {stat.change}
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2">
          {analyticsLoading ? (
            <Skeleton variant="rect" className="h-[400px] w-full rounded-3xl" />
          ) : (
            <RevenueChart data={analytics?.revenue || []} />
          )}
        </div>
        <div className="lg:col-span-1">
          {analyticsLoading ? (
            <Skeleton variant="rect" className="h-[400px] w-full rounded-3xl" />
          ) : (
            <StatusBreakdown data={analytics?.statusStats || []} />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-black text-gray-900 flex items-center gap-3">
                <Package className="text-blue-600" />
                My Products
              </h2>
              <span className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-2xl text-xs font-bold font-mono">
                {products.length} Items
              </span>
            </div>

            {products.length === 0 ? (
              <div className="p-20 text-center">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Package className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No products yet</h3>
                <p className="text-gray-500 font-medium mb-8">Start by adding your first product to the platform.</p>
                <Button
                  icon={Plus}
                  onClick={() => onPageChange('add-product')}
                  className="rounded-2xl"
                >
                  Add Your First Product
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-gray-50/50">
                    <tr>
                      <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Product</th>
                      <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Category</th>
                      <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Price</th>
                      <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Stock</th>
                      <th className="px-8 py-5 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-8 py-5 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-12 w-12 rounded-2xl border border-gray-100 overflow-hidden flex-shrink-0 bg-white p-1">
                              <img className="h-full w-full object-contain" src={product.images[0]} alt="" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-bold text-gray-900">{product.name}</div>
                              <div className="text-[11px] font-bold text-blue-500 uppercase tracking-wider">{product.brand}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5 whitespace-nowrap text-sm font-bold text-gray-500">
                          {product.category}
                        </td>
                        <td className="px-8 py-5 whitespace-nowrap text-sm font-black text-gray-900 font-mono">
                          ₹{product.price.toLocaleString()}
                        </td>
                        <td className="px-8 py-5 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider ${product.stock > 10 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                            }`}>
                            {product.stock} in stock
                          </span>
                        </td>
                        <td className="px-8 py-5 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => onPageChange(`product:${product.id || (product as any)._id}`)}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                              title="View Product"
                            >
                              <Eye size={20} />
                            </button>
                            <button
                              className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                              title="Edit Product"
                            >
                              <Edit size={20} />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                              title="Delete Product"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        <div className="lg:col-span-1">
          <TopSellingProducts products={analytics?.topProducts || []} />

          {/* Bargain Analytics Section Brief */}
          <div className="mt-8">
            <BargainAnalytics />
          </div>
        </div>
      </div>
    </div>
  );
}