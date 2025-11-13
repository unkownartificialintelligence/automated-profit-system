import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cors from 'cors';
import helmet from 'helmet';
import Stripe from 'stripe';
import printfulRoutes from './src/routes/printful.js';

dotenv.config();

const app = express();
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Serve frontend static files
app.use(express.static('frontend/dist'));

// Printful routes
app.use('/printful', printfulRoutes);

// Stripe route
app.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency } = req.body;
    if (!amount || !currency) return res.status(400).json({ error: 'amount and currency required' });

    const paymentIntent = await stripe.paymentIntents.create({ amount, currency });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Health check route
app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'Server is running' }));

// SPA fallback - serve index.html for all non-API routes
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api') && !req.path.startsWith('/printful')) {
    res.sendFile('frontend/dist/index.html', { root: '.' });
  } else {
    res.status(404).json({ error: 'Endpoint not found' });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server listening on port ${PORT}`));
