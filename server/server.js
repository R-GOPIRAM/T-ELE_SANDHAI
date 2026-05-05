const express = require("express");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const hpp = require("hpp");

// Load env variables only in development
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// --- Security Middlewares ---
const mongoSanitizeMiddleware = require("./middleware/mongoSanitize");
const xssMiddleware = require("./middleware/xssSanitize");

const { validateEnv } = require("./config/config");
const connectDB = require("./config/database");
const loggerMiddleware = require("./middleware/loggerMiddleware");
const globalErrorHandler = require("./middleware/errorMiddleware");
const AppError = require("./utils/AppError");

// Validate required env variables
validateEnv();

// Initialize app
const app = express();

// Connect DB
if (process.env.NODE_ENV !== "test") {
  connectDB();
}

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://checkout.razorpay.com",
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://fonts.googleapis.com",
        ],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: [
          "'self'",
          "data:",
          "blob:",
          "https://res.cloudinary.com",
        ],
        connectSrc: ["'self'", "https://api.razorpay.com","https://inspirathon.onrender.com"],
        frameSrc: ["'self'", "https://checkout.razorpay.com"],
      },
    },
    frameguard: { action: "deny" },
  })
);

// CORS
const corsOptions = require("./config/cors");
app.use(cors(corsOptions));

// Rate limiting
const { apiLimiter, authLimiter } = require("./middleware/rateLimiter");
app.use("/api", apiLimiter);
app.use("/api/auth", authLimiter);

// Body parsers
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

// Data sanitization
app.use(mongoSanitizeMiddleware);
app.use(xssMiddleware);
app.use(hpp());

// Logger
app.use(loggerMiddleware);

/* ================================
ROOT ROUTE (for Render health)
================================ */
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Inspirathon API running 🚀",
  });
});

// Static files
const clientBuildPath = path.join(__dirname, "..", "dist");

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

if (process.env.NODE_ENV === "production") {
  app.use(express.static(clientBuildPath));
}

// Routes (both versioned and unversioned for backwards compatibility)
const apiRouter = require("./routes");
app.use("/api", apiRouter);
app.use("/api/v1", apiRouter);

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Tele Sandhai API is healthy",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.all(/(.*)/, (req, res, next) => {
  if (req.originalUrl.startsWith("/api")) {
    return next(
      new AppError(`Can't find ${req.originalUrl} on this server!`, 404)
    );
  }

  if (process.env.NODE_ENV === "production") {
    return res.sendFile(path.join(clientBuildPath, "index.html"));
  }

  next(new AppError("Route not found", 404));
});

// Global error handler
app.use(globalErrorHandler);

// Export app
module.exports = app;
