import db from '../src/database.js';

async function seedDemoData() {
  console.log('🌱 Seeding Demo Data for Analytics and Testing...\n');

  try {
    // 1. Activate Automation
    console.log('⚡ Activating automation for 7:00 AM daily...');
    await db.run(`
      UPDATE automation_status
      SET
        active = 1,
        frequency = 'daily',
        last_run = datetime('now', '-1 day'),
        next_run = datetime('now', 'start of day', '+1 day', '+7 hours'),
        products_created = 47,
        revenue_generated = 12847.50,
        total_runs = 15,
        success_rate = 93.3
      WHERE id = 1
    `);
    console.log('✓ Automation activated - Next run: Tomorrow at 7:00 AM\n');

    // 2. Create Demo Products
    console.log('📦 Creating demo products...');
    const products = [
      { name: 'AI Tech Enthusiast T-Shirt', sku: 'TECH-001', price: 29.99, status: 'active', description: 'Perfect for AI lovers', sales: 127, revenue: 3808.73 },
      { name: 'Motivational Quote Hoodie', sku: 'MOTI-002', price: 54.99, status: 'active', description: 'Daily motivation wear', sales: 89, revenue: 4894.11 },
      { name: 'Funny Cat Meme Mug', sku: 'MEME-003', price: 24.99, status: 'active', description: 'Start your day with laughs', sales: 156, revenue: 3898.44 },
      { name: 'Fitness Motivation Poster', sku: 'FIT-004', price: 19.99, status: 'active', description: 'Gym wall inspiration', sales: 78, revenue: 1559.22 },
      { name: 'Coffee Lover Phone Case', sku: 'COFF-005', price: 27.99, status: 'active', description: 'For coffee addicts', sales: 134, revenue: 3750.66 },
      { name: 'Dog Mom Tote Bag', sku: 'DOG-006', price: 22.99, status: 'active', description: 'Proud dog parent', sales: 92, revenue: 2115.08 },
      { name: 'Vintage Aesthetic Notebook', sku: 'VINT-007', price: 18.99, status: 'active', description: 'Retro style journaling', sales: 67, revenue: 1272.33 },
      { name: 'Gaming Life Mousepad', sku: 'GAME-008', price: 16.99, status: 'active', description: 'Gamer essentials', sales: 143, revenue: 2429.57 },
      { name: 'Plant Parent T-Shirt', sku: 'PLNT-009', price: 29.99, status: 'active', description: 'Green thumb pride', sales: 85, revenue: 2549.15 },
      { name: 'Minimalist Art Print', sku: 'ART-010', price: 34.99, status: 'active', description: 'Modern home decor', sales: 51, revenue: 1784.49 }
    ];

    for (const product of products) {
      await db.run(`
        INSERT OR REPLACE INTO products (name, sku, price, status, description, sales, revenue, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now', '-' || (ABS(RANDOM()) % 30) || ' days'))
      `, [product.name, product.sku, product.price, product.status, product.description, product.sales, product.revenue]);
    }
    console.log(`✓ Created ${products.length} demo products\n`);

    // 3. Create Demo Orders
    console.log('💰 Creating demo orders...');
    let totalOrders = 0;
    for (let i = 0; i < 50; i++) {
      const productIndex = Math.floor(Math.random() * products.length);
      const price = products[productIndex].price;
      const profit = price * 0.72; // 72% profit margin

      await db.run(`
        INSERT INTO orders (product_id, revenue, profit, created_at)
        VALUES (?, ?, ?, datetime('now', '-' || ? || ' days', '-' || ? || ' hours'))
      `, [productIndex + 1, price, profit, Math.floor(Math.random() * 60), Math.floor(Math.random() * 24)]);
      totalOrders++;
    }
    console.log(`✓ Created ${totalOrders} demo orders\n`);

    // 4. Create Demo Team Members
    console.log('👥 Creating demo team members...');
    const teamMembers = [
      { name: 'Sarah Johnson', email: 'sarah@jerzii.ai', total_revenue: 15847.50, total_profit: 11410.20, commission_rate: 15 },
      { name: 'Mike Chen', email: 'mike@jerzii.ai', total_revenue: 12234.75, total_profit: 8808.62, commission_rate: 12 },
      { name: 'Emma Davis', email: 'emma@jerzii.ai', total_revenue: 18956.30, total_profit: 13648.54, commission_rate: 15 },
      { name: 'James Wilson', email: 'james@jerzii.ai', total_revenue: 9876.25, total_profit: 7110.90, commission_rate: 10 }
    ];

    for (const member of teamMembers) {
      await db.run(`
        INSERT OR REPLACE INTO team_members (name, email, status, total_revenue, total_profit, commission_rate, created_at)
        VALUES (?, ?, 'active', ?, ?, ?, datetime('now', '-90 days'))
      `, [member.name, member.email, member.total_revenue, member.total_profit, member.commission_rate]);
    }
    console.log(`✓ Created ${teamMembers.length} demo team members\n`);

    // 5. Create Activity Log
    console.log('📋 Creating activity log...');
    const activities = [
      { type: 'product_created', action: 'product_created', message: 'New product created: AI Tech Enthusiast T-Shirt', description: 'Trending keyword: AI Technology', user: 'automation' },
      { type: 'automation', action: 'automation_run', message: 'Automation completed successfully', description: '10 products created, $2,847 projected revenue', user: 'system' },
      { type: 'sale', action: 'order_completed', message: 'New order: Motivational Quote Hoodie', description: 'Revenue: $54.99, Profit: $39.59', user: 'customer' },
      { type: 'trending', action: 'trending_scanned', message: 'Trending scan completed', description: 'Found 23 high-potential keywords', user: 'automation' },
      { type: 'team', action: 'team_sale', message: 'Sarah Johnson made a sale', description: 'Coffee Lover Phone Case - $27.99', user: 'sarah@jerzii.ai' }
    ];

    for (let i = 0; i < activities.length; i++) {
      const activity = activities[i];
      await db.run(`
        INSERT INTO activity_log (type, action, message, description, user, created_at)
        VALUES (?, ?, ?, ?, ?, datetime('now', '-' || ? || ' hours'))
      `, [activity.type, activity.action, activity.message, activity.description, activity.user, i * 3]);
    }
    console.log(`✓ Created ${activities.length} activity log entries\n`);

    // 6. Update Settings with Demo Data
    console.log('⚙️  Updating settings...');
    await db.run(`
      UPDATE settings
      SET
        user_name = 'Business Owner',
        user_email = 'owner@jerzii.ai',
        user_company = 'Jerzii AI',
        user_phone = '+1 (555) 123-4567',
        email_notifications = 1,
        automation_alerts = 1,
        weekly_reports = 1
      WHERE id = 1
    `);
    console.log('✓ Settings updated\n');

    // 7. Print Summary
    const stats = await db.get(`
      SELECT
        COALESCE(SUM(revenue), 0) as totalRevenue,
        COALESCE(SUM(sales), 0) as totalSales,
        COUNT(*) as productCount
      FROM products
    `);

    const orderCount = await db.get(`SELECT COUNT(*) as count FROM orders`);

    console.log('═══════════════════════════════════════════════════');
    console.log('✅ DEMO DATA SEEDED SUCCESSFULLY!');
    console.log('═══════════════════════════════════════════════════\n');

    console.log('📊 Summary:');
    console.log(`   • Products: ${stats.productCount}`);
    console.log(`   • Total Sales: ${stats.totalSales}`);
    console.log(`   • Total Revenue: $${stats.totalRevenue.toFixed(2)}`);
    console.log(`   • Orders: ${orderCount.count}`);
    console.log(`   • Team Members: ${teamMembers.length}`);
    console.log(`   • Activity Logs: ${activities.length}\n`);

    console.log('⚡ Automation Status:');
    console.log('   • Status: ACTIVE');
    console.log('   • Schedule: Daily at 7:00 AM');
    console.log('   • Next Run: Tomorrow at 7:00 AM');
    console.log('   • Products per run: 10');
    console.log('   • Target profit margin: 65-85%\n');

    console.log('🎯 What You\'ll See Now:');
    console.log('   • Dashboard populated with revenue/profit data');
    console.log('   • 10 active products in catalog');
    console.log('   • Team performance metrics');
    console.log('   • Activity timeline');
    console.log('   • Automation status: ACTIVE\n');

    console.log('🌐 Refresh your dashboard at: http://localhost:3000\n');

    console.log('═══════════════════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding demo data:', error);
    process.exit(1);
  }
}

seedDemoData();
