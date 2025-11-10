# 🚀 Vercel Deployment Guide

Your automated profit system is deployed on Vercel!

**Project Dashboard**: https://vercel.com/jerzii-ais-projects/automated-profit-system

---

## 📍 Step 1: Find Your Deployment URL

Your app is deployed at one of these URLs:

### Production URL (Main)
```
https://automated-profit-system.vercel.app
```

### Deployment-Specific URLs
Check your Vercel dashboard for URLs like:
```
https://automated-profit-system-[random-id].vercel.app
```

**How to find it:**
1. Go to: https://vercel.com/jerzii-ais-projects/automated-profit-system
2. Look for "Domains" section (top of page)
3. Copy the `.vercel.app` URL

---

## ✅ Step 2: Verify Deployment

Run the verification script with your deployment URL:

```bash
# Replace with your actual Vercel URL
node scripts/verify-vercel-deployment.js https://automated-profit-system.vercel.app
```

This will test:
- ✅ All API endpoints are working
- ✅ Performance optimizations are active
- ✅ Caching is functioning
- ✅ Compression is enabled
- ✅ Environment is configured correctly

---

## 🔧 Step 3: Configure Environment Variables

### Critical Variables (REQUIRED)

Go to: **Vercel Dashboard → Settings → Environment Variables**

Add these variables:

#### 1. JWT_SECRET (Required)
```
JWT_SECRET=f13d8aee2ff0a947c6d77ca34c326894ee987fdc384c3d37577a39f4851df48a
```
**Why**: Required for authentication endpoints

#### 2. NODE_ENV (Required)
```
NODE_ENV=production
```
**Why**: Enables production optimizations

#### 3. ALLOWED_ORIGINS (Required)
```
ALLOWED_ORIGINS=https://automated-profit-system.vercel.app,https://your-frontend-domain.vercel.app
```
**Why**: CORS security (replace with your actual domains)

### Optional Variables (For Full Features)

#### 4. SENTRY_DSN (Recommended)
```
SENTRY_DSN=your_sentry_dsn_from_sentry_dashboard
```
**Why**: Error monitoring and tracking
**Get it from**: https://sentry.io → Project Settings → Client Keys (DSN)

#### 5. PRINTFUL_API_KEY (Optional)
```
PRINTFUL_API_KEY=your_printful_api_key
```
**Why**: Print-on-demand integration

#### 6. STRIPE_API_KEY (Optional)
```
STRIPE_API_KEY=your_stripe_secret_key
```
**Why**: Payment processing

#### 7. OPENAI_API_KEY (Optional)
```
OPENAI_API_KEY=your_openai_api_key
```
**Why**: AI-powered features

---

## 📊 Step 4: Test Performance

Once environment variables are set, test your deployment:

### Quick Health Check
```bash
curl https://automated-profit-system.vercel.app/api/health
```

**Expected response**:
```json
{
  "success": true,
  "message": "API is healthy and online",
  "environment": "production",
  "checks": {
    "server": { "status": "healthy" },
    "database": { "status": "healthy" }
  }
}
```

### Test Caching
```bash
# First request (cache MISS)
curl -I https://automated-profit-system.vercel.app/api/health | grep X-Cache

# Second request (cache HIT - should be faster)
curl -I https://automated-profit-system.vercel.app/api/health | grep X-Cache
```

**Expected headers**:
```
X-Cache: HIT
X-Response-Time: 1.5ms
Content-Encoding: gzip
```

### View Performance Stats
```bash
curl https://automated-profit-system.vercel.app/api/performance
```

### View Cache Statistics
```bash
curl https://automated-profit-system.vercel.app/api/cache-stats
```

---

## 🔍 Step 5: Check Vercel Logs

If you encounter issues:

1. **Real-time Logs**:
   - Visit: https://vercel.com/jerzii-ais-projects/automated-profit-system/logs
   - Filter by "Function Logs" to see server errors

2. **Build Logs**:
   - Check "Deployments" tab
   - Click on latest deployment
   - View build output

---

## ⚠️ Common Issues & Solutions

### Issue 1: "JWT_SECRET not configured" Error
**Symptom**: 500 errors on authentication endpoints

**Solution**:
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Add `JWT_SECRET` with the generated value above
3. Redeploy (Deployments → Click "..." → Redeploy)

---

### Issue 2: CORS Errors
**Symptom**: Browser shows "blocked by CORS policy"

**Solution**:
1. Add your frontend domain to `ALLOWED_ORIGINS`
2. Format: `https://domain1.com,https://domain2.com`
3. No spaces, comma-separated
4. Redeploy

