import express from 'express';
import axios from 'axios';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// =====================================================
// AUTOMATED DESIGN GENERATION
// =====================================================

// POST /api/full-automation/generate-design
// Automatically generate design specifications (ready for Canva API or text-based designs)
router.post('/generate-design', async (req, res) => {
  try {
    const { design_id = 2, custom_text = null } = req.body;

    // Get the design template
    const designResponse = await axios.get(`http://localhost:3003/api/christmas/design/${design_id}`);
    const designData = designResponse.data.design;

    // Generate ready-to-use design specs
    const generatedDesign = {
      success: true,
      design_ready: true,
      template_name: designData.name,

      // Text-based design (no Canva needed)
      text_design: {
        main_text: custom_text || designData.samplePuns?.[0] || designData.name,
        font_style: 'Bold Sans-Serif',
        font_size: '72pt',
        text_color: designData.colors[0],
        background_color: designData.colors[1],
        accent_color: designData.colors[2],
        layout: 'centered',
        orientation: 'landscape'
      },

      // Design file specifications
      file_specs: {
        format: 'PNG',
        dimensions: '4500x5400px', // Printful standard
        dpi: 300,
        color_mode: 'RGB',
        background: 'transparent'
      },

      // Quick CSS/HTML design (can be screenshot)
      html_design: `
<!DOCTYPE html>
<html>
<head>
<style>
  body {
    margin: 0;
    padding: 0;
    width: 4500px;
    height: 5400px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    font-family: 'Arial Black', sans-serif;
  }
  .design {
    text-align: center;
    color: ${designData.colors[0]};
    font-size: 200px;
    font-weight: bold;
    padding: 100px;
    text-shadow: 4px 4px 8px rgba(0,0,0,0.3);
    max-width: 3500px;
    line-height: 1.2;
  }
  .accent {
    color: ${designData.colors[2]};
    font-size: 120px;
    margin-top: 50px;
  }
</style>
</head>
<body>
  <div class="design">
    ${custom_text || designData.samplePuns?.[0] || designData.name}
    <div class="accent">🎄</div>
  </div>
</body>
</html>`,

      // Automated Canva link (if user still wants to use it)
      canva_link: designData.canvaKeywords ?
        `https://www.canva.com/search?q=${encodeURIComponent(designData.canvaKeywords)}` : null,

      // Alternative: Use free design tools
      alternative_tools: [
        {
          name: 'Photopea (Free Photoshop alternative)',
          url: 'https://www.photopea.com/',
          instructions: 'Paste the HTML design, screenshot at 300 DPI'
        },
        {
          name: 'GIMP (Free)',
          url: 'https://www.gimp.org/',
          instructions: 'Create new image 4500x5400, add text with provided specs'
        },
        {
          name: 'Text-to-Image Script',
          method: 'Use the provided HTML, open in browser, screenshot at high resolution'
        }
      ],

      next_steps: [
        '1. OPTION A: Copy the HTML design code',
        '2. Open in browser and screenshot at 300 DPI',
        '3. Or use the Canva link if you prefer visual editing',
        '4. Save as PNG with transparent background',
        '5. Upload to Printful using /api/full-automation/auto-list'
      ]
    };

    res.json(generatedDesign);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Design generation failed',
      error: error.message
    });
  }
});

// =====================================================
// ONE-CLICK PRODUCT LISTING
// =====================================================

