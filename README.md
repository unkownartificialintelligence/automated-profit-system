# 🚀 Automated POD Profit System

> **Complete SaaS Platform for Print-on-Demand Business Automation**

A production-ready system with **20 enterprise features** across payments, AI automation, e-commerce integrations, analytics, and infrastructure.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/unkownartificialintelligence/automated-profit-system)

---

## ✨ What's Built

✅ **All 20 Features Complete** - 100% implemented and production-ready

### 💳 Phase 1: Revenue Enablers
- Stripe payment integration (checkout, webhooks, invoices)
- Client onboarding system (wizard, emails, training)
- Multi-tenant architecture (unlimited clients with data isolation)

### 🤖 Phase 2: AI Features
- GPT-4 product description generator (SEO optimized, bulk generation)
- Advanced trend predictor (30-60 day forecasts, investment scoring)
- AI keyword optimizer (competition analysis, hashtag generation)

### 🛍️ Phase 3: E-Commerce Integrations
- Shopify integration (OAuth, product sync, orders)
- Etsy integration (automated listings, SEO tags)
- WooCommerce integration (REST API, inventory management)

### 📊 Phase 4: Advanced Analytics
- Customer lifetime value tracking (segmentation, CLV)
- 90-day profit forecasting (trend predictions, confidence intervals)
- Advanced reporting (PDF, CSV exports, scheduled reports)

### 🏢 Phase 5: Enterprise Features
- AI social media content generator (platform-specific posts)
- AI customer service chatbot (GPT-4 powered)
- Email marketing automation (campaigns, abandoned cart)
- Price optimization engine (dynamic pricing, competitor monitoring)

### 🔧 Phase 6: Infrastructure
- White-label system (custom branding, domains)
- Public API & webhooks (rate limiting, usage tracking)
- Advanced security (2FA, IP whitelisting, audit logs)
- Performance monitoring (health checks, error tracking, alerts)

---

## 🚀 Quick Start

### Local Development (All Platforms)

```bash
# 1. Clone repository
git clone https://github.com/unkownartificialintelligence/automated-profit-system.git
cd automated-profit-system

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your API keys

# 4. Initialize databases
npm run setup:all

# 5. Start server
npm start
```

API available at: `http://localhost:3000/api`

---

## ☁️ Deploy to Production

### Option 1: Deploy to Vercel (Recommended)

**For Linux/macOS:**
```bash
./scripts/deploy-to-vercel.sh
```

**For Windows:**
```powershell
.\Quick-Deploy.ps1
```

**Or use Vercel CLI directly:**
```bash
npm install -g vercel
vercel login
npm run deploy
```

### Option 2: One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/unkownartificialintelligence/automated-profit-system)

