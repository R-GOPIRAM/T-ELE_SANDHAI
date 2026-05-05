const cors = require("cors");

const allowedOrigins = [
  "http://localhost:5173",
  "https://inspirathon-beta.vercel.app",
];

const corsOptions = {
  origin: (origin, callback) => {
    // 🔥 Allow requests with no origin (Postman, mobile apps)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.log("❌ CORS blocked:", origin); // helpful debug
    return callback(new Error("Not allowed by CORS"));
  },

  credentials: true, // 🔥 REQUIRED for cookies

  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],

  allowedHeaders: ["Content-Type", "Authorization"],
};

module.exports = corsOptions;