#!/usr/bin/env node

/**
 * ============================================
 * 🚀 MASTER AUTOMATION SYSTEM
 * ============================================
 *
 * ONE POWERFUL SCRIPT TO RULE THEM ALL
 *
 * This unified automation system combines ALL sessions:
 * ✅ Global Trending Discovery (10+ countries)
 * ✅ AI-Powered Design Generation
 * ✅ Printful Product Creation
 * ✅ Etsy/Shopify Listing Automation
 * ✅ Marketing Content Generation
 * ✅ Team Profit Tracking
 * ✅ Personal Sales Monitoring
 *
 * PLATFORMS SUPPORTED:
 * - Vercel (with cron jobs)
 * - Render (with worker process)
 * - Local development
 *
 * USAGE:
 *   node master-automation.js              # Run once
 *   node master-automation.js --daemon     # Run as background service
 *   node master-automation.js --immediate  # Skip schedule, run now
 *
 * ============================================
 */

import axios from 'axios';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import cron from 'node-cron';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ============================================
// CONFIGURATION
// ============================================

const CONFIG = {
  SERVER_URL: process.env.SERVER_URL || process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000',

  SCHEDULE: {
    // Run every Monday at 9:00 AM
    WEEKLY: '0 9 * * 1',
    // Run every day at 9:00 AM
    DAILY: '0 9 * * *',
    // Run every 6 hours
    SIXHOURLY: '0 */6 * * *',
  },

  AUTOMATION: {
    MAX_PRODUCTS: parseInt(process.env.MAX_PRODUCTS) || 5,
    GENERATE_DESIGNS: process.env.GENERATE_DESIGNS !== 'false',
    CREATE_LISTINGS: process.env.CREATE_LISTINGS !== 'false',
    GENERATE_MARKETING: process.env.GENERATE_MARKETING !== 'false',
    GLOBAL_TRENDING: process.env.GLOBAL_TRENDING !== 'false',
  },

  REGIONS: process.env.TRENDING_REGIONS || 'US,GB,CA,AU,DE,FR,JP,BR,IN,MX',

  DATA_DIR: join(__dirname, 'data'),
  LOG_FILE: join(__dirname, 'data/master-automation.log'),
  STATE_FILE: join(__dirname, 'data/automation-state.json'),
};

// Ensure data directory exists
if (!existsSync(CONFIG.DATA_DIR)) {
  mkdirSync(CONFIG.DATA_DIR, { recursive: true });
}

// ============================================
// LOGGING SYSTEM
// ============================================

