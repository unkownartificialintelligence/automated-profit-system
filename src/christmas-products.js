import { writeFileSync, readFileSync, existsSync } from "fs";
import { join } from "path";

/**
 * Christmas Product Discovery & Management System
 * Discovers trending Christmas products and organizes them for daily launches
 */

// Trending Christmas Products for 2025
export const CHRISTMAS_PRODUCTS_2025 = [
  // Week 1: Dec 9-15 (Early Christmas Shoppers)
  {
    week: 1,
    launch_date: "2025-12-09",
    products: [
      {
        keyword: "christmas cat dad",
        product_name: "Meowy Christmas Cat Dad T-Shirt",
        target_audience: "Cat dads, pet lovers, humor enthusiasts",
        trend_score: 92,
        competition: "Low",
        price_recommendation: "$24.99",
        design_concept: "Cat wearing Santa hat with 'MEOWY CHRISTMAS' text",
        colors: ["#C41E3A", "#165B33", "#FFFFFF"],
        platform: "Etsy, Amazon",
        estimated_daily_sales: "5-8",
        profit_per_sale: "$12.04"
      },
      {
        keyword: "ugly christmas sweater design",
        product_name: "Retro Ugly Christmas Sweater - Cat Theme",
        target_audience: "Millennial party-goers, cat lovers",
        trend_score: 95,
        competition: "Medium",
        price_recommendation: "$27.99",
        design_concept: "Pixelated cat in sweater pattern with snowflakes",
        colors: ["#C41E3A", "#165B33", "#FFD700"],
        platform: "Etsy, Shopify",
        estimated_daily_sales: "8-12",
        profit_per_sale: "$15.04"
      },
      {
        keyword: "christmas family matching",
        product_name: "Christmas Squad Family Matching Tees",
        target_audience: "Families, holiday card photos",
        trend_score: 88,
        competition: "Low",
        price_recommendation: "$22.99",
        design_concept: "Simple 'Christmas Squad 2025' with snowflakes",
        colors: ["#C41E3A", "#FFFFFF"],
        platform: "Etsy, Facebook Marketplace",
        estimated_daily_sales: "6-10",
        profit_per_sale: "$10.04"
      }
    ]
  },

  // Week 2: Dec 16-22 (Last Minute Shoppers - PEAK SEASON)
  {
    week: 2,
    launch_date: "2025-12-16",
    products: [
      {
        keyword: "santa's favorite",
        product_name: "Santa's Favorite - Personalized Christmas Tee",
        target_audience: "Gift givers, children, grandparents",
        trend_score: 94,
        competition: "Low",
        price_recommendation: "$26.99",
        design_concept: "Badge style 'SANTA'S FAVORITE' with holly",
        colors: ["#C41E3A", "#165B33", "#FFD700"],
        platform: "Etsy, Shopify",
        estimated_daily_sales: "10-15",
        profit_per_sale: "$14.04"
      },
      {
        keyword: "christmas introvert",
        product_name: "Introvert Survival Mode - Christmas Edition",
        target_audience: "Introverts, millennials, Gen Z",
        trend_score: 91,
        competition: "Low",
        price_recommendation: "$24.99",
        design_concept: "Minimalist text 'INTROVERT SURVIVAL MODE: CHRISTMAS'",
        colors: ["#2C3E50", "#C41E3A", "#FFFFFF"],
        platform: "Etsy, TikTok Shop",
        estimated_daily_sales: "7-11",
        profit_per_sale: "$12.04"
      },
      {
        keyword: "christmas movie marathon",
        product_name: "Official Christmas Movie Marathon Crew",
        target_audience: "Holiday movie lovers, cozy vibes",
        trend_score: 89,
        competition: "Medium",
        price_recommendation: "$25.99",
        design_concept: "Retro TV screen with 'CHRISTMAS MOVIE MARATHON CREW'",
        colors: ["#C41E3A", "#165B33", "#FFD700"],
        platform: "Etsy, Amazon",
        estimated_daily_sales: "8-13",
        profit_per_sale: "$13.04"
      }
    ]
  },

  // Week 3: Dec 23-25 (URGENT Last Minute - Digital Only)
  {
    week: 3,
    launch_date: "2025-12-23",
    products: [
      {
        keyword: "christmas pajama",
        product_name: "Matching Family Christmas Pajama Design",
        target_audience: "Last-minute shoppers, digital downloads",
        trend_score: 96,
        competition: "Low",
        price_recommendation: "$29.99",
        design_concept: "Classic red plaid with 'CHRISTMAS 2025'",
        colors: ["#C41E3A", "#FFFFFF", "#165B33"],
        platform: "Etsy (Digital)",
        estimated_daily_sales: "15-20",
        profit_per_sale: "$17.04",
        note: "Digital download - instant delivery"
      },
      {
        keyword: "christmas miracle",
        product_name: "Christmas Miracle Believer Tee",
        target_audience: "Faith-based, inspirational gift seekers",
        trend_score: 87,
        competition: "Low",
        price_recommendation: "$24.99",
        design_concept: "Elegant script 'Believe in Christmas Miracles'",
        colors: ["#FFD700", "#C41E3A", "#FFFFFF"],
        platform: "Etsy, Amazon",
        estimated_daily_sales: "5-9",
        profit_per_sale: "$12.04"
      }
    ]
  },

  // Week 4: Dec 26-31 (Post-Christmas / New Year Transition)
  {
    week: 4,
    launch_date: "2025-12-26",
    products: [
      {
        keyword: "survived christmas",
        product_name: "I Survived Christmas 2025 - Funny Tee",
        target_audience: "Humor seekers, exhausted parents",
        trend_score: 85,
        competition: "Low",
        price_recommendation: "$23.99",
        design_concept: "Badge style 'I SURVIVED CHRISTMAS 2025'",
        colors: ["#2C3E50", "#C41E3A", "#FFFFFF"],
        platform: "Etsy, TikTok Shop",
        estimated_daily_sales: "6-10",
        profit_per_sale: "$11.04"
      },
      {
        keyword: "new year new profit",
        product_name: "New Year New Profit - Entrepreneur 2026",
        target_audience: "Entrepreneurs, goal setters, hustlers",
        trend_score: 83,
        competition: "Low",
        price_recommendation: "$26.99",
        design_concept: "Modern typography 'NEW YEAR NEW PROFIT 2026'",
        colors: ["#FFD700", "#000000", "#FFFFFF"],
        platform: "Etsy, Shopify",
        estimated_daily_sales: "5-8",
        profit_per_sale: "$14.04"
      }
    ]
  }
];

