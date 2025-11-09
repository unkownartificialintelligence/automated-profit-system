# 🚀 Deployment Guide - Automated Profit System

## Deploy Your System to Production

This guide covers deploying your automated profit system to production for public access.

---

## 📋 Deployment Options

### Option 1: Render.com (Recommended - Free Tier Available)
### Option 2: Railway.app (Easy deployment)
### Option 3: DigitalOcean (More control)
### Option 4: AWS/Heroku (Enterprise scale)

We'll focus on **Render.com** as it's the easiest and has a free tier.

---

## 🌐 Option 1: Deploy to Render.com

### Prerequisites
- GitHub account
- Code pushed to GitHub repository
- Printful API key

### Step 1: Prepare Your Repository

**1.1 Verify render.yaml exists**
```bash
cat render.yaml
```

Should contain service configuration for backend and frontend.

**1.2 Push latest code to GitHub**
```bash
git add -A
git commit -m "Prepare for deployment"
git push origin main
```

### Step 2: Create Render Account

1. Go to https://render.com
2. Sign up with GitHub
3. Authorize Render to access your repositories

### Step 3: Deploy Backend

**3.1 Create New Web Service**

1. Click "New +" → "Web Service"
2. Connect your repository
3. Configure:
   - Name: `automated-profit-backend`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Instance Type: `Free` (or upgrade for production)

**3.2 Set Environment Variables**

Click "Environment" tab and add:
```
PORT=3003
NODE_ENV=production
PRINTFUL_API_KEY=your_printful_key_here
```

**3.3 Deploy**

Click "Create Web Service"

Wait for deployment (2-5 minutes)

You'll get a URL like: `https://automated-profit-backend.onrender.com`

**3.4 Test Backend**

```bash
curl https://automated-profit-backend.onrender.com/api/health
```

Should return healthy status.

### Step 4: Deploy Frontend

**4.1 Build Frontend Locally**

```bash
cd frontend
npm install
npm run build
```

This creates `frontend/dist` folder.

**4.2 Create Static Site on Render**

1. Click "New +" → "Static Site"
2. Connect your repository
3. Configure:
   - Name: `automated-profit-frontend`
   - Build Command: `cd frontend && npm install && npm run build`
   - Publish Directory: `frontend/dist`

**4.3 Configure Environment**

Add:
```
VITE_API_URL=https://automated-profit-backend.onrender.com
```

**4.4 Deploy**

Click "Create Static Site"

You'll get a URL like: `https://automated-profit-frontend.onrender.com`

### Step 5: Configure Custom Domain (Optional)

**5.1 Add Custom Domain**

1. In Render dashboard, go to your service
2. Click "Settings"
3. Scroll to "Custom Domains"
4. Add your domain (e.g., `app.yoursite.com`)

**5.2 Update DNS**

Add CNAME record in your domain provider:
```
Type: CNAME
Name: app (or @ for root)
Value: [your-render-url].onrender.com
```

**5.3 Enable SSL**

Render automatically provisions SSL certificates (free).

---

## 🐳 Option 2: Deploy with Docker

### Step 1: Build Docker Image

**Create Dockerfile (already exists):**

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3003

CMD ["npm", "start"]
```

**Build image:**
```bash
docker build -t automated-profit-system .
```

### Step 2: Run Locally (Test)

```bash
docker run -p 3003:3003 \
  -e PORT=3003 \
  -e NODE_ENV=production \
  -e PRINTFUL_API_KEY=your_key_here \
  automated-profit-system
```

Test: `curl http://localhost:3003/api/health`

### Step 3: Deploy to Cloud

**DigitalOcean App Platform:**

1. Create account at digitalocean.com
2. Click "Create" → "Apps"
3. Connect GitHub repository
4. Configure with Dockerfile
5. Add environment variables
6. Deploy

**Railway.app:**

1. Go to railway.app
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Connect repository
5. Railway auto-detects Dockerfile
6. Add environment variables
7. Deploy

