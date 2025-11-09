import Database from 'better-sqlite3';

const db = new Database('./database.db');

console.log('📊 Payment Tables:');
const tables = db.prepare(`
  SELECT name FROM sqlite_master
  WHERE type='table' AND (
    name LIKE '%customer%' OR
    name LIKE '%subscr%' OR
    name LIKE '%pay%' OR
    name LIKE '%inv%' OR
    name = 'stripe_webhook_events'
  )
  ORDER BY name
`).all();

tables.forEach(t => console.log(`  ✓ ${t.name}`));

console.log('\n📦 Subscription Packages:');
const packages = db.prepare('SELECT id, name, price_monthly FROM subscription_packages').all();
packages.forEach(p => console.log(`  ${p.id}. ${p.name} - $${p.price_monthly}/month`));

db.close();
console.log('\n✅ Database verification complete!');
