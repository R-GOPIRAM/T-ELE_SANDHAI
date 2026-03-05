/**
 * Recursively removes any keys starting with '$' from an object.
 */
function clean(obj) {
    if (obj && typeof obj === 'object') {
        Object.keys(obj).forEach(key => {
            if (key.startsWith('$')) {
                // console.log(`Deleting malicious key: ${key}`);
                delete obj[key];
            } else if (obj[key] && typeof obj[key] === 'object') {
                clean(obj[key]);
            }
        });
    }
    return obj;
}

const mongoSanitize = (req, res, next) => {
    // console.log('DEBUG: mongoSanitize Enter', req.method, req.url);
    try {
        if (req.body) clean(req.body);
        if (req.query) clean(req.query);
        if (req.params) clean(req.params);
    } catch (err) {
        // console.error('DEBUG: mongoSanitize Error:', err);
    }
    // console.log('DEBUG: mongoSanitize complete, calling next()');
    next();
};

module.exports = mongoSanitize;
