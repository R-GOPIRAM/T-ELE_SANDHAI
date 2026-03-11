const UserRepository = require('../repositories/userRepository');
const Seller = require('../models/Seller');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');
const TokenService = require('../utils/tokenService');
const AuditLogger = require('../utils/auditLogger');

class AuthService {
    async registerCustomer(userData) {
        userData.role = 'customer';
        return this._registerUser(userData);
    }

    async registerSeller(userData) {
        userData.role = 'seller';
        const result = await this._registerUser(userData);

        // Ensure Seller profile is initiated as pending
        await Seller.create({
            userId: result.user._id,
            businessName: userData.businessName || 'Pending Business',
            businessAddress: userData.businessAddress || 'Pending Address',
            businessPhone: userData.phone || 'Pending Phone',
            panNumber: userData.panNumber || 'Pending PAN',
            sellerStatus: 'pending' // Enforcing Module 6 pending status
        });

        return result;
    }

    async _registerUser(userData) {
        const existingUser = await UserRepository.findByEmail(userData.email);
        if (existingUser) {
            throw new AppError('Email already in use', 400);
        }

        // Create user
        const user = await UserRepository.createUser(userData);

        // Generate tokens
        const accessToken = TokenService.generateAccessToken(user);
        const refreshToken = TokenService.generateRefreshToken(user);

        // Store refresh token
        await UserRepository.updateRefreshToken(user._id, refreshToken);

        return { user, accessToken, refreshToken };
    }

    async login(email, password, ip) {
        // Check for user
        const user = await UserRepository.findByEmail(email);
        if (!user) {
            AuditLogger.logLoginFailed(email, ip, 'User not found');
            throw new AppError('Invalid credentials', 401);
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            AuditLogger.logLoginFailed(email, ip, 'Invalid password');
            throw new AppError('Invalid credentials', 401);
        }

        // Module 6: Seller Approval Workflow
        // We allow login even if pending so they can access the registration completion page and status dashboard.
        // Feature access (e.g. products appearing in search) will be handled by sellerStatus.

        AuditLogger.logLoginSuccess(user._id, user.role, ip);

        // Generate tokens
        const accessToken = TokenService.generateAccessToken(user);
        const refreshToken = TokenService.generateRefreshToken(user);

        // Store refresh token
        await UserRepository.updateRefreshToken(user._id, refreshToken);

        return { user, accessToken, refreshToken };
    }

    async logout(userId) {
        await UserRepository.clearRefreshToken(userId);
    }

    async updateProfile(userId, updateData) {
        const user = await UserRepository.findById(userId);
        if (!user) {
            throw new AppError('User not found', 404);
        }

        const allowedUpdates = {};
        if (updateData.name) allowedUpdates.name = updateData.name;
        if (updateData.address) allowedUpdates.address = updateData.address;
        if (updateData.phone) allowedUpdates.phone = updateData.phone;

        const updatedUser = await UserRepository.updateUser(userId, allowedUpdates);
        return updatedUser;
    }

    async refreshAccessToken(token) {
        if (!token) {
            throw new AppError('Refresh token is required', 401);
        }

        try {
            // 1. Verify token
            const decoded = await TokenService.verifyToken(token, process.env.JWT_REFRESH_SECRET);

            // 2. Find user and check if token version matches
            const user = await UserRepository.findByIdAndSelectPassword(decoded.id);

            // Validate token version to prevent reuse after global revocation
            if (!user || user.tokenVersion !== decoded.version) {
                if (user) {
                    await UserRepository.clearRefreshToken(user._id);
                }
                throw new AppError('Invalid refresh token version or token reuse detected', 401);
            }

            // 3. Generate new tokens (Rotation)
            const accessToken = TokenService.generateAccessToken(user);
            const newRefreshToken = TokenService.generateRefreshToken(user);

            // 4. Update stored refresh token (Optional: if we still want to store it, but version is primary)
            await UserRepository.updateRefreshToken(user._id, newRefreshToken);

            return { user, accessToken, newRefreshToken };
        } catch (err) {
            if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
                throw new AppError('Invalid or expired refresh token', 401);
            }
            throw err;
        }
    }
}

module.exports = new AuthService();
