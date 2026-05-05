const AuthService = require('../services/authService');
const catchAsync = require('../utils/catchAsync');
const { sendResponse } = require('../utils/response');

// 🔥 Centralized cookie config (production-safe)
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: true,        // ✅ Always true (Render = HTTPS)
    sameSite: "None",    // ✅ Required for cross-origin (Vercel → Render)
    path: "/",
};

// ==========================
// SEND TOKEN RESPONSE
// ==========================
const sendTokenResponse = (user, accessToken, refreshToken, res) => {

    const accessTokenOptions = {
        ...COOKIE_OPTIONS,
        expires: new Date(Date.now() + 15 * 60 * 1000), // 15 min
    };

    const refreshTokenOptions = {
        ...COOKIE_OPTIONS,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    };

    // 🔥 Set cookies
    res.cookie("accessToken", accessToken, accessTokenOptions);
    res.cookie("refreshToken", refreshToken, refreshTokenOptions);

    return sendResponse(res, 200, true, "Authentication successful", {
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        },
        accessToken
    });
};

// ==========================
// REGISTER CUSTOMER
// ==========================
exports.registerCustomer = catchAsync(async (req, res) => {
    const { user, accessToken, refreshToken } =
        await AuthService.registerCustomer(req.body);

    sendTokenResponse(user, accessToken, refreshToken, res);
});

// ==========================
// REGISTER SELLER
// ==========================
exports.registerSeller = catchAsync(async (req, res) => {
    const { user, accessToken, refreshToken } =
        await AuthService.registerSeller(req.body);

    sendTokenResponse(user, accessToken, refreshToken, res);
});

// ==========================
// SIGNUP (UNIFIED)
// ==========================
exports.signup = catchAsync(async (req, res) => {
    const role = req.body?.role === 'seller' ? 'seller' : 'customer';

    const { user, accessToken, refreshToken } =
        role === 'seller'
            ? await AuthService.registerSeller(req.body)
            : await AuthService.registerCustomer(req.body);

    sendTokenResponse(user, accessToken, refreshToken, res);
});

// ==========================
// LOGIN
// ==========================
exports.login = catchAsync(async (req, res) => {
    const { email, password } = req.body;
    const ip = req.ip || req.connection.remoteAddress;

    const { user, accessToken, refreshToken } =
        await AuthService.login(email, password, ip);

    sendTokenResponse(user, accessToken, refreshToken, res);
});

// ==========================
// LOGOUT
// ==========================
exports.logout = catchAsync(async (req, res) => {

    await AuthService.logout(req.user.id);

    // 🔥 Clear cookies correctly
    res.clearCookie("accessToken", COOKIE_OPTIONS);
    res.clearCookie("refreshToken", COOKIE_OPTIONS);

    return sendResponse(res, 200, true, "Logged out successfully");
});

// ==========================
// REFRESH TOKEN
// ==========================
exports.refresh = catchAsync(async (req, res) => {

    const refreshToken = req.cookies.refreshToken;

    const { user, accessToken, newRefreshToken } =
        await AuthService.refreshAccessToken(refreshToken);

    sendTokenResponse(user, accessToken, newRefreshToken, res);
});

// ==========================
// GET PROFILE
// ==========================
exports.getMe = catchAsync(async (req, res) => {
    return sendResponse(res, 200, true, "User profile fetched successfully", {
        user: req.user,
        role: req.user.role
    });
});

// ==========================
// UPDATE PROFILE
// ==========================
exports.updateProfile = catchAsync(async (req, res) => {

    const updatedUser =
        await AuthService.updateProfile(req.user.id, req.body);

    return sendResponse(res, 200, true, "Profile updated successfully", {
        user: {
            id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role
        },
        role: updatedUser.role
    });
});