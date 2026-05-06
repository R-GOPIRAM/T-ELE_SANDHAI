const logger = require('../utils/logger');

/**
 * Auth debug middleware (opt-in).
 * Logs request cookie presence + origin/proto to diagnose cross-site cookie issues.
 * Never logs token values.
 */
module.exports = function authDebugMiddleware(req, res, next) {
  if (process.env.AUTH_DEBUG !== 'true') return next();

  const hasAccess = Boolean(req.cookies?.accessToken);
  const hasRefresh = Boolean(req.cookies?.refreshToken);

  logger.info('AUTH_DEBUG request', {
    method: req.method,
    path: req.originalUrl,
    origin: req.headers.origin,
    host: req.headers.host,
    forwardedProto: req.headers['x-forwarded-proto'],
    secure: req.secure,
    hasAccess,
    hasRefresh,
  });

  next();
};

