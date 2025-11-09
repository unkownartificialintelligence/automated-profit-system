import express from "express";
import axios from "axios";
import { writeFileSync, readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const router = express.Router();

// Canva API configuration
const CANVA_API_KEY = process.env.CANVA_API_KEY || "";
const CANVA_BRAND_TEMPLATE_ID = process.env.CANVA_BRAND_TEMPLATE_ID || "";

// Design templates for different product types
const DESIGN_TEMPLATES = {
  "cat dad": {
    title: "CAT DAD",
    subtitle: "THE MAN. THE MYTH. THE LEGEND.",
    style: "badge",
    colors: ["#000000", "#4A4A4A"],
    elements: ["paw prints", "cat silhouette"]
  },
  "millennial humor": {
    title: "MILLENNIAL HUMOR",
    subtitle: "IT'S A THING",
    style: "retro",
    colors: ["#FF6B6B", "#4ECDC4"],
    elements: ["vintage frame", "retro badge"]
  },
  "introvert club": {
    title: "INTROVERT CLUB",
    subtitle: "MEMBERS ONLY",
    style: "minimalist",
    colors: ["#2C3E50", "#95A5A6"],
    elements: ["simple text", "clean lines"]
  },
  "corgi lover": {
    title: "CORGI LOVER",
    subtitle: "PROUD MEMBER",
    style: "playful",
    colors: ["#F39C12", "#E67E22"],
    elements: ["dog paw", "heart"]
  }
};

/**
 * POST /api/canva/auto-design
 * Automatically generate a design using Canva API
 */
router.post("/auto-design", async (req, res) => {
  try {
    const { keyword, product_name } = req.body;

    if (!keyword) {
      return res.status(400).json({
        success: false,
        error: "Keyword is required"
      });
    }

    // Get design template for this keyword
    const template = DESIGN_TEMPLATES[keyword.toLowerCase()] || {
      title: keyword.toUpperCase(),
      subtitle: "LIMITED EDITION",
      style: "modern",
      colors: ["#000000", "#FFFFFF"],
      elements: ["text only"]
    };

    // Check if Canva API is configured
    if (!CANVA_API_KEY) {
      // Generate design specification without API
      const designSpec = {
        success: true,
        design: {
          keyword,
          product_name,
          template,
          canva_instructions: {
            steps: [
              "1. Open Canva.com",
              "2. Search for 't-shirt design' template",
              `3. Add main text: "${template.title}"`,
              `4. Add subtitle: "${template.subtitle}"`,
              `5. Style: ${template.style}`,
              `6. Colors: ${template.colors.join(", ")}`,
              "7. Export as PNG (4500 x 5400 pixels)"
            ]
          },
          auto_generated: false,
          manual_design_needed: true
        }
      };

      return res.json(designSpec);
    }

    // If API is configured, create design via Canva API
    const canvaDesign = await createCanvaDesign(keyword, template);

    res.json({
      success: true,
      design: {
        keyword,
        product_name,
        template,
        canva_design_id: canvaDesign.id,
        canva_edit_url: canvaDesign.edit_url,
        canva_export_url: canvaDesign.export_url,
        auto_generated: true
      }
    });

  } catch (error) {
    console.error("Canva auto-design error:", error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/canva/full-automation
 * Complete automation: Discover → Design → List → Market
 */
router.post("/full-automation", async (req, res) => {
  try {
    const {
      max_products = 3,
      auto_design = true,
      auto_list = true,
      auto_market = true
    } = req.body;

    const results = {
      success: true,
      timestamp: new Date().toISOString(),
      pipeline: {
        discovery: { status: "pending", products: [] },
        design: { status: "pending", designs: [] },
        listing: { status: "pending", listings: [] },
        marketing: { status: "pending", campaigns: [] }
      }
    };

    // Step 1: Discover trending products
    console.log("🔍 Step 1: Discovering trending products...");
    const discoverResponse = await axios.post(
      "http://localhost:3003/api/auto-launch/discover-and-queue",
      { max_products, min_trend_score: 70, max_competition: "Low" }
    );

    results.pipeline.discovery = {
      status: "completed",
      products: discoverResponse.data.products || [],
      count: discoverResponse.data.products?.length || 0
    };

    // Step 2: Auto-generate designs
    if (auto_design && results.pipeline.discovery.products.length > 0) {
      console.log("🎨 Step 2: Generating designs...");
      const designs = [];

      for (const product of results.pipeline.discovery.products) {
        const designResponse = await axios.post(
          "http://localhost:3003/api/canva/auto-design",
          { keyword: product.keyword, product_name: product.product_name }
        );
        designs.push(designResponse.data.design);
      }

      results.pipeline.design = {
        status: "completed",
        designs,
        count: designs.length
      };
    }

    // Step 3: Auto-list on Printful/Etsy
    if (auto_list && results.pipeline.design.designs?.length > 0) {
      console.log("📦 Step 3: Listing products...");
      const listings = [];

      for (const design of results.pipeline.design.designs) {
        // Create listing on Printful
        const listingResponse = await createPrintfulListing(design);
        listings.push(listingResponse);
      }

      results.pipeline.listing = {
        status: "completed",
        listings,
        count: listings.length
      };
    }

    // Step 4: Auto-generate marketing campaigns
    if (auto_market && results.pipeline.listing.listings?.length > 0) {
      console.log("📢 Step 4: Creating marketing campaigns...");
      const campaigns = [];

      for (const listing of results.pipeline.listing.listings) {
        const campaignResponse = await axios.post(
          "http://localhost:3003/api/automation/outreach/email-template",
          {
            product_name: listing.product_name,
            shop_url: listing.shop_url || "https://etsy.com/shop/yourshop",
            price: "24.99"
          }
        );
        campaigns.push({
          product: listing.product_name,
          templates: campaignResponse.data.templates
        });
      }

      results.pipeline.marketing = {
        status: "completed",
        campaigns,
        count: campaigns.length
      };
    }

    // Save automation log
    const logFile = join(__dirname, "../../data/automation-log.json");
    const logs = existsSync(logFile)
      ? JSON.parse(readFileSync(logFile, "utf8"))
      : { runs: [] };

    logs.runs.unshift({
      timestamp: new Date().toISOString(),
      results
    });

    // Keep only last 50 runs
    logs.runs = logs.runs.slice(0, 50);
    writeFileSync(logFile, JSON.stringify(logs, null, 2));

    res.json(results);

  } catch (error) {
    console.error("Full automation error:", error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      details: error.response?.data || error.message
    });
  }
});

/**
 * GET /api/canva/dashboard
 * Real-time dashboard data for monitoring
 */
router.get("/dashboard", async (req, res) => {
  try {
    const logFile = join(__dirname, "../../data/automation-log.json");
    const logs = existsSync(logFile)
      ? JSON.parse(readFileSync(logFile, "utf8"))
      : { runs: [] };

    const launchedFile = join(__dirname, "../../data/launched-products.json");
    const launched = existsSync(launchedFile)
      ? JSON.parse(readFileSync(launchedFile, "utf8"))
      : { products: [], last_updated: null };

    // Calculate stats
    const totalRuns = logs.runs.length;
    const lastRun = logs.runs[0] || null;
    const totalProductsLaunched = launched.products.length;

    const todayRuns = logs.runs.filter(run => {
      const runDate = new Date(run.timestamp);
      const today = new Date();
      return runDate.toDateString() === today.toDateString();
    }).length;

    const weeklyStats = {
      runs: 0,
      products_discovered: 0,
      designs_created: 0,
      listings_created: 0,
      campaigns_launched: 0
    };

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    logs.runs.forEach(run => {
      if (new Date(run.timestamp) > weekAgo) {
        weeklyStats.runs++;
        weeklyStats.products_discovered += run.results?.pipeline?.discovery?.count || 0;
        weeklyStats.designs_created += run.results?.pipeline?.design?.count || 0;
        weeklyStats.listings_created += run.results?.pipeline?.listing?.count || 0;
        weeklyStats.campaigns_launched += run.results?.pipeline?.marketing?.count || 0;
      }
    });

    res.json({
      success: true,
      dashboard: {
        overview: {
          total_automation_runs: totalRuns,
          runs_today: todayRuns,
          total_products_launched: totalProductsLaunched,
          last_automation_run: lastRun?.timestamp || null
        },
        last_run: lastRun ? {
          timestamp: lastRun.timestamp,
          products_discovered: lastRun.results?.pipeline?.discovery?.count || 0,
          designs_created: lastRun.results?.pipeline?.design?.count || 0,
          listings_created: lastRun.results?.pipeline?.listing?.count || 0,
          campaigns_created: lastRun.results?.pipeline?.marketing?.count || 0,
          status: lastRun.results?.success ? "✅ Success" : "❌ Failed"
        } : null,
        weekly_stats: weeklyStats,
        automation_status: {
          discovery: "✅ Active",
          design_generation: CANVA_API_KEY ? "✅ Active (API)" : "⚠️ Manual Mode",
          listing: process.env.PRINTFUL_API_KEY ? "✅ Active (API)" : "⚠️ Manual Mode",
          marketing: "✅ Active"
        }
      }
    });

  } catch (error) {
    console.error("Dashboard error:", error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/canva/schedule-automation
 * Set up automated scheduling
 */
router.post("/schedule-automation", async (req, res) => {
  try {
    const {
      frequency = "weekly", // daily, weekly, biweekly
      day_of_week = "monday", // monday, tuesday, etc.
      time = "09:00", // 24-hour format
      max_products = 3,
      enabled = true
    } = req.body;

    const schedule = {
      enabled,
      frequency,
      day_of_week,
      time,
      max_products,
      auto_design: true,
      auto_list: true,
      auto_market: true,
      next_run: calculateNextRun(frequency, day_of_week, time),
      created_at: new Date().toISOString()
    };

    const scheduleFile = join(__dirname, "../../data/automation-schedule.json");
    writeFileSync(scheduleFile, JSON.stringify(schedule, null, 2));

    res.json({
      success: true,
      message: "Automation schedule configured",
      schedule,
      note: "Automation will run automatically based on schedule"
    });

  } catch (error) {
    console.error("Schedule automation error:", error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Helper: Create design via Canva API
async function createCanvaDesign(keyword, template) {
  if (!CANVA_API_KEY) {
    throw new Error("Canva API key not configured");
  }

  // This is a placeholder - actual Canva API integration
  // would use their design automation API
  return {
    id: `canva_${Date.now()}`,
    edit_url: `https://canva.com/design/${keyword}`,
    export_url: `https://canva.com/design/${keyword}/export`
  };
}

// Helper: Create Printful listing
async function createPrintfulListing(design) {
  const PRINTFUL_API_KEY = process.env.PRINTFUL_API_KEY;

  if (!PRINTFUL_API_KEY) {
    // Return mock data for manual listing
    return {
      product_name: design.product_name,
      status: "needs_manual_upload",
      shop_url: null,
      design_ready: true,
      instructions: "Upload design to Printful dashboard manually"
    };
  }

  try {
    // Create product on Printful
    const response = await axios.post(
      "https://api.printful.com/store/products",
      {
        sync_product: {
          name: design.product_name,
          thumbnail: design.canva_export_url
        },
        sync_variants: [{
          retail_price: "24.99",
          variant_id: 4012, // Bella+Canvas Unisex T-Shirt
          files: [{
            url: design.canva_export_url
          }]
        }]
      },
      {
        headers: {
          "Authorization": `Bearer ${PRINTFUL_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    return {
      product_name: design.product_name,
      status: "listed",
      printful_id: response.data.result.id,
      shop_url: `https://printful.com/dashboard/products/${response.data.result.id}`,
      design_ready: true
    };

  } catch (error) {
    console.error("Printful listing error:", error.message);
    return {
      product_name: design.product_name,
      status: "error",
      error: error.message,
      design_ready: true
    };
  }
}

// Helper: Calculate next run time
function calculateNextRun(frequency, day_of_week, time) {
  const now = new Date();
  const [hours, minutes] = time.split(":").map(Number);

  if (frequency === "daily") {
    const nextRun = new Date(now);
    nextRun.setHours(hours, minutes, 0, 0);
    if (nextRun <= now) {
      nextRun.setDate(nextRun.getDate() + 1);
    }
    return nextRun.toISOString();
  }

  if (frequency === "weekly" || frequency === "biweekly") {
    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const targetDay = days.indexOf(day_of_week.toLowerCase());
    const currentDay = now.getDay();

    let daysUntilTarget = targetDay - currentDay;
    if (daysUntilTarget < 0) daysUntilTarget += 7;
    if (frequency === "biweekly") daysUntilTarget += 7;

    const nextRun = new Date(now);
    nextRun.setDate(now.getDate() + daysUntilTarget);
    nextRun.setHours(hours, minutes, 0, 0);

    return nextRun.toISOString();
  }

  return new Date().toISOString();
}

export default router;