**⚠️ Important:** Vercel requires a cloud database (SQLite won't work in serverless).

### Deployment Documentation
- 📖 **[Quick Deploy Guide](QUICK-DEPLOY.md)** - Deploy in 5 minutes
- 📚 **[Full Deployment Guide](VERCEL-DEPLOYMENT.md)** - Complete production setup
- 📊 **[All Features Documentation](ALL-PHASES-COMPLETE.md)** - Detailed feature specs

---

## 🔑 Configuration

### Essential Environment Variables

```bash
# Payments (Required)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# AI Features (Required)
OPENAI_API_KEY=sk-...

# POD Integration (Required)
PRINTFUL_API_KEY=...

# Email Notifications (Required)
SMTP_HOST=smtp.gmail.com
SMTP_USER=your@email.com
SMTP_PASS=app_password

# Database (Vercel/Production)
POSTGRES_URL=postgresql://...
```

See `.env.example` for all 20+ configuration options.

---

## 💰 Subscription Packages

| Package | Monthly Price | Key Features |
|---------|--------------|--------------|
| **Starter** | $397 | Basic POD + Printful + 100 products |
| **Professional** | $2,699 | + AI + Shopify/Etsy + 500 products |
| **Enterprise** | $7,699 | + White-label + Advanced AI + 2,000 products |
| **Enterprise Plus** | $12,699 | All features + Custom integrations + 10,000 products |

---

## 📦 Tech Stack

### Backend
- **Runtime**: Node.js 18+ (ES Modules)
- **Framework**: Express.js 4.21
- **Database**: SQLite (local) / PostgreSQL (production)
- **Payment**: Stripe 19.2
- **AI**: OpenAI GPT-4
- **Security**: JWT, bcrypt, Helmet, CORS

### Integrations
- **POD**: Printful API
- **Trends**: Google Trends API
- **E-commerce**: Shopify, Etsy, WooCommerce
- **Email**: Nodemailer + SMTP

### Frontend (Included)
- **Framework**: React 18 + Vite
- **State**: TanStack Query 5.59
- **Styling**: Tailwind CSS 3.4
- **Charts**: Recharts 2.14

---

## 📊 API Documentation

Base URL: `https://your-domain.com/api` or `http://localhost:3000/api`

### Core Endpoints

```
GET  /api/health                       - System health check
POST /api/stripe/checkout/session      - Create payment
POST /api/stripe/webhooks              - Stripe webhooks
POST /api/onboarding/init              - Initialize onboarding
POST /api/ai/product-descriptions/generate  - Generate descriptions
GET  /api/ai/trends/predict            - Trend predictions
POST /api/ai/keywords/optimize         - SEO keywords
POST /api/integrations/shopify/auth    - Shopify OAuth
POST /api/integrations/etsy/listings/create  - Create Etsy listing
GET  /api/analytics/clv/:tenantId      - Customer lifetime value
GET  /api/analytics/forecast/:tenantId - Profit forecasting
POST /api/enterprise/chatbot/query     - AI chatbot
POST /api/enterprise/pricing/optimize  - Price optimization
GET  /api/infrastructure/monitoring/health  - System monitoring
```

See individual route files in `src/routes/` for complete API documentation.

---

## 🗄️ Database Architecture

**30+ Tables** organized into:

- **Payment System** (6 tables): customers, subscriptions, payments, invoices, packages, webhooks
- **Onboarding** (7 tables): progress, checklist, emails, templates, configs, training, tracking
- **Multi-Tenant** (7 tables): tenants, users, api_keys, usage, products, sales, invitations
- **Team Management** (5 tables): tiers, members, profits, revenue_shares, payouts
- **Supporting**: admin_logs, webhook_events, etc.

All tables include:
- ✅ Proper indexes
- ✅ Foreign key constraints
- ✅ Automated triggers
- ✅ Timestamp tracking

---

## 🔐 Security Features

- ✅ Two-factor authentication (2FA)
- ✅ IP whitelisting per tenant
- ✅ Rate limiting (100 req/15min)
- ✅ JWT authentication
- ✅ Encrypted API key storage
- ✅ Comprehensive audit logs
- ✅ CORS protection
- ✅ Helmet security headers
- ✅ SQL injection prevention
- ✅ Session management

---

## 📈 Monitoring & Health

Built-in monitoring endpoints:

```bash
# System health
GET /api/infrastructure/monitoring/health

# Performance metrics per tenant
GET /api/infrastructure/monitoring/metrics/:tenantId

# Error tracking
POST /api/infrastructure/monitoring/errors

# Audit logs
GET /api/infrastructure/security/audit-logs/:tenantId
```

---

## 🛠️ Development Commands

```bash
# Start development server
npm run dev

# Initialize all databases
npm run setup:all

# Individual database setup
npm run setup:payments
npm run setup:onboarding
npm run setup:multi-tenant

# Test in Vercel environment
npm run vercel:dev

# Deploy to Vercel
npm run deploy              # Production
npm run deploy:preview      # Preview/testing
```

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [ALL-PHASES-COMPLETE.md](ALL-PHASES-COMPLETE.md) | Complete feature documentation |
| [QUICK-DEPLOY.md](QUICK-DEPLOY.md) | 5-minute deployment guide |
| [VERCEL-DEPLOYMENT.md](VERCEL-DEPLOYMENT.md) | Full production deployment |
| [.env.example](.env.example) | Environment variables reference |

---

## 🐛 Troubleshooting

### Common Issues

**"Database connection failed" on Vercel**
- Solution: Set up cloud database (Vercel Postgres recommended)
- See [VERCEL-DEPLOYMENT.md](VERCEL-DEPLOYMENT.md)

**"Module not found"**
- Solution: `npm install` then redeploy
- Check all imports use `.js` extensions

**"Function timeout"**
- Solution: Upgrade to Vercel Pro ($20/mo) for 60s timeout
- Free tier limited to 10s

**"CORS errors"**
- Solution: Update `FRONTEND_URL` environment variable
- Check CORS configuration in `src/server.js`

---

## 🧪 Testing

```bash
# Health check
curl http://localhost:3000/api/health

# Test Stripe integration
curl -X POST http://localhost:3000/api/stripe/checkout/session \
  -H "Content-Type: application/json" \
  -d '{"packageId": 1}'

# Test AI features
curl -X POST http://localhost:3000/api/ai/product-descriptions/generate \
  -H "Content-Type: application/json" \
  -d '{"productName": "Cool T-Shirt", "productType": "t-shirt"}'
```

---

## 🎯 Deployment Checklist

### Pre-Deployment
- [ ] Configure all environment variables
- [ ] Set up cloud database
- [ ] Test locally with `npm start`
- [ ] Verify all API keys work
- [ ] Review security settings

### Post-Deployment
- [ ] Update Stripe webhook URL
- [ ] Test payment flow
- [ ] Verify email sending
- [ ] Check AI features
- [ ] Test e-commerce integrations
- [ ] Enable monitoring
- [ ] Configure alerts

---

## 💡 Pro Tips

1. **Use Preview Deployments**: Every git push creates a preview deployment on Vercel
2. **Monitor Logs**: Use `vercel logs` to debug issues
3. **Test Locally**: Use `vercel dev` to test in Vercel's environment
4. **Rate Limit**: Consider upgrading to Pro plan for production
5. **Database**: Migrate to cloud database before deploying to Vercel

---

## 🆘 Support

- 📖 Read the [deployment guides](VERCEL-DEPLOYMENT.md)
- 🐛 [Report issues](https://github.com/unkownartificialintelligence/automated-profit-system/issues)
- 💬 Contact: mj@jerzii.com

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

---

## 📝 License

Proprietary - All Rights Reserved

---

## 🎉 Start Making Money!

```bash
# Local development
npm install && npm run setup:all && npm start

# Deploy to production
./scripts/deploy-to-vercel.sh

# Or one-click deploy
# Click the "Deploy with Vercel" button at the top
```

---

**Built for POD Entrepreneurs** • **20 Features** • **Production-Ready** • **Deploy in Minutes**

*Transform your print-on-demand business with AI-powered automation* 🚀💰
