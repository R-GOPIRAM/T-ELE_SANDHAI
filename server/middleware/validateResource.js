const validate = (schema) => (req, res, next) => {
    try {
        schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        next();
    } catch (e) {
        console.error('Validation Error:', JSON.stringify(e, null, 2));
        const errorMessage = e.errors
            ? e.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')
            : e.message || 'Unknown Validation Error';

        return res.status(400).json({
            status: 'error',
            message: errorMessage,
            error: 'Validation Error'
        });
    }
};

module.exports = validate;
