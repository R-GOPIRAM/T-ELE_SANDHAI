import React, { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle, XCircle, Truck, MapPin, Phone, Mail, Eye } from 'lucide-react';
import api from '../../services/api';
import { Order } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';

interface SellerOrdersPageProps {
  onPageChange: (page: string) => void;
}

export default function SellerOrdersPage({ onPageChange }: SellerOrdersPageProps) {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/orders/seller-orders');
        const formattedOrders = data.data.map((o: any) => ({
          ...o,
          id: String(o.orderId || o.id || o._id || 'unknown'),
          status: (o.orderStatus || o.status || 'pending').toLowerCase(),
          items: o.items.map((i: any) => ({
            ...i,
            productName: i.name || i.productName || 'Product',
            sellerName: i.seller?.name || i.sellerName || 'Seller',
            subtotal: (i.price * i.quantity) || i.subtotal || 0,
            price: i.price || 0,
            quantity: i.quantity || 1
          }))
        }));
        setOrders(formattedOrders);
      } catch (error) {
        console.error('Failed to fetch orders', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      const { data } = await api.put(`/orders/${orderId}`, { status: newStatus });
      const updatedOrder = data.data;

      setOrders(prev => prev.map(order =>
        order.id === orderId ? updatedOrder : order
      ));

      if (selectedOrder?.id === orderId) {
        setSelectedOrder(updatedOrder);
      }
    } catch (error) {
      console.error('Failed to update order status', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      packed: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return badges[status as keyof typeof badges] || badges.pending;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'packed':
        return <Package className="w-4 h-4" />;
      case 'shipped':
        return <Truck className="w-4 h-4" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
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

  // Orders are already filtered by backend for the seller
  const sellerOrders = orders;

  const filteredOrders = sellerOrders.filter(order =>
    statusFilter === 'all' || order.status === statusFilter
  );

  const orderStats = {
    total: sellerOrders.length,
    pending: sellerOrders.filter(o => o.status === 'pending').length,
    confirmed: sellerOrders.filter(o => o.status === 'confirmed').length,
    shipped: sellerOrders.filter(o => o.status === 'shipped').length,
    delivered: sellerOrders.filter(o => o.status === 'delivered').length
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12 min-h-screen bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Management</h1>
          <p className="text-gray-600">Track and manage your customer orders</p>
        </div>

        {/* Order Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{orderStats.total}</div>
            <div className="text-sm text-gray-600">Total Orders</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{orderStats.pending}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{orderStats.confirmed}</div>
            <div className="text-sm text-gray-600">Confirmed</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <div className="text-2xl font-bold text-indigo-600">{orderStats.shipped}</div>
            <div className="text-sm text-gray-600">Shipped</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{orderStats.delivered}</div>
            <div className="text-sm text-gray-600">Delivered</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { key: 'all', label: 'All Orders', count: sellerOrders.length },
                { key: 'pending', label: 'Pending', count: orderStats.pending },
                { key: 'confirmed', label: 'Confirmed', count: orderStats.confirmed },
                { key: 'shipped', label: 'Shipped', count: orderStats.shipped },
                { key: 'delivered', label: 'Delivered', count: orderStats.delivered }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setStatusFilter(tab.key)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${statusFilter === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Orders List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Orders ({filteredOrders.length})
                </h2>
              </div>

              <div className="divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className={`p-6 cursor-pointer hover:bg-gray-50 transition-colors ${selectedOrder?.id === order.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                      }`}
                    onClick={() => setSelectedOrder(order)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <Package className="w-5 h-5 text-gray-400" />
                          <h3 className="text-lg font-semibold text-gray-900">
                            Order #{order.id.slice(-6).toUpperCase()}
                          </h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(order.status)}`}>
                            {getStatusIcon(order.status)}
                            <span className="ml-1 capitalize">{order.status}</span>
                          </span>
                        </div>

                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 mr-2" />
                            {order.customerName} • {order.customerEmail}
                          </div>
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 mr-2" />
                            {order.customerPhone}
                          </div>
                          {order.deliveryAddress && (
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-2" />
                              {order.deliveryAddress}
                            </div>
                          )}
                          <div className="flex items-center">
                            <Truck className="w-4 h-4 mr-2" />
                            {order.deliveryType === 'pickup' ? 'Store Pickup' : 'Home Delivery'}
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <div className="text-lg font-bold text-gray-900">
                            ₹{order.totalAmount.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.items.length} item{order.items.length > 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        icon={Eye}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOrder(order);
                        }}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {filteredOrders.length === 0 && (
                <div className="p-12 text-center">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                  <p className="text-gray-500">No orders match the current filter.</p>
                </div>
              )}
            </div>
          </div>

          {/* Order Details Panel */}
          <div className="lg:col-span-1">
            {selectedOrder ? (
              <div className="bg-white rounded-lg shadow-md">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Order Details</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(selectedOrder.status)}`}>
                      {getStatusIcon(selectedOrder.status)}
                      <span className="ml-1 capitalize">{selectedOrder.status}</span>
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Customer Information */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Customer Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 text-gray-400 mr-2" />
                        <span>{selectedOrder.customerName}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 text-gray-400 mr-2" />
                        <span>{selectedOrder.customerPhone}</span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 text-gray-400 mr-2" />
                        <span>{selectedOrder.customerEmail}</span>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Information */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Delivery Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <Truck className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="capitalize">{selectedOrder.deliveryType}</span>
                      </div>
                      {selectedOrder.deliveryAddress && (
                        <div className="flex items-start">
                          <MapPin className="w-4 h-4 text-gray-400 mr-2 mt-0.5" />
                          <span>{selectedOrder.deliveryAddress}</span>
                        </div>
                      )}
                      {selectedOrder.estimatedDelivery && (
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 text-gray-400 mr-2" />
                          <span>
                            Est. Delivery: {new Date(selectedOrder.estimatedDelivery).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Order Items</h4>
                    <div className="space-y-3">
                      {selectedOrder.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                          <div>
                            <div className="font-medium text-gray-900">{item.productName}</div>
                            <div className="text-sm text-gray-600">Qty: {item.quantity}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-gray-900">
                              ₹{item.subtotal.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-600">
                              ₹{item.price.toLocaleString()} each
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex justify-between items-center font-semibold text-gray-900">
                        <span>Total Amount:</span>
                        <span>₹{selectedOrder.totalAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Information */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Payment Information</h4>
                    <div className="text-sm text-gray-600">
                      Payment Method: <span className="font-medium">{selectedOrder.paymentMethod}</span>
                    </div>
                  </div>

                  {/* Order Actions */}
                  {selectedOrder.status !== 'delivered' && selectedOrder.status !== 'cancelled' && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">Order Actions</h4>
                      <div className="space-y-2">
                        {getNextStatus(selectedOrder.status) && (
                          <Button
                            variant="primary"
                            onClick={() => updateOrderStatus(selectedOrder.id, getNextStatus(selectedOrder.status)!)}
                            className="w-full"
                          >
                            Mark as {getNextStatus(selectedOrder.status)!.charAt(0).toUpperCase() + getNextStatus(selectedOrder.status)!.slice(1)}
                          </Button>
                        )}

                        {selectedOrder.status === 'pending' && (
                          <Button
                            variant="danger"
                            icon={XCircle}
                            onClick={() => updateOrderStatus(selectedOrder.id, 'cancelled')}
                            className="w-full"
                          >
                            Cancel Order
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Order Timeline */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Order Timeline</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-gray-600">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                        Order placed: {new Date(selectedOrder.createdAt).toLocaleString()}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <div className="w-2 h-2 bg-gray-300 rounded-full mr-3"></div>
                        Last updated: {new Date(selectedOrder.updatedAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select an Order</h3>
                <p className="text-gray-500">Choose an order from the list to view details and manage its status.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}