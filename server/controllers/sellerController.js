const SellerService = require('../services/sellerService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { sendResponse } = require('../utils/response');

exports.getAllSellers = catchAsync(async (req, res) => {
    const sellers = await SellerService.getAllSellers();
    return sendResponse(res, 200, true, 'Sellers fetched successfully', {
        sellers,
        count: sellers.length
    });
});

exports.verifySeller = catchAsync(async (req, res) => {
    const { status, reason } = req.body;
    const seller = await SellerService.verifySeller(req.params.id, status, reason);
    return sendResponse(res, 200, true, 'Seller verification updated', seller);
});

exports.getStockAlerts = catchAsync(async (req, res) => {
    const alerts = await SellerService.getStockAlerts(req.user._id);
    return sendResponse(res, 200, true, 'Stock alerts fetched successfully', alerts);
});

exports.markStockAlertRead = catchAsync(async (req, res) => {
    const alert = await SellerService.markStockAlertRead(req.user._id, req.params.id);
    return sendResponse(res, 200, true, 'Stock alert marked as read', alert);
});

exports.register = catchAsync(async (req, res, next) => {
    const { businessName, businessAddress, businessPhone, panNumber, businessCategory, businessDescription } = req.body;

    // Check if seller already exists - If so, we UPDATE it instead of failing
    const existingSeller = await SellerService.getSellerByUserId(req.user._id);

    const documents = {
        aadhaar: req.files?.aadhaar?.[0]?.path,
        pan: req.files?.pan?.[0]?.path,
        gstin: req.files?.gstin?.[0]?.path,
        laborCert: req.files?.laborCert?.[0]?.path,
        businessLicense: req.files?.businessLicense?.[0]?.path
    };

    const sellerData = {
        userId: req.user._id,
        businessName,
        businessAddress,
        businessPhone,
        panNumber,
        businessCategory,
        businessDescription,
        documents
    };

    let seller;
    if (existingSeller) {
        // Update existing skeleton profile created during registration
        seller = await SellerService.updateSeller(existingSeller._id, sellerData);
    } else {
        seller = await SellerService.createSeller(sellerData);
    }

    return sendResponse(res, existingSeller ? 200 : 201, true, 'Seller registration updated', seller);
});

exports.getProfile = catchAsync(async (req, res, next) => {
    const seller = await SellerService.getSellerByUserId(req.user._id);
    if (!seller) {
        return next(new AppError('Seller profile not found', 404));
    }

    return sendResponse(res, 200, true, 'Seller profile fetched successfully', seller);
});

exports.getStoreProfile = catchAsync(async (req, res, next) => {
    const storeId = req.params.id;
    const store = await SellerService.getSellerById(storeId);

    if (!store) {
        return next(new AppError('Store not found', 404));
    }

    // Only return safe public data for the store profile
    const publicStoreData = {
        _id: store._id,
        businessName: store.businessName,
        businessAddress: store.businessAddress,
        businessCategory: store.businessCategory,
        businessDescription: store.businessDescription,
        sellerStatus: store.sellerStatus,
        rating: store.rating || 4.5, // Mock rating if missing
        joinedAt: store.createdAt
    };

    return sendResponse(res, 200, true, 'Store profile fetched successfully', publicStoreData);
});

exports.getNearbyStores = catchAsync(async (req, res) => {
    const { lat, lng, radius } = req.query;

    if (!lat || !lng) {
        throw new AppError('Coordinates (lat, lng) are required for proximity search', 400);
    }

    const stores = await SellerService.getNearbyStores(
        parseFloat(lat),
        parseFloat(lng),
        parseFloat(radius) || 50
    );

    return sendResponse(res, 200, true, 'Nearby stores fetched successfully', {
        stores,
        count: stores.length
    });
});
