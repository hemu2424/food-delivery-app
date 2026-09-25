import redis from "../config/redis.js";

const USER_CACHE_TTL_SECONDS = 60;
const userCacheKey = (userId) => `user:${userId}`;

async function getCachedUser(userId) {
  try {
    const cached = await redis.get(userCacheKey(userId));
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error("User cache read error:", error.message);
    return null; // fail open — fall back to Mongo rather than blocking the request
  }
}

async function setCachedUser(userId, userDoc) {
  try {
    await redis.set(userCacheKey(userId), JSON.stringify(userDoc), "EX", USER_CACHE_TTL_SECONDS);
  } catch (error) {
    console.error("User cache write error:", error.message);
  }
}

async function invalidateCachedUser(userId) {
  try {
    await redis.del(userCacheKey(userId));
  } catch (error) {
    console.error("User cache invalidate error:", error.message);
  }
}

export { getCachedUser, setCachedUser, invalidateCachedUser };