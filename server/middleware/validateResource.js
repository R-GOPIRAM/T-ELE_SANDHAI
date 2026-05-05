const AppError = require('../utils/AppError');

const validate = (schema) => (req, res, next) => {
    try {
        schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        next();
    } catch (e) {
        const errorMessage = e.errors
            ? e.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')
            : e.message || 'Unknown Validation Error';
        return next(new AppError(errorMessage, 400));
    }
};

module.exports = validate;
