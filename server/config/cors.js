const cors = require("cors");

const DEFAULT_ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://inspirathon-beta.vercel.app",
];

const envOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const allowedOrigins = Array.from(
  new Set([...DEFAULT_ALLOWED_ORIGINS, ...envOrigins])
);

const isAllowedOrigin = (origin) => {
  // Allow requests with no origin (Postman, mobile apps, server-to-server).
  if (!origin) return true;

  if (allowedOrigins.includes(origin)) return true;

  // Allow Vercel preview deployments for this project.
  // Example: https://inspirathon-beta-git-main-<org>.vercel.app
  if (/^https:\/\/inspirathon-beta(-[a-z0-9-]+)?\.vercel\.app$/i.test(origin)) {
    return true;
  }

  return false;
};

const corsOptions = {
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) return callback(null, true);

    console.log("CORS blocked:", origin);
    return callback(new Error("Not allowed by CORS"));
  },

  credentials: true,

  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],

  // Frontend sends geo headers; missing them causes preflight failures.
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "x-user-latitude",
    "x-user-longitude",
    "x-user-pincode",
  ],
};

module.exports = corsOptions;

