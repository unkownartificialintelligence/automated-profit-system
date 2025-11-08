import express from 'express';
import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = express.Router();
const db = new sqlite3.Database('./database.db');

// Admin authentication middleware
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

// Admin login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  db.get('SELECT * FROM admin_users WHERE email = ?', [email], async (err, admin) => {
    if (err) return res.status(500).json({ success: false, message: 'Server error' });
    if (!admin) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    
    const validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    
    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: 'admin' },
      process.env.JWT_SECRET || 'your-secret-key',
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

// Get all admin users
router.get('/users', adminAuth, (req, res) => {
  db.all(
    'SELECT id, email, name, role, created_at FROM admin_users ORDER BY created_at DESC',
    [],
    (err, admins) => {
      if (err) return res.status(500).json({ success: false, message: 'Server error' });
      res.json({ success: true, admins });
    }
  );
});

// Create new admin user
router.post('/users', adminAuth, async (req, res) => {
  const { email, password, name, role = 'admin' } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(
      'INSERT INTO admin_users (email, password, name, role) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, name, role],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE')) {
            return res.status(400).json({ success: false, message: 'Email already exists' });
          }
          return res.status(500).json({ success: false, message: 'Error creating admin user' });
        }

        // Log activity
        db.run(
          'INSERT INTO team_activity (admin_id, action, details) VALUES (?, ?, ?)',
          [req.adminId, 'admin_created', `Created admin user: ${email}`]
        );

        res.json({ success: true, adminId: this.lastID, message: 'Admin user created successfully' });
      }
    );
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update admin user
router.put('/users/:id', adminAuth, async (req, res) => {
  const { id } = req.params;
  const updates = { ...req.body };

  // If password is being updated, hash it
  if (updates.password) {
    updates.password = await bcrypt.hash(updates.password, 10);
  }

  const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
  const values = [...Object.values(updates), id];

  db.run(
    `UPDATE admin_users SET ${fields} WHERE id = ?`,
    values,
    function(err) {
      if (err) return res.status(500).json({ success: false, message: 'Error updating admin user' });

      // Log activity
      db.run(
        'INSERT INTO team_activity (admin_id, action, details) VALUES (?, ?, ?)',
        [req.adminId, 'admin_updated', `Updated admin user ID: ${id}`]
      );

      res.json({ success: true, message: 'Admin user updated successfully' });
    }
  );
});

// Delete admin user
router.delete('/users/:id', adminAuth, (req, res) => {
  const { id } = req.params;

  // Prevent deleting yourself
  if (parseInt(id) === req.adminId) {
    return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
  }

  db.run('DELETE FROM admin_users WHERE id = ?', [id], function(err) {
    if (err) return res.status(500).json({ success: false, message: 'Error deleting admin user' });

    // Log activity
    db.run(
      'INSERT INTO team_activity (admin_id, action, details) VALUES (?, ?, ?)',
      [req.adminId, 'admin_deleted', `Deleted admin user ID: ${id}`]
    );

    res.json({ success: true, message: 'Admin user deleted successfully' });
  });
});

// Delete client
router.delete('/clients/:id', adminAuth, (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM clients WHERE id = ?', [id], function(err) {
    if (err) return res.status(500).json({ success: false, message: 'Error deleting client' });

    // Log activity
    db.run(
      'INSERT INTO team_activity (admin_id, action, client_id, details) VALUES (?, ?, ?, ?)',
      [req.adminId, 'client_deleted', id, `Deleted client ID: ${id}`]
    );

    res.json({ success: true, message: 'Client deleted successfully' });
  });
});

export default router;
