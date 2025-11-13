import express from 'express';
import db from '../database.js';

const router = express.Router();

// GET /api/automation/status - Get automation status
router.get('/status', async (req, res) => {
  try {
    const status = await db.get('SELECT * FROM automation_status WHERE id = 1');

    res.json(status || {
      id: 1,
      active: false,
      last_run: null,
      next_scheduled: null,
      total_runs: 0,
      success_rate: 0
    });
  } catch (error) {
    console.error('Automation status error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/automation/start - Start automation
router.post('/start', async (req, res) => {
  try {
    await db.run(`
      UPDATE automation_status
      SET active = 1
      WHERE id = 1
    `);

    const status = await db.get('SELECT * FROM automation_status WHERE id = 1');

    res.json({ message: 'Automation started', status });
  } catch (error) {
    console.error('Start automation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/automation/stop - Stop automation
router.post('/stop', async (req, res) => {
  try {
    await db.run(`
      UPDATE automation_status
      SET active = 0
      WHERE id = 1
    `);

    const status = await db.get('SELECT * FROM automation_status WHERE id = 1');

    res.json({ message: 'Automation stopped', status });
  } catch (error) {
    console.error('Stop automation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/automation/runs - Get automation run history
router.get('/runs', async (req, res) => {
  try {
    // For now, return mock data
    // TODO: Create automation_runs table and track actual runs
    const runs = [
      { id: 1, status: 'success', products_created: 5, started_at: '2025-11-12T09:00:00Z', completed_at: '2025-11-12T09:15:00Z', duration: '15m' },
      { id: 2, status: 'success', products_created: 8, started_at: '2025-11-05T09:00:00Z', completed_at: '2025-11-05T09:18:00Z', duration: '18m' },
      { id: 3, status: 'failed', products_created: 0, started_at: '2025-10-29T09:00:00Z', completed_at: '2025-10-29T09:05:00Z', duration: '5m', error: 'API rate limit exceeded' },
      { id: 4, status: 'success', products_created: 6, started_at: '2025-10-22T09:00:00Z', completed_at: '2025-10-22T09:12:00Z', duration: '12m' },
      { id: 5, status: 'success', products_created: 7, started_at: '2025-10-15T09:00:00Z', completed_at: '2025-10-15T09:20:00Z', duration: '20m' },
    ];

    res.json({ runs });
  } catch (error) {
    console.error('Automation runs error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/automation/schedule - Update automation schedule
router.post('/schedule', async (req, res) => {
  try {
    const { next_scheduled } = req.body;

    if (!next_scheduled) {
      return res.status(400).json({ error: 'next_scheduled is required' });
    }

    await db.run(`
      UPDATE automation_status
      SET next_scheduled = ?
      WHERE id = 1
    `, [next_scheduled]);

    const status = await db.get('SELECT * FROM automation_status WHERE id = 1');

    res.json({ message: 'Schedule updated', status });
  } catch (error) {
    console.error('Update schedule error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
