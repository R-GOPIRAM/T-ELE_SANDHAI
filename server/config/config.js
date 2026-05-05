/**
 * Environment configuration and validation
 */

const validateEnv = () => {
    const requiredEnv = [
        'JWT_SECRET',
        'JWT_REFRESH_SECRET'
    ];

    const missingEnv = requiredEnv.filter(env => !process.env[env]);

    if (missingEnv.length > 0) {
        if (process.env.NODE_ENV === 'test') {
            return; // Skip strict check in tests
        }
        console.error('\x1b[31m%s\x1b[0m', 'CRITICAL ERROR: Missing required environment variables:');
        missingEnv.forEach(env => {
            console.error('\x1b[31m%s\x1b[0m', ` - ${env}`);
        });
        console.error('\x1b[33m%s\x1b[0m', 'Please ensure these are defined in your .env file.');

        // In production, we must exit to prevent running in an insecure state
        if (process.env.NODE_ENV === 'production') {
            process.exit(1);
        } else {
            console.warn('\x1b[33m%s\x1b[0m', 'Warning: Proceeding in development mode without required secrets. This is UNSAFE.');
            // Even in development, if the user requested strict requirement, we should probably throw
            throw new Error(`Missing environment variables: ${missingEnv.join(', ')}`);
        }
    }
};

module.exports = { validateEnv };
