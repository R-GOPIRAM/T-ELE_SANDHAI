const UserRepository = require('../repositories/userRepository');
const AuditLogger = require('../utils/auditLogger');
const { sendResponse } = require('../utils/response');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const User = require('../models/User');

/**
 * Creates a new admin user.
 * Logical Fix: Allows creation if no admin exists (cold start) OR if requested by an existing admin.
 */
exports.createAdmin = catchAsync(async (req, res) => {
    const { name, email, password } = req.body;

    const existingUser = await UserRepository.findByEmail(email);
    if (existingUser) {
        throw new AppError('Email already in use', 400);
    }

    // Cold Start Check: If no admin exists, allow creation without authorization
    const adminCount = await User.countDocuments({ role: 'admin' });

    if (adminCount > 0) {
        // If admins exist, require current user to be an admin
        if (!req.user || req.user.role !== 'admin') {
            throw new AppError('Only an admin can create another admin', 403);
        }
    }

    // Create user strictly as admin
    const userData = {
        name,
        email,
        password,
        role: 'admin',
        permissions: ['*']
    };

    const user = await UserRepository.createUser(userData);

    if (req.user) {
        AuditLogger.logAdminAction(req.user._id, 'CREATED_NEW_ADMIN', user._id);
    } else {
        AuditLogger.logAdminAction(user._id, 'INITIAL_ADMIN_CREATED', user._id);
    }

    return sendResponse(res, 201, true, 'Admin created successfully', {
        admin: { id: user._id, email: user.email }
    });
});

exports.getAllUsers = catchAsync(async (req, res) => {
    const { page = 1, limit = 20, role, search } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (role && role !== 'all') query.role = role;
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
        ];
    }

    const [users, total] = await Promise.all([
        User.find(query)
            .select('-password -refreshToken')
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .skip(skip)
            .lean(),
        User.countDocuments(query)
    ]);

    return sendResponse(res, 200, true, 'Users fetched successfully', {
        users,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: Number(page)
    });
});

exports.suspendUser = catchAsync(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) throw new AppError('User not found', 404);
    if (user.role === 'admin') throw new AppError('Cannot suspend an admin account', 403);

    user.isActive = !user.isActive;
    await user.save();

    AuditLogger.logAdminAction(req.user._id, user.isActive ? 'USER_ACTIVATED' : 'USER_SUSPENDED', user._id);

    return sendResponse(res, 200, true, `User ${user.isActive ? 'activated' : 'suspended'} successfully`, {
        isActive: user.isActive
    });
});

exports.deleteUser = catchAsync(async (req, res) => {
    if (req.params.id === req.user._id.toString()) {
        throw new AppError('You cannot delete your own account', 403);
    }

    const user = await User.findById(req.params.id);
    if (!user) throw new AppError('User not found', 404);
    if (user.role === 'admin') throw new AppError('Cannot delete an admin account', 403);

    await user.deleteOne();
    AuditLogger.logAdminAction(req.user._id, 'USER_DELETED', req.params.id);

    return sendResponse(res, 200, true, 'User deleted successfully', null);
});
