const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex'); // Ensure 32 bytes (64 hex chars)
const IV_LENGTH = 16; // AES block size

// Convert hex key to buffer if provided via env
const key = Buffer.from(ENCRYPTION_KEY, 'hex').length === 32
    ? Buffer.from(ENCRYPTION_KEY, 'hex')
    : crypto.randomBytes(32); // Fallback for dev if env is missing/invalid

exports.encrypt = (text) => {
    if (!text) return text;
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
};

exports.decrypt = (text) => {
    if (!text) return text;
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
};
