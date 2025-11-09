import express from 'express';
import googleTrends from 'google-trends-api';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import sqlite3 from 'sqlite3';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// File paths
const LAUNCHED_PRODUCTS_FILE = join(__dirname, '../../data/launched-products.json');
const GLOBAL_TRENDING_FILE = join(__dirname, '../../data/global-trending.json');
const dbPath = join(__dirname, '../../database.db');

// Ensure data directory exists
const dataDir = join(__dirname, '../../data');
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

// Database helpers
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

function saveGlobalTrending(data) {
  writeFileSync(GLOBAL_TRENDING_FILE, JSON.stringify(data, null, 2));
}

// Global regions to check for trending items
const GLOBAL_REGIONS = [
  { code: 'US', name: 'United States', timezone: 'America/New_York' },
  { code: 'GB', name: 'United Kingdom', timezone: 'Europe/London' },
  { code: 'CA', name: 'Canada', timezone: 'America/Toronto' },
  { code: 'AU', name: 'Australia', timezone: 'Australia/Sydney' },
  { code: 'DE', name: 'Germany', timezone: 'Europe/Berlin' },
  { code: 'FR', name: 'France', timezone: 'Europe/Paris' },
  { code: 'JP', name: 'Japan', timezone: 'Asia/Tokyo' },
  { code: 'BR', name: 'Brazil', timezone: 'America/Sao_Paulo' },
  { code: 'IN', name: 'India', timezone: 'Asia/Kolkata' },
  { code: 'MX', name: 'Mexico', timezone: 'America/Mexico_City' }
];

// Print-on-demand relevant categories
const POD_CATEGORIES = [
  't-shirts',
  'hoodies',
  'mugs',
  'phone cases',
  'posters',
  'tote bags',
  'stickers',
  'custom apparel',
  'merchandise'
];

// ============================================
// GET /api/global-trending - Fetch global trending items
// ============================================
router.get('/', async (req, res) => {
  try {
    const {
      regions = 'US,GB,CA,AU,DE',
      category = 'all',
      limit = 10,
      include_details = true
    } = req.query;

    const selectedRegions = regions.split(',').map(r => r.trim());
    const globalTrendingData = {
      fetched_at: new Date().toISOString(),
      regions: [],
      combined_trending: []
    };

    console.log(`Fetching global trending items from: ${selectedRegions.join(', ')}`);

    // Fetch trending items from each region
    for (const regionCode of selectedRegions) {
      const region = GLOBAL_REGIONS.find(r => r.code === regionCode);
      if (!region) continue;

      try {
        console.log(`Fetching trends for ${region.name}...`);

        // Get daily trending searches for the region
        const dailyTrends = await googleTrends.dailyTrends({
          geo: regionCode,
          trendDate: new Date()
        });

        const trendsData = JSON.parse(dailyTrends);
        const trendingSearches = trendsData.default?.trendingSearchesDays?.[0]?.trendingSearches || [];

        // Extract top trending items
        const topTrends = trendingSearches.slice(0, parseInt(limit)).map(trend => ({
          keyword: trend.title?.query || '',
          traffic: trend.formattedTraffic || 'N/A',
          articles: trend.articles?.length || 0,
          region: region.name,
          region_code: regionCode,
          image: trend.image?.imageUrl || null
        }));

        globalTrendingData.regions.push({
          region: region.name,
          region_code: regionCode,
          trending_items: topTrends
        });

        // Add to combined list
        globalTrendingData.combined_trending.push(...topTrends);

      } catch (error) {
        console.error(`Error fetching trends for ${region.name}:`, error.message);
        globalTrendingData.regions.push({
          region: region.name,
          region_code: regionCode,
          error: error.message,
          trending_items: []
        });
      }
    }

    // Also get POD-specific trending searches
    const podTrends = await getPODTrendingItems();
    globalTrendingData.pod_specific = podTrends;

    // Add curated high-potential items
    globalTrendingData.curated_pod_opportunities = getCuratedTrendingItems();

    // Save to file
    saveGlobalTrending(globalTrendingData);

    res.json({
      success: true,
      message: `Found ${globalTrendingData.combined_trending.length} trending items across ${selectedRegions.length} regions`,
      data: globalTrendingData,
      summary: {
        total_items: globalTrendingData.combined_trending.length,
        regions_checked: selectedRegions.length,
        pod_specific_items: podTrends.length,
        curated_opportunities: globalTrendingData.curated_pod_opportunities.length
      },
      next_steps: [
        '1. Review trending items and select ones suitable for print-on-demand',
        '2. Use POST /api/global-trending/add-to-personal to add items to your account',
        '3. Create designs for selected items',
        '4. Launch products on Printful/Etsy'
      ]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      tip: 'Try reducing the number of regions or check your internet connection'
    });
  }
});

