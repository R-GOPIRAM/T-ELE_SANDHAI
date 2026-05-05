const AppError = require('../utils/AppError');

/**
 * Middleware to restrict route access based on user role.
 * Example: authorizeRoles('admin', 'seller')
 */
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return next(
                new AppError(`Role '${req.user?.role || 'Guest'}' is not allowed to access this resource`, 403)
            );
        }
        next();
    };
};

module.exports = authorizeRoles;
