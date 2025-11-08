import sqlite3 from 'sqlite3';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../../database.db');
const schemaPath = path.join(__dirname, '../../database-schema-team-profits.sql');

console.log('🚀 Initializing Team Profit Sharing Database...\n');

// Read SQL schema
const schema = readFileSync(schemaPath, 'utf8');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to database:', dbPath);
});

// Execute schema
db.exec(schema, (err) => {
  if (err) {
    console.error('❌ Error creating schema:', err.message);
    process.exit(1);
  }

  console.log('\n✅ Database schema created successfully!');
  console.log('\n📊 Tables created:');
  console.log('   • tiers - Service tier definitions');
  console.log('   • team_members - Team member accounts');
  console.log('   • profits - Individual sales/profits tracking');
  console.log('   • revenue_shares - 25% automatic deductions');
  console.log('   • payouts - Milestone-based owner payouts');

  console.log('\n🎯 Default tiers added:');
  console.log('   • Bronze (25% share, $5K milestone)');
  console.log('   • Silver (25% share, $5K milestone)');
  console.log('   • Gold (25% share, $7.5K milestone)');
  console.log('   • Platinum (25% share, $10K milestone)');

  console.log('\n✅ System ready for team profit sharing!');
  console.log('\n💡 Next steps:');
  console.log('   1. Add team members via API');
  console.log('   2. Track profits automatically');
  console.log('   3. Monitor milestone progress');
  console.log('   4. Collect payouts when milestones reached\n');

  db.close();
});
