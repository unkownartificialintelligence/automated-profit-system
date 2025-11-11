import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import compression from "compression";
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

// Detect serverless environment early (before any conditional imports)
const isVercel = process.env.VERCEL === '1' || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.VERCEL_ENV;

// SQLite3 is only available in local environment, not in serverless
let sqlite3 = null;

dotenv.config();

// === ENVIRONMENT VARIABLE VALIDATION ===
const requiredEnvVars = ['JWT_SECRET', 'NODE_ENV'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  const errorMsg = `❌ CRITICAL: Missing required environment variables: ${missingEnvVars.join(', ')}`;
  console.error(errorMsg);

  // In serverless, throw error instead of exit
  if (isVercel) {
    throw new Error(errorMsg + ' - Please add these in Vercel dashboard');
  }
  process.exit(1);
}

// Validate JWT_SECRET strength
if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
  const errorMsg = '❌ CRITICAL: JWT_SECRET must be at least 32 characters long';
  console.error(errorMsg);

  // In serverless, throw error instead of exit
  if (isVercel) {
    throw new Error(errorMsg);
  }
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;
const PRINTFUL_API_KEY = process.env.PRINTFUL_API_KEY;
const SERVER_START_TIME = Date.now();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// === CORS CONFIGURATION ===
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:3000', 'http://localhost:5173']; // Defaults for development

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

// === RATE LIMITING ===
// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Strict rate limiter for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  skipSuccessfulRequests: true, // Don't count successful requests
  message: {
    success: false,
    message: 'Too many login attempts, please try again later.'
  }
});

// Import logger
import logger from './utils/logger.js';

// Import Sentry error monitoring
import {
  initSentry,
  sentryRequestHandler,
  sentryTracingHandler,
  sentryErrorHandler
} from './utils/sentry.js';

// Initialize Sentry FIRST (before any other middleware)
initSentry(app);

// === SECURITY + MIDDLEWARE ===
// Sentry request handler must be the first middleware
app.use(sentryRequestHandler());
app.use(sentryTracingHandler());

app.use(helmet());
app.use(cors(corsOptions));
app.use(cookieParser()); // Parse cookies for CSRF protection
app.use(express.json({ limit: '10mb' })); // Add size limit to prevent DOS

// Use Winston for HTTP request logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev', {
  stream: logger.stream
}));

// Import validation middleware
import { sanitizeBody, preventSQLInjection } from './middleware/validation.js';

// Import CSRF protection
import { csrfTokenGenerator, getCsrfToken } from './middleware/csrf.js';

// Import request ID tracking
import requestIdMiddleware from './middleware/requestId.js';

// Import performance monitoring
import performanceMonitoring, { performanceStatsHandler } from './middleware/performance.js';

// Import caching
import cacheMiddleware, { getCacheStats, startCacheCleanup } from './middleware/cache.js';

// Apply global security middleware
app.use(requestIdMiddleware); // Track requests with unique IDs
app.use(compression()); // Enable gzip compression
app.use(performanceMonitoring); // Monitor response times
app.use(sanitizeBody); // Sanitize all string inputs
app.use(preventSQLInjection); // Prevent SQL injection attempts
app.use(csrfTokenGenerator); // Generate CSRF tokens for requests

// Apply rate limiting to all API routes
app.use('/api/', apiLimiter);

/**
 * @swagger
 * /api/csrf-token:
 *   get:
 *     summary: Get CSRF token
 *     description: Retrieves a CSRF token for making state-changing requests
 *     tags: [Security]
 *     responses:
 *       200:
 *         description: CSRF token generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 csrfToken:
 *                   type: string
 *                   description: The CSRF token to include in X-CSRF-Token header
 */
app.get('/api/csrf-token', getCsrfToken);

/**
 * @swagger
 * /api/performance:
 *   get:
 *     summary: Get performance statistics
 *     description: Returns detailed performance metrics including response times and slow endpoints
 *     tags: [Monitoring]
 *     responses:
 *       200:
 *         description: Performance statistics
 */
app.get('/api/performance', performanceStatsHandler);

/**
 * @swagger
 * /api/cache-stats:
 *   get:
 *     summary: Get cache statistics
 *     description: Returns cache hit/miss ratio and cache size
 *     tags: [Monitoring]
 *     responses:
 *       200:
 *         description: Cache statistics
 */
app.get('/api/cache-stats', getCacheStats);

// === TEST SENTRY ERROR (Development Only) ===
if (process.env.NODE_ENV !== 'production') {
  /**
   * @swagger
   * /api/test-sentry-error:
   *   get:
   *     summary: Test Sentry error tracking (Development only)
   *     description: Triggers a test error to verify Sentry integration
   *     tags: [Testing]
   *     responses:
   *       500:
   *         description: Test error triggered
   */
  app.get('/api/test-sentry-error', (req, res) => {
    throw new Error('🧪 Test error for Sentry - If you see this in your Sentry dashboard, it\'s working!');
  });
}

// === SWAGGER API DOCUMENTATION ===
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.js';

// Swagger UI endpoint
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Automated Profit System API Docs'
}));

// Swagger JSON endpoint
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// === COMPREHENSIVE HEALTH CHECK ===
/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns comprehensive health status of the system including database, API connections, and environment
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: System is healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthCheck'
 *       503:
 *         description: System is unhealthy
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/HealthCheck'
 *                 - type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                       example: false
 */
// Cache health checks for 10 seconds
app.get("/api/health", cacheMiddleware(10000), async (req, res) => {
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

// === FUTURE FEATURES ===
// 🧠 AI-driven profit optimization
// 💳 Stripe/PayPal payment integration
// 📦 Shopify + Etsy auto-sync endpoints
// 🧾 Analytics dashboard API

// === SERVE FRONTEND (for production) ===
// Only serve static frontend files in non-serverless environments
if (!isVercel) {
  const frontendPath = path.join(__dirname, "../frontend/dist");
  app.use(express.static(frontendPath));

  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
} else {
  // In serverless (Vercel), return API info for non-API routes
  app.get("*", (req, res) => {
    res.status(200).json({
      success: true,
      message: "Automated Profit System API",
      version: "1.0.0",
      endpoints: {
        health: "/api/health",
        docs: "/api-docs",
        csrf: "/api/csrf-token",
        performance: "/api/performance",
        cache: "/api/cache-stats"
      },
      documentation: "Visit /api-docs for full API documentation"
    });
  });
}

// === GLOBAL ERROR HANDLER ===
// Sentry error handler must be before other error handlers
app.use(sentryErrorHandler());

// Custom error handler
app.use((err, req, res, next) => {
  logger.logError(err, req);

  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      message: 'CORS policy violation'
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// === START SERVER ===
// Only start server if not in serverless environment (Vercel)
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    logger.info(`Server started successfully on port ${PORT}`, {
      port: PORT,
      environment: process.env.NODE_ENV,
      nodeVersion: process.version
    });
    console.log(`✅ Server running at http://localhost:${PORT}`);
    console.log("💼 Connected to Printful (if key is valid)");

    // Start cache cleanup (every 1 minute)
    startCacheCleanup(60000);
    logger.info('Performance optimizations active', {
      compression: 'gzip',
      caching: 'in-memory',
      monitoring: 'enabled'
    });
  });
} else {
  // Vercel serverless - start cache cleanup immediately
  startCacheCleanup(60000);
}

// Export for Vercel serverless
export default app;




