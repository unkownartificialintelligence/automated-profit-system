/**
 * Performance Monitoring Middleware
 * Tracks response times and identifies slow endpoints
 */

import logger from '../utils/logger.js';

// Performance metrics storage
const metrics = {
  requests: {
    total: 0,
    byEndpoint: new Map(),
    byMethod: new Map()
  },
  responseTimes: {
    total: 0,
    count: 0,
    min: Infinity,
    max: 0,
    byEndpoint: new Map()
  },
  slowRequests: []
};

// Threshold for slow request warning (in milliseconds)
const SLOW_REQUEST_THRESHOLD = 200;

/**
 * Performance monitoring middleware
 */
export function performanceMonitoring(req, res, next) {
  const startTime = process.hrtime.bigint();
  const startMemory = process.memoryUsage().heapUsed;

  // Track request
  metrics.requests.total++;

  // Track by method
  const methodCount = metrics.requests.byMethod.get(req.method) || 0;
  metrics.requests.byMethod.set(req.method, methodCount + 1);

  // Intercept response finish
  const originalEnd = res.end;
  res.end = function(...args) {
    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - startTime) / 1_000_000; // Convert to milliseconds
    const endMemory = process.memoryUsage().heapUsed;
    const memoryDelta = endMemory - startMemory;

    // Update metrics
    updateMetrics(req, res, duration, memoryDelta);

    // Log slow requests
    if (duration > SLOW_REQUEST_THRESHOLD) {
      logger.warn('Slow request detected', {
        method: req.method,
        path: req.path,
        duration: `${duration.toFixed(2)}ms`,
        statusCode: res.statusCode,
        memoryDelta: formatBytes(memoryDelta),
        requestId: req.id
      });

      // Keep track of slow requests (max 100)
      metrics.slowRequests.push({
        timestamp: Date.now(),
        method: req.method,
        path: req.path,
        duration: duration.toFixed(2),
        statusCode: res.statusCode
      });

      if (metrics.slowRequests.length > 100) {
        metrics.slowRequests.shift();
      }
    }

    // Add performance header
    res.setHeader('X-Response-Time', `${duration.toFixed(2)}ms`);

    return originalEnd.apply(res, args);
  };

  next();
}

/**
 * Update performance metrics
 */
function updateMetrics(req, res, duration, memoryDelta) {
  const endpoint = `${req.method} ${req.route?.path || req.path}`;

  // Update overall response times
  metrics.responseTimes.total += duration;
  metrics.responseTimes.count++;
  metrics.responseTimes.min = Math.min(metrics.responseTimes.min, duration);
  metrics.responseTimes.max = Math.max(metrics.responseTimes.max, duration);

  // Update by endpoint
  if (!metrics.responseTimes.byEndpoint.has(endpoint)) {
    metrics.responseTimes.byEndpoint.set(endpoint, {
      total: 0,
      count: 0,
      min: Infinity,
      max: 0,
      avg: 0
    });
  }

  const endpointMetrics = metrics.responseTimes.byEndpoint.get(endpoint);
  endpointMetrics.total += duration;
  endpointMetrics.count++;
  endpointMetrics.min = Math.min(endpointMetrics.min, duration);
  endpointMetrics.max = Math.max(endpointMetrics.max, duration);
  endpointMetrics.avg = endpointMetrics.total / endpointMetrics.count;

  // Track by endpoint
  const endpointCount = metrics.requests.byEndpoint.get(endpoint) || 0;
  metrics.requests.byEndpoint.set(endpoint, endpointCount + 1);

  // Log performance data
  logger.debug('Performance', {
    endpoint,
    duration: `${duration.toFixed(2)}ms`,
    statusCode: res.statusCode,
    memoryDelta: formatBytes(memoryDelta)
  });
}

/**
 * Get performance statistics
 */
export function getPerformanceStats() {
  const avgResponseTime = metrics.responseTimes.count > 0
    ? (metrics.responseTimes.total / metrics.responseTimes.count).toFixed(2)
    : 0;

  // Get top 10 slowest endpoints
  const endpointStats = Array.from(metrics.responseTimes.byEndpoint.entries())
    .map(([endpoint, stats]) => ({
      endpoint,
      ...stats,
      avg: parseFloat(stats.avg.toFixed(2)),
      min: parseFloat(stats.min.toFixed(2)),
      max: parseFloat(stats.max.toFixed(2))
    }))
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 10);

  return {
    success: true,
    performance: {
      requests: {
        total: metrics.requests.total,
        byMethod: Object.fromEntries(metrics.requests.byMethod),
        byEndpoint: Object.fromEntries(
          Array.from(metrics.requests.byEndpoint.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
        )
      },
      responseTimes: {
        average: `${avgResponseTime}ms`,
        min: `${metrics.responseTimes.min === Infinity ? 0 : metrics.responseTimes.min.toFixed(2)}ms`,
        max: `${metrics.responseTimes.max.toFixed(2)}ms`,
        total: metrics.responseTimes.count
      },
      slowestEndpoints: endpointStats,
      recentSlowRequests: metrics.slowRequests.slice(-10).reverse()
    }
  };
}

/**
 * Performance stats endpoint handler
 */
export function performanceStatsHandler(req, res) {
  res.json(getPerformanceStats());
}

/**
 * Reset performance metrics
 */
export function resetMetrics() {
  metrics.requests.total = 0;
  metrics.requests.byEndpoint.clear();
  metrics.requests.byMethod.clear();
  metrics.responseTimes.total = 0;
  metrics.responseTimes.count = 0;
  metrics.responseTimes.min = Infinity;
  metrics.responseTimes.max = 0;
  metrics.responseTimes.byEndpoint.clear();
  metrics.slowRequests = [];

  logger.info('Performance metrics reset');
}

/**
 * Format bytes to human readable
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const sign = bytes < 0 ? '-' : '';
  bytes = Math.abs(bytes);

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${sign}${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export default performanceMonitoring;