/**
 * Get products for today based on current date
 */
export function getTodaysProducts() {
  const today = new Date();
  const currentDate = today.toISOString().split('T')[0];

  // Find the current week's products
  for (const week of CHRISTMAS_PRODUCTS_2025) {
    const launchDate = new Date(week.launch_date);
    const weekEnd = new Date(launchDate);
    weekEnd.setDate(weekEnd.getDate() + 7);

    if (today >= launchDate && today < weekEnd) {
      return {
        week: week.week,
        launch_date: week.launch_date,
        days_into_week: Math.floor((today - launchDate) / (1000 * 60 * 60 * 24)),
        products: week.products
      };
    }
  }

  // Default to first week if before launch
  return {
    week: 1,
    launch_date: CHRISTMAS_PRODUCTS_2025[0].launch_date,
    days_into_week: 0,
    products: CHRISTMAS_PRODUCTS_2025[0].products,
    note: "Preview mode - launch starts " + CHRISTMAS_PRODUCTS_2025[0].launch_date
  };
}

/**
 * Get products scheduled for a specific week
 */
export function getWeekProducts(weekNumber) {
  const week = CHRISTMAS_PRODUCTS_2025.find(w => w.week === weekNumber);
  return week || CHRISTMAS_PRODUCTS_2025[0];
}

/**
 * Get all products across all weeks
 */
export function getAllChristmasProducts() {
  const allProducts = [];
  CHRISTMAS_PRODUCTS_2025.forEach(week => {
    week.products.forEach(product => {
      allProducts.push({
        ...product,
        week: week.week,
        launch_date: week.launch_date
      });
    });
  });
  return allProducts;
}

/**
 * Calculate potential revenue for the season
 */
export function calculateSeasonRevenue() {
  const allProducts = getAllChristmasProducts();

  let totalRevenue = 0;
  let totalProfit = 0;
  let totalSales = 0;

  allProducts.forEach(product => {
    // Parse sales estimate (e.g., "5-8" -> average 6.5)
    const [minSales, maxSales] = product.estimated_daily_sales.split('-').map(Number);
    const avgDailySales = (minSales + maxSales) / 2;

    // 7 days per product
    const weekSales = avgDailySales * 7;

    // Parse profit (e.g., "$12.04" -> 12.04)
    const profitPerSale = parseFloat(product.profit_per_sale.replace('$', ''));

    totalSales += weekSales;
    totalProfit += weekSales * profitPerSale;

    // Parse price (e.g., "$24.99" -> 24.99)
    const price = parseFloat(product.price_recommendation.replace('$', ''));
    totalRevenue += weekSales * price;
  });

  return {
    total_products: allProducts.length,
    total_estimated_sales: Math.round(totalSales),
    total_revenue: `$${totalRevenue.toFixed(2)}`,
    total_profit: `$${totalProfit.toFixed(2)}`,
    average_profit_per_product: `$${(totalProfit / allProducts.length).toFixed(2)}`,
    season_duration: "23 days (Dec 9 - Dec 31)",
    daily_average_profit: `$${(totalProfit / 23).toFixed(2)}`
  };
}