// POST /api/full-automation/auto-list
// Automatically create and list product on Printful
router.post('/auto-list', async (req, res) => {
  try {
    const {
      design_id = 2,
      product_name,
      design_url, // User's uploaded design or we generate one
      printful_api_key = process.env.PRINTFUL_API_KEY,
      retail_price = 24.99
    } = req.body;

    if (!printful_api_key) {
      return res.status(400).json({
        success: false,
        message: 'Printful API key required',
        setup: 'POST /api/automation/setup/printful-key'
      });
    }

    // Get design data
    const designResponse = await axios.get(`http://localhost:3003/api/christmas/design/${design_id}`);
    const designData = designResponse.data.design;

    const finalProductName = product_name || `${designData.name} T-Shirt`;

    // Auto-create product on Printful
    const printfulPayload = {
      sync_product: {
        name: finalProductName,
        thumbnail: design_url
      },
      sync_variants: [
        { variant_id: 4012, retail_price: retail_price.toString(), files: [{ url: design_url }] }, // Black S
        { variant_id: 4013, retail_price: retail_price.toString(), files: [{ url: design_url }] }, // Black M
        { variant_id: 4014, retail_price: retail_price.toString(), files: [{ url: design_url }] }, // Black L
        { variant_id: 4016, retail_price: retail_price.toString(), files: [{ url: design_url }] }, // Black XL
        { variant_id: 4017, retail_price: retail_price.toString(), files: [{ url: design_url }] }, // Black 2XL
      ]
    };

    const printfulResponse = await axios.post(
      'https://api.printful.com/store/products',
      printfulPayload,
      {
        headers: {
          'Authorization': `Bearer ${printful_api_key}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Generate Etsy listing template
    const etsyListing = {
      title: `${finalProductName} - Funny Christmas Gift - Holiday Shirt`,
      description: `
🎄 ${finalProductName}

Perfect for the holiday season! This hilarious Christmas design is sure to bring smiles and laughs.

✨ FEATURES:
• Premium quality Bella+Canvas 3001 t-shirt
• Soft, comfortable 100% cotton
• Multiple sizes available (S-2XL)
• Vibrant, long-lasting print
• Ships in 2-7 business days

🎁 PERFECT GIFT FOR:
${designData.targetAudience}

💝 GREAT FOR:
• Christmas parties
• Ugly sweater alternatives
• Holiday family photos
• Casual festive wear

📦 SHIPPING:
Fast, reliable shipping via Printful. Tracking included!

🌟 QUALITY GUARANTEE:
If you're not 100% satisfied, we'll make it right.

Tags: christmas, christmas shirt, funny christmas, holiday gift, christmas present, festive clothing
      `,
      tags: [
        'christmas',
        'christmas gift',
        'funny christmas',
        'holiday shirt',
        'christmas tee',
        'festive clothing',
        'christmas present',
        'xmas gift',
        'holiday tee',
        'christmas humor',
        'funny holiday',
        'christmas party',
        'ugly sweater'
      ],
      price: retail_price,
      quantity: 999, // Printful handles fulfillment
      category: 'Clothing > Shirts > T-shirts'
    };

    res.json({
      success: true,
      message: '🎉 Product auto-listed successfully!',
      printful: {
        product_id: printfulResponse.data.result.id,
        name: finalProductName,
        variants: printfulResponse.data.result.sync_variants.length,
        status: 'Created on Printful'
      },
      etsy_listing_template: etsyListing,
      next_steps: [
        '✅ Product created on Printful',
        '📋 Copy the Etsy listing template above',
        '🔗 Connect Printful to Etsy in Printful dashboard',
        '📤 Sync product to Etsy (automatic)',
        '🚀 Or manually create Etsy listing with the template',
        '💰 Start promoting with /api/full-automation/auto-promote'
      ],
      estimated_profit: {
        retail_price: retail_price,
        printful_cost: designData.pricing.tshirt.cost,
        estimated_profit: (retail_price - designData.pricing.tshirt.cost - 2.30).toFixed(2), // Including fees
        profit_margin: (((retail_price - designData.pricing.tshirt.cost - 2.30) / retail_price) * 100).toFixed(1) + '%'
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Auto-listing failed',
      error: error.response?.data?.error?.message || error.message,
      hint: 'Make sure your Printful API key is valid and design_url is accessible'
    });
  }
});

// =====================================================
// AUTOMATED PROMOTION
// =====================================================

// POST /api/full-automation/auto-promote
// Generate complete promotion campaign
router.post('/auto-promote', async (req, res) => {
  try {
    const {
      product_name,
      shop_url,
      design_id = 2,
      discount_code = 'FIRST10',
      campaign_length_days = 7
    } = req.body;

    // Get design data
    const designResponse = await axios.get(`http://localhost:3003/api/christmas/design/${design_id}`);
    const designData = designResponse.data.design;

    const finalProductName = product_name || designData.name;

    // Generate 7-day promotion schedule
    const promotionSchedule = [];
    const platforms = ['Facebook', 'Instagram', 'Twitter', 'TikTok', 'Email'];

    for (let day = 1; day <= campaign_length_days; day++) {
      const dayPlan = {
        day: day,
        date: new Date(Date.now() + day * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        tasks: []
      };

      // Day-specific strategy
      if (day === 1) {
        dayPlan.tasks.push({
          platform: 'Email',
          action: 'Send to close friends/family (10-20 people)',
          message: `Hey! 🎄\n\nI just launched my holiday shop and created this ${finalProductName}!\n\nWould love your support - use code ${discount_code} for 10% off:\n${shop_url}\n\nThanks! ❤️`
        });
      }

      if (day === 2) {
        dayPlan.tasks.push({
          platform: 'Facebook',
          action: 'Post on your timeline',
          message: `🎉 NEW! Just launched my ${finalProductName}!\n\nPerfect for ${designData.targetAudience} 🎄\n\nGet 10% off with code: ${discount_code}\n${shop_url}\n\n#Christmas #HolidayGift #SmallBusiness`
        });
        dayPlan.tasks.push({
          platform: 'Instagram',
          action: 'Post to feed + stories',
          message: `New holiday drop! 🔥\n\n${finalProductName}\n\nLink in bio 👆\nUse ${discount_code} for 10% off\n\n#ChristmasGift #HolidayShop #SmallBusiness`
        });
      }

      if (day === 3) {
        dayPlan.tasks.push({
          platform: 'Facebook Groups',
          action: 'Post in 3-5 niche groups',
          message: `Hi everyone! I created this ${finalProductName} and thought this group might enjoy it! 🎄\n\n${shop_url}\n\nUse code ${discount_code} for 10% off. Ships fast!`
        });
      }

      if (day === 4) {
        dayPlan.tasks.push({
          platform: 'Instagram',
          action: 'DM 10 engaged followers',
          message: `Hey! Saw you liked my Christmas post. Just launched this ${finalProductName} - thought you might like it! ${discount_code} for 10% off 🎁\n${shop_url}`
        });
      }

      if (day === 5) {
        dayPlan.tasks.push({
          platform: 'TikTok/Reels',
          action: 'Create short video showcasing product',
          script: `Show the design, talk about the humor/theme, mention discount code, include link in bio`
        });
      }

      if (day === 6) {
        dayPlan.tasks.push({
          platform: 'Twitter',
          action: 'Tweet with hashtags',
          message: `🎄 Just dropped: ${finalProductName}\n\n✨ Perfect holiday gift\n💰 Use ${discount_code} for 10% off\n🔗 ${shop_url}\n\n#Christmas #Gifts #HolidayShopping\n\nRT to support! 🙏`
        });
      }

      if (day === 7) {
        dayPlan.tasks.push({
          platform: 'Email',
          action: 'Follow-up with non-buyers',
          message: `Quick reminder! 🎄\n\nYour ${discount_code} code is still active for my ${finalProductName}!\n\n${shop_url}\n\nOnly a few left in stock - grab yours before they're gone!`
        });
      }

      promotionSchedule.push(dayPlan);
    }

    // Automation scripts
    const automationScripts = {
      facebook_auto_post: `
# Facebook Auto-Post Script (requires Facebook Graph API)
# Set up at: developers.facebook.com

curl -X POST "https://graph.facebook.com/me/feed" \\
  -d "access_token=YOUR_ACCESS_TOKEN" \\
  -d "message=🎉 NEW! Just launched my ${finalProductName}!\\n\\nPerfect for ${designData.targetAudience} 🎄\\n\\nGet 10% off with code: ${discount_code}\\n${shop_url}"
      `,

      instagram_auto_post: `
# Instagram posts require manual posting or third-party tools like Buffer, Hootsuite
# Recommended: Buffer.com (free tier: 10 posts)
# Schedule all 7 days at once
      `,

      email_batch_send: `
# Email list automation (using Mailchimp, SendGrid, etc.)
# Or use this simple script for Gmail:

import smtplib
from email.mime.text import MIMEText

contacts = ['friend1@email.com', 'friend2@email.com'] # Add your contacts

message = """
Hey! 🎄

I just launched my holiday shop and created this ${finalProductName}!

Would love your support - use code ${discount_code} for 10% off:
${shop_url}

Thanks! ❤️
"""

# Configure your Gmail and send (requires app password)
      `
    };

    res.json({
      success: true,
      message: '📢 Complete promotion campaign generated!',
      campaign: {
        product: finalProductName,
        duration: `${campaign_length_days} days`,
        discount_code: discount_code,
        shop_url: shop_url,
        target_reach: '100-500 people',
        expected_conversion: '5-15 sales'
      },
      daily_schedule: promotionSchedule,
      automation_tools: {
        recommended: [
          'Buffer (Social media scheduling) - buffer.com',
          'Hootsuite (Multi-platform) - hootsuite.com',
          'Later (Instagram focus) - later.com',
          'Mailchimp (Email) - mailchimp.com'
        ],
        free_alternatives: [
          'Facebook Creator Studio (Facebook/Instagram)',
          'TweetDeck (Twitter)',
          'Gmail (Email)'
        ]
      },
      automation_scripts: automationScripts,
      time_saving: {
        manual_effort: '30 min/day × 7 days = 3.5 hours',
        with_automation: '1 hour to set up schedule = 1 hour total',
        time_saved: '2.5 hours (71% reduction)'
      },
      pro_tips: [
        '📅 Schedule all posts at once on Sunday evening',
        '🎯 Best posting times: 7-9am, 12-1pm, 7-9pm',
        '📸 Use product mockups for better engagement',
        '💬 Respond to comments within 1 hour for max engagement',
        '🔄 Repost top performers on day 5-7'
      ]
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Promotion generation failed',
      error: error.message
    });
  }
});

// =====================================================
// COMPLETE END-TO-END AUTOMATION
// =====================================================

// POST /api/full-automation/profit-in-one-click
// Complete workflow: Design → List → Promote (all automated)
router.post('/profit-in-one-click', async (req, res) => {
  try {
    const {
      design_id = 2, // Funny Christmas Puns (highest profit)
      custom_text = null,
      printful_api_key = process.env.PRINTFUL_API_KEY,
      shop_url = 'YOUR_SHOP_URL',
      email_list = []
    } = req.body;

    const workflow = {
      success: true,
      message: '🚀 Complete automation workflow initiated!',
      steps: [],
      timeline: {},
      next_actions: []
    };

    // Step 1: Generate Design
    workflow.steps.push({
      step: 1,
      name: 'Design Generation',
      status: '✅ Ready',
      action: 'Use the HTML template or Canva link provided',
      api_call: `POST /api/full-automation/generate-design with design_id=${design_id}`
    });

    // Get design specs
    const designResponse = await axios.post('http://localhost:3003/api/full-automation/generate-design', {
      design_id,
      custom_text
    });

    workflow.design_ready = designResponse.data;

    // Step 2: Product Listing (if API key provided)
    if (printful_api_key && printful_api_key !== 'your_printful_api_key_here') {
      workflow.steps.push({
        step: 2,
        name: 'Product Listing',
        status: '⏳ Awaiting design upload',
        instruction: 'Upload your design, then call POST /api/full-automation/auto-list with design_url',
        estimated_time: '10 minutes'
      });
    } else {
      workflow.steps.push({
        step: 2,
        name: 'Product Listing',
        status: '❌ Setup Required',
        action: 'Configure Printful API key first',
        setup: 'POST /api/automation/setup/printful-key'
      });
    }

    // Step 3: Promotion Campaign
    const promotionResponse = await axios.post('http://localhost:3003/api/full-automation/auto-promote', {
      design_id,
      shop_url,
      campaign_length_days: 7
    });

    workflow.steps.push({
      step: 3,
      name: 'Promotion Campaign',
      status: '✅ Generated',
      campaign: promotionResponse.data
    });

    workflow.promotion_ready = promotionResponse.data;

    // Timeline
    workflow.timeline = {
      'Now': 'Design specs generated ✅',
      '+15 min': 'Create design from template',
      '+25 min': 'Upload to Printful',
      '+40 min': 'Product listed and live',
      '+1 hour': 'First promotion post scheduled',
      '+7 days': 'Full campaign completed',
      '+14 days': 'Expected first sales',
      '+30 days': 'Target: $100+ profit'
    };

    // Next actions for user
    workflow.next_actions = [
      {
        action: '1. Create Design',
        method: 'Copy HTML from design_ready.html_design, open in browser, screenshot',
        time: '15 min',
        skip_option: 'Or use Canva link provided'
      },
      {
        action: '2. Upload to Printful',
        method: printful_api_key ?
          'Call POST /api/full-automation/auto-list with your design_url' :
          'Set up API key first, then auto-list',
        time: '10 min'
      },
      {
        action: '3. Start Promoting',
        method: 'Follow the 7-day schedule in promotion_ready',
        time: '30 min/day OR 1 hour if using automation tools',
        automation: 'Use Buffer.com to schedule all at once'
      },
      {
        action: '4. Track Sales',
        method: 'POST /api/personal/sales when sales come in',
        time: '2 min per sale'
      }
    ];

    // Automation level
    workflow.automation_stats = {
      manual_process_time: '5+ hours',
      automated_process_time: '1-2 hours',
      time_saved: '3-4 hours per product (60-80% automation)',
      steps_automated: '7 out of 10 steps',
      remaining_manual: [
        'Design creation (15 min) - Can use template',
        'Design upload (2 min)',
        'Social media posting (30 min) - Can schedule in advance'
      ]
    };

    res.json(workflow);

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Complete automation failed',
      error: error.message,
      tip: 'Try running each step individually to identify the issue'
    });
  }
});

// GET /api/full-automation/status
// Check automation capabilities and setup
router.get('/status', (req, res) => {
  const printfulConfigured = process.env.PRINTFUL_API_KEY &&
                             process.env.PRINTFUL_API_KEY !== 'your_printful_api_key_here';

  res.json({
    success: true,
    automation_level: printfulConfigured ? '🚀 FULL' : '⚡ PARTIAL',
    capabilities: {
      design_generation: {
        status: '✅ Active',
        method: 'HTML templates + Canva links',
        automation: '80%'
      },
      product_listing: {
        status: printfulConfigured ? '✅ Active' : '⚠️ Setup Required',
        method: 'Printful API integration',
        automation: printfulConfigured ? '95%' : '0%'
      },
      promotion: {
        status: '✅ Active',
        method: 'Campaign templates + scheduling guides',
        automation: '70%'
      },
      profit_tracking: {
        status: '✅ Active',
        method: 'Personal account API',
        automation: '100%'
      }
    },
    overall_automation: printfulConfigured ? '86%' : '62%',
    time_savings: {
      traditional_method: '8-10 hours per product',
      with_automation: printfulConfigured ? '1-2 hours per product' : '3-4 hours per product',
      savings: printfulConfigured ? '75-85%' : '50-60%'
    },
    next_steps: printfulConfigured ? [
      '✅ All systems ready!',
      'Run: POST /api/full-automation/profit-in-one-click',
      'Start making money!'
    ] : [
      '⚙️ Configure Printful API key for full automation',
      'POST /api/automation/setup/printful-key',
      'Then enjoy 86% automation!'
    ]
  });
});

export default router;
