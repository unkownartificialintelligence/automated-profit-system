import { writeFileSync, readFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

/**
 * Analytics Middleware
 * Tracks API usage, performance, errors, and user behavior
 */

const ANALYTICS_DIR = join(process.cwd(), "data", "analytics");
const ANALYTICS_FILE = join(ANALYTICS_DIR, "metrics.json");
const ERROR_LOG_FILE = join(ANALYTICS_DIR, "errors.json");
const PERFORMANCE_FILE = join(ANALYTICS_DIR, "performance.json");

// Ensure analytics directory exists
if (!existsSync(ANALYTICS_DIR)) {
  mkdirSync(ANALYTICS_DIR, { recursive: true });
}

// Initialize analytics data
let analytics = {
  requests: {
    total: 0,
    by_endpoint: {},
    by_method: {},
    by_status: {},
  },
  performance: {
    average_response_time: 0,
    slowest_endpoints: [],
    fastest_endpoints: [],
  },
  errors: {
    total: 0,
    by_type: {},
    by_endpoint: {},
  },
  user_behavior: {
    most_accessed_campaigns: {},
    most_viewed_products: {},
    peak_usage_hours: {},
  },
  daily_stats: {},
};

// Load existing analytics
if (existsSync(ANALYTICS_FILE)) {
  try {
    analytics = JSON.parse(readFileSync(ANALYTICS_FILE, "utf8"));
  } catch (error) {
    console.error("Error loading analytics:", error.message);
  }
}

/**
 * Save analytics to file
 */
function saveAnalytics() {
  try {
    writeFileSync(ANALYTICS_FILE, JSON.stringify(analytics, null, 2));
  } catch (error) {
    console.error("Error saving analytics:", error.message);
  }
}

/**
 * Track API request
 */
export function trackRequest(req, res, responseTime) {
  const endpoint = req.path;
  const method = req.method;
  const status = res.statusCode;
  const hour = new Date().getHours();
  const date = new Date().toISOString().split('T')[0];

  // Total requests
  analytics.requests.total++;

  // By endpoint
  analytics.requests.by_endpoint[endpoint] = (analytics.requests.by_endpoint[endpoint] || 0) + 1;

  // By method
  analytics.requests.by_method[method] = (analytics.requests.by_method[method] || 0) + 1;

  // By status
  analytics.requests.by_status[status] = (analytics.requests.by_status[status] || 0) + 1;

  // Peak hours
  analytics.user_behavior.peak_usage_hours[hour] =
    (analytics.user_behavior.peak_usage_hours[hour] || 0) + 1;

  // Daily stats
  if (!analytics.daily_stats[date]) {
    analytics.daily_stats[date] = { requests: 0, errors: 0, avg_response_time: 0 };
  }
  analytics.daily_stats[date].requests++;

  // Track campaign access
  if (endpoint.includes('/api/marketing/')) {
    const parts = endpoint.split('/');
    const campaign = `${parts[3]}/${parts[4] || 'list'}`;
    analytics.user_behavior.most_accessed_campaigns[campaign] =
      (analytics.user_behavior.most_accessed_campaigns[campaign] || 0) + 1;
  }

  // Track product views
  if (endpoint.includes('/api/christmas/design/') || endpoint.includes('/api/christmas/marketing/')) {
    const productIndex = endpoint.split('/').pop();
    analytics.user_behavior.most_viewed_products[productIndex] =
      (analytics.user_behavior.most_viewed_products[productIndex] || 0) + 1;
  }

  // Save periodically (every 10 requests)
  if (analytics.requests.total % 10 === 0) {
    saveAnalytics();
  }
}

/**
 * Track performance
 */
export function trackPerformance(endpoint, responseTime) {
  // Update average
  const total = analytics.requests.total;
  const current = analytics.performance.average_response_time;
  analytics.performance.average_response_time =
    ((current * (total - 1)) + responseTime) / total;

  // Track slow endpoints
  const slowEntry = { endpoint, time: responseTime, timestamp: new Date().toISOString() };
  analytics.performance.slowest_endpoints.push(slowEntry);
  analytics.performance.slowest_endpoints.sort((a, b) => b.time - a.time);
  analytics.performance.slowest_endpoints = analytics.performance.slowest_endpoints.slice(0, 20);

  // Track fast endpoints
  const fastEntry = { endpoint, time: responseTime, timestamp: new Date().toISOString() };
  analytics.performance.fastest_endpoints.push(fastEntry);
  analytics.performance.fastest_endpoints.sort((a, b) => a.time - b.time);
  analytics.performance.fastest_endpoints = analytics.performance.fastest_endpoints.slice(0, 20);

  // Save performance data
  if (existsSync(PERFORMANCE_FILE)) {
    const perfData = JSON.parse(readFileSync(PERFORMANCE_FILE, "utf8"));
    perfData.measurements.push({ endpoint, time: responseTime, timestamp: new Date().toISOString() });
    perfData.measurements = perfData.measurements.slice(-1000); // Keep last 1000
    writeFileSync(PERFORMANCE_FILE, JSON.stringify(perfData, null, 2));
  } else {
    writeFileSync(PERFORMANCE_FILE, JSON.stringify({
      measurements: [{ endpoint, time: responseTime, timestamp: new Date().toISOString() }]
    }, null, 2));
  }
}

/**
 * Track error
 */
export function trackError(error, req) {
  analytics.errors.total++;

  const errorType = error.name || 'Unknown';
  const endpoint = req?.path || 'Unknown';
  const date = new Date().toISOString().split('T')[0];

  // By type
  analytics.errors.by_type[errorType] = (analytics.errors.by_type[errorType] || 0) + 1;

  // By endpoint
  analytics.errors.by_endpoint[endpoint] = (analytics.errors.by_endpoint[endpoint] || 0) + 1;

  // Daily stats
  if (analytics.daily_stats[date]) {
    analytics.daily_stats[date].errors++;
  }

  // Save error log
  const errorLog = {
    timestamp: new Date().toISOString(),
    type: errorType,
    message: error.message,
    endpoint: endpoint,
    method: req?.method,
    stack: error.stack,
  };

  let errors = [];
  if (existsSync(ERROR_LOG_FILE)) {
    errors = JSON.parse(readFileSync(ERROR_LOG_FILE, "utf8"));
  }
  errors.push(errorLog);
  errors = errors.slice(-100); // Keep last 100 errors
  writeFileSync(ERROR_LOG_FILE, JSON.stringify(errors, null, 2));

  saveAnalytics();
}

/**
 * Get analytics summary
 */
export function getAnalyticsSummary() {
  return {
    overview: {
      total_requests: analytics.requests.total,
      total_errors: analytics.errors.total,
      error_rate: analytics.requests.total > 0
        ? ((analytics.errors.total / analytics.requests.total) * 100).toFixed(2) + '%'
        : '0%',
      average_response_time: analytics.performance.average_response_time.toFixed(2) + 'ms',
    },
    top_endpoints: Object.entries(analytics.requests.by_endpoint)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([endpoint, count]) => ({ endpoint, requests: count })),
    top_campaigns: Object.entries(analytics.user_behavior.most_accessed_campaigns)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([campaign, count]) => ({ campaign, views: count })),
    peak_hours: Object.entries(analytics.user_behavior.peak_usage_hours)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([hour, count]) => ({ hour: `${hour}:00`, requests: count })),
    slowest_endpoints: analytics.performance.slowest_endpoints.slice(0, 5),
    error_breakdown: Object.entries(analytics.errors.by_type)
      .sort((a, b) => b[1] - a[1])
      .map(([type, count]) => ({ type, occurrences: count })),
    recent_activity: Object.entries(analytics.daily_stats)
      .slice(-7)
      .map(([date, stats]) => ({ date, ...stats })),
  };
}

