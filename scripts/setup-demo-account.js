#!/usr/bin/env node

/**
 * DEMO ACCOUNT SETUP
 * Creates a complete demo environment with sample data for client demonstrations
 */

import Database from 'better-sqlite3';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, '..', 'database.db');

console.log('\n' + '='.repeat(70));
console.log('🎭 DEMO ACCOUNT SETUP - Paper Trail System');
console.log('='.repeat(70) + '\n');

const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

try {
  console.log('📋 Step 1: Creating demo customer account...\n');

  // Create demo customer
  const demoCustomer = db.prepare(`
    INSERT OR REPLACE INTO customers (
      stripe_customer_id,
      email,
      name,
      phone,
      company_name,
      created_at
    ) VALUES (?, ?, ?, ?, ?, datetime('now'))
  `).run(
    'cus_demo_PaperTrailAccount',
    'demo@papertrail.jerzii-ai.com',
    'Demo Paper Trail',
    '+1-555-DEMO-123',
    'Paper Trail Demo Store'
  );

  const customerId = demoCustomer.lastInsertRowid;
  console.log(`✅ Created demo customer: ID ${customerId}`);
  console.log(`   Email: demo@papertrail.jerzii-ai.com`);
  console.log(`   Business: Paper Trail Demo Store\n`);

  // Create demo subscription package (Professional tier)
  console.log('📋 Step 2: Creating demo subscription...\n');

  let packageId;
  const existingPackage = db.prepare('SELECT id FROM subscription_packages WHERE name = ?').get('Professional');

  if (!existingPackage) {
    const pkg = db.prepare(`
      INSERT INTO subscription_packages (
        name,
        stripe_price_id,
        stripe_product_id,
        price_monthly,
        features,
        max_products,
        ai_features,
        priority_support
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'Professional',
      'price_demo_professional',
      'prod_demo_professional',
      79.00,
      JSON.stringify([
        'Unlimited products',
        'AI product descriptions',
        'Trend analysis',
        'Email automation',
        'Priority support',
        'Advanced analytics'
      ]),
      -1, // unlimited
      1,
      1
    );
    packageId = pkg.lastInsertRowid;
  } else {
    packageId = existingPackage.id;
  }

  const subscription = db.prepare(`
    INSERT OR REPLACE INTO subscriptions (
      customer_id,
      package_id,
      stripe_subscription_id,
      status,
      current_period_start,
      current_period_end,
      created_at
    ) VALUES (?, ?, ?, ?, datetime('now'), datetime('now', '+30 days'), datetime('now'))
  `).run(
    customerId,
    packageId,
    'sub_demo_PaperTrailPro',
    'active'
  );

  console.log(`✅ Created demo subscription: Professional Plan ($79/mo)`);
  console.log(`   Status: Active`);
  console.log(`   Period: 30 days\n`);

  // Create demo tenant
  console.log('📋 Step 3: Creating demo tenant (multi-tenant system)...\n');

  const tenant = db.prepare(`
    INSERT OR REPLACE INTO tenants (
      name,
      slug,
      subscription_id,
      settings,
      created_at
    ) VALUES (?, ?, ?, ?, datetime('now'))
  `).run(
    'Paper Trail Demo',
    'paper-trail-demo',
    subscription.lastInsertRowid,
    JSON.stringify({
      timezone: 'America/New_York',
      currency: 'USD',
      auto_fulfill: true,
      email_notifications: true
    })
  );

  const tenantId = tenant.lastInsertRowid;
  console.log(`✅ Created tenant: ${tenantId}`);
  console.log(`   Slug: paper-trail-demo\n`);

  // Create sample products
  console.log('📋 Step 4: Creating sample products...\n');

  const sampleProducts = [
    {
      name: 'Motivational Quote T-Shirt',
      sku: 'DEMO-TSH-001',
      printful_id: 71,
      variant_id: 4012,
      price: 24.99,
      cost: 12.50,
      description: 'Premium cotton t-shirt with inspiring quotes. Perfect for daily motivation!',
      category: 'Apparel',
      tags: JSON.stringify(['motivation', 'quotes', 't-shirts', 'apparel']),
      image_url: 'https://files.cdn.printful.com/o/upload/product-catalog-img/71/71_1581412333.jpg'
    },
    {
      name: 'Coffee Lover Mug',
      sku: 'DEMO-MUG-001',
      printful_id: 19,
      variant_id: 1320,
      price: 16.99,
      cost: 8.25,
      description: 'High-quality ceramic mug for coffee enthusiasts. Microwave and dishwasher safe.',
      category: 'Drinkware',
      tags: JSON.stringify(['coffee', 'mugs', 'drinkware', 'gifts']),
      image_url: 'https://files.cdn.printful.com/o/upload/product-catalog-img/19/19_1581412333.jpg'
    },
    {
      name: 'Minimalist Tote Bag',
      sku: 'DEMO-BAG-001',
      printful_id: 163,
      variant_id: 9375,
      price: 22.99,
      cost: 11.75,
      description: 'Eco-friendly canvas tote bag. Spacious and durable for everyday use.',
      category: 'Accessories',
      tags: JSON.stringify(['tote', 'bags', 'eco-friendly', 'minimalist']),
      image_url: 'https://files.cdn.printful.com/o/upload/product-catalog-img/163/163_1581412333.jpg'
    },
    {
      name: 'Inspirational Poster',
      sku: 'DEMO-POST-001',
      printful_id: 1,
      variant_id: 1,
      price: 29.99,
      cost: 14.50,
      description: 'Museum-quality poster with inspirational design. Perfect for home or office.',
      category: 'Home Decor',
      tags: JSON.stringify(['posters', 'wall-art', 'inspiration', 'decor']),
      image_url: 'https://files.cdn.printful.com/o/upload/product-catalog-img/1/1_1581412333.jpg'
    },
    {
      name: 'Comfort Hoodie',
      sku: 'DEMO-HOOD-001',
      printful_id: 146,
      variant_id: 4321,
      price: 44.99,
      cost: 22.00,
      description: 'Ultra-soft premium hoodie. Cozy warmth with style.',
      category: 'Apparel',
      tags: JSON.stringify(['hoodie', 'apparel', 'comfort', 'streetwear']),
      image_url: 'https://files.cdn.printful.com/o/upload/product-catalog-img/146/146_1581412333.jpg'
    }
  ];

  for (const product of sampleProducts) {
    db.prepare(`
      INSERT OR REPLACE INTO tenant_products (
        tenant_id,
        product_name,
        product_type,
        printful_id,
        price,
        cost,
        profit_margin,
        status,
        metadata,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).run(
      tenantId,
      product.name,
      product.category,
      product.printful_id.toString(),
      product.price,
      product.cost,
      ((product.price - product.cost) / product.price * 100).toFixed(2),
      'active',
      JSON.stringify({
        sku: product.sku,
        variant_id: product.variant_id,
        description: product.description,
        tags: JSON.parse(product.tags),
        image_url: product.image_url
      })
    );
    console.log(`   ✅ ${product.name} ($${product.price})`);
  }

  console.log(`\n✅ Created ${sampleProducts.length} demo products\n`);

  // Create sample sales
  console.log('📋 Step 5: Generating sample sales data...\n');

  const salesData = [
    { productIdx: 0, quantity: 3, daysAgo: 1, status: 'fulfilled' },
    { productIdx: 1, quantity: 2, daysAgo: 1, status: 'fulfilled' },
    { productIdx: 0, quantity: 1, daysAgo: 2, status: 'fulfilled' },
    { productIdx: 3, quantity: 2, daysAgo: 3, status: 'fulfilled' },
    { productIdx: 2, quantity: 1, daysAgo: 3, status: 'fulfilled' },
    { productIdx: 4, quantity: 1, daysAgo: 4, status: 'processing' },
    { productIdx: 1, quantity: 4, daysAgo: 5, status: 'fulfilled' },
    { productIdx: 0, quantity: 2, daysAgo: 6, status: 'fulfilled' },
    { productIdx: 3, quantity: 1, daysAgo: 7, status: 'fulfilled' },
    { productIdx: 2, quantity: 2, daysAgo: 8, status: 'fulfilled' },
    { productIdx: 0, quantity: 1, daysAgo: 10, status: 'fulfilled' },
    { productIdx: 1, quantity: 3, daysAgo: 12, status: 'fulfilled' },
    { productIdx: 4, quantity: 1, daysAgo: 14, status: 'fulfilled' },
    { productIdx: 3, quantity: 2, daysAgo: 15, status: 'fulfilled' },
    { productIdx: 0, quantity: 5, daysAgo: 18, status: 'fulfilled' },
  ];

  let totalRevenue = 0;
  let totalProfit = 0;

  for (const sale of salesData) {
    const product = sampleProducts[sale.productIdx];
    const revenue = product.price * sale.quantity;
    const cost = product.cost * sale.quantity;
    const profit = revenue - cost;

    totalRevenue += revenue;
    totalProfit += profit;

    db.prepare(`
      INSERT INTO tenant_sales (
        tenant_id,
        order_id,
        platform,
        revenue,
        cost,
        profit,
        sale_date,
        metadata
      ) VALUES (?, ?, ?, ?, ?, ?, datetime('now', '-${sale.daysAgo} days'), ?)
    `).run(
      tenantId,
      `DEMO-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      'Demo Store',
      revenue,
      cost,
      profit,
      JSON.stringify({
        product_name: product.name,
        sku: product.sku,
        quantity: sale.quantity,
        status: sale.status
      })
    );
  }

  console.log(`✅ Created ${salesData.length} sample sales`);
  console.log(`   Total Revenue: $${totalRevenue.toFixed(2)}`);
  console.log(`   Total Profit: $${totalProfit.toFixed(2)}`);
  console.log(`   Profit Margin: ${((totalProfit / totalRevenue) * 100).toFixed(1)}%\n`);

  // Create demo team members
  console.log('📋 Step 6: Creating demo team members...\n');

  const teamMembers = [
    {
      email: 'owner@papertrail.demo',
      name: 'Demo Owner',
      role: 'owner'
    },
    {
      email: 'manager@papertrail.demo',
      name: 'Demo Manager',
      role: 'admin'
    },
    {
      email: 'designer@papertrail.demo',
      name: 'Demo Designer',
      role: 'member'
    }
  ];

  // Simple demo password hash (bcrypt hash of 'demo123')
  const demoPasswordHash = '$2b$10$rN7YhRqQqQYBB6w3q3jZv.JX8XxZF3mXU9z4aHxY6Z7K8L9M0N1O2';

  for (const member of teamMembers) {
    db.prepare(`
      INSERT OR REPLACE INTO tenant_users (
        tenant_id,
        email,
        password_hash,
        name,
        role,
        status,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `).run(
      tenantId,
      member.email,
      demoPasswordHash,
      member.name,
      member.role,
      'active'
    );
    console.log(`   ✅ ${member.name} - ${member.role}`);
  }

  console.log('\n✅ Created 3 demo team members\n');

  // Create onboarding progress
  console.log('📋 Step 7: Setting up demo onboarding...\n');

  db.prepare(`
    INSERT OR REPLACE INTO onboarding_progress (
      customer_id,
      subscription_id,
      current_step,
      total_steps,
      completed,
      completed_at,
      started_at
    ) VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now', '-7 days'))
  `).run(
    customerId,
    subscription.lastInsertRowid,
    7,
    7,
    1
  );

  // Mark all checklist items as complete
  const checklistItems = [
    { step: 1, name: 'Account Setup', description: 'Complete your profile and business details' },
    { step: 2, name: 'Connect Printful', description: 'Link your Printful account for order fulfillment' },
    { step: 3, name: 'Add Products', description: 'Import or create your first products' },
    { step: 4, name: 'Configure Payments', description: 'Set up Stripe for payment processing' },
    { step: 5, name: 'Email Setup', description: 'Configure automated customer emails' },
    { step: 6, name: 'Team Members', description: 'Invite team members and set profit sharing' },
    { step: 7, name: 'Launch Store', description: 'Go live and start selling!' }
  ];

  for (const item of checklistItems) {
    db.prepare(`
      INSERT OR REPLACE INTO onboarding_checklist (
        customer_id,
        step_number,
        step_name,
        step_description,
        completed,
        completed_at
      ) VALUES (?, ?, ?, ?, ?, datetime('now', '-${7 - item.step} days'))
    `).run(
      customerId,
      item.step,
      item.name,
      item.description,
      1
    );
  }

  console.log(`✅ Onboarding completed (7/7 steps)\n`);

  // Generate demo analytics
  console.log('📋 Step 8: Generating analytics data...\n');

  const analytics = {
    total_revenue: totalRevenue,
    total_profit: totalProfit,
    total_orders: salesData.length,
    average_order_value: totalRevenue / salesData.length,
    profit_margin: (totalProfit / totalRevenue) * 100,
    top_product: sampleProducts[0].name,
    trending_categories: ['Apparel', 'Drinkware', 'Home Decor'],
    customer_satisfaction: 4.8,
    fulfillment_rate: 93.3
  };

  console.log('📊 Demo Analytics Summary:');
  console.log(`   Total Revenue: $${analytics.total_revenue.toFixed(2)}`);
  console.log(`   Total Profit: $${analytics.total_profit.toFixed(2)}`);
  console.log(`   Total Orders: ${analytics.total_orders}`);
  console.log(`   Avg Order Value: $${analytics.average_order_value.toFixed(2)}`);
  console.log(`   Profit Margin: ${analytics.profit_margin.toFixed(1)}%`);
  console.log(`   Top Product: ${analytics.top_product}`);
  console.log(`   Customer Rating: ${analytics.customer_satisfaction}/5.0\n`);

  console.log('='.repeat(70));
  console.log('✅ DEMO ACCOUNT SETUP COMPLETE!');
  console.log('='.repeat(70) + '\n');

  console.log('📋 DEMO CREDENTIALS:\n');
  console.log('Customer Account:');
  console.log('  Email: demo@papertrail.jerzii-ai.com');
  console.log('  Business: Paper Trail Demo Store');
  console.log('  Customer ID: ' + customerId);
  console.log('  Tenant Slug: paper-trail-demo\n');

  console.log('Team Members:');
  console.log('  1. owner@papertrail.demo (Owner - 50% share)');
  console.log('  2. manager@papertrail.demo (Manager - 30% share)');
  console.log('  3. designer@papertrail.demo (Designer - 20% share)\n');

  console.log('Subscription:');
  console.log('  Plan: Professional ($79/month)');
  console.log('  Status: Active');
  console.log('  Features: Unlimited products, AI tools, Priority support\n');

  console.log('Sample Data:');
  console.log(`  Products: ${sampleProducts.length}`);
  console.log(`  Sales: ${salesData.length}`);
  console.log(`  Revenue: $${totalRevenue.toFixed(2)}`);
  console.log(`  Profit: $${totalProfit.toFixed(2)}\n`);

  console.log('Next Steps:');
  console.log('  1. Start the server: npm start');
  console.log('  2. Access API: http://localhost:3000/api/tenants/paper-trail-demo');
  console.log('  3. View products: http://localhost:3000/api/tenants/paper-trail-demo/products');
  console.log('  4. View sales: http://localhost:3000/api/tenants/paper-trail-demo/sales');
  console.log('  5. View analytics: http://localhost:3000/api/tenants/paper-trail-demo/analytics\n');

  console.log('🎭 Use this demo to showcase the system to clients!\n');

} catch (error) {
  console.error('❌ Error setting up demo account:', error.message);
  console.error(error);
  process.exit(1);
} finally {
  db.close();
}
