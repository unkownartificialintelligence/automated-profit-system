import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./database.db');

// Profit Tracking & Revenue Database Schema
db.serialize(() => {
  console.log('💰 Initializing Profit Tracking System...\n');

  // === PRODUCTS & INVENTORY ===
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    printful_id INTEGER UNIQUE,
    sku TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    niche TEXT,
    base_price REAL NOT NULL,
    selling_price REAL NOT NULL,
    profit_margin REAL,
    design_url TEXT,
    mockup_url TEXT,
    tags TEXT, -- JSON array
    trend_score INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active', -- 'active', 'paused', 'archived'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // === SALES & ORDERS ===
  db.run(`CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id TEXT UNIQUE NOT NULL,
    product_id INTEGER NOT NULL,
    platform TEXT NOT NULL, -- 'shopify', 'etsy', 'printful', 'custom'
    customer_email TEXT,
    customer_name TEXT,
    quantity INTEGER DEFAULT 1,
    unit_price REAL NOT NULL,
    total_amount REAL NOT NULL,
    cost_of_goods REAL NOT NULL,
    profit REAL NOT NULL,
    commission REAL DEFAULT 0,
    net_profit REAL,
    order_status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'
    payment_status TEXT DEFAULT 'unpaid', -- 'unpaid', 'paid', 'refunded'
    tracking_number TEXT,
    order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    shipped_date DATETIME,
    delivered_date DATETIME,
    FOREIGN KEY (product_id) REFERENCES products(id)
  )`);

  // === REVENUE TRACKING ===
  db.run(`CREATE TABLE IF NOT EXISTS revenue_daily (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date DATE UNIQUE NOT NULL,
    total_sales REAL DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    total_cost REAL DEFAULT 0,
    total_profit REAL DEFAULT 0,
    avg_order_value REAL DEFAULT 0,
    conversion_rate REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // === EXPENSES ===
  db.run(`CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL, -- 'advertising', 'software', 'design', 'hosting', 'other'
    description TEXT NOT NULL,
    amount REAL NOT NULL,
    payment_method TEXT,
    receipt_url TEXT,
    expense_date DATE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // === TRENDING NICHES ===
  db.run(`CREATE TABLE IF NOT EXISTS trending_niches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    keyword TEXT UNIQUE NOT NULL,
    search_volume INTEGER DEFAULT 0,
    competition_level TEXT, -- 'low', 'medium', 'high'
    trend_direction TEXT, -- 'rising', 'stable', 'falling'
    profit_potential INTEGER DEFAULT 0, -- 0-100 score
    products_created INTEGER DEFAULT 0,
    total_revenue REAL DEFAULT 0,
    status TEXT DEFAULT 'active', -- 'active', 'saturated', 'expired'
    discovered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_analyzed DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // === PLATFORM INTEGRATIONS ===
  db.run(`CREATE TABLE IF NOT EXISTS platform_connections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    platform TEXT UNIQUE NOT NULL, -- 'shopify', 'etsy', 'printful'
    api_key TEXT,
    api_secret TEXT,
    store_url TEXT,
    store_name TEXT,
    is_active BOOLEAN DEFAULT 1,
    last_sync DATETIME,
    total_sales REAL DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    connected_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // === AUTOMATION LOGS ===
  db.run(`CREATE TABLE IF NOT EXISTS automation_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    automation_type TEXT NOT NULL, -- 'trend_analysis', 'product_creation', 'order_sync', 'price_update'
    status TEXT NOT NULL, -- 'success', 'failed', 'partial'
    details TEXT,
    items_processed INTEGER DEFAULT 0,
    revenue_generated REAL DEFAULT 0,
    execution_time INTEGER, -- milliseconds
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // === PROFIT GOALS ===
  db.run(`CREATE TABLE IF NOT EXISTS profit_goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    period TEXT NOT NULL, -- 'daily', 'weekly', 'monthly', 'yearly'
    target_amount REAL NOT NULL,
    current_amount REAL DEFAULT 0,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    achieved BOOLEAN DEFAULT 0,
    achieved_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // === CUSTOMER LIFETIME VALUE ===
  db.run(`CREATE TABLE IF NOT EXISTS customer_ltv (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_email TEXT UNIQUE NOT NULL,
    customer_name TEXT,
    total_orders INTEGER DEFAULT 0,
    total_spent REAL DEFAULT 0,
    total_profit REAL DEFAULT 0,
    first_purchase DATETIME,
    last_purchase DATETIME,
    avg_order_value REAL DEFAULT 0,
    ltv_score INTEGER DEFAULT 0, -- 0-100
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  console.log('✅ Profit tracking tables created');

  // Insert sample data
  console.log('📊 Adding sample data...\n');

  // Sample trending niches
  const niches = [
    { keyword: 'AI Technology T-Shirts', volume: 15000, competition: 'medium', trend: 'rising', potential: 85 },
    { keyword: 'Sustainable Living Merch', volume: 12000, competition: 'low', trend: 'rising', potential: 90 },
    { keyword: 'Gaming Culture Hoodies', volume: 25000, competition: 'high', trend: 'stable', potential: 70 },
    { keyword: 'Minimalist Art Prints', volume: 8000, competition: 'low', trend: 'rising', potential: 88 },
    { keyword: 'Fitness Motivation Gear', volume: 18000, competition: 'medium', trend: 'stable', potential: 75 }
  ];

  const insertNiche = db.prepare(`
    INSERT OR IGNORE INTO trending_niches (keyword, search_volume, competition_level, trend_direction, profit_potential)
    VALUES (?, ?, ?, ?, ?)
  `);

  niches.forEach(n => {
    insertNiche.run(n.keyword, n.volume, n.competition, n.trend, n.potential);
  });
  insertNiche.finalize();

  // Sample profit goals
  const today = new Date();
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  db.run(`
    INSERT OR IGNORE INTO profit_goals (period, target_amount, start_date, end_date)
    VALUES ('monthly', 5000, date('now', 'start of month'), date('now', 'start of month', '+1 month'))
  `);

  // Sample platform connection (Printful)
  db.run(`
    INSERT OR IGNORE INTO platform_connections (platform, store_name, is_active)
    VALUES ('printful', 'Jerzii AI Store', 1)
  `);

  console.log('✅ Sample trending niches added');
  console.log('✅ Profit goals initialized');
  console.log('✅ Platform connections configured\n');
  console.log('💰 Profit tracking system ready!\n');
  console.log('📈 Next steps:');
  console.log('   1. Configure Printful API key in .env');
  console.log('   2. Run trend analysis: node src/services/trendAnalysis.js');
  console.log('   3. Start creating products');
  console.log('   4. Monitor profits in admin dashboard\n');

  db.close();
});
