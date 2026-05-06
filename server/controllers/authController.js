const AuthService = require('../services/authService');
const catchAsync = require('../utils/catchAsync');
const { sendResponse } = require('../utils/response');

// 🔥 Cookie config (production-safe)
// Notes:
// - Do not set `domain` (breaks across preview/custom domains).
// - `SameSite=None` is needed if you ever serve cookies cross-site.
// - `Secure` must be true when SameSite=None; we set it dynamically for local HTTP dev.
const COOKIE_OPTIONS_BASE = {
    httpOnly: true,
    path: "/",
};

// ==========================
// 🔐 SEND TOKEN RESPONSE
// ==========================
const sendTokenResponse = (req, user, accessToken, refreshToken, res) => {
    const isSecureContext =
        process.env.NODE_ENV === 'production' ? true : Boolean(req.secure);

    const COOKIE_OPTIONS = {
        ...COOKIE_OPTIONS_BASE,
        secure: isSecureContext,
        sameSite: isSecureContext ? 'None' : 'Lax',
    };

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

    sendTokenResponse(req, user, accessToken, refreshToken, res);
});

// ==========================
// REGISTER SELLER
// ==========================
exports.registerSeller = catchAsync(async (req, res) => {
    const { user, accessToken, refreshToken } =
        await AuthService.registerSeller(req.body);

    sendTokenResponse(req, user, accessToken, refreshToken, res);
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

    sendTokenResponse(req, user, accessToken, refreshToken, res);
});

// ==========================
// LOGIN
// ==========================
exports.login = catchAsync(async (req, res) => {
    const { email, password } = req.body;
    const ip = req.ip || req.connection.remoteAddress;

    const { user, accessToken, refreshToken } =
        await AuthService.login(email, password, ip);

    sendTokenResponse(req, user, accessToken, refreshToken, res);
});

// ==========================
// LOGOUT
// ==========================
exports.logout = catchAsync(async (req, res) => {

    await AuthService.logout(req.user.id);

    const isSecureContext =
        process.env.NODE_ENV === 'production' ? true : Boolean(req.secure);

    // 🔥 Must match cookie options exactly
    res.clearCookie("accessToken", {
        ...COOKIE_OPTIONS_BASE,
        secure: isSecureContext,
        sameSite: isSecureContext ? 'None' : 'Lax',
    });
    res.clearCookie("refreshToken", {
        ...COOKIE_OPTIONS_BASE,
        secure: isSecureContext,
        sameSite: isSecureContext ? 'None' : 'Lax',
    });

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

    sendTokenResponse(req, user, accessToken, newRefreshToken, res);
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
