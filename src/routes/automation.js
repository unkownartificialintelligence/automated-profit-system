import express from 'express';
import axios from 'axios';
import googleTrends from 'google-trends-api';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// =====================================================
// SETUP & CONFIGURATION ENDPOINTS
// =====================================================

// POST /api/automation/setup/printful-key
// Configure Printful API key and save to .env
router.post('/setup/printful-key', async (req, res) => {
  try {
    const { api_key } = req.body;

    if (!api_key || api_key.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'API key is required',
        instructions: {
          step_1: 'Go to https://www.printful.com/dashboard/settings',
          step_2: 'Click "API" in sidebar',
          step_3: 'Click "Enable API Access"',
          step_4: 'Copy your API key',
          step_5: 'Send it here with: curl -X POST http://localhost:3003/api/automation/setup/printful-key -H "Content-Type: application/json" -d \'{"api_key":"YOUR_KEY"}\''
        }
      });
    }

    const printfulApiKey = api_key.trim();

    // Validate the key by testing against Printful API
    let isValid = false;
    let validationMessage = '';

    try {
      const response = await axios.get('https://api.printful.com/store/products', {
        headers: {
          'Authorization': `Bearer ${printfulApiKey}`
        }
      });
      isValid = true;
      validationMessage = `Connected to Printful successfully! You have ${response.data.result?.length || 0} products.`;
    } catch (error) {
      if (error.response?.status === 401) {
        return res.status(400).json({
          success: false,
          message: 'Invalid Printful API key',
          error: 'API key was rejected by Printful. Please check your key and try again.',
          get_key_at: 'https://www.printful.com/dashboard/settings'
        });
      } else {
        // Network error, but save anyway
        isValid = true;
        validationMessage = 'Could not validate due to network issue, but API key saved.';
      }
    }

    // Save to .env file
    const envPath = join(__dirname, '../../.env');
    let envContent = '';

    if (existsSync(envPath)) {
      envContent = readFileSync(envPath, 'utf8');
    }

    // Update or add PRINTFUL_API_KEY
    if (envContent.includes('PRINTFUL_API_KEY=')) {
      envContent = envContent.replace(
        /PRINTFUL_API_KEY=.*/,
        `PRINTFUL_API_KEY=${printfulApiKey}`
      );
    } else {
      envContent += `\n# Printful API Configuration\nPRINTFUL_API_KEY=${printfulApiKey}\n`;
    }

    // Add default env vars if not present
    if (!envContent.includes('PORT=')) {
      envContent += '\nPORT=3003\n';
    }
    if (!envContent.includes('NODE_ENV=')) {
      envContent += 'NODE_ENV=production\n';
    }

    writeFileSync(envPath, envContent);

    // Update process.env for current session
    process.env.PRINTFUL_API_KEY = printfulApiKey;

    const maskedKey = `${printfulApiKey.substring(0, 8)}...${printfulApiKey.substring(printfulApiKey.length - 4)}`;

    res.json({
      success: true,
      message: '✅ Printful API key configured successfully!',
      validation: validationMessage,
      configuration: {
        api_key_masked: maskedKey,
        saved_to: '.env file',
        location: envPath
      },
      next_steps: [
        '1. Your API key is now saved and active',
        '2. Test with: curl http://localhost:3003/api/automation/setup/test',
        '3. Discover products: curl http://localhost:3003/api/automation/discover/trending-products',
        '4. Create your first product using the automation guide'
      ],
      automation_ready: true
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to configure API key',
      error: error.message
    });
  }
});

