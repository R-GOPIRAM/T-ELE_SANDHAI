const SellerService = require('../services/sellerService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { sendResponse } = require('../utils/response');

exports.getAllSellers = catchAsync(async (req, res) => {
    const sellers = await SellerService.getAllSellers();
    return sendResponse(res, 200, true, 'Sellers fetched successfully', sellers, null, {
        count: sellers.length
    });
});

exports.verifySeller = catchAsync(async (req, res) => {
    const { status, reason } = req.body;
    const seller = await SellerService.verifySeller(req.params.id, status, reason);
    return sendResponse(res, 200, true, 'Seller verification updated', seller);
});

exports.register = catchAsync(async (req, res, next) => {
    const { businessName, businessAddress, businessPhone, panNumber, businessCategory, businessDescription } = req.body;

    // Check if seller already exists
    const existingSeller = await SellerService.getSellerByUserId(req.user._id);
    if (existingSeller) {
        return next(new AppError('Seller profile already exists', 409));
    }

    const documents = {
        aadhaar: req.files?.aadhaar?.[0]?.path,
        pan: req.files?.pan?.[0]?.path,
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

    const seller = await SellerService.createSeller(sellerData);

    return sendResponse(res, 201, true, 'Seller registration submitted', seller);
});

exports.getProfile = catchAsync(async (req, res, next) => {
    const seller = await SellerService.getSellerByUserId(req.user._id);
    if (!seller) {
        return next(new AppError('Seller profile not found', 404));
    }

    return sendResponse(res, 200, true, 'Seller profile fetched successfully', seller);
});
