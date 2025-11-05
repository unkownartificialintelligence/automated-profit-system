import express from 'express';
import stripeService from '../services/stripeService.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Get available packages
router.get('/packages', (req, res) => {
  const packages = stripeService.getPackages();
  res.json({ success: true, packages });
});

// Get managed services
router.get('/managed-services', (req, res) => {
  const services = stripeService.getManagedServices();
  res.json({ success: true, services });
});

// Get AI features
router.get('/ai-features', (req, res) => {
  const features = stripeService.getAIFeatures();
  res.json({ success: true, features });
});

// Create payment intent for package
router.post('/create-package-payment', verifyToken, async (req, res) => {
  try {
    const { packageType, clientEmail, clientName } = req.body;
    
    const payment = await stripeService.createPackagePayment(
      packageType,
      clientEmail,
      clientName
    );
    
    res.json({ success: true, payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create managed service subscription
router.post('/subscribe-managed-service', verifyToken, async (req, res) => {
  try {
    const { serviceType, customerId } = req.body;
    
    const subscription = await stripeService.createManagedServiceSubscription(
      serviceType,
      customerId
    );
    
    res.json({ success: true, subscription });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create AI feature subscription
router.post('/subscribe-ai-feature', verifyToken, async (req, res) => {
  try {
    const { featureType, customerId } = req.body;
    
    const subscription = await stripeService.createAIFeatureSubscription(
      featureType,
      customerId
    );
    
    res.json({ success: true, subscription });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create Stripe customer
router.post('/create-customer', verifyToken, async (req, res) => {
  try {
    const { email, name, metadata } = req.body;
    
    const customer = await stripeService.createCustomer(email, name, metadata);
    
    res.json({ success: true, customer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Cancel subscription
router.post('/cancel-subscription', verifyToken, async (req, res) => {
  try {
    const { subscriptionId } = req.body;
    
    const subscription = await stripeService.cancelSubscription(subscriptionId);
    
    res.json({ success: true, subscription });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Stripe webhook endpoint
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['stripe-signature'];
    
    await stripeService.handleWebhook(req.body, signature);
    
    res.json({ received: true });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

export default router;
