import dotenv from "dotenv";
dotenv.config();

import express from "express"
import cors from "cors"
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
import { generalLimiter, authLimiter } from "./middlewares/rateLimiter.js";

connectDB();

const app = express();
app.set("etag", false);
app.set("trust proxy", 1);
registerEmailListeners();
const clientUrls = process.env.CLIENT_URL ;
const allowedOrigins = clientUrls.split(",").map((url) => url.trim().replace(/\/+$/, ""));

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    const formattedOrigin = origin.replace(/\/+$/, "");
    if (allowedOrigins.includes(formattedOrigin) || allowedOrigins.includes("*") || formattedOrigin.endsWith(".vercel.app")) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie", "X-Requested-With"],
}));

app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Food Delivery API is running",
  });
});

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/restaurants", generalLimiter, restaurantRoutes);
app.use("/api/menu",generalLimiter, menuItemRoutes);
app.use("/api/orders", generalLimiter, orderRoutes);
app.use("/api/admin", generalLimiter, adminRoutes);
app.use("/api/addresses", generalLimiter, addressRoutes);


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
