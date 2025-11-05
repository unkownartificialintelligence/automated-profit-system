import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cors from 'cors';
import helmet from 'helmet';
import Stripe from 'stripe';
import printfulRoutes from './src/routes/printful.js';
import path from 'path';

dotenv.config();

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/printful', printfulRoutes);

// Stripe Payment Intent
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

// Serve frontend test page
app.use(express.static(path.join(process.cwd(), 'stripe-integration')));

app.get('/', (req, res) => res.send('?? Automated Profit System Server is running ?'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(\?? Server listening on port \\));
