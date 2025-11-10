# 🚀 Sentry Quick Setup (5 Minutes)

Get real-time error monitoring in 5 easy steps!

---

## Step 1: Create Free Sentry Account (2 min)

**Click here:** https://sentry.io/signup/

- Sign up with your email or GitHub
- It's **FREE** for up to 5,000 errors/month
- No credit card required!

---

## Step 2: Create Your Project (1 min)

After signing in:

1. Click **"Create Project"**
2. Select **"Node.js"** as the platform
3. Name it: `automated-profit-system`
4. Click **"Create Project"**

---

## Step 3: Copy Your DSN (30 sec)

You'll see a screen with your DSN that looks like:

```
https://abc123def456@o123456.ingest.sentry.io/7891011
```

**Copy this entire URL!**

---

## Step 4: Add to Your .env File (30 sec)

Open `.env` file and add:

```bash
SENTRY_DSN=https://abc123def456@o123456.ingest.sentry.io/7891011
```

(Replace with your actual DSN from Step 3)

**Don't have a .env file?**
```bash
cp .env.example .env
# Then add your SENTRY_DSN to the new .env file
```

---

## Step 5: Test It! (1 min)

### Start your server:
```bash
npm start
```

### Trigger a test error:
```bash
curl http://localhost:3000/api/test-sentry-error
```

### Check Sentry:
1. Go to https://sentry.io
2. Click on your project
3. You should see the test error appear within seconds! 🎉

---

## ✅ You're Done!

Sentry is now tracking all errors in real-time!

### What You Get:

✅ **Real-time alerts** - Know about errors before users report them
✅ **Stack traces** - See exactly where errors happen
✅ **User context** - Know which users are affected
✅ **Performance monitoring** - Track slow endpoints
✅ **Release tracking** - Monitor errors by version

---

## 🎯 Next Steps

### Set Up Alerts (Optional but Recommended)

1. Go to **Settings** → **Alerts**
2. Create alert rule:
   - **When:** Error occurs
   - **Send to:** Email or Slack
   - **For project:** automated-profit-system

### Integrate with Slack (Optional)

1. Go to **Settings** → **Integrations**
2. Click **Slack**
3. Click **Add to Slack**
4. Choose your channel (e.g., #errors)
5. Get instant Slack notifications for errors!

---

## 📊 Using Sentry

### View Errors
- Dashboard: https://sentry.io
- Click your project name
- See all errors in real-time

### Debug Errors
Each error shows:
- Stack trace
- Request details
- User information
- Breadcrumbs (what happened before)
- Environment (production/staging)

### Filter Errors
- By severity (error, warning, info)
- By endpoint
- By user
- By time period
- By environment

---

## 🔧 Production Deployment

When deploying to Render:

1. Go to Render dashboard
2. Click your service
3. Go to **Environment**
4. Add: `SENTRY_DSN` → (your DSN)
5. Click **Save Changes**

**That's it!** Render will automatically use it.

---

## 🆘 Troubleshooting

### Not seeing errors in Sentry?

**Check 1:** Is your DSN correct in .env?
```bash
cat .env | grep SENTRY_DSN
```

**Check 2:** Did you restart your server?
```bash
# Stop the server (Ctrl+C)
npm start
```

**Check 3:** Test manually:
```bash
curl http://localhost:3000/api/test-sentry-error
```

**Check 4:** Look for this in server logs:
```
✅ Sentry error monitoring initialized
```

If you see:
```
⚠️  Sentry DSN not configured - error monitoring disabled
```
Then your DSN isn't being read from .env

### Still not working?

Check that your .env file has:
1. No quotes around the DSN
2. No spaces before/after the =
3. The DSN starts with `https://`

**Correct:**
```bash
SENTRY_DSN=https://abc123@o123.ingest.sentry.io/456
```

**Incorrect:**
```bash
SENTRY_DSN = "https://abc123@o123.ingest.sentry.io/456"  # NO!
```

---

## 🎉 Success!

If you see your test error in Sentry, you're all set!

Every error in your application will now be:
- Automatically captured
- Logged with full context
- Visible in your dashboard
- Sent to alerts (if configured)

**Your system is now production-ready with enterprise error monitoring!** 🚀

---

## 📚 Learn More

- **Sentry Docs:** https://docs.sentry.io/platforms/node/
- **Best Practices:** `docs/ERROR_MONITORING_SETUP.md`
- **Your Dashboard:** https://sentry.io

---

**Total Setup Time:** ~5 minutes
**Cost:** $0 (free tier)
**Value:** Priceless! 😄