function log(level, message, data = {}) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    ...data
  };

  console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`);

  // Append to log file
  try {
    const logLine = JSON.stringify(logEntry) + '\n';
    const fs = await import('fs');
    fs.appendFileSync(CONFIG.LOG_FILE, logLine);
  } catch (error) {
    console.error('Failed to write to log file:', error.message);
  }
}

function logSuccess(message, data) {
  log('success', `✅ ${message}`, data);
}

function logError(message, error) {
  log('error', `❌ ${message}`, { error: error.message, stack: error.stack });
}

function logInfo(message, data) {
  log('info', `ℹ️  ${message}`, data);
}

function logWarning(message, data) {
  log('warning', `⚠️  ${message}`, data);
}

// ============================================
// STATE MANAGEMENT
// ============================================

function loadState() {
  if (existsSync(CONFIG.STATE_FILE)) {
    try {
      return JSON.parse(readFileSync(CONFIG.STATE_FILE, 'utf8'));
    } catch (error) {
      logError('Failed to load state', error);
      return getDefaultState();
    }
  }
  return getDefaultState();
}

function getDefaultState() {
  return {
    last_run: null,
    total_runs: 0,
    total_products_created: 0,
    total_designs_generated: 0,
    total_listings_created: 0,
    total_marketing_campaigns: 0,
    errors: [],
    started_at: new Date().toISOString(),
  };
}

function saveState(state) {
  try {
    writeFileSync(CONFIG.STATE_FILE, JSON.stringify(state, null, 2));
  } catch (error) {
    logError('Failed to save state', error);
  }
}

// ============================================
// AUTOMATION MODULES
// ============================================

/**
 * MODULE 1: Global Trending Discovery
 * Discovers trending products from 10+ countries
 */
async function runGlobalTrendingDiscovery() {
  logInfo('Starting Global Trending Discovery...');

  try {
    const response = await axios.get(`${CONFIG.SERVER_URL}/api/global-trending`, {
      params: {
        regions: CONFIG.REGIONS,
        limit: CONFIG.AUTOMATION.MAX_PRODUCTS,
        add_to_personal: true
      },
      timeout: 120000 // 2 minutes
    });

    if (response.data.success) {
      logSuccess('Global Trending Discovery completed', {
        products_found: response.data.trending?.length || 0,
        regions: CONFIG.REGIONS.split(',').length
      });
      return response.data;
    } else {
      logWarning('Global Trending Discovery returned without success', response.data);
      return { success: false, trending: [] };
    }
  } catch (error) {
    logError('Global Trending Discovery failed', error);
    return { success: false, trending: [] };
  }
}

/**
 * MODULE 2: Full Automation Pipeline
 * Design → Printful → Listing → Marketing
 */
async function runFullAutomationPipeline(products = []) {
  logInfo('Starting Full Automation Pipeline...');

  try {
    const payload = {
      max_products: products.length > 0 ? products.length : CONFIG.AUTOMATION.MAX_PRODUCTS,
      generate_designs: CONFIG.AUTOMATION.GENERATE_DESIGNS,
      create_listings: CONFIG.AUTOMATION.CREATE_LISTINGS,
      generate_marketing: CONFIG.AUTOMATION.GENERATE_MARKETING,
      custom_products: products.length > 0 ? products : undefined
    };

    const response = await axios.post(
      `${CONFIG.SERVER_URL}/api/full-automation/run`,
      payload,
      { timeout: 300000 } // 5 minutes
    );

    if (response.data.success) {
      logSuccess('Full Automation Pipeline completed', {
        products_processed: response.data.summary?.products_processed || 0,
        designs_generated: response.data.summary?.designs_generated || 0,
        listings_created: response.data.summary?.listings_created || 0,
        marketing_campaigns: response.data.summary?.marketing_campaigns || 0,
        errors: response.data.errors?.length || 0
      });
      return response.data;
    } else {
      logWarning('Full Automation Pipeline completed with issues', response.data);
      return response.data;
    }
  } catch (error) {
    logError('Full Automation Pipeline failed', error);
    return { success: false, summary: {}, errors: [error.message] };
  }
}

/**
 * MODULE 3: Auto-Launch System
 * Automated product scheduling and store updates
 */
async function runAutoLaunchSystem() {
  logInfo('Starting Auto-Launch System...');

  try {
    const response = await axios.post(
      `${CONFIG.SERVER_URL}/api/auto-launch/launch`,
      { max_products: CONFIG.AUTOMATION.MAX_PRODUCTS },
      { timeout: 180000 } // 3 minutes
    );

    if (response.data.success) {
      logSuccess('Auto-Launch System completed', {
        products_launched: response.data.products_launched || 0
      });
      return response.data;
    } else {
      logWarning('Auto-Launch System completed with issues', response.data);
      return response.data;
    }
  } catch (error) {
    logError('Auto-Launch System failed', error);
    return { success: false };
  }
}

/**
 * MODULE 4: Canva Design Automation
 * Automated design creation
 */
async function runCanvaAutomation(products = []) {
  logInfo('Starting Canva Design Automation...');

  try {
    const response = await axios.post(
      `${CONFIG.SERVER_URL}/api/canva/automate`,
      {
        products: products.slice(0, CONFIG.AUTOMATION.MAX_PRODUCTS),
        auto_download: true
      },
      { timeout: 180000 } // 3 minutes
    );

    if (response.data.success) {
      logSuccess('Canva Design Automation completed', {
        designs_created: response.data.designs?.length || 0
      });
      return response.data;
    } else {
      logWarning('Canva Design Automation completed with issues', response.data);
      return response.data;
    }
  } catch (error) {
    logError('Canva Design Automation failed', error);
    return { success: false, designs: [] };
  }
}

/**
 * MODULE 5: Health Check & Status
 * Verify system health before running
 */
async function checkSystemHealth() {
  logInfo('Checking system health...');

  try {
    const response = await axios.get(`${CONFIG.SERVER_URL}/api/health`, {
      timeout: 30000
    });

    if (response.data.success) {
      logSuccess('System health check passed', {
        uptime: response.data.uptime,
        environment: response.data.environment
      });
      return true;
    } else {
      logError('System health check failed', new Error(response.data.message));
      return false;
    }
  } catch (error) {
    logError('System health check failed', error);
    return false;
  }
}

// ============================================
// MASTER AUTOMATION RUNNER
// ============================================

async function runMasterAutomation() {
  const startTime = Date.now();
  logInfo('🚀 MASTER AUTOMATION STARTED', {
    server: CONFIG.SERVER_URL,
    max_products: CONFIG.AUTOMATION.MAX_PRODUCTS,
    regions: CONFIG.REGIONS
  });
  console.log('═'.repeat(60));

  const state = loadState();
  const results = {
    timestamp: new Date().toISOString(),
    duration: 0,
    modules_run: 0,
    modules_succeeded: 0,
    modules_failed: 0,
    total_products: 0,
    total_designs: 0,
    total_listings: 0,
    total_marketing: 0,
    errors: []
  };

  try {
    // Step 1: Health Check
    const isHealthy = await checkSystemHealth();
    if (!isHealthy) {
      logWarning('System health check failed, but continuing...');
    }

    // Step 2: Global Trending Discovery
    let trendingProducts = [];
    if (CONFIG.AUTOMATION.GLOBAL_TRENDING) {
      results.modules_run++;
      const trendingResult = await runGlobalTrendingDiscovery();
      if (trendingResult.success) {
        results.modules_succeeded++;
        trendingProducts = trendingResult.trending || [];
        results.total_products += trendingProducts.length;
      } else {
        results.modules_failed++;
        results.errors.push('Global Trending Discovery failed');
      }
    }

    // Step 3: Full Automation Pipeline
    results.modules_run++;
    const automationResult = await runFullAutomationPipeline(trendingProducts);
    if (automationResult.success) {
      results.modules_succeeded++;
      results.total_products += automationResult.summary?.products_processed || 0;
      results.total_designs += automationResult.summary?.designs_generated || 0;
      results.total_listings += automationResult.summary?.listings_created || 0;
      results.total_marketing += automationResult.summary?.marketing_campaigns || 0;
    } else {
      results.modules_failed++;
      results.errors.push('Full Automation Pipeline failed');
    }

    // Step 4: Auto-Launch System
    results.modules_run++;
    const launchResult = await runAutoLaunchSystem();
    if (launchResult.success) {
      results.modules_succeeded++;
    } else {
      results.modules_failed++;
      results.errors.push('Auto-Launch System failed');
    }

    // Update state
    state.last_run = new Date().toISOString();
    state.total_runs++;
    state.total_products_created += results.total_products;
    state.total_designs_generated += results.total_designs;
    state.total_listings_created += results.total_listings;
    state.total_marketing_campaigns += results.total_marketing;
    state.errors.push(...results.errors);

    // Keep only last 100 errors
    if (state.errors.length > 100) {
      state.errors = state.errors.slice(-100);
    }

    saveState(state);

  } catch (error) {
    logError('Master automation encountered critical error', error);
    results.errors.push(error.message);
  }

  // Calculate duration
  results.duration = Math.round((Date.now() - startTime) / 1000);

  // Final report
  console.log('═'.repeat(60));
  logInfo('📊 MASTER AUTOMATION COMPLETED', {
    duration: `${results.duration}s`,
    modules_succeeded: `${results.modules_succeeded}/${results.modules_run}`,
    modules_failed: results.modules_failed,
    total_products: results.total_products,
    total_designs: results.total_designs,
    total_listings: results.total_listings,
    total_marketing: results.total_marketing,
    errors: results.errors.length
  });

  console.log('\n📈 ALL-TIME STATISTICS:');
  console.log(`   Total runs: ${state.total_runs}`);
  console.log(`   Total products created: ${state.total_products_created}`);
  console.log(`   Total designs generated: ${state.total_designs_generated}`);
  console.log(`   Total listings created: ${state.total_listings_created}`);
  console.log(`   Total marketing campaigns: ${state.total_marketing_campaigns}`);
  console.log('═'.repeat(60));

  if (results.errors.length > 0) {
    console.log('\n⚠️  ERRORS ENCOUNTERED:');
    results.errors.forEach((err, i) => {
      console.log(`   ${i + 1}. ${err}`);
    });
  }

  return results;
}

// ============================================
// SCHEDULER & DAEMON MODE
// ============================================

async function runScheduler() {
  logInfo('📅 Scheduler started', {
    mode: 'daemon',
    schedule: CONFIG.SCHEDULE.WEEKLY
  });

  // Schedule weekly automation (Every Monday at 9 AM)
  cron.schedule(CONFIG.SCHEDULE.WEEKLY, async () => {
    logInfo('⏰ Scheduled automation triggered');
    await runMasterAutomation();
  });

  // Optional: Daily status report (Every day at 8 AM)
  cron.schedule('0 8 * * *', async () => {
    const state = loadState();
    logInfo('📊 Daily Status Report', {
      last_run: state.last_run,
      total_runs: state.total_runs,
      total_products: state.total_products_created,
      recent_errors: state.errors.slice(-5)
    });
  });

  logSuccess('Scheduler is running. Press Ctrl+C to stop.');

  // Keep the process alive
  process.on('SIGINT', () => {
    logInfo('Shutting down scheduler...');
    process.exit(0);
  });

  // Run once immediately if requested
  if (process.argv.includes('--run-now')) {
    logInfo('Running automation immediately...');
    await runMasterAutomation();
  }
}

// ============================================
// MAIN ENTRY POINT
// ============================================

async function main() {
  const args = process.argv.slice(2);

  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║     🚀  MASTER AUTOMATION SYSTEM  🚀                       ║
║                                                            ║
║     Unified automation for Vercel & Render                ║
║     Combining all sessions into ONE powerful script       ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);

  if (args.includes('--daemon')) {
    // Run as background service with scheduler
    await runScheduler();
  } else if (args.includes('--immediate') || args.includes('--run-now')) {
    // Run immediately, ignore schedule
    await runMasterAutomation();
    process.exit(0);
  } else if (args.includes('--status')) {
    // Show status only
    const state = loadState();
    console.log('\n📊 AUTOMATION STATUS:');
    console.log(JSON.stringify(state, null, 2));
    process.exit(0);
  } else if (args.includes('--help')) {
    console.log(`
USAGE:
  node master-automation.js [OPTIONS]

OPTIONS:
  --daemon        Run as background service with scheduler
  --immediate     Run automation immediately (ignore schedule)
  --run-now       Alias for --immediate
  --status        Show current automation status
  --help          Show this help message

ENVIRONMENT VARIABLES:
  SERVER_URL              API server URL (default: http://localhost:3000)
  MAX_PRODUCTS            Max products to process (default: 5)
  GENERATE_DESIGNS        Enable design generation (default: true)
  CREATE_LISTINGS         Enable listing creation (default: true)
  GENERATE_MARKETING      Enable marketing generation (default: true)
  GLOBAL_TRENDING         Enable global trending (default: true)
  TRENDING_REGIONS        Regions to check (default: US,GB,CA,AU,DE,FR,JP,BR,IN,MX)

EXAMPLES:
  node master-automation.js --daemon
  node master-automation.js --immediate
  SERVER_URL=https://myapp.vercel.app node master-automation.js --immediate
    `);
    process.exit(0);
  } else {
    // Default: Run once
    await runMasterAutomation();
    process.exit(0);
  }
}

// Run main function
main().catch(error => {
  logError('Fatal error in main function', error);
  process.exit(1);
});
