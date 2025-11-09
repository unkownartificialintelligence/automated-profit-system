#!/usr/bin/env node

/**
 * QUICK PROFIT GENERATION SCRIPT
 *
 * Run this script to quickly generate profits and build your paper trail!
 *
 * Usage: node generate-profits.js
 */

import profitAutomation from './src/services/profitAutomation.js';

console.log('\n💰 ========================================');
console.log('   JERZII AI PROFIT GENERATION SYSTEM');
console.log('   Building Your Paper Trail...');
console.log('========================================\n');

async function main() {
  try {
    // Run the complete profit cycle
    const result = await profitAutomation.runCompleteProfitCycle();

    if (result.success) {
      console.log('\n💰 ========================================');
      console.log('   SUCCESS! PROFITS GENERATED');
      console.log('========================================\n');
      console.log(`📊 Summary:`);
      console.log(`   • Trending Niches Found: ${result.trends}`);
      console.log(`   • Products Created: ${result.products}`);
      console.log(`   • Orders Processed: ${result.orders}`);
      console.log(`   • Revenue Generated: $${result.revenue.toFixed(2)}`);
      console.log(`   • Total Profit: $${result.profit.toFixed(2)}`);
      console.log('\n✅ Paper trail updated in database!');
      console.log('📈 View your profits at: http://localhost:5173/admin (Profits tab)\n');
    } else {
      console.error('\n❌ Profit generation failed:', result.error);
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Error generating profits:', error.message);
    process.exit(1);
  }
}

main();
