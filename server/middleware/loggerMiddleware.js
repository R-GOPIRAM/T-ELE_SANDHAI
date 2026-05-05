const logger = require('../utils/logger');

const loggerMiddleware = (req, res, next) => {
    // Record start time to calculate latency
    const start = Date.now();

    // Attach listener to response finish event to capture final status
    res.on('finish', () => {
        const duration = Date.now() - start;
        const logData = {
            method: req.method,
            url: req.originalUrl || req.url,
            status: res.statusCode,
            durationMs: duration,
            ip: req.socket.remoteAddress || req.ip,
            userAgent: req.get('user-agent') || 'unknown',
            user: req.user ? req.user.id : 'unauthenticated'
        };

        // Suppress healthy health checks to avoid log pollution
        if (logData.url.includes('/api/health') && res.statusCode === 200) {
            return;
        }

        if (res.statusCode >= 500) {
            logger.error(`[API ERROR] ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`, logData);
        } else if (res.statusCode >= 400) {
            logger.warn(`[API WARN] ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`, logData);
        } else {
            logger.info(`[API INFO] ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`, logData);
        }
    });

    next();
};

module.exports = loggerMiddleware;
