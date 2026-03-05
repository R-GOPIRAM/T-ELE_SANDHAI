const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tele-sandhai', {
      // These options are no longer needed in Mongoose 6+, but keeping for safety if older version
    });
    logger.info(`MongoDB Connected: ${conn.connection.host}`);

    // Enable mongoose debug logging to physically print executing index queries
    if (process.env.NODE_ENV === 'development') {
      mongoose.set('debug', true);
      logger.info('Mongoose query debugging enabled for performance verification.');
    }
  } catch (error) {
    logger.error('Database connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;