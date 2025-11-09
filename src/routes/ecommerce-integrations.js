import express from 'express';
import axios from 'axios';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, '../../database.db');

// ============================================
// PHASE 3.7: SHOPIFY INTEGRATION
// ============================================

router.post('/shopify/auth', async (req, res) => {
  try {
    const { shop, apiKey, apiSecret, accessToken } = req.body;
    if (!shop || !accessToken) {
      return res.status(400).json({ success: false, error: 'Shop domain and access token required' });
    }
    const db = new Database(dbPath);
    const tenantId = req.body.tenantId || 1;
    db.prepare(`INSERT INTO tenant_api_keys (tenant_id, key_name, service, api_key, api_secret) 
                VALUES (?, ?, 'shopify', ?, ?)`).run(tenantId, `Shopify-${shop}`, accessToken, apiSecret || null);
    db.close();
    res.json({ success: true, message: 'Shopify connected successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/shopify/products/sync', async (req, res) => {
  try {
    const { tenantId, shopDomain, accessToken } = req.body;
    const response = await axios.get(`https://${shopDomain}/admin/api/2024-01/products.json`, {
      headers: { 'X-Shopify-Access-Token': accessToken }
    });
    res.json({ success: true, products: response.data.products, count: response.data.products.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/shopify/products/create', async (req, res) => {
  try {
    const { tenantId, shopDomain, accessToken, product } = req.body;
    const response = await axios.post(`https://${shopDomain}/admin/api/2024-01/products.json`, 
      { product }, { headers: { 'X-Shopify-Access-Token': accessToken, 'Content-Type': 'application/json' } }
    );
    res.json({ success: true, product: response.data.product });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// PHASE 3.8: ETSY INTEGRATION
// ============================================

router.post('/etsy/auth', async (req, res) => {
  try {
    const { apiKey, apiSecret, accessToken, tenantId } = req.body;
    const db = new Database(dbPath);
    db.prepare(`INSERT INTO tenant_api_keys (tenant_id, key_name, service, api_key, api_secret) 
                VALUES (?, 'Etsy', 'etsy', ?, ?)`).run(tenantId || 1, accessToken, apiSecret);
    db.close();
    res.json({ success: true, message: 'Etsy connected' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/etsy/listings/create', async (req, res) => {
  try {
    const { tenantId, apiKey, listing } = req.body;
    const response = await axios.post('https://openapi.etsy.com/v3/application/shops/:shop_id/listings', 
      listing, { headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json' } }
    );
    res.json({ success: true, listing: response.data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/etsy/listings', async (req, res) => {
  try {
    const { shopId, apiKey } = req.query;
    const response = await axios.get(`https://openapi.etsy.com/v3/application/shops/${shopId}/listings`, 
      { headers: { 'x-api-key': apiKey } }
    );
    res.json({ success: true, listings: response.data.results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// PHASE 3.9: WOOCOMMERCE INTEGRATION
// ============================================

router.post('/woocommerce/auth', async (req, res) => {
  try {
    const { siteUrl, consumerKey, consumerSecret, tenantId } = req.body;
    const db = new Database(dbPath);
    db.prepare(`INSERT INTO tenant_api_keys (tenant_id, key_name, service, api_key, api_secret) 
                VALUES (?, ?, 'woocommerce', ?, ?)`).run(tenantId || 1, `WooCommerce-${siteUrl}`, consumerKey, consumerSecret);
    db.close();
    res.json({ success: true, message: 'WooCommerce connected' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/woocommerce/products/create', async (req, res) => {
  try {
    const { siteUrl, consumerKey, consumerSecret, product } = req.body;
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    const response = await axios.post(`${siteUrl}/wp-json/wc/v3/products`, 
      product, { headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/json' } }
    );
    res.json({ success: true, product: response.data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/woocommerce/products', async (req, res) => {
  try {
    const { siteUrl, consumerKey, consumerSecret } = req.query;
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    const response = await axios.get(`${siteUrl}/wp-json/wc/v3/products`, 
      { headers: { 'Authorization': `Basic ${auth}` } }
    );
    res.json({ success: true, products: response.data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
