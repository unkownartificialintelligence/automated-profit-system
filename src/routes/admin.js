import express from 'express';
import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { validateRequired, validateEmail } from '../middleware/validation.js';

const router = express.Router();
const db = new sqlite3.Database('./database.db');

// Strict rate limiter for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: 'Too many login attempts from this IP, please try again after 15 minutes.'
  }
});

// Admin authentication middleware
const adminAuth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'No token provided' });

    if (!process.env.JWT_SECRET) {
      console.error('CRITICAL: JWT_SECRET not configured in environment variables');
      return res.status(500).json({ success: false, message: 'Server configuration error' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    req.adminId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// Admin login - Protected by strict rate limiting and validation
router.post('/login',
  authLimiter,
  validateRequired(['email', 'password']),
  validateEmail('email'),
  (req, res) => {
    const { email, password } = req.body;
  
  db.get('SELECT * FROM admin_users WHERE email = ?', [email], async (err, admin) => {
    if (err) return res.status(500).json({ success: false, message: 'Server error' });
    if (!admin) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    
    const validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ success: false, message: 'Server configuration error' });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      token,
      admin: { id: admin.id, email: admin.email, name: admin.name }
    });
  });
});

// Get all clients
router.get('/clients', adminAuth, (req, res) => {
  db.all('SELECT * FROM clients ORDER BY created_at DESC', [], (err, clients) => {
    if (err) return res.status(500).json({ success: false, message: 'Server error' });
    res.json({ success: true, clients });
  });
});

// Get single client with analytics
router.get('/clients/:id', adminAuth, (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT * FROM clients WHERE id = ?', [id], (err, client) => {
    if (err) return res.status(500).json({ success: false, message: 'Server error' });
    if (!client) return res.status(404).json({ success: false, message: 'Client not found' });
    
    // Get analytics for last 30 days
    db.all(
      'SELECT * FROM client_analytics WHERE client_id = ? ORDER BY date DESC LIMIT 30',
      [id],
      (err, analytics) => {
        if (err) return res.status(500).json({ success: false, message: 'Server error' });
        res.json({ success: true, client, analytics });
      }
    );
  });
});

// Add new client
router.post('/clients', adminAuth, (req, res) => {
  const { company_name, contact_name, email, phone, package_tier, printful_api_key } = req.body;
  
  db.run(
    'INSERT INTO clients (company_name, contact_name, email, phone, package_tier, printful_api_key) VALUES (?, ?, ?, ?, ?, ?)',
    [company_name, contact_name, email, phone, package_tier, printful_api_key],
    function(err) {
      if (err) return res.status(500).json({ success: false, message: 'Error creating client' });
      
      // Log activity
      db.run(
        'INSERT INTO team_activity (admin_id, action, client_id, details) VALUES (?, ?, ?, ?)',
        [req.adminId, 'client_created', this.lastID, `Created client: ${company_name}`]
      );
      
      res.json({ success: true, clientId: this.lastID, message: 'Client created successfully' });
    }
  );
});

// Update client
router.put('/clients/:id', adminAuth, (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
  const values = [...Object.values(updates), id];
  
  db.run(
    `UPDATE clients SET ${fields} WHERE id = ?`,
    values,
    function(err) {
      if (err) return res.status(500).json({ success: false, message: 'Error updating client' });
      
      // Log activity
      db.run(
        'INSERT INTO team_activity (admin_id, action, client_id, details) VALUES (?, ?, ?, ?)',
        [req.adminId, 'client_updated', id, `Updated client fields: ${Object.keys(updates).join(', ')}`]
      );
      
      res.json({ success: true, message: 'Client updated successfully' });
    }
  );
});

// Get dashboard overview
router.get('/dashboard', adminAuth, (req, res) => {
  const stats = {};
  
  // Total clients
  db.get('SELECT COUNT(*) as total FROM clients', [], (err, result) => {
    stats.totalClients = result.total;
    
    // Active clients
    db.get('SELECT COUNT(*) as active FROM clients WHERE subscription_status = "active"', [], (err, result) => {
      stats.activeClients = result.active;
      
      // Total MRR
      db.get('SELECT SUM(monthly_revenue) as mrr FROM clients WHERE subscription_status = "active"', [], (err, result) => {
        stats.totalMRR = result.mrr || 0;
        
        // Recent system logs
        db.all('SELECT * FROM system_logs ORDER BY created_at DESC LIMIT 10', [], (err, logs) => {
          stats.recentLogs = logs;
          
          // Package distribution
          db.all('SELECT package_tier, COUNT(*) as count FROM clients GROUP BY package_tier', [], (err, packages) => {
            stats.packageDistribution = packages;
            
            res.json({ success: true, dashboard: stats });
          });
        });
      });
    });
  });
});

// Get system health
router.get('/health', adminAuth, (req, res) => {
  const health = {
    server: 'online',
    database: 'connected',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date()
  };
  
  res.json({ success: true, health });
});

// Get team activity log
router.get('/activity', adminAuth, (req, res) => {
  db.all(
    `SELECT ta.*, au.name as admin_name, c.company_name 
     FROM team_activity ta 
     LEFT JOIN admin_users au ON ta.admin_id = au.id 
     LEFT JOIN clients c ON ta.client_id = c.id 
     ORDER BY ta.created_at DESC 
     LIMIT 50`,
    [],
    (err, activities) => {
      if (err) return res.status(500).json({ success: false, message: 'Server error' });
      res.json({ success: true, activities });
    }
  );
});

// Add system log
router.post('/logs', adminAuth, (req, res) => {
  const { log_type, severity, message, client_id } = req.body;
  
  db.run(
    'INSERT INTO system_logs (log_type, severity, message, client_id) VALUES (?, ?, ?, ?)',
    [log_type, severity, message, client_id],
    function(err) {
      if (err) return res.status(500).json({ success: false, message: 'Error creating log' });
      res.json({ success: true, logId: this.lastID });
    }
  );
});

// Get aggregate analytics
router.get('/analytics/aggregate', adminAuth, (req, res) => {
  const { days = 30 } = req.query;
  
  db.all(
    `SELECT 
      date,
      SUM(revenue) as total_revenue,
      SUM(orders) as total_orders,
      SUM(profit) as total_profit,
      SUM(products_sold) as total_products
    FROM client_analytics
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

export default router;
