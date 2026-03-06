const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}.`;
    return new AppError(message, 400);
};

const handleDuplicateFieldsDB = err => {
    // Handle both new (keyValue) and old (errmsg) Mongoose error formats
    const value = err.keyValue
        ? Object.values(err.keyValue)[0]
        : err.errmsg.match(/(["'])(\\?.)*?\1/)[0];

    const message = `Duplicate field value: ${value}. Please use another value!`;
    return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400);
};

const handleJWTError = () => new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () => new AppError('Your token has expired! Please log in again.', 401);

const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        success: false,
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    });
};

const sendErrorProd = (err, req, res) => {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            success: false,
            status: err.status,
            message: err.message
        });
    }
    // Programming or other unknown error: don't leak error details
    else {
        // 1) Log error explicitly with stack trace for Winston
        logger.error(`[UNHANDLED SERVER ERROR] 💥 ${err.message}`, {
            errorName: err.name,
            stack: err.stack,
            path: req.originalUrl,
            userId: req.user ? req.user.id : 'unauthenticated',
            method: req.method,
            ip: req.ip
        });

        // 2) Send generic message
        res.status(500).json({
            success: false,
            status: 'error',
            message: 'Something went very wrong! Please try again later.'
        });
    }
};

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    } else {
        // Create a copy of the error to avoid modifying the original if needed, 
        // but ensure we carry over message and name which don't spread well
        let error = Object.create(err);
        error.message = err.message;
        error.name = err.name;
        error.code = err.code;
        error.statusCode = err.statusCode;
        error.status = err.status;
        error.isOperational = err.isOperational;

        // Handling Mongoose Errors
        if (error.name === 'CastError') error = handleCastErrorDB(error);
        if (error.code === 11000) error = handleDuplicateFieldsDB(error);
        if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
        if (error.name === 'JsonWebTokenError') error = handleJWTError();
        if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

        sendErrorProd(error, req, res);
    }
};
