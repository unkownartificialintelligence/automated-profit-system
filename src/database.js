import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db;

async function initDatabase() {
  db = await open({
    filename: path.join(__dirname, '../data/app.db'),
    driver: sqlite3.Database
  });

  // Create tables
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'client',
      company TEXT,
      status TEXT DEFAULT 'active',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      last_login TEXT
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      sku TEXT UNIQUE NOT NULL,
      price REAL NOT NULL,
      status TEXT DEFAULT 'draft',
      description TEXT,
      sales INTEGER DEFAULT 0,
      revenue REAL DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER,
      revenue REAL NOT NULL,
      profit REAL NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

    CREATE TABLE IF NOT EXISTS team_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      status TEXT DEFAULT 'active',
      total_revenue REAL DEFAULT 0,
      total_profit REAL DEFAULT 0,
      commission_rate REAL DEFAULT 10,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS automation_status (
      id INTEGER PRIMARY KEY DEFAULT 1,
      active INTEGER DEFAULT 0,
      last_run TEXT,
      next_scheduled TEXT,
      total_runs INTEGER DEFAULT 0,
      success_rate REAL DEFAULT 0,
      CHECK (id = 1)
    );

    CREATE TABLE IF NOT EXISTS trending_keywords (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      keyword TEXT NOT NULL,
      country_code TEXT NOT NULL,
      articles INTEGER DEFAULT 0,
      traffic TEXT,
      growth REAL DEFAULT 0,
      potential TEXT DEFAULT 'medium',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS activity_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS personal_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      priority TEXT DEFAULT 'medium',
      revenue REAL DEFAULT 0,
      due_date TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY DEFAULT 1,
      user_name TEXT,
      user_email TEXT,
      user_company TEXT,
      user_phone TEXT,
      printful_api_key TEXT,
      canva_api_key TEXT,
      stripe_api_key TEXT,
      openai_api_key TEXT,
      email_notifications INTEGER DEFAULT 1,
      automation_alerts INTEGER DEFAULT 1,
      weekly_reports INTEGER DEFAULT 1,
      theme TEXT DEFAULT 'light',
      language TEXT DEFAULT 'en',
      CHECK (id = 1)
    );
  `);

  // Insert default automation status if doesn't exist
  await db.run(`
    INSERT OR IGNORE INTO automation_status (id, active, total_runs, success_rate)
    VALUES (1, 0, 0, 0)
  `);

  // Insert default settings if doesn't exist
  await db.run(`
    INSERT OR IGNORE INTO settings (id)
    VALUES (1)
  `);

  return db;
}

// Initialize database on module load
const dbPromise = initDatabase();

export default {
  async get(sql, params = []) {
    const database = await dbPromise;
    return database.get(sql, params);
  },
  async all(sql, params = []) {
    const database = await dbPromise;
    return database.all(sql, params);
  },
  async run(sql, params = []) {
    const database = await dbPromise;
    return database.run(sql, params);
  },
  async exec(sql) {
    const database = await dbPromise;
    return database.exec(sql);
  }
};
