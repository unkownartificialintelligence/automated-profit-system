import express from 'express';
import sqlite3 from 'sqlite3';
import jwt from 'jsonwebtoken';

const router = express.Router();
const db = new sqlite3.Database('./database.db');

// Admin authentication middleware (reuse from admin routes)
const adminAuth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    if (decoded.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    req.adminId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// ===========================
// CONTACTS MANAGEMENT
// ===========================

// Get all contacts
router.get('/contacts', adminAuth, (req, res) => {
  const { type, status } = req.query;
  let query = 'SELECT * FROM marketing_contacts WHERE 1=1';
  const params = [];

  if (type) {
    query += ' AND contact_type = ?';
    params.push(type);
  }
  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }

  query += ' ORDER BY created_at DESC';

  db.all(query, params, (err, contacts) => {
    if (err) return res.status(500).json({ success: false, message: 'Server error' });
    res.json({ success: true, contacts });
  });
});

// Add new contact
router.post('/contacts', adminAuth, (req, res) => {
  const { email, name, company, contact_type, tags, metadata } = req.body;

  db.run(
    `INSERT INTO marketing_contacts (email, name, company, contact_type, tags, metadata)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [email, name, company, contact_type, JSON.stringify(tags || []), JSON.stringify(metadata || {})],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(400).json({ success: false, message: 'Contact already exists' });
        }
        return res.status(500).json({ success: false, message: 'Error creating contact' });
      }
      res.json({ success: true, contactId: this.lastID });
    }
  );
});

// Update contact
router.put('/contacts/:id', adminAuth, (req, res) => {
  const { id } = req.params;
  const updates = { ...req.body };

  // Convert arrays/objects to JSON strings
  if (updates.tags) updates.tags = JSON.stringify(updates.tags);
  if (updates.metadata) updates.metadata = JSON.stringify(updates.metadata);

  const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
  const values = [...Object.values(updates), id];

  db.run(
    `UPDATE marketing_contacts SET ${fields} WHERE id = ?`,
    values,
    (err) => {
      if (err) return res.status(500).json({ success: false, message: 'Error updating contact' });
      res.json({ success: true, message: 'Contact updated' });
    }
  );
});

// Delete contact
router.delete('/contacts/:id', adminAuth, (req, res) => {
  db.run('DELETE FROM marketing_contacts WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ success: false, message: 'Error deleting contact' });
    res.json({ success: true, message: 'Contact deleted' });
  });
});

// ===========================
// CAMPAIGNS MANAGEMENT
// ===========================

// Get all campaigns
router.get('/campaigns', adminAuth, (req, res) => {
  const { status, type } = req.query;
  let query = 'SELECT * FROM marketing_campaigns WHERE 1=1';
  const params = [];

  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }
  if (type) {
    query += ' AND campaign_type = ?';
    params.push(type);
  }

  query += ' ORDER BY created_at DESC';

  db.all(query, params, (err, campaigns) => {
    if (err) return res.status(500).json({ success: false, message: 'Server error' });
    res.json({ success: true, campaigns });
  });
});

// Get single campaign with analytics
router.get('/campaigns/:id', adminAuth, (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM marketing_campaigns WHERE id = ?', [id], (err, campaign) => {
    if (err) return res.status(500).json({ success: false, message: 'Server error' });
    if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found' });

    // Get analytics
    db.all(
      'SELECT * FROM campaign_analytics WHERE campaign_id = ? ORDER BY date DESC',
      [id],
      (err, analytics) => {
        if (err) return res.status(500).json({ success: false, message: 'Server error' });
        res.json({ success: true, campaign, analytics });
      }
    );
  });
});

// Create campaign
router.post('/campaigns', adminAuth, (req, res) => {
  const {
    name, campaign_type, target_audience, subject, content,
    template_id, scheduled_date, frequency, budget
  } = req.body;

  db.run(
    `INSERT INTO marketing_campaigns
     (name, campaign_type, target_audience, subject, content, template_id,
      scheduled_date, frequency, budget, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, campaign_type, target_audience, subject, content, template_id,
     scheduled_date, frequency, budget, req.adminId],
    function(err) {
      if (err) return res.status(500).json({ success: false, message: 'Error creating campaign' });
      res.json({ success: true, campaignId: this.lastID });
    }
  );
});

// Update campaign
router.put('/campaigns/:id', adminAuth, (req, res) => {
  const { id } = req.params;
  const updates = { ...req.body, updated_at: new Date().toISOString() };

  const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
  const values = [...Object.values(updates), id];

  db.run(
    `UPDATE marketing_campaigns SET ${fields} WHERE id = ?`,
    values,
    (err) => {
      if (err) return res.status(500).json({ success: false, message: 'Error updating campaign' });
      res.json({ success: true, message: 'Campaign updated' });
    }
  );
});

