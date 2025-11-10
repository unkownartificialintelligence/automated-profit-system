#!/usr/bin/env node
/**
 * Performance Testing Script
 * Tests all API endpoints and measures response times
 */

import { performance } from 'perf_hooks';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

// Performance thresholds (in milliseconds)
const THRESHOLDS = {
  excellent: 50,
  good: 100,
  acceptable: 200,
  slow: 500
};

const results = {
  total: 0,
  passed: 0,
  failed: 0,
  endpoints: []
};

/**
 * Measure endpoint performance
 */
async function testEndpoint(name, method, path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const start = performance.now();

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      body: options.body ? JSON.stringify(options.body) : undefined
    });

    const end = performance.now();
    const duration = Math.round(end - start);
    const data = await response.json().catch(() => ({}));

    const result = {
      name,
      method,
      path,
      status: response.status,
      duration,
      success: response.ok,
      data
    };

    results.endpoints.push(result);
    results.total++;

    if (response.ok) {
      results.passed++;
    } else {
      results.failed++;
    }

    // Color code based on performance
    let perfColor = COLORS.green;
    let perfLabel = 'EXCELLENT';

    if (duration > THRESHOLDS.slow) {
      perfColor = COLORS.red;
      perfLabel = 'SLOW';
    } else if (duration > THRESHOLDS.acceptable) {
      perfColor = COLORS.yellow;
      perfLabel = 'ACCEPTABLE';
    } else if (duration > THRESHOLDS.good) {
      perfColor = COLORS.yellow;
      perfLabel = 'GOOD';
    }

    const statusColor = response.ok ? COLORS.green : COLORS.red;

    console.log(
      `${statusColor}[${response.status}]${COLORS.reset} ` +
      `${method.padEnd(6)} ${path.padEnd(40)} ` +
      `${perfColor}${duration}ms (${perfLabel})${COLORS.reset}`
    );

    return result;
  } catch (error) {
    const end = performance.now();
    const duration = Math.round(end - start);

    results.total++;
    results.failed++;

    console.log(
      `${COLORS.red}[ERROR]${COLORS.reset} ` +
      `${method.padEnd(6)} ${path.padEnd(40)} ` +
      `${COLORS.red}${error.message}${COLORS.reset}`
    );

    return {
      name,
      method,
      path,
      status: 0,
      duration,
      success: false,
      error: error.message
    };
  }
}

/**
 * Test endpoint with concurrent requests
 */
async function loadTest(name, method, path, concurrency = 10) {
  console.log(`\n${COLORS.cyan}📊 Load Testing: ${name} (${concurrency} concurrent requests)${COLORS.reset}`);

  const start = performance.now();
  const promises = Array(concurrency).fill().map(() =>
    fetch(`${BASE_URL}${path}`, { method })
  );

  const responses = await Promise.all(promises);
  const end = performance.now();

  const totalDuration = Math.round(end - start);
  const avgDuration = Math.round(totalDuration / concurrency);
  const successCount = responses.filter(r => r.ok).length;

  console.log(
    `   Total: ${totalDuration}ms | ` +
    `Avg: ${avgDuration}ms | ` +
    `Success: ${successCount}/${concurrency} ` +
    `(${Math.round(successCount / concurrency * 100)}%)`
  );

  return {
    name,
    concurrency,
    totalDuration,
    avgDuration,
    successRate: successCount / concurrency
  };
}

/**
 * Main test suite
 */
