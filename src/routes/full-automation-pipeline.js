import express from 'express';
import axios from 'axios';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import sqlite3 from 'sqlite3';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// File paths
const LAUNCHED_PRODUCTS_FILE = join(__dirname, '../../data/launched-products.json');
const AUTOMATION_LOG_FILE = join(__dirname, '../../data/full-automation-log.json');
const SCHEDULE_FILE = join(__dirname, '../../data/full-automation-schedule.json');
const dbPath = join(__dirname, '../../database.db');

// Ensure data directory exists
const dataDir = join(__dirname, '../../data');
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

// Database helpers
const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath);
    db.run(sql, params, function(err) {
      db.close();
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

// Load helper functions
function loadLaunchedProducts() {
  if (existsSync(LAUNCHED_PRODUCTS_FILE)) {
    return JSON.parse(readFileSync(LAUNCHED_PRODUCTS_FILE, 'utf8'));
  }
  return { products: [], last_updated: new Date().toISOString() };
}

function saveLaunchedProducts(data) {
  writeFileSync(LAUNCHED_PRODUCTS_FILE, JSON.stringify(data, null, 2));
}

function loadAutomationLog() {
  if (existsSync(AUTOMATION_LOG_FILE)) {
    return JSON.parse(readFileSync(AUTOMATION_LOG_FILE, 'utf8'));
  }
  return { runs: [], total_products_created: 0, total_sales: 0 };
}

function saveAutomationLog(data) {
  writeFileSync(AUTOMATION_LOG_FILE, JSON.stringify(data, null, 2));
}

// ============================================
// STEP 1: AI-POWERED DESIGN GENERATION
// ============================================

/**
 * Generate design specifications for a product
 * This creates detailed design briefs that can be used with:
 * - Canva
 * - AI image generators (DALL-E, Midjourney, Stable Diffusion)
 * - Professional designers
 */
function generateDesignSpecification(product) {
  const keyword = product.keyword;
  const category = product.category || inferCategory(keyword);

  // Color schemes based on category
  const colorSchemes = {
    pets: {
      primary: ['#FF6B6B', '#4ECDC4', '#45B7D1'],
      secondary: ['#FFFFFF', '#000000', '#95A5A6'],
      mood: 'playful and loving'
    },
    lifestyle: {
      primary: ['#E8B4B8', '#9DC8C8', '#C9ADA1'],
      secondary: ['#FFFFFF', '#2C3E50', '#F5F5DC'],
      mood: 'calm and aesthetic'
    },
    funny: {
      primary: ['#FFD93D', '#FF6B6B', '#6BCB77'],
      secondary: ['#000000', '#FFFFFF', '#4D4D4D'],
      mood: 'bold and humorous'
    },
    holiday: {
      primary: ['#C41E3A', '#0C7C59', '#F4D03F'],
      secondary: ['#FFFFFF', '#000000', '#8B4513'],
      mood: 'festive and warm'
    },
    fitness: {
      primary: ['#FF6B6B', '#4ECDC4', '#000000'],
      secondary: ['#FFFFFF', '#95A5A6', '#34495E'],
      mood: 'energetic and motivating'
    }
  };

  const colors = colorSchemes[category] || colorSchemes.lifestyle;

  // Typography recommendations
  const typographyStyles = {
    pets: ['Fredoka One', 'Baloo 2', 'Comfortaa'],
    lifestyle: ['Montserrat', 'Playfair Display', 'Raleway'],
    funny: ['Bebas Neue', 'Anton', 'Permanent Marker'],
    holiday: ['Crimson Text', 'Great Vibes', 'Satisfy'],
    fitness: ['Oswald', 'Roboto Condensed', 'Bebas Neue']
  };

  const fonts = typographyStyles[category] || typographyStyles.lifestyle;

  // Design elements
  const elements = generateDesignElements(keyword, category);

  return {
    keyword,
    product_name: product.product_name,
    category,
    design_brief: {
      main_text: formatMainText(keyword),
      subtitle: generateSubtitle(keyword, category),
      style: getDesignStyle(category),
      colors,
      fonts,
      elements,
      layout: getLayoutRecommendation(category),
      dimensions: {
        width: 4500,
        height: 5400,
        dpi: 300,
        format: 'PNG with transparent background'
      }
    },
    ai_prompts: generateAIPrompts(keyword, category),
    canva_instructions: generateCanvaInstructions(keyword, colors, fonts),
    printful_specs: {
      product_type: 'Unisex T-Shirt (Bella+Canvas 3001)',
      print_area: 'Front center',
      print_size: '12" x 16" (recommended)',
      background: 'Transparent'
    }
  };
}

function inferCategory(keyword) {
  const lowerKey = keyword.toLowerCase();
  if (lowerKey.includes('dog') || lowerKey.includes('cat') || lowerKey.includes('pet')) return 'pets';
  if (lowerKey.includes('christmas') || lowerKey.includes('holiday') || lowerKey.includes('halloween')) return 'holiday';
  if (lowerKey.includes('gym') || lowerKey.includes('fitness') || lowerKey.includes('workout')) return 'fitness';
  if (lowerKey.includes('funny') || lowerKey.includes('sarcastic') || lowerKey.includes('joke')) return 'funny';
  return 'lifestyle';
}

function formatMainText(keyword) {
  return keyword.toUpperCase().split(' ').join('\n');
}

function generateSubtitle(keyword, category) {
  const subtitles = {
    pets: ['THE BEST PET PARENT', 'PROUD MEMBER', 'AND LOVING IT', 'LIFESTYLE'],
    lifestyle: ['VIBES ONLY', 'LIFESTYLE', 'CLUB', 'AESTHETIC'],
    funny: ['NO REGRETS', 'DEAL WITH IT', 'JUST SAYING', 'THE TRUTH'],
    holiday: ['SEASON\'S GREETINGS', 'CELEBRATE', 'FESTIVE VIBES', 'SPECIAL EDITION'],
    fitness: ['GRIND NEVER STOPS', 'NO EXCUSES', 'STRONG', 'POWERED']
  };

  const options = subtitles[category] || subtitles.lifestyle;
  return options[Math.floor(Math.random() * options.length)];
}

function getDesignStyle(category) {
  const styles = {
    pets: 'playful with rounded elements and paw prints',
    lifestyle: 'minimalist and aesthetic with clean lines',
    funny: 'bold and retro with strong typography',
    holiday: 'festive with ornamental elements',
    fitness: 'bold and dynamic with geometric shapes'
  };
  return styles[category] || 'modern and clean';
}

function generateDesignElements(keyword, category) {
  const baseElements = {
    pets: ['paw prints', 'heart shapes', 'cute animal silhouettes'],
    lifestyle: ['geometric shapes', 'minimal line art', 'decorative frames'],
    funny: ['speech bubbles', 'vintage badges', 'retro starburst'],
    holiday: ['snowflakes', 'ornaments', 'festive borders'],
    fitness: ['lightning bolts', 'geometric patterns', 'dynamic lines']
  };

  return baseElements[category] || baseElements.lifestyle;
}

function getLayoutRecommendation(category) {
  const layouts = {
    pets: 'Center-aligned with decorative elements around text',
    lifestyle: 'Minimalist center layout with subtle accents',
    funny: 'Bold center text with vintage frame or badge',
    holiday: 'Ornamental border with centered festive text',
    fitness: 'Dynamic diagonal or angular layout'
  };
  return layouts[category] || 'Center-aligned balanced composition';
}

function generateAIPrompts(keyword, category) {
  return {
    dalle: `Create a t-shirt design for "${keyword}". Style: ${getDesignStyle(category)}. High contrast, professional, print-ready. Transparent background. 4500x5400 pixels.`,
    midjourney: `/imagine t-shirt design, ${keyword}, ${getDesignStyle(category)}, bold typography, vector art, transparent background --ar 3:4 --v 5`,
    stable_diffusion: `Professional t-shirt graphic design for "${keyword}", ${getDesignStyle(category)}, vector art style, clean typography, high quality, transparent background, 300 DPI`
  };
}

function generateCanvaInstructions(keyword, colors, fonts) {
  return {
    steps: [
      '1. Open Canva.com and create a new design (4500 x 5400 pixels)',
      '2. Search for "t-shirt design" templates or start blank',
      `3. Add main text: "${formatMainText(keyword)}"`,
      `4. Choose font from: ${fonts.join(', ')}`,
      `5. Primary color: ${colors.primary[0]}, Secondary: ${colors.secondary[0]}`,
      '6. Add decorative elements from elements library',
      '7. Ensure text is centered and well-balanced',
      '8. Download as PNG with transparent background (300 DPI)',
      '9. File size should be 4500 x 5400 pixels'
    ],
    quick_link: 'https://www.canva.com/create/t-shirts/'
  };
}

// ============================================
// STEP 2: PRINTFUL PRODUCT CREATION
// ============================================

async function createPrintfulProduct(designSpec, printfulApiKey) {
  if (!printfulApiKey || printfulApiKey === 'your_printful_api_key_here') {
    return {
      success: false,
      status: 'no_api_key',
      message: 'Printful API key not configured',
      manual_instructions: {
        step_1: 'Go to https://www.printful.com/dashboard/product-templates',
        step_2: 'Click "Create Product Template"',
        step_3: `Upload your ${designSpec.product_name} design`,
        step_4: 'Select "Bella+Canvas 3001 Unisex T-Shirt"',
        step_5: 'Set price to $24.99',
        step_6: 'Sync to your Etsy/Shopify store'
      }
    };
  }

  try {
    // Note: This would need a real design URL
    // For now, we'll return a specification for manual upload
    return {
      success: false,
      status: 'needs_design_upload',
      message: 'Design needs to be created and uploaded first',
      design_spec: designSpec,
      next_step: 'Create design using the provided specifications, then upload to Printful'
    };

    // Real Printful API call would look like this:
    /*
    const response = await axios.post(
      'https://api.printful.com/store/products',
      {
        sync_product: {
          name: designSpec.product_name,
          thumbnail: designUrl
        },
        sync_variants: [
          {
            retail_price: '24.99',
            variant_id: 4012, // Black
            files: [{ url: designUrl }]
          },
          {
            retail_price: '24.99',
            variant_id: 4013, // Navy
            files: [{ url: designUrl }]
          },
          {
            retail_price: '24.99',
            variant_id: 4014, // Gray
            files: [{ url: designUrl }]
          }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${printfulApiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      success: true,
      status: 'created',
      printful_product_id: response.data.result.id,
      product_url: `https://www.printful.com/dashboard/default/products/${response.data.result.id}`,
      variants: response.data.result.sync_variants.length
    };
    */
  } catch (error) {
    return {
      success: false,
      status: 'error',
      message: error.message
    };
  }
}

// ============================================
// STEP 3: ETSY/SHOPIFY LISTING
// ============================================

function generateEtsyListing(product, designSpec) {
  const keyword = product.keyword;
  const price = product.suggested_price || 24.99;

  return {
    title: generateEtsyTitle(keyword),
    description: generateProductDescription(keyword, product.category || 'lifestyle'),
    tags: generateEtsyTags(keyword),
    price: price,
    shipping: {
      profile: 'Standard shipping',
      cost: 'Free shipping on orders over $35'
    },
    photos: {
      main: 'Product mockup on white background',
      lifestyle_1: 'Model wearing the shirt',
      lifestyle_2: 'Flat lay with lifestyle props',
      detail: 'Close-up of design',
      size_chart: 'Standard Bella+Canvas size chart'
    },
    seo: {
      title_optimization: `Best ${keyword} T-Shirt, ${keyword} Gift, ${keyword} Shirt for Women Men`,
      meta_description: `Perfect ${keyword} t-shirt! High-quality, comfortable fit. Great gift idea. Fast shipping. Shop now!`
    },
    listing_instructions: [
      '1. Log into Etsy Seller account',
      '2. Go to Listings > Add a listing',
      `3. Category: Clothing > Shirts & Tops > Tees`,
      '4. Paste title, description, and tags',
      '5. Upload product mockup images (use Printful mockups)',
      `6. Set price: $${price}`,
      '7. Enable "Ships from" Printful integration',
      '8. Publish listing'
    ]
  };
}

function generateEtsyTitle(keyword) {
  // Etsy allows 140 characters
  const formatted = keyword.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  return `${formatted} T-Shirt, ${formatted} Gift, Unisex ${formatted} Tee, Funny ${formatted} Shirt`;
}

function generateProductDescription(keyword, category) {
  const formatted = keyword.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return `✨ ${formatted} T-Shirt ✨

Perfect for ${keyword} lovers! This premium quality t-shirt features a unique ${keyword} design that's sure to turn heads.

🎁 FEATURES:
• Premium quality Bella+Canvas 3001 unisex t-shirt
• Soft, comfortable, and durable fabric
• True to size fit
• Unique ${keyword} design
• Perfect gift idea for ${keyword} enthusiasts

👕 DETAILS:
• Material: 100% Airlume combed and ring-spun cotton
• Weight: 4.2 oz/yd² (142 g/m²)
• Sizes: XS - 3XL available
• Colors: Multiple color options
• Print: High-quality direct-to-garment printing

📦 SHIPPING:
• Fast processing and shipping
• Ships within 2-7 business days
• Tracked shipping included
• Ships from USA via Printful

🎁 PERFECT GIFT FOR:
• Birthday gifts
• Holiday gifts
• Just because gifts
• ${keyword} lovers
• Friends and family

💯 SATISFACTION GUARANTEED:
We stand behind the quality of our products. If you're not 100% satisfied, we'll make it right!

🛒 ORDER NOW and show your ${keyword} pride!

#${keyword.replace(' ', '')} #${category} #giftideas #tshirt #unisextee`;
}

function generateEtsyTags(keyword) {
  const words = keyword.toLowerCase().split(' ');
  const tags = [
    keyword,
    `${keyword} shirt`,
    `${keyword} gift`,
    `${keyword} tshirt`,
    `${keyword} tee`,
    'unisex tshirt',
    'gift idea',
    'funny shirt',
    'unique tee',
    'custom shirt',
    ...words
  ];

  // Etsy allows 13 tags
  return tags.slice(0, 13).map(tag => tag.substring(0, 20));
}

function generateShopifyListing(product, designSpec) {
  return {
    product: {
      title: generateEtsyTitle(product.keyword),
      body_html: generateProductDescription(product.keyword, product.category || 'lifestyle').replace(/\n/g, '<br>'),
      vendor: 'Your Brand Name',
      product_type: 'T-Shirt',
      tags: generateEtsyTags(product.keyword).join(', '),
      variants: [
        { title: 'S', price: product.suggested_price || 24.99, sku: `${product.keyword.replace(' ', '-')}-S` },
        { title: 'M', price: product.suggested_price || 24.99, sku: `${product.keyword.replace(' ', '-')}-M` },
        { title: 'L', price: product.suggested_price || 24.99, sku: `${product.keyword.replace(' ', '-')}-L` },
        { title: 'XL', price: product.suggested_price || 24.99, sku: `${product.keyword.replace(' ', '-')}-XL` },
        { title: '2XL', price: product.suggested_price || 24.99, sku: `${product.keyword.replace(' ', '-')}-2XL` }
      ]
    },
    instructions: [
      '1. Log into Shopify admin',
      '2. Go to Products > Add product',
      '3. Paste title and description',
      '4. Add product images (use Printful mockups)',
      '5. Set price and variants',
      '6. Connect to Printful app for fulfillment',
      '7. Publish product'
    ]
  };
}

// ============================================
// STEP 4: MARKETING AUTOMATION
// ============================================

function generateMarketingCampaign(product, listingUrl = 'https://etsy.com/listing/your-product') {
  const keyword = product.keyword;
  const price = product.suggested_price || 24.99;

  return {
    social_media: {
      facebook: {
        post: `🎉 NEW ARRIVAL! 🎉

Check out our ${keyword} t-shirt! Perfect for ${keyword} lovers! ❤️

✨ Premium quality
🎁 Makes a great gift
🚚 Fast shipping
💰 Only $${price}

Shop now: ${listingUrl}

Tag someone who would love this! 👇

#${keyword.replace(' ', '')} #tshirt #etsyshop #smallbusiness #giftideas`,

        ad_targeting: {
          interests: [keyword, 't-shirts', 'online shopping', 'gift shopping'],
          demographics: 'Ages 25-45, all genders',
          budget: '$5-10/day to start'
        }
      },

      instagram: {
        post: `✨ New drop! ✨

${keyword.toUpperCase()} tee now available 🔥

Perfect for ${keyword} lovers!
Link in bio 👆

Use code FIRST10 for 10% off! 💰

#${keyword.replace(' ', '')} #tshirt #etsyfinds #shopsmall #giftsforher #giftsforhim #tshirtdesign`,

        story: `Swipe up to shop our new ${keyword} design! 🔥`,

        reels_idea: `Show the shirt being unboxed, worn, and styled in different ways. Add trending audio.`
      },

      pinterest: {
        pin_title: `${keyword.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} T-Shirt - Perfect Gift Idea`,
        pin_description: `Love ${keyword}? This premium t-shirt is perfect for you! High-quality, comfortable, and stylish. Great gift idea! #${keyword.replace(' ', '')} #giftideas #tshirt`,
        boards: ['Gift Ideas', 'T-Shirt Designs', 'Fashion', 'Shopping Finds']
      },

      tiktok: {
        video_ideas: [
          `"POV: You're a ${keyword}" - Show shirt reveal`,
          `"Things only ${keyword} lovers understand" - Wear the shirt`,
          `"Best gift for ${keyword} lovers" - Product showcase`,
          `"Unboxing my new ${keyword} shirt" - Unboxing video`
        ],
        hashtags: `#${keyword.replace(' ', '')} #tshirt #smallbusiness #etsyfinds #giftideas #foryou`
      }
    },

    email_campaign: {
      subject: `🎉 NEW: ${keyword.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} T-Shirt!`,

      body: `Hey there!

We just launched our newest design and we think you're going to LOVE it! ❤️

Introducing our ${keyword.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} T-Shirt!

✨ Premium quality Bella+Canvas fabric
🎨 Unique ${keyword} design
🚚 Fast, tracked shipping
💯 100% satisfaction guaranteed

Special launch price: $${price}

👉 Shop now: ${listingUrl}

P.S. Use code FIRST10 at checkout for 10% off your first order!

Thanks for supporting our small business!`,

      follow_up: `Hey! Just a quick reminder that our ${keyword} t-shirt is still available! ❤️

Don't miss out - grab yours before they're gone!

${listingUrl}`
    },

    influencer_outreach: {
      message_template: `Hi [Name]!

I love your content about [niche]! I just launched a ${keyword} t-shirt design and thought it might resonate with your audience.

Would you be interested in a collaboration? I'd love to send you a free shirt and offer your followers a special discount code!

Let me know if you're interested!

[Your Name]`,

      criteria: `Look for influencers with:
- 5K - 100K followers
- Audience interested in ${keyword}
- High engagement rate (>3%)
- Authentic content style`
    },

    paid_advertising: {
      facebook_ads: {
        campaign_objective: 'Conversions',
        ad_copy: `Love ${keyword}? This shirt is for you! ❤️\n\nPremium quality | Fast shipping | Perfect gift\n\nShop now!`,
        daily_budget: '$10',
        targeting: `Interest: ${keyword}, t-shirts, Etsy, online shopping`,
        expected_roi: '2-3x with good creative'
      },

      google_ads: {
        keywords: [
          `${keyword} shirt`,
          `${keyword} t-shirt`,
          `${keyword} gift`,
          `${keyword} tee`,
          `best ${keyword} shirt`
        ],
        ad_copy: `${keyword.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} T-Shirt | Premium Quality | Fast Shipping | Perfect Gift Idea`,
        daily_budget: '$5-10'
      }
    }
  };
}

// ============================================
// MAIN AUTOMATION ENDPOINT
// ============================================

/**
 * POST /api/full-automation/run
 * Run complete automation pipeline for personal account items
 */
router.post('/run', async (req, res) => {
  try {
    const {
      product_keywords = [], // Specific products to process, or empty for all queued
      max_products = 3,
      generate_designs = true,
      create_listings = true,
      generate_marketing = true,
      printful_api_key = process.env.PRINTFUL_API_KEY
    } = req.body;

    const automationRun = {
      run_id: `run_${Date.now()}`,
      started_at: new Date().toISOString(),
      config: {
        max_products,
        generate_designs,
        create_listings,
        generate_marketing
      },
      results: {
        products_processed: 0,
        designs_generated: 0,
        listings_created: 0,
        marketing_campaigns: 0
      },
      products: [],
      errors: []
    };

    // Load products from personal account
    const launched = loadLaunchedProducts();
    let productsToProcess = launched.products.filter(p => p.status === 'queued');

    // Filter by specific keywords if provided
    if (product_keywords.length > 0) {
      productsToProcess = productsToProcess.filter(p =>
        product_keywords.some(kw => p.keyword.toLowerCase().includes(kw.toLowerCase()))
      );
    }

    // Limit to max_products
    productsToProcess = productsToProcess.slice(0, max_products);

    console.log(`🤖 Processing ${productsToProcess.length} products...`);

    // Process each product
    for (const product of productsToProcess) {
      const productResult = {
        keyword: product.keyword,
        product_name: product.product_name,
        design: null,
        printful: null,
        etsy_listing: null,
        shopify_listing: null,
        marketing: null,
        status: 'processing'
      };

      try {
        // STEP 1: Generate Design Specification
        if (generate_designs) {
          console.log(`🎨 Generating design for: ${product.keyword}`);
          productResult.design = generateDesignSpecification(product);
          automationRun.results.designs_generated++;
        }

        // STEP 2: Create Printful Product (if API key available)
        if (generate_designs && productResult.design) {
          console.log(`📦 Creating Printful product: ${product.keyword}`);
          productResult.printful = await createPrintfulProduct(productResult.design, printful_api_key);
        }

        // STEP 3: Generate Marketplace Listings
        if (create_listings) {
          console.log(`🏪 Generating listings for: ${product.keyword}`);
          productResult.etsy_listing = generateEtsyListing(product, productResult.design);
          productResult.shopify_listing = generateShopifyListing(product, productResult.design);
          automationRun.results.listings_created += 2;
        }

        // STEP 4: Generate Marketing Campaign
        if (generate_marketing) {
          console.log(`📢 Generating marketing for: ${product.keyword}`);
          productResult.marketing = generateMarketingCampaign(product);
          automationRun.results.marketing_campaigns++;
        }

        productResult.status = 'completed';
        automationRun.results.products_processed++;

        // Update product status in file
        const productIndex = launched.products.findIndex(p => p.keyword === product.keyword);
        if (productIndex !== -1) {
          launched.products[productIndex].status = 'in_progress';
          launched.products[productIndex].automation_run_id = automationRun.run_id;
          launched.products[productIndex].processed_at = new Date().toISOString();
        }

      } catch (error) {
        productResult.status = 'error';
        productResult.error = error.message;
        automationRun.errors.push({
          product: product.keyword,
          error: error.message
        });
      }

      automationRun.products.push(productResult);
    }

    // Save updated products
    launched.last_updated = new Date().toISOString();
    saveLaunchedProducts(launched);

    // Save automation log
    automationRun.completed_at = new Date().toISOString();
    automationRun.duration_seconds = Math.round((new Date() - new Date(automationRun.started_at)) / 1000);

    const log = loadAutomationLog();
    log.runs.unshift(automationRun);
    log.runs = log.runs.slice(0, 50); // Keep last 50 runs
    log.total_products_created += automationRun.results.products_processed;
    saveAutomationLog(log);

    res.json({
      success: true,
      message: `✅ Automation complete! Processed ${automationRun.results.products_processed} products`,
      run_id: automationRun.run_id,
      summary: automationRun.results,
      products: automationRun.products,
      errors: automationRun.errors,
      next_steps: [
        '1. Review design specifications and create designs using Canva/AI',
        '2. Upload designs to Printful',
        '3. Use generated Etsy/Shopify listings to list products',
        '4. Launch marketing campaigns using provided templates',
        '5. Track sales with /api/personal/sales'
      ],
      automation_tips: [
        '💡 Create all designs in batch using Canva bulk create',
        '🎨 Use AI tools like DALL-E or Midjourney for faster design creation',
        '📊 Test different designs and track which ones sell best',
        '🚀 Launch 2-3 products per week for consistent growth'
      ]
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Automation failed',
      error: error.message
    });
  }
});

/**
 * GET /api/full-automation/status
 * Get automation status and dashboard
 */
router.get('/status', async (req, res) => {
  try {
    const log = loadAutomationLog();
    const launched = loadLaunchedProducts();

    const statusByProduct = {};
    launched.products.forEach(p => {
      statusByProduct[p.status] = (statusByProduct[p.status] || 0) + 1;
    });

    const lastRun = log.runs[0] || null;

    res.json({
      success: true,
      overview: {
        total_automation_runs: log.runs.length,
        total_products_created: log.total_products_created,
        products_in_queue: statusByProduct.queued || 0,
        products_in_progress: statusByProduct.in_progress || 0,
        products_launched: statusByProduct.launched || 0
      },
      last_run: lastRun ? {
        run_id: lastRun.run_id,
        timestamp: lastRun.started_at,
        products_processed: lastRun.results.products_processed,
        duration: `${lastRun.duration_seconds} seconds`,
        status: lastRun.errors.length === 0 ? '✅ Success' : '⚠️ Completed with errors'
      } : null,
      products_by_status: statusByProduct,
      recommendations: [
        statusByProduct.queued > 0 ? `You have ${statusByProduct.queued} products ready to process` : '✅ No products in queue',
        statusByProduct.in_progress > 0 ? `${statusByProduct.in_progress} products need designs uploaded to Printful` : '✅ All in-progress products addressed',
        'Run automation weekly to keep finding new trending products',
        'Track which products sell best and create variations'
      ]
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * POST /api/full-automation/schedule
 * Schedule automated runs
 */
router.post('/schedule', async (req, res) => {
  try {
    const {
      enabled = true,
      frequency = 'weekly', // daily, weekly, biweekly
      day = 'monday',
      time = '09:00',
      max_products = 3
    } = req.body;

    const schedule = {
      enabled,
      frequency,
      day,
      time,
      max_products,
      created_at: new Date().toISOString(),
      next_run: calculateNextRun(frequency, day, time)
    };

    writeFileSync(SCHEDULE_FILE, JSON.stringify(schedule, null, 2));

    res.json({
      success: true,
      message: 'Automation schedule configured',
      schedule,
      note: 'Set up a cron job or use a task scheduler to hit /api/full-automation/run at the scheduled time'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

function calculateNextRun(frequency, day, time) {
  const now = new Date();
  const [hours, minutes] = time.split(':').map(Number);

  if (frequency === 'daily') {
    const next = new Date(now);
    next.setHours(hours, minutes, 0, 0);
    if (next <= now) next.setDate(next.getDate() + 1);
    return next.toISOString();
  }

  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const targetDay = days.indexOf(day.toLowerCase());
  const currentDay = now.getDay();

  let daysUntil = targetDay - currentDay;
  if (daysUntil < 0) daysUntil += 7;
  if (frequency === 'biweekly') daysUntil += 7;

  const next = new Date(now);
  next.setDate(now.getDate() + daysUntil);
  next.setHours(hours, minutes, 0, 0);

  return next.toISOString();
}

export default router;
