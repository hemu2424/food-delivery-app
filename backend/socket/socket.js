import jwt from "jsonwebtoken";
import { Users } from "../models/Users.js";

let ioInstance = null; 


function parseTokenFromCookieHeader(cookieHeader) {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";").reduce((acc, pair) => {
    const [key, ...valueParts] = pair.trim().split("=");
    if (key) acc[key.trim()] = decodeURIComponent(valueParts.join("="));
    return acc;
  }, {});

  return cookies.token || null;
}

function initSocket(io) {
  ioInstance = io;

  io.use(async (socket, next) => {
    try {
      const rawCookies = socket.handshake.headers.cookie;
      let token = parseTokenFromCookieHeader(rawCookies);

      if (!token && socket.handshake.auth?.token) {
        token = socket.handshake.auth.token;
      }

      if (!token && socket.handshake.headers.authorization && socket.handshake.headers.authorization.startsWith("Bearer ")) {
        token = socket.handshake.headers.authorization.split(" ")[1];
      }

      if (!token) {
        return next(new Error("Not authorized — no token found"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await Users.findById(decoded.id).select("-password");

      if (!user || user.isBlocked || !user.isEmailVerified) {
        return next(new Error("Not authorized"));
      }

      socket.user = user;
      next();
    } catch (error) {
      console.error("Socket auth error:", error.message);
      next(new Error("Not authorized — invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.user.name} (${socket.user.role})`);

    const userIdStr = socket.user._id.toString();
    socket.join(`user:${userIdStr}`);

    if (socket.user.role === "admin") {
      socket.join("admins");
    }

    if (socket.user.role === "delivery") {
      socket.join("delivery");
    }

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.user.name}`);
    });
  });
}

function getIO() {
  if (!ioInstance) {
    throw new Error("Socket.io not initialized yet");
  }
  return ioInstance;
}

export { initSocket, getIO };