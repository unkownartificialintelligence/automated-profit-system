import express from 'express';
import Database from 'better-sqlite3';
import nodemailer from 'nodemailer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, '../../database.db');

// Email transporter setup
const createEmailTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// ============================================
// ONBOARDING WIZARD
// ============================================

// Initialize onboarding for a new customer
router.post('/init', (req, res) => {
  try {
    const { customerId, subscriptionId } = req.body;

    if (!customerId) {
      return res.status(400).json({ success: false, error: 'Customer ID is required' });
    }

    const db = new Database(dbPath);

    // Check if customer exists
    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(customerId);
    if (!customer) {
      db.close();
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }

    // Check if onboarding already exists
    let progress = db.prepare('SELECT * FROM onboarding_progress WHERE customer_id = ?').get(customerId);

    if (progress) {
      db.close();
      return res.json({
        success: true,
        message: 'Onboarding already initialized',
        progress,
        exists: true,
      });
    }

    // Create onboarding progress
    const insertProgress = db.prepare(`
      INSERT INTO onboarding_progress (customer_id, subscription_id, current_step, total_steps)
      VALUES (?, ?, 1, 7)
    `);
    const progressResult = insertProgress.run(customerId, subscriptionId || null);

    // Create default checklist items
    const checklistItems = [
      { step: 1, name: 'Account Setup', description: 'Complete your profile and preferences', required: true },
      { step: 2, name: 'Connect Printful', description: 'Link your Printful account for product fulfillment', required: true },
      { step: 3, name: 'Choose Configuration', description: 'Select pricing and automation templates', required: true },
      { step: 4, name: 'First Product', description: 'Research and add your first product', required: true },
      { step: 5, name: 'Watch Training Videos', description: 'Complete getting started training', required: false },
      { step: 6, name: 'Setup Integration', description: 'Connect Shopify, Etsy, or other platforms', required: false },
      { step: 7, name: 'Launch & Test', description: 'Test your setup with a sample order', required: true },
    ];

    const insertChecklist = db.prepare(`
      INSERT INTO onboarding_checklist (customer_id, step_number, step_name, step_description, required)
      VALUES (?, ?, ?, ?, ?)
    `);

    checklistItems.forEach(item => {
      insertChecklist.run(customerId, item.step, item.name, item.description, item.required ? 1 : 0);
    });

    progress = db.prepare('SELECT * FROM onboarding_progress WHERE id = ?').get(progressResult.lastInsertRowid);

    // Send welcome email
    sendWelcomeEmail(db, customer);

    db.close();

    res.json({
      success: true,
      message: 'Onboarding initialized successfully',
      progress,
      exists: false,
    });
  } catch (error) {
    console.error('Error initializing onboarding:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get onboarding progress
router.get('/progress/:customerId', (req, res) => {
  try {
    const db = new Database(dbPath);

    const progress = db.prepare(`
      SELECT op.*, c.email, c.name
      FROM onboarding_progress op
      JOIN customers c ON op.customer_id = c.id
      WHERE op.customer_id = ?
    `).get(req.params.customerId);

    if (!progress) {
      db.close();
      return res.status(404).json({ success: false, error: 'Onboarding not found' });
    }

    // Get checklist items
    const checklist = db.prepare(`
      SELECT * FROM onboarding_checklist
      WHERE customer_id = ?
      ORDER BY step_number ASC
    `).all(req.params.customerId);

    // Calculate completion percentage
    const completedSteps = checklist.filter(item => item.completed).length;
    const completionPercentage = Math.round((completedSteps / checklist.length) * 100);

    db.close();

    res.json({
      success: true,
      progress,
      checklist,
      stats: {
        completedSteps,
        totalSteps: checklist.length,
        completionPercentage,
        currentStep: progress.current_step,
      },
    });
  } catch (error) {
    console.error('Error fetching onboarding progress:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update checklist item
router.post('/checklist/:itemId/complete', (req, res) => {
  try {
    const { data } = req.body;

    const db = new Database(dbPath);

    const item = db.prepare('SELECT * FROM onboarding_checklist WHERE id = ?').get(req.params.itemId);

    if (!item) {
      db.close();
      return res.status(404).json({ success: false, error: 'Checklist item not found' });
    }

    // Mark as completed
    db.prepare(`
      UPDATE onboarding_checklist
      SET completed = 1, completed_at = CURRENT_TIMESTAMP, data = ?
      WHERE id = ?
    `).run(data ? JSON.stringify(data) : null, req.params.itemId);

    const updated = db.prepare('SELECT * FROM onboarding_checklist WHERE id = ?').get(req.params.itemId);

    // Check if should send milestone email
    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(item.customer_id);
    if (item.step_number === 4) {
      sendMilestoneEmail(db, customer, 'First Product Added');
    }

    db.close();

    res.json({ success: true, item: updated });
  } catch (error) {
    console.error('Error updating checklist:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Skip to specific step
router.post('/progress/:customerId/skip-to/:stepNumber', (req, res) => {
  try {
    const { customerId, stepNumber } = req.params;

    const db = new Database(dbPath);

    db.prepare(`
      UPDATE onboarding_progress
      SET current_step = ?, last_active_at = CURRENT_TIMESTAMP
      WHERE customer_id = ?
    `).run(parseInt(stepNumber), customerId);

    const progress = db.prepare('SELECT * FROM onboarding_progress WHERE customer_id = ?').get(customerId);

    db.close();

    res.json({ success: true, progress });
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// CONFIGURATION TEMPLATES
// ============================================

// Get all configuration templates
router.get('/templates', (req, res) => {
  try {
    const { category } = req.query;

    const db = new Database(dbPath);

    let query = 'SELECT * FROM configuration_templates';
    let params = [];

    if (category) {
      query += ' WHERE category = ?';
      params.push(category);
    }

    query += ' ORDER BY is_default DESC, name ASC';

    const templates = db.prepare(query).all(...params);

    // Parse JSON data
    templates.forEach(t => {
      t.template_data = JSON.parse(t.template_data);
    });

    db.close();

    res.json({ success: true, templates });
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Apply configuration template to customer
router.post('/templates/:templateId/apply', (req, res) => {
  try {
    const { customerId, customizations } = req.body;

    if (!customerId) {
      return res.status(400).json({ success: false, error: 'Customer ID is required' });
    }

    const db = new Database(dbPath);

    const template = db.prepare('SELECT * FROM configuration_templates WHERE id = ?').get(req.params.templateId);

    if (!template) {
      db.close();
      return res.status(404).json({ success: false, error: 'Template not found' });
    }

    // Merge template data with customizations
    let configData = JSON.parse(template.template_data);
    if (customizations) {
      configData = { ...configData, ...customizations };
    }

    // Save customer configuration
    const insert = db.prepare(`
      INSERT INTO customer_configurations (customer_id, template_id, category, config_name, config_data)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = insert.run(
      customerId,
      template.id,
      template.category,
      template.name,
      JSON.stringify(configData)
    );

    const config = db.prepare('SELECT * FROM customer_configurations WHERE id = ?').get(result.lastInsertRowid);

    db.close();

    res.json({ success: true, configuration: config });
  } catch (error) {
    console.error('Error applying template:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get customer configurations
router.get('/configurations/:customerId', (req, res) => {
  try {
    const db = new Database(dbPath);

    const configs = db.prepare(`
      SELECT cc.*, ct.name as template_name
      FROM customer_configurations cc
      LEFT JOIN configuration_templates ct ON cc.template_id = ct.id
      WHERE cc.customer_id = ?
      ORDER BY cc.applied_at DESC
    `).all(req.params.customerId);

    // Parse JSON data
    configs.forEach(c => {
      c.config_data = JSON.parse(c.config_data);
    });

    db.close();

    res.json({ success: true, configurations: configs });
  } catch (error) {
    console.error('Error fetching configurations:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// TRAINING RESOURCES
// ============================================

// Get training resources
router.get('/training', (req, res) => {
  try {
    const { category, packageName } = req.query;

    const db = new Database(dbPath);

    let query = 'SELECT * FROM training_resources WHERE active = 1';
    const params = [];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    query += ' ORDER BY order_index ASC';

    let resources = db.prepare(query).all(...params);

    // Filter by package if provided
    if (packageName) {
      resources = resources.filter(r => {
        const required = JSON.parse(r.required_for_package || '[]');
        return required.includes(packageName);
      });
    }

    // Parse JSON fields
    resources.forEach(r => {
      r.required_for_package = JSON.parse(r.required_for_package || '[]');
    });

    db.close();

    res.json({ success: true, resources });
  } catch (error) {
    console.error('Error fetching training resources:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Track training progress
router.post('/training/:resourceId/track', (req, res) => {
  try {
    const { customerId, viewed, completed, timeSpent } = req.body;

    if (!customerId) {
      return res.status(400).json({ success: false, error: 'Customer ID is required' });
    }

    const db = new Database(dbPath);

    // Check if progress exists
    const existing = db.prepare(`
      SELECT * FROM customer_training_progress
      WHERE customer_id = ? AND resource_id = ?
    `).get(customerId, req.params.resourceId);

    if (existing) {
      // Update existing progress
      db.prepare(`
        UPDATE customer_training_progress
        SET viewed = COALESCE(?, viewed),
            viewed_at = CASE WHEN ? = 1 AND viewed = 0 THEN CURRENT_TIMESTAMP ELSE viewed_at END,
            completed = COALESCE(?, completed),
            completed_at = CASE WHEN ? = 1 AND completed = 0 THEN CURRENT_TIMESTAMP ELSE completed_at END,
            time_spent_seconds = time_spent_seconds + COALESCE(?, 0)
        WHERE id = ?
      `).run(viewed ? 1 : null, viewed ? 1 : 0, completed ? 1 : null, completed ? 1 : 0, timeSpent || 0, existing.id);
    } else {
      // Insert new progress
      db.prepare(`
        INSERT INTO customer_training_progress (customer_id, resource_id, viewed, viewed_at, completed, completed_at, time_spent_seconds)
        VALUES (?, ?, ?, CASE WHEN ? = 1 THEN CURRENT_TIMESTAMP ELSE NULL END, ?, CASE WHEN ? = 1 THEN CURRENT_TIMESTAMP ELSE NULL END, ?)
      `).run(customerId, req.params.resourceId, viewed ? 1 : 0, viewed ? 1 : 0, completed ? 1 : 0, completed ? 1 : 0, timeSpent || 0);
    }

    const progress = db.prepare(`
      SELECT * FROM customer_training_progress
      WHERE customer_id = ? AND resource_id = ?
    `).get(customerId, req.params.resourceId);

    db.close();

    res.json({ success: true, progress });
  } catch (error) {
    console.error('Error tracking training progress:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get customer training progress
router.get('/training/progress/:customerId', (req, res) => {
  try {
    const db = new Database(dbPath);

    const progress = db.prepare(`
      SELECT ctp.*, tr.title, tr.type, tr.category, tr.duration_minutes
      FROM customer_training_progress ctp
      JOIN training_resources tr ON ctp.resource_id = tr.id
      WHERE ctp.customer_id = ?
      ORDER BY ctp.viewed_at DESC
    `).all(req.params.customerId);

    const stats = db.prepare(`
      SELECT
        COUNT(DISTINCT CASE WHEN viewed = 1 THEN resource_id END) as viewed_count,
        COUNT(DISTINCT CASE WHEN completed = 1 THEN resource_id END) as completed_count,
        SUM(time_spent_seconds) as total_time_seconds
      FROM customer_training_progress
      WHERE customer_id = ?
    `).get(req.params.customerId);

    db.close();

    res.json({ success: true, progress, stats });
  } catch (error) {
    console.error('Error fetching training progress:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// EMAIL AUTOMATION
// ============================================

// Send welcome email
function sendWelcomeEmail(db, customer) {
  try {
    if (!process.env.SMTP_USER) {
      console.log('⚠️  SMTP not configured, skipping welcome email');
      return;
    }

    const transporter = createEmailTransporter();

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: customer.email,
      subject: '🎉 Welcome to the Automated Profit System!',
      html: `
        <h1>Welcome, ${customer.name || 'there'}!</h1>
        <p>We're thrilled to have you on board. Get ready to automate your POD business and maximize your profits!</p>

        <h2>Getting Started:</h2>
        <ol>
          <li><strong>Complete Your Setup</strong> - Connect your Printful account</li>
          <li><strong>Watch Training Videos</strong> - Learn the platform in under 30 minutes</li>
          <li><strong>Launch Your First Product</strong> - We'll guide you through it</li>
        </ol>

        <p><a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/onboarding" style="background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Start Your Onboarding</a></p>

        <p>Need help? Reply to this email or visit our support center.</p>

        <p>To your success,<br>The Automated Profit Team</p>
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending welcome email:', error);
      } else {
        console.log('✅ Welcome email sent:', info.messageId);

        // Log email in database
        db.prepare(`
          INSERT INTO onboarding_emails (customer_id, email_type, subject)
          VALUES (?, 'welcome', ?)
        `).run(customer.id, mailOptions.subject);
      }
    });
  } catch (error) {
    console.error('Error in sendWelcomeEmail:', error);
  }
}

// Send milestone email
function sendMilestoneEmail(db, customer, milestone) {
  try {
    if (!process.env.SMTP_USER) return;

    const transporter = createEmailTransporter();

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: customer.email,
      subject: `🎯 Milestone Achieved: ${milestone}`,
      html: `
        <h1>Congratulations, ${customer.name || 'there'}!</h1>
        <p>You've just completed an important milestone: <strong>${milestone}</strong></p>

        <p>Keep up the great work! You're well on your way to building a profitable POD business.</p>

        <p><a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard">View Your Dashboard</a></p>
      `,
    };

    transporter.sendMail(mailOptions, (error) => {
      if (!error) {
        db.prepare(`
          INSERT INTO onboarding_emails (customer_id, email_type, subject)
          VALUES (?, 'milestone', ?)
        `).run(customer.id, mailOptions.subject);
      }
    });
  } catch (error) {
    console.error('Error sending milestone email:', error);
  }
}

// Manual email send endpoint
router.post('/emails/send', async (req, res) => {
  try {
    const { customerId, emailType, subject, htmlContent } = req.body;

    if (!customerId || !emailType || !subject || !htmlContent) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    if (!process.env.SMTP_USER) {
      return res.status(503).json({ success: false, error: 'SMTP not configured' });
    }

    const db = new Database(dbPath);
    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(customerId);

    if (!customer) {
      db.close();
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }

    const transporter = createEmailTransporter();

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: customer.email,
      subject,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);

    // Log email
    db.prepare(`
      INSERT INTO onboarding_emails (customer_id, email_type, subject)
      VALUES (?, ?, ?)
    `).run(customerId, emailType, subject);

    db.close();

    res.json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get email history
router.get('/emails/:customerId', (req, res) => {
  try {
    const db = new Database(dbPath);

    const emails = db.prepare(`
      SELECT * FROM onboarding_emails
      WHERE customer_id = ?
      ORDER BY sent_at DESC
    `).all(req.params.customerId);

    db.close();

    res.json({ success: true, emails });
  } catch (error) {
    console.error('Error fetching emails:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// STATISTICS
// ============================================

router.get('/stats/overview', (req, res) => {
  try {
    const db = new Database(dbPath);

    const stats = {
      total_onboarding: db.prepare('SELECT COUNT(*) as count FROM onboarding_progress').get().count,
      completed_onboarding: db.prepare('SELECT COUNT(*) as count FROM onboarding_progress WHERE completed = 1').get().count,
      in_progress: db.prepare('SELECT COUNT(*) as count FROM onboarding_progress WHERE completed = 0').get().count,
      average_completion_time: db.prepare(`
        SELECT AVG(JULIANDAY(completed_at) - JULIANDAY(started_at)) as avg_days
        FROM onboarding_progress
        WHERE completed = 1
      `).get().avg_days,
      emails_sent: db.prepare('SELECT COUNT(*) as count FROM onboarding_emails').get().count,
      training_completed: db.prepare('SELECT COUNT(*) as count FROM customer_training_progress WHERE completed = 1').get().count,
    };

    db.close();

    res.json({ success: true, stats });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
