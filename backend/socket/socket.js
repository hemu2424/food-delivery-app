import jwt from "jsonwebtoken";
import { Users } from "../models/Users.js";

let ioInstance = null; 


function parseTokenFromCookieHeader(cookieHeader) {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";").reduce((acc, pair) => {
    const [key, ...valueParts] = pair.trim().split("=");
    acc[key] = decodeURIComponent(valueParts.join("="));
    return acc;
  }, {});

  return cookies.token || null;
}

function initSocket(io) {
  ioInstance = io;

 io.use(async (socket, next) => {
  try {
    console.log("1")
    const rawCookies = socket.handshake.headers.cookie;
    const token = parseTokenFromCookieHeader(rawCookies);
    console.log("2")

    if (!token) {
      return next(new Error("Not authorized — no token found"));
    }
    console.log("3")

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await Users.findById(decoded.id).select("-password");
    console.log("4")

    if (!user || user.isBlocked) {
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

   
    socket.join(`user:${socket.user._id}`);

    
    if (socket.user.role === "admin") {
      socket.join("admins");
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