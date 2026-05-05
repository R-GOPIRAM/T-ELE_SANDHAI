import { useState, useEffect } from 'react';
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  ArrowLeft,
  MapPin,
  MessageSquare,
  Search,
  Briefcase,
  ShieldCheck,
  Calendar,
  LayoutGrid
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/apiClient';
import { Order } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
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
      <Skeleton className="w-full h-12 rounded-xl" />
    </div>
  </div>
);

export default function MyOrdersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/orders/my-orders');
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        const formattedOrders = data.data.map((o: Record<string, any>) => ({
          ...o,
          id: String(o.orderId || o.id || o._id || 'unknown'),
          status: (o.orderStatus || o.status || 'pending').toLowerCase(),
          deliveryAddress: o.shippingAddress
            ? `${o.shippingAddress.street || ''}, ${o.shippingAddress.city || ''}, ${o.shippingAddress.state || ''} ${o.shippingAddress.zipCode || ''}`.trim().replace(/^,\s*/, '')
            : undefined,
          /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
          items: o.items.map((i: Record<string, any>) => ({
            ...i,
            productName: i.name || i.productName || 'Product',
            sellerName: i.seller?.name || i.sellerName || 'Seller',
            sellerId: i.seller?._id || i.sellerId || 'unknown',
            subtotal: (i.price * i.quantity) || i.subtotal || 0,
            price: i.price || 0,
            quantity: i.quantity || 1
          }))
        }));
        setOrders(formattedOrders);
        if (formattedOrders.length > 0 && !selectedOrder) {
          setSelectedOrder(formattedOrders[0]);
        }
      } catch (error) {
        console.error('Failed to fetch orders', error);
        toast.error('Failed to load your order history');
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchOrders();
    else setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const filteredOrders = orders.filter(order =>
    statusFilter === 'all' || order.status === statusFilter
  );

  const getStatusStyle = (status: string) => {
    const styles: Record<string, { bg: string; text: string; dot: string; icon: React.ElementType }> = {
      pending: { bg: 'bg-warning/10', text: 'text-warning', dot: 'bg-warning', icon: Clock },
      confirmed: { bg: 'bg-primary/10', text: 'text-primary', dot: 'bg-primary', icon: CheckCircle },
      shipped: { bg: 'bg-primary/20', text: 'text-primary', dot: 'bg-primary', icon: Truck },
      delivered: { bg: 'bg-seller/10', text: 'text-seller', dot: 'bg-seller', icon: CheckCircle },
      cancelled: { bg: 'bg-danger/10', text: 'text-danger', dot: 'bg-danger', icon: XCircle }
    };
    return styles[status] || styles.pending;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <EmptyState
          title="Vault is Locked"
          description="Please authenticate to access your hyper-local order history and tracking."
          icon={ShieldCheck}
          actionText="Pulse Login"
          onAction={() => navigate('/login')}
          illustrationColor="blue"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 pt-8 mt-16 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <button
              onClick={() => navigate('/products')}
              className="flex items-center gap-2 text-text-secondary hover:text-text-primary font-black uppercase tracking-widest text-[10px] mb-4 transition-all group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Return to Hub
            </button>
            <h1 className="text-4xl font-black text-text-primary tracking-tighter flex items-center gap-4">
              <Briefcase className="w-10 h-10 text-primary" />
              Order Manifest
            </h1>
          </div>

          <div className="flex bg-card rounded-2xl p-1 shadow-sm border border-border self-start">
            {['all', 'pending', 'confirmed', 'shipped', 'delivered'].map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === tab
                  ? 'bg-text-primary text-card shadow-lg'
                  : 'text-text-secondary hover:text-text-primary'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* Orders List */}
          <div className="lg:col-span-7 space-y-6">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <OrderSkeleton key={i} />)
            ) : filteredOrders.length === 0 ? (
              <div className="bg-card rounded-[3rem] border border-dashed border-border p-20 text-center">
                <EmptyState
                  title="No Directives Found"
                  description="You don't have any orders matching this filter sequence. Start your local commerce engagement today."
                  icon={Search}
                />
              </div>
            ) : (
              filteredOrders.map((order) => {
                const style = getStatusStyle(order.status ?? order.orderStatus.toLowerCase());
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
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'bg-primary text-white' : 'bg-background text-text-secondary'}`}>
                          <Package className="w-7 h-7" />
                        </div>
                        <div>
                          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary mb-1 leading-none">Order Ref</h3>
                          <p className="font-black text-text-primary text-xl tracking-tight leading-none uppercase italic">#{order.id.slice(0, 8)}</p>
                        </div>
                      </div>
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${style.bg} ${style.text}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${style.dot} animate-pulse`} />
                        <span className="text-[9px] font-black uppercase tracking-widest">{order.status}</span>
                      </div>
                    </div>

                    <div className="mt-8 grid grid-cols-2 gap-6 relative z-10">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-text-secondary" />
                        <span className="text-xs text-text-secondary font-bold uppercase tracking-widest leading-none">
                          {new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 justify-end">
                        <div className="text-right">
                          <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest mb-0.5 leading-none">Settlement</p>
                          <p className="font-black text-text-primary text-xl leading-none">₹{order.totalAmount.toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 flex gap-2">
                      {order.items.slice(0, 3).map((_item, idx) => (
                        <div key={idx} className="w-10 h-10 rounded-lg bg-background border border-border p-1 flex items-center justify-center">
                          <LayoutGrid className="w-4 h-4 text-text-secondary" />
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="w-10 h-10 rounded-lg bg-text-primary text-card flex items-center justify-center text-[10px] font-black border-2 border-card shadow-sm">+ {order.items.length - 3}</div>
                      )}
                    </div>

                    {isSelected && (
                      <motion.div layoutId="active-order" className="absolute left-0 top-0 w-1.5 h-full bg-primary" />
                    )}
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Order Details Panel */}
          <div className="lg:col-span-5">
            <AnimatePresence mode="wait">
              {selectedOrder ? (
                <motion.div
                  key={selectedOrder.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-card rounded-[3rem] border border-card shadow-2xl shadow-border/50 p-10 lg:sticky lg:top-24 overflow-hidden relative"
                >
                  <div className={`absolute top-0 right-0 p-10 opacity-5 -mr-10 -mt-10 rotate-12`}>
                    <Package className="w-48 h-48" />
                  </div>

                  <div className="flex items-center justify-between mb-10 relative z-10">
                    <h2 className="text-2xl font-black text-text-primary uppercase tracking-tighter">Manifest Detail</h2>
                    <div className="flex items-center gap-2">
                      <Badge variant="ghost" className="bg-text-primary text-card">Live Auth</Badge>
                    </div>
                  </div>

                  <div className="space-y-10 relative z-10">
                    {/* Status Progress */}
                    <section>
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Progress Vector</p>
                        <p className={`text-[10px] font-black uppercase tracking-widest ${getStatusStyle(selectedOrder.status ?? selectedOrder.orderStatus.toLowerCase()).text}`}>{selectedOrder.status ?? selectedOrder.orderStatus.toLowerCase()}</p>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {['pending', 'confirmed', 'shipped', 'delivered'].map((s, idx, arr) => {
                          const orderIdx = arr.indexOf(selectedOrder.status ?? selectedOrder.orderStatus.toLowerCase());
                          const isCompleted = orderIdx >= idx;
                          return (
                            <div key={s} className={`h-1.5 rounded-full transition-all duration-700 ${isCompleted ? 'bg-primary' : 'bg-background'}`} />
                          );
                        })}
                      </div>
                    </section>

                    {/* Logistics */}
                    <section className="bg-background/50 rounded-3xl p-6 border border-border space-y-4">
                      <div className="flex items-start gap-4">
                        <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest mb-1">Deployment Target</p>
                          <p className="text-sm font-bold text-text-primary leading-relaxed">{selectedOrder.deliveryAddress || 'Neighborhood Pickup Center'}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <Truck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest mb-1">Carrier Strategy</p>
                          <p className="text-sm font-bold text-text-primary uppercase tracking-tighter">{selectedOrder.deliveryType} (Local Fleet)</p>
                        </div>
                      </div>
                    </section>

                    {/* Inventory Breakdown */}
                    <section>
                      <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-6">Inventory Manifest</p>
                      <div className="space-y-4">
                        {selectedOrder.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-4 p-4 border border-border rounded-2xl hover:bg-background/50 transition-all">
                            <div className="w-12 h-12 bg-card rounded-xl flex items-center justify-center shrink-0 border border-border shadow-sm">
                              <Package className="w-6 h-6 text-text-secondary" />
                            </div>
                            <div className="flex-1">
                              <p className="font-black text-text-primary text-sm leading-tight">{item.productName}</p>
                              <p className="text-[9px] text-text-secondary font-bold uppercase tracking-widest">Qty: {item.quantity} units</p>
                            </div>
                            <div className="text-right">
                              <p className="font-black text-text-primary">₹{(item.subtotal ?? item.price * item.quantity).toLocaleString('en-IN')}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* Terminal Actions */}
                    <div className="pt-6 border-t border-border space-y-3">
                      <Button
                        className="w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest group"
                        onClick={() => navigate(`/chat/${selectedOrder.items[0]?.sellerId}`)}
                        variant="outline"
                      >
                        <MessageSquare className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
                        Sync with Merchant
                      </Button>
                      {selectedOrder.status === 'pending' && (
                        <button
                          className="w-full py-3 text-danger font-black text-[9px] uppercase tracking-[0.2em] hover:bg-danger/10 rounded-xl transition-all"
                          onClick={() => toast.error('Cancellation request initiated')}
                        >
                          Terminate manifest flow
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="h-full flex items-center justify-center bg-card/40 backdrop-blur rounded-[3rem] border border-dashed border-border p-20 text-center">
                  <div className="space-y-4">
                    <div className="w-20 h-20 bg-card rounded-[2rem] shadow-sm flex items-center justify-center mx-auto text-text-secondary">
                      <Package className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-black text-text-primary uppercase tracking-tighter">Manifest Inactive</h3>
                    <p className="text-xs text-text-secondary font-bold leading-relaxed max-w-[200px] mx-auto uppercase tracking-widest">Select a valid order reference from your history manifest.</p>
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