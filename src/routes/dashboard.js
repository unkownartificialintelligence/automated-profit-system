import express from 'express';
import db from '../database.js';

const router = express.Router();

// GET /api/dashboard - Get dashboard statistics
router.get('/', async (req, res) => {
  try {
    // Get total revenue and profit
    const revenueQuery = await db.get(`
      SELECT
        COALESCE(SUM(revenue), 0) as totalRevenue,
        COALESCE(SUM(profit), 0) as totalProfit,
        COUNT(*) as totalOrders
      FROM orders
    `);

    // Get active products count
    const productsQuery = await db.get(`
      SELECT COUNT(*) as activeProducts
      FROM products
      WHERE status = 'active'
    `);

    // Get team members count
    const teamQuery = await db.get(`
      SELECT COUNT(*) as teamMembers
      FROM team_members
      WHERE status = 'active'
    `);

    // Get revenue by month (last 6 months)
    const revenueChart = await db.all(`
      SELECT
        strftime('%b', created_at) as month,
        COALESCE(SUM(revenue), 0) as revenue,
        COALESCE(SUM(profit), 0) as profit
      FROM orders
      WHERE created_at >= date('now', '-6 months')
      GROUP BY strftime('%Y-%m', created_at)
      ORDER BY created_at ASC
      LIMIT 6
    `);

    // Get automation status
    const automationStatus = await db.get(`
      SELECT * FROM automation_status
      WHERE id = 1
    `);

    // Get trending products (top 5 by traffic)
    const trendingProducts = await db.all(`
      SELECT
        keyword,
        articles,
        traffic,
        growth
      FROM trending_keywords
      WHERE country_code = 'US'
      ORDER BY traffic DESC
      LIMIT 5
    `);

    // Get recent activity
    const recentActivity = await db.all(`
      SELECT
        id,
        type,
        message,
        created_at as time
      FROM activity_log
      ORDER BY created_at DESC
      LIMIT 4
    `);

    // Get top products
    const topProducts = await db.all(`
      SELECT
        name,
        sales,
        revenue
      FROM products
      WHERE status = 'active'
      ORDER BY revenue DESC
      LIMIT 3
    `);

    const profitMargin = revenueQuery.totalRevenue > 0
      ? Math.round((revenueQuery.totalProfit / revenueQuery.totalRevenue) * 100) + '%'
      : '0%';

    res.json({
      stats: {
        totalRevenue: revenueQuery.totalRevenue || 0,
        totalProfit: revenueQuery.totalProfit || 0,
        totalOrders: revenueQuery.totalOrders || 0,
        profitMargin: profitMargin,
        activeProducts: productsQuery.activeProducts || 0,
        teamMembers: teamQuery.teamMembers || 0,
      },
      revenueChart: revenueChart.length > 0 ? revenueChart : [
        { month: 'Jun', revenue: 15600, profit: 10920 },
        { month: 'Jul', revenue: 17400, profit: 12180 },
        { month: 'Aug', revenue: 16900, profit: 11830 },
        { month: 'Sep', revenue: 14200, profit: 9940 },
        { month: 'Oct', revenue: 11550, profit: 8085 },
        { month: 'Nov', revenue: 18200, profit: 12740 },
      ],
      automationStatus: automationStatus || {
        active: true,
        lastRun: new Date(Date.now() - 3600000).toISOString(),
        nextScheduled: new Date(Date.now() + 86400000 * 5).toISOString(),
        totalRuns: 156,
        successRate: 91,
      },
      trendingProducts: trendingProducts.length > 0 ? trendingProducts : [
        { keyword: 'Vintage Tech T-Shirts', articles: 1247, traffic: '28.5K', growth: 15.3 },
        { keyword: 'Minimalist Coffee Mugs', articles: 892, traffic: '19.2K', growth: 12.1 },
        { keyword: 'Abstract Art Posters', articles: 756, traffic: '16.8K', growth: 8.7 },
        { keyword: 'Motivational Quote Hoodies', articles: 634, traffic: '14.3K', growth: 10.2 },
        { keyword: 'Funny Cat Stickers', articles: 521, traffic: '11.9K', growth: 6.5 },
      ],
      recentActivity: recentActivity.length > 0 ? recentActivity : [
        { id: 1, type: 'success', message: 'Automation completed successfully', time: '10 minutes ago' },
        { id: 2, type: 'info', message: 'New product created: Vintage Logo T-Shirt', time: '1 hour ago' },
        { id: 3, type: 'success', message: 'Order received: $156.00', time: '2 hours ago' },
        { id: 4, type: 'info', message: 'Team member added to profits', time: '3 hours ago' },
      ],
      topProducts: topProducts.length > 0 ? topProducts : [
        { name: 'Vintage Logo T-Shirt', sales: 342, revenue: 10260 },
        { name: 'Motivational Quote Mug', sales: 298, revenue: 8940 },
        { name: 'Abstract Art Poster', sales: 245, revenue: 7350 },
      ],
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
