const AuthService = require('../services/authService');
const catchAsync = require('../utils/catchAsync');
const { sendResponse } = require('../utils/response');

const sendTokenResponse = (user, accessToken, refreshToken, res) => {
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
    };

    const accessTokenOptions = {
        ...cookieOptions,
        expires: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes for access token
    };

    const refreshTokenOptions = {
        ...cookieOptions,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days for refresh token
    };

    res.cookie('accessToken', accessToken, accessTokenOptions);
    res.cookie('refreshToken', refreshToken, refreshTokenOptions);

    // Also keep 'token' for backward compatibility if needed, or remove it.
    // Given the prompt "implement proper refresh token storage using httpOnly cookies", 
    // I'll use explicit names but keep 'token' as an alias for accessToken if helpful for middleware.
    res.cookie('token', accessToken, accessTokenOptions);

    const payload = {
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        }
    };

    return sendResponse(res, 200, true, 'Authentication successful', payload);
};

exports.register = catchAsync(async (req, res) => {
    const { user, accessToken, refreshToken } = await AuthService.register(req.body);
    sendTokenResponse(user, accessToken, refreshToken, res);
});

exports.login = catchAsync(async (req, res) => {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await AuthService.login(email, password);
    sendTokenResponse(user, accessToken, refreshToken, res);
});

exports.logout = catchAsync(async (req, res) => {
    await AuthService.logout(req.user.id);

    const cookieOptions = {
        httpOnly: true,
        expires: new Date(Date.now() + 10 * 1000),
    };

    res.cookie('token', 'none', cookieOptions);
    res.cookie('accessToken', 'none', cookieOptions);
    res.cookie('refreshToken', 'none', cookieOptions);

    return sendResponse(res, 200, true, 'Logged out successfully');
});

exports.refresh = catchAsync(async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    const { user, accessToken, newRefreshToken } = await AuthService.refreshAccessToken(refreshToken);

    sendTokenResponse(user, accessToken, newRefreshToken, res);
});

exports.getMe = catchAsync(async (req, res) => {
    return sendResponse(res, 200, true, 'User profile fetched successfully', { user: req.user });
});

exports.updateProfile = catchAsync(async (req, res) => {
    const updatedUser = await AuthService.updateProfile(req.user.id, req.body);
    const userData = {
        user: {
            id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
        }
    };
    return sendResponse(res, 200, true, 'Profile updated successfully', userData);
});
