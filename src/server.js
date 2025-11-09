import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";
import os from "os";
import { readFileSync, statSync } from "fs";
import { execSync } from "child_process";
import teamProfitsRoutes from "./routes/team-profits.js";
import productsRoutes from "./routes/products.js";
import personalRoutes from "./routes/personal.js";

// Try to import sqlite3, but don't fail if it's not available
let sqlite3;
try {
  sqlite3 = (await import("sqlite3")).default;
} catch (error) {
  console.warn("⚠️  SQLite3 module not available, database health checks will be skipped");
  console.warn("   Run 'npm rebuild sqlite3' to fix this");
}

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const PRINTFUL_API_KEY = process.env.PRINTFUL_API_KEY;
const STRIPE_API_KEY = process.env.STRIPE_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const SERVER_START_TIME = Date.now();

// Health check thresholds from environment
const HEALTH_THRESHOLDS = {
  memoryWarning: parseInt(process.env.HEALTH_MEMORY_WARNING_THRESHOLD) || 80,
  memoryCritical: parseInt(process.env.HEALTH_MEMORY_CRITICAL_THRESHOLD) || 90,
  diskWarning: parseInt(process.env.HEALTH_DISK_WARNING_THRESHOLD) || 80,
  diskCritical: parseInt(process.env.HEALTH_DISK_CRITICAL_THRESHOLD) || 90,
  apiTimeout: parseInt(process.env.HEALTH_API_TIMEOUT) || 5000,
};

