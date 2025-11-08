-- ============================================
-- JERZII AI - TEAM PROFIT SHARING SYSTEM
-- Database Schema for Tier-Based Revenue Sharing
-- ============================================

-- === TIERS TABLE ===
-- Defines service tier levels for team members
CREATE TABLE IF NOT EXISTS tiers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  revenue_share_percentage INTEGER NOT NULL DEFAULT 25, -- Default 25% to owner
  profit_milestone INTEGER NOT NULL DEFAULT 5000, -- $5K default milestone
  features TEXT, -- JSON string of features per tier
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default tier levels
INSERT OR IGNORE INTO tiers (name, description, revenue_share_percentage, profit_milestone, features) VALUES
  ('Bronze', 'Starter tier for new team members', 25, 5000, '["Basic Dashboard", "Manual Order Processing", "Email Support"]'),
  ('Silver', 'Intermediate tier with automation', 25, 5000, '["Advanced Dashboard", "Semi-Automated Processing", "Priority Support", "Analytics"]'),
  ('Gold', 'Advanced tier with full automation', 25, 7500, '["Full Dashboard", "Automated Processing", "24/7 Support", "Advanced Analytics", "Custom Branding"]'),
  ('Platinum', 'Premium tier with white-label options', 25, 10000, '["Enterprise Dashboard", "Full Automation", "Dedicated Support", "White Label", "API Access", "Custom Integrations"]');

-- === TEAM MEMBERS TABLE ===
-- Stores team member accounts and their tier assignments
CREATE TABLE IF NOT EXISTS team_members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  tier_id INTEGER NOT NULL,
  printful_api_key TEXT, -- Each member can have their own Printful account
  stripe_account_id TEXT, -- For receiving payouts
  total_profit REAL DEFAULT 0.00,
  total_revenue_share_paid REAL DEFAULT 0.00, -- Total 25% paid to owner
  milestone_reached BOOLEAN DEFAULT 0, -- Has reached $5K milestone?
  milestone_reached_at DATETIME,
  status TEXT DEFAULT 'active', -- active, suspended, inactive
  joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tier_id) REFERENCES tiers(id)
);

-- === PROFITS TABLE ===
-- Tracks individual sales/profits for each team member
CREATE TABLE IF NOT EXISTS profits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  team_member_id INTEGER NOT NULL,
  order_id TEXT, -- Reference to Printful order ID
  sale_amount REAL NOT NULL,
  cost_amount REAL NOT NULL,
  profit_amount REAL NOT NULL,
  revenue_share_amount REAL NOT NULL, -- 25% automatically calculated
  revenue_share_status TEXT DEFAULT 'pending', -- pending, collected, paid_out
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (team_member_id) REFERENCES team_members(id)
);

-- === REVENUE SHARES TABLE ===
-- Tracks the 25% revenue share deductions
CREATE TABLE IF NOT EXISTS revenue_shares (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  team_member_id INTEGER NOT NULL,
  profit_id INTEGER NOT NULL,
  share_amount REAL NOT NULL,
  share_percentage INTEGER DEFAULT 25,
  status TEXT DEFAULT 'held', -- held (until milestone), released, paid_out
  released_at DATETIME, -- When milestone was reached and share was released
  paid_out_at DATETIME, -- When transferred to owner account
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (team_member_id) REFERENCES team_members(id),
  FOREIGN KEY (profit_id) REFERENCES profits(id)
);

-- === PAYOUTS TABLE ===
-- Tracks milestone-based payouts to owner account
CREATE TABLE IF NOT EXISTS payouts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  team_member_id INTEGER NOT NULL,
  total_amount REAL NOT NULL,
  milestone_amount REAL NOT NULL, -- What milestone triggered this (e.g., $5000)
  payment_method TEXT, -- stripe, paypal, bank_transfer
  payment_reference TEXT, -- Transaction ID
  status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  processed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (team_member_id) REFERENCES team_members(id)
);

-- === INDEXES FOR PERFORMANCE ===
CREATE INDEX IF NOT EXISTS idx_team_members_email ON team_members(email);
CREATE INDEX IF NOT EXISTS idx_team_members_tier ON team_members(tier_id);
CREATE INDEX IF NOT EXISTS idx_profits_team_member ON profits(team_member_id);
CREATE INDEX IF NOT EXISTS idx_revenue_shares_team_member ON revenue_shares(team_member_id);
CREATE INDEX IF NOT EXISTS idx_revenue_shares_status ON revenue_shares(status);
CREATE INDEX IF NOT EXISTS idx_payouts_team_member ON payouts(team_member_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON payouts(status);

-- === TRIGGERS FOR AUTO-CALCULATIONS ===

-- Trigger to automatically calculate revenue share when profit is added
CREATE TRIGGER IF NOT EXISTS calculate_revenue_share
AFTER INSERT ON profits
BEGIN
  -- Insert revenue share record (25% of profit)
  INSERT INTO revenue_shares (team_member_id, profit_id, share_amount, share_percentage)
  VALUES (NEW.team_member_id, NEW.id, NEW.revenue_share_amount, 25);

  -- Update team member's total profit
  UPDATE team_members
  SET total_profit = total_profit + NEW.profit_amount,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.team_member_id;
END;

-- Trigger to check and release revenue shares when milestone is reached
CREATE TRIGGER IF NOT EXISTS check_milestone_reached
AFTER UPDATE OF total_profit ON team_members
WHEN NEW.total_profit >= (SELECT profit_milestone FROM tiers WHERE id = NEW.tier_id)
  AND NEW.milestone_reached = 0
BEGIN
  -- Mark milestone as reached
  UPDATE team_members
  SET milestone_reached = 1,
      milestone_reached_at = CURRENT_TIMESTAMP
  WHERE id = NEW.id;

  -- Release all held revenue shares for this member
  UPDATE revenue_shares
  SET status = 'released',
      released_at = CURRENT_TIMESTAMP
  WHERE team_member_id = NEW.id
    AND status = 'held';

  -- Create payout record for owner
  INSERT INTO payouts (team_member_id, total_amount, milestone_amount, status)
  SELECT
    NEW.id,
    SUM(share_amount),
    (SELECT profit_milestone FROM tiers WHERE id = NEW.tier_id),
    'pending'
  FROM revenue_shares
  WHERE team_member_id = NEW.id
    AND status = 'released'
    AND paid_out_at IS NULL;
END;

-- ============================================
-- SAMPLE QUERIES
-- ============================================

-- Get all team members with their tier info
-- SELECT tm.*, t.name as tier_name, t.profit_milestone
-- FROM team_members tm
-- JOIN tiers t ON tm.tier_id = t.id;

-- Get total revenue share pending for a specific member
-- SELECT SUM(share_amount) as total_pending
-- FROM revenue_shares
-- WHERE team_member_id = ? AND status = 'held';

-- Get all members who have reached milestone
-- SELECT tm.*, t.name as tier_name
-- FROM team_members tm
-- JOIN tiers t ON tm.tier_id = t.id
-- WHERE tm.milestone_reached = 1;

-- Get pending payouts for owner
-- SELECT p.*, tm.name, tm.email
-- FROM payouts p
-- JOIN team_members tm ON p.team_member_id = tm.id
-- WHERE p.status = 'pending';
