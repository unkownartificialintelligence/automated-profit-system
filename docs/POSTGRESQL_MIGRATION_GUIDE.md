# PostgreSQL Migration Guide

## Overview
This guide explains how to migrate from SQLite to PostgreSQL for production deployment.

## Why Migrate to PostgreSQL?

### SQLite Limitations (Current Setup)
- ❌ Single-writer limitation (poor concurrency)
- ❌ No built-in replication
- ❌ File-based (can corrupt on server crashes)
- ❌ Limited to single server
- ⚠️ Not recommended for production web applications

### PostgreSQL Benefits
- ✅ Excellent concurrency (handles many simultaneous users)
- ✅ Built-in replication and backups
- ✅ Industry-standard for production
- ✅ Scales horizontally and vertically
- ✅ Advanced features (JSON, full-text search, etc.)
- ✅ Free on Render.com

## Migration Steps

### Option 1: Render PostgreSQL (Recommended)

#### 1. Add PostgreSQL to render.yaml

Update **render.yaml**:

```yaml
services:
  # Add PostgreSQL database
  - type: pserv
    name: automated-profit-db
    plan: starter  # Free tier
    region: oregon
    databaseName: automated_profit_system
    databaseUser: app_user

  # Update web service
  - type: web
    name: automated-profit-system
    runtime: node
    region: oregon
    plan: starter
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production

      # Database will be auto-populated by Render
      - key: DATABASE_URL
        fromDatabase:
          name: automated-profit-db
          property: connectionString

      # ... other env vars ...
```

#### 2. Install PostgreSQL Driver

```bash
npm install pg --save
npm uninstall sqlite3
```

#### 3. Create Database Connection Module

Create **src/database/connection.js**:

```javascript
import pkg from 'pg';
const { Pool } = pkg;
import logger from '../utils/logger.js';

let pool;

export const initDatabase = () => {
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    // PostgreSQL for production
    if (!process.env.DATABASE_URL) {
      logger.error('DATABASE_URL not set in production environment');
      process.exit(1);
    }

    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false // Required for Render
      },
      max: 20, // Maximum number of clients
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    logger.info('PostgreSQL connection pool initialized');
  } else {
    // SQLite for development
    const sqlite3 = require('sqlite3').verbose();
    pool = new sqlite3.Database('./database.db', (err) => {
      if (err) {
        logger.error('SQLite connection failed', err);
        process.exit(1);
      }
      logger.info('SQLite database connected');
    });
  }

  return pool;
};

export const getDb = () => {
  if (!pool) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return pool;
};

export const query = async (text, params = []) => {
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    // PostgreSQL query
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;

    if (process.env.LOG_LEVEL === 'debug') {
      logger.debug('Database query executed', { text, duration, rows: res.rowCount });
    }

    return res;
  } else {
    // SQLite query (wrapped in promise)
    return new Promise((resolve, reject) => {
      pool.all(text, params, (err, rows) => {
        if (err) reject(err);
        else resolve({ rows });
      });
    });
  }
};

export default { initDatabase, getDb, query };
```

#### 4. Update Database Schema for PostgreSQL

Create **src/database/schema-postgresql.sql**:

