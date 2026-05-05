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

// Trust first proxy (Render/load balancers) so `req.ip` and `req.secure` are correct.
app.set("trust proxy", 1);

// Connect DB
if (process.env.NODE_ENV !== "test") {
  connectDB();
}

// ==========================
// 🔐 SECURITY HEADERS (HELMET)
// ==========================
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
        connectSrc: [
          "'self'",
          "https://api.razorpay.com",
          "https://inspirathon.onrender.com", // 🔥 IMPORTANT
        ],
        frameSrc: ["'self'", "https://checkout.razorpay.com"],
      },
    },
    frameguard: { action: "deny" },
  })
);

// ==========================
// 🌐 CORS (FIRST)
// ==========================
const corsOptions = require("./config/cors");

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // 🔥 allow preflight

// ==========================
// 📦 BODY PARSERS (SECOND)
// ==========================
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

// ==========================
// 🚫 RATE LIMIT (SKIP OPTIONS)
// ==========================
const { apiLimiter, authLimiter } = require("./middleware/rateLimiter");

app.use("/api", (req, res, next) => {
  if (req.method === "OPTIONS") return next();
  return apiLimiter(req, res, next);
});

app.use("/api/auth", (req, res, next) => {
  if (req.method === "OPTIONS") return next();
  return authLimiter(req, res, next);
});

// ==========================
// 🛡️ SANITIZATION + SECURITY
// ==========================
app.use(mongoSanitizeMiddleware);
app.use(xssMiddleware);
app.use(hpp());

// ==========================
// 🧾 LOGGER
// ==========================
app.use(loggerMiddleware);

// ==========================
// 🏠 ROOT ROUTE (Render Health)
// ==========================
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Inspirathon API running 🚀",
  });
});

// ==========================
// 📁 STATIC FILES
// ==========================
const clientBuildPath = path.join(__dirname, "..", "dist");

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

if (process.env.NODE_ENV === "production") {
  app.use(express.static(clientBuildPath));
}

// ==========================
// 🔗 ROUTES
// ==========================
const apiRouter = require("./routes");

app.use("/api", apiRouter);
app.use("/api/v1", apiRouter);

// ==========================
// ❤️ HEALTH CHECK
// ==========================
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Tele Sandhai API is healthy",
    timestamp: new Date().toISOString(),
  });
});

// ==========================
// ❌ 404 HANDLER
// ==========================
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

// ==========================
// 🔥 GLOBAL ERROR HANDLER
// ==========================
app.use(globalErrorHandler);

// ==========================
// EXPORT
// ==========================
module.exports = app;
