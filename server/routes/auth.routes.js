const express = require('express');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateResource');
const { registerSchema, loginSchema, updateProfileSchema } = require('../validators/auth.schema');

const router = express.Router();

router.post('/signup', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', authController.refresh);
router.get('/logout', protect, authController.logout);
router.get('/me', protect, authController.getMe);
router.get('/profile', protect, authController.getMe); // Alias for compatibility
router.put('/profile', protect, validate(updateProfileSchema), authController.updateProfile);

module.exports = router;
