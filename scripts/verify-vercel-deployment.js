#!/usr/bin/env node
/**
 * Vercel Deployment Verification Script
 * Tests deployed application and verifies all optimizations are working
 */

import { performance } from 'perf_hooks';

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

// Get deployment URL from command line or environment
const DEPLOYMENT_URL = process.argv[2] || process.env.VERCEL_URL || process.env.DEPLOYMENT_URL;

if (!DEPLOYMENT_URL) {
  console.error(`${COLORS.red}${COLORS.bold}Error: No deployment URL provided${COLORS.reset}`);
  console.log(`\nUsage: node scripts/verify-vercel-deployment.js <your-vercel-url>`);
  console.log(`Example: node scripts/verify-vercel-deployment.js https://automated-profit-system.vercel.app\n`);
  process.exit(1);
}

// Normalize URL
const baseUrl = DEPLOYMENT_URL.replace(/\/$/, ''); // Remove trailing slash

console.log(`${COLORS.bold}${COLORS.cyan}`);
console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║       VERCEL DEPLOYMENT VERIFICATION                      ║');
console.log('╚════════════════════════════════════════════════════════════╝');
console.log(COLORS.reset);
console.log(`${COLORS.cyan}Testing deployment at: ${baseUrl}${COLORS.reset}\n`);

const results = {
  total: 0,
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: []
};

/**
 * Test endpoint and verify response
 */
async function testEndpoint(name, path, expectedStatus = 200, checkHeaders = []) {
  results.total++;
  const url = `${baseUrl}${path}`;
  const start = performance.now();

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Vercel-Deployment-Verification/1.0'
      }
    });

    const end = performance.now();
    const duration = Math.round(end - start);
    const statusMatch = response.status === expectedStatus;

    // Check headers
    const headerResults = {};
    for (const header of checkHeaders) {
      const value = response.headers.get(header);
      headerResults[header] = value || 'NOT FOUND';
    }

    const result = {
      name,
      path,
      status: response.status,
      expectedStatus,
      duration,
      success: statusMatch,
      headers: headerResults
    };

    results.tests.push(result);

    if (statusMatch) {
      results.passed++;
      console.log(
        `${COLORS.green}✅ PASS${COLORS.reset} ${name.padEnd(40)} ` +
        `[${response.status}] ${duration}ms`
      );
    } else {
      results.failed++;
      console.log(
        `${COLORS.red}❌ FAIL${COLORS.reset} ${name.padEnd(40)} ` +
        `[${response.status}] Expected [${expectedStatus}]`
      );
    }

    // Show important headers
    if (checkHeaders.length > 0) {
      for (const [header, value] of Object.entries(headerResults)) {
        const color = value === 'NOT FOUND' ? COLORS.yellow : COLORS.green;
        console.log(`   ${color}${header}: ${value}${COLORS.reset}`);
      }
    }

    return result;
  } catch (error) {
    results.failed++;
    results.tests.push({
      name,
      path,
      status: 0,
      success: false,
      error: error.message
    });

    console.log(
      `${COLORS.red}❌ ERROR${COLORS.reset} ${name.padEnd(40)} ` +
      `${error.message}`
    );
    return null;
  }
}

/**
 * Test cache performance
 */
async function testCachePerformance() {
  console.log(`\n${COLORS.bold}Testing Cache Performance:${COLORS.reset}`);

  const timings = [];
  const cacheStatuses = [];

  for (let i = 0; i < 5; i++) {
    const start = performance.now();
    const response = await fetch(`${baseUrl}/api/health`);
    const end = performance.now();

    timings.push(Math.round(end - start));
    cacheStatuses.push(response.headers.get('X-Cache') || 'UNKNOWN');
  }

  console.log(`   Request 1 (cache miss): ${timings[0]}ms [${cacheStatuses[0]}]`);
  for (let i = 1; i < timings.length; i++) {
    const color = cacheStatuses[i] === 'HIT' ? COLORS.green : COLORS.yellow;
    console.log(`   Request ${i + 1} (should be cached): ${color}${timings[i]}ms [${cacheStatuses[i]}]${COLORS.reset}`);
  }

  const cacheHits = cacheStatuses.filter(s => s === 'HIT').length;
  const cacheHitRate = Math.round((cacheHits / cacheStatuses.length) * 100);

  if (cacheHitRate >= 50) {
    console.log(`   ${COLORS.green}✅ Cache is working! Hit rate: ${cacheHitRate}%${COLORS.reset}`);
    results.passed++;
  } else {
    console.log(`   ${COLORS.yellow}⚠️  Cache might not be working. Hit rate: ${cacheHitRate}%${COLORS.reset}`);
    results.warnings++;
  }

  results.total++;
}

/**
 * Check environment configuration
 */
