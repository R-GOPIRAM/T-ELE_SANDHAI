const shiprocketService = require('../services/shiprocketService');
const Order = require('../models/Order');
const catchAsync = require('../utils/catchAsync');
const { sendResponse } = require('../utils/response');
const AppError = require('../utils/AppError');

exports.createShipment = catchAsync(async (req, res) => {
    const shipmentData = await shiprocketService.createShipment(req.body);
    return sendResponse(res, 200, true, 'Shipment created successfully', shipmentData);
});

exports.trackShipment = catchAsync(async (req, res, next) => {
    const { awb } = req.params;
    if (!awb) {
        throw new AppError('AWB code is required', 400);
    }

    let trackingData = null;
    try {
        trackingData = await shiprocketService.trackShipment(awb);
    } catch (err) {
        // We catch this internally to still return the DB order info even if Shiprocket API fails
        console.error(`Failed to track with Shiprocket: ${err.message}`);
    }

    const order = await Order.findOne({ 'shipments.awb': awb }).lean();
    let routingInfo = null;
    if (order) {
        routingInfo = order.shipments.find(s => s.awb === awb);
    }

    return sendResponse(res, 200, true, 'Tracking info fetched successfully', { trackingData, routingInfo });
});

exports.checkServiceability = catchAsync(async (req, res) => {
    const data = await shiprocketService.checkServiceability(req.query);
    return sendResponse(res, 200, true, 'Serviceability checked successfully', data);
});
