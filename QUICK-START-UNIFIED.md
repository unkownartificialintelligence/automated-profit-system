# ⚡ Quick Start - Unified Deployment

## 🚀 Deploy to Vercel & Render in 5 Minutes!

### Step 1: Install & Setup (2 minutes)

```bash
# Clone/navigate to your repo
cd automated-profit-system

# Install dependencies
npm install

# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login
```

### Step 2: Configure Environment (1 minute)

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your keys
nano .env
```

**Minimum Required:**
```bash
JWT_SECRET=generate-32-char-random-string
CRON_SECRET=generate-32-char-random-string
NODE_ENV=production
```

**Generate secrets:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 3: Deploy! (2 minutes)

```bash
# Make deployment script executable
chmod +x deploy-unified.sh

# Deploy to BOTH platforms
./deploy-unified.sh
```

**Done!** Your system is live on both Vercel and Render! 🎉

---

## 📱 Quick Commands

### Deployment
```bash
./deploy-unified.sh          # Deploy to both
./deploy-unified.sh vercel   # Vercel only
./deploy-unified.sh render   # Render only
```

### Run Automation Locally
```bash
node master-automation.js --immediate   # Run now
node master-automation.js --daemon      # Background service
node master-automation.js --status      # Check status
```

### View Logs
```bash
tail -f data/master-automation.log      # Local logs
vercel logs                             # Vercel logs
# Render: Check dashboard
```

---

## 🎯 What Gets Deployed

### On Vercel
- ✅ Web API & Frontend
- ✅ Serverless functions
- ✅ **Automated cron jobs (runs every Monday at 9 AM)**
- ✅ Auto-scaling

### On Render
- ✅ Web Service (always-on)
- ✅ **Worker Process (runs automation 24/7)**
- ✅ Persistent SQLite database
- ✅ Background jobs

---

## ⚙️ Platform Dashboards

### Vercel
1. Visit: https://vercel.com/dashboard
2. Add environment variables (Settings → Environment Variables)
3. Monitor cron jobs (Functions tab)

**Required Variables:**
- `JWT_SECRET`
- `CRON_SECRET`
- `NODE_ENV=production`
- `PRINTFUL_API_KEY` (if using Printful)

### Render
1. Visit: https://dashboard.render.com
2. Add environment variables (Environment tab)
3. Monitor both services:
   - `automated-profit-system` (web)
   - `automation-worker` (background)

**Required Variables:**
- Same as Vercel (above)

---

## 📊 Automation Features

### What Runs Automatically:

1. **Global Trending Discovery** 🌍
   - Searches 10+ countries for trending products
   - Filters for print-on-demand opportunities

2. **AI Design Generation** 🎨
   - Creates designs based on trends
   - Generates color schemes & layouts

3. **Printful Integration** 🏭
   - Creates products automatically
   - Sets pricing & variants

4. **Store Listings** 🏪
   - Publishes to Etsy/Shopify
   - Generates SEO-optimized titles & descriptions

5. **Marketing Content** 📢
   - Social media posts
   - Email campaigns
   - Product descriptions

6. **Profit Tracking** 💰
   - Team revenue sharing
   - Personal sales monitoring
   - ROI analytics

---

## 🔧 Configuration

### Change Automation Schedule

Edit `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/automation/cron",
    "schedule": "0 9 * * *"  // Daily at 9 AM
  }]
}
```

### Adjust Processing Limits

Set in `.env`:
```bash
MAX_PRODUCTS=5              # Products per run
TRENDING_REGIONS=US,GB,CA   # Countries to check
```

### Enable/Disable Features

Set in `.env`:
```bash
GENERATE_DESIGNS=true
CREATE_LISTINGS=true
GENERATE_MARKETING=false    # Disable marketing
GLOBAL_TRENDING=true
```

---

## 🚨 Troubleshooting

### Deployment Failed?

**Vercel:**
```bash
vercel logs              # Check errors
vercel --prod --force    # Force redeploy
```

**Render:**
```bash
git status
git push origin main     # Trigger redeploy
# Check dashboard for errors
```

### Automation Not Running?

**Test Locally:**
```bash
node master-automation.js --immediate
```

**Check Logs:**
- Vercel: Dashboard → Functions → `/api/automation/cron`
- Render: Dashboard → automation-worker → Logs

**Verify Config:**
```bash
# Check status
node master-automation.js --status

# Verify environment
cat .env
```

---

## 💡 Pro Tips

### 1. Start Small
```bash
# Begin with fewer products
MAX_PRODUCTS=3
```

### 2. Test Before Deploy
```bash
# Always test locally first
node master-automation.js --immediate
```

### 3. Monitor Regularly
- Check logs weekly
- Review automation status
- Monitor API quotas

### 4. Use Both Platforms
- Vercel: Fast serverless functions
- Render: Persistent background jobs
- Best of both worlds! 🌍

### 5. Secure Your Secrets
```bash
# Generate strong secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Never commit .env
echo ".env" >> .gitignore
```

---

## 📈 Next Steps

After deployment:

1. **Verify Deployment**
   - ✅ Check Vercel URL
   - ✅ Check Render URL
   - ✅ Test API endpoints

2. **Monitor First Run**
   - ✅ Wait for first automation (Monday 9 AM)
   - ✅ Or trigger manually: `node master-automation.js --immediate`
   - ✅ Check logs for errors

3. **Review Results**
   - ✅ Check generated products
   - ✅ Review designs
   - ✅ Verify listings created
   - ✅ Check profit tracking

4. **Scale Up**
   - ✅ Increase `MAX_PRODUCTS`
   - ✅ Add more regions
   - ✅ Adjust schedule frequency

---

## 📞 Need Help?

### Quick Fixes

**"Missing environment variables"**
→ Add to platform dashboard (Vercel Settings / Render Environment)

**"Cron not running"**
→ Check `CRON_SECRET` in environment variables

**"Worker not starting"**
→ Verify `master-automation.js` is executable

### Resources

- 📖 Full Guide: `UNIFIED-DEPLOYMENT-GUIDE.md`
- 🔧 Environment Setup: `.env.example`
- 📋 Deployment Script: `deploy-unified.sh`
- 🤖 Automation Script: `master-automation.js`

### Test Commands

```bash
# Health check
curl https://your-app.vercel.app/api/health

# Manual automation trigger (requires CRON_SECRET)
curl -X POST https://your-app.vercel.app/api/automation/cron \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Local status
node master-automation.js --status
```

---

## 🎉 You're Ready!

Your automated profit system is now:
- ✅ Deployed to Vercel
- ✅ Deployed to Render
- ✅ Running automated workflows
- ✅ Generating products & designs
- ✅ Tracking profits

**Happy automating!** 🚀💰

---

**Remember:**
- Logs are your friend
- Start small, scale up
- Monitor regularly
- Secure your secrets

**Questions?** Check the logs first:
```bash
tail -f data/master-automation.log
```
