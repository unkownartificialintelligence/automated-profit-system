# 🎭 DEMO ACCOUNT - Paper Trail System

## Quick Demo Setup

```bash
# Create demo account with sample data
npm run setup:demo

# Start the server
npm start
```

## 📧 Demo Credentials

### Customer Account
- **Email:** `demo@papertrail.jerzii-ai.com`
- **Business Name:** Paper Trail Demo Store
- **Tenant Slug:** `paper-trail-demo`

### Team Member Logins
All team members use password: `demo123`

1. **Owner Account**
   - Email: `owner@papertrail.demo`
   - Role: Owner
   - Access: Full system access

2. **Manager Account**
   - Email: `manager@papertrail.demo`
   - Role: Admin
   - Access: Product & sales management

3. **Designer Account**
   - Email: `designer@papertrail.demo`
   - Role: Member
   - Access: Product creation & viewing

## 📊 Demo Data Included

### Products (5 items)
1. **Motivational Quote T-Shirt** - $24.99
2. **Coffee Lover Mug** - $16.99
3. **Minimalist Tote Bag** - $22.99
4. **Inspirational Poster** - $29.99
5. **Comfort Hoodie** - $44.99

### Sales Data (15 transactions)
- **Total Revenue:** $761.69
- **Total Profit:** $385.69
- **Profit Margin:** 50.6%
- **Average Order:** $50.78

### Subscription
- **Plan:** Professional ($79/month)
- **Status:** Active
- **Features:**
  - Unlimited products
  - AI product descriptions
  - Trend analysis
  - Email automation
  - Priority support
  - Advanced analytics

### Onboarding Status
- **Completion:** 7/7 steps completed
- **Status:** Fully onboarded and ready to use

## 🔗 API Endpoints for Demo

```bash
# Base URL
http://localhost:3000/api

# Tenant endpoints
GET /api/tenants/paper-trail-demo
GET /api/tenants/paper-trail-demo/products
GET /api/tenants/paper-trail-demo/sales
GET /api/tenants/paper-trail-demo/analytics

# Customer endpoints
GET /api/stripe/customers/4
GET /api/stripe/subscriptions/customer/4

# Onboarding endpoints
GET /api/onboarding/progress/4
GET /api/onboarding/checklist/4
```

## 🎬 Demo Scenarios

### Scenario 1: Show Dashboard & Analytics
1. Start server: `npm start`
2. Navigate to tenant endpoint
3. Show real-time analytics:
   - Revenue trends
   - Top products
   - Profit margins
4. Demonstrate filtering and date ranges

### Scenario 2: Product Management
1. View product catalog
2. Show product details with metadata
3. Demonstrate profit margin calculations
4. Show Printful integration data

### Scenario 3: Multi-Tenant Isolation
1. Show tenant slug system
2. Demonstrate data isolation
3. Show team member roles
4. Explain white-label capabilities

### Scenario 4: Complete Customer Journey
1. Customer signs up (onboarding)
2. Chooses subscription plan
3. Completes 7-step onboarding
4. Invites team members
5. Adds products
6. Tracks first sales
7. Views analytics

### Scenario 5: Subscription Management
1. Show active subscription
2. Demonstrate plan features
3. Show billing history
4. Explain upgrade path

## 💡 Talking Points for Clients

### Pain Points This Solves
- ✅ **Manual Product Management** → Automated sync with Printful
- ✅ **No Sales Visibility** → Real-time analytics dashboard
- ✅ **Team Chaos** → Multi-user access with roles
- ✅ **Profit Confusion** → Automatic profit calculations
- ✅ **Complex Setup** → 7-step guided onboarding

### Key Features to Highlight
1. **Multi-Tenant Architecture**
   - Complete data isolation
   - Custom branding per tenant
   - Scalable to thousands of clients

2. **Automated Workflows**
   - Auto-sync with Printful
   - Email notifications
   - Order fulfillment tracking