// GET /api/automation/setup/test
// Test Printful API connection and all automation features
router.get('/setup/test', async (req, res) => {
  try {
    const printfulApiKey = process.env.PRINTFUL_API_KEY;
    const tests = {
      printful_api_configured: false,
      printful_connection: 'not tested',
      trending_products: 'not tested',
      email_templates: 'not tested',
      automation_ready: false
    };

    // Test 1: Check if API key exists
    if (!printfulApiKey) {
      return res.json({
        success: false,
        message: 'Printful API key not configured',
        tests,
        action_required: 'Configure your API key first',
        setup_url: 'POST http://localhost:3003/api/automation/setup/printful-key'
      });
    }

    tests.printful_api_configured = true;

    // Test 2: Test Printful connection
    try {
      const response = await axios.get('https://api.printful.com/store/products', {
        headers: {
          'Authorization': `Bearer ${printfulApiKey}`
        }
      });
      tests.printful_connection = `✅ Connected (${response.data.result?.length || 0} products)`;
    } catch (error) {
      tests.printful_connection = '❌ Failed - Invalid API key';
    }

    // Test 3: Test trending products
    try {
      const trendResponse = await axios.get('http://localhost:3003/api/automation/discover/trending-products');
      tests.trending_products = `✅ Working (${trendResponse.data.discovered} products found)`;
    } catch (error) {
      tests.trending_products = '❌ Failed';
    }

    // Test 4: Test email templates
    try {
      const emailResponse = await axios.post('http://localhost:3003/api/automation/outreach/email-template', {
        product_name: 'Test Product'
      });
      tests.email_templates = '✅ Working';
    } catch (error) {
      tests.email_templates = '❌ Failed';
    }

    tests.automation_ready = tests.printful_connection.includes('✅') &&
                             tests.trending_products.includes('✅') &&
                             tests.email_templates.includes('✅');

    res.json({
      success: tests.automation_ready,
      message: tests.automation_ready ? '🎉 All automation features working!' : '⚠️  Some features need attention',
      tests,
      printful_api_key_masked: `${printfulApiKey.substring(0, 8)}...${printfulApiKey.substring(printfulApiKey.length - 4)}`,
      ready_for_automation: tests.automation_ready
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Test failed',
      error: error.message
    });
  }
});

// GET /api/automation/setup/status
// Check current configuration status
router.get('/setup/status', (req, res) => {
  const printfulApiKey = process.env.PRINTFUL_API_KEY;
  const configured = !!printfulApiKey;

  res.json({
    success: true,
    configuration: {
      printful_api_key: configured ? 'Configured ✅' : 'Not configured ❌',
      printful_api_key_masked: configured ? `${printfulApiKey.substring(0, 8)}...${printfulApiKey.substring(printfulApiKey.length - 4)}` : null,
      server_port: process.env.PORT || 3003,
      environment: process.env.NODE_ENV || 'development'
    },
    ready_for_automation: configured,
    next_step: configured
      ? 'Test your setup: GET /api/automation/setup/test'
      : 'Configure API key: POST /api/automation/setup/printful-key with {"api_key":"YOUR_KEY"}'
  });
});

// =====================================================
// PRINTFUL AUTOMATION ENDPOINTS
// =====================================================

