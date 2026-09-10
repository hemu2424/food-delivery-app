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

connectDB();

const app = express();
registerEmailListeners();
const clientUrls = process.env.CLIENT_URLS || "http://localhost:3000,http://localhost:3001,http://localhost:3002";
const allowedOrigins = clientUrls.split(",").map((url) => url.trim());

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Food Delivery API is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/menu", menuItemRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/addresses", addressRoutes);


const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

initSocket(io); 

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
