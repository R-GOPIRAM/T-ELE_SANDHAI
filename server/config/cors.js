const cors = require("cors");

const allowedOrigins = [
    "http://localhost:5173",
    "https://inspirathon-beta.vercel.app"
];

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true
};

module.exports = corsOptions;