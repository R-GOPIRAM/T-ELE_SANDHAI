const UserRepository = require('../repositories/userRepository');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

class AuthService {
    async register(userData) {
        const existingUser = await UserRepository.findByEmail(userData.email);
        if (existingUser) {
            throw new AppError('Email already in use', 400);
        }

        // Create user
        const user = await UserRepository.createUser(userData);

        // Generate tokens
        const accessToken = user.getSignedJwtToken();
        const refreshToken = user.getRefreshToken();

        // Store refresh token
        await UserRepository.updateRefreshToken(user._id, refreshToken);

        return { user, accessToken, refreshToken };
    }

    async login(email, password) {
        // Check for user
        const user = await UserRepository.findByEmail(email);
        if (!user) {
            throw new AppError('Invalid credentials', 401);
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            throw new AppError('Invalid credentials', 401);
        }

        // Generate tokens
        const accessToken = user.getSignedJwtToken();
        const refreshToken = user.getRefreshToken();

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

        const updatedUser = await UserRepository.updateUser(userId, { name: updateData.name });
        return updatedUser;
    }

    async refreshAccessToken(token) {
        if (!token) {
            throw new AppError('Refresh token is required', 401);
        }

        try {
            // 1. Verify token
            const decoded = require('jsonwebtoken').verify(token, process.env.JWT_REFRESH_SECRET);

            // 2. Find user and check if token matches
            const user = await UserRepository.findByIdAndSelectPassword(decoded.id);
            if (!user || user.refreshToken !== token) {
                // If token doesn't match, it might be a reuse attempt
                if (user) {
                    await UserRepository.clearRefreshToken(user._id);
                }
                throw new AppError('Invalid refresh token or token reuse detected', 401);
            }

            // 3. Generate new tokens (Rotation)
            const accessToken = user.getSignedJwtToken();
            const newRefreshToken = user.getRefreshToken();

            // 4. Update stored refresh token
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