---

## 🔒 Security Configuration

### Step 1: Environment Variables

**Never commit sensitive data!**

Create `.env.example` (safe to commit):
```
PORT=3003
NODE_ENV=production
PRINTFUL_API_KEY=your_printful_api_key_here
```

Create `.env` (add to .gitignore):
```
PORT=3003
NODE_ENV=production
PRINTFUL_API_KEY=actual_key_here
```

### Step 2: CORS Configuration

Update `src/server.js`:

```javascript
const allowedOrigins = [
  'http://localhost:5173',
  'https://your-frontend-domain.com',
  'https://automated-profit-frontend.onrender.com'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));
```

### Step 3: Rate Limiting

Already configured in server.js:
```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### Step 4: API Key Security

**Encrypt API keys in database:**
```javascript
import bcrypt from 'bcryptjs';

// Store
const encryptedKey = await bcrypt.hash(apiKey, 10);

// Verify
const isValid = await bcrypt.compare(inputKey, encryptedKey);
```

---

## 📊 Monitoring & Analytics

### Step 1: Application Monitoring

**Add monitoring to server:**

```javascript
// Add to src/server.js
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';

// Create log stream
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, '../logs/access.log'),
  { flags: 'a' }
);

// Log all requests
app.use(morgan('combined', { stream: accessLogStream }));
```

### Step 2: Error Tracking

**Add Sentry (optional):**

```bash
npm install @sentry/node
```

```javascript
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());
```

### Step 3: Health Checks

Already implemented at `/api/health`

**Monitor uptime:**
- Use UptimeRobot (free)
- Ping `/api/health` every 5 minutes
- Get alerts if down

---

## 🔄 CI/CD Pipeline

### GitHub Actions Deployment

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Render

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v2

    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '20'

    - name: Install dependencies
      run: npm install

    - name: Run tests
      run: npm test

    - name: Deploy to Render
      run: |
        curl -X POST https://api.render.com/deploy/srv-xxxxx
      env:
        RENDER_API_KEY: ${{ secrets.RENDER_API_KEY }}
```

---

## 📦 Database Backup

### Automated Backups

**Create backup script:**

```bash
#!/bin/bash
# backup-db.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_FILE="database.db"

# Create backup
sqlite3 $DB_FILE ".backup '$BACKUP_DIR/backup_$DATE.db'"

# Keep only last 30 days
find $BACKUP_DIR -name "backup_*.db" -mtime +30 -delete

echo "Backup created: backup_$DATE.db"
```

**Schedule with cron:**

```bash
# Run daily at 2 AM
0 2 * * * /path/to/backup-db.sh
```

---

## 🧪 Pre-Deployment Checklist

Before deploying to production:

**Code:**
- [ ] All tests passing
- [ ] No console.log in production code
- [ ] Error handling implemented
- [ ] Rate limiting configured
- [ ] CORS properly set

**Security:**
- [ ] API keys in environment variables (not code)
- [ ] .env file in .gitignore
- [ ] HTTPS enabled
- [ ] SQL injection prevention
- [ ] XSS protection

**Performance:**
- [ ] Database indexed
- [ ] Static assets compressed
- [ ] Caching configured
- [ ] CDN setup (if needed)

**Monitoring:**
- [ ] Logging configured
- [ ] Error tracking setup
- [ ] Uptime monitoring
- [ ] Analytics configured

**Documentation:**
- [ ] README updated
- [ ] API documentation
- [ ] Environment variables documented
- [ ] Deployment process documented

---

## 🚀 Deployment Steps

### Final Deployment Workflow

**1. Test Locally**
```bash
# Run all tests
npm test

# Test automation
./test-automation.sh

# Verify all endpoints
curl http://localhost:3003/api/health
curl http://localhost:3003/api/full-automation/status
```

**2. Commit and Push**
```bash
git add -A
git commit -m "Production ready - v1.0.0"
git tag v1.0.0
git push origin main
git push origin v1.0.0
```

