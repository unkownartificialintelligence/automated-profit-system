import express from 'express';
import sqlite3 from 'sqlite3';
import jwt from 'jsonwebtoken';
import profitAutomation from '../services/profitAutomation.js';

const router = express.Router();
const db = new sqlite3.Database('./database.db');

// Admin auth middleware
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
// PROFIT DASHBOARD
// ===========================

router.get('/dashboard', adminAuth, (req, res) => {
  const stats = {};

  // Today's revenue
  db.get(
    `SELECT * FROM revenue_daily WHERE date = DATE('now')`,
    [],
    (err, today) => {
      stats.today = today || { total_sales: 0, total_orders: 0, total_profit: 0 };

      // This month's revenue
      db.get(
        `SELECT
           SUM(total_sales) as total_sales,
           SUM(total_orders) as total_orders,
           SUM(total_profit) as total_profit,
           AVG(avg_order_value) as avg_order_value
         FROM revenue_daily
         WHERE date >= DATE('now', 'start of month')`,
        [],
        (err, month) => {
          stats.month = month || {};

          // Total all-time
          db.get(
            `SELECT
               SUM(total_amount) as total_sales,
               COUNT(*) as total_orders,
               SUM(net_profit) as total_profit
             FROM sales WHERE payment_status = 'paid'`,
            [],
            (err, allTime) => {
              stats.allTime = allTime || {};

              // Active products
              db.get(
                'SELECT COUNT(*) as count FROM products WHERE status = \'active\'',
                [],
                (err, products) => {
                  stats.activeProducts = products?.count || 0;

                  // Trending niches
                  db.all(
                    'SELECT * FROM trending_niches WHERE status = \'active\' ORDER BY profit_potential DESC LIMIT 10',
                    [],
                    (err, niches) => {
                      stats.trendingNiches = niches || [];

                      // Top products
                      db.all(
                        `SELECT p.*, COUNT(s.id) as sales_count, SUM(s.net_profit) as total_profit
                         FROM products p
                         LEFT JOIN sales s ON p.id = s.product_id
                         WHERE p.status = 'active'
                         GROUP BY p.id
                         ORDER BY total_profit DESC
                         LIMIT 5`,
                        [],
                        (err, topProducts) => {
                          stats.topProducts = topProducts || [];

                          // Recent sales
                          db.all(
                            `SELECT s.*, p.title as product_title
                             FROM sales s
                             JOIN products p ON s.product_id = p.id
                             ORDER BY s.order_date DESC
                             LIMIT 10`,
                            [],
                            (err, recentSales) => {
                              stats.recentSales = recentSales || [];

                              // Profit goals
                              db.all(
                                'SELECT * FROM profit_goals WHERE end_date >= DATE(\'now\') ORDER BY end_date',
                                [],
                                (err, goals) => {
                                  stats.goals = goals || [];
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
            }
          );
        }
      );
    }
  );
});

// ===========================
// PRODUCTS
// ===========================

router.get('/products', adminAuth, (req, res) => {
  const { status, category } = req.query;
  let query = 'SELECT * FROM products WHERE 1=1';
  const params = [];

  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }
  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }

  query += ' ORDER BY created_at DESC';

  db.all(query, params, (err, products) => {
    if (err) return res.status(500).json({ success: false, message: 'Server error' });
    res.json({ success: true, products });
  });
});

router.post('/products', adminAuth, async (req, res) => {
  const { sku, title, description, category, base_price, selling_price } = req.body;

  const profitMargin = ((selling_price - base_price) / selling_price * 100).toFixed(2);

  db.run(
    `INSERT INTO products (sku, title, description, category, base_price, selling_price, profit_margin)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [sku, title, description, category, base_price, selling_price, profitMargin],
    function(err) {
      if (err) return res.status(500).json({ success: false, message: 'Error creating product' });
      res.json({ success: true, productId: this.lastID });
    }
  );
});

// ===========================
// SALES & REVENUE
// ===========================

router.get('/sales', adminAuth, (req, res) => {
  const { platform, status, limit = 50 } = req.query;
  let query = 'SELECT s.*, p.title as product_title FROM sales s JOIN products p ON s.product_id = p.id WHERE 1=1';
  const params = [];

  if (platform) {
    query += ' AND s.platform = ?';
    params.push(platform);
  }
  if (status) {
    query += ' AND s.order_status = ?';
    params.push(status);
  }

  query += ' ORDER BY s.order_date DESC LIMIT ?';
  params.push(parseInt(limit));

  db.all(query, params, (err, sales) => {
    if (err) return res.status(500).json({ success: false, message: 'Server error' });
    res.json({ success: true, sales });
  });
});

router.get('/revenue/analytics', adminAuth, (req, res) => {
  const { days = 30 } = req.query;

  db.all(
    `SELECT * FROM revenue_daily
     WHERE date >= DATE('now', '-${days} days')
     ORDER BY date DESC`,
    [],
    (err, revenue) => {
      if (err) return res.status(500).json({ success: false, message: 'Server error' });
      res.json({ success: true, revenue });
    }
  );
});

// ===========================
// TRENDING NICHES
// ===========================

router.get('/niches', adminAuth, (req, res) => {
  db.all(
    'SELECT * FROM trending_niches WHERE status = \'active\' ORDER BY profit_potential DESC, search_volume DESC',
    [],
    (err, niches) => {
      if (err) return res.status(500).json({ success: false, message: 'Server error' });
      res.json({ success: true, niches });
    }
  );
});

// ===========================
// AUTOMATION CONTROLS
// ===========================

router.post('/automation/analyze-trends', adminAuth, async (req, res) => {
  try {
    const result = await profitAutomation.analyzeTrends();
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/automation/create-products', adminAuth, async (req, res) => {
  try {
    const { limit = 5 } = req.body;
    const result = await profitAutomation.createProductsFromTrends(limit);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/automation/sync-orders', adminAuth, async (req, res) => {
  try {
    const result = await profitAutomation.syncOrders();
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/automation/run-full-cycle', adminAuth, async (req, res) => {
  try {
    const result = await profitAutomation.runCompleteProfitCycle();
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===========================
// EXPENSES
// ===========================

router.get('/expenses', adminAuth, (req, res) => {
  const { category } = req.query;
  let query = 'SELECT * FROM expenses WHERE 1=1';
  const params = [];

  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }

  query += ' ORDER BY expense_date DESC';

  db.all(query, params, (err, expenses) => {
    if (err) return res.status(500).json({ success: false, message: 'Server error' });
    res.json({ success: true, expenses });
  });
});

router.post('/expenses', adminAuth, (req, res) => {
  const { category, description, amount, expense_date } = req.body;

  db.run(
    'INSERT INTO expenses (category, description, amount, expense_date) VALUES (?, ?, ?, ?)',
    [category, description, amount, expense_date],
    function(err) {
      if (err) return res.status(500).json({ success: false, message: 'Error recording expense' });
      res.json({ success: true, expenseId: this.lastID });
    }
  );
});

// ===========================
// PROFIT GOALS
// ===========================

router.get('/goals', adminAuth, (req, res) => {
  db.all(
    'SELECT * FROM profit_goals ORDER BY end_date DESC',
    [],
    (err, goals) => {
      if (err) return res.status(500).json({ success: false, message: 'Server error' });
      res.json({ success: true, goals });
    }
  );
});

router.post('/goals', adminAuth, (req, res) => {
  const { period, target_amount, start_date, end_date } = req.body;

  db.run(
    'INSERT INTO profit_goals (period, target_amount, start_date, end_date) VALUES (?, ?, ?, ?)',
    [period, target_amount, start_date, end_date],
    function(err) {
      if (err) return res.status(500).json({ success: false, message: 'Error creating goal' });
      res.json({ success: true, goalId: this.lastID });
    }
  );
});

// ===========================
// CUSTOMER LTV
// ===========================

router.get('/customers/ltv', adminAuth, (req, res) => {
  db.all(
    'SELECT * FROM customer_ltv ORDER BY total_spent DESC LIMIT 50',
    [],
    (err, customers) => {
      if (err) return res.status(500).json({ success: false, message: 'Server error' });
      res.json({ success: true, customers });
    }
  );
});

export default router;
