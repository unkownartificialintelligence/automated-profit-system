import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";
import adminRouter from "./routes/admin.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const PRINTFUL_API_KEY = process.env.PRINTFUL_API_KEY;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Security + Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// === ADMIN ROUTES ===
app.use("/api/admin", adminRouter);

// === HEALTH CHECK ===
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "API is healthy and online" });
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




