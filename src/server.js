import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";
import os from "os";
import { readFileSync } from "fs";
import teamProfitsRoutes from "./routes/team-profits.js";
import productsRoutes from "./routes/products.js";
import personalRoutes from "./routes/personal.js";
import automationRoutes from "./routes/automation.js";
import autoLaunchRoutes from "./routes/auto-launch.js";
import canvaAutomationRoutes from "./routes/canva-automation.js";
import christmasDesignRoutes from "./routes/christmas-design.js";
import fullAutomationRoutes from "./routes/full-automation.js";

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
const SERVER_START_TIME = Date.now();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Security + Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// === COMPREHENSIVE HEALTH CHECK ===
app.get("/api/health", async (req, res) => {
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
      environment: { status: "unknown", message: "Not checked" },
    },
    system: {
      platform: os.platform(),
      memory: {
        total: Math.round(os.totalmem() / 1024 / 1024) + " MB",
        free: Math.round(os.freemem() / 1024 / 1024) + " MB",
        used: Math.round((os.totalmem() - os.freemem()) / 1024 / 1024) + " MB",
        usagePercent: Math.round(((os.totalmem() - os.freemem()) / os.totalmem()) * 100) + "%",
      },
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
        timeout: 5000,
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

  // === CHECK ENVIRONMENT VARIABLES ===
  const requiredEnvVars = ["PORT", "NODE_ENV"];
  const optionalEnvVars = ["PRINTFUL_API_KEY", "STRIPE_API_KEY", "OPENAI_API_KEY"];
  const missingRequired = requiredEnvVars.filter((v) => !process.env[v]);
  const missingOptional = optionalEnvVars.filter(
    (v) => !process.env[v] || process.env[v].includes("your_")
  );

  if (missingRequired.length > 0) {
    healthCheck.checks.environment = {
      status: "unhealthy",
      message: `Missing required env vars: ${missingRequired.join(", ")}`,
    };
    healthCheck.success = false;
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

// === AUTOMATION ROUTES ===
// Printful integration, customer outreach, trending product discovery
app.use("/api/automation", automationRoutes);

// === AUTO-LAUNCH SYSTEM ===
// Automated trending product discovery, scheduling, and store updates
app.use("/api/auto-launch", autoLaunchRoutes);

// === CANVA AUTOMATION ===
// Full automation pipeline: discover → design → list → market
app.use("/api/canva", canvaAutomationRoutes);

// === CHRISTMAS DESIGN TEMPLATES ===
// Pre-built Christmas design ideas with profit calculations
app.use("/api/christmas", christmasDesignRoutes);

// === FULL AUTOMATION ===
// Complete end-to-end automation: design → list → promote (80%+ automation)
app.use("/api/full-automation", fullAutomationRoutes);

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




