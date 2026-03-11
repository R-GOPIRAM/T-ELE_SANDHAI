const AuthService = require('../services/authService');
const catchAsync = require('../utils/catchAsync');
const { sendResponse } = require('../utils/response');

const sendTokenResponse = (user, accessToken, refreshToken, res) => {

    const cookieOptions = {
        httpOnly: true,
        secure: true,        // required for HTTPS (Vercel + Render)
        sameSite: "none",    // allow cross-site cookies
    };

    const accessTokenOptions = {
        ...cookieOptions,
        expires: new Date(Date.now() + 15 * 60 * 1000) // 15 min
    };

    const refreshTokenOptions = {
        ...cookieOptions,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    };

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

exports.registerCustomer = catchAsync(async (req, res) => {
    const { user, accessToken, refreshToken } = await AuthService.registerCustomer(req.body);
    sendTokenResponse(user, accessToken, refreshToken, res);
});

exports.registerSeller = catchAsync(async (req, res) => {
    const { user, accessToken, refreshToken } = await AuthService.registerSeller(req.body);
    sendTokenResponse(user, accessToken, refreshToken, res);
});

exports.login = catchAsync(async (req, res) => {
    const { email, password } = req.body;
    const ip = req.ip || req.connection.remoteAddress;

    const { user, accessToken, refreshToken } =
        await AuthService.login(email, password, ip);

    sendTokenResponse(user, accessToken, refreshToken, res);
});

exports.logout = catchAsync(async (req, res) => {

    await AuthService.logout(req.user.id);

    const cookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        expires: new Date(Date.now() + 10 * 1000)
    };

    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);

    return sendResponse(res, 200, true, "Logged out successfully");
});

exports.refresh = catchAsync(async (req, res) => {

    const refreshToken = req.cookies.refreshToken;

    const { user, accessToken, newRefreshToken } =
        await AuthService.refreshAccessToken(refreshToken);

    sendTokenResponse(user, accessToken, newRefreshToken, res);
});

exports.getMe = catchAsync(async (req, res) => {

    return sendResponse(res, 200, true, "User profile fetched successfully", {
        user: req.user,
        role: req.user.role
    });

});

exports.updateProfile = catchAsync(async (req, res) => {

    const updatedUser = await AuthService.updateProfile(req.user.id, req.body);

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