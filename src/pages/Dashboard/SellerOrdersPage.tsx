import { useState, useEffect, useCallback } from 'react';
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  MapPin,
  ArrowLeft,
  LayoutGrid,
  Zap,
  Search,
  ChevronLeft,
  ChevronRight,
  MoreVertical
} from 'lucide-react';
import api from '../../services/apiClient';
import { Order } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { Skeleton } from '../../components/ui/Skeleton';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const TableSkeleton = () => (
  <div className="bg-card rounded-[2.5rem] border border-border shadow-sm overflow-hidden">
    <div className="p-8 border-b border-border">
      <Skeleton className="w-48 h-6" />
    </div>
    <div className="p-8 space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="w-full h-16 rounded-xl" />
      ))}
    </div>
  </div>
);

export default function SellerOrdersPage() {
  useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [limit] = useState(10);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/orders/seller-orders', {
        params: {
          page,
          limit,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          search: searchTerm || undefined
        }
      });

      setOrders(data.data.orders);
      setTotalPages(data.data.pagination.totalPages);
      setTotalOrders(data.data.pagination.total);
    } catch (error) {
      console.error('Failed to fetch orders', error);
      toast.error('Failed to synchronize order manifest');
    } finally {
      setLoading(false);
    }
  }, [page, limit, statusFilter, searchTerm]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setIsUpdating(true);
    try {
      await api.put(`/orders/${orderId}`, { status: newStatus });
      toast.success(`Manifest status evolved to ${newStatus}`);
      fetchOrders();
    } catch (error) {
      console.error('Status evolution failed', error);
      toast.error('Failed to update order status');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusStyle = (status: string) => {
    const s = (status || 'pending').toLowerCase();
    const styles: Record<string, { bg: string; text: string; dot: string; icon: any }> = {
      pending: { bg: 'bg-warning/10', text: 'text-warning', dot: 'bg-amber-500', icon: Clock },
      processing: { bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-500', icon: Zap },
      shipped: { bg: 'bg-primary/10', text: 'text-primary', dot: 'bg-primary-500', icon: Truck },
      delivered: { bg: 'bg-seller/10', text: 'text-seller', dot: 'bg-seller', icon: CheckCircle },
      cancelled: { bg: 'bg-danger/10', text: 'text-danger', dot: 'bg-red-500', icon: XCircle }
    };
    return styles[s] || styles.pending;
  };

  return (
    <div className="min-h-screen bg-background/50 pb-20 pt-8 mt-16 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
          <div>
            <button
              onClick={() => navigate('/dashboard/seller')}
              className="flex items-center gap-2 text-text-secondary/50 hover:text-text-primary font-black uppercase tracking-widest text-[10px] mb-4 transition-all group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Command Center
            </button>
            <h1 className="text-5xl font-black text-text-primary tracking-tighter flex items-center gap-4">
              <LayoutGrid className="w-12 h-12 text-primary" />
              Fulfillment Matrix
            </h1>
            <p className="text-text-secondary font-bold text-lg mt-3">Deploying local goods across the hyper-local segment.</p>
          </div>

          <div className="flex gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary/50" />
              <input
                type="text"
                placeholder="Scan Manifest ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 h-14 bg-card border border-border rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none shadow-sm transition-all"
              />
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex bg-card rounded-3xl p-1.5 shadow-sm border border-border mb-8 overflow-x-auto no-scrollbar">
          {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((tab) => (
            <button
              key={tab}
              onClick={() => { setStatusFilter(tab); setPage(1); }}
              className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${statusFilter === tab
                ? 'bg-gray-900 text-white shadow-xl translate-y-[-2px]'
                : 'text-text-secondary/50 hover:text-text-primary'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Orders Table */}
        {loading ? (
          <TableSkeleton />
        ) : (
          <div className="bg-card rounded-[3rem] border border-border shadow-2xl shadow-border/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-background/50 border-b border-border text-[10px] font-black text-text-secondary/50 uppercase tracking-widest">
                  <tr>
                    <th className="px-8 py-6">Order Identity</th>
                    <th className="px-8 py-6">Customer Node</th>
                    <th className="px-8 py-6">Manifest Content</th>
                    <th className="px-8 py-6">Status Pulse</th>
                    <th className="px-8 py-6">Deployment Date</th>
                    <th className="px-8 py-6 text-right">Operations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {orders.length > 0 ? orders.map((order) => {
                    const style = getStatusStyle(order.orderStatus);
                    const StatusIcon = style.icon;
                    return (
                      <tr key={order.id} className="group hover:bg-background/50 transition-colors">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary font-black text-xs">
                              {order.orderId.substring(0, 2)}
                            </div>
                            <span className="font-black text-text-primary uppercase text-xs tracking-wider">#{order.orderId.slice(-8).toUpperCase()}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex flex-col">
                            <span className="font-black text-text-primary uppercase text-[11px] mb-1">{(order.user as any)?.name || 'Local Citizen'}</span>
                            <span className="text-[9px] text-text-secondary/50 font-bold uppercase tracking-widest flex items-center gap-1">
                              <MapPin size={10} /> {order.shippingAddress.city}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex -space-x-3">
                            {order.items.slice(0, 3).map((item, idx) => (
                              <div key={idx} className="w-10 h-10 rounded-xl bg-card border-2 border-background p-1 overflow-hidden shadow-sm" title={item.name}>
                                <img src={item.image || 'https://via.placeholder.com/40'} alt="" className="w-full h-full object-contain" />
                              </div>
                            ))}
                            {order.items.length > 3 && (
                              <div className="w-10 h-10 rounded-xl bg-gray-900 border-2 border-background flex items-center justify-center text-[10px] font-black text-white">
                                +{order.items.length - 3}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${style.bg} ${style.text}`}>
                            <StatusIcon size={12} className={style.dot === 'animate-pulse' ? 'animate-pulse' : ''} />
                            <span className="text-[9px] font-black uppercase tracking-widest">{order.orderStatus}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex flex-col">
                            <span className="font-black text-text-primary uppercase text-[11px] mb-1">
                              {new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                            </span>
                            <span className="text-[9px] text-text-secondary/50 font-bold uppercase tracking-widest">
                              {new Date(order.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                            {order.orderStatus.toLowerCase() === 'processing' && (
                              <button
                                onClick={() => updateOrderStatus(order._id, 'Shipped')}
                                disabled={isUpdating}
                                className="px-4 py-2.5 bg-primary text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all flex items-center gap-2"
                              >
                                <Truck size={12} /> Mark Shipped
                              </button>
                            )}
                            {order.orderStatus.toLowerCase() === 'shipped' && (
                              <button
                                onClick={() => updateOrderStatus(order._id, 'Delivered')}
                                disabled={isUpdating}
                                className="px-4 py-2.5 bg-seller text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-seller/20 hover:scale-105 transition-all flex items-center gap-2"
                              >
                                <CheckCircle size={12} /> Mark Delivered
                              </button>
                            )}
                            <button className="p-2.5 bg-card border border-border rounded-xl text-text-secondary/50 hover:text-text-primary transition-colors">
                              <MoreVertical size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan={6} className="py-32 text-center">
                        <div className="flex flex-col items-center gap-6 opacity-20">
                          <Package size={80} />
                          <div className="space-y-1">
                            <p className="text-sm font-black uppercase tracking-widest">No active manifests detected</p>
                            <p className="text-[10px] font-bold uppercase tracking-widest">Global synchronization complete. System idle.</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-8 border-t border-border flex items-center justify-between bg-background/30 px-12">
                <div className="flex items-center gap-6">
                  <p className="text-[10px] font-black text-text-secondary/50 uppercase tracking-widest">
                    Showing Page {page} of {totalPages}
                  </p>
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest">
                    {totalOrders} Global Entries
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                    className="w-12 h-12 flex items-center justify-center border border-border rounded-2xl text-text-secondary disabled:opacity-30 hover:bg-card transition-all"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                    <button
                      key={num}
                      onClick={() => setPage(num)}
                      className={`w-12 h-12 rounded-2xl text-[10px] font-black transition-all ${page === num ? 'bg-gray-900 text-white shadow-2xl' : 'border border-border hover:bg-card'
                        }`}
                    >
                      {num}
                    </button>
                  ))}
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage(page + 1)}
                    className="w-12 h-12 flex items-center justify-center border border-border rounded-2xl text-text-secondary disabled:opacity-30 hover:bg-card transition-all"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}