/**
 * Analytics middleware for Express
 */
export function analyticsMiddleware(req, res, next) {
  const start = Date.now();

  // Track response
  res.on('finish', () => {
    const responseTime = Date.now() - start;
    trackRequest(req, res, responseTime);
    trackPerformance(req.path, responseTime);
  });

  // Track errors
  const originalSend = res.send;
  res.send = function (data) {
    if (res.statusCode >= 400) {
      const error = new Error(`HTTP ${res.statusCode}`);
      error.name = `HTTP_${res.statusCode}`;
      trackError(error, req);
    }
    return originalSend.call(this, data);
  };

  next();
}

/**
 * Reset analytics (for testing)
 */
export function resetAnalytics() {
  analytics = {
    requests: { total: 0, by_endpoint: {}, by_method: {}, by_status: {} },
    performance: { average_response_time: 0, slowest_endpoints: [], fastest_endpoints: [] },
    errors: { total: 0, by_type: {}, by_endpoint: {} },
    user_behavior: { most_accessed_campaigns: {}, most_viewed_products: {}, peak_usage_hours: {} },
    daily_stats: {},
  };
  saveAnalytics();
}

export default {
  analyticsMiddleware,
  trackRequest,
  trackPerformance,
  trackError,
  getAnalyticsSummary,
  resetAnalytics,
};
