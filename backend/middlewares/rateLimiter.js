import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import redis from "../config/redis.js";

// General limiter for most routes — generous, just stops abuse
const generalLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redis.call(...args), // how rate-limit-redis talks to ioredis
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // 200 requests per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});

// Strict limiter specifically for auth routes — these are the ones worth protecting most
// (brute-force login attempts, OTP spam, password reset abuse)
 const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Allow reasonable attempts (e.g., 10 instead of 2 or 3)
  standardHeaders: true, // Return standard RateLimit-* headers
  legacyHeaders: false,
  // Skip OPTIONS preflight checks
  
  skip: (req) => req.method === "OPTIONS",
  message: {
    success: false,
    message: "Too many login attempts. Please try again after 15 minutes.",
  },
});

export { generalLimiter, authLimiter };