// ============================================
// POST /api/global-trending/add-to-personal - Add trending items to personal account
// ============================================
router.post('/add-to-personal', async (req, res) => {
  try {
    const {
      items = [], // Array of items to add
      auto_create_products = false
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No items provided. Send an array of items in the "items" field.'
      });
    }

    // Ensure personal account exists
    let personalAccount = await dbGet('SELECT * FROM team_members WHERE id = 0');
    if (!personalAccount) {
      await dbRun(
        `INSERT INTO team_members (id, email, name, tier_id, status, total_profit, milestone_reached)
         VALUES (0, 'owner@automated-profit-system.com', 'Your Personal Account', 1, 'owner', 0, 1)`,
        []
      );
    }

    // Load existing launched products
    const launched = loadLaunchedProducts();
    const existingKeywords = launched.products.map(p => p.keyword.toLowerCase());

    const addedItems = [];
    const skippedItems = [];

    for (const item of items) {
      const keyword = item.keyword || item.name || item.title;

      if (!keyword) {
        skippedItems.push({ item, reason: 'No keyword provided' });
        continue;
      }

      // Check if already added
      if (existingKeywords.includes(keyword.toLowerCase())) {
        skippedItems.push({ keyword, reason: 'Already in your account' });
        continue;
      }

      // Generate product name
      const productName = item.product_name ||
        `${keyword.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} T-Shirt`;

      // Add to launched products
      const newProduct = {
        keyword,
        product_name: productName,
        region: item.region || 'Global',
        region_code: item.region_code || 'MULTI',
        traffic: item.traffic || 'N/A',
        trend_score: item.trend_score || 85,
        competition: item.competition || 'Medium',
        profit_potential: item.profit_potential || 'High',
        suggested_price: item.suggested_price || 24.99,
        estimated_cost: item.estimated_cost || 12.95,
        estimated_profit: item.estimated_profit || 9.55,
        added_to_personal: true,
        added_at: new Date().toISOString(),
        status: 'queued',
        notes: item.notes || `Global trending item from ${item.region || 'multiple regions'}`
      };

      launched.products.push(newProduct);
      addedItems.push(newProduct);
    }

    // Save updated launched products
    launched.last_updated = new Date().toISOString();
    saveLaunchedProducts(launched);

    res.json({
      success: true,
      message: `✅ Added ${addedItems.length} trending items to your personal account!`,
      added_items: addedItems,
      skipped_items: skippedItems,
      summary: {
        total_added: addedItems.length,
        total_skipped: skippedItems.length,
        total_in_account: launched.products.length
      },
      next_steps: [
        '1. Create designs for each product (use Canva or similar)',
        '2. Upload to Printful using /api/automation/printful/create-product',
        '3. List on Etsy or your own store',
        '4. Track sales with /api/personal/sales'
      ],
      tips: [
        '🎯 Focus on items with high traffic in your target region',
        '🎨 Create unique designs that stand out',
        '💰 Aim for products with 30%+ profit margins',
        '📊 Test 3-5 products per week to find winners'
      ]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ============================================
// GET /api/global-trending/my-items - Get items in personal account
// ============================================
router.get('/my-items', async (req, res) => {
  try {
    const launched = loadLaunchedProducts();

    // Get stats
    const totalItems = launched.products.length;
    const personalItems = launched.products.filter(p => p.added_to_personal);
    const byRegion = {};
    const byStatus = {};

    launched.products.forEach(p => {
      const region = p.region || 'Unknown';
      byRegion[region] = (byRegion[region] || 0) + 1;

      const status = p.status || 'unknown';
      byStatus[status] = (byStatus[status] || 0) + 1;
    });

    res.json({
      success: true,
      summary: {
        total_items: totalItems,
        personal_items: personalItems.length,
        by_region: byRegion,
        by_status: byStatus,
        last_updated: launched.last_updated
      },
      items: launched.products,
      recent_items: launched.products.slice(-10).reverse(),
      recommendations: [
        totalItems === 0 ? '🚀 Start by adding your first trending item!' : '✅ You have items queued!',
        totalItems < 10 ? '💡 Add 10-15 products for consistent sales' : '🎯 Great selection! Focus on promotion',
        '📊 Track which regions perform best for you',
        '🔄 Update your list weekly with new trending items'
      ]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ============================================
// POST /api/global-trending/quick-add - Quick add with keyword
// ============================================
router.post('/quick-add', async (req, res) => {
  try {
    const { keyword, region = 'Global' } = req.body;

    if (!keyword) {
      return res.status(400).json({
        success: false,
        message: 'keyword is required'
      });
    }

    // Use the add-to-personal endpoint
    const items = [{
      keyword,
      region,
      traffic: 'Manual Add',
      trend_score: 75,
      competition: 'Medium',
      profit_potential: 'High',
      notes: 'Manually added trending item'
    }];

    // Reuse the add-to-personal logic
    const launched = loadLaunchedProducts();
    const existingKeywords = launched.products.map(p => p.keyword.toLowerCase());

    if (existingKeywords.includes(keyword.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: `"${keyword}" is already in your account`
      });
    }

    const productName = `${keyword.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} T-Shirt`;

    const newProduct = {
      keyword,
      product_name: productName,
      region,
      traffic: 'Manual Add',
      trend_score: 75,
      competition: 'Medium',
      profit_potential: 'High',
      suggested_price: 24.99,
      estimated_cost: 12.95,
      estimated_profit: 9.55,
      added_to_personal: true,
      added_at: new Date().toISOString(),
      status: 'queued',
      notes: 'Manually added trending item'
    };

    launched.products.push(newProduct);
    launched.last_updated = new Date().toISOString();
    saveLaunchedProducts(launched);

    res.json({
      success: true,
      message: `✅ "${keyword}" added to your personal account!`,
      product: newProduct,
      total_items: launched.products.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ============================================
// Helper Functions
// ============================================

async function getPODTrendingItems() {
  // Get POD-specific trending searches
  const podItems = [];

  try {
    for (const category of POD_CATEGORIES.slice(0, 3)) { // Limit to 3 to avoid rate limits
      const trends = await googleTrends.relatedQueries({
        keyword: category,
        startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        geo: 'US'
      });

      const trendsData = JSON.parse(trends);
      const rising = trendsData.default?.rankedList?.[0]?.rankedKeyword?.slice(0, 5) || [];

      rising.forEach(item => {
        podItems.push({
          keyword: item.query,
          category,
          value: item.value,
          link: item.link
        });
      });
    }
  } catch (error) {
    console.error('Error fetching POD trends:', error.message);
  }

  return podItems;
}

function getCuratedTrendingItems() {
  // Curated list of high-potential trending items (updated regularly)
  const today = new Date();
  const month = today.getMonth() + 1;

  // Seasonal trending items
  let seasonal = [];

  // November-December: Holiday season
  if (month >= 11 || month <= 1) {
    seasonal = [
      { keyword: 'holiday gift ideas', trend_score: 95, competition: 'High', profit_potential: 'Very High', season: 'Holiday' },
      { keyword: 'christmas sweater', trend_score: 92, competition: 'Very High', profit_potential: 'High', season: 'Holiday' },
      { keyword: 'new year resolution', trend_score: 88, competition: 'Medium', profit_potential: 'High', season: 'Holiday' }
    ];
  }
  // February: Valentine's
  else if (month === 2) {
    seasonal = [
      { keyword: 'valentine gift', trend_score: 94, competition: 'High', profit_potential: 'Very High', season: 'Valentine' },
      { keyword: 'love quotes', trend_score: 87, competition: 'High', profit_potential: 'High', season: 'Valentine' }
    ];
  }
  // March-May: Spring
  else if (month >= 3 && month <= 5) {
    seasonal = [
      { keyword: 'spring fashion', trend_score: 82, competition: 'Medium', profit_potential: 'High', season: 'Spring' },
      { keyword: 'easter gifts', trend_score: 79, competition: 'Medium', profit_potential: 'High', season: 'Spring' }
    ];
  }
  // June-August: Summer
  else if (month >= 6 && month <= 8) {
    seasonal = [
      { keyword: 'summer vibes', trend_score: 86, competition: 'High', profit_potential: 'High', season: 'Summer' },
      { keyword: 'beach life', trend_score: 81, competition: 'Medium', profit_potential: 'High', season: 'Summer' }
    ];
  }
  // September-October: Fall/Back to School
  else {
    seasonal = [
      { keyword: 'fall aesthetic', trend_score: 84, competition: 'Medium', profit_potential: 'High', season: 'Fall' },
      { keyword: 'teacher gifts', trend_score: 78, competition: 'Low', profit_potential: 'Very High', season: 'Fall' }
    ];
  }

  // Evergreen trending items
  const evergreen = [
    { keyword: 'dog mom', trend_score: 85, competition: 'Medium', profit_potential: 'High', category: 'Pets' },
    { keyword: 'cat dad', trend_score: 78, competition: 'Low', profit_potential: 'Very High', category: 'Pets' },
    { keyword: 'plant mom', trend_score: 82, competition: 'Medium', profit_potential: 'High', category: 'Lifestyle' },
    { keyword: 'coffee addict', trend_score: 79, competition: 'High', profit_potential: 'Medium', category: 'Lifestyle' },
    { keyword: 'sarcastic quotes', trend_score: 88, competition: 'High', profit_potential: 'Medium', category: 'Funny' },
    { keyword: 'introvert club', trend_score: 71, competition: 'Low', profit_potential: 'Very High', category: 'Lifestyle' },
    { keyword: 'gym motivation', trend_score: 76, competition: 'High', profit_potential: 'Medium', category: 'Fitness' },
    { keyword: 'book lover', trend_score: 75, competition: 'Medium', profit_potential: 'High', category: 'Hobbies' }
  ];

  return [...seasonal, ...evergreen].map(item => ({
    ...item,
    region: 'Global',
    suggested_price: 24.99,
    estimated_cost: 12.95,
    estimated_profit: 9.55,
    curated: true
  }));
}

export default router;
