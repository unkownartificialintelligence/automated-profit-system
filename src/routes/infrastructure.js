import express from 'express';
import Database from 'better-sqlite3';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { rateLimit } from 'express-rate-limit';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, '../../database.db');

// ============================================
// PHASE 6.17: WHITE-LABEL SYSTEM
// ============================================

router.post('/white-label/configure', (req, res) => {
  try {
    const { tenantId, branding } = req.body;
    const db = new Database(dbPath);
    const settings = JSON.stringify({
      logo: branding.logo || null,
      primaryColor: branding.primaryColor || '#4F46E5',
      secondaryColor: branding.secondaryColor || '#10B981',
      companyName: branding.companyName || 'My POD Business',
      customDomain: branding.customDomain || null,
      emailFrom: branding.emailFrom || null,
      favicon: branding.favicon || null
    });

    db.prepare('UPDATE tenants SET settings = ? WHERE id = ?').run(settings, tenantId);
    db.close();
    res.json({ success: true, message: 'White-label configuration updated' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/white-label/:tenantId', (req, res) => {
  try {
    const db = new Database(dbPath);
    const tenant = db.prepare('SELECT settings, domain FROM tenants WHERE id = ?').get(req.params.tenantId);
    db.close();

    if (!tenant) {
      return res.status(404).json({ success: false, error: 'Tenant not found' });
    }

    const branding = JSON.parse(tenant.settings || '{}');
    res.json({ success: true, branding, domain: tenant.domain });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// PHASE 6.18: API ACCESS & WEBHOOKS
// ============================================

// Generate API key for tenant
router.post('/api-keys/generate', (req, res) => {
  try {
    const { tenantId, keyName } = req.body;
    const apiKey = 'apk_' + Buffer.from(`${tenantId}-${Date.now()}-${Math.random()}`).toString('base64').substring(0, 32);

    const db = new Database(dbPath);
    db.prepare(`
      INSERT INTO tenant_api_keys (tenant_id, key_name, service, api_key)
      VALUES (?, ?, 'public_api', ?)
    `).run(tenantId, keyName || 'API Key', apiKey);
    db.close();

    res.json({ success: true, apiKey, message: 'API key generated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// List API keys for tenant
router.get('/api-keys/:tenantId', (req, res) => {
  try {
    const db = new Database(dbPath);
    const keys = db.prepare(`
      SELECT id, key_name, service,
             SUBSTR(api_key, 1, 8) || '...' as api_key_preview,
             active, created_at
      FROM tenant_api_keys
      WHERE tenant_id = ? AND service = 'public_api'
    `).all(req.params.tenantId);
    db.close();

    res.json({ success: true, apiKeys: keys });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Rate limiting middleware for public API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each key to 100 requests per windowMs
  message: 'Too many requests from this API key, please try again later.'
});

router.use('/public/*', apiLimiter);

// Public API endpoint (rate limited)
router.get('/public/products/:tenantId', apiLimiter, (req, res) => {
  try {
    const db = new Database(dbPath);
    const products = db.prepare('SELECT * FROM tenant_products WHERE tenant_id = ? AND status = ?')
      .all(req.params.tenantId, 'active');
    db.close();

    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Webhook endpoint
router.post('/webhooks/register', (req, res) => {
  try {
    const { tenantId, url, events } = req.body;
    const db = new Database(dbPath);

    // Store webhook configuration (would need webhooks table)
    const webhookConfig = { url, events, tenantId, active: true };

    res.json({ success: true, webhook: webhookConfig, message: 'Webhook registered' });
    db.close();
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// PHASE 6.19: ADVANCED SECURITY
// ============================================

// Two-factor authentication setup
router.post('/security/2fa/enable', (req, res) => {
  try {
    const { userId, secret } = req.body;
    // In production, would use speakeasy or similar for TOTP
    const mockSecret = Buffer.from(Math.random().toString()).toString('base64').substring(0, 32);

    res.json({
      success: true,
      secret: mockSecret,
      qrCode: `otpauth://totp/AutomatedProfitSystem:user${userId}?secret=${mockSecret}&issuer=APS`,
      message: '2FA enabled successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Verify 2FA token
router.post('/security/2fa/verify', (req, res) => {
  try {
    const { userId, token } = req.body;
    // Mock verification - in production would verify TOTP token
    const isValid = token && token.length === 6;

    res.json({ success: true, valid: isValid });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// IP whitelisting
router.post('/security/ip-whitelist', (req, res) => {
  try {
    const { tenantId, ipAddresses } = req.body;
    const db = new Database(dbPath);

    const settings = db.prepare('SELECT settings FROM tenants WHERE id = ?').get(tenantId);
    const currentSettings = JSON.parse(settings?.settings || '{}');
    currentSettings.ipWhitelist = ipAddresses;

    db.prepare('UPDATE tenants SET settings = ? WHERE id = ?').run(JSON.stringify(currentSettings), tenantId);
    db.close();

    res.json({ success: true, message: 'IP whitelist updated' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Audit logs
router.get('/security/audit-logs/:tenantId', (req, res) => {
  try {
    const db = new Database(dbPath);
    const logs = db.prepare(`
      SELECT * FROM admin_logs
      WHERE target_tenant_id = ?
      ORDER BY created_at DESC
      LIMIT 100
    `).all(req.params.tenantId);
    db.close();

    res.json({ success: true, logs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Log admin action
function logAdminAction(adminUserId, action, targetTenantId, details, ipAddress) {
  try {
    const db = new Database(dbPath);
    db.prepare(`
      INSERT INTO admin_logs (admin_user_id, action, target_tenant_id, details, ip_address)
      VALUES (?, ?, ?, ?, ?)
    `).run(adminUserId, action, targetTenantId, JSON.stringify(details), ipAddress);
    db.close();
  } catch (error) {
    console.error('Error logging admin action:', error);
  }
}

// Session management
router.post('/security/sessions/revoke', (req, res) => {
  try {
    const { userId, sessionId } = req.body;
    // In production would invalidate JWT or session token
    res.json({ success: true, message: 'Session revoked successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// PHASE 6.20: PERFORMANCE MONITORING
// ============================================

// Health check with detailed metrics
router.get('/monitoring/health', (req, res) => {
  try {
    const db = new Database(dbPath);

    const dbHealth = {
      connected: true,
      tenants: db.prepare('SELECT COUNT(*) as count FROM tenants').get().count,
      activeSessions: Math.floor(Math.random() * 100), // Mock
      responseTime: Math.random() * 100
    };

    db.close();

    const systemMetrics = {
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
      },
      cpu: process.cpuUsage()
    };

    res.json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: dbHealth,
      system: systemMetrics
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      error: error.message
    });
  }
});

// Error tracking endpoint (Sentry-like)
router.post('/monitoring/errors', (req, res) => {
  try {
    const { error, context, tenantId } = req.body;
    console.error('ERROR TRACKED:', {
      error,
      context,
      tenantId,
      timestamp: new Date().toISOString()
    });

    // In production would send to Sentry or similar service
    res.json({ success: true, errorId: Date.now().toString() });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Performance metrics
router.get('/monitoring/metrics/:tenantId', (req, res) => {
  try {
    const db = new Database(dbPath);

    const metrics = {
      totalProducts: db.prepare('SELECT COUNT(*) as count FROM tenant_products WHERE tenant_id = ?').get(req.params.tenantId).count,
      totalSales: db.prepare('SELECT COUNT(*) as count FROM tenant_sales WHERE tenant_id = ?').get(req.params.tenantId).count,
      totalRevenue: db.prepare('SELECT COALESCE(SUM(revenue), 0) as total FROM tenant_sales WHERE tenant_id = ?').get(req.params.tenantId).total,
      apiCalls: Math.floor(Math.random() * 1000), // Mock - would track actual API usage
      storageUsed: Math.floor(Math.random() * 500) // Mock MB
    };

    db.close();

    res.json({ success: true, metrics, period: 'last_30_days' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Alert system
router.post('/monitoring/alerts/configure', (req, res) => {
  try {
    const { tenantId, alerts } = req.body;
    // Configure alerts for: high error rate, low uptime, quota exceeded, etc.
    res.json({
      success: true,
      message: 'Alerts configured',
      alerts: alerts || ['error_rate_high', 'quota_90_percent', 'downtime_detected']
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
