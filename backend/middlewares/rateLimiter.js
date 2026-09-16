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


 const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 10, 
  standardHeaders: true, 
  legacyHeaders: false,

  
  skip: (req) => req.method === "OPTIONS",
  message: {
    success: false,
    message: "Too many login attempts. Please try again after 15 minutes.",
  },
});

export { generalLimiter, authLimiter };