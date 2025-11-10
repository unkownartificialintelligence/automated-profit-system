/**
 * In-Memory Caching Middleware
 * Caches responses for frequently accessed endpoints
 */

import logger from '../utils/logger.js';

// Simple in-memory cache store
const cache = new Map();

// Cache configuration
const DEFAULT_TTL = 60 * 1000; // 1 minute default TTL

/**
 * Cache statistics
 */
export const cacheStats = {
  hits: 0,
  misses: 0,
  size: () => cache.size,
  hitRate: function() {
    const total = this.hits + this.misses;
    return total === 0 ? 0 : ((this.hits / total) * 100).toFixed(2);
  },
  reset: function() {
    this.hits = 0;
    this.misses = 0;
    cache.clear();
  }
};

/**
 * Create cache key from request
 */
function createCacheKey(req) {
  return `${req.method}:${req.originalUrl || req.url}`;
}

/**
 * Cache middleware factory
 * @param {number} ttl - Time to live in milliseconds
 * @param {function} shouldCache - Optional function to determine if response should be cached
 */
export function cacheMiddleware(ttl = DEFAULT_TTL, shouldCache = null) {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = createCacheKey(req);
    const cachedResponse = cache.get(key);

    // Check if we have a valid cached response
    if (cachedResponse && cachedResponse.expiresAt > Date.now()) {
      cacheStats.hits++;

      logger.debug('Cache hit', {
        key,
        age: Date.now() - cachedResponse.timestamp,
        ttl
      });

      // Set cache headers
      res.setHeader('X-Cache', 'HIT');
      res.setHeader('X-Cache-Age', Math.floor((Date.now() - cachedResponse.timestamp) / 1000));

      return res.status(cachedResponse.status).json(cachedResponse.data);
    }

    // Cache miss - intercept response
    cacheStats.misses++;

    // Store original res.json
    const originalJson = res.json.bind(res);

    res.json = function(data) {
      // Check if we should cache this response
      const statusCode = res.statusCode || 200;
      const shouldCacheResponse = shouldCache ? shouldCache(req, res, data) : (statusCode >= 200 && statusCode < 300);

      if (shouldCacheResponse) {
        const timestamp = Date.now();
        cache.set(key, {
          data,
          status: statusCode,
          timestamp,
          expiresAt: timestamp + ttl
        });

        logger.debug('Cache set', {
          key,
          status: statusCode,
          ttl,
          cacheSize: cache.size
        });

        res.setHeader('X-Cache', 'MISS');
      } else {
        res.setHeader('X-Cache', 'SKIP');
      }

      return originalJson(data);
    };

    next();
  };
}

/**
 * Clear cache for specific key pattern
 */
export function clearCache(pattern = null) {
  if (!pattern) {
    cache.clear();
    logger.info('Cache cleared completely');
    return cache.size;
  }

  let cleared = 0;
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
      cleared++;
    }
  }

  logger.info('Cache cleared', { pattern, entriesCleared: cleared });
  return cleared;
}

/**
 * Cache cleanup - remove expired entries
 */
export function cleanupCache() {
  const now = Date.now();
  let cleaned = 0;

  for (const [key, value] of cache.entries()) {
    if (value.expiresAt < now) {
      cache.delete(key);
      cleaned++;
    }
  }

  if (cleaned > 0) {
    logger.debug('Cache cleanup', { entriesRemoved: cleaned, cacheSize: cache.size });
  }

  return cleaned;
}

/**
 * Start automatic cache cleanup
 */
export function startCacheCleanup(intervalMs = 60000) {
  setInterval(() => {
    cleanupCache();
  }, intervalMs);

  logger.info('Cache cleanup scheduled', { intervalMs });
}

/**
 * Get cache statistics endpoint handler
 */
export function getCacheStats(req, res) {
  res.json({
    success: true,
    cache: {
      hits: cacheStats.hits,
      misses: cacheStats.misses,
      size: cacheStats.size(),
      hitRate: cacheStats.hitRate() + '%'
    }
  });
}

export default cacheMiddleware;
