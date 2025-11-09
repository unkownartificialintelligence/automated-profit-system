import express from 'express';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, '../../database.db');

// PHASE 4.10: Customer Lifetime Value Tracking
router.get('/clv/:tenantId', (req, res) => {
  try {
    const db = new Database(dbPath);
    const customers = db.prepare(`
      SELECT customer_email, 
             COUNT(*) as purchase_count,
             SUM(profit) as total_profit,
             AVG(profit) as avg_order_value,
             MIN(sale_date) as first_purchase,
             MAX(sale_date) as last_purchase
      FROM tenant_sales
      WHERE tenant_id = ?
      GROUP BY customer_email
      ORDER BY total_profit DESC
    `).all(req.params.tenantId);
    
    const segments = customers.map(c => ({
      ...c,
      clv: c.total_profit,
      segment: c.total_profit > 500 ? 'VIP' : c.total_profit > 200 ? 'High Value' : c.total_profit > 50 ? 'Medium Value' : 'Low Value',
      repeatRate: c.purchase_count > 1 ? ((c.purchase_count - 1) / c.purchase_count * 100).toFixed(1) : 0
    }));
    
    db.close();
    res.json({ success: true, customers: segments, totalCustomers: segments.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PHASE 4.11: Profit Forecasting (90 days)
router.get('/forecast/:tenantId', (req, res) => {
  try {
    const db = new Database(dbPath);
    const historicalData = db.prepare(`
      SELECT DATE(sale_date) as date, SUM(profit) as daily_profit
      FROM tenant_sales
      WHERE tenant_id = ? AND sale_date >= datetime('now', '-90 days')
      GROUP BY DATE(sale_date)
      ORDER BY date
    `).all(req.params.tenantId);
    
    const avgDaily = historicalData.reduce((sum, d) => sum + d.daily_profit, 0) / (historicalData.length || 1);
    const trend = historicalData.length > 1 ? (historicalData[historicalData.length - 1].daily_profit - historicalData[0].daily_profit) / historicalData.length : 0;
    
    const forecast = [];
    for (let i = 1; i <= 90; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const predictedDaily = Math.max(0, avgDaily + (trend * i) * 0.8);
      forecast.push({
        date: date.toISOString().split('T')[0],
        predictedProfit: Math.round(predictedDaily * 100) / 100,
        confidence: Math.max(50, 95 - i * 0.5)
      });
    }
    
    db.close();
    res.json({ 
      success: true, 
      forecast,
      summary: {
        next30Days: forecast.slice(0, 30).reduce((sum, d) => sum + d.predictedProfit, 0).toFixed(2),
        next60Days: forecast.slice(0, 60).reduce((sum, d) => sum + d.predictedProfit, 0).toFixed(2),
        next90Days: forecast.reduce((sum, d) => sum + d.predictedProfit, 0).toFixed(2)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PHASE 4.12: Advanced Reporting
router.post('/reports/generate', (req, res) => {
  try {
    const { tenantId, reportType, dateRange } = req.body;
    const db = new Database(dbPath);
    
    const stats = {
      totalRevenue: db.prepare('SELECT COALESCE(SUM(revenue), 0) as total FROM tenant_sales WHERE tenant_id = ?').get(tenantId).total,
      totalProfit: db.prepare('SELECT COALESCE(SUM(profit), 0) as total FROM tenant_sales WHERE tenant_id = ?').get(tenantId).total,
      totalSales: db.prepare('SELECT COUNT(*) as count FROM tenant_sales WHERE tenant_id = ?').get(tenantId).count,
      avgOrderValue: db.prepare('SELECT COALESCE(AVG(revenue), 0) as avg FROM tenant_sales WHERE tenant_id = ?').get(tenantId).avg,
      topProducts: db.prepare(`
        SELECT p.product_name, COUNT(*) as sales, SUM(s.profit) as total_profit
        FROM tenant_sales s
        JOIN tenant_products p ON s.product_id = p.id
        WHERE s.tenant_id = ?
        GROUP BY p.product_name
        ORDER BY total_profit DESC
        LIMIT 10
      `).all(tenantId)
    };
    
    db.close();
    res.json({ success: true, report: stats, generatedAt: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/reports/export/:tenantId', (req, res) => {
  try {
    const db = new Database(dbPath);
    const data = db.prepare('SELECT * FROM tenant_sales WHERE tenant_id = ?').all(req.params.tenantId);
    db.close();
    
    const csv = [
      Object.keys(data[0] || {}).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=sales-report-${req.params.tenantId}.csv`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
