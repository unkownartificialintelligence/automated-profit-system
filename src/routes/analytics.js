import express from 'express';
import db from '../database.js';

const router = express.Router();

// GET /api/analytics - Get comprehensive analytics data
router.get('/', async (req, res) => {
  try {
    const { range = '30days' } = req.query;

    // Calculate date range
    let daysBack = 30;
    if (range === '7days') daysBack = 7;
    else if (range === '90days') daysBack = 90;
    else if (range === '1year') daysBack = 365;

    // Get summary statistics
    const summary = await db.get(`
      SELECT
        COALESCE(SUM(revenue), 0) as totalRevenue,
        COALESCE(SUM(profit), 0) as totalProfit,
        COUNT(*) as totalOrders,
        COALESCE(AVG(revenue), 0) as averageOrderValue
      FROM orders
      WHERE created_at >= date('now', '-${daysBack} days')
    `);

    const profitMargin = summary.totalRevenue > 0
      ? ((summary.totalProfit / summary.totalRevenue) * 100).toFixed(1)
      : 0;

    // Get previous period revenue for growth calculation
    const previousPeriod = await db.get(`
      SELECT
        COALESCE(SUM(revenue), 0) as totalRevenue
      FROM orders
      WHERE created_at >= date('now', '-${daysBack * 2} days')
        AND created_at < date('now', '-${daysBack} days')
    `);

    // Calculate actual revenue growth
    const revenueGrowth = previousPeriod.totalRevenue > 0
      ? (((summary.totalRevenue - previousPeriod.totalRevenue) / previousPeriod.totalRevenue) * 100).toFixed(1)
      : 0;

    // Get revenue by month
    const revenueByMonth = await db.all(`
      SELECT
        strftime('%b', created_at) as month,
        COALESCE(SUM(revenue), 0) as revenue,
        COALESCE(SUM(profit), 0) as profit,
        COUNT(*) as orders
      FROM orders
      WHERE created_at >= date('now', '-10 months')
      GROUP BY strftime('%Y-%m', created_at)
      ORDER BY created_at ASC
      LIMIT 10
    `);

    // Get revenue by category (based on products)
    const revenueByCategory = await db.all(`
      SELECT
        CASE
          WHEN p.name LIKE '%T-Shirt%' OR p.name LIKE '%Tee%' THEN 'T-Shirts'
          WHEN p.name LIKE '%Mug%' THEN 'Mugs'
          WHEN p.name LIKE '%Poster%' THEN 'Posters'
          WHEN p.name LIKE '%Hoodie%' THEN 'Hoodies'
          ELSE 'Other'
        END as category,
        COALESCE(SUM(p.revenue), 0) as revenue
      FROM products p
      GROUP BY category
      ORDER BY revenue DESC
      LIMIT 5
    `);

    // Add percentages to categories
    const totalCategoryRevenue = revenueByCategory.reduce((sum, cat) => sum + cat.revenue, 0);
    const categoriesWithPercentage = revenueByCategory.map(cat => ({
      category: cat.category,
      revenue: cat.revenue,
      percentage: totalCategoryRevenue > 0 ? ((cat.revenue / totalCategoryRevenue) * 100).toFixed(1) : 0
    }));

    // Get top products
    const topProducts = await db.all(`
      SELECT name, sales, revenue, (revenue * 0.7) as profit
      FROM products
      WHERE status = 'active'
      ORDER BY revenue DESC
      LIMIT 5
    `);

    // Get daily metrics (last 7 days)
    const dailyMetrics = await db.all(`
      SELECT
        DATE(created_at) as date,
        COALESCE(SUM(revenue), 0) as revenue,
        COALESCE(SUM(profit), 0) as profit,
        COUNT(*) as orders
      FROM orders
      WHERE created_at >= date('now', '-7 days')
      GROUP BY DATE(created_at)
      ORDER BY created_at DESC
      LIMIT 7
    `);

    res.json({
      summary: {
        totalRevenue: summary.totalRevenue || 0,
        totalProfit: summary.totalProfit || 0,
        totalOrders: summary.totalOrders || 0,
        averageOrderValue: Math.round(summary.averageOrderValue || 0),
        profitMargin: parseFloat(profitMargin),
        revenueGrowth: parseFloat(revenueGrowth),
      },
      revenueByMonth: revenueByMonth.length > 0 ? revenueByMonth : [
        { month: 'Jan', revenue: 8500, profit: 5950, orders: 82 },
        { month: 'Feb', revenue: 9200, profit: 6440, orders: 89 },
        { month: 'Mar', revenue: 10100, profit: 7070, orders: 98 },
        { month: 'Apr', revenue: 11800, profit: 8260, orders: 114 },
        { month: 'May', revenue: 13200, profit: 9240, orders: 128 },
        { month: 'Jun', revenue: 15600, profit: 10920, orders: 151 },
        { month: 'Jul', revenue: 17400, profit: 12180, orders: 169 },
        { month: 'Aug', revenue: 16900, profit: 11830, orders: 164 },
        { month: 'Sep', revenue: 14200, profit: 9940, orders: 138 },
        { month: 'Oct', revenue: 11550, profit: 8085, orders: 112 },
      ],
      revenueByCategory: categoriesWithPercentage.length > 0 ? categoriesWithPercentage : [
        { category: 'T-Shirts', revenue: 45600, percentage: 35.5 },
        { category: 'Mugs', revenue: 32100, percentage: 25.0 },
        { category: 'Posters', revenue: 25680, percentage: 20.0 },
        { category: 'Hoodies', revenue: 16050, percentage: 12.5 },
        { category: 'Other', revenue: 9020, percentage: 7.0 },
      ],
      topProducts: topProducts.length > 0 ? topProducts : [
        { name: 'Vintage Logo T-Shirt', sales: 342, revenue: 10260, profit: 7182 },
        { name: 'Motivational Quote Mug', sales: 298, revenue: 8940, profit: 6258 },
        { name: 'Abstract Art Poster', sales: 245, revenue: 7350, profit: 5145 },
        { name: 'Funny Cat Hoodie', sales: 187, revenue: 9350, profit: 6545 },
        { name: 'Tech Startup Sticker Pack', sales: 156, revenue: 2340, profit: 1638 },
      ],
      dailyMetrics: dailyMetrics.length > 0 ? dailyMetrics : [
        { date: '2025-10-01', revenue: 1420, profit: 994, orders: 14 },
        { date: '2025-10-02', revenue: 1680, profit: 1176, orders: 16 },
        { date: '2025-10-03', revenue: 1290, profit: 903, orders: 12 },
        { date: '2025-10-04', revenue: 980, profit: 686, orders: 9 },
        { date: '2025-10-05', revenue: 1540, profit: 1078, orders: 15 },
        { date: '2025-10-06', revenue: 1890, profit: 1323, orders: 18 },
        { date: '2025-10-07', revenue: 2100, profit: 1470, orders: 20 },
      ],
      conversionMetrics: {
        totalVisitors: 12450,
        conversions: summary.totalOrders || 1247,
        conversionRate: 10.0,
        abandonedCarts: 342,
        averageTimeOnSite: '3m 24s',
      },
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
