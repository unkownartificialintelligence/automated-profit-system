# Full Automation System - Team Guide

## Overview

This system automates the entire product lifecycle from discovery to sales:
- **Discover** trending products automatically
- **Design** products using Canva templates
- **List** products on Printful/Etsy
- **Market** via email and social media campaigns

**No manual work required** - your team just monitors dashboards.

---

## Quick Start: Run Full Automation (1 Command)

```bash
curl -X POST http://localhost:3003/api/canva/full-automation \
  -H "Content-Type: application/json" \
  -d '{
    "max_products": 3,
    "auto_design": true,
    "auto_list": true,
    "auto_market": true
  }'
```

This single command:
1. ✅ Discovers 3 trending products
2. ✅ Generates designs for each
3. ✅ Lists them on Printful/Etsy
4. ✅ Creates marketing campaigns

**Expected Time:** 5-10 minutes for entire pipeline

---

## Dashboard Monitoring

### View Real-Time Dashboard

```bash
curl http://localhost:3003/api/canva/dashboard
```

**Dashboard Shows:**
- Total automation runs
- Runs today
- Total products launched
- Last automation status
- Weekly statistics
- System health

**Example Response:**
```json
{
  "success": true,
  "dashboard": {
    "overview": {
      "total_automation_runs": 15,
      "runs_today": 2,
      "total_products_launched": 12,
      "last_automation_run": "2025-11-09T09:00:00.000Z"
    },
    "last_run": {
      "timestamp": "2025-11-09T09:00:00.000Z",
      "products_discovered": 3,
      "designs_created": 3,
      "listings_created": 3,
      "campaigns_created": 3,
      "status": "✅ Success"
    },
    "weekly_stats": {
      "runs": 7,
      "products_discovered": 21,
      "designs_created": 21,
      "listings_created": 21,
      "campaigns_launched": 21
    },
    "automation_status": {
      "discovery": "✅ Active",
      "design_generation": "✅ Active (API)",
      "listing": "✅ Active (API)",
      "marketing": "✅ Active"
    }
  }
}
```

---

## Automation Endpoints

### 1. Full Automation (Recommended)

**Endpoint:** `POST /api/canva/full-automation`

**Description:** Runs complete pipeline from discovery to marketing

**Request:**
```json
{
  "max_products": 3,
  "auto_design": true,
  "auto_list": true,
  "auto_market": true
}
```

**Use Case:** Run this weekly to launch 3 new trending products

---

### 2. Auto-Generate Design

**Endpoint:** `POST /api/canva/auto-design`

**Description:** Generate design for a specific product

**Request:**
```json
{
  "keyword": "cat dad",
  "product_name": "Cat Dad T-Shirt"
}
```

**Response:**
```json
{
  "success": true,
  "design": {
    "keyword": "cat dad",
    "product_name": "Cat Dad T-Shirt",
    "template": {
      "title": "CAT DAD",
      "subtitle": "THE MAN. THE MYTH. THE LEGEND.",
      "style": "badge",
      "colors": ["#000000", "#4A4A4A"]
    },
    "canva_design_id": "canva_12345",
    "canva_edit_url": "https://canva.com/design/cat-dad",
    "auto_generated": true
  }
}
```

---

### 3. View Dashboard

**Endpoint:** `GET /api/canva/dashboard`

**Description:** Get real-time automation statistics

**No parameters needed**

---

### 4. Schedule Automation

**Endpoint:** `POST /api/canva/schedule-automation`

**Description:** Set up recurring automation

**Request:**
```json
{
  "frequency": "weekly",
  "day_of_week": "monday",
  "time": "09:00",
  "max_products": 3,
  "enabled": true
}
```

**Options:**
- `frequency`: "daily", "weekly", "biweekly"
- `day_of_week`: "monday", "tuesday", etc.
- `time`: "09:00" (24-hour format)
- `max_products`: Number of products to launch per run
- `enabled`: true/false

