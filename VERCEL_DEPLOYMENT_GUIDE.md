# 🚀 Vercel Deployment Guide

## Quick Setup

### 1. Connect Your Repository to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository: `unkownartificialintelligence/automated-profit-system`
4. Vercel will auto-detect the framework settings

### 2. Configure Environment Variables

**CRITICAL:** Before deploying, set these environment variables in Vercel:

#### Required Environment Variables

Go to your Vercel project → Settings → Environment Variables and add:

| Variable Name | Value | How to Generate |
|--------------|-------|-----------------|
| `JWT_SECRET` | *(your secure random string)* | Run: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `NODE_ENV` | `production` | Vercel usually sets this automatically |

#### Recommended Environment Variables

| Variable Name | Description | Example |
|--------------|-------------|---------|
| `ALLOWED_ORIGINS` | Comma-separated list of allowed frontend domains | `https://your-app.vercel.app,https://www.your-domain.com` |
| `SENTRY_DSN` | Sentry error monitoring DSN (free tier available) | Get from [sentry.io](https://sentry.io) |
| `PRINTFUL_API_KEY` | Printful API key for product automation | Get from Printful dashboard |

#### Optional Environment Variables

| Variable Name | Description |
|--------------|-------------|
| `STRIPE_API_KEY` | Stripe payment processing |
| `OPENAI_API_KEY` | OpenAI API for AI features |
| `CANVA_API_KEY` | Canva API for design automation |

### 3. Deploy

Once environment variables are set:

1. Click "Deploy" in Vercel
2. Vercel will build and deploy your application
3. Your app will be live at: `https://your-app-name.vercel.app`

---

## ⚠️ Important Notes

### JWT_SECRET Handling

- **With JWT_SECRET set:** Admin authentication will persist across deployments
- **Without JWT_SECRET:** The server will auto-generate a temporary secret, but:
  - ⚠️ Admin sessions will be invalidated on each deployment
  - ⚠️ Not recommended for production use
  - ✅ Server will still start and run (no more 500 errors!)

### Environment Variable Scopes

When adding environment variables in Vercel, you can set them for:

- **Production** - Live deployments from your main branch
- **Preview** - Pull request and branch previews
- **Development** - Local development (optional)

**Recommendation:** Set environment variables for all three scopes.

---

## 🧪 Verify Deployment

### Check Health Endpoint

```bash
curl https://your-app-name.vercel.app/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "API is healthy and online",
  "checks": {
    "server": { "status": "healthy" },
    "database": { "status": "healthy" }
  }
}
```

### Check API Documentation

Visit: `https://your-app-name.vercel.app/api-docs`

---

## 🔧 Build Configuration

Vercel automatically detects Node.js projects. The build process:

1. **Install:** `npm install`
2. **Build:** Automatically handled by Vercel
3. **Start:** Uses `npm start` (defined in package.json)

If you need custom build commands, create a `vercel.json`:

```json
{
  "buildCommand": "npm install && npm run build",
  "startCommand": "npm start",
  "env": {
    "NODE_VERSION": "18"
  }
}
```

---

## 🆘 Troubleshooting

### Issue: "Missing required environment variables: JWT_SECRET"

**Solution:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add `JWT_SECRET` with a secure 32+ character string
3. Redeploy your application

**Generate a secure JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Issue: CORS Errors

**Solution:**
Add `ALLOWED_ORIGINS` environment variable with your frontend domain:
```
ALLOWED_ORIGINS=https://your-app.vercel.app,https://www.your-domain.com
```

### Issue: Database Errors on Vercel

**Note:** SQLite (the default database) has limitations on serverless platforms like Vercel.

**Solutions:**
1. **Short-term:** The app will work but data won't persist across deployments
2. **Long-term:** Migrate to a cloud database (PostgreSQL, MongoDB, etc.)
   - See: `docs/POSTGRESQL_MIGRATION_GUIDE.md`
3. **Recommended:** Use Vercel Postgres or Supabase for production

---

## 📊 Monitoring

### View Logs

1. Go to Vercel Dashboard → Your Project
2. Click on a deployment
3. Click "View Function Logs"

### View Runtime Logs

Vercel automatically captures `console.log`, `console.error`, etc.

### Sentry Integration (Recommended)

For better error tracking:

1. Sign up at [sentry.io](https://sentry.io) (free tier available)
2. Create a new project
3. Copy your DSN
4. Add `SENTRY_DSN` to Vercel environment variables
5. Redeploy

---

## 🚀 Continuous Deployment

Vercel automatically deploys:

- **Main branch** → Production deployment
- **Other branches** → Preview deployments
- **Pull requests** → Preview deployments with unique URLs

### Custom Deployment Branches

To deploy from a specific branch:

1. Go to Settings → Git
2. Set "Production Branch" to your desired branch
3. Save

---

## 🔐 Security Best Practices

1. ✅ Always set `JWT_SECRET` in production
2. ✅ Use strong, random values (32+ characters)
3. ✅ Set `ALLOWED_ORIGINS` to restrict CORS
4. ✅ Enable Sentry for error monitoring
5. ✅ Never commit `.env` files to Git
6. ✅ Rotate secrets regularly

---

## 📚 Additional Resources

- **Vercel Docs:** https://vercel.com/docs
- **Environment Variables:** https://vercel.com/docs/environment-variables
- **Serverless Functions:** https://vercel.com/docs/functions
- **Security Guide:** See `docs/SECURITY_BEST_PRACTICES.md`

---

## ✅ Deployment Checklist

Before going to production:

- [ ] All required environment variables set in Vercel
- [ ] JWT_SECRET is a secure random string (32+ characters)
- [ ] ALLOWED_ORIGINS includes your frontend domain(s)
- [ ] Health endpoint returns 200 status
- [ ] API documentation is accessible
- [ ] Sentry is configured (recommended)
- [ ] Database strategy decided (SQLite vs cloud database)
- [ ] Custom domain configured (if applicable)

---

**Your app is now live on Vercel!** 🎉

For questions or issues, check the [Vercel Documentation](https://vercel.com/docs) or open an issue on GitHub.
