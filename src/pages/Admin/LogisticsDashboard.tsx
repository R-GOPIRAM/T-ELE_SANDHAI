import { useState, useEffect } from 'react';
import { Truck, Search, Filter, AlertCircle, LayoutGrid, DollarSign, Package, User } from 'lucide-react';
import api from '../../services/apiClient';
import { Badge } from '../../components/ui/Badge';

interface ShipmentUI {
    orderId?: string;
    customerName?: string;
    paymentStatus?: string;
    totalAmount?: number;
    awb?: string;
    status?: string;
    shippingCost?: number;
    courierName?: string;
    estimatedDeliveryDays?: string;
    distanceFromCustomer?: number;
    [key: string]: unknown;
}

interface OrderRaw {
    orderId?: string;
    user?: { name?: string };
    paymentInfo?: { paymentStatus?: string };
    totalAmount?: number;
    shipments?: ShipmentUI[];
}

export default function LogisticsDashboard() {
    const [orders, setOrders] = useState<OrderRaw[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        // In a real app we'd have a specific admin/orders endpoint
        // Assuming /orders/admin exists based on the requirement
        const fetchAdminOrders = async () => {
            try {
                const { data } = await api.get('/orders/seller-orders'); // fallback or implement admin route
                // If there's an actual admin global route, we'd use it. For now let's map what we can.
                // We'll trust the structure has shipments now.
                const allOrders = data.data || [];
                setOrders(allOrders);
            } catch (error) {
                console.error('Failed to fetch admin logistics', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAdminOrders();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    const flattenedShipments = orders.flatMap(order => {
        if (order.shipments && Array.isArray(order.shipments) && order.shipments.length > 0) {
            return order.shipments.map((s: ShipmentUI) => ({
                ...s,
                orderId: order.orderId,
                customerName: order.user?.name || 'Guest',
                paymentStatus: order.paymentInfo?.paymentStatus || 'Pending',
                totalAmount: order.totalAmount
            }));
        }
        return [];
    }).filter(s => s.awb && s.awb.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-text-primary flex items-center gap-3">
                        <LayoutGrid className="w-8 h-8 text-primary" />
                        Global Logistics
                    </h1>
                    <p className="text-sm font-bold text-text-secondary/50 mt-2">Monitor system-wide fulfillment and routing efficiency.</p>
                </div>
                <div className="flex bg-card rounded-xl shadow-sm border border-border p-1">
                    <div className="flex items-center px-4">
                        <Search className="w-4 h-4 text-text-secondary/50 mr-2" />
                        <input
                            className="text-sm font-bold outline-none border-none py-2 w-64"
                            placeholder="Search by AWB Tracking..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="bg-background text-text-secondary px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2">
                        <Filter className="w-4 h-4" /> Filter
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-card p-6 rounded-3xl border border-border shadow-sm relative overflow-hidden">
                    <Truck className="absolute -bottom-4 -right-4 w-24 h-24 text-primary-50 rotate-12" />
                    <h3 className="text-[10px] font-black uppercase text-text-secondary/50 mb-2 relative z-10">Active Shipments</h3>
                    <p className="text-3xl font-black text-text-primary relative z-10">{flattenedShipments.length}</p>
                </div>
                <div className="bg-card p-6 rounded-3xl border border-border shadow-sm relative overflow-hidden">
                    <AlertCircle className="absolute -bottom-4 -right-4 w-24 h-24 text-amber-50 rotate-12" />
                    <h3 className="text-[10px] font-black uppercase text-text-secondary/50 mb-2 relative z-10">Exceptions</h3>
                    <p className="text-3xl font-black text-warning relative z-10">0</p>
                </div>
                <div className="bg-card p-6 rounded-3xl border border-border shadow-sm relative overflow-hidden">
                    <Package className="absolute -bottom-4 -right-4 w-24 h-24 text-success-50 rotate-12" />
                    <h3 className="text-[10px] font-black uppercase text-text-secondary/50 mb-2 relative z-10">Delivered</h3>
                    <p className="text-3xl font-black text-seller relative z-10">{flattenedShipments.filter(s => s.status === 'delivered').length}</p>
                </div>
                <div className="bg-card p-6 rounded-3xl border border-border shadow-sm relative overflow-hidden">
                    <DollarSign className="absolute -bottom-4 -right-4 w-24 h-24 text-primary-50 rotate-12" />
                    <h3 className="text-[10px] font-black uppercase text-text-secondary/50 mb-2 relative z-10">Avg Transit Yield</h3>
                    <p className="text-3xl font-black text-text-primary relative z-10">₹{
                        Math.round(flattenedShipments.reduce((sum, s) => sum + (s.shippingCost || 0), 0) / (Math.max(1, flattenedShipments.length)))
                    }</p>
                </div>
            </div>

            <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-background border-b border-border">
                                <th className="p-4 text-[10px] font-black uppercase text-text-secondary/50 tracking-wider">Order Reference</th>
                                <th className="p-4 text-[10px] font-black uppercase text-text-secondary/50 tracking-wider">Courier Node</th>
                                <th className="p-4 text-[10px] font-black uppercase text-text-secondary/50 tracking-wider">Logistics Value</th>
                                <th className="p-4 text-[10px] font-black uppercase text-text-secondary/50 tracking-wider">AWB Tracer</th>
                                <th className="p-4 text-[10px] font-black uppercase text-text-secondary/50 tracking-wider">Distance</th>
                                <th className="p-4 text-[10px] font-black uppercase text-text-secondary/50 tracking-wider">Status Node</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {flattenedShipments.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center p-12 text-sm text-text-secondary/50 font-bold">No active logistics records found.</td>
                                </tr>
                            )}
                            {flattenedShipments.map((shipment, i) => (
                                <tr key={i} className="hover:bg-primary/10/20 transition-colors">
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <span className="font-black text-text-primary text-sm">{shipment.orderId}</span>
                                            <span className="text-[10px] text-text-secondary/50 font-bold flex items-center gap-1 mt-1">
                                                <User className="w-3 h-3" /> {shipment.customerName} | {shipment.paymentStatus}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <span className="font-black text-primary-hover text-sm">{shipment.courierName}</span>
                                            <span className="text-[10px] text-text-secondary font-bold uppercase tracking-widest mt-1">ETA: {shipment.estimatedDeliveryDays}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="font-black text-text-primary border border-border px-3 py-1 bg-background rounded-lg text-sm">
                                            ₹{shipment.shippingCost}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className="font-mono text-xs font-bold text-text-secondary bg-background px-2 py-1 rounded">
                                            {shipment.awb}
                                        </span>
                                    </td>
                                    <td className="p-4 font-black text-text-secondary text-sm">
                                        {shipment.distanceFromCustomer?.toFixed(1) || 0} km
                                    </td>
                                    <td className="p-4">
                                        <Badge className="bg-card border-primary/50 text-primary-hover shadow-sm">{shipment.status}</Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
