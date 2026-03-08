const bargainService = require('../services/bargainService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { sendResponse } = require('../utils/response');

exports.initiateBargain = catchAsync(async (req, res) => {
    const bargain = await bargainService.initiateBargain(req.user.id, req.body);
    return sendResponse(res, 201, true, 'Bargain initiated successfully', bargain);
});

exports.sendMessage = catchAsync(async (req, res) => {
    const bargain = await bargainService.addMessage(req.user.id, req.user.role, req.body);
    return sendResponse(res, 200, true, 'Message sent successfully', bargain);
});

exports.updateStatus = catchAsync(async (req, res) => {
    const bargain = await bargainService.updateStatus(req.user.id, req.user.role, {
        bargainId: req.body.bargainId || req.body.id, // Handle both payload shapes
        status: req.body.status
    });

    return sendResponse(res, 200, true, 'Bargain status updated', bargain);
});

exports.getMyBargains = catchAsync(async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 15;
    const result = await bargainService.getBargains(req.user.id, req.user.role, page, limit);

    return sendResponse(res, 200, true, 'Bargains fetched successfully', {
        bargains: result.bargains,
        pagination: {
            results: result.bargains.length,
            total: result.total,
            page,
            totalPages: Math.ceil(result.total / limit)
        }
    });
});

exports.getBargainDetails = catchAsync(async (req, res) => {
    const bargain = await bargainService.getBargainDetails(req.params.id, req.user.id);
    return sendResponse(res, 200, true, 'Bargain details fetched', bargain);
});

exports.getAnalytics = catchAsync(async (req, res) => {
    const stats = await bargainService.getAnalytics(req.user.id);
    return sendResponse(res, 200, true, 'Analytics fetched successfully', stats);
});
