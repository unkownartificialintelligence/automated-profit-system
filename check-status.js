import db from './src/database.js';

async function checkStatus() {
  try {
    console.log('📊 CURRENT SYSTEM STATUS\n');
    console.log('⏰ Server Time:', new Date().toLocaleString());
    console.log('');

    // Check automation status
    const automation = await db.get('SELECT * FROM automation_status WHERE id = 1');
    console.log('🤖 AUTOMATION STATUS:');
    console.log('   Status:', automation.active ? '🟢 ACTIVE' : '🔴 INACTIVE');
    console.log('   Frequency:', automation.frequency);
    console.log('   Last Run:', automation.last_run || 'Never');
    console.log('   Next Run:', automation.next_run || 'Not scheduled');
    console.log('   Products Created:', automation.products_created || 0);
    console.log('   Revenue Generated:', `$${automation.revenue_generated || 0}`);
    console.log('   Total Runs:', automation.total_runs || 0);
    console.log('   Success Rate:', `${automation.success_rate || 0}%`);
    console.log('');

    // Check products
    const productStats = await db.get(`
      SELECT
        COUNT(*) as total,
        SUM(sales) as totalSales,
        SUM(revenue) as totalRevenue
      FROM products
    `);
    console.log('📦 PRODUCTS:');
    console.log('   Total Products:', productStats.total);
    console.log('   Total Sales:', productStats.totalSales || 0);
    console.log('   Total Revenue:', `$${(productStats.totalRevenue || 0).toFixed(2)}`);
    console.log('');

    // Check orders
    const orderStats = await db.get(`
      SELECT
        COUNT(*) as total,
        SUM(revenue) as totalRevenue,
        SUM(profit) as totalProfit
      FROM orders
    `);
    console.log('💰 ORDERS:');
    console.log('   Total Orders:', orderStats.total);
    console.log('   Total Revenue:', `$${(orderStats.totalRevenue || 0).toFixed(2)}`);
    console.log('   Total Profit:', `$${(orderStats.totalProfit || 0).toFixed(2)}`);
    console.log('');

    // Check users
    const userCount = await db.get('SELECT COUNT(*) as count FROM users');
    console.log('👥 USERS:');
    console.log('   Total Users:', userCount.count);
    console.log('');

    // Recent activity
    const recentActivity = await db.all(`
      SELECT action, message, created_at
      FROM activity_log
      ORDER BY created_at DESC
      LIMIT 5
    `);
    console.log('📋 RECENT ACTIVITY:');
    if (recentActivity.length > 0) {
      recentActivity.forEach((activity, i) => {
        console.log(`   ${i + 1}. ${activity.message} (${activity.created_at})`);
      });
    } else {
      console.log('   No activity logged yet');
    }
    console.log('');

    console.log('═══════════════════════════════════════════════════');
    console.log('');

    if (!automation.active) {
      console.log('⚠️  AUTOMATION IS INACTIVE');
      console.log('   Run: node scripts/seed-demo-data.js to activate');
    } else {
      console.log('✅ AUTOMATION IS ACTIVE');
      console.log('   Next run scheduled for:', automation.next_run);
      console.log('   Schedule: Daily at 7:00 AM');
    }
    console.log('');

  } catch (error) {
    console.error('Error checking status:', error.message);
  }
  process.exit(0);
}

checkStatus();
