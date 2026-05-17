const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const AppError = require('../utils/AppError');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '..', 'uploads', 'product-images');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const uniqueId = crypto.randomUUID();
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `product-${uniqueId}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) return cb(null, true);
  return cb(new AppError('Invalid file type. Only JPEG, PNG, and WebP images are allowed.', 400), false);
};

const productImageUpload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter,
});

module.exports = productImageUpload;

