const rateLimit = require('express-rate-limit');

/**
 * Brute-force protection for login APIs
 * Limit each IP to 5 requests per `window` (here, per minute)
 */
const loginLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // Limit each IP to 5 requests per `window`
    message: {
        success: false,
        message: 'Too many login attempts from this IP, please try again after 60 seconds.'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

module.exports = loginLimiter;