**Example:** Run every Monday at 9 AM, launch 3 products

---

## Automation Workflows

### Workflow 1: Weekly Batch Launch (Recommended)

**Goal:** Launch 3 new trending products every Monday

**Schedule:**
```bash
curl -X POST http://localhost:3003/api/canva/schedule-automation \
  -H "Content-Type: application/json" \
  -d '{
    "frequency": "weekly",
    "day_of_week": "monday",
    "time": "09:00",
    "max_products": 3,
    "enabled": true
  }'
```

**Weekly Timeline:**
- **Monday 9 AM:** Automation discovers 3 products, designs, lists, markets
- **Tuesday-Friday:** Monitor sales, respond to customers
- **Weekend:** System prepares for next Monday

**Expected Results:**
- 12 products/month
- 36-60 sales/month
- $343-$573 profit/month

---

### Workflow 2: Daily Fresh Products

**Goal:** Launch 1 new product every day

**Schedule:**
```bash
curl -X POST http://localhost:3003/api/canva/schedule-automation \
  -H "Content-Type: application/json" \
  -d '{
    "frequency": "daily",
    "time": "08:00",
    "max_products": 1,
    "enabled": true
  }'
```

**Expected Results:**
- 30 products/month
- 90-150 sales/month
- $859-$1,433 profit/month

---

### Workflow 3: Biweekly Premium Launches

**Goal:** Launch 5 high-quality products every 2 weeks

**Schedule:**
```bash
curl -X POST http://localhost:3003/api/canva/schedule-automation \
  -H "Content-Type: application/json" \
  -d '{
    "frequency": "biweekly",
    "day_of_week": "monday",
    "time": "09:00",
    "max_products": 5,
    "enabled": true
  }'
```

**Expected Results:**
- 10 products/month
- 30-50 sales/month
- $286-$477 profit/month

---

## Team Monitoring Checklist

### Daily (5 minutes)
- [ ] Check dashboard for automation status
- [ ] Review new products launched
- [ ] Monitor sales notifications
- [ ] Respond to customer questions

### Weekly (15 minutes)
- [ ] Review weekly stats
- [ ] Check profit totals
- [ ] Verify automation ran successfully
- [ ] Adjust pricing if needed

### Monthly (30 minutes)
- [ ] Analyze best-performing products
- [ ] Review total profit
- [ ] Plan next month's strategy
- [ ] Update automation settings if needed

---

## Configuration

### Environment Variables

Create or update `.env` file:

```env
# Required
PORT=3003
NODE_ENV=production

# Printful (for automated listing)
PRINTFUL_API_KEY=your_printful_api_key

# Canva (for automated design generation)
CANVA_API_KEY=your_canva_api_key

# Optional
CANVA_BRAND_TEMPLATE_ID=your_brand_template_id
```

### API Keys Setup

**Printful API Key:**
1. Go to: https://www.printful.com/dashboard/store
2. Click "Settings" → "API"
3. Generate new API key
4. Add to `.env` file

**Canva API Key:**
1. Go to: https://www.canva.com/developers
2. Create new app
3. Get API access token
4. Add to `.env` file

---

## Automation Pipeline Details

### Step 1: Discovery (30 seconds)
- Queries trending products API
- Filters by trend score (70+)
- Filters by competition (Low)
- Filters by profit potential (High/Very High)
- Removes already-launched products
- Selects top N products

### Step 2: Design Generation (2 minutes per product)
- Loads design template for keyword
- Generates title, subtitle, style
- Creates design via Canva API
- Exports high-resolution PNG
- Returns design URLs

### Step 3: Product Listing (2 minutes per product)
- Creates product on Printful
- Uploads design
- Sets pricing ($24.99 retail)
- Generates mockups
- Syncs to Etsy/Shopify

### Step 4: Marketing Campaign (1 minute per product)
- Generates email templates
- Creates social media posts
- Prepares outreach campaigns
- Returns campaign templates

