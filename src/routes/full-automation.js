import express from 'express';
import axios from 'axios';
import { createCanvaDesign, exportCanvaDesign, downloadDesignFile, batchCreateDesigns } from '../integrations/canva-api.js';
import { createPrintfulProduct, batchCreateProducts } from '../integrations/printful-api.js';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const router = express.Router();

/**
 * POST /api/full-automation/run
 * Complete end-to-end automation: Discover → Design → List → Market
 *
 * This is THE endpoint that does everything automatically!
 */
router.post('/run', async (req, res) => {
  const startTime = Date.now();
  let pipeline = null; // Initialize outside try block for error handling

  try {
    const {
      use_todays_products = true,
      max_products = 3,
      skip_design = false,
      skip_listing = false,
      skip_marketing = false
    } = req.body;

    pipeline = {
      started_at: new Date().toISOString(),
      products: { status: 'pending', data: [] },
      designs: { status: 'pending', data: [] },
      listings: { status: 'pending', data: [] },
      marketing: { status: 'pending', data: [] },
      summary: {}
    };

    console.log('🚀 Starting full automation pipeline...');

    // STEP 1: Get products
    console.log('📦 Step 1/4: Fetching products...');
    pipeline.products.status = 'in_progress';

    let products;
    if (use_todays_products) {
      const response = await axios.get('http://localhost:3003/api/christmas/today');
      products = response.data.data.products.slice(0, max_products);
    } else {
      // Discover new trending products
      const response = await axios.post('http://localhost:3003/api/auto-launch/discover-and-queue', {
        max_products,
        min_trend_score: 70
      });
      products = response.data.products;
    }

    pipeline.products = {
      status: 'completed',
      count: products.length,
      data: products.map(p => ({
        name: p.product_name,
        keyword: p.keyword,
        price: p.price_recommendation,
        profit_per_sale: p.profit_per_sale
      }))
    };

    console.log(`✅ Found ${products.length} products`);

    // STEP 2: Auto-create designs in Canva
    if (!skip_design) {
      console.log('🎨 Step 2/4: Creating designs in Canva...');
      pipeline.designs.status = 'in_progress';

      const designResults = [];

      for (const product of products) {
        console.log(`   Creating design for: ${product.product_name}`);

        const design = await createCanvaDesign({
          keyword: product.keyword,
          product_name: product.product_name,
          price: product.price_recommendation
        });

        // If design was auto-generated, export it
        if (design.auto_generated && design.design_id && design.design_id !== 'mock') {
          console.log(`   Exporting design: ${design.design_id}`);
          const exported = await exportCanvaDesign(design.design_id);
          design.export_result = exported;

          // Download design file
          if (exported.export_url) {
            const downloaded = await downloadDesignFile(exported.export_url, product.product_name);
            design.file_path = downloaded.file_path;
          }
        }

        designResults.push({
          product: product.product_name,
          design_id: design.design_id,
          auto_generated: design.auto_generated,
          file_path: design.file_path,
          edit_url: design.edit_url,
          status: design.auto_generated ? 'auto_created' : 'manual_required'
        });
      }

      pipeline.designs = {
        status: 'completed',
        count: designResults.length,
        auto_generated: designResults.filter(d => d.auto_generated).length,
        manual_required: designResults.filter(d => !d.auto_generated).length,
        data: designResults
      };

      console.log(`✅ Created ${designResults.length} designs`);
    } else {
      pipeline.designs = { status: 'skipped', reason: 'User requested to skip' };
    }

    // STEP 3: Auto-list on Printful
    if (!skip_listing && pipeline.designs.status === 'completed') {
      console.log('📦 Step 3/4: Listing products on Printful...');
      pipeline.listings.status = 'in_progress';

      const listingResults = [];

      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        const design = pipeline.designs.data[i];

        console.log(`   Listing: ${product.product_name}`);

        const listing = await createPrintfulProduct(
          {
            product_name: product.product_name,
            price: product.price_recommendation,
            keyword: product.keyword,
            description: product.description || product.product_name
          },
          design
        );

        listingResults.push({
          product: product.product_name,
          product_id: listing.product_id,
          auto_listed: listing.auto_listed,
          dashboard_url: listing.dashboard_url,
          status: listing.auto_listed ? 'listed' : 'manual_required'
        });
      }

      pipeline.listings = {
        status: 'completed',
        count: listingResults.length,
        auto_listed: listingResults.filter(l => l.auto_listed).length,
        manual_required: listingResults.filter(l => !l.auto_listed).length,
        data: listingResults
      };

      console.log(`✅ Listed ${listingResults.length} products`);
    } else if (skip_listing) {
      pipeline.listings = { status: 'skipped', reason: 'User requested to skip' };
    } else {
      pipeline.listings = { status: 'skipped', reason: 'Designs not ready' };
    }

    // STEP 4: Auto-generate marketing campaigns
    if (!skip_marketing) {
      console.log('📢 Step 4/4: Generating marketing campaigns...');
      pipeline.marketing.status = 'in_progress';

      const marketingResults = [];

      for (let i = 0; i < products.length; i++) {
        console.log(`   Creating campaign for: ${products[i].product_name}`);

        const campaign = await axios.get(`http://localhost:3003/api/christmas/marketing/${i}`);

        marketingResults.push({
          product: products[i].product_name,
          campaign_ready: true,
          channels: campaign.data.marketing_campaign ? Object.keys(campaign.data.marketing_campaign) : [],
          api_endpoint: `/api/christmas/marketing/${i}`
        });
      }

      pipeline.marketing = {
        status: 'completed',
        count: marketingResults.length,
        data: marketingResults
      };

      console.log(`✅ Generated ${marketingResults.length} marketing campaigns`);
    } else {
      pipeline.marketing = { status: 'skipped', reason: 'User requested to skip' };
    }

    // Calculate summary
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);

    pipeline.summary = {
      total_products_processed: products.length,
      designs_created: pipeline.designs.auto_generated || 0,
      products_listed: pipeline.listings.auto_listed || 0,
      campaigns_generated: pipeline.marketing.count || 0,
      total_time_seconds: totalTime,
      automation_level: calculateAutomationLevel(pipeline),
      estimated_daily_revenue: calculateEstimatedRevenue(products),
      next_steps: generateNextSteps(pipeline)
    };

    pipeline.completed_at = new Date().toISOString();
    pipeline.success = true;

    // Save automation log
    saveAutomationLog(pipeline);

    console.log(`🎉 Full automation complete in ${totalTime}s`);

    res.json({
      success: true,
      message: '🚀 Full automation pipeline completed!',
      pipeline,
      quick_start: {
        designs_ready: pipeline.designs.auto_generated > 0,
        products_listed: pipeline.listings.auto_listed > 0,
        marketing_ready: pipeline.marketing.status === 'completed',
        time_saved: `Automated ${totalTime}s vs 30-60 min manual`
      }
    });

  } catch (error) {
    console.error('❌ Automation pipeline error:', error.message);

    res.status(500).json({
      success: false,
      error: error.message,
      pipeline,
      recovery_steps: [
        'Check API keys in .env file',
        'Verify server is running on port 3003',
        'Review error logs above',
        'Try running individual steps manually'
      ]
    });
  }
});