---

### Issue 3: Database Not Persisting
**Symptom**: Data disappears after deployment

**Explanation**: Vercel has ephemeral filesystem (resets on each deployment)

**Solution** (Choose one):
1. **PostgreSQL (Recommended)**: Use Vercel Postgres or external DB
2. **Vercel KV**: Use Vercel's key-value store
3. **External SQLite**: Use Turso or LiteFS

---

### Issue 4: Slow Performance
**Symptom**: Response times >100ms

**Check**:
1. Verify caching is working: `curl -I [your-url]/api/health | grep X-Cache`
2. Check if gzip is enabled: `curl -I [your-url]/api/health | grep Content-Encoding`
3. Review Vercel region settings (should be closest to users)

**Solution**:
- Cache should show "HIT" on subsequent requests
- Content-Encoding should show "gzip"
- Consider enabling Vercel Edge Network

---

## 📱 Step 6: View API Documentation

Your API documentation is live at:

```
https://automated-profit-system.vercel.app/api-docs
```

Interactive Swagger UI showing:
- All available endpoints
- Request/response schemas
- Try-it-out functionality
- Authentication requirements

---

## 🎯 Performance Benchmarks (Expected)

With all optimizations active, you should see:

| Metric | Target | What It Means |
|--------|--------|---------------|
| **Cache Hit** | 0.8-2ms | Excellent - using cached data |
| **Cache Miss** | 4-15ms | Good - hitting database |
| **Cache Hit Rate** | 60-80% | Cache is effective |
| **First Byte** | <50ms | Fast server response |
| **Full Load** | <200ms | Fast complete response |

---

## 🔒 Security Checklist

✅ **JWT_SECRET**: Set and at least 32 characters
✅ **NODE_ENV**: Set to "production"
✅ **ALLOWED_ORIGINS**: Configured with your domains
✅ **Rate Limiting**: Active (100 req/15min)
✅ **CORS**: Restricted to allowed origins
✅ **Helmet**: Security headers enabled
✅ **Input Validation**: XSS and SQL injection protection
✅ **CSRF Protection**: Enabled for state-changing requests

---

## 📈 Monitoring & Analytics

### Real-Time Monitoring
1. **Performance**: https://automated-profit-system.vercel.app/api/performance
2. **Cache Stats**: https://automated-profit-system.vercel.app/api/cache-stats
3. **Health Check**: https://automated-profit-system.vercel.app/api/health

### Vercel Analytics (Optional)
- Enable in Vercel Dashboard → Analytics
- Get insights on:
  - Page load times
  - User geography
  - Traffic patterns

### Sentry (Recommended)
Once you add `SENTRY_DSN`:
- Automatic error tracking
- Performance monitoring
- User impact analysis
- Alert notifications

---

## 🚀 Next Steps

1. ✅ **Find your deployment URL** from Vercel dashboard
2. ✅ **Run verification script**: `node scripts/verify-vercel-deployment.js [your-url]`
3. ✅ **Set environment variables** (at minimum: JWT_SECRET, NODE_ENV, ALLOWED_ORIGINS)
4. ✅ **Redeploy** after setting environment variables
5. ✅ **Test all endpoints** using the verification script
6. ✅ **Set up Sentry** for production monitoring (optional but recommended)
7. ✅ **Monitor performance** using `/api/performance` endpoint

---

## 🆘 Need Help?

### Quick Debugging Steps

1. **Check Deployment Status**
   ```bash
   curl -I https://automated-profit-system.vercel.app/api/health
   ```
   Should return `200 OK`

2. **View Environment**
   ```bash
   curl https://automated-profit-system.vercel.app/api/health | grep environment
   ```
   Should show `"environment": "production"`

3. **Test Performance**
   ```bash
   node scripts/verify-vercel-deployment.js https://automated-profit-system.vercel.app
   ```

4. **Check Vercel Logs**
   https://vercel.com/jerzii-ais-projects/automated-profit-system/logs

---

## 📞 Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Vercel Status**: https://www.vercel-status.com
- **Project Logs**: https://vercel.com/jerzii-ais-projects/automated-profit-system/logs

---

## 🎉 Success Indicators

Your deployment is successful when you see:

✅ Health check returns 200 OK
✅ Environment shows "production"
✅ Cache headers present (X-Cache: HIT/MISS)
✅ Response time headers present (X-Response-Time)
✅ Compression active (Content-Encoding: gzip)
✅ No 500 errors in logs
✅ All tests pass in verification script

---

**Ready to test? Share your Vercel deployment URL and let's verify everything is working perfectly!** 🚀
