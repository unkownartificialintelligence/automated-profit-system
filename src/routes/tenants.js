import express from 'express';
import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { identifyTenant, verifyTenantUser } from '../middleware/tenant.js';

const router = express.Router();
const db = new sqlite3.Database('./database.db');

// Create new tenant (admin only)
router.post('/create', async (req, res) => {
  const { company_name, email, password, package_tier } = req.body;
  
  try {
    // Generate subdomain from company name
    const subdomain = company_name.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // Create tenant
    db.run(
      'INSERT INTO tenants (company_name, subdomain, package_tier) VALUES (?, ?, ?)',
      [company_name, subdomain, package_tier],
      function(err) {
        if (err) {
          return res.status(500).json({ success: false, message: 'Error creating tenant' });
        }
        
        const tenantId = this.lastID;
        
        // Create first user for tenant
        const hashedPassword = bcrypt.hashSync(password, 10);
        db.run(
          'INSERT INTO tenant_users (tenant_id, email, password, name, role) VALUES (?, ?, ?, ?, ?)',
          [tenantId, email, hashedPassword, company_name, 'owner'],
          (err) => {
            if (err) {
              return res.status(500).json({ success: false, message: 'Error creating user' });
            }
            
            // Initialize tenant features based on package
            const features = getFeaturesByPackage(package_tier);
            const featurePromises = features.map(feature => {
              return new Promise((resolve) => {
                db.run(
                  'INSERT INTO tenant_features (tenant_id, feature_name, enabled, usage_limit) VALUES (?, ?, ?, ?)',
                  [tenantId, feature.name, 1, feature.limit],
                  () => resolve()
                );
              });
            });
            
            Promise.all(featurePromises).then(() => {
              res.json({
                success: true,
                tenant: {
                  id: tenantId,
                  company_name,
                  subdomain,
                  package_tier
                },
                loginUrl: `http://${subdomain}.jerzii.ai/login`
              });
            });
          }
        );
      }
    );
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get tenant info
router.get('/info', identifyTenant, verifyTenantUser, (req, res) => {
  const tenantId = req.tenantId || req.userTenantId;
  
  db.get(
    `SELECT t.*, 
     (SELECT COUNT(*) FROM tenant_orders WHERE tenant_id = t.id) as total_orders,
     (SELECT SUM(revenue) FROM tenant_analytics WHERE tenant_id = t.id) as total_revenue
     FROM tenants t WHERE t.id = ?`,
    [tenantId],
    (err, tenant) => {
      if (err || !tenant) {
        return res.status(404).json({ success: false, message: 'Tenant not found' });
      }
      
      // Get tenant features
      db.all(
        'SELECT * FROM tenant_features WHERE tenant_id = ? AND enabled = 1',
        [tenantId],
        (err, features) => {
          res.json({
            success: true,
            tenant: {
              ...tenant,
              features: features || []
            }
          });
        }
      );
    }
  );
});

// Get tenant analytics
router.get('/analytics', identifyTenant, verifyTenantUser, (req, res) => {
  const tenantId = req.tenantId || req.userTenantId;
  const { days = 30 } = req.query;
  
  db.all(
    `SELECT * FROM tenant_analytics 
     WHERE tenant_id = ? AND date >= date('now', '-${days} days')
     ORDER BY date DESC`,
    [tenantId],
    (err, analytics) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error fetching analytics' });
      }
      
      res.json({ success: true, analytics });
    }
  );
});

// Update tenant settings
router.put('/settings', identifyTenant, verifyTenantUser, (req, res) => {
  const tenantId = req.tenantId || req.userTenantId;
  const { printful_api_key, custom_domain, logo_url, primary_color } = req.body;
  
  // Check if settings exist
  db.get('SELECT * FROM tenant_settings WHERE tenant_id = ?', [tenantId], (err, existing) => {
    if (existing) {
      // Update
      db.run(
        `UPDATE tenant_settings 
         SET printful_api_key = COALESCE(?, printful_api_key),
             custom_domain = COALESCE(?, custom_domain),
             logo_url = COALESCE(?, logo_url),
             primary_color = COALESCE(?, primary_color)
         WHERE tenant_id = ?`,
        [printful_api_key, custom_domain, logo_url, primary_color, tenantId],
        (err) => {
          if (err) {
            return res.status(500).json({ success: false, message: 'Error updating settings' });
          }
          res.json({ success: true, message: 'Settings updated' });
        }
      );
    } else {
      // Insert
      db.run(
        `INSERT INTO tenant_settings (tenant_id, printful_api_key, custom_domain, logo_url, primary_color)
         VALUES (?, ?, ?, ?, ?)`,
        [tenantId, printful_api_key, custom_domain, logo_url, primary_color],
        (err) => {
          if (err) {
            return res.status(500).json({ success: false, message: 'Error creating settings' });
          }
          res.json({ success: true, message: 'Settings created' });
        }
      );
    }
  });
});

// Helper function to get features by package
function getFeaturesByPackage(packageTier) {
  const features = {
    starter: [
      { name: 'basic_analytics', limit: null },
      { name: 'order_processing', limit: 100 },
    ],
    professional: [
      { name: 'basic_analytics', limit: null },
      { name: 'order_processing', limit: 500 },
      { name: 'google_trends', limit: null },
      { name: 'automation', limit: null },
      { name: 'ai_research', limit: 50 },
    ],
    enterprise: [
      { name: 'basic_analytics', limit: null },
      { name: 'order_processing', limit: null },
      { name: 'google_trends', limit: null },
      { name: 'automation', limit: null },
      { name: 'ai_research', limit: 200 },
      { name: 'ai_descriptions', limit: 500 },
      { name: 'multi_store', limit: 5 },
      { name: 'shopify_integration', limit: null },
    ],
    enterprisePlus: [
      { name: 'basic_analytics', limit: null },
      { name: 'order_processing', limit: null },
      { name: 'google_trends', limit: null },
      { name: 'automation', limit: null },
      { name: 'ai_research', limit: null },
      { name: 'ai_descriptions', limit: null },
      { name: 'ai_social', limit: 200 },
      { name: 'ai_customer_service', limit: null },
      { name: 'multi_store', limit: null },
      { name: 'all_integrations', limit: null },
    ]
  };
  
  return features[packageTier] || features.starter;
}

export default router;