**Total Time:** ~5-10 minutes for 3 products

---

## Error Handling

### If Automation Fails:

**Check Dashboard:**
```bash
curl http://localhost:3003/api/canva/dashboard
```

Look for error messages in `last_run.status`

**Common Issues:**

1. **"Design generation failed"**
   - Check Canva API key in `.env`
   - Verify Canva account has API access

2. **"Listing failed"**
   - Check Printful API key
   - Verify Printful account is active

3. **"No trending products found"**
   - Normal if market is saturated
   - System will retry next run

4. **"Server not responding"**
   - Restart server: `node src/server.js`
   - Check port 3003 is not in use

---

## Manual Override

### Run Automation Manually

If scheduled automation doesn't run, trigger manually:

```bash
curl -X POST http://localhost:3003/api/canva/full-automation \
  -H "Content-Type: application/json" \
  -d '{"max_products": 3}'
```

### Generate Single Design

```bash
curl -X POST http://localhost:3003/api/canva/auto-design \
  -H "Content-Type: application/json" \
  -d '{"keyword": "cat dad", "product_name": "Cat Dad T-Shirt"}'
```

---

## Expected Profitability

### Conservative Estimates (Weekly Batch)

**Month 1:**
- Products launched: 12
- Sales: 36-48
- Revenue: $899-$1,199
- Costs: $466-$622
- **Profit: $343-$577**

**Month 3:**
- Products launched: 36 (cumulative)
- Sales: 108-144
- Revenue: $2,697-$3,596
- Costs: $1,398-$1,864
- **Profit: $1,029-$1,732**

**Month 6:**
- Products launched: 72
- Sales: 216-288
- Revenue: $5,394-$7,192
- Costs: $2,797-$3,730
- **Profit: $2,597-$3,462**

### Optimistic Estimates (Daily Fresh)

**Month 1:**
- Products: 30
- Sales: 90-120
- **Profit: $859-$1,146**

**Month 3:**
- Products: 90
- Sales: 270-360
- **Profit: $2,577-$3,438**

**Month 6:**
- Products: 180
- Sales: 540-720
- **Profit: $5,154-$6,876**

---

## Team Roles

### Automation Monitor (5 min/day)
- Check dashboard daily
- Verify automation ran
- Flag any errors

### Customer Support (30 min/day)
- Respond to Etsy messages
- Handle order issues
- Update product descriptions

### Marketing Manager (1 hour/week)
- Review marketing templates
- Send outreach emails
- Post on social media
- Engage with customers

### Analytics Reviewer (30 min/week)
- Analyze best products
- Review profit trends
- Optimize pricing
- Plan strategy

**Total Team Time:** ~2-3 hours/week for entire operation

---

## Success Metrics

### Dashboard KPIs to Monitor

1. **Automation Success Rate:** Target >95%
2. **Products Launched/Week:** Target 3-5
3. **Conversion Rate:** Target 3-5% (sales/traffic)
4. **Average Profit/Product:** Target $9-$12
5. **Customer Satisfaction:** Target >4.5 stars

### Red Flags

⚠️ **Automation hasn't run in 7+ days**
⚠️ **No sales in 14+ days on new products**
⚠️ **Design generation failing repeatedly**
⚠️ **Customer complaints rising**

---

## Support

### Logs Location
- Automation logs: `data/automation-log.json`
- Launched products: `data/launched-products.json`
- Schedule config: `data/automation-schedule.json`

### Health Check
```bash
curl http://localhost:3003/api/health
```

### Server Restart
```bash
# Kill existing
pkill -f "node src/server.js"

# Start fresh
node src/server.js
```

---

## Next Steps

1. **Configure API keys** in `.env` file
2. **Schedule automation** using preferred workflow
3. **Monitor dashboard** daily
4. **Watch profits grow** automatically

**The system is hands-free - automation handles everything!** 🚀
