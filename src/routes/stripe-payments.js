import express from 'express';
import Stripe from 'stripe';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const router = express.Router();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy', {
  apiVersion: '2024-11-20.acacia',
});

// Database connection
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, '../../database.db');

// ============================================
// SUBSCRIPTION PACKAGES
// ============================================

// Get all available packages
router.get('/packages', (req, res) => {
  try {
    const db = new Database(dbPath);
    const packages = db.prepare(`
      SELECT * FROM subscription_packages
      WHERE active = 1
      ORDER BY price_monthly ASC
    `).all();

    // Parse JSON fields
    packages.forEach(pkg => {
      pkg.features = JSON.parse(pkg.features || '[]');
      pkg.integrations = JSON.parse(pkg.integrations || '[]');
    });

    db.close();
    res.json({ success: true, packages });
  } catch (error) {
    console.error('Error fetching packages:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single package details
router.get('/packages/:id', (req, res) => {
  try {
    const db = new Database(dbPath);
    const pkg = db.prepare('SELECT * FROM subscription_packages WHERE id = ?').get(req.params.id);

    if (!pkg) {
      db.close();
      return res.status(404).json({ success: false, error: 'Package not found' });
    }

    pkg.features = JSON.parse(pkg.features || '[]');
    pkg.integrations = JSON.parse(pkg.integrations || '[]');

    db.close();
    res.json({ success: true, package: pkg });
  } catch (error) {
    console.error('Error fetching package:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// CUSTOMER MANAGEMENT
// ============================================

// Create or get customer
router.post('/customers', async (req, res) => {
  try {
    const { email, name, phone, company_name, address } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }

    const db = new Database(dbPath);

    // Check if customer already exists
    let customer = db.prepare('SELECT * FROM customers WHERE email = ?').get(email);

    if (customer) {
      db.close();
      return res.json({ success: true, customer, exists: true });
    }

    // Create Stripe customer
    const stripeCustomer = await stripe.customers.create({
      email,
      name,
      phone,
      metadata: { company_name: company_name || '' },
      address: address || undefined,
    });

    // Insert into database
    const insert = db.prepare(`
      INSERT INTO customers (
        stripe_customer_id, email, name, phone, company_name,
        address_line1, address_line2, city, state, postal_code, country
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insert.run(
      stripeCustomer.id,
      email,
      name || null,
      phone || null,
      company_name || null,
      address?.line1 || null,
      address?.line2 || null,
      address?.city || null,
      address?.state || null,
      address?.postal_code || null,
      address?.country || 'US'
    );

    customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(result.lastInsertRowid);
    db.close();

    res.json({ success: true, customer, exists: false });
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get customer details
router.get('/customers/:customerId', (req, res) => {
  try {
    const db = new Database(dbPath);
    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.params.customerId);

    if (!customer) {
      db.close();
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }

    // Get active subscriptions
    const subscriptions = db.prepare(`
      SELECT s.*, sp.name as package_name, sp.price_monthly
      FROM subscriptions s
      JOIN subscription_packages sp ON s.package_id = sp.id
      WHERE s.customer_id = ?
      ORDER BY s.created_at DESC
    `).all(customer.id);

    db.close();
    res.json({ success: true, customer, subscriptions });
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// CHECKOUT & SUBSCRIPTIONS
// ============================================

// Create checkout session
router.post('/checkout/session', async (req, res) => {
  try {
    const { packageId, customerId, successUrl, cancelUrl, trialDays } = req.body;

    if (!packageId) {
      return res.status(400).json({ success: false, error: 'Package ID is required' });
    }

    const db = new Database(dbPath);

    // Get package details
    const pkg = db.prepare('SELECT * FROM subscription_packages WHERE id = ?').get(packageId);
    if (!pkg) {
      db.close();
      return res.status(404).json({ success: false, error: 'Package not found' });
    }

    // Get or create customer
    let customer;
    if (customerId) {
      customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(customerId);
    }

    const sessionParams = {
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{
        price: pkg.stripe_price_id,
        quantity: 1,
      }],
      success_url: successUrl || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/checkout/cancel`,
      metadata: {
        package_id: packageId,
        package_name: pkg.name,
      },
    };

    if (customer) {
      sessionParams.customer = customer.stripe_customer_id;
    } else {
      sessionParams.customer_creation = 'always';
    }

    if (trialDays && trialDays > 0) {
      sessionParams.subscription_data = {
        trial_period_days: trialDays,
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    db.close();
    res.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Handle successful checkout
router.get('/checkout/success', async (req, res) => {
  try {
    const { session_id } = req.query;

    if (!session_id) {
      return res.status(400).json({ success: false, error: 'Session ID is required' });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['customer', 'subscription'],
    });

    res.json({
      success: true,
      session: {
        id: session.id,
        customer: session.customer,
        subscription: session.subscription,
        payment_status: session.payment_status,
      },
    });
  } catch (error) {
    console.error('Error retrieving checkout session:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create subscription manually
router.post('/subscriptions', async (req, res) => {
  try {
    const { customerId, packageId, trialDays } = req.body;

    if (!customerId || !packageId) {
      return res.status(400).json({ success: false, error: 'Customer ID and Package ID are required' });
    }

    const db = new Database(dbPath);

    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(customerId);
    if (!customer) {
      db.close();
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }

    const pkg = db.prepare('SELECT * FROM subscription_packages WHERE id = ?').get(packageId);
    if (!pkg) {
      db.close();
      return res.status(404).json({ success: false, error: 'Package not found' });
    }

    // Create Stripe subscription
    const subscriptionData = {
      customer: customer.stripe_customer_id,
      items: [{ price: pkg.stripe_price_id }],
      metadata: {
        customer_id: customerId,
        package_id: packageId,
      },
    };

    if (trialDays && trialDays > 0) {
      subscriptionData.trial_period_days = trialDays;
    }

    const stripeSubscription = await stripe.subscriptions.create(subscriptionData);

    // Insert into database
    const insert = db.prepare(`
      INSERT INTO subscriptions (
        customer_id, package_id, stripe_subscription_id, status,
        current_period_start, current_period_end,
        trial_start, trial_end
      ) VALUES (?, ?, ?, ?, datetime(?, 'unixepoch'), datetime(?, 'unixepoch'), datetime(?, 'unixepoch'), datetime(?, 'unixepoch'))
    `);

    const result = insert.run(
      customerId,
      packageId,
      stripeSubscription.id,
      stripeSubscription.status,
      stripeSubscription.current_period_start,
      stripeSubscription.current_period_end,
      stripeSubscription.trial_start || null,
      stripeSubscription.trial_end || null
    );

    const subscription = db.prepare('SELECT * FROM subscriptions WHERE id = ?').get(result.lastInsertRowid);
    db.close();

    res.json({ success: true, subscription });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get subscription details
router.get('/subscriptions/:subscriptionId', (req, res) => {
  try {
    const db = new Database(dbPath);
    const subscription = db.prepare(`
      SELECT s.*, sp.name as package_name, sp.price_monthly, sp.features,
             c.email as customer_email, c.name as customer_name
      FROM subscriptions s
      JOIN subscription_packages sp ON s.package_id = sp.id
      JOIN customers c ON s.customer_id = c.id
      WHERE s.id = ?
    `).get(req.params.subscriptionId);

    if (!subscription) {
      db.close();
      return res.status(404).json({ success: false, error: 'Subscription not found' });
    }

    subscription.features = JSON.parse(subscription.features || '[]');

    db.close();
    res.json({ success: true, subscription });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Cancel subscription
router.post('/subscriptions/:subscriptionId/cancel', async (req, res) => {
  try {
    const { immediately } = req.body;

    const db = new Database(dbPath);
    const subscription = db.prepare('SELECT * FROM subscriptions WHERE id = ?').get(req.params.subscriptionId);

    if (!subscription) {
      db.close();
      return res.status(404).json({ success: false, error: 'Subscription not found' });
    }

    // Cancel in Stripe
    if (immediately) {
      await stripe.subscriptions.cancel(subscription.stripe_subscription_id);
    } else {
      await stripe.subscriptions.update(subscription.stripe_subscription_id, {
        cancel_at_period_end: true,
      });
    }

    // Update database
    const update = db.prepare(`
      UPDATE subscriptions
      SET cancel_at_period_end = ?, canceled_at = CURRENT_TIMESTAMP, status = ?
      WHERE id = ?
    `);

    update.run(immediately ? 0 : 1, immediately ? 'canceled' : 'active', req.params.subscriptionId);

    const updated = db.prepare('SELECT * FROM subscriptions WHERE id = ?').get(req.params.subscriptionId);
    db.close();

    res.json({ success: true, subscription: updated });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// PAYMENT INTENTS & INVOICES
// ============================================

// Create payment intent
router.post('/payment-intents', async (req, res) => {
  try {
    const { amount, currency = 'usd', customerId, description, metadata } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, error: 'Valid amount is required' });
    }

    const db = new Database(dbPath);
    let stripeCustomerId;

    if (customerId) {
      const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(customerId);
      if (customer) {
        stripeCustomerId = customer.stripe_customer_id;
      }
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      customer: stripeCustomerId,
      description,
      metadata: metadata || {},
    });

    db.close();
    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get payment history
router.get('/customers/:customerId/payments', (req, res) => {
  try {
    const db = new Database(dbPath);
    const payments = db.prepare(`
      SELECT p.*, i.invoice_number
      FROM payments p
      LEFT JOIN invoices i ON p.invoice_id = i.id
      WHERE p.customer_id = ?
      ORDER BY p.created_at DESC
    `).all(req.params.customerId);

    db.close();
    res.json({ success: true, payments });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get customer invoices
router.get('/customers/:customerId/invoices', (req, res) => {
  try {
    const db = new Database(dbPath);
    const invoices = db.prepare(`
      SELECT i.*, sp.name as subscription_package
      FROM invoices i
      LEFT JOIN subscriptions s ON i.subscription_id = s.id
      LEFT JOIN subscription_packages sp ON s.package_id = sp.id
      WHERE i.customer_id = ?
      ORDER BY i.created_at DESC
    `).all(req.params.customerId);

    // Parse line items
    invoices.forEach(inv => {
      inv.line_items = JSON.parse(inv.line_items || '[]');
    });

    db.close();
    res.json({ success: true, invoices });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Generate invoice manually
router.post('/invoices', async (req, res) => {
  try {
    const { customerId, subscriptionId, amount, description, lineItems, dueDate } = req.body;

    if (!customerId || !amount) {
      return res.status(400).json({ success: false, error: 'Customer ID and amount are required' });
    }

    const db = new Database(dbPath);
    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(customerId);

    if (!customer) {
      db.close();
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }

    // Create Stripe invoice
    const stripeInvoice = await stripe.invoices.create({
      customer: customer.stripe_customer_id,
      collection_method: 'send_invoice',
      days_until_due: dueDate ? Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24)) : 30,
      description,
    });

    // Add line items to Stripe invoice
    if (lineItems && lineItems.length > 0) {
      for (const item of lineItems) {
        await stripe.invoiceItems.create({
          customer: customer.stripe_customer_id,
          invoice: stripeInvoice.id,
          amount: Math.round(item.amount * 100),
          currency: 'usd',
          description: item.description,
        });
      }
    } else {
      // Add single line item
      await stripe.invoiceItems.create({
        customer: customer.stripe_customer_id,
        invoice: stripeInvoice.id,
        amount: Math.round(amount * 100),
        currency: 'usd',
        description: description || 'Service payment',
      });
    }

    // Finalize the invoice
    const finalizedInvoice = await stripe.invoices.finalizeInvoice(stripeInvoice.id);

    // Insert into database
    const insert = db.prepare(`
      INSERT INTO invoices (
        customer_id, subscription_id, stripe_invoice_id,
        amount_due, status, due_date, invoice_pdf_url,
        hosted_invoice_url, description, line_items
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insert.run(
      customerId,
      subscriptionId || null,
      finalizedInvoice.id,
      amount,
      finalizedInvoice.status,
      dueDate || null,
      finalizedInvoice.invoice_pdf,
      finalizedInvoice.hosted_invoice_url,
      description || null,
      JSON.stringify(lineItems || [])
    );

    const invoice = db.prepare('SELECT * FROM invoices WHERE id = ?').get(result.lastInsertRowid);
    db.close();

    res.json({ success: true, invoice });
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// CUSTOMER PORTAL
// ============================================

// Create customer portal session
router.post('/portal/session', async (req, res) => {
  try {
    const { customerId, returnUrl } = req.body;

    if (!customerId) {
      return res.status(400).json({ success: false, error: 'Customer ID is required' });
    }

    const db = new Database(dbPath);
    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(customerId);

    if (!customer) {
      db.close();
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customer.stripe_customer_id,
      return_url: returnUrl || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard`,
    });

    db.close();
    res.json({ success: true, url: session.url });
  } catch (error) {
    console.error('Error creating portal session:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// WEBHOOKS
// ============================================

// Stripe webhook handler
router.post('/webhooks', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const db = new Database(dbPath);

  try {
    // Log the event
    const logEvent = db.prepare(`
      INSERT INTO stripe_webhook_events (stripe_event_id, event_type, object_id, raw_data)
      VALUES (?, ?, ?, ?)
    `);

    logEvent.run(
      event.id,
      event.type,
      event.data.object.id,
      JSON.stringify(event)
    );

    // Handle the event
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(db, event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(db, event.data.object);
        break;

      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(db, event.data.object);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(db, event.data.object);
        break;

      case 'invoice.paid':
        await handleInvoicePaid(db, event.data.object);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(db, event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Mark event as processed
    db.prepare('UPDATE stripe_webhook_events SET processed = 1, processed_at = CURRENT_TIMESTAMP WHERE stripe_event_id = ?')
      .run(event.id);

    db.close();
    res.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    db.prepare('UPDATE stripe_webhook_events SET processing_error = ? WHERE stripe_event_id = ?')
      .run(error.message, event.id);
    db.close();
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// ============================================
// WEBHOOK HANDLERS
// ============================================

async function handleSubscriptionUpdate(db, subscription) {
  const existing = db.prepare('SELECT * FROM subscriptions WHERE stripe_subscription_id = ?')
    .get(subscription.id);

  if (existing) {
    // Update existing subscription
    db.prepare(`
      UPDATE subscriptions
      SET status = ?,
          current_period_start = datetime(?, 'unixepoch'),
          current_period_end = datetime(?, 'unixepoch'),
          cancel_at_period_end = ?
      WHERE stripe_subscription_id = ?
    `).run(
      subscription.status,
      subscription.current_period_start,
      subscription.current_period_end,
      subscription.cancel_at_period_end ? 1 : 0,
      subscription.id
    );
  }
}

async function handleSubscriptionDeleted(db, subscription) {
  db.prepare(`
    UPDATE subscriptions
    SET status = 'canceled', canceled_at = CURRENT_TIMESTAMP
    WHERE stripe_subscription_id = ?
  `).run(subscription.id);
}

async function handlePaymentSucceeded(db, paymentIntent) {
  const customerId = paymentIntent.customer;
  if (!customerId) return;

  const customer = db.prepare('SELECT * FROM customers WHERE stripe_customer_id = ?')
    .get(customerId);

  if (!customer) return;

  // Check if payment already recorded
  const existing = db.prepare('SELECT * FROM payments WHERE stripe_payment_intent_id = ?')
    .get(paymentIntent.id);

  if (existing) return;

  // Insert payment record
  db.prepare(`
    INSERT INTO payments (
      customer_id, stripe_payment_intent_id, stripe_charge_id,
      amount, currency, status, payment_method, description, receipt_url
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    customer.id,
    paymentIntent.id,
    paymentIntent.charges?.data[0]?.id || null,
    paymentIntent.amount / 100,
    paymentIntent.currency,
    'succeeded',
    paymentIntent.payment_method_types?.[0] || 'card',
    paymentIntent.description || null,
    paymentIntent.charges?.data[0]?.receipt_url || null
  );
}

async function handlePaymentFailed(db, paymentIntent) {
  const customerId = paymentIntent.customer;
  if (!customerId) return;

  const customer = db.prepare('SELECT * FROM customers WHERE stripe_customer_id = ?')
    .get(customerId);

  if (!customer) return;

  // Insert failed payment record
  db.prepare(`
    INSERT INTO payments (
      customer_id, stripe_payment_intent_id,
      amount, currency, status, payment_method, description
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    customer.id,
    paymentIntent.id,
    paymentIntent.amount / 100,
    paymentIntent.currency,
    'failed',
    paymentIntent.payment_method_types?.[0] || 'card',
    paymentIntent.description || null
  );
}

async function handleInvoicePaid(db, invoice) {
  const existing = db.prepare('SELECT * FROM invoices WHERE stripe_invoice_id = ?')
    .get(invoice.id);

  if (existing) {
    // Update existing invoice
    db.prepare(`
      UPDATE invoices
      SET status = 'paid',
          amount_paid = ?,
          paid_at = datetime(?, 'unixepoch'),
          invoice_pdf_url = ?
      WHERE stripe_invoice_id = ?
    `).run(
      invoice.amount_paid / 100,
      invoice.status_transitions.paid_at,
      invoice.invoice_pdf,
      invoice.id
    );
  }
}

async function handleInvoicePaymentFailed(db, invoice) {
  const existing = db.prepare('SELECT * FROM invoices WHERE stripe_invoice_id = ?')
    .get(invoice.id);

  if (existing) {
    db.prepare(`
      UPDATE invoices
      SET status = 'open'
      WHERE stripe_invoice_id = ?
    `).run(invoice.id);
  }
}

// ============================================
// STATISTICS & REPORTS
// ============================================

// Get payment statistics
router.get('/stats/overview', (req, res) => {
  try {
    const db = new Database(dbPath);

    const stats = {
      total_customers: db.prepare('SELECT COUNT(*) as count FROM customers').get().count,
      active_subscriptions: db.prepare("SELECT COUNT(*) as count FROM subscriptions WHERE status = 'active'").get().count,
      total_revenue: db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'succeeded'").get().total,
      pending_invoices: db.prepare("SELECT COUNT(*) as count FROM invoices WHERE status = 'open'").get().count,
      revenue_this_month: db.prepare(`
        SELECT COALESCE(SUM(amount), 0) as total
        FROM payments
        WHERE status = 'succeeded'
        AND strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')
      `).get().total,
      new_customers_this_month: db.prepare(`
        SELECT COUNT(*) as count
        FROM customers
        WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')
      `).get().count,
    };

    db.close();
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
