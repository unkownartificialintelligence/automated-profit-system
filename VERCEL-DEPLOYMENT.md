# 🚀 Vercel Deployment Guide

## ⚠️ IMPORTANT: Database Configuration

**SQLite won't work on Vercel's serverless environment.** You need to migrate to a cloud database first.

### Recommended Database Options:

#### Option 1: Vercel Postgres (Recommended) ⭐
```bash
# Install Vercel Postgres
npm install @vercel/postgres

# Create a Postgres database in Vercel dashboard
# Connection string will be automatically added to environment variables
```

#### Option 2: Supabase (PostgreSQL)
- Free tier available
- Built-in authentication
- Real-time subscriptions
- Visit: https://supabase.com

#### Option 3: PlanetScale (MySQL)
- Free tier available
- Serverless MySQL
- Visit: https://planetscale.com

#### Option 4: MongoDB Atlas
- Free tier available
- NoSQL database
- Visit: https://www.mongodb.com/atlas

---

## 📋 Pre-Deployment Checklist

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Update Dependencies for Vercel
```bash
npm install @vercel/node --save-dev
```

### 3. Migrate Database Schema
Convert your SQLite schema to your chosen database. For Postgres:

```sql
-- Use database-schema-*.sql files as reference
-- Modify data types as needed:
-- INTEGER → SERIAL or BIGSERIAL for auto-increment
-- DATETIME → TIMESTAMP
-- DECIMAL(10,2) → NUMERIC(10,2)
```

### 4. Update Database Connection
Replace `better-sqlite3` imports with your database client:

**For Vercel Postgres:**
```javascript
import { sql } from '@vercel/postgres';

// Instead of:
const db = new Database(dbPath);
const result = db.prepare('SELECT * FROM customers').all();

// Use:
const { rows } = await sql`SELECT * FROM customers`;
```

**For Supabase:**
```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const { data, error } = await supabase.from('customers').select('*');
```

---

## 🔧 Environment Variables Setup

### Required Environment Variables in Vercel:

```bash
# Database (choose one based on your database)
POSTGRES_URL=postgresql://...
# OR
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=...
# OR
MONGODB_URI=mongodb+srv://...

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# OpenAI
OPENAI_API_KEY=sk-...

# Printful
PRINTFUL_API_KEY=...

# Email/SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
SMTP_FROM=...

# Frontend URL (update after deployment)
FRONTEND_URL=https://your-app.vercel.app

# Optional: Canva
CANVA_API_KEY=...
CANVA_BRAND_TEMPLATE_ID=...

# Node Environment
NODE_ENV=production
```

---

## 🚀 Deployment Steps

### Option A: Deploy via Vercel CLI (Recommended)

1. **Login to Vercel**
```bash
vercel login
```

2. **Link Project**
```bash
vercel link
```

3. **Set Environment Variables**
```bash
# Set each variable
vercel env add STRIPE_SECRET_KEY
vercel env add OPENAI_API_KEY
# ... (repeat for all variables)

# Or import from .env file
vercel env pull .env.production
```

4. **Deploy to Production**
```bash
vercel --prod
```

### Option B: Deploy via GitHub Integration

1. **Push to GitHub**
```bash
git push origin main
```

2. **Connect to Vercel**
- Go to https://vercel.com/new
- Import your GitHub repository
- Configure environment variables in the Vercel dashboard
- Deploy

---

## 🔄 Database Migration Script

Create a migration script to move data from SQLite to your production database:

```javascript
// scripts/migrate-to-postgres.js
import Database from 'better-sqlite3';
import { sql } from '@vercel/postgres';

async function migrate() {
  const sqlite = new Database('./database.db');

  // Example: Migrate customers
  const customers = sqlite.prepare('SELECT * FROM customers').all();

  for (const customer of customers) {
    await sql`
      INSERT INTO customers (stripe_customer_id, email, name, phone)
      VALUES (${customer.stripe_customer_id}, ${customer.email}, ${customer.name}, ${customer.phone})
      ON CONFLICT (stripe_customer_id) DO NOTHING
    `;
  }

  console.log('Migration complete!');
  sqlite.close();
}

migrate().catch(console.error);
```

Run migration:
```bash
node scripts/migrate-to-postgres.js
```

---

## 🛠️ Post-Deployment Configuration

### 1. Update Stripe Webhooks
- Go to Stripe Dashboard → Webhooks
- Update webhook URL to: `https://your-app.vercel.app/api/stripe/webhooks`
- Copy the webhook signing secret to Vercel environment variables

### 2. Update Frontend URL
```bash
vercel env add FRONTEND_URL production
# Enter: https://your-app.vercel.app
```

### 3. Test All Features
- [ ] Stripe payments working
- [ ] Email sending working
- [ ] API endpoints responding
- [ ] AI features working (OpenAI)
- [ ] E-commerce integrations working

### 4. Enable Production Monitoring
- Use Vercel Analytics (built-in)
- Configure Sentry for error tracking
- Set up uptime monitoring (UptimeRobot, Pingdom)

---

## 🔍 Troubleshooting

### Issue: "Database connection failed"
**Solution:** Verify database connection string in environment variables

### Issue: "Module not found"
**Solution:** Ensure all dependencies are in `dependencies`, not `devDependencies`

### Issue: "Function timeout"
**Solution:** Vercel has 10-second timeout for hobby plan. Upgrade to Pro for 60 seconds.

### Issue: "SQLite error"
**Solution:** You must migrate to a cloud database. SQLite doesn't work on Vercel.

### Issue: "CORS errors"
**Solution:** Update CORS configuration in server.js:
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
```

---

## 📊 Performance Optimization

### 1. Enable Caching
```javascript
// In your API routes
res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
```

### 2. Use Edge Functions (Optional)
For static data, move to Edge Runtime:
```javascript
export const config = {
  runtime: 'edge',
};
```

### 3. Optimize Database Queries
- Add indexes to frequently queried columns
- Use connection pooling
- Implement query caching

---

## 🔐 Security Checklist

- [ ] All API keys stored in Vercel environment variables
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Webhook signatures validated
- [ ] SQL injection prevention (use parameterized queries)
- [ ] Input validation on all endpoints

---

## 💰 Vercel Pricing Considerations

### Hobby Plan (Free)
- ✅ Perfect for development and testing
- ❌ 100GB bandwidth/month
- ❌ 10-second function timeout
- ❌ No commercial use

### Pro Plan ($20/month per user)
- ✅ Unlimited bandwidth
- ✅ 60-second function timeout
- ✅ Commercial use allowed
- ✅ Analytics included
- **Recommended for production**

---

## 🎯 Quick Deploy (For Testing)

Want to deploy quickly for testing? Use this one-liner:

```bash
vercel --prod --env STRIPE_SECRET_KEY=your_key --env OPENAI_API_KEY=your_key
```

⚠️ **Never commit .env files to git!**

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Postgres Documentation](https://vercel.com/docs/storage/vercel-postgres)
- [Serverless Functions Guide](https://vercel.com/docs/functions/serverless-functions)
- [Environment Variables Guide](https://vercel.com/docs/projects/environment-variables)

---

## 🆘 Need Help?

1. Check Vercel deployment logs: `vercel logs`
2. Review function logs in Vercel dashboard
3. Test locally with: `vercel dev`
4. Contact Vercel support (Pro plan)

---

## ✅ Deployment Complete!

Once deployed, your app will be available at:
- Production: `https://your-app.vercel.app`
- API: `https://your-app.vercel.app/api`

Your automated POD profit system is now live! 🎉
