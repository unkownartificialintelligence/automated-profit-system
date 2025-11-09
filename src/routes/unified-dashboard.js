import express from "express";
import { UserManager } from "../middleware/user-manager.js";

const router = express.Router();

/**
 * GET /api/dashboard
 * Unified dashboard that automatically adapts to user type
 * - Owner: Shows personal sales (100% profit)
 * - Client: Shows client's store sales (100% profit, isolated)
 * - Team: Shows member sales with 25% team share deducted
 */
router.get("/", async (req, res) => {
  try {
    const userManager = new UserManager();
    const userType = userManager.getUserType(req);
    const dashboardData = userManager.getDashboardData(userType);

    // Add user-specific messaging
    let message = "";
    switch (userType.type) {
      case "owner":
        message = "👑 Owner Dashboard - You keep 100% profit from personal sales";
        break;
      case "client":
        message = `👥 Client Dashboard - Dedicated store, 100% profit retention`;
        break;
      case "team":
        message = `🤝 Team Member Dashboard - ${100 - userManager.profitSharePercentage}% profit (${userManager.profitSharePercentage}% auto-shared with team)`;
        break;
    }

    res.json({
      success: true,
      message,
      ...dashboardData
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
 * POST /api/dashboard/record-sale
 * Record sale with automatic profit calculation based on user type
 */
router.post("/record-sale", async (req, res) => {
  try {
    const { product_name, sale_price, platform, cost } = req.body;

    if (!product_name || !sale_price) {
      return res.status(400).json({
        success: false,
        error: "product_name and sale_price are required"
      });
    }

    const userManager = new UserManager();
    const userType = userManager.getUserType(req);

    const result = userManager.recordSale({
      product_name,
      sale_price: parseFloat(sale_price),
      platform: platform || "unknown",
      cost: cost ? parseFloat(cost) : 12.95
    }, userType);

    res.json(result);

  } catch (error) {
    console.error("Record sale error:", error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/dashboard/automation-status
 * Get automation status for this user
 */
router.get("/automation-status", async (req, res) => {
  try {
    const userManager = new UserManager();
    const userType = userManager.getUserType(req);

    res.json({
      success: true,
      user_type: userType.type,
      automation_enabled: true,
      features: {
        product_discovery: true,
        design_generation: !!process.env.CANVA_API_KEY,
        auto_listing: !!process.env.PRINTFUL_API_KEY,
        marketing_campaigns: true,
        profit_tracking: true,
        team_sharing: userType.type === "team"
      },
      profit_configuration: {
        user_keeps: 100 - userManager.profitSharePercentage,
        team_share: userManager.profitSharePercentage,
        model: userType.type === "team" ? "Profit Sharing" : "Full Retention"
      }
    });

  } catch (error) {
    console.error("Automation status error:", error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/dashboard/run-automation
 * Run full automation for this user
 */
router.post("/run-automation", async (req, res) => {
  try {
    const { max_products = 3 } = req.body;
    const userManager = new UserManager();
    const userType = userManager.getUserType(req);

    // This would trigger the full automation pipeline
    // For now, return success with what would happen
    res.json({
      success: true,
      message: `Automation started for ${userType.type} account`,
      user_type: userType.type,
      automation_plan: {
        products_to_discover: max_products,
        design_generation: "automated",
        listing: "automated",
        marketing: "automated",
        profit_tracking: "automatic"
      },
      profit_model: {
        you_keep: 100 - userManager.profitSharePercentage + "%",
        team_pool: userManager.profitSharePercentage + "%"
      }
    });

  } catch (error) {
    console.error("Run automation error:", error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/dashboard/team-pool
 * View team profit pool (team members only)
 */
router.get("/team-pool", async (req, res) => {
  try {
    const userManager = new UserManager();
    const userType = userManager.getUserType(req);

    if (userType.type !== "team") {
      return res.status(403).json({
        success: false,
        error: "Team pool only accessible to team members"
      });
    }

    const { readFileSync, existsSync } = await import("fs");
    const { join, dirname } = await import("path");
    const { fileURLToPath } = await import("url");

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const teamPoolFile = join(__dirname, "../../data/team/pool.json");

    if (!existsSync(teamPoolFile)) {
      return res.json({
        success: true,
        team_pool: {
          total: 0,
          your_share: 0,
          contributions: []
        }
      });
    }

    const poolData = JSON.parse(readFileSync(teamPoolFile, "utf8"));

    res.json({
      success: true,
      team_pool: {
        total: poolData.total,
        your_contributions: poolData.contributions
          .filter(c => c.user_id === userType.id)
          .reduce((sum, c) => sum + c.amount, 0),
        recent_contributions: poolData.contributions.slice(-10).reverse()
      }
    });

  } catch (error) {
    console.error("Team pool error:", error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
