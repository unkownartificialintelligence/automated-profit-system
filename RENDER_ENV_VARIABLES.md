# 🔐 Render Environment Variables Setup

Copy these into Render Dashboard → Environment

---

## ⚠️ REQUIRED (Must Set These)

```bash
JWT_SECRET=<paste your generated secret here>
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Example: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0

NODE_ENV=production
# Always set to: production

ALLOWED_ORIGINS=https://your-frontend-domain.com
# Your frontend URL(s), comma-separated
# For testing, use: http://localhost:3000,http://localhost:5173
# For production, replace with your actual domain
```

---

## ✅ RECOMMENDED (Highly Recommended)

```bash
SENTRY_DSN=<your Sentry DSN>
# From: https://sentry.io → Project Settings → Client Keys
# Example: https://abc123@o123456.ingest.sentry.io/7891011

LOG_LEVEL=info
# Options: error, warn, info, debug
# Use 'info' for production
```

---

## 📦 OPTIONAL (API Integrations)

```bash
PRINTFUL_API_KEY=<your Printful API key>
# Get from: https://www.printful.com/dashboard/store → Settings → API
# Only needed if using Printful integration

STRIPE_API_KEY=<your Stripe API key>
# Get from: https://dashboard.stripe.com/apikeys
# Only needed if accepting payments

OPENAI_API_KEY=<your OpenAI API key>
# Get from: https://platform.openai.com/api-keys
# Only needed if using AI features

CANVA_API_KEY=<your Canva API key>
# Get from: https://www.canva.com/developers
# Only needed if using Canva automation
```

---

## 🎯 Quick Copy Format (For Render)

When adding to Render, use this format:

**Key:** `JWT_SECRET`
**Value:** `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0`

**Key:** `NODE_ENV`
**Value:** `production`

**Key:** `ALLOWED_ORIGINS`
**Value:** `https://yourdomain.com`

---

## ✅ Minimum to Deploy

You can deploy with just these 3:
1. JWT_SECRET
2. NODE_ENV
3. ALLOWED_ORIGINS

Add others as needed!

---

## 🔍 How to Add in Render

1. Go to: https://dashboard.render.com
2. Click: Your service
3. Click: **Environment** (left sidebar)
4. Click: **Add Environment Variable**
5. Enter Key and Value
6. Click: **Add**
7. Repeat for each variable
8. Click: **Save Changes**

---

## 🆘 Troubleshooting

**JWT_SECRET too short?**
- Must be 32+ characters
- Generate a new one with the command above

**Server won't start?**
- Check all REQUIRED variables are set
- Check for typos in variable names
- JWT_SECRET must have no quotes or spaces

**CORS errors?**
- Check ALLOWED_ORIGINS matches your frontend URL exactly
- Include protocol (https://)
- No trailing slashes

---

**Ready to add these?** Let's go! 🚀
