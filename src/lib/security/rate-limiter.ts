import { Redis } from '@upstash/redis';
import { RATE_LIMITS, CLEANUP_INTERVALS } from './rate-limit-config';

// Redis client configuration - uses environment variables
// For local development without Redis, falls back to in-memory store
let redis: Redis | null = null;

const getRedisClient = (): Redis | null => {
  if (redis) return redis;
  
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  
  if (redisUrl && redisToken) {
    redis = new Redis({
      url: redisUrl,
      token: redisToken,
    });
    return redis;
  }
  
  return null;
};

// In-memory fallback for development
interface MemoryStore {
  [key: string]: {
    count: number;
    resetTime: number;
    windowSeconds: number;
  };
}

const memoryStore: MemoryStore = {};

// Rate limit result
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  totalHits: number;
}

// Sliding window rate limiter
export const checkRateLimit = async (
  key: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> => {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const redisClient = getRedisClient();

  if (redisClient) {
    try {
      // Use sliding window with sorted set
      const redisKey = `ratelimit:${key}`;
      
      // Remove old entries outside the window
      await redisClient.zremrangebyscore(redisKey, 0, now - windowMs);
      
      // Count current requests in window
      const count = await redisClient.zcard(redisKey);
      
      if (count >= limit) {
        // Get oldest entry to calculate reset time
        const oldest = await redisClient.zrange(redisKey, 0, 0, 'WITHSCORES');
        const resetTime = oldest.length > 1 
          ? parseInt(oldest[1]) + windowMs
          : now + windowMs;
        
        return {
          allowed: false,
          remaining: 0,
          resetTime,
          totalHits: count,
        };
      }
      
      // Add current request
      await redisClient.zadd(redisKey, { score: now, member: `${now}:${Math.random()}` });
      await redisClient.expire(redisKey, windowSeconds);
      
      return {
        allowed: true,
        remaining: limit - count - 1,
        resetTime: now + windowMs,
        totalHits: count + 1,
      };
    } catch (error) {
      console.error('Redis rate limit error:', error);
      // Fall through to memory store
    }
  }

  // In-memory fallback
  const memKey = `${key}:${Math.floor(now / windowMs)}`;
  const existing = memoryStore[memKey];
  
  if (existing) {
    existing.count++;
    
    if (existing.count > limit) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: existing.resetTime,
        totalHits: existing.count,
      };
    }
    
    return {
      allowed: true,
      remaining: limit - existing.count,
      resetTime: existing.resetTime,
      totalHits: existing.count,
    };
  }
  
  memoryStore[memKey] = {
    count: 1,
    resetTime: now + windowMs,
    windowSeconds,
  };
  
  // Cleanup old entries periodically
  cleanupMemoryStore();
  
  return {
    allowed: true,
    remaining: limit - 1,
    resetTime: now + windowMs,
    totalHits: 1,
  };
};

// Clean up old memory store entries
const cleanupMemoryStore = () => {
  const now = Date.now();
  const windowMs = CLEANUP_INTERVALS.RATE_LIMIT_WINDOW * 1000;
  
  Object.keys(memoryStore).forEach(key => {
    const entry = memoryStore[key];
    if (entry.resetTime < now - windowMs) {
      delete memoryStore[key];
    }
  });
};

// Clear rate limit for a specific key (for testing or admin)
export const clearRateLimit = async (key: string): Promise<void> => {
  const redisClient = getRedisClient();
  
  if (redisClient) {
    await redisClient.del(`ratelimit:${key}`);
  } else {
    Object.keys(memoryStore)
      .filter(k => k.startsWith(key))
      .forEach(k => delete memoryStore[k]);
  }
};

// Get current rate limit status without incrementing
export const getRateLimitStatus = async (
  key: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> => {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const redisClient = getRedisClient();
  
  if (redisClient) {
    try {
      const redisKey = `ratelimit:${key}`;
      await redisClient.zremrangebyscore(redisKey, 0, now - windowMs);
      const count = await redisClient.zcard(redisKey);
      
      return {
        allowed: count < limit,
        remaining: Math.max(0, limit - count),
        resetTime: now + windowMs,
        totalHits: count,
      };
    } catch {
      // Fall through to memory
    }
  }
  
  const memKey = `${key}:${Math.floor(now / windowMs)}`;
  const existing = memoryStore[memKey];
  
  if (existing) {
    return {
      allowed: existing.count < limit,
      remaining: Math.max(0, limit - existing.count),
      resetTime: existing.resetTime,
      totalHits: existing.count,
    };
  }
  
  return {
    allowed: true,
    remaining: limit,
    resetTime: now + windowMs,
    totalHits: 0,
  };
};
