# Render Deployment Guide - Automated Profit System

## Quick Deploy (2 Minutes)

### Step 1: Create Render Account
1. Go to **https://render.com**
2. Sign up (free account works for starter plan)
3. Connect your GitHub account

### Step 2: Deploy from Dashboard

**Option A - One-Click Deploy (Recommended):**
1. Go to Render Dashboard
2. Click **"New"** → **"Web Service"**
3. Connect repository: `unkownartificialintelligence/automated-profit-system`
4. Branch: `claude/api-health-check-011CUvak7c4T6GGE3V3S7b3F`
5. Render auto-detects `render.yaml` and configures everything
6. Click **"Create Web Service"**

**Option B - Manual Blueprint:**
1. Click **"New"** → **"Blueprint"**
2. Connect repository
3. Select `render.yaml` file
4. Click **"Apply"**

### Step 3: Set Environment Variables

In Render Dashboard → Your Service → Environment:

```
NODE_ENV=production
PORT=3003
PRINTFUL_API_KEY=your_printful_api_key_here
CANVA_API_KEY=your_canva_api_key_here
```

**Important:** Replace with your actual API keys!

### Step 4: Deploy

1. Render automatically builds and deploys
2. Wait 3-5 minutes for build to complete
3. Your service will be live at: `https://automated-profit-system.onrender.com`

---

## Verify Deployment

Once deployed, test your endpoints:

```bash
# Health check
curl https://automated-profit-system.onrender.com/api/health

# Dashboard
curl https://automated-profit-system.onrender.com/api/canva/dashboard

# Personal profit
curl https://automated-profit-system.onrender.com/api/personal/total-profit
```

---

## Run Automation from Cloud

Your automation is now accessible from anywhere:

```bash
# Run full automation
curl -X POST https://automated-profit-system.onrender.com/api/canva/full-automation \
  -H "Content-Type: application/json" \
  -d '{"max_products":3}'

# View dashboard
curl https://automated-profit-system.onrender.com/api/canva/dashboard

# Schedule weekly automation
curl -X POST https://automated-profit-system.onrender.com/api/canva/schedule-automation \
  -H "Content-Type: application/json" \
  -d '{
    "frequency":"weekly",
    "day_of_week":"monday",
    "time":"09:00",
    "max_products":3
  }'
```

---

## Render Pricing

### Free Tier:
- ✅ Good for testing
- ⚠️ Spins down after 15 min inactivity
- ⚠️ Cold starts (slow first request)

### Starter Plan ($7/month):
- ✅ Always on (no spin down)
- ✅ Fast response times
- ✅ 512 MB RAM
- ✅ **RECOMMENDED for automation**

### Standard Plan ($25/month):
- ✅ 2 GB RAM
- ✅ Higher performance
- ✅ For scaling business

**Recommendation:** Start with Starter ($7/mo) for reliable automation.

---

## Environment Variables Required

### Required:
```
NODE_ENV=production
PORT=3003
```

### For Full Automation:
```
PRINTFUL_API_KEY=your_key_here
```

### Optional (for Canva API):
```
CANVA_API_KEY=your_key_here
CANVA_BRAND_TEMPLATE_ID=your_template_id
```

---

## Auto-Deploy Setup

With `render.yaml` configured, every push to branch `claude/api-health-check-011CUvak7c4T6GGE3V3S7b3F` automatically deploys!

**Workflow:**
1. You push code to branch
2. Render detects change
3. Builds automatically
4. Deploys automatically
5. Service restarts with new code

---

## Monitoring

### Render Dashboard Shows:
- Real-time logs
- CPU/Memory usage
- Deploy history
- Health check status
- Request metrics

### Access Logs:
1. Go to Render Dashboard
2. Click your service
3. Click **"Logs"** tab
4. View real-time server logs

---

## Connect Custom Domain (Optional)

### Free .onrender.com subdomain:
`https://automated-profit-system.onrender.com`

### Custom domain (e.g., yourstore.com):
1. Go to service settings
2. Click **"Custom Domains"**
3. Add your domain
4. Update DNS records
5. SSL automatically provisioned

---

## Scheduled Automation on Render

Your automation schedule will run automatically on Render!

**Set Schedule:**
```bash
curl -X POST https://your-app.onrender.com/api/canva/schedule-automation \
  -H "Content-Type: application/json" \
  -d '{
    "frequency":"weekly",
    "day_of_week":"monday",
    "time":"09:00",
    "max_products":3,
    "enabled":true
  }'
```

**Check Schedule:**
```bash
curl https://your-app.onrender.com/api/canva/dashboard
```

---

## Troubleshooting

### Build Fails
**Check:**
- `package.json` has all dependencies
- Node version compatible (v18+ recommended)

**Fix:**
```bash
# Add to render.yaml if needed
node: 18
```

### Service Won't Start
**Check:**
- Logs in Render Dashboard
- Environment variables set correctly
- PORT is 3003 (or use Render's default)

**Fix:**
Update `src/server.js`:
```javascript
const PORT = process.env.PORT || 3003;
```

### API Keys Not Working
**Check:**
- Environment variables saved in Render
- No extra spaces in keys
- Keys are valid on Printful/Canva

**Fix:**
1. Go to Environment tab
2. Update variables
3. Trigger manual deploy

### Health Check Failing
**Check endpoint:**
```bash
curl https://your-app.onrender.com/api/health
```

**Should return:**
```json
{
  "success": true,
  "message": "API is healthy and online"
}
```

---

## Database on Render

Your SQLite database persists on Render's disk.

**Important:**
- Render's free tier may reset disk
- For production, consider upgrading to Starter plan
- Data in `data/` folder persists with Starter+

---

## Scaling

### If You Get High Traffic:

1. **Upgrade Plan** to Standard ($25/mo)
   - 2 GB RAM
   - Better performance

2. **Add Database** (PostgreSQL)
   - Better than SQLite for scale
   - Free 90-day trial

3. **Add Caching** (Redis)
   - Speed up API calls
   - Free tier available

---

## Cost Breakdown

### Render Starter Plan: $7/month
- Always-on server
- Automated deployment
- SSL certificate included
- Custom domain support

### Total Monthly Cost:
- **Render:** $7/mo
- **Printful:** $0 (pay per product sold)
- **Canva:** $0 (free tier works)

**Total: $7/month for fully automated profit system!**

---

## Next Steps After Deploy

1. **Test Health:** `curl https://your-app.onrender.com/api/health`
2. **Run Automation:** Use automation-control.sh with your URL
3. **Schedule Weekly Runs:** Set Monday 9 AM automation
4. **Monitor Dashboard:** Check daily for stats
5. **Watch Profits:** Track sales via dashboard

---

## Support Links

- **Render Docs:** https://render.com/docs
- **Status Page:** https://status.render.com
- **Community:** https://community.render.com

---

## Your Live URLs (After Deploy)

Replace `your-app` with your actual Render service name:

- **Dashboard:** `https://your-app.onrender.com/api/canva/dashboard`
- **Health Check:** `https://your-app.onrender.com/api/health`
- **Run Automation:** `https://your-app.onrender.com/api/canva/full-automation`
- **Personal Profit:** `https://your-app.onrender.com/api/personal/total-profit`

---

## Ready to Deploy!

1. Push to GitHub (already done ✅)
2. Go to render.com
3. Click "New" → "Web Service"
4. Select your repo
5. Click "Create Web Service"
6. Wait 3-5 minutes
7. **You're live!** 🚀

**Your automated profit system will be running 24/7 in the cloud!**
