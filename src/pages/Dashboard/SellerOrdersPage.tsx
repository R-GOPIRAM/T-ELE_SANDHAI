import { useState, useEffect } from 'react';
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  MapPin,
  Phone,
  User,
  ArrowLeft,
  LayoutGrid,
  Zap,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/apiClient';
import { Order } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const OrderSkeleton = () => (
  <div className="bg-card rounded-[2rem] p-8 border border-border shadow-sm space-y-6">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Skeleton className="w-12 h-12 rounded-2xl" />
        <div className="space-y-2">
          <Skeleton className="w-32 h-4" />
          <Skeleton className="w-24 h-3" />
        </div>
      </div>
      <Skeleton className="w-24 h-8 rounded-full" />
    </div>
    <div className="space-y-3">
      <Skeleton className="w-full h-12 rounded-xl" />
    </div>
  </div>
);

interface RawOrderItem {
  name?: string;
  productName?: string;
  seller?: { name?: string };
  sellerName?: string;
  price?: number;
  quantity?: number;
  id?: string;
  _id?: string;
  productId?: string;
  image?: string;
  [key: string]: unknown;
}

interface RawOrder {
  orderId?: string;
  id?: string;
  _id?: string;
  orderStatus?: string;
  status?: string;
  items: RawOrderItem[];
  totalAmount?: number;
  createdAt?: string;
  date?: string;
  shipments?: Array<{
    sellerId?: string | { _id: string };
    courierName?: string;
    distanceFromCustomer?: number;
    awb?: string;
    status?: string;
    pickupDate?: string;
    estimatedDeliveryDays?: string;
  }>;
  [key: string]: unknown;
}

interface ShipmentManifest {
  courierName?: string;
  distanceFromCustomer?: number;
  awb?: string;
  status?: string;
}

type OrderWithShipment = Order & { shipment?: ShipmentManifest | null };

