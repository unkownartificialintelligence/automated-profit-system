import express from 'express';
import axios from 'axios';
import nodemailer from 'nodemailer';

const router = express.Router();
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// PHASE 5.13: AI Social Media Content Generator
router.post('/social-media/generate', async (req, res) => {
  try {
    const { productName, platform, tone = 'engaging' } = req.body;
    if (!OPENAI_API_KEY) {
      return res.status(503).json({ success: false, error: 'OpenAI API not configured' });
    }
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4',
      messages: [{
        role: 'user',
        content: `Generate 3 ${platform} posts for product: ${productName}. Make them ${tone} with relevant hashtags.`
      }],
      temperature: 0.9
    }, { headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}` }});
    res.json({ success: true, posts: response.data.choices[0].message.content.split('\n\n') });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PHASE 5.14: AI Customer Service Bot
router.post('/chatbot/query', async (req, res) => {
  try {
    const { message, context } = req.body;
    if (!OPENAI_API_KEY) {
      return res.status(503).json({ success: false, error: 'OpenAI API not configured' });
    }
    const systemPrompt = 'You are a helpful customer service bot for a print-on-demand business. Answer questions about orders, shipping, returns, and product customization.';
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      temperature: 0.7
    }, { headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}` }});
    res.json({ success: true, reply: response.data.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PHASE 5.15: Email Marketing Automation
router.post('/email-marketing/campaign', async (req, res) => {
  try {
    const { recipients, subject, template, tenantId } = req.body;
    if (!process.env.SMTP_USER) {
      return res.status(503).json({ success: false, error: 'SMTP not configured' });
    }
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });

    const results = await Promise.all(recipients.map(email =>
      transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: email,
        subject,
        html: template
      }).catch(err => ({ email, error: err.message }))
    ));

    res.json({ success: true, sent: results.filter(r => !r.error).length, failed: results.filter(r => r.error).length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/email-marketing/abandoned-cart', async (req, res) => {
  try {
    const { customerEmail, cartItems, tenantId } = req.body;
    const itemsList = cartItems.map(item => `<li>${item.name} - $${item.price}</li>`).join('');
    const template = `<h2>You left something behind!</h2><p>Complete your purchase:</p><ul>${itemsList}</ul><a href="${process.env.FRONTEND_URL}/checkout">Complete Purchase</a>`;

    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: customerEmail,
      subject: 'Complete your order - 10% off!',
      html: template
    });

    res.json({ success: true, message: 'Abandoned cart email sent' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PHASE 5.16: Price Optimization Engine
router.post('/pricing/optimize', (req, res) => {
  try {
    const { cost, targetMargin = 50, competitorPrices = [], marketPosition = 'mid' } = req.body;
    const basePrice = cost * (1 + targetMargin / 100);
    const avgCompetitor = competitorPrices.length > 0
      ? competitorPrices.reduce((a, b) => a + b, 0) / competitorPrices.length
      : basePrice;

    const strategies = {
      premium: Math.round((avgCompetitor * 1.2) * 100) / 100,
      competitive: Math.round(avgCompetitor * 100) / 100,
      penetration: Math.round((avgCompetitor * 0.85) * 100) / 100,
      value: Math.round(basePrice * 100) / 100
    };

    const recommended = strategies[marketPosition] || strategies.competitive;
    const recommendedMargin = ((recommended - cost) / cost * 100).toFixed(1);

    res.json({
      success: true,
      recommendations: {
        cost,
        strategies,
        recommended,
        recommendedMargin: parseFloat(recommendedMargin),
        dynamicPricing: {
          peakHours: Math.round(recommended * 1.1 * 100) / 100,
          offPeak: Math.round(recommended * 0.95 * 100) / 100
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/pricing/competitor-monitor', async (req, res) => {
  try {
    const { product, competitors } = req.query;
    const mockPrices = competitors ? competitors.split(',').map(() => 20 + Math.random() * 30) : [];
    res.json({
      success: true,
      product,
      competitorPrices: mockPrices,
      average: mockPrices.length > 0 ? mockPrices.reduce((a, b) => a + b, 0) / mockPrices.length : 0,
      range: mockPrices.length > 0 ? { min: Math.min(...mockPrices), max: Math.max(...mockPrices) } : null
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
