#!/usr/bin/env node

import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./database.db');

console.log('\n📊 DATABASE VERIFICATION REPORT\n');
console.log('═══════════════════════════════════════════════════════\n');

// Count records
db.get(`
  SELECT
    (SELECT COUNT(*) FROM products) as products,
    (SELECT COUNT(*) FROM sales) as sales,
    (SELECT COUNT(*) FROM trending_niches) as niches,
    (SELECT COUNT(*) FROM marketing_templates) as templates,
    (SELECT COUNT(*) FROM marketing_campaigns) as campaigns,
    (SELECT COUNT(*) FROM admin_users) as admins
`, [], (err, counts) => {
  console.log('📈 RECORD COUNTS:');
  console.log(`   • Products: ${counts.products}`);
  console.log(`   • Sales: ${counts.sales}`);
  console.log(`   • Trending Niches: ${counts.niches}`);
  console.log(`   • Marketing Templates: ${counts.templates}`);
  console.log(`   • Marketing Campaigns: ${counts.campaigns}`);
  console.log(`   • Admin Users: ${counts.admins}\n`);

  // Show products
  db.all('SELECT title, selling_price, profit_margin, status FROM products LIMIT 5', [], (err, products) => {
    console.log('🎨 CREATED PRODUCTS:');
    products.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.title}`);
      console.log(`      Price: $${p.selling_price} | Profit Margin: ${p.profit_margin}% | Status: ${p.status}`);
    });
    console.log('');

    // Show sales summary
    db.get('SELECT SUM(total_amount) as revenue, SUM(net_profit) as profit, COUNT(*) as count FROM sales', [], (err, sales) => {
      console.log('💰 SALES SUMMARY:');
      console.log(`   • Total Orders: ${sales.count}`);
      console.log(`   • Total Revenue: $${(sales.revenue || 0).toFixed(2)}`);
      console.log(`   • Total Profit: $${(sales.profit || 0).toFixed(2)}\n`);

      // Show revenue by platform
      db.all('SELECT platform, COUNT(*) as orders, SUM(total_amount) as revenue FROM sales GROUP BY platform', [], (err, platforms) => {
        console.log('📦 REVENUE BY PLATFORM:');
        platforms.forEach(p => {
          console.log(`   • ${p.platform}: ${p.orders} orders, $${p.revenue.toFixed(2)}`);
        });
        console.log('');

        // Show admin access
        db.all('SELECT email, role, created_at FROM admin_users', [], (err, admins) => {
          console.log('👑 ADMIN ACCESS:');
          admins.forEach(a => {
            console.log(`   • ${a.email} (${a.role})`);
          });
          console.log('\n═══════════════════════════════════════════════════════\n');
          console.log('✅ SYSTEM READY FOR TESTING!\n');
          console.log('Next steps:');
          console.log('   1. Start backend: npm start');
          console.log('   2. Start frontend: cd frontend && npm run dev');
          console.log('   3. Login: http://localhost:5173/admin');
          console.log('   4. Credentials: admin@jerzii.ai / admin123\n');

          db.close();
        });
      });
    });
  });
});
