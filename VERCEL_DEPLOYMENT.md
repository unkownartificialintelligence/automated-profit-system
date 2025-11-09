# 🚀 Vercel Deployment Guide

## Deploy Your Automated Profit System to Vercel

Vercel provides the easiest deployment for your full-stack application with automatic CI/CD.

---

## 📋 Prerequisites

- GitHub account with your code pushed
- Vercel account (free tier available)
- Printful API key

---

## 🚀 Quick Deploy (5 Minutes)

### Step 1: Connect to Vercel

**1.1 Create Vercel Account**
1. Go to https://vercel.com/signup
2. Sign up with GitHub (recommended)
3. Authorize Vercel to access your repositories

**1.2 Import Your Project**
1. Click "Add New..." → "Project"
2. Select your `automated-profit-system` repository
3. Click "Import"

### Step 2: Configure Project

**2.1 Framework Preset**
- Framework Preset: `Other`
- Root Directory: `./`
- Build Command: `npm install && cd frontend && npm install && npm run build`
- Output Directory: `frontend/dist`

**2.2 Environment Variables**

Click "Environment Variables" and add:

```
NODE_ENV=production
PORT=3003
PRINTFUL_API_KEY=your_printful_api_key_here
```

**Optional (for enhanced features):**
```
DATABASE_URL=your_database_url (if using external DB)
SENTRY_DSN=your_sentry_dsn (for error tracking)
```

### Step 3: Deploy

1. Click "Deploy"
2. Wait 2-5 minutes for build
3. Get your live URL: `https://your-project.vercel.app`

---

## ✅ Verify Deployment

### Test Backend

```bash
# Health check
curl https://your-project.vercel.app/api/health

# Christmas designs
curl https://your-project.vercel.app/api/christmas/trending

# Automation status
curl https://your-project.vercel.app/api/full-automation/status
```

### Test Frontend

1. Visit: `https://your-project.vercel.app`
2. Should see the landing page with ROI calculator
3. Test login (if applicable)

---

## 🔧 Project Structure for Vercel

Your project is already configured with:

```
automated-profit-system/
├── vercel.json              # Vercel configuration
├── src/
│   └── server.js           # Backend API (auto-deployed)
├── frontend/
│   ├── src/                # React frontend
│   ├── dist/               # Built frontend (auto-generated)
│   └── package.json
└── package.json            # Root dependencies
```

**Vercel automatically:**
- ✅ Detects your backend (Node.js)
- ✅ Builds your frontend (Vite)
- ✅ Sets up API routes at `/api/*`
- ✅ Serves frontend from root `/`
- ✅ Provides SSL certificate
- ✅ Gives you a production URL

---

## 🔒 Security Configuration

### Environment Variables (CRITICAL)

**Never commit these to GitHub!**

In Vercel Dashboard:
1. Go to your project
2. Click "Settings"
3. Click "Environment Variables"
4. Add each variable
5. Select "Production", "Preview", and "Development"

**Required Variables:**
```
PRINTFUL_API_KEY=pk_your_key_here
```

**Recommended Variables:**
```
NODE_ENV=production
PORT=3003
ALLOWED_ORIGINS=https://your-domain.com
```

### CORS Configuration

Already configured in `src/server.js`:
```javascript
const allowedOrigins = [
  'http://localhost:5173',
  'https://your-project.vercel.app',
  process.env.ALLOWED_ORIGINS
];
```

**Update after deployment:**
1. Get your Vercel URL
2. Add to `allowedOrigins` in server.js
3. Or set `ALLOWED_ORIGINS` environment variable
4. Commit and push (auto-deploys)

---

## 📦 Database Setup

### Option 1: SQLite (Default - File-based)

**⚠️ Limitation:** Vercel serverless functions are stateless
- SQLite file resets on each deployment
- Good for testing, not for production

**Solution:** Use Vercel's persistent storage (paid) or external database

### Option 2: PostgreSQL (Recommended for Production)

**Using Vercel Postgres:**