/**
 * POST /api/full-automation/quick-start
 * Fastest automation - today's top product only
 */
router.post('/quick-start', async (req, res) => {
  try {
    // Get today's top product (highest profit)
    const response = await axios.get('http://localhost:3003/api/christmas/today');
    const products = response.data.data.products;

    const topProduct = products.sort((a, b) => {
      const profitA = parseFloat(a.profit_per_sale.replace('$', ''));
      const profitB = parseFloat(b.profit_per_sale.replace('$', ''));
      return profitB - profitA;
    })[0];

    console.log(`🚀 Quick Start: ${topProduct.product_name}`);

    // Run automation for just this product
    const automationResponse = await axios.post('http://localhost:3003/api/full-automation/run', {
      use_todays_products: true,
      max_products: 1
    });

    res.json({
      success: true,
      message: '🎯 Quick Start Complete!',
      product: {
        name: topProduct.product_name,
        profit_per_sale: topProduct.profit_per_sale,
        daily_sales_estimate: topProduct.estimated_daily_sales
      },
      automation_result: automationResponse.data,
      next_step: `Check your dashboard: http://localhost:3003/api/dashboard`
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/full-automation/status
 * Get automation status and history
 */
router.get('/status', (req, res) => {
  try {
    const logFile = join(process.cwd(), 'data', 'automation-runs.json');

    if (!existsSync(logFile)) {
      return res.json({
        success: true,
        total_runs: 0,
        latest_run: null,
        automation_stats: {
          total_products_processed: 0,
          total_designs_created: 0,
          total_listings_created: 0,
          total_campaigns_generated: 0
        }
      });
    }

    const logs = JSON.parse(readFileSync(logFile, 'utf8'));
    const latestRun = logs.runs[0];

    const stats = {
      total_products_processed: 0,
      total_designs_created: 0,
      total_listings_created: 0,
      total_campaigns_generated: 0
    };

    logs.runs.forEach(run => {
      stats.total_products_processed += run.summary?.total_products_processed || 0;
      stats.total_designs_created += run.summary?.designs_created || 0;
      stats.total_listings_created += run.summary?.products_listed || 0;
      stats.total_campaigns_generated += run.summary?.campaigns_generated || 0;
    });

    res.json({
      success: true,
      total_runs: logs.runs.length,
      latest_run: latestRun,
      automation_stats: stats,
      api_status: {
        canva: process.env.CANVA_API_KEY ? '✅ Configured' : '⚠️ Not configured',
        printful: process.env.PRINTFUL_API_KEY ? '✅ Configured' : '⚠️ Not configured'
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Helper: Calculate automation level
 */
function calculateAutomationLevel(pipeline) {
  let level = 0;
  let total = 4;

  if (pipeline.products.status === 'completed') level++;
  if (pipeline.designs.auto_generated > 0) level++;
  if (pipeline.listings.auto_listed > 0) level++;
  if (pipeline.marketing.status === 'completed') level++;

  const percentage = ((level / total) * 100).toFixed(0);

  if (percentage === '100') return '100% - Fully Automated! 🎉';
  if (percentage >= '75') return `${percentage}% - Mostly Automated`;
  if (percentage >= '50') return `${percentage}% - Partially Automated`;
  return `${percentage}% - Manual Mode`;
}

/**
 * Helper: Calculate estimated revenue
 */
function calculateEstimatedRevenue(products) {
  const dailyLow = products.reduce((sum, p) => {
    const profit = parseFloat(p.profit_per_sale?.replace?.('$', '') || 0);
    const salesLow = parseInt(p.estimated_daily_sales?.split('-')?.[0] || 0);
    return sum + (profit * salesLow);
  }, 0);

  const dailyHigh = products.reduce((sum, p) => {
    const profit = parseFloat(p.profit_per_sale?.replace?.('$', '') || 0);
    const salesHigh = parseInt(p.estimated_daily_sales?.split('-')?.[1] || 0);
    return sum + (profit * salesHigh);
  }, 0);

  return `$${dailyLow.toFixed(0)}-${dailyHigh.toFixed(0)}/day`;
}

/**
 * Helper: Generate next steps
 */
function generateNextSteps(pipeline) {
  const steps = [];

  if (pipeline.designs.manual_required > 0) {
    steps.push(`Create ${pipeline.designs.manual_required} designs in Canva (see CANVA_AUTO_DESIGNS.md)`);
  }

  if (pipeline.listings.manual_required > 0) {
    steps.push(`List ${pipeline.listings.manual_required} products on Printful manually`);
  }

  if (pipeline.marketing.status === 'completed') {
    steps.push('Launch marketing campaigns (check /api/christmas/marketing/[0-2])');
  }

  if (steps.length === 0) {
    steps.push('All done! Start promoting and selling! 🎉');
  }

  return steps;
}

/**
 * Helper: Save automation log
 */
function saveAutomationLog(pipeline) {
  const logFile = join(process.cwd(), 'data', 'automation-runs.json');
  const dataDir = join(process.cwd(), 'data');

  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }

  let logs = { runs: [] };
  if (existsSync(logFile)) {
    logs = JSON.parse(readFileSync(logFile, 'utf8'));
  }

  logs.runs.unshift(pipeline);
  logs.runs = logs.runs.slice(0, 100); // Keep last 100 runs

  writeFileSync(logFile, JSON.stringify(logs, null, 2));
}

export default router;
