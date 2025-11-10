#!/usr/bin/env node

import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, '..', 'database.db');

console.log('\n' + '='.repeat(70));
console.log('🎭 DEMO DATABASE VIEWER - Paper Trail System');
console.log('='.repeat(70) + '\n');

const db = new Database(dbPath, { readonly: true });

try {
  // 1. Customer Info
  console.log('📋 CUSTOMER ACCOUNT:\n');
  const customer = db.prepare(`
    SELECT * FROM customers WHERE email = 'demo@papertrail.jerzii-ai.com'
  `).get();

  if (customer) {
    console.log(`  ID: ${customer.id}`);
    console.log(`  Email: ${customer.email}`);
    console.log(`  Name: ${customer.name}`);
    console.log(`  Company: ${customer.company_name}`);
    console.log(`  Stripe ID: ${customer.stripe_customer_id}`);
    console.log(`  Created: ${customer.created_at}\n`);
  }

  // 2. Subscription Info
  console.log('💳 SUBSCRIPTION:\n');
  const subscription = db.prepare(`
    SELECT s.*, p.name as package_name, p.price_monthly
    FROM subscriptions s
    JOIN subscription_packages p ON s.package_id = p.id
    WHERE s.customer_id = ?
  `).get(customer.id);

  if (subscription) {
    console.log(`  Plan: ${subscription.package_name}`);
    console.log(`  Price: $${subscription.price_monthly}/month`);
    console.log(`  Status: ${subscription.status}`);
    console.log(`  Period: ${subscription.current_period_start} to ${subscription.current_period_end}\n`);
  }

  // 3. Tenant Info
  console.log('🏢 TENANT:\n');
  const tenant = db.prepare(`
    SELECT * FROM tenants WHERE slug = 'paper-trail-demo'
  `).get();

  if (tenant) {
    console.log(`  ID: ${tenant.id}`);
    console.log(`  Name: ${tenant.name}`);
    console.log(`  Slug: ${tenant.slug}`);
    console.log(`  Status: ${tenant.status}`);
    console.log(`  Settings: ${tenant.settings}\n`);
  }

  // 4. Team Members
  console.log('👥 TEAM MEMBERS:\n');
  const teamMembers = db.prepare(`
    SELECT * FROM tenant_users WHERE tenant_id = ?
  `).all(tenant.id);

  teamMembers.forEach((member, idx) => {
    console.log(`  ${idx + 1}. ${member.name}`);
    console.log(`     Email: ${member.email}`);
    console.log(`     Role: ${member.role}`);
    console.log(`     Status: ${member.status}\n`);
  });

  // 5. Products
  console.log('📦 PRODUCTS:\n');
  const products = db.prepare(`
    SELECT * FROM tenant_products WHERE tenant_id = ?
  `).all(tenant.id);

  products.forEach((product, idx) => {
    const metadata = JSON.parse(product.metadata);
    console.log(`  ${idx + 1}. ${product.product_name}`);
    console.log(`     Type: ${product.product_type}`);
    console.log(`     Price: $${product.price}`);
    console.log(`     Cost: $${product.cost}`);
    console.log(`     Margin: ${product.profit_margin}%`);
    console.log(`     SKU: ${metadata.sku}`);
    console.log(`     Status: ${product.status}\n`);
  });

  // 6. Sales Summary
  console.log('💰 SALES DATA:\n');
  const salesStats = db.prepare(`
    SELECT
      COUNT(*) as total_orders,
      SUM(revenue) as total_revenue,
      SUM(cost) as total_cost,
      SUM(profit) as total_profit,
      AVG(profit) as avg_profit_per_order,
      MIN(sale_date) as first_sale,
      MAX(sale_date) as latest_sale
    FROM tenant_sales
    WHERE tenant_id = ?
  `).get(tenant.id);

  console.log(`  Total Orders: ${salesStats.total_orders}`);
  console.log(`  Total Revenue: $${salesStats.total_revenue.toFixed(2)}`);
  console.log(`  Total Cost: $${salesStats.total_cost.toFixed(2)}`);
  console.log(`  Total Profit: $${salesStats.total_profit.toFixed(2)}`);
  console.log(`  Profit Margin: ${((salesStats.total_profit / salesStats.total_revenue) * 100).toFixed(1)}%`);
  console.log(`  Avg Profit/Order: $${salesStats.avg_profit_per_order.toFixed(2)}`);
  console.log(`  First Sale: ${salesStats.first_sale}`);
  console.log(`  Latest Sale: ${salesStats.latest_sale}\n`);

  // 7. Recent Sales
  console.log('🛍️  RECENT SALES (Last 5):\n');
  const recentSales = db.prepare(`
    SELECT * FROM tenant_sales
    WHERE tenant_id = ?
    ORDER BY sale_date DESC
    LIMIT 5
  `).all(tenant.id);

  recentSales.forEach((sale, idx) => {
    const metadata = JSON.parse(sale.metadata);
    console.log(`  ${idx + 1}. Order ${sale.order_id}`);
    console.log(`     Product: ${metadata.product_name}`);
    console.log(`     Quantity: ${metadata.quantity}`);
    console.log(`     Revenue: $${sale.revenue.toFixed(2)}`);
    console.log(`     Profit: $${sale.profit.toFixed(2)}`);
    console.log(`     Date: ${sale.sale_date}`);
    console.log(`     Status: ${metadata.status}\n`);
  });

  // 8. Product Performance
  console.log('📊 PRODUCT PERFORMANCE:\n');
  const productPerf = db.prepare(`
    SELECT
      metadata,
      COUNT(*) as orders,
      SUM(revenue) as revenue,
      SUM(profit) as profit
    FROM tenant_sales
    WHERE tenant_id = ?
    GROUP BY metadata
    ORDER BY profit DESC
    LIMIT 5
  `).all(tenant.id);

  productPerf.forEach((perf, idx) => {
    const metadata = JSON.parse(perf.metadata);
    console.log(`  ${idx + 1}. ${metadata.product_name}`);
    console.log(`     Orders: ${perf.orders}`);
    console.log(`     Revenue: $${perf.revenue.toFixed(2)}`);
    console.log(`     Profit: $${perf.profit.toFixed(2)}\n`);
  });

  // 9. Onboarding Status
  console.log('✅ ONBOARDING STATUS:\n');
  const onboarding = db.prepare(`
    SELECT * FROM onboarding_progress WHERE customer_id = ?
  `).get(customer.id);

  if (onboarding) {
    console.log(`  Progress: ${onboarding.current_step}/${onboarding.total_steps} steps`);
    console.log(`  Completed: ${onboarding.completed ? 'Yes' : 'No'}`);
    console.log(`  Started: ${onboarding.started_at}`);
    console.log(`  Completed: ${onboarding.completed_at}\n`);
  }

  const checklistItems = db.prepare(`
    SELECT * FROM onboarding_checklist
    WHERE customer_id = ?
    ORDER BY step_number
  `).all(customer.id);

  console.log('  Checklist:\n');
  checklistItems.forEach((item) => {
    const status = item.completed ? '✅' : '⏳';
    console.log(`    ${status} Step ${item.step_number}: ${item.step_name}`);
    console.log(`       ${item.step_description}`);
    if (item.completed_at) {
      console.log(`       Completed: ${item.completed_at}`);
    }
    console.log();
  });

  console.log('='.repeat(70));
  console.log('✅ Demo database contains fully functional sample data!');
  console.log('='.repeat(70) + '\n');

} catch (error) {
  console.error('❌ Error querying database:', error.message);
  console.error(error);
} finally {
  db.close();
}
