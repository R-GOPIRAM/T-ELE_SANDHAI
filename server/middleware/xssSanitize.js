const escapeHtml = (value) => {
    if (typeof value !== 'string') return value;
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
};

const sanitizeDeep = (input) => {
    if (input == null) return input;
    if (typeof input === 'string') return escapeHtml(input);
    if (Array.isArray(input)) return input.map(sanitizeDeep);
    if (typeof input !== 'object') return input;

    Object.keys(input).forEach((key) => {
        input[key] = sanitizeDeep(input[key]);
    });
    return input;
};

module.exports = (req, res, next) => {
    try {
        if (req.body) req.body = sanitizeDeep(req.body);
        if (req.query) req.query = sanitizeDeep(req.query);
        if (req.params) req.params = sanitizeDeep(req.params);
    } catch (e) {
        // best-effort sanitization; never block the request here
    }
    next();
};

