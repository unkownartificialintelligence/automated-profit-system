-- ============================================
-- STRIPE PAYMENT INTEGRATION SCHEMA
-- ============================================

-- Customers table (linked to team_members or standalone)
CREATE TABLE IF NOT EXISTS customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  team_member_id INTEGER,
  stripe_customer_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  company_name TEXT,
  phone TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'US',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (team_member_id) REFERENCES team_members(id) ON DELETE SET NULL
);

-- Subscription packages
CREATE TABLE IF NOT EXISTS subscription_packages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL, -- Starter, Professional, Enterprise, Enterprise Plus
  stripe_price_id TEXT UNIQUE NOT NULL,
  stripe_product_id TEXT NOT NULL,
  price_monthly DECIMAL(10,2) NOT NULL,
  price_annual DECIMAL(10,2),
  currency TEXT DEFAULT 'usd',
  features TEXT, -- JSON array of features
  max_products INTEGER,
  max_sales_tracking INTEGER,
  ai_features BOOLEAN DEFAULT 0,
  integrations TEXT, -- JSON array of available integrations
  white_label BOOLEAN DEFAULT 0,
  api_access BOOLEAN DEFAULT 0,
  priority_support BOOLEAN DEFAULT 0,
  active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Active subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER NOT NULL,
  package_id INTEGER NOT NULL,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL, -- active, trialing, past_due, canceled, incomplete
  current_period_start DATETIME,
  current_period_end DATETIME,
  cancel_at_period_end BOOLEAN DEFAULT 0,
  canceled_at DATETIME,
  trial_start DATETIME,
  trial_end DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  FOREIGN KEY (package_id) REFERENCES subscription_packages(id)
);

-- Payment transactions
CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER NOT NULL,
  subscription_id INTEGER,
  stripe_payment_intent_id TEXT UNIQUE NOT NULL,
  stripe_charge_id TEXT,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL, -- succeeded, pending, failed, refunded
  payment_method TEXT, -- card, bank_transfer, etc.
  description TEXT,
  receipt_url TEXT,
  invoice_id INTEGER,
  metadata TEXT, -- JSON for additional data
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE SET NULL,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE SET NULL
);

-- Automated invoices
CREATE TABLE IF NOT EXISTS invoices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER NOT NULL,
  subscription_id INTEGER,
  stripe_invoice_id TEXT UNIQUE,
  invoice_number TEXT UNIQUE NOT NULL,
  amount_due DECIMAL(10,2) NOT NULL,
  amount_paid DECIMAL(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL, -- draft, open, paid, void, uncollectible
  due_date DATETIME,
  paid_at DATETIME,
  invoice_pdf_url TEXT,
  hosted_invoice_url TEXT,
  description TEXT,
  line_items TEXT, -- JSON array of line items
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE SET NULL
);

-- Stripe webhook events log
CREATE TABLE IF NOT EXISTS stripe_webhook_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  stripe_event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL, -- payment_intent.succeeded, customer.subscription.updated, etc.
  object_id TEXT, -- The ID of the object the event is about
  processed BOOLEAN DEFAULT 0,
  processing_error TEXT,
  raw_data TEXT, -- Full JSON payload
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  processed_at DATETIME
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_customers_stripe_id ON customers(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_subscriptions_customer ON subscriptions(customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_payments_customer ON payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_invoices_customer ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_webhook_events_type ON stripe_webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed ON stripe_webhook_events(processed);

-- ============================================
-- INSERT DEFAULT SUBSCRIPTION PACKAGES
-- ============================================

INSERT INTO subscription_packages (
  name, stripe_price_id, stripe_product_id,
  price_monthly, price_annual, features,
  max_products, max_sales_tracking,
  ai_features, integrations, white_label, api_access, priority_support
) VALUES
  -- Starter Package ($397/month)
  (
    'Starter',
    'price_starter_monthly', -- Replace with actual Stripe Price ID
    'prod_starter', -- Replace with actual Stripe Product ID
    397.00,
    4164.00, -- 397 * 12 * 0.88 (12% discount)
    '["Printful Integration", "Product Research Tools", "Basic Analytics", "Sales Tracking", "Email Support"]',
    100,
    1000,
    0,
    '["printful"]',
    0,
    0,
    0
  ),
  -- Professional Package ($2,699/month)
  (
    'Professional',
    'price_professional_monthly',
    'prod_professional',
    2699.00,
    28309.00, -- 2699 * 12 * 0.88
    '["Everything in Starter", "AI Keyword Optimizer", "Advanced Trend Predictor", "Multi-Platform Integration", "Priority Email Support", "Automated Reporting"]',
    500,
    10000,
    1,
    '["printful", "shopify", "etsy"]',
    0,
    0,
    1
  ),
  -- Enterprise Package ($7,699/month)
  (
    'Enterprise',
    'price_enterprise_monthly',
    'prod_enterprise',
    7699.00,
    80717.00, -- 7699 * 12 * 0.88
    '["Everything in Professional", "AI Product Description Generator", "Shopify Integration", "Etsy Integration", "White-Label Branding", "Advanced Analytics", "Customer Lifetime Value Tracking", "Dedicated Account Manager", "24/7 Priority Support"]',
    2000,
    100000,
    1,
    '["printful", "shopify", "etsy", "woocommerce"]',
    1,
    1,
    1
  ),
  -- Enterprise Plus Package ($12,699/month)
  (
    'Enterprise Plus',
    'price_enterprise_plus_monthly',
    'prod_enterprise_plus',
    12699.00,
    133139.00, -- 12699 * 12 * 0.88
    '["Everything in Enterprise", "AI Social Media Content Generator", "AI Customer Service Bot", "Email Marketing Automation", "Price Optimization Engine", "WooCommerce Integration", "Custom Integrations", "White-Label Reseller License", "Custom Reporting", "Dedicated Success Team"]',
    10000,
    1000000,
    1,
    '["printful", "shopify", "etsy", "woocommerce", "amazon", "walmart", "custom"]',
    1,
    1,
    1
  );

-- ============================================
-- TRIGGERS FOR AUTO-UPDATES
-- ============================================

-- Update customers timestamp
CREATE TRIGGER IF NOT EXISTS update_customers_timestamp
AFTER UPDATE ON customers
BEGIN
  UPDATE customers SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Update subscriptions timestamp
CREATE TRIGGER IF NOT EXISTS update_subscriptions_timestamp
AFTER UPDATE ON subscriptions
BEGIN
  UPDATE subscriptions SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Update payments timestamp
CREATE TRIGGER IF NOT EXISTS update_payments_timestamp
AFTER UPDATE ON payments
BEGIN
  UPDATE payments SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Update invoices timestamp
CREATE TRIGGER IF NOT EXISTS update_invoices_timestamp
AFTER UPDATE ON invoices
BEGIN
  UPDATE invoices SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Auto-generate invoice number
CREATE TRIGGER IF NOT EXISTS generate_invoice_number
AFTER INSERT ON invoices
WHEN NEW.invoice_number IS NULL
BEGIN
  UPDATE invoices
  SET invoice_number = 'INV-' || strftime('%Y%m', 'now') || '-' || printf('%05d', NEW.id)
  WHERE id = NEW.id;
END;
