/**
 * Centralized API Response Formatter
 * 
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {boolean} success - Operation success status 
 * @param {string} message - Descriptive message
 * @param {any} data - Response payload (optional)
 * @param {any} error - Error details (optional)
 * @param {Object} metadata - Additional metadata like pagination (optional)
 */
const sendResponse = (res, statusCode, success, message, data = {}) => {
    return res.status(statusCode).json({
        success,
        message,
        data: data || {}
    });
};

module.exports = { sendResponse };
