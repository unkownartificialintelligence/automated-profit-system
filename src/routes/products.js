import express from 'express';
import axios from 'axios';
import googleTrends from 'google-trends-api';
import db from '../database.js';

const router = express.Router();

// ============================================
// PRODUCT CATALOG MANAGEMENT
// ============================================

// GET /api/products - Get all products with optional filtering
router.get('/', async (req, res) => {
  try {
    const { status, search } = req.query;

    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (status && status !== 'all') {
      query += ' AND status = ?';
      params.push(status);
    }

    if (search) {
      query += ' AND (name LIKE ? OR sku LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY created_at DESC';

    const products = await db.all(query, params);

    // Get statistics
    const stats = await db.get(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft,
        COALESCE(AVG(price), 0) as avgPrice
      FROM products
    `);

    res.json({
      products: products.length > 0 ? products : [],
      stats: {
        total: stats?.total || 0,
        active: stats?.active || 0,
        draft: stats?.draft || 0,
        avgPrice: stats?.avgPrice || 0,
      },
    });
  } catch (error) {
    console.error('Products error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/products/:id - Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await db.get('SELECT * FROM products WHERE id = ?', [req.params.id]);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Product fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/products - Create new product
router.post('/', async (req, res) => {
  try {
    const { name, sku, price, status, description } = req.body;

    if (!name || !sku || !price) {
      return res.status(400).json({ error: 'name, sku, and price are required' });
    }

    const result = await db.run(
      `INSERT INTO products (name, sku, price, status, description, sales, revenue, created_at)
       VALUES (?, ?, ?, ?, ?, 0, 0, datetime('now'))`,
      [name, sku, price, status || 'draft', description || '']
    );

    const product = await db.get('SELECT * FROM products WHERE id = ?', [result.lastID]);

    res.status(201).json(product);
  } catch (error) {
    console.error('Product creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/products/:id - Update product
router.put('/:id', async (req, res) => {
  try {
    const { name, sku, price, status, description } = req.body;

    await db.run(
      `UPDATE products
       SET name = ?, sku = ?, price = ?, status = ?, description = ?
       WHERE id = ?`,
      [name, sku, price, status, description, req.params.id]
    );

    const product = await db.get('SELECT * FROM products WHERE id = ?', [req.params.id]);

    res.json(product);
  } catch (error) {
    console.error('Product update error:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/products/:id - Delete product
router.delete('/:id', async (req, res) => {
  try {
    await db.run('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Product deletion error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// TRENDING PRODUCTS FINDER
// ============================================

// GET /api/products/trending - Find trending products to sell
router.get('/trending', async (req, res) => {
  try {
    const { keyword = 'print on demand', category = 'all', timeRange = 'now 7-d' } = req.query;

    // Get trending searches related to POD
    const trendsData = await googleTrends.relatedQueries({
      keyword: keyword,
      startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      geo: 'US'
    });

    const trends = JSON.parse(trendsData);

    // Get interest over time
    const interestData = await googleTrends.interestOverTime({
      keyword: keyword,
      startTime: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      geo: 'US'
    });

    const interest = JSON.parse(interestData);

    res.json({
      success: true,
      keyword,
      trending: {
        rising: trends.default?.rankedList?.[0]?.rankedKeyword?.slice(0, 10) || [],
        top: trends.default?.rankedList?.[1]?.rankedKeyword?.slice(0, 10) || [],
      },
      interestOverTime: interest.default?.timelineData || [],
      recommendations: generateProductRecommendations(trends)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// PROFIT CALCULATOR
// ============================================

// POST /api/products/calculate-profit - Calculate profit margins
router.post('/calculate-profit', async (req, res) => {
  try {
    const {
      selling_price,
      printful_cost,
      shipping_cost = 0,
      platform_fee_percentage = 0, // Etsy: 6.5%, Shopify: 0%
      transaction_fee_percentage = 3.5, // Stripe/PayPal typical
      advertising_cost = 0
    } = req.body;

    if (!selling_price || !printful_cost) {
      return res.status(400).json({
        success: false,
        message: 'selling_price and printful_cost are required'
      });
    }

    // Calculate all costs
    const platformFee = selling_price * (platform_fee_percentage / 100);
    const transactionFee = selling_price * (transaction_fee_percentage / 100);
    const totalCosts = printful_cost + shipping_cost + platformFee + transactionFee + advertising_cost;

    // Calculate profit
    const profit = selling_price - totalCosts;
    const profitMargin = (profit / selling_price) * 100;
    const roi = (profit / totalCosts) * 100;

    // Profitability rating
    let rating = 'Poor';
    let recommendation = 'Consider adjusting price or reducing costs';

    if (profitMargin >= 40) {
      rating = 'Excellent';
      recommendation = 'Great profit margin! This is a winning product.';
    } else if (profitMargin >= 30) {
      rating = 'Good';
      recommendation = 'Solid profit margin. Good product to sell.';
    } else if (profitMargin >= 20) {
      rating = 'Fair';
      recommendation = 'Acceptable margin. Watch costs carefully.';
    } else if (profitMargin >= 10) {
      rating = 'Low';
      recommendation = 'Low margin. Consider increasing price or finding cheaper supplier.';
    }

    res.json({
      success: true,
      calculation: {
        selling_price: parseFloat(selling_price).toFixed(2),
        costs: {
          printful_cost: parseFloat(printful_cost).toFixed(2),
          shipping_cost: parseFloat(shipping_cost).toFixed(2),
          platform_fee: platformFee.toFixed(2),
          transaction_fee: transactionFee.toFixed(2),
          advertising_cost: parseFloat(advertising_cost).toFixed(2),
          total_costs: totalCosts.toFixed(2)
        },
        profit: profit.toFixed(2),
        profit_margin: profitMargin.toFixed(2) + '%',
        roi: roi.toFixed(2) + '%',
        rating,
        recommendation
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// PRODUCT IDEAS GENERATOR
// ============================================

// GET /api/products/ideas - Get product ideas based on trends
router.get('/ideas', async (req, res) => {
  try {
    const { niche = 'general' } = req.query;

    const productIdeas = {
      general: [
        {
          name: 'Custom T-Shirts',
          suggested_price: 24.99,
          printful_cost: 12.95,
          estimated_profit: 8.50,
          demand: 'High',
          competition: 'High',
          tips: 'Focus on unique designs, niche audiences'
        },
        {
          name: 'Hoodies',
          suggested_price: 44.99,
          printful_cost: 28.50,
          estimated_profit: 12.00,
          demand: 'High',
          competition: 'Medium',
          tips: 'Great margins, popular in fall/winter'
        },
        {
          name: 'Mugs',
          suggested_price: 16.99,
          printful_cost: 8.95,
          estimated_profit: 5.50,
          demand: 'Very High',
          competition: 'Very High',
          tips: 'Low cost, easy to ship, need viral designs'
        },
        {
          name: 'Posters',
          suggested_price: 19.99,
          printful_cost: 7.50,
          estimated_profit: 9.00,
          demand: 'Medium',
          competition: 'Medium',
          tips: 'Good margins, target specific interests'
        },
        {
          name: 'Phone Cases',
          suggested_price: 22.99,
          printful_cost: 11.50,
          estimated_profit: 8.00,
          demand: 'High',
          competition: 'High',
          tips: 'Stay updated with new phone models'
        },
        {
          name: 'Tote Bags',
          suggested_price: 18.99,
          printful_cost: 10.25,
          estimated_profit: 6.00,
          demand: 'Medium',
          competition: 'Medium',
          tips: 'Eco-friendly angle, trendy designs'
        }
      ]
    };

    res.json({
      success: true,
      niche,
      ideas: productIdeas[niche] || productIdeas.general,
      tips: [
        '🎯 Focus on specific niches with passionate audiences',
        '🎨 Quality designs matter more than quantity',
        '📊 Test multiple products to find winners',
        '💰 Aim for 30%+ profit margins',
        '🚀 Start with 5-10 products, scale what works'
      ]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// PRICING OPTIMIZER
// ============================================

// POST /api/products/optimize-price - Get optimal pricing recommendations
router.post('/optimize-price', async (req, res) => {
  try {
    const { printful_cost, target_profit_margin = 30 } = req.body;

    if (!printful_cost) {
      return res.status(400).json({
        success: false,
        message: 'printful_cost is required'
      });
    }

    // Calculate prices for different scenarios
    const scenarios = [
      { name: 'Conservative', margin: 25 },
      { name: 'Balanced', margin: 30 },
      { name: 'Aggressive', margin: 40 },
      { name: 'Premium', margin: 50 }
    ];

    const pricingOptions = scenarios.map(scenario => {
      // Work backwards from desired margin
      // profit_margin = (selling_price - costs) / selling_price
      // Assuming platform fees of 10% and transaction of 3.5%
      const totalFeePercentage = 13.5;
      const costMultiplier = 100 / (100 - scenario.margin - totalFeePercentage);
      const sellingPrice = printful_cost * costMultiplier;
      const profit = sellingPrice - (printful_cost + (sellingPrice * 0.135));

      return {
        strategy: scenario.name,
        selling_price: sellingPrice.toFixed(2),
        profit: profit.toFixed(2),
        margin: scenario.margin + '%',
        competitiveness: scenario.margin <= 30 ? 'High' : scenario.margin <= 40 ? 'Medium' : 'Low'
      };
    });

    res.json({
      success: true,
      printful_cost: parseFloat(printful_cost).toFixed(2),
      pricing_options: pricingOptions,
      recommendation: pricingOptions[1], // Balanced approach
      tips: [
        'Start with balanced pricing and adjust based on sales',
        'Premium pricing works for unique/high-quality designs',
        'Monitor competitor prices in your niche',
        'Test different price points to find sweet spot'
      ]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// SALES STRATEGY GENERATOR
// ============================================

// GET /api/products/strategy - Get personalized sales strategy
router.get('/strategy', async (req, res) => {
  try {
    const { budget = 0, experience_level = 'beginner', goal = 'first_sale' } = req.query;

    const strategies = {
      beginner_first_sale: {
        title: '🎯 Get Your First Sale Fast',
        steps: [
          {
            step: 1,
            action: 'Pick 1 Niche',
            details: 'Choose something you know or are passionate about (pets, fitness, hobbies)',
            time: '30 min'
          },
          {
            step: 2,
            action: 'Create 3-5 Designs',
            details: 'Simple text-based or use free design tools (Canva, Pixlr)',
            time: '2-3 hours'
          },
          {
            step: 3,
            action: 'List on Etsy',
            details: 'Easiest marketplace for POD, built-in traffic',
            time: '1 hour'
          },
          {
            step: 4,
            action: 'Price at $19.99-$24.99',
            details: 'Sweet spot for t-shirts, competitive but profitable',
            time: '15 min'
          },
          {
            step: 5,
            action: 'Share on Social Media',
            details: 'Post to your personal accounts, relevant groups',
            time: '30 min'
          }
        ],
        expected_timeline: '7-14 days for first sale',
        estimated_profit: '$8-12 per sale',
        success_tips: [
          'Focus on solving a specific problem or representing an identity',
          'Great product photos are crucial',
          'Respond quickly to any questions',
          'Offer excellent customer service for reviews'
        ]
      },
      beginner_scale_up: {
        title: '📈 Scale from $0 to $1000/month',
        steps: [
          {
            step: 1,
            action: 'Identify Your Winner',
            details: 'Find which product/niche gets most attention',
            time: 'Ongoing'
          },
          {
            step: 2,
            action: 'Create 10 Variations',
            details: 'Different designs in same niche',
            time: '1 week'
          },
          {
            step: 3,
            action: 'List on Multiple Platforms',
            details: 'Etsy + Shopify or Amazon',
            time: '2-3 days'
          },
          {
            step: 4,
            action: 'Run Small Ads',
            details: 'Facebook/Instagram ads $5-10/day budget',
            time: 'Daily monitoring'
          },
          {
            step: 5,
            action: 'Build Email List',
            details: 'Offer 10% discount for signups',
            time: 'Setup 2 hours'
          }
        ],
        expected_timeline: '60-90 days to reach $1000/month',
        estimated_profit: '$300-1000/month',
        success_tips: [
          'Double down on what works',
          'Test different designs constantly',
          'Analyze your best sellers and create similar',
          'Build a brand, not just individual products'
        ]
      }
    };

    const strategy = experience_level === 'beginner'
      ? (goal === 'first_sale' ? strategies.beginner_first_sale : strategies.beginner_scale_up)
      : strategies.beginner_scale_up;

    res.json({
      success: true,
      your_situation: {
        budget: `$${budget}`,
        experience: experience_level,
        goal: goal
      },
      strategy,
      quick_wins: [
        '🎨 Use trending keywords in product titles',
        '📸 Mock up products on lifestyle photos',
        '💬 Join POD Facebook groups for tips',
        '🔍 Research competitor pricing',
        '⚡ Start TODAY, do not wait for perfect'
      ]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Helper function
function generateProductRecommendations(trendsData) {
  // Extract trending keywords and suggest products
  const recommendations = [
    'Create designs around trending topics',
    'Focus on seasonal trends',
    'Target specific niches with low competition',
    'Use data to validate product ideas before investing'
  ];

  return recommendations;
}

export default router;
