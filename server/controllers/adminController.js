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