export default function SellerOrdersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderWithShipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithShipment | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/orders/seller-orders');
        const formattedOrders = data.data.map((o: RawOrder) => ({
          ...o,
          id: String(o.orderId || o.id || o._id || 'unknown'),
          status: (o.orderStatus || o.status || 'pending').toLowerCase(),
          shipment: o.shipments?.find((s: { sellerId?: string | { _id?: string } }) =>
            (typeof s.sellerId === 'string' ? s.sellerId : s.sellerId?._id) === user?.id
          ) || null,
          items: o.items.map((i: RawOrderItem) => ({
            ...i,
            productName: i.name || i.productName || 'Product',
            sellerName: i.seller?.name || i.sellerName || 'Seller',
            price: Number(i.price || 0),
            quantity: Number(i.quantity || 1),
            productId: String(i.productId || i.id || i._id || 'unknown'),
          }))
        }));
        setOrders(formattedOrders);
        if (formattedOrders.length > 0 && !selectedOrder) {
          setSelectedOrder(formattedOrders[0]);
        }
      } catch (error) {
        console.error('Failed to fetch orders', error);
        toast.error('Failed to synchronize order manifest');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    setIsUpdating(true);
    try {
      const { data } = await api.put(`/orders/${orderId}`, { status: newStatus });
      const updatedOrder = {
        ...data.data,
        id: String(data.data.orderId || data.data.id || data.data._id || 'unknown'),
        status: (data.data.orderStatus || data.data.status || 'pending').toLowerCase()
      };

      setOrders(prev => prev.map(order => order.id === orderId ? updatedOrder : order));
      setSelectedOrder(updatedOrder);
      toast.success(`Manifest status evolved to ${newStatus}`);
    } catch (error) {
      console.error('Status evolution failed', error);
      toast.error('Failed to update order status');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusStyle = (status: string) => {
    const styles = {
      pending: { bg: 'bg-warning/10', text: 'text-warning', dot: 'bg-amber-500', icon: Clock },
      confirmed: { bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-500', icon: CheckCircle },
      packed: { bg: 'bg-indigo-50', text: 'text-indigo-600', dot: 'bg-indigo-500', icon: Package },
      shipped: { bg: 'bg-primary/10', text: 'text-primary', dot: 'bg-primary-500', icon: Truck },
      delivered: { bg: 'bg-seller/10', text: 'text-seller', dot: 'bg-seller', icon: CheckCircle },
      cancelled: { bg: 'bg-danger/10', text: 'text-danger', dot: 'bg-red-500', icon: XCircle }
    };
    return (styles as Record<string, { bg: string; text: string; dot: string; icon: React.ElementType }>)[status] || styles.pending;
  };

  const getNextStatus = (currentStatus: string): Order['status'] | null => {
    const statusFlow = {
      pending: 'confirmed',
      confirmed: 'packed',
      packed: 'shipped',
      shipped: 'delivered'
    };
    return statusFlow[currentStatus as keyof typeof statusFlow] as Order['status'] || null;
  };

  const filteredOrders = orders.filter(order =>
    statusFilter === 'all' || order.status === statusFilter
  );

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    inProgress: orders.filter(o => ['confirmed', 'packed', 'shipped'].includes(o.status)).length,
    completed: orders.filter(o => o.status === 'delivered').length
  };

  return (
    <div className="min-h-screen bg-background/50 pb-20 pt-8 mt-16 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
          <div>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-text-secondary/50 hover:text-text-primary font-black uppercase tracking-widest text-[10px] mb-4 transition-all group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Manifest Control
            </button>
            <h1 className="text-4xl font-black text-text-primary tracking-tighter flex items-center gap-4">
              <LayoutGrid className="w-10 h-10 text-primary" />
              Fulfillment Command
            </h1>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-card px-6 py-4 rounded-[1.5rem] border border-border shadow-sm text-center">
              <p className="text-[9px] font-black text-text-secondary/50 uppercase tracking-widest mb-1">Active</p>
              <p className="text-xl font-black text-text-primary">{stats.pending}</p>
            </div>
            <div className="bg-card px-6 py-4 rounded-[1.5rem] border border-border shadow-sm text-center">
              <p className="text-[9px] font-black text-text-secondary/50 uppercase tracking-widest mb-1">In Pulse</p>
              <p className="text-xl font-black text-primary">{stats.inProgress}</p>
            </div>
            <div className="bg-card px-6 py-4 rounded-[1.5rem] border border-border shadow-sm text-center">
              <p className="text-[9px] font-black text-text-secondary/50 uppercase tracking-widest mb-1">Deployed</p>
              <p className="text-xl font-black text-seller">{stats.completed}</p>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex bg-card rounded-3xl p-1.5 shadow-sm border border-border mb-10 overflow-x-auto no-scrollbar">
          {['all', 'pending', 'confirmed', 'packed', 'shipped', 'delivered'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${statusFilter === tab
                ? 'bg-gray-900 text-white shadow-xl translate-y-[-2px]'
                : 'text-text-secondary/50 hover:text-text-primary'
                }`}
            >
              {tab} ({tab === 'all' ? orders.length : orders.filter(o => o.status === tab).length})
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* Order Feed */}
          <div className="lg:col-span-7 space-y-6">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <OrderSkeleton key={i} />)
            ) : filteredOrders.length === 0 ? (
              <div className="bg-card rounded-[3rem] border border-dashed border-border p-24 text-center">
                <Package className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                <h3 className="text-xl font-black text-text-primary uppercase tracking-tight mb-2">Manifest Void</h3>
                <p className="text-xs text-text-secondary/50 font-bold uppercase tracking-widest">No orders detected in this status segment.</p>
              </div>
            ) : (
              filteredOrders.map((order) => {
                const style = getStatusStyle(order.status);
                const isSelected = selectedOrder?.id === order.id;

                return (
                  <motion.div
                    key={order.id}
                    layout
                    onClick={() => setSelectedOrder(order)}
                    className={`group cursor-pointer bg-card rounded-[2.5rem] p-8 border-2 transition-all relative overflow-hidden ${isSelected ? 'border-primary shadow-2xl shadow-primary/10' : 'border-transparent shadow-sm hover:border-border hover:shadow-xl'
                      }`}
                  >
                    <div className="flex items-start justify-between relative z-10">
                      <div className="flex items-center gap-5">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all ${isSelected ? 'bg-primary text-white' : 'bg-background text-text-secondary/50'}`}>
                          <Package className="w-7 h-7" />
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-black text-text-primary text-xl tracking-tighter uppercase italic">#{order.id.slice(-8).toUpperCase()}</h3>
                            <Badge variant="outline" className="text-[8px] px-2 py-0 font-black">{order.paymentMethod}</Badge>
                          </div>
                          <p className="text-[10px] font-black text-text-secondary/50 uppercase tracking-widest leading-none">{order.customerName}</p>
                        </div>
                      </div>
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${style.bg} ${style.text}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${style.dot} animate-pulse`} />
                        <span className="text-[9px] font-black uppercase tracking-widest">{order.status}</span>
                      </div>
                    </div>

                    <div className="mt-8 flex items-end justify-between relative z-10">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3 h-3 text-text-secondary/30" />
                          <span className="text-[10px] text-text-secondary font-bold uppercase tracking-widest truncate max-w-[200px]">{order.deliveryAddress || 'Neighborhood Pickup'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3 text-text-secondary/30" />
                          <span className="text-[10px] text-text-secondary font-bold uppercase tracking-widest">
                            {new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-black text-text-secondary/50 uppercase tracking-widest mb-1">Gross Yield</p>
                        <p className="font-black text-text-primary text-2xl leading-none tracking-tighter">₹{order.totalAmount.toLocaleString('en-IN')}</p>
                      </div>
                    </div>

                    {isSelected && (
                      <motion.div layoutId="active-marker" className="absolute left-0 top-0 w-1.5 h-full bg-primary" />
                    )}
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Details Command Center */}
          <div className="lg:col-span-5">
            <AnimatePresence mode="wait">
              {selectedOrder ? (
                <motion.div
                  key={selectedOrder.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-card rounded-[3.5rem] border border-card shadow-2xl shadow-border/50 p-12 lg:sticky lg:top-24 overflow-hidden relative"
                >
                  <div className="absolute top-0 right-0 p-12 opacity-5 -mr-12 -mt-12 rotate-12">
                    <Zap className="w-64 h-64 text-primary" />
                  </div>

                  <div className="relative z-10 space-y-12">
                    <header className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-black text-text-primary uppercase tracking-tighter">Fulfillment Details</h2>
                        <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-1">Order Ref: {selectedOrder.id}</p>
                      </div>
                    </header>

                    {/* Customer Intelligence */}
                    <section className="bg-background/50 rounded-[2.5rem] p-8 border border-border">
                      <p className="text-[10px] font-black text-text-secondary/50 uppercase tracking-widest mb-6">Subject Information</p>
                      <div className="space-y-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-card rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-gray-50">
                            <User className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-black text-text-primary uppercase tracking-tight">{selectedOrder.customerName}</p>
                            <p className="text-[10px] text-text-secondary/50 font-bold uppercase tracking-widest">{selectedOrder.customerEmail}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Phone className="w-4 h-4 text-text-secondary/50" />
                            <span className="text-xs font-bold text-text-secondary uppercase tracking-widest">{selectedOrder.customerPhone}</span>
                          </div>
                          <Button variant="outline" size="sm" className="rounded-xl px-4 py-2 text-[8px] font-black uppercase">
                            <MessageSquare className="w-3 h-3 mr-1" /> Contact
                          </Button>
                        </div>
                      </div>
                    </section>

                    {/* Logistics Manifest */}
                    <section>
                      <p className="text-[10px] font-black text-text-secondary/50 uppercase tracking-widest mb-6">Logistics Manifest</p>

                      {/* Extracted Shipment Details */}
                      {selectedOrder.shipment && (
                        <div className="mb-6 p-6 bg-primary/10/50 rounded-3xl border border-primary/20 flex flex-col gap-4">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase font-black tracking-widest text-primary">Smart Courier selected</span>
                            <Badge variant="outline" className="text-primary-800 bg-card border-primary/50">{selectedOrder.shipment.courierName}</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase font-bold tracking-widest text-text-secondary">Geographic Distance</span>
                            <span className="text-sm font-black text-text-primary">{selectedOrder.shipment.distanceFromCustomer?.toFixed(1) || 0} km</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase font-bold tracking-widest text-text-secondary">AWB Tracking Number</span>
                            <span className="text-sm font-black text-text-primary">{selectedOrder.shipment.awb}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase font-bold tracking-widest text-text-secondary">Logistics Status</span>
                            <span className="text-xs font-black px-3 py-1 bg-card rounded-xl text-primary-hover">{selectedOrder.shipment.status}</span>
                          </div>
                        </div>
                      )}

                      <div className="space-y-4">
                        {selectedOrder.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-4 p-5 bg-card border border-gray-50 rounded-2xl group hover:border-primary/20 transition-all">
                            <div className="w-14 h-14 bg-background rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                              <Package className="w-7 h-7 text-text-secondary/30 group-hover:text-primary" />
                            </div>
                            <div className="flex-1">
                              <p className="font-black text-text-primary text-sm leading-tight text-balance">{item.productName}</p>
                              <p className="text-[10px] text-text-secondary/50 font-bold uppercase tracking-widest mt-1">Allocated: {item.quantity} units</p>
                            </div>
                            <div className="text-right">
                              <p className="font-black text-text-primary">₹{item.subtotal.toLocaleString('en-IN')}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* Operational Actions */}
                    <footer className="pt-8 border-t border-border space-y-4">
                      {getNextStatus(selectedOrder.status) && (
                        <Button
                          onClick={() => updateOrderStatus(selectedOrder.id, getNextStatus(selectedOrder.status)!)}
                          disabled={isUpdating}
                          className="w-full py-6 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 group"
                        >
                          <span className="flex items-center justify-center gap-3">
                            Evolve to {getNextStatus(selectedOrder.status)} <Zap className="w-4 h-4 group-hover:scale-125 transition-transform" />
                          </span>
                        </Button>
                      )}

                      {['pending', 'confirmed'].includes(selectedOrder.status) && (
                        <button
                          onClick={() => updateOrderStatus(selectedOrder.id, 'cancelled')}
                          disabled={isUpdating}
                          className="w-full py-4 text-danger font-black text-[9px] uppercase tracking-[0.2em] hover:bg-danger/10 rounded-2xl transition-all"
                        >
                          Abort Fulfilment Flow
                        </button>
                      )}
                    </footer>

                  </div>
                </motion.div>
              ) : (
                <div className="h-full flex items-center justify-center bg-card/40 backdrop-blur rounded-[3.5rem] border border-dashed border-border p-24 text-center">
                  <div className="space-y-6">
                    <div className="w-24 h-24 bg-card rounded-[2.5rem] shadow-sm flex items-center justify-center mx-auto text-gray-200 border border-gray-50">
                      <LayoutGrid className="w-12 h-12" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-black text-text-primary uppercase tracking-tighter">Command Idle</h3>
                      <p className="text-[10px] text-text-secondary/50 font-bold leading-relaxed max-w-[220px] mx-auto uppercase tracking-widest">Select an active order manifest to begin fulfillment operations.</p>
                    </div>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
}