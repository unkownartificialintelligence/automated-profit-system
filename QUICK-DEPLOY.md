# ⚡ Quick Deploy to Vercel

Deploy your Automated Profit System to Vercel in 5 minutes!

## 🚀 One-Command Deployment

```bash
./scripts/deploy-to-vercel.sh
```

## 📋 Or Deploy Manually

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Deploy!
```bash
# Preview deployment (testing)
npm run deploy:preview

# Production deployment
npm run deploy
```

## ⚠️ Important: Database Configuration

**Your app uses SQLite locally, but Vercel needs a cloud database.**

### Quick Option: Vercel Postgres (Recommended)

1. Go to your Vercel project dashboard
2. Click "Storage" → "Create Database" → "Postgres"
3. Copy the connection string
4. Add to environment variables: `POSTGRES_URL`

That's it! Vercel automatically connects your app.

### Alternative Options:
- **Supabase**: Free PostgreSQL with built-in auth
- **PlanetScale**: Free MySQL serverless database
- **MongoDB Atlas**: Free NoSQL database

See `VERCEL-DEPLOYMENT.md` for detailed migration guide.

## 🔑 Required Environment Variables

Set these in Vercel dashboard (or use `vercel env add`):

```bash
# Essential
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
OPENAI_API_KEY
PRINTFUL_API_KEY

# Email
SMTP_HOST
SMTP_USER
SMTP_PASS

# Database (after migration)
POSTGRES_URL  # or your database URL
```

## ✅ Post-Deployment Checklist

After deployment:

1. **Update Stripe Webhook**
   - Go to Stripe Dashboard → Webhooks
   - Update URL to: `https://your-app.vercel.app/api/stripe/webhooks`

2. **Test Your Deployment**
   ```bash
   curl https://your-app.vercel.app/api/health
   ```

3. **Update Frontend URL**
   ```bash
   vercel env add FRONTEND_URL production
   # Enter your Vercel URL
   ```

## 🐛 Troubleshooting

### "Database connection failed"
- Make sure you've set up a cloud database
- Verify `POSTGRES_URL` or database connection string

### "Module not found"
- Run `npm install` locally first
- Check all dependencies are in `package.json`

### "Function timeout"
- Free tier has 10s timeout
- Upgrade to Pro for 60s timeout ($20/month)

### "SQLite error on Vercel"
- SQLite doesn't work on Vercel's serverless functions
- You MUST migrate to a cloud database (see above)

## 💡 Pro Tips

1. **Test Locally First**
   ```bash
   vercel dev
   ```
   This runs your app in Vercel's environment locally

2. **Preview Deployments**
   Every git push creates a preview deployment automatically
   Perfect for testing before production

3. **Check Logs**
   ```bash
   vercel logs
   ```
   See real-time logs from your deployment

4. **Rollback if Needed**
   ```bash
   vercel rollback
   ```
   Instantly revert to previous deployment

## 📊 Monitoring Your Deployment

- **Vercel Dashboard**: Real-time analytics and logs
- **Health Check**: `https://your-app.vercel.app/api/health`
- **Performance**: `https://your-app.vercel.app/api/infrastructure/monitoring/health`

## 🎯 Cost Estimate

### Free (Hobby) Plan
- Perfect for testing
- 100GB bandwidth/month
- Unlimited preview deployments
- **Limitation**: Cannot use for commercial purposes

### Pro Plan ($20/month)
- **Recommended for production**
- Unlimited bandwidth
- 60-second function timeout
- Commercial use allowed
- Better performance

## 🆘 Need Help?

1. Check deployment status: https://vercel.com/dashboard
2. View function logs in Vercel dashboard
3. Test endpoints with: `curl https://your-app.vercel.app/api/health`
4. Read detailed guide: `VERCEL-DEPLOYMENT.md`

## 🎉 You're Live!

Once deployed, your Automated Profit System is accessible at:
- **Production**: `https://your-app.vercel.app`
- **API**: `https://your-app.vercel.app/api`

Start making money with your POD automation! 💰
