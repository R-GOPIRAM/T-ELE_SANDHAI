const OrderRepository = require('../repositories/orderRepository');
const ProductRepository = require('../repositories/productRepository');
const PaymentService = require('./paymentService');
const shiprocketService = require('./shiprocketService');
const { calculateDistance } = require('../utils/distanceCalculator');
const Seller = require('../models/Seller');
const Product = require('../models/Product');
const StockAlert = require('../models/StockAlert');
const AppError = require('../utils/AppError');
const mongoose = require('mongoose');

class OrderService {
    async createOrder(userId, orderData) {
        const { items, shippingAddress, paymentInfo } = orderData;

        // Verify payment first (in a real scenario, you'd likely create order as 'Pending' then confirm)
        // For this flow: frontend calls payment verify -> then calls create order

        let totalAmount = 0;
        const enrichedItems = [];
        const shipmentsMap = new Map(); // Maps sellerId -> shipment data

        // User coordinates (fallback to 0 if not provided)
        const userLat = shippingAddress?.latitude || 0;
        const userLon = shippingAddress?.longitude || 0;

        // Batch fetch all original products to get their names
        const itemProductIds = items.map(i => i.product);
        const originalProducts = await Product.find({ _id: { $in: itemProductIds } }).lean();
        const originalProductsMap = new Map(originalProducts.map(p => [p._id.toString(), p]));

        // Module B: Smart Routing - Batch fetch all candidate products by name
        const productNames = [...new Set(originalProducts.map(p => p.name))];
        const allCandidates = await Product.find({
            name: { $in: productNames },
            isAvailable: true
        }).lean();

        // Group candidates by name for easy lookup
        const candidatesByName = new Map();
        allCandidates.forEach(cand => {
            if (!candidatesByName.has(cand.name)) candidatesByName.set(cand.name, []);
            candidatesByName.get(cand.name).push(cand);
        });

        // Batch fetch all unique sellers for all candidates
        const sellerUserIds = [...new Set(allCandidates.map(c => c.shopOwnerId.toString()))];
        const allSellers = await Seller.find({ userId: { $in: sellerUserIds } }).lean();
        const sellersMap = new Map(allSellers.map(s => [s.userId.toString(), s]));

        // Process items using in-memory data
        for (const item of items) {
            const originalProduct = originalProductsMap.get(item.product.toString());
            if (!originalProduct) throw new AppError(`Product not found: ${item.product}`, 404);

            const candidates = (candidatesByName.get(originalProduct.name) || [])
                .filter(cand => cand.stock >= item.quantity);

            if (candidates.length === 0) {
                throw new AppError(`Insufficient stock for product: ${originalProduct.name}`, 400);
            }

            // Find optimal seller (shortest distance)
            let optimalProduct = candidates[0];
            let optimalSellerDoc = null;
            let minDistance = Infinity;

            for (const cand of candidates) {
                const sellerDoc = sellersMap.get(cand.shopOwnerId.toString());
                if (sellerDoc) {
                    const dist = calculateDistance(userLat, userLon, sellerDoc.latitude || 0, sellerDoc.longitude || 0);
                    const safeDist = dist !== null ? dist : 999999;
                    if (safeDist < minDistance) {
                        minDistance = safeDist;
                        optimalProduct = cand;
                        optimalSellerDoc = sellerDoc;
                    }
                }
            }

            // Fallback if no sellerDoc found in map (should not happen if candidates logic is correct)
            if (!optimalSellerDoc) {
                optimalSellerDoc = sellersMap.get(optimalProduct.shopOwnerId.toString());
            }

            totalAmount += optimalProduct.price * item.quantity;
            const sellerIdStr = optimalProduct.shopOwnerId.toString();

            enrichedItems.push({
                product: optimalProduct._id,
                name: optimalProduct.name,
                price: optimalProduct.price,
                quantity: item.quantity,
                image: optimalProduct.images?.length > 0 ? optimalProduct.images[0] : null,
                seller: optimalProduct.shopOwnerId
            });

            // Group into shipments Maps
            if (!shipmentsMap.has(sellerIdStr)) {
                shipmentsMap.set(sellerIdStr, {
                    sellerId: optimalProduct.shopOwnerId,
                    storeName: optimalSellerDoc?.businessName || 'Unknown Store',
                    pickupLocation: optimalSellerDoc?.pickupLocationName || 'DefaultPickup',
                    distanceFromCustomer: minDistance !== Infinity ? minDistance : 0,
                    sellerPincode: optimalSellerDoc?.pincode || '110001',
                    weight: 0,
                    items: []
                });
            }

            const shipment = shipmentsMap.get(sellerIdStr);
            shipment.items.push({ ...item, price: optimalProduct.price, name: optimalProduct.name });
            shipment.weight += 0.5 * item.quantity;
        }

        // Final safety check
        if (enrichedItems.length === 0) throw new AppError('Order has no legitimate items', 400);

        // Start Transaction
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Prepare shipments array using Shiprocket
            const finalShipments = [];

            // Fetch user for billing details
            const User = require('../models/User');
            const user = await User.findById(userId).lean();

            for (const [sellerIdStr, shipData] of shipmentsMap.entries()) {
                let courierName = 'Delhivery';
                let shippingCost = 50;
                let estimatedDeliveryDays = '3-5 Days';
                let courierId = '1';

                try {
                    // Module D: Automatic Courier Selection
                    const serviceability = await shiprocketService.checkServiceability({
                        pickup_postcode: shipData.sellerPincode,
                        delivery_postcode: shippingAddress.zipCode,
                        weight: shipData.weight,
                        cod: paymentInfo?.method === 'cod' ? 1 : 0
                    });

                    if (serviceability?.data?.available_courier_companies?.length > 0) {
                        const couriers = serviceability.data.available_courier_companies;
                        // Score logic: score = delivery_days * 0.6 + shipping_cost * 0.4
                        let bestCourier = couriers[0];
                        let minScore = (bestCourier.estimated_delivery_days * 0.6) + (bestCourier.rate * 0.4);

                        for (const rc of couriers) {
                            const score = (rc.estimated_delivery_days * 0.6) + (rc.rate * 0.4);
                            if (score < minScore) {
                                minScore = score;
                                bestCourier = rc;
                            }
                        }

                        courierName = bestCourier.courier_name;
                        shippingCost = bestCourier.rate;
                        estimatedDeliveryDays = bestCourier.etd || `${bestCourier.estimated_delivery_days} Days`;
                        courierId = bestCourier.courier_company_id;
                    }
                } catch (err) {
                    console.log(`Courier selection failed for seller ${shipData.storeName}, using defaults`);
                }

                // Module E: Shipment Creation
                let shipmentId = `MOCK-SHIP-${Date.now()}`;
                let awb = `MOCK-AWB-${Date.now()}`;

                try {
                    const orderPayload = {
                        order_id: `ORD-${Date.now()}-${sellerIdStr.substring(0, 4)}`,
                        order_date: new Date().toISOString(),
                        pickup_location: shipData.pickupLocation,
                        billing_customer_name: user?.name || 'Customer',
                        billing_last_name: '',
                        billing_email: user?.email || '',
                        billing_address: shippingAddress.street,
                        billing_city: shippingAddress.city,
                        billing_state: shippingAddress.state,
                        billing_pincode: shippingAddress.zipCode,
                        billing_phone: shippingAddress.phone || user?.phone || '9999999999',
                        shipping_is_billing: true,
                        order_items: shipData.items.map(i => ({ name: i.name, sku: i.product.toString(), units: i.quantity, selling_price: i.price })),
                        payment_method: paymentInfo?.method === 'cod' ? 'COD' : 'Prepaid',
                        sub_total: shipData.items.reduce((s, i) => s + (i.price * i.quantity), 0),
                        length: 10, breadth: 10, height: 10, weight: shipData.weight
                    };
                    const srRes = await shiprocketService.createShipment(orderPayload);
                    if (srRes?.shipment_id) shipmentId = String(srRes.shipment_id);
                    if (srRes?.awb_code) awb = String(srRes.awb_code);
                } catch (err) {
                    console.log(`Mocking shipment creation due to API fail: ${err.message}`);
                }

                finalShipments.push({
                    sellerId: shipData.sellerId,
                    storeName: shipData.storeName,
                    pickupLocation: shipData.pickupLocation,
                    distanceFromCustomer: shipData.distanceFromCustomer,
                    courierName,
                    courierId,
                    estimatedDeliveryDays,
                    shippingCost,
                    shipmentId,
                    awb,
                    pickupDate: new Date(),
                    trackingUrl: `https://shiprocket.co/tracking/${awb}`,
                    status: 'Pickup Scheduled'
                });
            }

            // 1. Create Order
            const orderDocId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            const order = await OrderRepository.create({
                orderId: orderDocId,
                user: userId,
                items: enrichedItems,
                shippingAddress,
                paymentInfo,
                totalAmount,
                shipments: finalShipments
            });

            // 2. Update Stock (Parallelized)
            await Promise.all(enrichedItems.map(async (item) => {
                const updatedProduct = await ProductRepository.update(item.product, {
                    $inc: { stock: -item.quantity, soldCount: item.quantity }
                });

                // Check for low stock alert
                if (updatedProduct && updatedProduct.stock <= 5) {
                    try {
                        const existingAlert = await StockAlert.findOne({ productId: updatedProduct._id, isRead: false }).lean();
                        if (!existingAlert) {
                            await StockAlert.create({
                                productId: updatedProduct._id,
                                sellerId: updatedProduct.shopOwnerId,
                                productName: updatedProduct.name,
                                currentStock: updatedProduct.stock,
                                threshold: 5
                            });

                            // Emit real-time alert via socket
                            const { getIo } = require('../socket');
                            try {
                                const io = getIo();
                                io.to(`seller_${updatedProduct.shopOwnerId}`).emit('stock_alert', {
                                    message: `Low Stock Warning: ${updatedProduct.name} has only ${updatedProduct.stock} units left.`,
                                    productId: updatedProduct._id
                                });
                            } catch (sErr) {
                                // Socket not initialized, skip
                            }
                        }
                    } catch (alertErr) {
                        console.error('Failed to create stock alert:', alertErr);
                    }
                }
            }));

            await session.commitTransaction();
            session.endSession();

            return order;
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }

