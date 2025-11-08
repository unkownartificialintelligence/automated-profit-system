import express from 'express';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../../database.db');

// Helper function to run database queries as promises
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
// TEAM MEMBER MANAGEMENT
// ============================================

// GET /api/team - Get all team members
router.get('/', async (req, res) => {
  try {
    const members = await dbAll(`
      SELECT
        tm.*,
        t.name as tier_name,
        t.profit_milestone,
        t.revenue_share_percentage,
        (SELECT SUM(share_amount) FROM revenue_shares WHERE team_member_id = tm.id AND status = 'held') as pending_shares,
        (SELECT SUM(share_amount) FROM revenue_shares WHERE team_member_id = tm.id AND status = 'released') as released_shares
      FROM team_members tm
      JOIN tiers t ON tm.tier_id = t.id
      ORDER BY tm.total_profit DESC
    `);

    res.json({
      success: true,
      count: members.length,
      members
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/team/:id - Get specific team member
router.get('/:id', async (req, res) => {
  try {
    const member = await dbGet(`
      SELECT
        tm.*,
        t.name as tier_name,
        t.profit_milestone,
        t.revenue_share_percentage
      FROM team_members tm
      JOIN tiers t ON tm.tier_id = t.id
      WHERE tm.id = ?
    `, [req.params.id]);

    if (!member) {
      return res.status(404).json({ success: false, message: 'Team member not found' });
    }

    // Get profit history
    const profits = await dbAll(
      'SELECT * FROM profits WHERE team_member_id = ? ORDER BY created_at DESC LIMIT 50',
      [req.params.id]
    );

    // Get revenue shares
    const revenueShares = await dbAll(
      'SELECT * FROM revenue_shares WHERE team_member_id = ? ORDER BY created_at DESC LIMIT 50',
      [req.params.id]
    );

    res.json({
      success: true,
      member,
      profits,
      revenueShares
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/team - Add new team member
router.post('/', async (req, res) => {
  try {
    const { email, name, tier_id, printful_api_key, stripe_account_id } = req.body;

    if (!email || !name || !tier_id) {
      return res.status(400).json({
        success: false,
        message: 'Email, name, and tier_id are required'
      });
    }

    const result = await dbRun(
      `INSERT INTO team_members (email, name, tier_id, printful_api_key, stripe_account_id)
       VALUES (?, ?, ?, ?, ?)`,
      [email, name, tier_id, printful_api_key || null, stripe_account_id || null]
    );

    const newMember = await dbGet('SELECT * FROM team_members WHERE id = ?', [result.lastID]);

    res.json({
      success: true,
      message: 'Team member added successfully',
      member: newMember
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/team/:id - Update team member
router.put('/:id', async (req, res) => {
  try {
    const { name, tier_id, printful_api_key, stripe_account_id, status } = req.body;

    const updates = [];
    const params = [];

    if (name) { updates.push('name = ?'); params.push(name); }
    if (tier_id) { updates.push('tier_id = ?'); params.push(tier_id); }
    if (printful_api_key !== undefined) { updates.push('printful_api_key = ?'); params.push(printful_api_key); }
    if (stripe_account_id !== undefined) { updates.push('stripe_account_id = ?'); params.push(stripe_account_id); }
    if (status) { updates.push('status = ?'); params.push(status); }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(req.params.id);

    await dbRun(
      `UPDATE team_members SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    const updated = await dbGet('SELECT * FROM team_members WHERE id = ?', [req.params.id]);

    res.json({
      success: true,
      message: 'Team member updated successfully',
      member: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// PROFIT TRACKING
// ============================================

// POST /api/team/:id/profits - Add profit record (auto-calculates 25% share)
router.post('/:id/profits', async (req, res) => {
  try {
    const { order_id, sale_amount, cost_amount, description } = req.body;

    if (!sale_amount || !cost_amount) {
      return res.status(400).json({
        success: false,
        message: 'sale_amount and cost_amount are required'
      });
    }

    const profit_amount = sale_amount - cost_amount;
    const revenue_share_amount = profit_amount * 0.25; // 25% automatic share

    const result = await dbRun(
      `INSERT INTO profits (team_member_id, order_id, sale_amount, cost_amount, profit_amount, revenue_share_amount, description)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [req.params.id, order_id || null, sale_amount, cost_amount, profit_amount, revenue_share_amount, description || null]
    );

    const newProfit = await dbGet('SELECT * FROM profits WHERE id = ?', [result.lastID]);

    // Check if milestone was reached
    const member = await dbGet('SELECT * FROM team_members WHERE id = ?', [req.params.id]);

    res.json({
      success: true,
      message: 'Profit recorded successfully',
      profit: newProfit,
      milestone_reached: member.milestone_reached === 1,
      total_profit: member.total_profit
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/team/:id/profits - Get all profits for a team member
router.get('/:id/profits', async (req, res) => {
  try {
    const profits = await dbAll(
      'SELECT * FROM profits WHERE team_member_id = ? ORDER BY created_at DESC',
      [req.params.id]
    );

    const totalProfit = profits.reduce((sum, p) => sum + p.profit_amount, 0);
    const totalRevenueShare = profits.reduce((sum, p) => sum + p.revenue_share_amount, 0);

    res.json({
      success: true,
      count: profits.length,
      totalProfit,
      totalRevenueShare,
      profits
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// REVENUE SHARES & PAYOUTS
// ============================================

// GET /api/team/revenue-shares/pending - Get all pending revenue shares (held until milestone)
router.get('/revenue-shares/pending', async (req, res) => {
  try {
    const pendingShares = await dbAll(`
      SELECT
        rs.*,
        tm.name as member_name,
        tm.email as member_email,
        tm.total_profit,
        t.profit_milestone
      FROM revenue_shares rs
      JOIN team_members tm ON rs.team_member_id = tm.id
      JOIN tiers t ON tm.tier_id = t.id
      WHERE rs.status = 'held'
      ORDER BY rs.created_at DESC
    `);

    const totalPending = pendingShares.reduce((sum, s) => sum + s.share_amount, 0);

    res.json({
      success: true,
      totalPending,
      count: pendingShares.length,
      shares: pendingShares
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/team/revenue-shares/released - Get all released revenue shares (milestone reached)
router.get('/revenue-shares/released', async (req, res) => {
  try {
    const releasedShares = await dbAll(`
      SELECT
        rs.*,
        tm.name as member_name,
        tm.email as member_email
      FROM revenue_shares rs
      JOIN team_members tm ON rs.team_member_id = tm.id
      WHERE rs.status = 'released'
      ORDER BY rs.released_at DESC
    `);

    const totalReleased = releasedShares.reduce((sum, s) => sum + s.share_amount, 0);

    res.json({
      success: true,
      totalReleased,
      count: releasedShares.length,
      shares: releasedShares
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/team/payouts - Get all pending payouts
router.get('/payouts', async (req, res) => {
  try {
    const payouts = await dbAll(`
      SELECT
        p.*,
        tm.name as member_name,
        tm.email as member_email,
        t.name as tier_name
      FROM payouts p
      JOIN team_members tm ON p.team_member_id = tm.id
      JOIN tiers t ON tm.tier_id = t.id
      ORDER BY p.created_at DESC
    `);

    const pendingPayouts = payouts.filter(p => p.status === 'pending');
    const totalPending = pendingPayouts.reduce((sum, p) => sum + p.total_amount, 0);

    res.json({
      success: true,
      totalPending,
      pendingCount: pendingPayouts.length,
      totalCount: payouts.length,
      payouts
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/team/payouts/:id/process - Mark payout as processed
router.post('/payouts/:id/process', async (req, res) => {
  try {
    const { payment_method, payment_reference } = req.body;

    await dbRun(
      `UPDATE payouts
       SET status = 'completed',
           payment_method = ?,
           payment_reference = ?,
           processed_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [payment_method || null, payment_reference || null, req.params.id]
    );

    // Mark revenue shares as paid out
    await dbRun(
      `UPDATE revenue_shares
       SET status = 'paid_out',
           paid_out_at = CURRENT_TIMESTAMP
       WHERE team_member_id = (SELECT team_member_id FROM payouts WHERE id = ?)
         AND status = 'released'`,
      [req.params.id]
    );

    const payout = await dbGet('SELECT * FROM payouts WHERE id = ?', [req.params.id]);

    res.json({
      success: true,
      message: 'Payout processed successfully',
      payout
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// DASHBOARD STATISTICS
// ============================================

// GET /api/team/stats - Get overall statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await dbGet(`
      SELECT
        COUNT(DISTINCT tm.id) as total_members,
        COUNT(DISTINCT CASE WHEN tm.milestone_reached = 1 THEN tm.id END) as members_reached_milestone,
        SUM(tm.total_profit) as total_system_profit,
        (SELECT SUM(share_amount) FROM revenue_shares WHERE status = 'held') as pending_shares,
        (SELECT SUM(share_amount) FROM revenue_shares WHERE status = 'released') as released_shares,
        (SELECT SUM(total_amount) FROM payouts WHERE status = 'pending') as pending_payouts,
        (SELECT SUM(total_amount) FROM payouts WHERE status = 'completed') as completed_payouts
      FROM team_members tm
    `);

    // Get tier breakdown
    const tierBreakdown = await dbAll(`
      SELECT
        t.name as tier_name,
        COUNT(tm.id) as member_count,
        SUM(tm.total_profit) as tier_total_profit
      FROM tiers t
      LEFT JOIN team_members tm ON t.id = tm.tier_id
      GROUP BY t.id, t.name
    `);

    res.json({
      success: true,
      stats,
      tierBreakdown
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
