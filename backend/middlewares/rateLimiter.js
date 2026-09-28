import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import redis from "../config/redis.js";


const generalLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redis.call(...args), 
  }),
  windowMs: 15 * 60 * 1000,
  max: 200, 
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});


const isProd = process.env.NODE_ENV === "production";
const WINDOW = 15 * 60 * 1000;

const baseOptions = {
  windowMs: WINDOW,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === "OPTIONS",
};

// Login: only failed attempts count
const loginLimiter = rateLimit({
  ...baseOptions,
  limit: isProd ? 10 : 100,
  skipSuccessfulRequests: true,
  message: { success: false, message: "Too many login attempts. Try again in 15 minutes." },
});

// Guessing a code: verify-email, reset-password
const otpLimiter = rateLimit({
  ...baseOptions,
  limit: isProd ? 10 : 100,
  message: { success: false, message: "Too many code attempts. Try again in 15 minutes." },
});

// Sending emails: resend-otp, forgot-password
const emailLimiter = rateLimit({
  ...baseOptions,
  limit: isProd ? 5 : 50,
  message: { success: false, message: "Too many email requests. Try again in 15 minutes." },
});

export { generalLimiter, loginLimiter, otpLimiter, emailLimiter };