// Helper function to get disk space information
function getDiskSpace() {
  try {
    const platform = os.platform();
    let output;

    if (platform === 'win32') {
      // Windows: use wmic
      output = execSync('wmic logicaldisk get size,freespace,caption').toString();
      const lines = output.split('\n').filter(line => line.trim() && !line.includes('Caption'));
      if (lines.length > 0) {
        const parts = lines[0].trim().split(/\s+/);
        const total = parseInt(parts[2]) || 0;
        const free = parseInt(parts[1]) || 0;
        const used = total - free;
        const usedPercent = total > 0 ? Math.round((used / total) * 100) : 0;

        return {
          total: Math.round(total / 1024 / 1024 / 1024) + ' GB',
          free: Math.round(free / 1024 / 1024 / 1024) + ' GB',
          used: Math.round(used / 1024 / 1024 / 1024) + ' GB',
          usagePercent: usedPercent + '%',
          status: usedPercent >= HEALTH_THRESHOLDS.diskCritical ? 'critical' :
                  usedPercent >= HEALTH_THRESHOLDS.diskWarning ? 'warning' : 'healthy'
        };
      }
    } else {
      // Linux/Mac: use df
      output = execSync('df -k /').toString();
      const lines = output.split('\n');
      if (lines.length > 1) {
        const parts = lines[1].trim().split(/\s+/);
        const total = parseInt(parts[1]) * 1024;
        const used = parseInt(parts[2]) * 1024;
        const free = parseInt(parts[3]) * 1024;
        const usedPercent = parseInt(parts[4]);

        return {
          total: Math.round(total / 1024 / 1024 / 1024) + ' GB',
          free: Math.round(free / 1024 / 1024 / 1024) + ' GB',
          used: Math.round(used / 1024 / 1024 / 1024) + ' GB',
          usagePercent: usedPercent + '%',
          status: usedPercent >= HEALTH_THRESHOLDS.diskCritical ? 'critical' :
                  usedPercent >= HEALTH_THRESHOLDS.diskWarning ? 'warning' : 'healthy'
        };
      }
    }
  } catch (error) {
    return {
      error: 'Unable to retrieve disk space: ' + error.message,
      status: 'unknown'
    };
  }

  return {
    error: 'Unable to retrieve disk space',
    status: 'unknown'
  };
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Security + Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// === COMPREHENSIVE HEALTH CHECK ===
app.get("/api/health", async (req, res) => {
  const memoryUsagePercent = Math.round(((os.totalmem() - os.freemem()) / os.totalmem()) * 100);
  const memoryStatus = memoryUsagePercent >= HEALTH_THRESHOLDS.memoryCritical ? 'critical' :
                       memoryUsagePercent >= HEALTH_THRESHOLDS.memoryWarning ? 'warning' : 'healthy';

  const healthCheck = {
    success: true,
    message: "API is healthy and online",
    timestamp: new Date().toISOString(),
    uptime: Math.floor((Date.now() - SERVER_START_TIME) / 1000), // seconds
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
    checks: {
      server: { status: "healthy", message: "Express server running" },
      database: { status: "unknown", message: "Not checked" },
      printful: { status: "unknown", message: "Not checked" },
      stripe: { status: "unknown", message: "Not checked" },
      openai: { status: "unknown", message: "Not checked" },
      environment: { status: "unknown", message: "Not checked" },
    },
    system: {
      platform: os.platform(),
      memory: {
        total: Math.round(os.totalmem() / 1024 / 1024) + " MB",
        free: Math.round(os.freemem() / 1024 / 1024) + " MB",
        used: Math.round((os.totalmem() - os.freemem()) / 1024 / 1024) + " MB",
        usagePercent: memoryUsagePercent + "%",
        status: memoryStatus,
        thresholds: {
          warning: HEALTH_THRESHOLDS.memoryWarning + "%",
          critical: HEALTH_THRESHOLDS.memoryCritical + "%"
        }
      },
      disk: getDiskSpace(),
      cpus: os.cpus().length,
      nodeVersion: process.version,
    },
  };

  // === CHECK DATABASE ===
  if (!sqlite3) {
    healthCheck.checks.database = {
      status: "warning",
      message: "SQLite3 module not available - run 'npm rebuild sqlite3'",
    };
  } else {
    try {
      const dbPath = path.join(__dirname, "../database.db");
      await new Promise((resolve, reject) => {
        const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
          if (err) {
            healthCheck.checks.database = {
              status: "unhealthy",
              message: "Database connection failed: " + err.message,
            };
            healthCheck.success = false;
            reject(err);
          } else {
            db.close(() => {
              healthCheck.checks.database = {
                status: "healthy",
                message: "Database connected successfully",
              };
              resolve();
            });
          }
        });
      });
    } catch (error) {
      console.error("Database health check failed:", error.message);
    }
  }

  // === CHECK PRINTFUL API ===
  try {
    if (!PRINTFUL_API_KEY || PRINTFUL_API_KEY === "your_printful_api_key_here") {
      healthCheck.checks.printful = {
        status: "warning",
        message: "Printful API key not configured",
      };
    } else {
      const response = await axios.get("https://api.printful.com/store", {
        headers: { Authorization: `Bearer ${PRINTFUL_API_KEY}` },
        timeout: HEALTH_THRESHOLDS.apiTimeout,
      });
      healthCheck.checks.printful = {
        status: "healthy",
        message: "Printful API connected",
      };
    }
  } catch (error) {
    healthCheck.checks.printful = {
      status: "unhealthy",
      message: "Printful API connection failed: " + error.message,
    };
    healthCheck.success = false;
  }

  // === CHECK STRIPE API ===
  try {
    if (!STRIPE_API_KEY || STRIPE_API_KEY === "your_stripe_api_key_here" || STRIPE_API_KEY.includes("your_")) {
      healthCheck.checks.stripe = {
        status: "warning",
        message: "Stripe API key not configured",
      };
    } else {
      // Stripe API health check - retrieve account info
      const response = await axios.get("https://api.stripe.com/v1/balance", {
        headers: {
          Authorization: `Bearer ${STRIPE_API_KEY}`,
        },
        timeout: HEALTH_THRESHOLDS.apiTimeout,
      });
      healthCheck.checks.stripe = {
        status: "healthy",
        message: "Stripe API connected",
      };
    }
  } catch (error) {
    const isConfigIssue = error.response?.status === 401 || error.response?.status === 403;
    healthCheck.checks.stripe = {
      status: isConfigIssue ? "warning" : "unhealthy",
      message: isConfigIssue
        ? "Stripe API key invalid or unauthorized"
        : "Stripe API connection failed: " + error.message,
    };
    if (!isConfigIssue) {
      healthCheck.success = false;
    }
  }

  // === CHECK OPENAI API ===
  try {
    if (!OPENAI_API_KEY || OPENAI_API_KEY === "your_openai_api_key_here" || OPENAI_API_KEY.includes("your_")) {
      healthCheck.checks.openai = {
        status: "warning",
        message: "OpenAI API key not configured",
      };
    } else {
      // OpenAI API health check - retrieve models list
      const response = await axios.get("https://api.openai.com/v1/models", {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        timeout: HEALTH_THRESHOLDS.apiTimeout,
      });
      healthCheck.checks.openai = {
        status: "healthy",
        message: "OpenAI API connected",
      };
    }
  } catch (error) {
    const isConfigIssue = error.response?.status === 401 || error.response?.status === 403;
    healthCheck.checks.openai = {
      status: isConfigIssue ? "warning" : "unhealthy",
      message: isConfigIssue
        ? "OpenAI API key invalid or unauthorized"
        : "OpenAI API connection failed: " + error.message,
    };
    if (!isConfigIssue) {
      healthCheck.success = false;
    }
  }

  // === CHECK ENVIRONMENT VARIABLES ===
  const requiredEnvVars = ["PORT", "NODE_ENV"];
  const recommendedEnvVars = ["JWT_SECRET"];
  const optionalEnvVars = ["PRINTFUL_API_KEY", "STRIPE_API_KEY", "OPENAI_API_KEY"];
  const missingRequired = requiredEnvVars.filter((v) => !process.env[v]);
  const missingRecommended = recommendedEnvVars.filter(
    (v) => !process.env[v] || process.env[v].includes("your_")
  );
  const missingOptional = optionalEnvVars.filter(
    (v) => !process.env[v] || process.env[v].includes("your_")
  );

  if (missingRequired.length > 0) {
    healthCheck.checks.environment = {
      status: "unhealthy",
      message: `Missing required env vars: ${missingRequired.join(", ")}`,
    };
    healthCheck.success = false;
  } else if (missingRecommended.length > 0) {
    healthCheck.checks.environment = {
      status: "warning",
      message: `Missing recommended env vars: ${missingRecommended.join(", ")}`,
      details: "Security features may be weakened",
      optionalMissing: missingOptional.length > 0 ? missingOptional : undefined,
    };
  } else if (missingOptional.length > 0) {
    healthCheck.checks.environment = {
      status: "warning",
      message: `Missing optional env vars: ${missingOptional.join(", ")}`,
      details: "Some features may not be available",
    };
  } else {
    healthCheck.checks.environment = {
      status: "healthy",
      message: "All environment variables configured",
    };
  }

  // === CHECK SYSTEM RESOURCES ===
  // Mark as unhealthy if memory or disk is critical
  if (memoryStatus === 'critical') {
    healthCheck.success = false;
    healthCheck.message = "System resources critical - memory usage too high";
  }

  if (healthCheck.system.disk.status === 'critical') {
    healthCheck.success = false;
    healthCheck.message = "System resources critical - disk space too low";
  }

  // === DETERMINE HTTP STATUS ===
  const httpStatus = healthCheck.success ? 200 : 503;
  res.status(httpStatus).json(healthCheck);
});

