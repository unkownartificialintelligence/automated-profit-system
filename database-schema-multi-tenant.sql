-- ============================================
-- MULTI-TENANT SYSTEM SCHEMA
-- ============================================

-- Tenants (Organizations/Clients)
CREATE TABLE IF NOT EXISTS tenants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL, -- URL-safe identifier
  domain TEXT, -- Custom domain for white-label
  subscription_id INTEGER,
  status TEXT DEFAULT 'active', -- active, suspended, cancelled
  settings TEXT, -- JSON for tenant-specific settings
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE SET NULL
);

-- Tenant Users (multiple users per tenant)
CREATE TABLE IF NOT EXISTS tenant_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL,
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'member', -- owner, admin, member, viewer
  status TEXT DEFAULT 'active', -- active, inactive, invited
  last_login_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  UNIQUE(tenant_id, email)
);

-- Per-tenant API keys
CREATE TABLE IF NOT EXISTS tenant_api_keys (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL,
  key_name TEXT NOT NULL,
  service TEXT NOT NULL, -- printful, shopify, etsy, openai, etc.
  api_key TEXT NOT NULL,
  api_secret TEXT,
  encrypted BOOLEAN DEFAULT 0,
  active BOOLEAN DEFAULT 1,
  expires_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- Usage tracking per tenant
CREATE TABLE IF NOT EXISTS tenant_usage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL,
  metric_type TEXT NOT NULL, -- products_created, api_calls, ai_requests, storage_mb, etc.
  metric_value INTEGER NOT NULL DEFAULT 0,
  period_start DATETIME NOT NULL,
  period_end DATETIME NOT NULL,
  metadata TEXT, -- JSON for additional data
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- Tenant-specific products (isolated per tenant)
CREATE TABLE IF NOT EXISTS tenant_products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL,
  product_name TEXT NOT NULL,
  product_type TEXT, -- t-shirt, mug, poster, etc.
  printful_id TEXT,
  shopify_id TEXT,
  etsy_id TEXT,
  cost DECIMAL(10,2),
  price DECIMAL(10,2),
  profit_margin DECIMAL(5,2),
  status TEXT DEFAULT 'draft', -- draft, active, archived
  metadata TEXT, -- JSON for product details
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- Tenant-specific sales (isolated per tenant)
CREATE TABLE IF NOT EXISTS tenant_sales (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL,
  product_id INTEGER,
  order_id TEXT,
  platform TEXT, -- shopify, etsy, manual
  revenue DECIMAL(10,2) NOT NULL,
  cost DECIMAL(10,2) NOT NULL,
  profit DECIMAL(10,2) NOT NULL,
  customer_email TEXT,
  sale_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  metadata TEXT, -- JSON for order details
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES tenant_products(id) ON DELETE SET NULL
);

-- Admin activity logs
CREATE TABLE IF NOT EXISTS admin_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  admin_user_id INTEGER,
  action TEXT NOT NULL, -- tenant_created, tenant_suspended, usage_checked, etc.
  target_tenant_id INTEGER,
  details TEXT, -- JSON for action details
  ip_address TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tenant invitations
CREATE TABLE IF NOT EXISTS tenant_invitations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'member',
  token TEXT UNIQUE NOT NULL,
  invited_by INTEGER,
  accepted BOOLEAN DEFAULT 0,
  accepted_at DATETIME,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (invited_by) REFERENCES tenant_users(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);
CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenants(status);
CREATE INDEX IF NOT EXISTS idx_tenant_users_tenant ON tenant_users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_users_email ON tenant_users(email);
CREATE INDEX IF NOT EXISTS idx_tenant_api_keys_tenant ON tenant_api_keys(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_api_keys_service ON tenant_api_keys(service);
CREATE INDEX IF NOT EXISTS idx_tenant_usage_tenant ON tenant_usage(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_usage_period ON tenant_usage(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_tenant_products_tenant ON tenant_products(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_sales_tenant ON tenant_sales(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_sales_date ON tenant_sales(sale_date);
CREATE INDEX IF NOT EXISTS idx_admin_logs_tenant ON admin_logs(target_tenant_id);

-- Triggers
CREATE TRIGGER IF NOT EXISTS update_tenants_timestamp
AFTER UPDATE ON tenants
BEGIN
  UPDATE tenants SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_tenant_users_timestamp
AFTER UPDATE ON tenant_users
BEGIN
  UPDATE tenant_users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_tenant_products_timestamp
AFTER UPDATE ON tenant_products
BEGIN
  UPDATE tenant_products SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
