-- ============================================
-- CLIENT ONBOARDING SYSTEM SCHEMA
-- ============================================

-- Onboarding status tracking
CREATE TABLE IF NOT EXISTS onboarding_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER NOT NULL,
  subscription_id INTEGER,
  current_step INTEGER DEFAULT 1,
  total_steps INTEGER DEFAULT 7,
  completed BOOLEAN DEFAULT 0,
  started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  last_active_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  metadata TEXT, -- JSON for additional tracking data
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE SET NULL
);

-- Onboarding checklist items
CREATE TABLE IF NOT EXISTS onboarding_checklist (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER NOT NULL,
  step_number INTEGER NOT NULL,
  step_name TEXT NOT NULL,
  step_description TEXT,
  required BOOLEAN DEFAULT 1,
  completed BOOLEAN DEFAULT 0,
  completed_at DATETIME,
  data TEXT, -- JSON for step-specific data
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- Email tracking for onboarding
CREATE TABLE IF NOT EXISTS onboarding_emails (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER NOT NULL,
  email_type TEXT NOT NULL, -- welcome, setup_reminder, tutorial, milestone, etc.
  subject TEXT NOT NULL,
  sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  opened BOOLEAN DEFAULT 0,
  opened_at DATETIME,
  clicked BOOLEAN DEFAULT 0,
  clicked_at DATETIME,
  email_data TEXT, -- JSON for email content/variables
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- Configuration templates for quick setup
CREATE TABLE IF NOT EXISTS configuration_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- printful, shopify, etsy, general, etc.
  description TEXT,
  template_data TEXT NOT NULL, -- JSON configuration
  is_default BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Customer applied configurations
CREATE TABLE IF NOT EXISTS customer_configurations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER NOT NULL,
  template_id INTEGER,
  category TEXT NOT NULL,
  config_name TEXT NOT NULL,
  config_data TEXT NOT NULL, -- JSON configuration
  applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  FOREIGN KEY (template_id) REFERENCES configuration_templates(id) ON DELETE SET NULL
);

-- Training resources and video library
CREATE TABLE IF NOT EXISTS training_resources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  type TEXT NOT NULL, -- video, article, pdf, interactive
  category TEXT NOT NULL, -- getting_started, advanced, feature_specific
  description TEXT,
  url TEXT,
  duration_minutes INTEGER, -- for videos
  required_for_package TEXT, -- JSON array of package names
  order_index INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Track which resources customers have viewed
CREATE TABLE IF NOT EXISTS customer_training_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER NOT NULL,
  resource_id INTEGER NOT NULL,
  viewed BOOLEAN DEFAULT 0,
  viewed_at DATETIME,
  completed BOOLEAN DEFAULT 0,
  completed_at DATETIME,
  time_spent_seconds INTEGER DEFAULT 0,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  FOREIGN KEY (resource_id) REFERENCES training_resources(id) ON DELETE CASCADE,
  UNIQUE(customer_id, resource_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_onboarding_progress_customer ON onboarding_progress(customer_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_checklist_customer ON onboarding_checklist(customer_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_checklist_step ON onboarding_checklist(step_number);
CREATE INDEX IF NOT EXISTS idx_onboarding_emails_customer ON onboarding_emails(customer_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_emails_type ON onboarding_emails(email_type);
CREATE INDEX IF NOT EXISTS idx_customer_configurations_customer ON customer_configurations(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_training_progress_customer ON customer_training_progress(customer_id);

-- ============================================
-- INSERT DEFAULT ONBOARDING STEPS
-- ============================================

-- These will be auto-created for each new customer

-- ============================================
-- INSERT DEFAULT CONFIGURATION TEMPLATES
-- ============================================

INSERT INTO configuration_templates (name, category, description, template_data, is_default) VALUES
  (
    'Basic Printful Setup',
    'printful',
    'Standard Printful API configuration for getting started',
    '{"auto_fulfill": true, "notification_email": true, "default_shipping": "STANDARD", "backup_stock_location": "US"}',
    1
  ),
  (
    'Shopify Standard Integration',
    'shopify',
    'Recommended settings for Shopify store integration',
    '{"auto_sync": true, "inventory_sync": true, "price_markup": 2.5, "sync_frequency": "hourly", "auto_fulfill": true}',
    1
  ),
  (
    'Etsy Starter Configuration',
    'etsy',
    'Optimized Etsy listing defaults',
    '{"auto_renew": true, "who_made": "i_did", "is_supply": false, "processing_min": 3, "processing_max": 5, "taxonomy_id": 1063}',
    1
  ),
  (
    'Conservative Pricing Strategy',
    'pricing',
    'Safe profit margins for beginners',
    '{"cost_multiplier": 3.0, "minimum_profit": 10.0, "maximum_price": 100.0, "round_to_99": true}',
    1
  ),
  (
    'Aggressive Growth Pricing',
    'pricing',
    'Higher margins for established stores',
    '{"cost_multiplier": 4.5, "minimum_profit": 20.0, "maximum_price": 200.0, "round_to_99": true, "dynamic_adjustment": true}',
    0
  );

-- ============================================
-- INSERT DEFAULT TRAINING RESOURCES
-- ============================================

INSERT INTO training_resources (title, type, category, description, url, duration_minutes, required_for_package, order_index) VALUES
  (
    'Welcome to the Automated Profit System',
    'video',
    'getting_started',
    'Overview of the platform and key features',
    'https://www.youtube.com/watch?v=example1',
    5,
    '["Starter", "Professional", "Enterprise", "Enterprise Plus"]',
    1
  ),
  (
    'Setting Up Your Printful Account',
    'video',
    'getting_started',
    'Step-by-step guide to connecting Printful',
    'https://www.youtube.com/watch?v=example2',
    10,
    '["Starter", "Professional", "Enterprise", "Enterprise Plus"]',
    2
  ),
  (
    'Finding Your First Winning Product',
    'video',
    'getting_started',
    'Using trend analysis to identify profitable products',
    'https://www.youtube.com/watch?v=example3',
    15,
    '["Starter", "Professional", "Enterprise", "Enterprise Plus"]',
    3
  ),
  (
    'Shopify Integration Guide',
    'video',
    'feature_specific',
    'Complete walkthrough of Shopify connection',
    'https://www.youtube.com/watch?v=example4',
    12,
    '["Professional", "Enterprise", "Enterprise Plus"]',
    4
  ),
  (
    'Etsy Store Automation',
    'video',
    'feature_specific',
    'Automating your Etsy listings and fulfillment',
    'https://www.youtube.com/watch?v=example5',
    12,
    '["Professional", "Enterprise", "Enterprise Plus"]',
    5
  ),
  (
    'AI Product Descriptions Masterclass',
    'video',
    'advanced',
    'Leveraging AI to write converting product descriptions',
    'https://www.youtube.com/watch?v=example6',
    20,
    '["Enterprise", "Enterprise Plus"]',
    6
  ),
  (
    'Scaling to $10K/Month',
    'video',
    'advanced',
    'Advanced strategies for rapid growth',
    'https://www.youtube.com/watch?v=example7',
    25,
    '["Enterprise", "Enterprise Plus"]',
    7
  ),
  (
    'White-Label Setup Guide',
    'article',
    'advanced',
    'Customizing the platform with your branding',
    'https://docs.example.com/white-label',
    NULL,
    '["Enterprise", "Enterprise Plus"]',
    8
  );

-- ============================================
-- TRIGGERS FOR AUTO-UPDATES
-- ============================================

CREATE TRIGGER IF NOT EXISTS update_onboarding_checklist_timestamp
AFTER UPDATE ON onboarding_checklist
BEGIN
  UPDATE onboarding_checklist SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_onboarding_progress_active
AFTER UPDATE ON onboarding_checklist
WHEN NEW.completed = 1
BEGIN
  UPDATE onboarding_progress
  SET last_active_at = CURRENT_TIMESTAMP,
      current_step = (
        SELECT COUNT(*) + 1
        FROM onboarding_checklist
        WHERE customer_id = NEW.customer_id AND completed = 1
      )
  WHERE customer_id = NEW.customer_id;
END;

CREATE TRIGGER IF NOT EXISTS mark_onboarding_complete
AFTER UPDATE ON onboarding_progress
WHEN NEW.current_step > NEW.total_steps AND NEW.completed = 0
BEGIN
  UPDATE onboarding_progress
  SET completed = 1, completed_at = CURRENT_TIMESTAMP
  WHERE id = NEW.id;
END;
