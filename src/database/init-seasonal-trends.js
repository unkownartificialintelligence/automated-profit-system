import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, "../../data/seasonal-trends.db");
const db = new Database(dbPath);

// Initialize seasonal trends database
db.exec(`
  -- Seasons/Events Calendar
  CREATE TABLE IF NOT EXISTS seasons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    start_date TEXT NOT NULL, -- MM-DD format
    end_date TEXT NOT NULL,
    status TEXT DEFAULT 'upcoming', -- upcoming, active, past
    profit_potential INTEGER DEFAULT 0, -- 1-100 score
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Trending Keywords per Season
  CREATE TABLE IF NOT EXISTS trends (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    season_id INTEGER NOT NULL,
    keyword TEXT NOT NULL,
    search_volume INTEGER DEFAULT 0,
    trend_score INTEGER DEFAULT 0, -- 1-100
    competition TEXT DEFAULT 'medium', -- low, medium, high
    source TEXT DEFAULT 'google_trends', -- google_trends, etsy, pinterest, manual
    niches TEXT, -- JSON array of niches
    detected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (season_id) REFERENCES seasons(id)
  );

  -- Design Collections
  CREATE TABLE IF NOT EXISTS collections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    season_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    total_products INTEGER DEFAULT 0,
    estimated_profit REAL DEFAULT 0,
    status TEXT DEFAULT 'draft', -- draft, ready, listed, active
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (season_id) REFERENCES seasons(id)
  );

  -- Products in Collections
  CREATE TABLE IF NOT EXISTS seasonal_products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    collection_id INTEGER NOT NULL,
    trend_id INTEGER,
    product_name TEXT NOT NULL,
    design_data TEXT, -- JSON with colors, text, layout
    product_types TEXT, -- JSON array: tshirt, mug, hoodie, etc
    pricing TEXT, -- JSON with cost/retail/profit per type
    printful_id TEXT,
    etsy_id TEXT,
    status TEXT DEFAULT 'designed', -- designed, listed, active, sold_out
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (collection_id) REFERENCES collections(id),
    FOREIGN KEY (trend_id) REFERENCES trends(id)
  );

  -- Seasonal Performance Tracking
  CREATE TABLE IF NOT EXISTS seasonal_performance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    season_id INTEGER NOT NULL,
    collection_id INTEGER,
    total_sales INTEGER DEFAULT 0,
    total_revenue REAL DEFAULT 0,
    total_profit REAL DEFAULT 0,
    best_seller_id INTEGER, -- product_id
    recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (season_id) REFERENCES seasons(id),
    FOREIGN KEY (collection_id) REFERENCES collections(id)
  );

  -- Create indexes for performance
  CREATE INDEX IF NOT EXISTS idx_trends_season ON trends(season_id);
  CREATE INDEX IF NOT EXISTS idx_trends_score ON trends(trend_score DESC);
  CREATE INDEX IF NOT EXISTS idx_collections_season ON collections(season_id);
  CREATE INDEX IF NOT EXISTS idx_products_collection ON seasonal_products(collection_id);
  CREATE INDEX IF NOT EXISTS idx_products_status ON seasonal_products(status);
`);

// Insert default seasonal calendar (12+ events)
const insertSeason = db.prepare(`
  INSERT INTO seasons (name, start_date, end_date, profit_potential)
  VALUES (?, ?, ?, ?)
`);

const seasons = [
  { name: "Valentine's Day", start: "01-15", end: "02-14", profit: 85 },
  { name: "St. Patrick's Day", start: "02-20", end: "03-17", profit: 70 },
  { name: "Easter", start: "03-01", end: "04-20", profit: 75 },
  { name: "Mother's Day", start: "04-15", end: "05-14", profit: 90 },
  { name: "Father's Day", start: "05-20", end: "06-21", profit: 85 },
  { name: "Independence Day", start: "06-15", end: "07-04", profit: 80 },
  { name: "Back to School", start: "07-15", end: "09-10", profit: 82 },
  { name: "Halloween", start: "09-15", end: "10-31", profit: 95 },
  { name: "Thanksgiving", start: "10-15", end: "11-28", profit: 78 },
  { name: "Black Friday/Cyber Monday", start: "11-15", end: "12-02", profit: 98 },
  { name: "Christmas", start: "11-01", end: "12-25", profit: 100 },
  { name: "New Year", start: "12-15", end: "01-05", profit: 75 },
  { name: "Summer Vacation", start: "05-01", end: "08-31", profit: 70 },
  { name: "Fall/Autumn", start: "08-15", end: "11-15", profit: 72 }
];

const insertSeasons = db.transaction((seasons) => {
  for (const season of seasons) {
    insertSeason.run(season.name, season.start, season.end, season.profit);
  }
});

try {
  insertSeasons(seasons);
  console.log("✅ Seasonal trends database initialized successfully!");
  console.log(`📊 Added ${seasons.length} seasonal events to calendar`);
} catch (err) {
  if (!err.message.includes("UNIQUE constraint failed")) {
    console.error("Error initializing seasons:", err);
  } else {
    console.log("✅ Seasonal trends database already initialized");
  }
}

db.close();

export default db;