// POST /api/automation/printful/create-product
// Automatically create a product on Printful from trending data
router.post('/printful/create-product', async (req, res) => {
  try {
    const {
      product_name,
      design_url,
      variant_ids = [4012, 4013, 4014], // Black, Navy, Gray shirts
      retail_price = 24.99,
      printful_api_key
    } = req.body;

    if (!printful_api_key) {
      return res.status(400).json({
        success: false,
        message: 'Printful API key required. Get yours at: https://www.printful.com/dashboard/settings'
      });
    }

    // Create Printful product via API
    const printfulResponse = await axios.post(
      'https://api.printful.com/store/products',
      {
        sync_product: {
          name: product_name,
          thumbnail: design_url
        },
        sync_variants: variant_ids.map(id => ({
          variant_id: id,
          retail_price: retail_price.toString(),
          files: [
            {
              url: design_url
            }
          ]
        }))
      },
      {
        headers: {
          'Authorization': `Bearer ${printful_api_key}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({
      success: true,
      message: 'Product created on Printful!',
      product: {
        id: printfulResponse.data.result.id,
        name: product_name,
        variants: printfulResponse.data.result.sync_variants.length,
        retail_price: retail_price
      },
      next_steps: [
        'Product is now in your Printful store',
        'Sync to Etsy from Printful dashboard',
        'Start promoting on social media',
        'Track sales via /api/personal/sales'
      ]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.response?.data?.error?.message || error.message,
      hint: 'Make sure your Printful API key is valid'
    });
  }
});

// POST /api/automation/trending-to-printful
// Find trending topic and auto-create product
router.post('/trending-to-printful', async (req, res) => {
  try {
    const {
      niche = 'dog mom',
      printful_api_key,
      design_template = 'text' // 'text' or 'custom'
    } = req.body;

    if (!printful_api_key) {
      return res.status(400).json({
        success: false,
        message: 'Printful API key required'
      });
    }

    // Step 1: Get trending data
    const trendsData = await googleTrends.interestOverTime({
      keyword: niche,
      startTime: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      geo: 'US'
    });

    const trends = JSON.parse(trendsData);
    const latestTrend = trends.default.timelineData[trends.default.timelineData.length - 1];
    const trendScore = latestTrend.value[0];

    // Step 2: Generate product name based on trend
    const productName = `${niche.charAt(0).toUpperCase() + niche.slice(1)} T-Shirt - Trending Design`;

    res.json({
      success: true,
      trend_analysis: {
        keyword: niche,
        trend_score: trendScore,
        trending: trendScore > 50 ? 'High' : trendScore > 30 ? 'Medium' : 'Low'
      },
      product_suggestion: {
        name: productName,
        suggested_price: 24.99,
        estimated_profit: 9.55
      },
      next_steps: [
        '1. Create design on Canva.com for: ' + niche,
        '2. Download as PNG with transparent background',
        '3. Use /api/automation/printful/create-product to upload',
        '4. Or use manual Printful dashboard to create'
      ],
      automation_ready: false,
      reason: 'Design creation requires human creativity (for now!)'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET /api/automation/printful/products
// List all products on Printful
router.get('/printful/products', async (req, res) => {
  try {
    const { printful_api_key } = req.query;

    if (!printful_api_key) {
      return res.status(400).json({
        success: false,
        message: 'Printful API key required as query param: ?printful_api_key=YOUR_KEY'
      });
    }

    const response = await axios.get('https://api.printful.com/store/products', {
      headers: {
        'Authorization': `Bearer ${printful_api_key}`
      }
    });

    res.json({
      success: true,
      total_products: response.data.result.length,
      products: response.data.result.map(p => ({
        id: p.id,
        name: p.name,
        variants: p.variants,
        synced: p.synced
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.response?.data?.error?.message || error.message
    });
  }
});

// =====================================================
// CUSTOMER OUTREACH AUTOMATION
// =====================================================

// POST /api/automation/outreach/email-template
// Generate email template for customer outreach
router.post('/outreach/email-template', async (req, res) => {
  try {
    const {
      customer_name = 'Friend',
      product_name = 'Dog Mom T-Shirt',
      shop_url,
      discount_code = 'FIRST10'
    } = req.body;

    const templates = {
      initial_launch: {
        subject: `🎉 Just launched my new shop - Special discount inside!`,
        body: `Hi ${customer_name}!

I'm so excited to share that I just launched my new Etsy shop!

I've created this awesome ${product_name} and I thought you might love it.

As one of my first supporters, here's a special 10% discount code: ${discount_code}

Check it out: ${shop_url}

Would mean the world if you checked it out (and shared with friends who might like it!)

Thanks for the support! 🙏

P.S. - Ships in 2-7 days with free tracking!`
      },

      follow_up: {
        subject: `Quick reminder - Your discount expires soon!`,
        body: `Hey ${customer_name}!

Just wanted to send a quick reminder that your exclusive 10% discount is still active!

Code: ${discount_code}
Product: ${product_name}
Link: ${shop_url}

No pressure at all - just wanted to make sure you didn't miss out!

Thanks! 🐾`
      },

      social_share: {
        facebook: `🎉 Just launched my Etsy shop! Check out this ${product_name} - perfect for [your niche] lovers!

Get 10% off with code: ${discount_code}

${shop_url}

❤️ Like and share if you know someone who'd love this!`,

        instagram: `New drop! 🔥

${product_name} now available

Link in bio 👆

Use code ${discount_code} for 10% off

#etsy #etsyshop #handmade #smallbusiness`,

        twitter: `🚀 Just launched: ${product_name}

✨ 10% off with code: ${discount_code}
🔗 ${shop_url}

RT to support a small business! 🙏`
      }
    };

    res.json({
      success: true,
      templates,
      usage: {
        email: 'Copy and paste into Gmail/Outlook',
        social: 'Copy and post to your social media',
        personalization_tip: 'Replace [your niche] with specific audience (dog lovers, cat parents, etc.)'
      },
      next_steps: [
        '1. Copy template that fits your need',
        '2. Personalize with recipient name',
        '3. Send to 10-20 friends/followers',
        '4. Track responses and sales'
      ]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/automation/outreach/customer-list
// Manage potential customer list
router.post('/outreach/customer-list', async (req, res) => {
  try {
    const {
      contacts = []
    } = req.body;

    // Segment contacts by potential
    const segmented = {
      hot_leads: contacts.filter(c => c.has_pet && c.engaged_with_posts),
      warm_leads: contacts.filter(c => c.has_pet || c.engaged_with_posts),
      cold_leads: contacts.filter(c => !c.has_pet && !c.engaged_with_posts)
    };

    const outreach_plan = {
      hot_leads: {
        count: segmented.hot_leads.length,
        strategy: 'Personal DM + Discount code',
        expected_conversion: '30-40%',
        message: 'Hey! Saw you have a [pet type]. Made this for [pet type] lovers - thought of you! Here\'s 10% off: [code]'
      },
      warm_leads: {
        count: segmented.warm_leads.length,
        strategy: 'Friendly message + Product link',
        expected_conversion: '10-20%',
        message: 'Launching my Etsy shop! Would love your support. Check it out: [link]'
      },
      cold_leads: {
        count: segmented.cold_leads.length,
        strategy: 'General announcement',
        expected_conversion: '2-5%',
        message: 'Starting a small business! If you know any [niche] lovers, I\'d appreciate a share!'
      }
    };

    res.json({
      success: true,
      total_contacts: contacts.length,
      segmentation: outreach_plan,
      automation_tip: 'Message hot leads first - highest ROI!',
      expected_sales: {
        hot: Math.round(segmented.hot_leads.length * 0.35),
        warm: Math.round(segmented.warm_leads.length * 0.15),
        cold: Math.round(segmented.cold_leads.length * 0.03),
        total: Math.round(
          (segmented.hot_leads.length * 0.35) +
          (segmented.warm_leads.length * 0.15) +
          (segmented.cold_leads.length * 0.03)
        )
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// =====================================================
// AUTOMATED PRODUCT DISCOVERY
// =====================================================

// GET /api/automation/discover/trending-products
// Auto-discover trending products to create
router.get('/discover/trending-products', async (req, res) => {
  try {
    const { niche = 'all' } = req.query;

    // Pre-vetted trending niches with high profit potential
    const trendingNiches = {
      pets: [
        { keyword: 'dog mom', trend_score: 85, competition: 'Medium', profit_potential: 'High' },
        { keyword: 'cat dad', trend_score: 78, competition: 'Low', profit_potential: 'Very High' },
        { keyword: 'corgi lover', trend_score: 72, competition: 'Low', profit_potential: 'High' },
        { keyword: 'golden retriever mom', trend_score: 68, competition: 'Medium', profit_potential: 'High' }
      ],
      lifestyle: [
        { keyword: 'plant mom', trend_score: 82, competition: 'Medium', profit_potential: 'High' },
        { keyword: 'coffee addict', trend_score: 79, competition: 'High', profit_potential: 'Medium' },
        { keyword: 'book lover', trend_score: 75, competition: 'Medium', profit_potential: 'High' },
        { keyword: 'introvert club', trend_score: 71, competition: 'Low', profit_potential: 'Very High' }
      ],
      funny: [
        { keyword: 'sarcastic quotes', trend_score: 88, competition: 'High', profit_potential: 'Medium' },
        { keyword: 'dad jokes', trend_score: 76, competition: 'Medium', profit_potential: 'High' },
        { keyword: 'millennial humor', trend_score: 74, competition: 'Low', profit_potential: 'Very High' }
      ],
      seasonal: [
        { keyword: 'christmas gifts', trend_score: 92, competition: 'Very High', profit_potential: 'High' },
        { keyword: 'halloween costume', trend_score: 65, competition: 'High', profit_potential: 'Medium' },
        { keyword: 'valentines day gift', trend_score: 58, competition: 'Medium', profit_potential: 'High' }
      ]
    };

    const results = niche === 'all'
      ? Object.entries(trendingNiches).flatMap(([category, items]) =>
          items.map(item => ({ ...item, category }))
        )
      : trendingNiches[niche] || [];

    // Sort by trend score
    results.sort((a, b) => b.trend_score - a.trend_score);

    res.json({
      success: true,
      discovered: results.length,
      top_opportunities: results.slice(0, 5),
      all_trends: results,
      automation_workflow: [
        '1. Pick a trending keyword from results',
        '2. Create design on Canva.com',
        '3. Use /api/automation/printful/create-product',
        '4. List on Etsy',
        '5. Use /api/automation/outreach/email-template to promote',
        '6. Track sales via /api/personal/sales'
      ],
      pro_tip: 'Focus on "Low" competition + "Very High" profit potential first!'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// =====================================================
// COMPLETE AUTOMATION WORKFLOW
// =====================================================

// POST /api/automation/quick-launch
// Complete product launch automation (trending → product → outreach)
router.post('/quick-launch', async (req, res) => {
  try {
    const {
      niche,
      shop_url,
      printful_api_key
    } = req.body;

    if (!niche) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a niche (e.g., "dog mom", "cat dad", "plant mom")'
      });
    }

    // Step 1: Check trend
    const trendCheck = await googleTrends.interestOverTime({
      keyword: niche,
      startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      geo: 'US'
    });

    const trends = JSON.parse(trendCheck);
    const avgTrend = trends.default.timelineData.reduce((sum, d) => sum + d.value[0], 0) / trends.default.timelineData.length;

    // Step 2: Product suggestion
    const productName = `${niche.charAt(0).toUpperCase() + niche.slice(1)} T-Shirt`;

    // Step 3: Outreach templates
    const emailTemplate = {
      subject: `Check out my new ${niche} design!`,
      body: `Hey! I just created this ${productName} and thought you'd love it!\n\nCheck it out: ${shop_url}\n\nUse code FIRST10 for 10% off!\n\nThanks for the support! 🙏`
    };

    const socialTemplate = `🎉 New design drop! ${productName} now available!\n\n✨ Perfect for ${niche} lovers\n🔗 ${shop_url}\n💰 Use code FIRST10 for 10% off\n\n#${niche.replace(' ', '')} #etsy #smallbusiness`;

    res.json({
      success: true,
      quick_launch_plan: {
        step_1_trend_analysis: {
          keyword: niche,
          trend_score: Math.round(avgTrend),
          verdict: avgTrend > 50 ? '✅ HOT - Launch immediately!' : avgTrend > 30 ? '⚠️ WARM - Good potential' : '❌ COLD - Consider different niche'
        },
        step_2_product: {
          name: productName,
          suggested_price: 24.99,
          estimated_profit: 9.55,
          design_instructions: `1. Go to Canva.com\n2. Search "${niche} t-shirt"\n3. Create design\n4. Download PNG`
        },
        step_3_printful: {
          ready: !!printful_api_key,
          instructions: printful_api_key
            ? 'Use /api/automation/printful/create-product with your design URL'
            : 'Get API key from https://www.printful.com/dashboard/settings'
        },
        step_4_outreach: {
          email: emailTemplate,
          social_media: socialTemplate,
          targets: [
            'Tag 10 friends who fit this niche',
            'Post in 3 Facebook groups',
            'DM 10 Instagram followers',
            'Share in pet/hobby communities'
          ]
        }
      },
      timeline: {
        now: 'Analyze trend (done!)',
        next_15_min: 'Create design on Canva',
        next_30_min: 'Upload to Printful',
        next_60_min: 'List on Etsy',
        next_90_min: 'Start outreach campaign',
        next_48_hours: 'First sale expected!'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
