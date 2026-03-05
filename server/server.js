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
app.use(helmet());
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