// Launch campaign
router.post('/campaigns/:id/launch', adminAuth, (req, res) => {
  const { id } = req.params;

  db.run(
    `UPDATE marketing_campaigns
     SET status = 'running', start_date = datetime('now')
     WHERE id = ?`,
    [id],
    function(err) {
      if (err) return res.status(500).json({ success: false, message: 'Error launching campaign' });

      // TODO: Trigger email queue creation
      res.json({ success: true, message: 'Campaign launched' });
    }
  );
});

// Pause/Stop campaign
router.post('/campaigns/:id/pause', adminAuth, (req, res) => {
  db.run(
    'UPDATE marketing_campaigns SET status = \'paused\' WHERE id = ?',
    [req.params.id],
    (err) => {
      if (err) return res.status(500).json({ success: false, message: 'Error pausing campaign' });
      res.json({ success: true, message: 'Campaign paused' });
    }
  );
});

// ===========================
// TEMPLATES MANAGEMENT
// ===========================

// Get all templates
router.get('/templates', adminAuth, (req, res) => {
  const { category, audience } = req.query;
  let query = 'SELECT * FROM marketing_templates WHERE is_active = 1';
  const params = [];

  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }
  if (audience) {
    query += ' AND (audience_type = ? OR audience_type = \'all\')';
    params.push(audience);
  }

  query += ' ORDER BY created_at DESC';

  db.all(query, params, (err, templates) => {
    if (err) return res.status(500).json({ success: false, message: 'Server error' });
    res.json({ success: true, templates });
  });
});

// Get single template
router.get('/templates/:id', adminAuth, (req, res) => {
  db.get('SELECT * FROM marketing_templates WHERE id = ?', [req.params.id], (err, template) => {
    if (err) return res.status(500).json({ success: false, message: 'Server error' });
    if (!template) return res.status(404).json({ success: false, message: 'Template not found' });
    res.json({ success: true, template });
  });
});

