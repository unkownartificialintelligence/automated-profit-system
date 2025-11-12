# 🚀 Unified Deployment Guide

## ONE Script to Deploy EVERYWHERE!

This guide shows you how to deploy your **entire automated profit system** to **both Vercel AND Render** using the new unified deployment system.

---

## ✨ What's New?

### **master-automation.js** - The Powerhouse
A single script that combines ALL sessions into ONE automated system:

✅ **Global Trending Discovery** - Finds trending products from 10+ countries
✅ **AI Design Generation** - Creates beautiful designs automatically
✅ **Printful Integration** - Creates products on Printful
✅ **Store Listings** - Publishes to Etsy/Shopify
✅ **Marketing Automation** - Generates social media content
✅ **Team Profit Tracking** - Manages revenue sharing
✅ **Personal Sales Monitoring** - Tracks your income

### **deploy-unified.sh** - One Command Deployment
Deploy to both platforms with a single command!

---

## 🎯 Quick Start

### 1. Install Requirements

```bash
# Install Node.js (if not already installed)
# Visit: https://nodejs.org

# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login
```

### 2. Configure Environment Variables

Create or update your `.env` file:

```bash
# Required
JWT_SECRET=your-super-secure-random-string-32-characters-minimum
NODE_ENV=production

# API Keys (Optional but recommended)
PRINTFUL_API_KEY=your-printful-key
CANVA_API_KEY=your-canva-key
STRIPE_API_KEY=your-stripe-key
OPENAI_API_KEY=your-openai-key

# Automation Settings
MAX_PRODUCTS=5
GENERATE_DESIGNS=true
CREATE_LISTINGS=true
GENERATE_MARKETING=true
GLOBAL_TRENDING=true
TRENDING_REGIONS=US,GB,CA,AU,DE,FR,JP,BR,IN,MX

# Cron Security (for Vercel)
CRON_SECRET=your-secret-for-cron-jobs
```

### 3. Deploy to BOTH Platforms

```bash
# Make script executable
chmod +x deploy-unified.sh

# Deploy to both Vercel AND Render
./deploy-unified.sh
```

That's it! Your system is now live on both platforms! 🎉

---

## 📱 Platform-Specific Deployment

### Deploy to Vercel Only

```bash
./deploy-unified.sh vercel
```

**What happens:**
- Deploys your app to Vercel
- Sets up serverless functions
- Configures cron jobs for automation
- Returns your live URL

### Deploy to Render Only

```bash
./deploy-unified.sh render
```

**What happens:**
- Pushes to GitHub
- Render auto-deploys from your repo
- Starts web service
- Starts automation worker service

---

## ⚙️ How Automation Works

### On Vercel

**Cron Jobs** (defined in `vercel.json`):
- Runs every Monday at 9:00 AM
- Triggers `/api/automation/cron` endpoint
- Executes master automation script
- Completely serverless

**Manual Trigger:**
```bash
curl -X POST https://your-app.vercel.app/api/automation/cron \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### On Render

**Worker Process** (defined in `render.yaml`):
- Runs `master-automation.js --daemon`
- Always running in background
- Scheduled automation every week
- Independent from web service

**Check Status:**
```bash
# SSH into Render or check logs in dashboard
```

### Local Development

```bash
# Run automation once
node master-automation.js --immediate

# Run as daemon with scheduler
node master-automation.js --daemon

# Check status
node master-automation.js --status
```

---

## 🔧 Environment Variables for Each Platform

### Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add all variables from `.env`

**Critical Variables:**
- `JWT_SECRET` - Security token
- `CRON_SECRET` - Protects cron endpoint
- `NODE_ENV` - Set to `production`
- `PRINTFUL_API_KEY` - Your Printful key

### Render Dashboard

1. Go to https://dashboard.render.com
2. Select your service
3. Go to **Environment**
4. Add all variables from `.env`

**Note:** Render automatically loads environment variables to both web and worker services.

---

## 📊 Features Comparison

| Feature | Vercel | Render | Local |
|---------|--------|--------|-------|
| **Web Server** | ✅ Serverless | ✅ Always-on | ✅ Dev mode |
| **Automation** | ✅ Cron jobs | ✅ Worker process | ✅ Manual/Daemon |
| **Database** | ⚠️ External only | ✅ Persistent disk | ✅ SQLite |
| **Cost** | Free tier | Free tier | Free |
| **Scalability** | Auto-scale | Manual scale | N/A |
| **Best For** | API & Frontend | Full-stack | Development |

---

## 🎛️ Automation Configuration

### Settings via Environment Variables

```bash
# Maximum products to process per automation run
MAX_PRODUCTS=5

# Enable/disable specific features
GENERATE_DESIGNS=true        # AI design generation
CREATE_LISTINGS=true         # Create store listings
GENERATE_MARKETING=true      # Generate marketing content
GLOBAL_TRENDING=true         # Global trending discovery