1. In Vercel Dashboard → Storage → Create Database
2. Select "Postgres"
3. Copy connection string
4. Add to environment variables:
   ```
   DATABASE_URL=postgresql://...
   ```

5. Update database connection in code:
   ```javascript
   // src/database/connection.js
   import { Pool } from 'pg';
   const pool = new Pool({
     connectionString: process.env.DATABASE_URL,
     ssl: { rejectUnauthorized: false }
   });
   ```

### Option 3: Railway/PlanetScale (External)

1. Create database on Railway.app or PlanetScale
2. Get connection URL
3. Add to Vercel environment variables
4. Update connection code

---

## 🔄 Automatic Deployments

### Git Integration (Already Setup)

Every push to `main` branch:
- ✅ Triggers automatic build
- ✅ Runs tests (if configured)
- ✅ Deploys to production
- ✅ Updates live site

**Preview Deployments:**
- Every PR gets a unique preview URL
- Test before merging to main
- Automatic cleanup after PR closes

### Deploy Hook (Manual Trigger)

1. Vercel Dashboard → Settings → Git
2. Create Deploy Hook
3. Get webhook URL
4. Trigger deployments:
   ```bash
   curl -X POST https://api.vercel.com/v1/integrations/deploy/...
   ```

---

## 🌐 Custom Domain

### Add Your Domain

**1. Purchase Domain (if needed)**
- Namecheap, GoDaddy, Google Domains, etc.

**2. Add to Vercel**
1. Project Settings → Domains
2. Add your domain: `app.yourcompany.com`
3. Choose configuration:
   - **Option A:** Use Vercel nameservers (easiest)
   - **Option B:** Add DNS records manually

**3. Configure DNS**

**If using Vercel nameservers:**
- Update nameservers at your domain registrar
- Wait 24-48 hours for propagation

**If using custom DNS:**
Add these records:
```
Type: A
Name: @ (or subdomain)
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**4. SSL Certificate**
- Vercel automatically provisions SSL
- Free, automatic renewal
- HTTPS enabled immediately

---

## 📊 Monitoring & Analytics

### Vercel Analytics (Built-in)

**Enable:**
1. Project Settings → Analytics
2. Enable "Web Analytics"
3. View real-time metrics

**Metrics Available:**
- Page views
- Unique visitors
- Top pages
- Performance (Core Web Vitals)
- Geographic distribution

### Custom Monitoring

**Add Uptime Monitoring:**
1. Use UptimeRobot (free)
2. Monitor: `https://your-project.vercel.app/api/health`
3. Check every 5 minutes
4. Get alerts if down

**Error Tracking:**
```bash
npm install @sentry/node @sentry/react
```

Add to `src/server.js`:
```javascript
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: "production",
});
```

---

## 🔥 Performance Optimization

### Frontend Optimization

Already optimized:
- ✅ Vite for fast builds
- ✅ Code splitting
- ✅ Tree shaking
- ✅ Minification

**Additional:**
1. Enable compression in Vercel
2. Use CDN for static assets (automatic)
3. Implement route-based code splitting

### Backend Optimization

**Caching:**
```javascript
// Add to API routes
res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
```

**Rate Limiting:**
Already configured in `src/server.js`

**Database Connection Pooling:**
```javascript
// For PostgreSQL
const pool = new Pool({ max: 20 });
```

---

## 🧪 Testing on Vercel

### Preview Deployments

**Create a test branch:**
```bash
git checkout -b test-deployment
git push origin test-deployment
```

Vercel creates preview URL: `https://your-project-git-test-deployment.vercel.app`

**Test everything:**
- API endpoints
- Frontend functionality
- Database connections
- Environment variables

**If good, merge to main:**
```bash
git checkout main
git merge test-deployment
git push origin main
```

---

## 💰 Cost Estimates

### Vercel Pricing

**Hobby (Free):**
- Unlimited deployments
- 100GB bandwidth/month
- Custom domains (1 domain)
- Automatic HTTPS
- **Cost: $0/month**
- ⚠️ Good for testing, not production with traffic