/**
 * Generate daily task schedule
 */
export function generateDailySchedule(weekNumber) {
  const week = getWeekProducts(weekNumber);

  return {
    week: week.week,
    week_dates: `${week.launch_date} to ${new Date(new Date(week.launch_date).getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}`,

    daily_tasks: [
      {
        day: "Day 1 (Monday)",
        time: "Morning (9 AM)",
        tasks: [
          "☕ Check automation dashboard for overnight discoveries",
          "📊 Review Week " + week.week + " product lineup",
          "🎨 Select first product to launch today",
          "📝 Get design specifications from automation"
        ]
      },
      {
        day: "Day 1 (Monday)",
        time: "Midday (12 PM)",
        tasks: [
          "🎨 Create design in Canva (using automation specs)",
          "📦 List Product #1 on Printful manually",
          "✅ Verify product listing is live",
          "📸 Take screenshots for marketing"
        ]
      },
      {
        day: "Day 1 (Monday)",
        time: "Afternoon (3 PM)",
        tasks: [
          "📢 Copy marketing campaign from automation",
          "📱 Post to Instagram, TikTok, Facebook",
          "📧 Send email to subscriber list",
          "💰 Check dashboard for early sales"
        ]
      },
      {
        day: "Day 2 (Tuesday)",
        time: "Morning (9 AM)",
        tasks: [
          "💵 Check yesterday's sales & profit",
          "🎨 Select second product to launch",
          "📦 List Product #2 on Printful",
          "📢 Launch marketing campaign #2"
        ]
      },
      {
        day: "Day 3 (Wednesday)",
        time: "Morning (9 AM)",
        tasks: [
          "💵 Review 2-day performance metrics",
          "🎨 Select third product to launch",
          "📦 List Product #3 on Printful",
          "📢 Launch marketing campaign #3"
        ]
      },
      {
        day: "Days 4-7 (Thu-Sun)",
        time: "Daily Check-ins",
        tasks: [
          "💰 Monitor sales daily (all 3 products)",
          "📊 Track which products perform best",
          "💬 Respond to customer questions",
          "📈 Adjust pricing if needed",
          "🎯 Plan next week's products"
        ]
      }
    ],

    products_this_week: week.products.map(p => ({
      name: p.product_name,
      target: p.target_audience,
      estimated_weekly_profit: calculateProductProfit(p)
    })),

    week_goal: {
      products_to_list: week.products.length,
      estimated_sales: calculateWeekSales(week.products),
      estimated_profit: calculateWeekProfit(week.products),
      time_commitment: "2-3 hours/day"
    }
  };
}

function calculateProductProfit(product) {
  const [minSales, maxSales] = product.estimated_daily_sales.split('-').map(Number);
  const avgDailySales = (minSales + maxSales) / 2;
  const profitPerSale = parseFloat(product.profit_per_sale.replace('$', ''));
  return `$${(avgDailySales * 7 * profitPerSale).toFixed(2)}`;
}

function calculateWeekSales(products) {
  let total = 0;
  products.forEach(p => {
    const [minSales, maxSales] = p.estimated_daily_sales.split('-').map(Number);
    total += ((minSales + maxSales) / 2) * 7;
  });
  return Math.round(total);
}

function calculateWeekProfit(products) {
  let total = 0;
  products.forEach(p => {
    const [minSales, maxSales] = p.estimated_daily_sales.split('-').map(Number);
    const avgDailySales = (minSales + maxSales) / 2;
    const profitPerSale = parseFloat(p.profit_per_sale.replace('$', ''));
    total += avgDailySales * 7 * profitPerSale;
  });
  return `$${total.toFixed(2)}`;
}

export default {
  CHRISTMAS_PRODUCTS_2025,
  getTodaysProducts,
  getWeekProducts,
  getAllChristmasProducts,
  calculateSeasonRevenue,
  generateDailySchedule
};