    async getUserOrders(userId, page = 1, limit = 10) {
        return await OrderRepository.findByUser(userId, page, limit);
    }

    async getSellerOrders(sellerId, page = 1, limit = 10) {
        return await OrderRepository.findBySeller(sellerId, page, limit);
    }

    async getOrder(id, userId, role) {
        const order = await OrderRepository.findById(id);
        if (!order) {
            throw new AppError('Order not found', 404);
        }

        if (role !== 'admin' && order.user._id.toString() !== userId) {
            // Check if user is a seller of one of the items
            const isSeller = order.items.some(item => item.seller._id.toString() === userId);
            if (!isSeller) {
                throw new AppError('Not authorized to view this order', 403);
            }
        }

        return order;
    }

    async updatePaymentStatus(id, userId, role, status, method, transactionId) {
        const order = await this.getOrder(id, userId, role);

        // Update payment info
        order.paymentInfo.status = status;
        order.paymentInfo.method = method || order.paymentInfo.method;
        if (transactionId) order.paymentInfo.transactionId = transactionId;

        // If paid, ensure order status is at least Processing
        if (status === 'completed' || status === 'success' || status === 'captured') {
            order.orderStatus = 'Processing';
            order.paymentInfo.paymentStatus = 'Paid';
            order.paymentInfo.paymentReceived = true;
            order.paymentInfo.paymentDate = new Date();
        } else if (status === 'refunded') {
            order.paymentInfo.paymentStatus = 'Refunded';
        }

        await order.save();
        return order;
    }