// Create template
router.post('/templates', adminAuth, (req, res) => {
  const { name, category, audience_type, subject, html_content, text_content, variables } = req.body;

  db.run(
    `INSERT INTO marketing_templates
     (name, category, audience_type, subject, html_content, text_content, variables)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [name, category, audience_type, subject, html_content, text_content, JSON.stringify(variables || [])],
    function(err) {
      if (err) return res.status(500).json({ success: false, message: 'Error creating template' });
      res.json({ success: true, templateId: this.lastID });
    }
  );
});

// Update template
router.put('/templates/:id', adminAuth, (req, res) => {
  const { id } = req.params;
  const updates = { ...req.body };

  if (updates.variables) updates.variables = JSON.stringify(updates.variables);

  const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
  const values = [...Object.values(updates), id];

  db.run(
    `UPDATE marketing_templates SET ${fields} WHERE id = ?`,
    values,
    (err) => {
      if (err) return res.status(500).json({ success: false, message: 'Error updating template' });
      res.json({ success: true, message: 'Template updated' });
    }
  );
});

// ===========================
// PARTNERSHIPS & SPONSORS
// ===========================

// Get all partnerships
router.get('/partnerships', adminAuth, (req, res) => {
  const { type, status } = req.query;
  let query = 'SELECT * FROM partnerships WHERE 1=1';
  const params = [];

  if (type) {
    query += ' AND partnership_type = ?';
    params.push(type);
  }
  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }

  query += ' ORDER BY created_at DESC';

  db.all(query, params, (err, partnerships) => {
    if (err) return res.status(500).json({ success: false, message: 'Server error' });
    res.json({ success: true, partnerships });
  });
});

// Create partnership
router.post('/partnerships', adminAuth, (req, res) => {
  const {
    company_name, contact_name, email, phone, partnership_type,
    tier, contract_value, contract_start, contract_end, benefits, deliverables, notes
  } = req.body;

  db.run(
    `INSERT INTO partnerships
     (company_name, contact_name, email, phone, partnership_type, tier,
      contract_value, contract_start, contract_end, benefits, deliverables, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [company_name, contact_name, email, phone, partnership_type, tier,
     contract_value, contract_start, contract_end,
     JSON.stringify(benefits || []), JSON.stringify(deliverables || []), notes],
    function(err) {
      if (err) return res.status(500).json({ success: false, message: 'Error creating partnership' });
      res.json({ success: true, partnershipId: this.lastID });
    }
  );
});

// Update partnership
router.put('/partnerships/:id', adminAuth, (req, res) => {
  const { id } = req.params;
  const updates = { ...req.body };

  if (updates.benefits) updates.benefits = JSON.stringify(updates.benefits);
  if (updates.deliverables) updates.deliverables = JSON.stringify(updates.deliverables);

  const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
  const values = [...Object.values(updates), id];

  db.run(
    `UPDATE partnerships SET ${fields} WHERE id = ?`,
    values,
    (err) => {
      if (err) return res.status(500).json({ success: false, message: 'Error updating partnership' });
      res.json({ success: true, message: 'Partnership updated' });
    }
  );
});

// ===========================
// ANALYTICS & DASHBOARD
// ===========================

// Get marketing dashboard stats
router.get('/dashboard', adminAuth, (req, res) => {
  const stats = {};

  // Total contacts by type
  db.all(
    'SELECT contact_type, COUNT(*) as count FROM marketing_contacts GROUP BY contact_type',
    [],
    (err, contacts) => {
      stats.contactsByType = contacts || [];

      // Active campaigns
      db.get(
        'SELECT COUNT(*) as count FROM marketing_campaigns WHERE status = \'running\'',
        [],
        (err, result) => {
          stats.activeCampaigns = result?.count || 0;

          // Total campaigns stats
          db.get(
            `SELECT
               SUM(total_sent) as total_sent,
               SUM(total_opened) as total_opened,
               SUM(total_clicked) as total_clicked,
               SUM(total_converted) as total_converted,
               AVG(CASE WHEN total_sent > 0 THEN (total_opened * 100.0 / total_sent) ELSE 0 END) as avg_open_rate,
               AVG(CASE WHEN total_opened > 0 THEN (total_clicked * 100.0 / total_opened) ELSE 0 END) as avg_click_rate
             FROM marketing_campaigns
             WHERE status != 'draft'`,
            [],
            (err, campaignStats) => {
              stats.campaignStats = campaignStats || {};

              // Partnerships summary
              db.all(
                'SELECT partnership_type, status, COUNT(*) as count, SUM(contract_value) as total_value FROM partnerships GROUP BY partnership_type, status',
                [],
                (err, partnerships) => {
                  stats.partnerships = partnerships || [];

                  // Recent campaigns
                  db.all(
                    'SELECT * FROM marketing_campaigns ORDER BY created_at DESC LIMIT 5',
                    [],
                    (err, recentCampaigns) => {
                      stats.recentCampaigns = recentCampaigns || [];
                      res.json({ success: true, dashboard: stats });
                    }
                  );
                }
              );
            }
          );
        }
      );
    }
  );
});

// Get campaign performance
router.get('/analytics/performance', adminAuth, (req, res) => {
  const { days = 30 } = req.query;

  db.all(
    `SELECT
       date,
       SUM(emails_sent) as total_sent,
       SUM(emails_opened) as total_opened,
       SUM(emails_clicked) as total_clicked,
       SUM(conversions) as total_conversions,
       SUM(revenue) as total_revenue,
       SUM(cost) as total_cost
     FROM campaign_analytics
     WHERE date >= date('now', '-${days} days')
     GROUP BY date
     ORDER BY date DESC`,
    [],
    (err, analytics) => {
      if (err) return res.status(500).json({ success: false, message: 'Server error' });
      res.json({ success: true, analytics });
    }
  );
});

// ===========================
// AUTOMATION WORKFLOWS
// ===========================

// Get all workflows
router.get('/workflows', adminAuth, (req, res) => {
  db.all('SELECT * FROM automation_workflows ORDER BY created_at DESC', [], (err, workflows) => {
    if (err) return res.status(500).json({ success: false, message: 'Server error' });
    res.json({ success: true, workflows });
  });
});

// Create workflow
router.post('/workflows', adminAuth, (req, res) => {
  const { name, trigger_type, trigger_config, audience_type, actions } = req.body;

  db.run(
    `INSERT INTO automation_workflows (name, trigger_type, trigger_config, audience_type, actions)
     VALUES (?, ?, ?, ?, ?)`,
    [name, trigger_type, JSON.stringify(trigger_config), audience_type, JSON.stringify(actions)],
    function(err) {
      if (err) return res.status(500).json({ success: false, message: 'Error creating workflow' });
      res.json({ success: true, workflowId: this.lastID });
    }
  );
});

// Toggle workflow active status
router.put('/workflows/:id/toggle', adminAuth, (req, res) => {
  db.run(
    'UPDATE automation_workflows SET is_active = NOT is_active WHERE id = ?',
    [req.params.id],
    (err) => {
      if (err) return res.status(500).json({ success: false, message: 'Error toggling workflow' });
      res.json({ success: true, message: 'Workflow status updated' });
    }
  );
});

export default router;
