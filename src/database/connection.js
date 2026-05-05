// Database connection with retry logic
const mongoose = require('mongoose');
const retry = require('async-retry');

const connectWithRetry = () => {
  console.log('MongoDB connection with retry');
  return retry(async bail => {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }, {
    retries: 5,
    minTimeout: 1000,
  });
};

module.exports = connectWithRetry;