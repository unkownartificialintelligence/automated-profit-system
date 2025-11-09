import express from 'express';
import {
  getTodaysProducts,
  getWeekProducts,
  getAllChristmasProducts,
  calculateSeasonRevenue,
  generateDailySchedule,
  CHRISTMAS_PRODUCTS_2025
} from '../christmas-products.js';

const router = express.Router();

/**
 * GET /api/christmas/today
 * Get today's recommended Christmas products
 */
router.get('/today', (req, res) => {
  try {
    const todaysProducts = getTodaysProducts();

    res.json({
      success: true,
      message: "Today's Christmas product recommendations",
      data: todaysProducts,
      quick_actions: [
        "1. Review the products below",
        "2. Select 1-3 to launch today",
        "3. Get design specs from /api/christmas/design/:product_id",
        "4. List manually on Printful (2-3 min each)",
        "5. Get marketing content from /api/christmas/marketing/:product_id"
      ]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/christmas/week/:weekNumber
 * Get products for a specific week
 */
router.get('/week/:weekNumber', (req, res) => {
  try {
    const weekNumber = parseInt(req.params.weekNumber);
    const weekProducts = getWeekProducts(weekNumber);

    res.json({
      success: true,
      week: weekNumber,
      data: weekProducts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/christmas/all
 * Get all Christmas products for the season
 */
router.get('/all', (req, res) => {
  try {
    const allProducts = getAllChristmasProducts();

    res.json({
      success: true,
      message: "All Christmas products for 2025 season",
      total_products: allProducts.length,
      products: allProducts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/christmas/revenue
 * Calculate potential revenue for the season
 */
router.get('/revenue', (req, res) => {
  try {
    const revenue = calculateSeasonRevenue();

    res.json({
      success: true,
      message: "Christmas season revenue projection",
      projection: revenue,
      note: "Based on estimated daily sales × profit per sale × 100% owner retention"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/christmas/schedule
 * Get daily schedule for current week
 */
router.get('/schedule', (req, res) => {
  try {
    const today = getTodaysProducts();
    const schedule = generateDailySchedule(today.week);

    res.json({
      success: true,
      message: "Your daily Christmas automation schedule",
      current_week: today.week,
      schedule: schedule
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/christmas/schedule/:weekNumber
 * Get daily schedule for specific week
 */
router.get('/schedule/:weekNumber', (req, res) => {
  try {
    const weekNumber = parseInt(req.params.weekNumber);
    const schedule = generateDailySchedule(weekNumber);

    res.json({
      success: true,
      message: `Daily schedule for Week ${weekNumber}`,
      schedule: schedule
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/christmas/design/:productIndex
 * Get design specifications for a specific product
 */
router.get('/design/:productIndex', (req, res) => {
  try {
    const productIndex = parseInt(req.params.productIndex);
    const allProducts = getAllChristmasProducts();
    const product = allProducts[productIndex];

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found"
      });
    }

    const designSpec = {
      success: true,
      product_name: product.product_name,
      keyword: product.keyword,
      design_instructions: {
        concept: product.design_concept,
        colors: product.colors,
        style: product.keyword.includes('retro') ? 'retro' :
               product.keyword.includes('minimalist') ? 'minimalist' :
               product.keyword.includes('ugly') ? 'playful' : 'modern',

        canva_steps: [
          "1. Open Canva.com and login",
          "2. Search for 'T-shirt design template'",
          "3. Select 4500 x 5400 px template",
          `4. Main concept: ${product.design_concept}`,
          `5. Color palette: ${product.colors.join(', ')}`,
          "6. Add text elements with bold, readable fonts",
          "7. Ensure design is centered and print-ready",
          "8. Export as PNG (4500 x 5400 pixels, 300 DPI)"
        ],

        printful_steps: [
          "1. Login to Printful dashboard",
          "2. Click 'Add Product' → Select 'T-Shirt'",
          "3. Choose Bella+Canvas 3001 (best seller)",
          `4. Upload your PNG design`,
          "5. Center design on shirt mockup",
          `6. Product name: ${product.product_name}`,
          `7. Price: ${product.price_recommendation}`,
          `8. Tags: ${product.keyword}, Christmas, Holiday, Gift`,
          "9. Click 'Save & Publish'"
        ],

        time_estimate: "5-7 minutes total (3 min design + 2-3 min listing)"
      }
    };

    res.json(designSpec);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/christmas/marketing/:productIndex
 * Get marketing campaign for a specific product
 */
router.get('/marketing/:productIndex', (req, res) => {
  try {
    const productIndex = parseInt(req.params.productIndex);
    const allProducts = getAllChristmasProducts();
    const product = allProducts[productIndex];

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found"
      });
    }

    const campaign = {
      success: true,
      product_name: product.product_name,
      target_audience: product.target_audience,

      instagram_post: {
        caption: `🎄 ${product.product_name} is HERE! ✨\n\n` +
                 `Perfect for ${product.target_audience}!\n\n` +
                 `Get yours now → Link in bio 🎁\n\n` +
                 `#Christmas2025 #HolidayGift #${product.keyword.replace(/\s+/g, '')} #ChristmasShopping`,
        hashtags: [
          "#Christmas2025",
          "#HolidayGifts",
          "#ChristmasShopping",
          "#GiftIdeas",
          `#${product.keyword.replace(/\s+/g, '')}`
        ],
        best_posting_times: ["9 AM", "12 PM", "7 PM"]
      },

      tiktok_video: {
        script: `"POV: You found the PERFECT Christmas gift for ${product.target_audience} 🎁✨\n\n` +
                `[Show product]\n\n` +
                `${product.product_name} - Available now!\n\n` +
                `Link in bio 🔗"`,
        trending_sounds: ["Christmas music", "Trending holiday audio"],
        hashtags: "#ChristmasTikTok #GiftIdeas #Holiday2025"
      },

      facebook_post: {
        text: `🎅 NEW ARRIVAL: ${product.product_name}!\n\n` +
              `Looking for the perfect gift for ${product.target_audience}? Look no further!\n\n` +
              `✨ ${product.design_concept}\n` +
              `🎁 Only ${product.price_recommendation}\n` +
              `🚚 Fast shipping - arrives before Christmas\n` +
              `💯 100% satisfaction guaranteed\n\n` +
              `Shop now! → [Your Shop Link]`,
        target_demographics: product.target_audience
      },

      email_template: {
        subject: `🎄 New: ${product.product_name}`,
        preview_text: `Perfect gift for ${product.target_audience}`,
        body: `Hi there! 👋\n\n` +
              `We just launched something special for the holidays:\n\n` +
              `🎁 ${product.product_name}\n\n` +
              `${product.design_concept}\n\n` +
              `Why your customers will love it:\n` +
              `✓ Unique design - not available anywhere else\n` +
              `✓ Premium quality - soft, comfortable fabric\n` +
              `✓ Perfect for ${product.target_audience}\n` +
              `✓ Ships fast - arrives before Christmas!\n\n` +
              `Get it now for just ${product.price_recommendation}\n\n` +
              `[SHOP NOW BUTTON]\n\n` +
              `Happy Holidays! 🎄\n` +
              `Your Shop Name`
      },

      pinterest_pin: {
        title: product.product_name,
        description: `Perfect Christmas gift for ${product.target_audience}! ` +
                     `${product.design_concept}. ` +
                     `${product.price_recommendation} with fast shipping. ` +
                     `#ChristmasGifts #HolidayShopping`,
        boards: ["Christmas Gifts", "Holiday Fashion", "Gift Ideas"]
      }
    };

    res.json(campaign);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/christmas/dashboard
 * Complete Christmas automation dashboard
 */
router.get('/dashboard', (req, res) => {
  try {
    const todaysProducts = getTodaysProducts();
    const revenue = calculateSeasonRevenue();
    const schedule = generateDailySchedule(todaysProducts.week);

    res.json({
      success: true,
      message: "🎄 Christmas Profit System Dashboard",

      overview: {
        season_status: "Active - Christmas 2025",
        current_week: `Week ${todaysProducts.week} of 4`,
        days_until_christmas: Math.ceil((new Date('2025-12-25') - new Date()) / (1000 * 60 * 60 * 24)),
        total_products_available: CHRISTMAS_PRODUCTS_2025.reduce((sum, week) => sum + week.products.length, 0)
      },

      todays_recommendations: {
        week: todaysProducts.week,
        products_to_launch: todaysProducts.products.length,
        products: todaysProducts.products.map((p, i) => ({
          index: i,
          name: p.product_name,
          profit_per_sale: p.profit_per_sale,
          estimated_weekly_profit: calculateProductProfit(p),
          design_url: `/api/christmas/design/${i}`,
          marketing_url: `/api/christmas/marketing/${i}`
        }))
      },

      revenue_projection: revenue,

      this_week_schedule: {
        week_number: schedule.week,
        week_dates: schedule.week_dates,
        products_count: schedule.products_this_week.length,
        estimated_profit: schedule.week_goal.estimated_profit,
        time_commitment: schedule.week_goal.time_commitment
      },

      quick_actions: [
        `1. GET /api/christmas/today - See today's products`,
        `2. GET /api/christmas/design/0 - Get design specs for first product`,
        `3. Create design in Canva (3 minutes)`,
        `4. List on Printful manually (2-3 minutes)`,
        `5. GET /api/christmas/marketing/0 - Get marketing content`,
        `6. Post to social media & send email`,
        `7. Check /api/dashboard for sales tracking`
      ],

      automation_features: {
        product_discovery: "✅ Pre-selected trending Christmas items",
        design_specs: "✅ Automated design instructions",
        marketing_campaigns: "✅ Auto-generated for each product",
        sales_tracking: "✅ Real-time profit tracking (100% retention)",
        manual_step: "⚠️ Printful listing (2-3 min per product)"
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

function calculateProductProfit(product) {
  const [minSales, maxSales] = product.estimated_daily_sales.split('-').map(Number);
  const avgDailySales = (minSales + maxSales) / 2;
  const profitPerSale = parseFloat(product.profit_per_sale.replace('$', ''));
  return `$${(avgDailySales * 7 * profitPerSale).toFixed(2)}`;
}

export default router;