async function checkEnvironment() {
  console.log(`\n${COLORS.bold}Checking Environment Configuration:${COLORS.reset}`);

  try {
    const response = await fetch(`${baseUrl}/api/health`);
    const data = await response.json();

    if (data.environment === 'production') {
      console.log(`   ${COLORS.green}✅ NODE_ENV: production${COLORS.reset}`);
      results.passed++;
    } else {
      console.log(`   ${COLORS.yellow}⚠️  NODE_ENV: ${data.environment} (should be 'production')${COLORS.reset}`);
      results.warnings++;
    }

    // Check for warnings in health check
    if (data.checks) {
      for (const [service, check] of Object.entries(data.checks)) {
        if (check.status === 'warning') {
          console.log(`   ${COLORS.yellow}⚠️  ${service}: ${check.message}${COLORS.reset}`);
          results.warnings++;
        } else if (check.status === 'healthy') {
          console.log(`   ${COLORS.green}✅ ${service}: ${check.message}${COLORS.reset}`);
        }
      }
    }

    results.total++;
  } catch (error) {
    console.log(`   ${COLORS.red}❌ Failed to check environment: ${error.message}${COLORS.reset}`);
    results.failed++;
    results.total++;
  }
}

/**
 * Main verification flow
 */
async function runVerification() {
  console.log(`${COLORS.bold}1. Core Endpoints${COLORS.reset}`);
  await testEndpoint(
    'Health Check',
    '/api/health',
    200,
    ['X-Response-Time', 'X-Cache', 'Content-Encoding']
  );
  await testEndpoint('CSRF Token', '/api/csrf-token', 200);

  console.log(`\n${COLORS.bold}2. Monitoring Endpoints${COLORS.reset}`);
  await testEndpoint('Performance Stats', '/api/performance', 200);
  await testEndpoint('Cache Statistics', '/api/cache-stats', 200);

  console.log(`\n${COLORS.bold}3. API Documentation${COLORS.reset}`);
  await testEndpoint('Swagger UI', '/api-docs/', 200);

  console.log(`\n${COLORS.bold}4. Feature Endpoints${COLORS.reset}`);
  await testEndpoint('Team Profits', '/api/team-profits', 200);
  await testEndpoint('Automation Status', '/api/automation/status', 200);

  // Performance tests
  await testCachePerformance();
  await checkEnvironment();

  // Generate report
  console.log(`\n${COLORS.bold}${COLORS.cyan}`);
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║                 VERIFICATION REPORT                        ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(COLORS.reset);

  console.log(`\n${COLORS.bold}Summary:${COLORS.reset}`);
  console.log(`  Total Tests:  ${results.total}`);
  console.log(`  ${COLORS.green}Passed:       ${results.passed}${COLORS.reset}`);
  console.log(`  ${COLORS.yellow}Warnings:     ${results.warnings}${COLORS.reset}`);
  console.log(`  ${COLORS.red}Failed:       ${results.failed}${COLORS.reset}`);

  const successRate = Math.round((results.passed / results.total) * 100);
  console.log(`  Success Rate: ${successRate}%`);

  // Overall status
  console.log(`\n${COLORS.bold}Overall Status:${COLORS.reset}`);
  if (results.failed === 0 && results.warnings === 0) {
    console.log(`  ${COLORS.green}${COLORS.bold}🎉 PERFECT! All systems operational!${COLORS.reset}`);
  } else if (results.failed === 0) {
    console.log(`  ${COLORS.green}${COLORS.bold}✅ GOOD! Deployment is working with minor warnings${COLORS.reset}`);
  } else {
    console.log(`  ${COLORS.red}${COLORS.bold}❌ ISSUES DETECTED! Review failed tests above${COLORS.reset}`);
  }

  // Recommendations
  if (results.warnings > 0 || results.failed > 0) {
    console.log(`\n${COLORS.bold}${COLORS.yellow}Recommendations:${COLORS.reset}`);

    if (results.warnings > 0) {
      console.log(`  ⚠️  Check Vercel environment variables:`);
      console.log(`     - JWT_SECRET (required for authentication)`);
      console.log(`     - NODE_ENV=production`);
      console.log(`     - ALLOWED_ORIGINS (set to your Vercel domain)`);
      console.log(`     - SENTRY_DSN (optional, for error monitoring)`);
    }

    if (results.failed > 0) {
      console.log(`  ❌ Review failed endpoints and check:`);
      console.log(`     - Vercel deployment logs`);
      console.log(`     - Build errors`);
      console.log(`     - Function timeouts`);
    }
  }

  console.log(`\n${COLORS.cyan}View detailed logs at:${COLORS.reset}`);
  console.log(`  https://vercel.com/jerzii-ais-projects/automated-profit-system/logs\n`);

  // Exit code
  process.exit(results.failed > 0 ? 1 : 0);
}

// Run verification
runVerification().catch(error => {
  console.error(`${COLORS.red}${COLORS.bold}Fatal error:${COLORS.reset}`, error);
  process.exit(1);
});
