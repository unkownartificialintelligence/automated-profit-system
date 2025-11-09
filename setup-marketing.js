import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./database.db');

// Marketing Automation Database Schema
db.serialize(() => {
  console.log('📧 Initializing Marketing Automation Database...\n');

  // === CONTACTS & AUDIENCES ===
  db.run(`CREATE TABLE IF NOT EXISTS marketing_contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    company TEXT,
    contact_type TEXT NOT NULL, -- 'team', 'customer', 'client', 'partner', 'sponsor'
    status TEXT DEFAULT 'active', -- 'active', 'unsubscribed', 'bounced'
    tags TEXT, -- JSON array of tags
    metadata TEXT, -- JSON for additional data
    subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_contacted DATETIME,
    engagement_score INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // === CAMPAIGN MANAGEMENT ===
  db.run(`CREATE TABLE IF NOT EXISTS marketing_campaigns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    campaign_type TEXT NOT NULL, -- 'email', 'social', 'content', 'mixed'
    target_audience TEXT NOT NULL, -- 'team', 'customer', 'client', 'partner', 'sponsor', 'all'
    status TEXT DEFAULT 'draft', -- 'draft', 'scheduled', 'running', 'completed', 'paused'
    subject TEXT,
    content TEXT,
    template_id INTEGER,
    scheduled_date DATETIME,
    start_date DATETIME,
    end_date DATETIME,
    frequency TEXT, -- 'one-time', 'daily', 'weekly', 'monthly'
    total_sent INTEGER DEFAULT 0,
    total_opened INTEGER DEFAULT 0,
    total_clicked INTEGER DEFAULT 0,
    total_converted INTEGER DEFAULT 0,
    budget REAL DEFAULT 0,
    roi REAL DEFAULT 0,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES admin_users(id)
  )`);

  // === EMAIL TEMPLATES ===
  db.run(`CREATE TABLE IF NOT EXISTS marketing_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL, -- 'welcome', 'newsletter', 'promotion', 'update', 'partnership', 'sponsorship'
    audience_type TEXT NOT NULL, -- 'team', 'customer', 'client', 'partner', 'sponsor', 'all'
    subject TEXT,
    html_content TEXT,
    text_content TEXT,
    variables TEXT, -- JSON array of variable names
    thumbnail_url TEXT,
    is_active BOOLEAN DEFAULT 1,
    usage_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // === SOCIAL MEDIA POSTS ===
  db.run(`CREATE TABLE IF NOT EXISTS social_media_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    campaign_id INTEGER,
    platform TEXT NOT NULL, -- 'linkedin', 'twitter', 'facebook', 'instagram'
    content TEXT NOT NULL,
    media_urls TEXT, -- JSON array of media URLs
    scheduled_time DATETIME,
    posted_time DATETIME,
    status TEXT DEFAULT 'scheduled', -- 'scheduled', 'posted', 'failed'
    engagement_likes INTEGER DEFAULT 0,
    engagement_shares INTEGER DEFAULT 0,
    engagement_comments INTEGER DEFAULT 0,
    reach INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (campaign_id) REFERENCES marketing_campaigns(id)
  )`);

  // === PARTNERSHIPS & SPONSORS ===
  db.run(`CREATE TABLE IF NOT EXISTS partnerships (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_name TEXT NOT NULL,
    contact_name TEXT,
    email TEXT,
    phone TEXT,
    partnership_type TEXT NOT NULL, -- 'partner', 'sponsor'
    tier TEXT, -- 'bronze', 'silver', 'gold', 'platinum'
    status TEXT DEFAULT 'prospect', -- 'prospect', 'active', 'inactive', 'expired'
    contract_value REAL,
    contract_start DATETIME,
    contract_end DATETIME,
    benefits TEXT, -- JSON array of benefits
    deliverables TEXT, -- JSON array of deliverables
    notes TEXT,
    last_contact DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // === CONTENT LIBRARY ===
  db.run(`CREATE TABLE IF NOT EXISTS content_library (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content_type TEXT NOT NULL, -- 'blog', 'video', 'infographic', 'case-study', 'whitepaper'
    category TEXT,
    content TEXT,
    media_url TEXT,
    target_audience TEXT, -- 'team', 'customer', 'client', 'partner', 'sponsor'
    keywords TEXT, -- JSON array
    published_date DATETIME,
    status TEXT DEFAULT 'draft', -- 'draft', 'published', 'archived'
    views INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES admin_users(id)
  )`);

  // === AUTOMATION WORKFLOWS ===
  db.run(`CREATE TABLE IF NOT EXISTS automation_workflows (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    trigger_type TEXT NOT NULL, -- 'new_contact', 'tag_added', 'date', 'behavior'
    trigger_config TEXT, -- JSON configuration
    audience_type TEXT NOT NULL,
    actions TEXT NOT NULL, -- JSON array of actions
    is_active BOOLEAN DEFAULT 1,
    total_triggered INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // === CAMPAIGN ANALYTICS ===
  db.run(`CREATE TABLE IF NOT EXISTS campaign_analytics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    campaign_id INTEGER NOT NULL,
    date DATE NOT NULL,
    emails_sent INTEGER DEFAULT 0,
    emails_opened INTEGER DEFAULT 0,
    emails_clicked INTEGER DEFAULT 0,
    emails_bounced INTEGER DEFAULT 0,
    emails_unsubscribed INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    revenue REAL DEFAULT 0,
    cost REAL DEFAULT 0,
    FOREIGN KEY (campaign_id) REFERENCES marketing_campaigns(id)
  )`);

  // === EMAIL QUEUE ===
  db.run(`CREATE TABLE IF NOT EXISTS email_queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    campaign_id INTEGER,
    contact_id INTEGER NOT NULL,
    subject TEXT NOT NULL,
    html_content TEXT,
    text_content TEXT,
    scheduled_time DATETIME NOT NULL,
    sent_time DATETIME,
    status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'failed', 'cancelled'
    error_message TEXT,
    opened_at DATETIME,
    clicked_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (campaign_id) REFERENCES marketing_campaigns(id),
    FOREIGN KEY (contact_id) REFERENCES marketing_contacts(id)
  )`);

  // === Insert Sample Templates ===
  const templates = [
    {
      name: 'Team Welcome Email',
      category: 'welcome',
      audience: 'team',
      subject: 'Welcome to Jerzii AI Team! 🎉',
      html: '<h1>Welcome {{name}}!</h1><p>We\'re excited to have you join our team at Jerzii AI.</p>',
      variables: JSON.stringify(['name'])
    },
    {
      name: 'Customer Onboarding',
      category: 'welcome',
      audience: 'customer',
      subject: 'Welcome to Jerzii AI - Let\'s Get Started! 🚀',
      html: '<h1>Hi {{name}}!</h1><p>Welcome to Jerzii AI Automated Profit System. Here\'s how to get started...</p>',
      variables: JSON.stringify(['name', 'company'])
    },
    {
      name: 'Partnership Proposal',
      category: 'partnership',
      audience: 'partner',
      subject: 'Partnership Opportunity with Jerzii AI',
      html: '<h1>Dear {{name}},</h1><p>We believe a partnership between {{company}} and Jerzii AI could be mutually beneficial...</p>',
      variables: JSON.stringify(['name', 'company'])
    },
    {
      name: 'Sponsorship Package',
      category: 'sponsorship',
      audience: 'sponsor',
      subject: 'Jerzii AI Sponsorship Opportunities - {{tier}} Package',
      html: '<h1>Premium Sponsorship Opportunity</h1><p>Dear {{name}}, we\'d like to present our {{tier}} sponsorship package...</p>',
      variables: JSON.stringify(['name', 'company', 'tier'])
    },
    {
      name: 'Monthly Newsletter',
      category: 'newsletter',
      audience: 'all',
      subject: 'Jerzii AI Monthly Update - {{month}}',
      html: '<h1>Monthly Update</h1><p>Here\'s what\'s new at Jerzii AI this month...</p>',
      variables: JSON.stringify(['month', 'name'])
    },
    {
      name: 'Client Success Story',
      category: 'update',
      audience: 'client',
      subject: 'See How {{company}} Achieved Amazing Results',
      html: '<h1>Client Success Story</h1><p>{{company}} has seen incredible results with our platform...</p>',
      variables: JSON.stringify(['company', 'results'])
    }
  ];

  const insertTemplate = db.prepare(`
    INSERT OR IGNORE INTO marketing_templates (name, category, audience_type, subject, html_content, variables)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  templates.forEach(t => {
    insertTemplate.run(t.name, t.category, t.audience, t.subject, t.html, t.variables);
  });

  insertTemplate.finalize();

  // === Insert Sample Workflows ===
  const workflows = [
    {
      name: 'New Customer Welcome Series',
      trigger: 'new_contact',
      config: JSON.stringify({ contact_type: 'customer' }),
      audience: 'customer',
      actions: JSON.stringify([
        { type: 'send_email', template_id: 2, delay_minutes: 0 },
        { type: 'send_email', template_id: 5, delay_minutes: 1440 },
        { type: 'add_tag', tag: 'onboarded', delay_minutes: 2880 }
      ])
    },
    {
      name: 'Partner Outreach Campaign',
      trigger: 'tag_added',
      config: JSON.stringify({ tag: 'potential_partner' }),
      audience: 'partner',
      actions: JSON.stringify([
        { type: 'send_email', template_id: 3, delay_minutes: 0 },
        { type: 'create_task', description: 'Follow up call', delay_minutes: 2880 }
      ])
    }
  ];

  const insertWorkflow = db.prepare(`
    INSERT OR IGNORE INTO automation_workflows (name, trigger_type, trigger_config, audience_type, actions)
    VALUES (?, ?, ?, ?, ?)
  `);

  workflows.forEach(w => {
    insertWorkflow.run(w.name, w.trigger, w.config, w.audience, w.actions);
  });

  insertWorkflow.finalize();

  console.log('✅ Marketing database tables created');
  console.log('✅ Sample templates added');
  console.log('✅ Sample workflows configured\n');
  console.log('📊 Ready for marketing automation!\n');

  db.close();
});
