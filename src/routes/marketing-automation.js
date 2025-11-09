import express from 'express';
import {
  MARKETING_CAMPAIGNS,
  generateCampaign,
  getAvailableCampaigns,
  scheduleCampaign
} from '../marketing-campaigns.js';

const router = express.Router();

/**
 * GET /api/marketing/dashboard
 * Complete marketing automation dashboard
 */
router.get('/dashboard', (req, res) => {
  try {
    const stakeholderTypes = ['team', 'customers', 'clients', 'partnerships', 'sponsorships'];

    const overview = stakeholderTypes.map(type => {
      const campaigns = MARKETING_CAMPAIGNS[type];
      return {
        stakeholder_type: type,
        total_campaigns: Object.keys(campaigns).length,
        campaign_types: Object.keys(campaigns)
      };
    });

    res.json({
      success: true,
      message: "🚀 Marketing Automation Dashboard",
      overview: {
        total_stakeholder_types: stakeholderTypes.length,
        total_campaigns_available: overview.reduce((sum, s) => sum + s.total_campaigns, 0),
        stakeholder_types: stakeholderTypes
      },
      campaigns_by_stakeholder: overview,
      quick_actions: [
        "GET /api/marketing/team - Team campaigns (recruitment, motivation)",
        "GET /api/marketing/customers - Customer campaigns (product launches, retention)",
        "GET /api/marketing/clients - Client campaigns (onboarding, reports)",
        "GET /api/marketing/partnerships - Partnership campaigns (outreach, collaboration)",
        "GET /api/marketing/sponsorships - Sponsorship campaigns (proposals, reports)"
      ]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/marketing/:stakeholder
 * Get all campaigns for a specific stakeholder type
 */
router.get('/:stakeholder', (req, res) => {
  try {
    const { stakeholder } = req.params;
    const result = getAvailableCampaigns(stakeholder);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json({
      success: true,
      stakeholder_type: stakeholder,
      total_campaigns: result.campaigns.length,
      campaigns: result.campaigns,
      usage: `GET /api/marketing/${stakeholder}/:campaign_type to get specific campaign`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/marketing/:stakeholder/:campaign_type
 * Get specific campaign with optional custom data
 */
router.get('/:stakeholder/:campaign_type', (req, res) => {
  try {
    const { stakeholder, campaign_type } = req.params;

    // Allow custom data via query params
    const customData = {
      'First Name': req.query.first_name || 'Valued Customer',
      'Client Name': req.query.client_name || 'Valued Client',
      'Partner Name': req.query.partner_name || 'Valued Partner',
      'Sponsor Name': req.query.sponsor_name || 'Valued Sponsor',
      'Product Name': req.query.product_name || 'Christmas Product',
      'Price': req.query.price || '24.99',
      'Order Number': req.query.order_number || '12345',
      'Your Shop Name': req.query.shop_name || 'Your Shop',
      ...req.query
    };

    const result = generateCampaign(stakeholder, campaign_type, customData);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/marketing/schedule
 * Schedule a campaign
 */
router.post('/schedule', (req, res) => {
  try {
    const { stakeholder_type, campaign_type, target_audience, schedule } = req.body;

    if (!stakeholder_type || !campaign_type) {
      return res.status(400).json({
        success: false,
        error: "stakeholder_type and campaign_type are required"
      });
    }

    const scheduledCampaign = scheduleCampaign(
      campaign_type,
      stakeholder_type,
      target_audience || "All",
      schedule || "immediate"
    );

    res.json({
      success: true,
      message: "Campaign scheduled successfully",
      campaign: scheduledCampaign
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/marketing/team/recruitment
 * Team recruitment campaign
 */
router.get('/team/recruitment/preview', (req, res) => {
  try {
    const result = generateCampaign('team', 'recruitment', {
      'First Name': 'John',
      'Your Shop Name': 'Automated Profit Team'
    });

    res.json({
      success: true,
      message: "Team Recruitment Campaign Preview",
      ...result,
      note: "Use query params to customize: ?first_name=John&shop_name=YourShop"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/marketing/customers/product_launch
 * Customer product launch campaign
 */
router.get('/customers/product_launch/preview', (req, res) => {
  try {
    const result = generateCampaign('customers', 'product_launch', {
      'First Name': 'Sarah',
      'Product Name': 'Meowy Christmas Cat Dad T-Shirt',
      'Product Description': 'Perfect for cat dads who love Christmas!',
      'Target Audience': 'cat lovers and dads',
      'Regular Price': '29.99',
      'Sale Price': '24.99',
      'Savings': '5.00',
      'Deadline': 'Christmas',
      'Your Shop Name': 'Christmas Cat Shop'
    });

    res.json({
      success: true,
      message: "Product Launch Campaign Preview",
      ...result,
      note: "Customize with query params: ?product_name=YourProduct&price=24.99"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/marketing/partnerships/outreach
 * Partnership outreach campaign
 */
router.get('/partnerships/outreach/preview', (req, res) => {
  try {
    const result = generateCampaign('partnerships', 'outreach', {
      'Partner Name': 'Alex',
      'Partner Business': 'Print On Demand Co',
      'specific detail about their business': 'your innovative product catalog and customer service',
      'X': '1000',
      'Your Name': 'Jordan Smith',
      'Your Title': 'Founder',
      'Company Name': 'Automated Profit System',
      'Phone': '555-0123',
      'Email': 'jordan@profitsystem.com'
    });

    res.json({
      success: true,
      message: "Partnership Outreach Campaign Preview",
      ...result,
      note: "Customize with query params: ?partner_name=Alex&company_name=YourCompany"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/marketing/sponsorships/proposal
 * Sponsorship proposal campaign
 */
router.get('/sponsorships/proposal/preview', (req, res) => {
  try {
    const result = generateCampaign('sponsorships', 'proposal', {
      'Sponsor Name': 'Marketing Director',
      'Sponsor Company': 'E-Commerce Tools Inc',
      'X': '10000',
      'Your Name': 'Jordan Smith',
      'Title': 'Founder',
      'Contact Info': 'jordan@profitsystem.com | 555-0123'
    });

    res.json({
      success: true,
      message: "Sponsorship Proposal Campaign Preview",
      ...result,
      note: "Customize with query params: ?sponsor_name=Name&sponsor_company=Company"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/marketing/templates
 * Get quick template reference
 */
router.get('/templates/list', (req, res) => {
  try {
    const templates = {
      team: {
        recruitment: "Hire team members with profit sharing",
        motivation: "Weekly team performance updates"
      },
      customers: {
        product_launch: "New product announcement",
        abandoned_cart: "Recover abandoned carts",
        post_purchase: "Post-purchase follow-up sequence"
      },
      clients: {
        onboarding: "Client onboarding sequence",
        monthly_report: "Monthly performance reports"
      },
      partnerships: {
        outreach: "Partnership proposal",
        collaboration: "Active partner updates"
      },
      sponsorships: {
        proposal: "Sponsorship proposal",
        sponsor_report: "Monthly sponsor reports"
      }
    };

    res.json({
      success: true,
      message: "Available Marketing Templates",
      total_templates: Object.values(templates).reduce((sum, t) => sum + Object.keys(t).length, 0),
      templates: templates,
      usage: {
        example: "GET /api/marketing/customers/product_launch?product_name=MyProduct&price=24.99",
        customization: "Add query parameters to customize any template",
        channels: "Each template includes email, Instagram, TikTok, Facebook, LinkedIn where applicable"
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