**Pro (Recommended):**
- Everything in Hobby
- 1TB bandwidth
- Advanced analytics
- Password protection
- **Cost: $20/month**

**Enterprise:**
- Custom pricing
- Dedicated support
- SLA guarantees
- Advanced security

### Additional Costs

- Domain: $10-15/year
- Database (if external): $5-25/month
- Monitoring: Free (UptimeRobot)
- **Total: $20-45/month for production**

---

## 🚨 Troubleshooting

### Issue: Build Fails

**Check build logs:**
1. Vercel Dashboard → Deployments
2. Click failed deployment
3. View logs

**Common fixes:**
```bash
# Missing dependencies
npm install --save missing-package

# Build command issues
# Update vercel.json build settings

# Environment variables
# Verify all required vars are set
```

### Issue: API Routes Not Working

**Verify vercel.json:**
```json
{
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/src/server.js"
    }
  ]
}
```

**Check serverless function:**
- Max execution: 10 seconds (Hobby)
- Max payload: 4.5MB
- Cold starts: ~100ms

### Issue: Database Connection Fails

**For SQLite:**
- Use external database for production
- SQLite not persistent on Vercel serverless

**For PostgreSQL:**
- Verify DATABASE_URL is set
- Check connection string format
- Ensure SSL is configured

### Issue: CORS Errors

**Update CORS in server.js:**
```javascript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://your-project.vercel.app',
    'https://your-custom-domain.com'
  ]
}));
```

---

## ✅ Deployment Checklist

### Pre-Deployment
- [ ] Code pushed to GitHub
- [ ] All tests passing locally
- [ ] Environment variables documented
- [ ] Database migration plan (if needed)
- [ ] vercel.json configured
- [ ] CORS allowed origins updated

### Deployment
- [ ] Vercel account created
- [ ] Project imported
- [ ] Environment variables set
- [ ] Build successful
- [ ] Deployment successful

### Post-Deployment
- [ ] Test API endpoints
- [ ] Test frontend functionality
- [ ] Verify database connection
- [ ] Set up custom domain (optional)
- [ ] Enable monitoring
- [ ] Configure analytics
- [ ] Test complete user flow

---

## 🎯 Quick Commands

**Deploy from CLI:**
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy to production
vercel --prod

# Deploy to preview
vercel
```

**View logs:**
```bash
vercel logs [deployment-url]
```

**List deployments:**
```bash
vercel ls
```

---

## 📱 Mobile App Support

Vercel URL works on mobile:
- Responsive design (already implemented)
- PWA support (add manifest.json)
- Push notifications (optional)

**Add PWA:**
```bash
cd frontend
npm install vite-plugin-pwa
```

---

## 🔐 Security Best Practices

1. **Never commit secrets**
   - Use environment variables
   - Add to .gitignore

2. **Use HTTPS only**
   - Vercel provides automatically
   - Redirect HTTP to HTTPS

3. **Implement rate limiting**
   - Already configured
   - Adjust limits for production

4. **Input validation**
   - Sanitize all user inputs
   - Use parameterized queries

5. **Regular updates**
   - Keep dependencies updated
   - Monitor security advisories

---

## 🚀 You're Ready to Deploy!

### Final Steps:

1. **Push to GitHub:**
   ```bash
   git add -A
   git commit -m "Ready for Vercel deployment"
   git push origin main
   ```

2. **Deploy on Vercel:**
   - Go to https://vercel.com
   - Import your repository
   - Add environment variables
   - Click Deploy!

3. **Verify:**
   - Test all API endpoints
   - Check frontend loads
   - Verify automation works

**Your system will be LIVE in 5 minutes! 🎉**

---

## 📞 Support

- Vercel Docs: https://vercel.com/docs
- Discord: https://vercel.com/discord
- GitHub Issues: Your repository

**Deployment Status: ✅ READY**

Let's deploy! 🚀
