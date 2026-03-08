const jwt = require('jsonwebtoken');
const { promisify } = require('util');

/**
 * Advanced token service for managing JWT lifecycle (Access + Refresh tokens).
 */
class TokenService {
    /**
     * Generates a short-lived access token.
     */
    static generateAccessToken(user) {
        return jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '15m' }
        );
    }

    /**
     * Generates a long-lived refresh token with versioning.
     */
    static generateRefreshToken(user) {
        return jwt.sign(
            { id: user._id, version: user.tokenVersion || 0 },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
        );
    }

    /**
     * Verifies a given token asynchronously.
     * @throws {Error} If token is invalid or expired
     */
    static async verifyToken(token, secret) {
        return await promisify(jwt.verify)(token, secret);
    }
}

module.exports = TokenService;
