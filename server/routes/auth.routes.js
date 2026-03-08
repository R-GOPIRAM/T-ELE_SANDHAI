const express = require('express');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateResource');
const { registerCustomerSchema, registerSellerSchema, loginSchema, updateProfileSchema } = require('../validators/auth.schema');
const loginLimiter = require('../middleware/loginLimiter');

const router = express.Router();

router.post('/register/customer', validate(registerCustomerSchema || registerSchema), authController.registerCustomer);
router.post('/register/seller', validate(registerSellerSchema || registerSchema), authController.registerSeller);
router.post('/login', loginLimiter, validate(loginSchema), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', protect, authController.logout);
router.get('/me', protect, authController.getMe);
router.get('/profile', protect, authController.getMe); // Alias for compatibility
router.put('/profile', protect, validate(updateProfileSchema), authController.updateProfile);

module.exports = router;
