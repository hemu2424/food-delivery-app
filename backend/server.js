import "dotenv/config";

import express from "express"
import cors from "cors"
import compression from "compression"
import helmet from "helmet"
import cookieParser from "cookie-parser"
import connectDB from "./config/db.js"
import authRoutes from "./routes/authRoutes.js"
import restaurantRoutes from "./routes/restaurantRoutes.js"
import menuItemRoutes from "./routes/menuItemRoutes.js"
import orderRoutes from "./routes/orderRoutes.js"
import adminRoutes from "./routes/adminRoutes.js"
import addressRoutes from "./routes/addressRoute.js"
import registerEmailListeners from "./events/emailEvents.js"
import { createServer } from "http"
import {Server} from "socket.io"
import { initSocket } from "./socket/socket.js"
import { generalLimiter } from "./middlewares/rateLimiter.js";
import { razorpayWebhookHandler } from "./controllers/orderController.js";

connectDB();

const app = express();
app.set("trust proxy", 1);
registerEmailListeners();
const clientUrls = process.env.CLIENT_URL || "http://localhost:3000,http://localhost:3001,http://localhost:3002";
const allowedOrigins = clientUrls.split(",").map((url) => url.trim().replace(/\/+$/, ""));

app.use(helmet());
app.use(compression());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const formattedOrigin = origin.replace(/\/+$/, "");
    if (allowedOrigins.includes(formattedOrigin) || allowedOrigins.includes("*")) {
      return callback(null, true);
    }
    const corsError = new Error(`CORS blocked for origin: ${origin}`);
    corsError.status = 403;
    return callback(corsError);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie", "X-Requested-With"],
}));

// Webhook route MUST come before express.json() — Razorpay's signature is computed
// over the raw request body, and express.json() would consume/reparse it first.
app.post(
  "/api/orders/webhook/razorpay",
  express.raw({ type: "application/json" }),
  razorpayWebhookHandler
);

app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Food Delivery API is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/restaurants", generalLimiter, restaurantRoutes);
app.use("/api/menu",generalLimiter, menuItemRoutes);
app.use("/api/orders", generalLimiter, orderRoutes);
app.use("/api/admin", generalLimiter, adminRoutes);
app.use("/api/addresses", generalLimiter, addressRoutes);


// ---------------------------------------------------------------------------
// Global error handler — MUST be registered after all routes.
// Turns every error passed to next(error) into a JSON response with a
// `message` field, which is what the frontend already reads.
// ---------------------------------------------------------------------------
function errorHandler(err, req, res, next) {
  // If a response has already started, hand over to Express's default handler
  if (res.headersSent) {
    return next(err);
  }

  let status = err.status || err.statusCode || 500;
  let message = err.message || "Something went wrong";

  if (err.name === "CastError") {
    // e.g. /api/orders/not-a-valid-id
    status = 400;
    message = `Invalid ${err.path || "id"}: ${err.value}`;
  } else if (err.name === "ValidationError" && err.errors) {
    // Mongoose schema validation
    status = 400;
    message = Object.values(err.errors)[0]?.message || "Validation failed";
  } else if (err.code === 11000) {
    // Duplicate key (e.g. unique email)
    status = 409;
    message = "A record with that value already exists";
  } else if (err.name === "MulterError") {
    status = 400;
    message = err.code === "LIMIT_FILE_SIZE" ? "File is too large (max 10 MB)" : err.message;
  } else if (typeof err.message === "string" && err.message.startsWith("Invalid file type")) {
    // Thrown by the fileFilter in middlewares/upload.js
    status = 400;
  } else if (err.type === "entity.parse.failed") {
    // Malformed JSON body
    status = 400;
    message = "Invalid JSON in request body";
  }

  if (status >= 500) {
    // Log the real error for you, but never expose internals to the client
    console.error("Unhandled error:", err);
    message = "Internal server error";
  }

  res.status(status).json({ message });
}

app.use(errorHandler);


const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

initSocket(io); 
console.log(process.memoryUsage());
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});