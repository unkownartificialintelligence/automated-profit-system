import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// User type detection and configuration
export class UserManager {
  constructor() {
    this.userMode = process.env.USER_MODE || "owner"; // owner, client, team
    this.accountType = process.env.ACCOUNT_TYPE || "personal";
    this.profitSharePercentage = parseInt(process.env.PROFIT_SHARE_PERCENTAGE || "0");
  }

  // Detect user type from request or config
  getUserType(req) {
    // Check if user is authenticated (for multi-tenant)
    const userId = req.headers["x-user-id"] || "default";
    const userType = req.headers["x-user-type"] || this.userMode;

    return {
      id: userId,
      type: userType,
      mode: this.userMode,
      accountType: this.accountType,
      profitShare: this.profitSharePercentage
    };
  }

  // Calculate profit based on user type
  calculateProfit(salePrice, cost, userType) {
    const grossProfit = salePrice - cost;

    switch (userType.type) {
      case "owner":
        // Owner keeps 100% profit
        return {
          grossProfit,
          teamShare: 0,
          userProfit: grossProfit,
          profitPercentage: 100
        };

      case "client":
        // Clients keep 100% profit (separate from owner)
        return {
          grossProfit,
          teamShare: 0,
          userProfit: grossProfit,
          profitPercentage: 100
        };

      case "team":
        // Team members: 25% auto-deducted for team pool
        const teamShare = grossProfit * (this.profitSharePercentage / 100);
        const userProfit = grossProfit - teamShare;
        return {
          grossProfit,
          teamShare,
          userProfit,
          profitPercentage: 100 - this.profitSharePercentage
        };

      default:
        return {
          grossProfit,
          teamShare: 0,
          userProfit: grossProfit,
          profitPercentage: 100
        };
    }
  }

  // Get user-specific data directory
  getDataDirectory(userType) {
    const baseDir = join(__dirname, "../../data");

    switch (userType.type) {
      case "owner":
        return join(baseDir, "personal");
      case "client":
        return join(baseDir, "client", userType.id);
      case "team":
        return join(baseDir, "team", userType.id);
      default:
        return join(baseDir, "personal");
    }
  }

  // Record sale with automatic profit splitting
  recordSale(sale, userType) {
    const dataDir = this.getDataDirectory(userType);
    const salesFile = join(dataDir, "sales.json");

    // Create directory if doesn't exist
    const fs = require("fs");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Load existing sales
    let salesData = { sales: [], total_profit: 0, team_contributions: 0 };
    if (existsSync(salesFile)) {
      salesData = JSON.parse(readFileSync(salesFile, "utf8"));
    }

    // Calculate profit based on user type
    const profitCalc = this.calculateProfit(
      sale.sale_price,
      sale.cost || 12.95,
      userType
    );

    // Add sale record
    const saleRecord = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      product_name: sale.product_name,
      sale_price: sale.sale_price,
      cost: sale.cost || 12.95,
      gross_profit: profitCalc.grossProfit,
      team_share: profitCalc.teamShare,
      user_profit: profitCalc.userProfit,
      profit_percentage: profitCalc.profitPercentage,
      platform: sale.platform || "unknown",
      user_type: userType.type
    };

    salesData.sales.push(saleRecord);
    salesData.total_profit += profitCalc.userProfit;
    salesData.team_contributions += profitCalc.teamShare;

    // Save updated sales
    writeFileSync(salesFile, JSON.stringify(salesData, null, 2));

    // If team member, also update team pool
    if (userType.type === "team" && profitCalc.teamShare > 0) {
      this.updateTeamPool(profitCalc.teamShare, userType);
    }

    return {
      success: true,
      sale: saleRecord,
      totals: {
        total_profit: salesData.total_profit,
        team_contributions: salesData.team_contributions
      }
    };
  }

  // Update team profit pool
  updateTeamPool(amount, userType) {
    const teamPoolFile = join(__dirname, "../../data/team/pool.json");

    let poolData = { total: 0, contributions: [] };
    if (existsSync(teamPoolFile)) {
      poolData = JSON.parse(readFileSync(teamPoolFile, "utf8"));
    }

    poolData.total += amount;
    poolData.contributions.push({
      timestamp: new Date().toISOString(),
      user_id: userType.id,
      amount
    });

    const fs = require("fs");
    const teamDir = join(__dirname, "../../data/team");
    if (!fs.existsSync(teamDir)) {
      fs.mkdirSync(teamDir, { recursive: true });
    }

    writeFileSync(teamPoolFile, JSON.stringify(poolData, null, 2));
  }

  // Get dashboard data for user type
  getDashboardData(userType) {
    const dataDir = this.getDataDirectory(userType);
    const salesFile = join(dataDir, "sales.json");

    if (!existsSync(salesFile)) {
      return {
        success: true,
        user_type: userType.type,
        account_type: this.accountType,
        profit_share: this.profitSharePercentage,
        summary: {
          total_sales: 0,
          total_profit: 0,
          team_contributions: 0
        },
        recent_sales: []
      };
    }

    const salesData = JSON.parse(readFileSync(salesFile, "utf8"));

    return {
      success: true,
      user_type: userType.type,
      account_type: this.accountType,
      profit_share: this.profitSharePercentage,
      summary: {
        total_sales: salesData.sales.length,
        total_profit: salesData.total_profit || 0,
        team_contributions: salesData.team_contributions || 0
      },
      recent_sales: salesData.sales.slice(-10).reverse()
    };
  }
}

// Middleware to inject user manager
export function userManagerMiddleware(req, res, next) {
  req.userManager = new UserManager();
  req.userType = req.userManager.getUserType(req);
  next();
}

export default { UserManager, userManagerMiddleware };
