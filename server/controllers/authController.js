const AuthService = require('../services/authService');
const catchAsync = require('../utils/catchAsync');
const { sendResponse } = require('../utils/response');

// 🔥 Cookie config (FINAL CORRECT VERSION)
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: true,          // required for HTTPS (Render)
    sameSite: "None",      // required for Vercel → Render
    path: "/",             // important
    // ❌ DO NOT set domain
};

// ==========================
// 🔐 SEND TOKEN RESPONSE
// ==========================
const sendTokenResponse = (user, accessToken, refreshToken, res) => {

    res.cookie("accessToken", accessToken, {
        ...COOKIE_OPTIONS,
        expires: new Date(Date.now() + 15 * 60 * 1000), // 15 min
    });

    res.cookie("refreshToken", refreshToken, {
        ...COOKIE_OPTIONS,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    return res.status(200).json({
        success: true,
        message: "Authentication successful",
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        }
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

    // 🔥 Must match cookie options exactly
    res.clearCookie("accessToken", COOKIE_OPTIONS);
    res.clearCookie("refreshToken", COOKIE_OPTIONS);

    return sendResponse(res, 200, true, "Logged out successfully");
});

// ==========================
// REFRESH TOKEN
// ==========================
exports.refresh = catchAsync(async (req, res) => {

    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({
            success: false,
            message: "Refresh token is required"
        });
    }

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