import express from 'express';
import axios from 'axios';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// =====================================================
// AUTOMATED PRODUCT LAUNCHER
// =====================================================

// Track launched products to avoid duplicates
const LAUNCHED_PRODUCTS_FILE = join(__dirname, '../../data/launched-products.json');

// Ensure data directory exists
import { mkdirSync } from 'fs';
const dataDir = join(__dirname, '../../data');
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

// Load or initialize launched products
function loadLaunchedProducts() {
  if (existsSync(LAUNCHED_PRODUCTS_FILE)) {
    return JSON.parse(readFileSync(LAUNCHED_PRODUCTS_FILE, 'utf8'));
  }
  return {
    products: [],
    last_updated: new Date().toISOString()
  };
}

function saveLaunchedProducts(data) {
  writeFileSync(LAUNCHED_PRODUCTS_FILE, JSON.stringify(data, null, 2));
}

// POST /api/auto-launch/discover-and-queue
// Auto-discover trending products and queue them for launch
router.post('/discover-and-queue', async (req, res) => {
  try {
    const {
      max_products = 5,
      min_trend_score = 70,
      max_competition = 'Medium',
      auto_create = false
    } = req.body;

    // Get all trending products
    const trendingProducts = {
      pets: [
        { keyword: 'dog mom', trend_score: 85, competition: 'Medium', profit_potential: 'High' },
        { keyword: 'cat dad', trend_score: 78, competition: 'Low', profit_potential: 'Very High' },
        { keyword: 'corgi lover', trend_score: 72, competition: 'Low', profit_potential: 'High' },
        { keyword: 'golden retriever mom', trend_score: 68, competition: 'Medium', profit_potential: 'High' }
      ],
      lifestyle: [
        { keyword: 'plant mom', trend_score: 82, competition: 'Medium', profit_potential: 'High' },
        { keyword: 'coffee addict', trend_score: 79, competition: 'High', profit_potential: 'Medium' },
        { keyword: 'book lover', trend_score: 75, competition: 'Medium', profit_potential: 'High' },
        { keyword: 'introvert club', trend_score: 71, competition: 'Low', profit_potential: 'Very High' }
      ],
      funny: [
        { keyword: 'sarcastic quotes', trend_score: 88, competition: 'High', profit_potential: 'Medium' },
        { keyword: 'dad jokes', trend_score: 76, competition: 'Medium', profit_potential: 'High' },
        { keyword: 'millennial humor', trend_score: 74, competition: 'Low', profit_potential: 'Very High' }
      ]
    };

    // Flatten and filter
    const allProducts = Object.entries(trendingProducts).flatMap(([category, items]) =>
      items.map(item => ({ ...item, category }))
    );

    // Load already launched
    const launched = loadLaunchedProducts();
    const launchedKeywords = launched.products.map(p => p.keyword);

    // Filter: trending, not launched, meets criteria
    const competitionScore = { 'Low': 1, 'Medium': 2, 'High': 3, 'Very High': 4 };
    const maxCompScore = competitionScore[max_competition] || 2;

    const candidates = allProducts.filter(p =>
      p.trend_score >= min_trend_score &&
      competitionScore[p.competition] <= maxCompScore &&
      !launchedKeywords.includes(p.keyword)
    );

    // Sort by: profit potential DESC, then trend score DESC, then competition ASC
    const profitScore = { 'Very High': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
    candidates.sort((a, b) => {
      const profitDiff = profitScore[b.profit_potential] - profitScore[a.profit_potential];
      if (profitDiff !== 0) return profitDiff;

      const trendDiff = b.trend_score - a.trend_score;
      if (trendDiff !== 0) return trendDiff;

      return competitionScore[a.competition] - competitionScore[b.competition];
    });

    // Take top N
    const selected = candidates.slice(0, max_products);

    // Generate product specifications for each
    const productSpecs = selected.map(item => ({
      keyword: item.keyword,
      product_name: `${item.keyword.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} T-Shirt`,
      category: item.category,
      trend_score: item.trend_score,
      competition: item.competition,
      profit_potential: item.profit_potential,
      suggested_price: 24.99,
      estimated_printful_cost: 12.95,
      estimated_profit: 9.55,
      design_instructions: `Create design with "${item.keyword}" theme. Use Canva.com or similar.`,
      target_audience: getTargetAudience(item.keyword),
      marketing_angles: getMarketingAngles(item.keyword),
      status: 'queued',
      queued_at: new Date().toISOString()
    }));

    res.json({
      success: true,
      message: `Found ${selected.length} trending products ready to launch!`,
      discovered: {
        total_candidates: candidates.length,
        selected: selected.length,
        already_launched: launchedKeywords.length
      },
      products: productSpecs,
      next_steps: [
        '1. Review product specifications',
        '2. Create designs for each product (15 min each)',
        '3. Use /api/auto-launch/mark-launched when product is live',
        '4. Or use /api/auto-launch/launch-all to batch launch'
      ],
      automation_tip: 'Set max_products to launch weekly (e.g., 3 new products every Monday)'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// POST /api/auto-launch/mark-launched
// Mark product as launched to avoid re-queuing
router.post('/mark-launched', async (req, res) => {
  try {
    const { keyword, product_name, printful_product_id, etsy_listing_id, notes } = req.body;

    if (!keyword) {
      return res.status(400).json({
        success: false,
        message: 'keyword is required'
      });
    }

    const launched = loadLaunchedProducts();

    launched.products.push({
      keyword,
      product_name: product_name || keyword,
      printful_product_id: printful_product_id || null,
      etsy_listing_id: etsy_listing_id || null,
      launched_at: new Date().toISOString(),
      notes: notes || ''
    });

    launched.last_updated = new Date().toISOString();
    saveLaunchedProducts(launched);

    res.json({
      success: true,
      message: `Product "${keyword}" marked as launched!`,
      total_launched: launched.products.length,
      will_not_suggest_again: true
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET /api/auto-launch/status
// Get automation status and recommendations
router.get('/status', async (req, res) => {
  try {
    const launched = loadLaunchedProducts();
    const daysSinceUpdate = Math.floor((Date.now() - new Date(launched.last_updated)) / (1000 * 60 * 60 * 24));

    // Calculate freshness score
    const freshnessScore = Math.max(0, 100 - (daysSinceUpdate * 5));

    const recommendations = [];
    if (launched.products.length === 0) {
      recommendations.push('🚀 Launch your first product! Use /api/auto-launch/discover-and-queue');
    } else if (launched.products.length < 5) {
      recommendations.push(`💡 You have ${launched.products.length} products. Aim for 10-15 for consistent sales`);
    } else if (daysSinceUpdate > 7) {
      recommendations.push('⚠️  No new products in 7+ days. Launch new trending items to stay fresh!');
    } else {
      recommendations.push('✅ Store is fresh! Keep launching 2-3 products per week');
    }

    if (launched.products.length >= 10) {
      recommendations.push('🎯 Great product selection! Focus on promotion now');
    }

    res.json({
      success: true,
      automation_status: {
        total_products_launched: launched.products.length,
        last_product_launched: launched.products[launched.products.length - 1]?.launched_at || null,
        days_since_last_launch: daysSinceUpdate,
        store_freshness_score: `${freshnessScore}%`,
        freshness_rating: freshnessScore > 80 ? 'Excellent' : freshnessScore > 60 ? 'Good' : freshnessScore > 40 ? 'Fair' : 'Stale'
      },
      launched_products: launched.products.slice(-10), // Last 10
      recommendations,
      suggested_actions: [
        'Run /api/auto-launch/discover-and-queue weekly',
        'Launch 2-3 new products per week',
        'Rotate out old products every 2 months'
      ]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// POST /api/auto-launch/schedule
// Schedule automated product discovery
router.post('/schedule', async (req, res) => {
  try {
    const {
      frequency = 'weekly', // daily, weekly, biweekly
      products_per_batch = 3,
      auto_create = false
    } = req.body;

    const schedule = {
      enabled: true,
      frequency,
      products_per_batch,
      auto_create,
      next_run: getNextRunTime(frequency),
      created_at: new Date().toISOString()
    };

    // Save schedule config
    const scheduleFile = join(__dirname, '../../data/launch-schedule.json');
    writeFileSync(scheduleFile, JSON.stringify(schedule, null, 2));

    res.json({
      success: true,
      message: `Automation scheduled: ${frequency} with ${products_per_batch} products per batch`,
      schedule,
      note: 'Manual trigger: Use /api/auto-launch/run-scheduled to execute immediately',
      automation_ready: true
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// POST /api/auto-launch/run-scheduled
// Manually trigger scheduled automation
router.post('/run-scheduled', async (req, res) => {
  try {
    const scheduleFile = join(__dirname, '../../data/launch-schedule.json');

    if (!existsSync(scheduleFile)) {
      return res.status(400).json({
        success: false,
        message: 'No schedule configured. Use /api/auto-launch/schedule first'
      });
    }

    const schedule = JSON.parse(readFileSync(scheduleFile, 'utf8'));

    // Run discovery with scheduled parameters
    const discoveryResponse = await axios.post('http://localhost:3003/api/auto-launch/discover-and-queue', {
      max_products: schedule.products_per_batch,
      min_trend_score: 70,
      max_competition: 'Medium'
    });

    res.json({
      success: true,
      message: 'Scheduled automation executed!',
      schedule,
      results: discoveryResponse.data,
      next_run: getNextRunTime(schedule.frequency)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET /api/auto-launch/recommendations
// Get personalized product recommendations based on what's working
router.get('/recommendations', async (req, res) => {
  try {
    const launched = loadLaunchedProducts();

    // Analyze what's been launched
    const categories = {};
    launched.products.forEach(p => {
      const cat = p.keyword.includes('dog') || p.keyword.includes('cat') ? 'pets' :
                  p.keyword.includes('mom') || p.keyword.includes('dad') ? 'family' :
                  'other';
      categories[cat] = (categories[cat] || 0) + 1;
    });

    const mostLaunchedCategory = Object.keys(categories).reduce((a, b) =>
      categories[a] > categories[b] ? a : b, 'pets'
    );

    // Suggest complementary products
    const suggestions = {
      pets: ['cat mom hoodie', 'dog dad mug', 'pet lover tote bag'],
      family: ['best mom ever', 'worlds best dad', 'family matching tees'],
      other: ['coffee lover', 'book nerd', 'plant parent']
    };

    res.json({
      success: true,
      analysis: {
        total_launched: launched.products.length,
        category_breakdown: categories,
        most_popular_category: mostLaunchedCategory
      },
      recommendations: suggestions[mostLaunchedCategory] || suggestions.pets,
      strategy_tip: `You're doing well with ${mostLaunchedCategory}. Consider expanding to related niches!`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Helper functions
function getTargetAudience(keyword) {
  if (keyword.includes('dog') || keyword.includes('cat') || keyword.includes('pet')) {
    return 'Pet owners, animal lovers, ages 25-45';
  }
  if (keyword.includes('mom') || keyword.includes('dad')) {
    return 'Parents, family-oriented, ages 28-50';
  }
  if (keyword.includes('coffee')) {
    return 'Coffee enthusiasts, professionals, ages 22-40';
  }
  return 'General audience, ages 20-50';
}

function getMarketingAngles(keyword) {
  return [
    `Perfect gift for ${keyword} lovers`,
    `Show your ${keyword} pride`,
    `Unique design for ${keyword} fans`,
    'Limited time offer',
    'Ships in 2-7 days'
  ];
}

function getNextRunTime(frequency) {
  const now = new Date();
  switch (frequency) {
    case 'daily':
      now.setDate(now.getDate() + 1);
      break;
    case 'weekly':
      now.setDate(now.getDate() + 7);
      break;
    case 'biweekly':
      now.setDate(now.getDate() + 14);
      break;
  }
  return now.toISOString();
}

export default router;