3. **Team Collaboration**
   - Role-based permissions
   - Activity tracking
   - Profit sharing system

4. **AI-Powered Tools**
   - Product description generation
   - Trend prediction
   - Keyword optimization
   - Social media content

5. **Complete Analytics**
   - Revenue tracking
   - Profit margins
   - Best-selling products
   - Customer insights

## 🚀 Client Onboarding Flow

### What The Client Sees:

**Step 1: Account Setup** (Day 1)
- Welcome email sent automatically
- Profile completion form
- Business details collection

**Step 2: Connect Printful** (Day 1-2)
- API key integration
- Product catalog sync
- Fulfillment setup

**Step 3: Add Products** (Day 2-3)
- Import from Printful
- Set pricing
- Add descriptions

**Step 4: Configure Payments** (Day 3)
- Stripe integration
- Payment methods
- Pricing tiers

**Step 5: Email Setup** (Day 3-4)
- SMTP configuration
- Email templates
- Notification preferences

**Step 6: Team Members** (Day 4-5)
- Invite team
- Set roles
- Profit sharing (optional)

**Step 7: Launch!** (Day 5-7)
- Final checklist
- Go-live confirmation
- Celebration email 🎉

## 📞 Client FAQs

**Q: How long does setup take?**
A: With our guided onboarding, most clients are live in 5-7 days.

**Q: Can I use my own branding?**
A: Yes! Professional and Enterprise plans include custom branding and white-label options.

**Q: How does team access work?**
A: You can invite unlimited team members with customizable roles (Owner, Admin, Member, Viewer).

**Q: Is my data secure?**
A: Yes. We use multi-tenant architecture with complete data isolation. Your data is never mixed with other clients.

**Q: Can I track profitability?**
A: Absolutely! Every sale automatically calculates profit margins, and our dashboard shows real-time profitability.

**Q: What integrations are supported?**
A: Currently: Printful, Shopify, Etsy, WooCommerce, Stripe, OpenAI. More coming soon!

## 🎯 Demo Success Metrics

Track these during your demo:

- ✅ Show loading speed (< 2 seconds)
- ✅ Demonstrate real-time updates
- ✅ Highlight profit calculations
- ✅ Show mobile responsiveness
- ✅ Prove data isolation
- ✅ Emphasize ease of use

## 🔄 Resetting Demo Data

To reset and recreate demo data:

```bash
# Delete and recreate demo account
npm run setup:demo

# Or manually:
node scripts/setup-demo-account.js
```

## 📝 Notes for Sales Team

### Pricing to Mention
- **Starter:** $29/month - Basic features, 100 products
- **Professional:** $79/month - AI tools, unlimited products **(DEMO USES THIS)**
- **Enterprise:** $199/month - White-label, API access
- **Enterprise Plus:** Custom pricing - Dedicated support, custom integrations

### Upsell Opportunities
1. White-label branding
2. Custom domain
3. API access for integrations
4. Dedicated account manager
5. Custom development

### Common Objections & Responses

**"It looks complicated"**
→ Show the 7-step onboarding. Most clients are live in under a week.

**"I already have a system"**
→ We integrate with existing tools. Show the integrations page.

**"Too expensive"**
→ Calculate ROI: If we save you 10 hours/month at $50/hr, that's $500 in value for $79/month.

**"What if I need help?"**
→ Professional plan includes priority support. Show response times.

**"Can it scale?"**
→ Show multi-tenant architecture. We handle thousands of products and users.

## 🎉 Closing the Sale

After the demo:

1. **Ask:** "Which subscription plan fits your needs?"
2. **Offer:** "We have an onboarding specialist who can get you live this week"
3. **Provide:** Trial period or money-back guarantee
4. **Create urgency:** "We have 3 onboarding slots left this month"
5. **Follow up:** Send this demo credentials doc + pricing sheet

---

**Remember:** This is a fully functional demo with real data. Everything works exactly as it would for a paying client!

For questions or support: support@jerzii-ai.com