```sql
-- PostgreSQL Schema
-- Run this to create tables in PostgreSQL

-- Drop existing tables if migrating
DROP TABLE IF EXISTS revenue_shares CASCADE;
DROP TABLE IF EXISTS payouts CASCADE;
DROP TABLE IF EXISTS profits CASCADE;
DROP TABLE IF EXISTS team_members CASCADE;
DROP TABLE IF EXISTS tiers CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS client_analytics CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;
DROP TABLE IF EXISTS team_activity CASCADE;
DROP TABLE IF EXISTS system_logs CASCADE;

-- Tiers table
CREATE TABLE tiers (
  id SERIAL PRIMARY KEY,
  tier_name VARCHAR(50) UNIQUE NOT NULL,
  revenue_share_percent DECIMAL(5,2) DEFAULT 25.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Team members table
CREATE TABLE team_members (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  tier_id INTEGER REFERENCES tiers(id),
  active BOOLEAN DEFAULT TRUE,
  total_earned DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Profits table
CREATE TABLE profits (
  id SERIAL PRIMARY KEY,
  team_member_id INTEGER REFERENCES team_members(id),
  sale_amount DECIMAL(10,2) NOT NULL,
  profit_amount DECIMAL(10,2) NOT NULL,
  product_name VARCHAR(255),
  sale_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Revenue shares table (auto-calculated from profits)
CREATE TABLE revenue_shares (
  id SERIAL PRIMARY KEY,
  team_member_id INTEGER REFERENCES team_members(id),
  profit_id INTEGER REFERENCES profits(id),
  share_amount DECIMAL(10,2) NOT NULL,
  share_percent DECIMAL(5,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payouts table
CREATE TABLE payouts (
  id SERIAL PRIMARY KEY,
  team_member_id INTEGER REFERENCES team_members(id),
  amount DECIMAL(10,2) NOT NULL,
  payout_date DATE DEFAULT CURRENT_DATE,
  status VARCHAR(50) DEFAULT 'pending',
  payment_method VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Clients table
CREATE TABLE clients (
  id SERIAL PRIMARY KEY,
  company_name VARCHAR(255) NOT NULL,
  contact_name VARCHAR(255),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  package_tier VARCHAR(50),
  printful_api_key TEXT,
  subscription_status VARCHAR(50) DEFAULT 'active',
  monthly_revenue DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Client analytics table
CREATE TABLE client_analytics (
  id SERIAL PRIMARY KEY,
  client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  revenue DECIMAL(10,2) DEFAULT 0,
  orders INTEGER DEFAULT 0,
  profit DECIMAL(10,2) DEFAULT 0,
  products_sold INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin users table
CREATE TABLE admin_users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Team activity log
CREATE TABLE team_activity (
  id SERIAL PRIMARY KEY,
  admin_id INTEGER REFERENCES admin_users(id),
  action VARCHAR(100) NOT NULL,
  client_id INTEGER REFERENCES clients(id),
  details TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System logs
CREATE TABLE system_logs (
  id SERIAL PRIMARY KEY,
  log_type VARCHAR(50),
  severity VARCHAR(20),
  message TEXT,
  client_id INTEGER REFERENCES clients(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_team_members_email ON team_members(email);
CREATE INDEX idx_profits_team_member ON profits(team_member_id);
CREATE INDEX idx_profits_date ON profits(sale_date);
CREATE INDEX idx_revenue_shares_team_member ON revenue_shares(team_member_id);
CREATE INDEX idx_payouts_team_member ON payouts(team_member_id);
CREATE INDEX idx_client_analytics_client ON client_analytics(client_id);
CREATE INDEX idx_client_analytics_date ON client_analytics(date);

-- Insert default tiers
INSERT INTO tiers (tier_name, revenue_share_percent) VALUES
  ('Basic', 25.00),
  ('Pro', 25.00),
  ('Enterprise', 25.00);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON team_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### 5. Update Routes to Use New Connection

Example migration in **src/routes/admin.js**:

```javascript
// OLD (SQLite)
import sqlite3 from 'sqlite3';
const db = new sqlite3.Database('./database.db');

router.get('/clients', adminAuth, (req, res) => {
  db.all('SELECT * FROM clients', [], (err, clients) => {
    if (err) return res.status(500).json({ success: false });
    res.json({ success: true, clients });
  });
});

// NEW (PostgreSQL compatible)
import { query } from '../database/connection.js';

router.get('/clients', adminAuth, async (req, res) => {
  try {
    const result = await query('SELECT * FROM clients ORDER BY created_at DESC');
    res.json({ success: true, clients: result.rows });
  } catch (error) {
    logger.error('Failed to fetch clients', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});
```

### Option 2: External PostgreSQL Provider

If not using Render, consider:

1. **Supabase** (Free tier available)
   - https://supabase.com
   - 500MB database, 2GB bandwidth

2. **Neon** (Serverless PostgreSQL)
   - https://neon.tech
   - Free tier with 3GB storage

3. **Railway** (Simple setup)
   - https://railway.app
   - $5/month

## Migration Checklist

- [ ] Backup current SQLite data
- [ ] Add PostgreSQL to hosting platform
- [ ] Install `pg` npm package
- [ ] Create database connection module
- [ ] Run PostgreSQL schema creation
- [ ] Update all routes to use async/await
- [ ] Test locally with PostgreSQL
- [ ] Migrate existing data (if needed)
- [ ] Deploy to production
- [ ] Verify all endpoints work
- [ ] Monitor for errors

## Data Migration (Optional)

If you have existing data in SQLite:

```bash
# Export SQLite to CSV
sqlite3 database.db <<EOF
.headers on
.mode csv
.output clients.csv
SELECT * FROM clients;
.output team_members.csv
SELECT * FROM team_members;
EOF

# Import to PostgreSQL
psql $DATABASE_URL <<EOF
\\copy clients FROM 'clients.csv' WITH CSV HEADER;
\\copy team_members FROM 'team_members.csv' WITH CSV HEADER;
EOF
```

## Testing

After migration:

```bash
# Test database connection
curl http://localhost:3000/api/health

# Check logs
tail -f logs/combined.log
```

## Rollback Plan

If issues occur:
1. Keep SQLite database as backup
2. Use environment variable to switch: `USE_POSTGRESQL=false`
3. Deploy previous version from git

## Support

- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **Render PostgreSQL**: https://render.com/docs/databases
- **pg NPM Package**: https://node-postgres.com/