    async updateOrderStatus(id, userId, role, status) {
        // Find order and check permissions
        const order = await this.getOrder(id, userId, role);

        // Use repository to apply status-specific logic (timestamps)
        const updatedOrder = await OrderRepository.updateStatus(id, status);
        if (!updatedOrder) throw new AppError('Order update failed', 500);

        // Emit real-time notification to customer
        try {
            const { getIo } = require('../socket');
            const io = getIo();
            io.to(`user_${order.user._id}`).emit('order_update', {
                message: `Your order status has changed to: ${status}`,
                orderId: order.orderId,
                status
            });
        } catch (err) {
            // Socket skip
        }

        return updatedOrder;
    }

    async updatePaymentStatusByRazorpayId(razorpayOrderId, { paymentId, status, method }) {
        const order = await OrderRepository.findByRazorpayOrderId(razorpayOrderId);
        if (!order) {
            throw new AppError(`Order with Razorpay ID ${razorpayOrderId} not found`, 404);
        }

        // Prevent invalid transitions (e.g., don't go from 'captured' back to 'pending')
        if (order.paymentInfo.status === 'captured' && status !== 'refunded') {
            return order;
        }

        order.paymentInfo.razorpayPaymentId = paymentId || order.paymentInfo.razorpayPaymentId;
        order.paymentInfo.status = status;
        if (method) order.paymentInfo.method = method;

        if (status === 'captured' || status === 'success' || status === 'completed') {
            order.orderStatus = 'Processing';
            order.paymentInfo.paymentStatus = 'Paid';
            order.paymentInfo.paymentReceived = true;
            order.paymentInfo.paymentDate = new Date();
            order.paymentInfo.transactionId = paymentId;
        } else if (status === 'refunded') {
            order.paymentInfo.paymentStatus = 'Refunded';
        }

        await order.save();

        // Emit real-time dashboard update to all sellers involved in the order
        try {
            const { getIo } = require('../socket');
            let io;
            try {
                io = getIo();
            } catch (err) {
                // Socket not initialized, skip notification
                return order;
            }

            const uniqueSellers = [...new Set(order.items.map(item => item.seller.toString()))];

            uniqueSellers.forEach(sellerId => {
                io.to(`seller_${sellerId}`).emit('dashboard_update', {
                    message: 'New order received!',
                    orderId: order.orderId
                });
            });
        } catch (err) {
            console.error('Socket notification failed', err);
        }

        return order;
    }
}

module.exports = new OrderService();
