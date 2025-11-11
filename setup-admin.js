import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';

const db = new sqlite3.Database('./database.db');

// Create admin tables
db.serialize(() => {
  // Admin users table
  db.run(`CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Clients table
  db.run(`CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_name TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    package_tier TEXT NOT NULL,
    subscription_status TEXT DEFAULT 'active',
    monthly_revenue REAL DEFAULT 0,
    setup_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    printful_api_key TEXT,
    custom_domain TEXT,
    notes TEXT
  )`);

  // Client analytics table
  db.run(`CREATE TABLE IF NOT EXISTS client_analytics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL,
    date DATE NOT NULL,
    revenue REAL DEFAULT 0,
    orders INTEGER DEFAULT 0,
    profit REAL DEFAULT 0,
    products_sold INTEGER DEFAULT 0,
    FOREIGN KEY (client_id) REFERENCES clients(id)
  )`);

  // System logs table
  db.run(`CREATE TABLE IF NOT EXISTS system_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    log_type TEXT NOT NULL,
    severity TEXT NOT NULL,
    message TEXT NOT NULL,
    client_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id)
  )`);

  // Team activity table
  db.run(`CREATE TABLE IF NOT EXISTS team_activity (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_id INTEGER NOT NULL,
    action TEXT NOT NULL,
    client_id INTEGER,
    details TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admin_users(id)
  )`);

  // Create default admin user
  const hashedPassword = bcrypt.hashSync('admin123', 10);
  db.run(`INSERT OR IGNORE INTO admin_users (email, password, name, role) 
          VALUES ('admin@jerzii.ai', ?, 'Admin User', 'admin')`, [hashedPassword]);

  console.log('✅ Admin database initialized');
  console.log('📧 Default admin: admin@jerzii.ai');
  console.log('🔑 Default password: admin123');
  console.log('⚠️  Change this password immediately!');
  
  db.close();
});