**3. Deploy to Render**
- Push triggers automatic deployment
- Monitor build logs
- Verify deployment successful

**4. Verify Production**
```bash
# Test health
curl https://your-app.onrender.com/api/health

# Test full automation
curl https://your-app.onrender.com/api/full-automation/status

# Test Christmas designs
curl https://your-app.onrender.com/api/christmas/trending
```

**5. Configure Monitoring**
- Set up UptimeRobot
- Configure error alerts
- Test alert notifications

**6. Document URLs**
```
Production Backend: https://automated-profit-backend.onrender.com
Production Frontend: https://automated-profit-frontend.onrender.com
Health Check: https://automated-profit-backend.onrender.com/api/health
```

---

## 📈 Post-Deployment

### Week 1 Tasks

- [ ] Monitor error logs daily
- [ ] Check uptime (target: 99%+)
- [ ] Verify API response times (< 500ms)
- [ ] Test all critical workflows
- [ ] Gather user feedback
- [ ] Fix any critical bugs immediately

### Ongoing

- [ ] Weekly performance review
- [ ] Monthly security audit
- [ ] Update dependencies monthly
- [ ] Backup database daily
- [ ] Monitor costs

---

## 🆘 Troubleshooting

### Issue: Build Fails

**Solution:**
1. Check build logs in Render dashboard
2. Verify package.json has all dependencies
3. Test build locally first
4. Check Node version matches

### Issue: Database Not Persisting

**Solution:**
1. Use Render Disk (persistent storage)
2. Or use external database (PostgreSQL)
3. Configure in render.yaml

### Issue: Slow Response Times

**Solution:**
1. Upgrade to paid tier (free tier sleeps)
2. Add caching layer (Redis)
3. Optimize database queries
4. Use CDN for static assets

### Issue: API Limits Hit

**Solution:**
1. Implement request queuing
2. Add rate limiting
3. Cache Printful API responses
4. Upgrade Printful plan if needed

---

## 💰 Cost Estimates

### Render.com Pricing

**Free Tier:**
- Backend: Free (sleeps after 15min inactivity)
- Static Site: Free
- Database: Limited storage
- **Cost: $0/month**

**Starter (Recommended for Production):**
- Backend: $7/month (always on)
- Database: $7/month (25 GB)
- **Cost: $14/month**

**Professional:**
- Backend: $25/month (2GB RAM)
- Database: $25/month (100 GB)
- **Cost: $50/month**

### Additional Costs

- Domain: $10-15/year
- Email (SendGrid): Free tier available
- Monitoring: Free (UptimeRobot)
- **Total: $14-50/month**

---

## 🎯 Success Metrics

Track after deployment:

**Technical:**
- Uptime: > 99%
- Response time: < 500ms
- Error rate: < 1%
- Build time: < 5 minutes

**Business:**
- Active users
- Products created
- Sales tracked
- Profit generated
- Customer satisfaction

---

## 📞 Support

**Deployment Issues:**
- Render Support: https://render.com/docs
- GitHub Issues: Create issue in your repo
- Community: Stack Overflow

**Production Issues:**
- Check logs: Render dashboard → Logs
- Monitor: UptimeRobot notifications
- Contact: support@yourcompany.com

---

## ✅ Deployment Complete!

Once deployed, you should have:
- ✅ Backend API running on Render
- ✅ Frontend accessible publicly
- ✅ Database persisting
- ✅ Monitoring configured
- ✅ Backups automated
- ✅ SSL enabled
- ✅ Custom domain (optional)

**Your automated profit system is now LIVE! 🚀**

Users can now:
1. Sign up and create accounts
2. Generate designs automatically
3. List products on Printful
4. Create marketing campaigns
5. Track their profits

**Next steps:**
1. Start marketing your platform
2. Onboard first customers
3. Gather feedback
4. Iterate and improve

**Congratulations on deploying! 🎉**