# Regions for trending discovery (comma-separated)
TRENDING_REGIONS=US,GB,CA,AU,DE,FR,JP,BR,IN,MX
```

### Schedule Configuration

**Default Schedule:** Every Monday at 9:00 AM

**Change Schedule:**

Edit `master-automation.js`:
```javascript
const CONFIG = {
  SCHEDULE: {
    WEEKLY: '0 9 * * 1',      // Every Monday at 9 AM
    DAILY: '0 9 * * *',       // Every day at 9 AM
    SIXHOURLY: '0 */6 * * *', // Every 6 hours
  }
}
```

Or edit `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/automation/cron",
      "schedule": "0 9 * * 1"
    }
  ]
}
```

---

## 📈 Monitoring & Logs

### View Automation Logs

**Local:**
```bash
# View log file
cat data/master-automation.log

# Watch logs in real-time
tail -f data/master-automation.log
```

**Vercel:**
1. Dashboard → Your Project → **Functions**
2. Click on `/api/automation/cron`
3. View execution logs

**Render:**
1. Dashboard → Your Service → **Logs**
2. Filter by "automation-worker"
3. View real-time logs

### Check Automation Status

```bash
node master-automation.js --status
```

Output:
```json
{
  "last_run": "2025-11-12T09:00:00.000Z",
  "total_runs": 42,
  "total_products_created": 210,
  "total_designs_generated": 189,
  "total_listings_created": 156,
  "total_marketing_campaigns": 210,
  "errors": [],
  "started_at": "2025-10-01T00:00:00.000Z"
}
```

---

## 🚨 Troubleshooting

### Deployment Issues

**Problem:** Vercel deployment fails
```bash
# Solution: Check logs
vercel logs

# Redeploy
vercel --prod --force
```

**Problem:** Render not deploying
```bash
# Solution: Check GitHub push
git status
git push origin main

# Check Render dashboard for errors
```

### Automation Not Running

**Vercel:**
1. Check cron job is configured in `vercel.json`
2. Verify `CRON_SECRET` environment variable
3. Check function logs for errors

**Render:**
1. Verify worker service is running
2. Check worker logs for errors
3. Ensure `master-automation.js` is executable

**Both:**
```bash
# Test automation manually
node master-automation.js --immediate
```

### Environment Variable Issues

**Problem:** Missing API keys
```bash
# Solution: Add to platform dashboard
# Vercel: Settings → Environment Variables
# Render: Environment tab

# Verify locally first
cat .env
```

---

## 💡 Best Practices

### 1. Use Both Platforms

**Why?**
- **Redundancy:** If one platform has issues, the other keeps running
- **Free Tier:** Both have generous free tiers
- **Best of Both:** Vercel for speed, Render for persistence

### 2. Monitor Regularly

- Check logs weekly
- Review automation status
- Monitor API quotas (Printful, Canva, etc.)

### 3. Start Small

- Begin with `MAX_PRODUCTS=3`
- Test automation thoroughly
- Gradually increase as you scale

### 4. Secure Your Secrets

- Use strong `JWT_SECRET` (32+ characters)
- Keep `CRON_SECRET` private
- Never commit `.env` to git

### 5. Test Locally First

```bash
# Always test before deploying
node master-automation.js --immediate

# Check for errors
node master-automation.js --status
```

---

## 🎯 Advanced Usage

### Custom Automation Schedule

Create custom schedules in `master-automation.js`:

```javascript
// Run every day at specific times
cron.schedule('0 9,14,18 * * *', async () => {
  await runMasterAutomation();
});

// Run on specific days
cron.schedule('0 9 * * 1,3,5', async () => {
  await runMasterAutomation();
});
```

### Selective Feature Execution

Run specific modules only:

```javascript
// In master-automation.js
const CONFIG = {
  AUTOMATION: {
    GLOBAL_TRENDING: true,   // Enable
    GENERATE_DESIGNS: false,  // Disable
    CREATE_LISTINGS: true,    // Enable
    GENERATE_MARKETING: false // Disable
  }
}
```

### Multi-Region Deployment

Deploy to multiple Vercel regions:

```json
// vercel.json
{
  "regions": ["iad1", "sfo1", "cdg1"]
}
```

---

## 📞 Support & Resources

### Documentation
- [Vercel Docs](https://vercel.com/docs)
- [Render Docs](https://render.com/docs)
- [Node-Cron Syntax](https://github.com/node-cron/node-cron)

### Quick Commands Reference

```bash
# Deployment
./deploy-unified.sh              # Both platforms
./deploy-unified.sh vercel       # Vercel only
./deploy-unified.sh render       # Render only

# Automation
node master-automation.js --immediate    # Run now
node master-automation.js --daemon       # Background service
node master-automation.js --status       # Check status

# Logs
tail -f data/master-automation.log       # Local logs
vercel logs                              # Vercel logs
# (Render logs via dashboard)
```

---

## 🎉 You're All Set!

Your automated profit system is now running on **both Vercel and Render**!

**Next Steps:**
1. ✅ Monitor your first automation run
2. ✅ Review generated products and designs
3. ✅ Check profit tracking
4. ✅ Scale up `MAX_PRODUCTS` as needed
5. ✅ Celebrate your automated empire! 🚀

---

**Questions?** Check the logs first:
- Local: `data/master-automation.log`
- Vercel: Dashboard → Functions → Logs
- Render: Dashboard → Service → Logs

**Happy automating!** 💰