async function runTests() {
  console.log(`${COLORS.bold}${COLORS.cyan}`);
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║          PERFORMANCE TESTING SUITE                         ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(COLORS.reset);

  console.log(`${COLORS.cyan}Testing API at: ${BASE_URL}${COLORS.reset}\n`);

  // Core API Endpoints
  console.log(`${COLORS.bold}1. Core Endpoints${COLORS.reset}`);
  await testEndpoint('Health Check', 'GET', '/api/health');
  await testEndpoint('CSRF Token', 'GET', '/api/csrf-token');
  await testEndpoint('Sentry Test', 'GET', '/api/test-sentry-error');

  // Team & Profits
  console.log(`\n${COLORS.bold}2. Team & Profits${COLORS.reset}`);
  await testEndpoint('Team Suggestions', 'GET', '/api/team/suggestions');
  await testEndpoint('Team Profits', 'GET', '/api/team-profits');

  // Products & Printful
  console.log(`\n${COLORS.bold}3. Products & Printful${COLORS.reset}`);
  await testEndpoint('Printful Products', 'GET', '/api/printful/products');
  await testEndpoint('Printful Stores', 'GET', '/api/printful/stores');

  // Automation
  console.log(`\n${COLORS.bold}4. Automation${COLORS.reset}`);
  await testEndpoint('Automation Status', 'GET', '/api/automation/status');
  await testEndpoint('Canva Automation', 'GET', '/api/canva-automation/status');

  // Admin (will fail without auth - expected)
  console.log(`\n${COLORS.bold}5. Admin (Auth Required - Expected to Fail)${COLORS.reset}`);
  await testEndpoint('Admin Login', 'POST', '/api/admin/login', {
    body: { username: 'test', password: 'test' }
  });

  // Load Testing
  console.log(`\n${COLORS.bold}6. Load Testing${COLORS.reset}`);
  const loadResults = [];
  loadResults.push(await loadTest('Health Check', 'GET', '/api/health', 10));
  loadResults.push(await loadTest('Health Check', 'GET', '/api/health', 50));
  loadResults.push(await loadTest('CSRF Token', 'GET', '/api/csrf-token', 20));

  // Generate Report
  console.log(`\n${COLORS.bold}${COLORS.cyan}`);
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║                    PERFORMANCE REPORT                      ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(COLORS.reset);

  console.log(`\n${COLORS.bold}Summary:${COLORS.reset}`);
  console.log(`  Total Tests:  ${results.total}`);
  console.log(`  ${COLORS.green}Passed:       ${results.passed}${COLORS.reset}`);
  console.log(`  ${COLORS.red}Failed:       ${results.failed}${COLORS.reset}`);
  console.log(`  Success Rate: ${Math.round(results.passed / results.total * 100)}%`);

  // Performance Analysis
  const timings = results.endpoints
    .filter(e => e.success)
    .map(e => e.duration)
    .sort((a, b) => a - b);

  if (timings.length > 0) {
    const avg = Math.round(timings.reduce((a, b) => a + b, 0) / timings.length);
    const median = timings[Math.floor(timings.length / 2)];
    const p95 = timings[Math.floor(timings.length * 0.95)];
    const slowest = Math.max(...timings);
    const fastest = Math.min(...timings);

    console.log(`\n${COLORS.bold}Response Times:${COLORS.reset}`);
    console.log(`  Fastest:  ${COLORS.green}${fastest}ms${COLORS.reset}`);
    console.log(`  Average:  ${avg}ms`);
    console.log(`  Median:   ${median}ms`);
    console.log(`  95th %:   ${p95}ms`);
    console.log(`  Slowest:  ${slowest > THRESHOLDS.acceptable ? COLORS.red : COLORS.yellow}${slowest}ms${COLORS.reset}`);
  }

  // Identify slow endpoints
  const slowEndpoints = results.endpoints
    .filter(e => e.success && e.duration > THRESHOLDS.acceptable)
    .sort((a, b) => b.duration - a.duration);

  if (slowEndpoints.length > 0) {
    console.log(`\n${COLORS.bold}${COLORS.yellow}⚠️  Slow Endpoints (>${THRESHOLDS.acceptable}ms):${COLORS.reset}`);
    slowEndpoints.forEach(e => {
      console.log(`  ${COLORS.red}${e.duration}ms${COLORS.reset} - ${e.method} ${e.path}`);
    });
  }

  // Load test results
  console.log(`\n${COLORS.bold}Load Test Results:${COLORS.reset}`);
  loadResults.forEach(r => {
    const color = r.successRate === 1 ? COLORS.green : COLORS.yellow;
    console.log(
      `  ${r.name} (${r.concurrency} concurrent): ` +
      `${r.avgDuration}ms avg, ` +
      `${color}${Math.round(r.successRate * 100)}% success${COLORS.reset}`
    );
  });

  // Recommendations
  console.log(`\n${COLORS.bold}${COLORS.cyan}💡 Recommendations:${COLORS.reset}`);

  if (slowEndpoints.length > 0) {
    console.log(`  ${COLORS.yellow}⚠️${COLORS.reset} ${slowEndpoints.length} endpoint(s) need optimization`);
    console.log(`     Consider adding caching or optimizing database queries`);
  } else {
    console.log(`  ${COLORS.green}✅${COLORS.reset} All endpoints performing well!`);
  }

  const avgResponseTime = timings.length > 0
    ? Math.round(timings.reduce((a, b) => a + b, 0) / timings.length)
    : 0;

  if (avgResponseTime > THRESHOLDS.good) {
    console.log(`  ${COLORS.yellow}⚠️${COLORS.reset} Average response time (${avgResponseTime}ms) could be improved`);
    console.log(`     Target: <${THRESHOLDS.good}ms for excellent performance`);
  }

  console.log(`\n${COLORS.bold}Next Steps:${COLORS.reset}`);
  console.log(`  1. Add Redis caching for frequently accessed data`);
  console.log(`  2. Implement database connection pooling`);
  console.log(`  3. Add response compression (gzip)`);
  console.log(`  4. Optimize database queries with indexes`);
  console.log(`  5. Monitor production performance with Sentry`);

  console.log(`\n${COLORS.green}${COLORS.bold}✅ Performance testing complete!${COLORS.reset}\n`);

  // Exit with appropriate code
  process.exit(results.failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  console.error(`${COLORS.red}Fatal error:${COLORS.reset}`, error);
  process.exit(1);
});
