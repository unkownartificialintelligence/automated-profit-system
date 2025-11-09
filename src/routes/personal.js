import express from 'express';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../../database.db');

// Helper functions
const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath);
    db.run(sql, params, function(err) {
      db.close();
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath);
    db.get(sql, params, (err, row) => {
      db.close();
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath);
    db.all(sql, params, (err, rows) => {
      db.close();
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// ============================================
// PERSONAL ACCOUNT MANAGEMENT
// ============================================

// GET /api/personal - Get your personal account overview
router.get('/', async (req, res) => {
  try {
    // Get or create personal account (ID 0 = owner account)
    let personalAccount = await dbGet(
      'SELECT * FROM team_members WHERE id = 0'
    );

    if (!personalAccount) {
      // Create personal owner account
      await dbRun(
        `INSERT INTO team_members (id, email, name, tier_id, status, total_profit, milestone_reached)
         VALUES (0, 'owner@automated-profit-system.com', 'Your Personal Account', 1, 'owner', 0, 1)`,
        []
      );
      personalAccount = await dbGet('SELECT * FROM team_members WHERE id = 0');
    }

    // Get stats
    const stats = await dbGet(`
      SELECT
        COUNT(*) as total_sales,
        SUM(profit_amount) as total_profit,
        SUM(sale_amount) as total_revenue,
        SUM(cost_amount) as total_costs,
        AVG(profit_amount) as avg_profit_per_sale
      FROM profits
      WHERE team_member_id = 0
    `);

    // Get recent sales
    const recentSales = await dbAll(
      `SELECT * FROM profits WHERE team_member_id = 0 ORDER BY created_at DESC LIMIT 10`
    );

    // Get monthly breakdown
    const monthlyStats = await dbAll(`
      SELECT
        strftime('%Y-%m', created_at) as month,
        COUNT(*) as sales,
        SUM(profit_amount) as profit
      FROM profits
      WHERE team_member_id = 0
      GROUP BY month
      ORDER BY month DESC
      LIMIT 12
    `);

    res.json({
      success: true,
      account: {
        name: 'Your Personal Account',
        email: personalAccount.email,
        status: 'Owner - 100% of profits',
        total_profit: stats.total_profit || 0,
        total_revenue: stats.total_revenue || 0,
        total_costs: stats.total_costs || 0,
        total_sales: stats.total_sales || 0,
        avg_profit: stats.avg_profit_per_sale || 0,
        tier: 'Owner (No revenue share)'
      },
      recent_sales: recentSales,
      monthly_stats: monthlyStats,
      tips: [
        '🎯 You keep 100% of your profits (no revenue share)',
        '📊 Track every sale to see what products work best',
        '💰 Your avg profit per sale: $' + (stats.avg_profit_per_sale || 0).toFixed(2),
        '🚀 List 5-10 products to start seeing consistent sales'
      ]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/personal/sales - Record a personal sale
router.post('/sales', async (req, res) => {
  try {
    const {
      product_name,
      platform,
      sale_amount,
      printful_cost,
      shipping_cost = 0,
      platform_fees = 0,
      transaction_fees = 0,
      advertising_cost = 0,
      notes
    } = req.body;

    if (!sale_amount || !printful_cost) {
      return res.status(400).json({
        success: false,
        message: 'sale_amount and printful_cost are required'
      });
    }

    // Calculate total costs
    const total_costs = parseFloat(printful_cost) +
                       parseFloat(shipping_cost) +
                       parseFloat(platform_fees) +
                       parseFloat(transaction_fees) +
                       parseFloat(advertising_cost);

    const profit = parseFloat(sale_amount) - total_costs;
    const profit_margin = (profit / sale_amount) * 100;

    // Ensure personal account exists
    let personalAccount = await dbGet('SELECT * FROM team_members WHERE id = 0');
    if (!personalAccount) {
      await dbRun(
        `INSERT INTO team_members (id, email, name, tier_id, status, total_profit, milestone_reached)
         VALUES (0, 'owner@automated-profit-system.com', 'Your Personal Account', 1, 'owner', 0, 1)`,
        []
      );
    }

    // Record sale
    const result = await dbRun(
      `INSERT INTO profits (
        team_member_id, order_id, sale_amount, cost_amount,
        profit_amount, revenue_share_amount, description
      ) VALUES (0, ?, ?, ?, ?, 0, ?)`,
      [
        `${platform || 'MANUAL'}_${Date.now()}`,
        sale_amount,
        total_costs,
        profit,
        `${product_name || 'Sale'} - ${notes || ''}`
      ]
    );

    // Update total profit
    await dbRun(
      'UPDATE team_members SET total_profit = total_profit + ?, updated_at = CURRENT_TIMESTAMP WHERE id = 0',
      [profit]
    );

    res.json({
      success: true,
      message: '🎉 Sale recorded successfully!',
      sale: {
        id: result.lastID,
        product_name,
        platform,
        sale_amount: parseFloat(sale_amount).toFixed(2),
        total_costs: total_costs.toFixed(2),
        profit: profit.toFixed(2),
        profit_margin: profit_margin.toFixed(2) + '%',
        breakdown: {
          revenue: parseFloat(sale_amount).toFixed(2),
          printful_cost: parseFloat(printful_cost).toFixed(2),
          shipping: parseFloat(shipping_cost).toFixed(2),
          platform_fees: parseFloat(platform_fees).toFixed(2),
          transaction_fees: parseFloat(transaction_fees).toFixed(2),
          advertising: parseFloat(advertising_cost).toFixed(2)
        }
      },
      congrats: profit > 0 ?
        `You made $${profit.toFixed(2)} profit! 💰` :
        'Review your costs - this sale was not profitable',
      next_steps: [
        'Create variations of this product',
        'Share on social media',
        'Analyze what marketing worked',
        profit > 0 ? 'Do more of this!' : 'Adjust pricing or reduce costs'
      ]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/personal/dashboard - Quick dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    const stats = await dbGet(`
      SELECT
        COUNT(*) as total_sales,
        SUM(profit_amount) as total_profit,
        SUM(sale_amount) as total_revenue
      FROM profits
      WHERE team_member_id = 0
    `);

    // Today's sales
    const today = await dbGet(`
      SELECT
        COUNT(*) as sales,
        SUM(profit_amount) as profit
      FROM profits
      WHERE team_member_id = 0
        AND date(created_at) = date('now')
    `);

    // This week's sales
    const thisWeek = await dbGet(`
      SELECT
        COUNT(*) as sales,
        SUM(profit_amount) as profit
      FROM profits
      WHERE team_member_id = 0
        AND date(created_at) >= date('now', '-7 days')
    `);

    // This month's sales
    const thisMonth = await dbGet(`
      SELECT
        COUNT(*) as sales,
        SUM(profit_amount) as profit
      FROM profits
      WHERE team_member_id = 0
        AND strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')
    `);

    // Best selling product
    const bestProduct = await dbGet(`
      SELECT
        description,
        COUNT(*) as times_sold,
        SUM(profit_amount) as total_profit
      FROM profits
      WHERE team_member_id = 0
      GROUP BY description
      ORDER BY times_sold DESC
      LIMIT 1
    `);

    res.json({
      success: true,
      summary: {
        all_time: {
          sales: stats.total_sales || 0,
          profit: (stats.total_profit || 0).toFixed(2),
          revenue: (stats.total_revenue || 0).toFixed(2)
        },
        today: {
          sales: today.sales || 0,
          profit: (today.profit || 0).toFixed(2)
        },
        this_week: {
          sales: thisWeek.sales || 0,
          profit: (thisWeek.profit || 0).toFixed(2)
        },
        this_month: {
          sales: thisMonth.sales || 0,
          profit: (thisMonth.profit || 0).toFixed(2)
        }
      },
      best_product: bestProduct ? {
        name: bestProduct.description,
        times_sold: bestProduct.times_sold,
        total_profit: parseFloat(bestProduct.total_profit).toFixed(2)
      } : null,
      milestones: {
        first_sale: stats.total_sales >= 1,
        ten_sales: stats.total_sales >= 10,
        hundred_dollars: (stats.total_profit || 0) >= 100,
        thousand_dollars: (stats.total_profit || 0) >= 1000
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/personal/quick-sale - Super quick sale entry (for mobile/quick entry)
router.post('/quick-sale', async (req, res) => {
  try {
    const { amount, product = 'Quick Sale' } = req.body;

    if (!amount) {
      return res.status(400).json({ success: false, message: 'amount is required' });
    }

    // Assume standard costs for quick entry
    const saleAmount = parseFloat(amount);
    const estimatedCost = saleAmount * 0.65; // Assume 35% profit margin
    const profit = saleAmount - estimatedCost;

    // Ensure personal account exists
    let personalAccount = await dbGet('SELECT * FROM team_members WHERE id = 0');
    if (!personalAccount) {
      await dbRun(
        `INSERT INTO team_members (id, email, name, tier_id, status, total_profit, milestone_reached)
         VALUES (0, 'owner@automated-profit-system.com', 'Your Personal Account', 1, 'owner', 0, 1)`,
        []
      );
    }

    const result = await dbRun(
      `INSERT INTO profits (team_member_id, order_id, sale_amount, cost_amount, profit_amount, revenue_share_amount, description)
       VALUES (0, ?, ?, ?, ?, 0, ?)`,
      [`QUICK_${Date.now()}`, saleAmount, estimatedCost, profit, `Quick Entry: ${product}`]
    );

    await dbRun(
      'UPDATE team_members SET total_profit = total_profit + ? WHERE id = 0',
      [profit]
    );

    res.json({
      success: true,
      message: '✅ Quick sale recorded!',
      profit: profit.toFixed(2),
      tip: 'Use /api/personal/sales for detailed tracking with all costs'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