// === PRINTFUL ROUTES ===
app.get("/api/printful/store", async (req, res) => {
  try {
    if (!PRINTFUL_API_KEY)
      return res.status(400).json({ success: false, message: "Missing Printful API Key" });

    const response = await axios.get("https://api.printful.com/store", {
      headers: { Authorization: `Bearer ${PRINTFUL_API_KEY}` },
    });

    res.json({ success: true, data: response.data });
  } catch (error) {
    console.error("Printful error:", error.message);
    res.status(500).json({ success: false, message: "Failed to connect to Printful API" });
  }
});

// === AUTO-FETCH PRODUCTS ===
app.get("/api/printful/products", async (req, res) => {
  try {
    const response = await axios.get("https://api.printful.com/store/products", {
      headers: { Authorization: `Bearer ${PRINTFUL_API_KEY}` },
    });
    res.json({ success: true, data: response.data });
  } catch (error) {
    console.error("Products fetch error:", error.message);
    res.status(500).json({ success: false, message: "Failed to fetch products" });
  }
});

// === TEAM PROFIT SHARING ROUTES ===
// Tier-based team management with automatic 25% revenue share
app.use("/api/team", teamProfitsRoutes);

// === PRODUCT RESEARCH & PROFIT TOOLS ===
// Trending products, profit calculator, pricing optimizer
app.use("/api/products", productsRoutes);

// === PERSONAL ACCOUNT ROUTES ===
// Owner's personal sales tracking (no revenue share - keep 100%)
app.use("/api/personal", personalRoutes);

// === FUTURE FEATURES ===
// 🧠 AI-driven profit optimization
// 💳 Stripe/PayPal payment integration
// 📦 Shopify + Etsy auto-sync endpoints
// 🧾 Analytics dashboard API

// === SERVE FRONTEND (for production) ===
const frontendPath = path.join(__dirname, "../frontend/dist");
app.use(express.static(frontendPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// === START SERVER ===
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
  console.log("💼 Connected to Printful (if key is valid)");
});




