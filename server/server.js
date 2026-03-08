const express = require('express');
const cors = require('cors');

// process.on('uncaughtException', err => {
//   console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
//   console.log(err.name, err.message);
//   process.exit(1);
// });
const path = require('path');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// --- Inline Security Middlewares ---

// XSS Sanitization
const cleanXss = (data) => {
  if (typeof data === 'string') return data.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  if (Array.isArray(data)) return data.map(cleanXss);
  if (typeof data === 'object' && data !== null) {
    Object.keys(data).forEach(key => { data[key] = cleanXss(data[key]); });
  }
  return data;
};
const xssMiddleware = (req, res, next) => {
  if (req.body) req.body = cleanXss(req.body);
  if (req.query) req.query = cleanXss(req.query);
  if (req.params) req.params = cleanXss(req.params);
  next();
};

// NoSQL Injection Protection
const sanitizeNoSql = (obj) => {
  if (obj instanceof Object) {
    for (const key in obj) {
      if (key.startsWith('$')) delete obj[key];
      else sanitizeNoSql(obj[key]);
    }
  }
};
const mongoSanitizeMiddleware = (req, res, next) => {
  if (req.body) sanitizeNoSql(req.body);
  if (req.query) sanitizeNoSql(req.query);
  if (req.params) sanitizeNoSql(req.params);
  next();
};

// HTTP Parameter Pollution Protection
const hppMiddleware = (req, res, next) => {
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (Array.isArray(req.query[key])) req.query[key] = req.query[key][req.query[key].length - 1];
    });
  }
  next();
};

const { validateEnv } = require('./config/config');

// Ensure required environment variables are set
validateEnv();

const connectDB = require('./config/database');
const logger = require('./utils/logger');
const loggerMiddleware = require('./middleware/loggerMiddleware');
const globalErrorHandler = require('./middleware/errorMiddleware');
const AppError = require('./utils/AppError');

// Initialize Express
const app = express();

// Database Connection (Only connect if not in test env)
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://checkout.razorpay.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:", "https://res.cloudinary.com"], // Add any external image CDNs here if needed
      connectSrc: ["'self'", "https://api.razorpay.com"],
      frameSrc: ["'self'", "https://checkout.razorpay.com"]
    },
  },
  xssFilter: true, // Enables X-XSS-Protection
  frameguard: {
    action: 'deny' // Strictly prevents clickjacking by denying all framing
  }
}));
const corsOptions = require('./config/cors');
app.use(cors(corsOptions));

// Rate Limiting
const { apiLimiter, authLimiter } = require('./middleware/rateLimiter');
app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter); // Stricter limit for auth routes

// Body Parsers & Cookie Parser
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitizeMiddleware);

// Data sanitization against XSS
app.use(xssMiddleware);

// Prevent parameter pollution
app.use(hppMiddleware);

// Logger Middleware
app.use(loggerMiddleware);

// Static Files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, '..', 'dist')));

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/products', require('./routes/product.routes'));
app.use('/api/orders', require('./routes/order.routes'));
app.use('/api/bargain', require('./routes/bargain.routes'));
app.use('/api/sellers', require('./routes/seller.routes'));
app.use('/api/reviews', require('./routes/review.routes'));
app.use('/api/wishlist', require('./routes/wishlist.routes'));
app.use('/api/payment', require('./routes/payment.routes'));
app.use('/api/analytics', require('./routes/analytics.routes'));
app.use('/api/cart', require('./routes/cart.routes'));
app.use('/api/shipping', require('./routes/shipping.routes'));
app.use('/api/admin', require('./routes/admin.routes'));

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Tele Sandhai API is healthy',
    timestamp: new Date().toISOString()
  });
});

// 404 Handler
app.all(/(.*)/, (req, res, next) => {
  // If request is for API, return JSON error
  if (req.originalUrl.startsWith('/api')) {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
  } else {
    // Otherwise serve React app
    res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }
});

app.use(globalErrorHandler);

// Export app instead of listening to allow Supertest to bind natively
module.exports = app;
