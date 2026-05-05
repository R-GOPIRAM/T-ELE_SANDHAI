const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const adminController = require('../controllers/adminController');
const validate = require('../middleware/validateResource');
const { createAdminSchema } = require('../validators/admin.schema');

const router = express.Router();

/**
 * @route POST /api/admin/create-admin
 * @desc Create a new admin
 * @access Public (if no admins exist) / Admin (if admins exist)
 */
router.post(
    '/create-admin',
    (req, res, next) => {
        // Optional protection: if header or cookie exists, try to authenticate
        // Otherwise, the controller will handle the "cold start" logic
        if (req.headers.authorization || (req.cookies && req.cookies.token)) {
            return protect(req, res, next);
        }
        next();
    },
    validate(createAdminSchema),
    adminController.createAdmin
);

// Other admin routes should be strictly protected
router.use(protect);
router.use(authorizeRoles('admin'));

// User Management
router.get('/users', adminController.getAllUsers);
router.patch('/users/:id/suspend', adminController.suspendUser);
router.delete('/users/:id', adminController.deleteUser);

module.exports = router;
