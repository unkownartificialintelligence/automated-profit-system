#!/usr/bin/env node

/**
 * AUTOMATION SCHEDULER
 *
 * This script runs the full automation pipeline on a schedule
 *
 * Usage:
 *   node automation-scheduler.js              # Run once
 *   node automation-scheduler.js --daemon     # Run as daemon (checks schedule)
 *
 * Or set up a cron job:
 *   0 9 * * 1 node /path/to/automation-scheduler.js    # Every Monday at 9am
 */

import axios from 'axios';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3000';
const SCHEDULE_FILE = join(__dirname, 'data/full-automation-schedule.json');

async function runAutomation() {
  console.log('🤖 Starting Automation Pipeline...');
  console.log(`📅 Timestamp: ${new Date().toISOString()}`);
  console.log('─'.repeat(50));

  try {
    // Run the automation
    const response = await axios.post(`${SERVER_URL}/api/full-automation/run`, {
      max_products: 3,
      generate_designs: true,
      create_listings: true,
      generate_marketing: true
    }, {
      timeout: 60000 // 60 second timeout
    });

    if (response.data.success) {
      console.log('✅ Automation completed successfully!');
      console.log(`📊 Products processed: ${response.data.summary.products_processed}`);
      console.log(`🎨 Designs generated: ${response.data.summary.designs_generated}`);
      console.log(`🏪 Listings created: ${response.data.summary.listings_created}`);
      console.log(`📢 Marketing campaigns: ${response.data.summary.marketing_campaigns}`);

      if (response.data.errors && response.data.errors.length > 0) {
        console.log(`⚠️  ${response.data.errors.length} errors occurred`);
        response.data.errors.forEach(err => {
          console.log(`   - ${err.product}: ${err.error}`);
        });
      }

      // Get status update
      const statusResponse = await axios.get(`${SERVER_URL}/api/full-automation/status`);
      console.log('\n📈 Current Status:');
      console.log(`   Total runs: ${statusResponse.data.overview.total_automation_runs}`);
      console.log(`   Products in queue: ${statusResponse.data.overview.products_in_queue}`);
      console.log(`   Products in progress: ${statusResponse.data.overview.products_in_progress}`);
      console.log(`   Products launched: ${statusResponse.data.overview.products_launched}`);

    } else {
      console.error('❌ Automation failed:', response.data.message);
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Error running automation:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    process.exit(1);
  }

  console.log('─'.repeat(50));
  console.log('✅ Automation run complete!');
  console.log('');
}

async function checkScheduleAndRun() {
  console.log('🔍 Checking automation schedule...');

  if (!existsSync(SCHEDULE_FILE)) {
    console.log('⚠️  No schedule configured. Run once and exit.');
    await runAutomation();
    return;
  }

  const schedule = JSON.parse(readFileSync(SCHEDULE_FILE, 'utf8'));

  if (!schedule.enabled) {
    console.log('⚠️  Automation is disabled. Exiting.');
    return;
  }

  const nextRun = new Date(schedule.next_run);
  const now = new Date();

  console.log(`📅 Next scheduled run: ${nextRun.toISOString()}`);
  console.log(`🕐 Current time: ${now.toISOString()}`);

  if (now >= nextRun) {
    console.log('✅ Time to run automation!');
    await runAutomation();

    // Update schedule for next run
    const newSchedule = {
      ...schedule,
      last_run: now.toISOString(),
      next_run: calculateNextRun(schedule.frequency, schedule.day, schedule.time)
    };

    writeFileSync(SCHEDULE_FILE, JSON.stringify(newSchedule, null, 2));
    console.log(`📅 Next run scheduled for: ${newSchedule.next_run}`);
  } else {
    console.log(`⏰ Not time yet. Next run in ${Math.round((nextRun - now) / 1000 / 60 / 60)} hours.`);
  }
}

function calculateNextRun(frequency, day, time) {
  const now = new Date();
  const [hours, minutes] = time.split(':').map(Number);

  if (frequency === 'daily') {
    const next = new Date(now);
    next.setHours(hours, minutes, 0, 0);
    if (next <= now) next.setDate(next.getDate() + 1);
    return next.toISOString();
  }

  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const targetDay = days.indexOf(day.toLowerCase());
  const currentDay = now.getDay();

  let daysUntil = targetDay - currentDay;
  if (daysUntil <= 0) daysUntil += 7;
  if (frequency === 'biweekly') daysUntil += 7;

  const next = new Date(now);
  next.setDate(now.getDate() + daysUntil);
  next.setHours(hours, minutes, 0, 0);

  return next.toISOString();
}

// Main execution
const args = process.argv.slice(2);

if (args.includes('--daemon')) {
  console.log('🤖 Running in daemon mode...');
  // Check every hour
  setInterval(checkScheduleAndRun, 60 * 60 * 1000);
  checkScheduleAndRun(); // Run once immediately
} else if (args.includes('--check-schedule')) {
  checkScheduleAndRun();
} else {
  // Run once
  runAutomation();
}
