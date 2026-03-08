const cron = require('node-cron');
const Order = require('../models/Order');
const ShiprocketService = require('../services/shiprocketService');
const logger = require('../utils/logger');

/**
 * Shipment Sync Job
 * Periodically synchronized tracking statuses from Shiprocket into the local database.
 */
const initShipmentSyncJob = () => {
    // Run every 10 minutes
    cron.schedule('*/10 * * * *', async () => {
        logger.info('Starting Shipment Status Sync Job...');

        try {
            // Find orders with active shipments that are not yet delivered/cancelled
            const orders = await Order.find({
                'shipments.status': { $in: ['Pending', 'Pickup Scheduled', 'Shipped', 'Out for Delivery'] }
            });

            logger.info(`Found ${orders.length} orders with active shipments to sync.`);

            // Parallelize orders processing with a limit or handle shipments in parallel
            await Promise.all(orders.map(async (order) => {
                let orderUpdated = false;

                // Process all shipments in the order in parallel
                await Promise.all(order.shipments.map(async (shipment) => {
                    if (['Delivered', 'Cancelled', 'Returned'].includes(shipment.status) || !shipment.awb) return;

                    try {
                        const trackingData = await ShiprocketService.trackShipment(shipment.awb);

                        if (trackingData?.tracking_data?.track_status === 1) {
                            const latestStatus = trackingData.tracking_data.shipment_track[0]?.current_status;

                            if (latestStatus && latestStatus !== shipment.status) {
                                shipment.status = mapShiprocketStatus(latestStatus);
                                orderUpdated = true;
                                logger.info(`Updated shipment ${shipment.shipmentId} (AWB: ${shipment.awb}) status to ${shipment.status}`);
                            }
                        }
                    } catch (trackErr) {
                        logger.error(`Failed to track shipment ${shipment.awb}:`, trackErr.message);
                    }
                }));

                if (orderUpdated) {
                    const allDelivered = order.shipments.every(s => s.status === 'Delivered');
                    if (allDelivered) {
                        order.orderStatus = 'Delivered';
                        order.deliveredAt = new Date();
                    }
                    await order.save();
                }
            }));

            logger.info('Shipment Status Sync Job completed successfully.');
        } catch (error) {
            logger.error('Error in Shipment Status Sync Job:', error);
        }
    });
};

/**
 * Maps Shiprocket's tracking status strings to internal Enum values
 */
const mapShiprocketStatus = (srStatus) => {
    const status = srStatus.toUpperCase();
    if (status.includes('DELIVERED')) return 'Delivered';
    if (status.includes('OUT FOR DELIVERY')) return 'Out for Delivery';
    if (status.includes('TRANSIT')) return 'Shipped';
    if (status.includes('PICKUP SCHEDULED')) return 'Pickup Scheduled';
    if (status.includes('CANCELLED')) return 'Cancelled';
    if (status.includes('RETURN')) return 'Returned';
    return 'Shipped'; // Fallback
};

module.exports = initShipmentSyncJob;
