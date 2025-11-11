# Vercel Environment Variables Configuration

## 🔴 REQUIRED Variables (App will crash without these)

### JWT_SECRET
**Purpose:** Authentication and security tokens
**Value:**
```
f13d8aee2ff0a947c6d77ca34c326894ee987fdc384c3d37577a39f4851df48a
```
**Environments:** Production, Preview, Development

---

### NODE_ENV
**Purpose:** Sets application to production mode
**Value:**
```
production
```
**Environments:** Production, Preview, Development

---

### ALLOWED_ORIGINS
**Purpose:** CORS security - which domains can access your API
**Value:**
```
https://automated-profit-system.vercel.app
```
**Environments:** Production, Preview, Development

**Note:** Add additional domains separated by commas if you have a frontend:
```
https://automated-profit-system.vercel.app,https://your-frontend.vercel.app
```

---

## 🟡 RECOMMENDED Variables (Features work better with these)

### SENTRY_DSN
**Purpose:** Error monitoring and tracking
**Value:** Get from https://sentry.io after creating a project
**Example:**
```
https://abc123@o123456.ingest.sentry.io/7890123
```
**Environments:** Production only

**How to get:**
1. Go to https://sentry.io (sign up for free)
2. Create new project → Select "Node.js"
3. Copy the DSN from project settings

---

## 🟢 OPTIONAL Variables (Add these when you're ready)

### PRINTFUL_API_KEY
**Purpose:** Automated product listing and print-on-demand
**Where to get:** https://www.printful.com/dashboard/store → Settings → API
**Environments:** Production, Preview

---

### STRIPE_API_KEY
**Purpose:** Payment processing
**Where to get:** https://dashboard.stripe.com/apikeys
**Use:** Secret key (starts with `sk_`)
**Environments:** Production only

---

### OPENAI_API_KEY
**Purpose:** AI-powered features
**Where to get:** https://platform.openai.com/api-keys
**Environments:** Production, Preview

---

### CANVA_API_KEY
**Purpose:** Automated design generation
**Where to get:** https://www.canva.com/developers
**Environments:** Production, Preview

---

### CANVA_BRAND_TEMPLATE_ID
**Purpose:** Your Canva brand template
**Where to get:** From your Canva brand kit
**Environments:** Production, Preview

---

## 📋 Quick Copy Format for Vercel Dashboard

### Required (Add These First)
```
JWT_SECRET=f13d8aee2ff0a947c6d77ca34c326894ee987fdc384c3d37577a39f4851df48a
NODE_ENV=production
ALLOWED_ORIGINS=https://automated-profit-system.vercel.app
```

### Recommended (Add When Ready)
```
SENTRY_DSN=your_sentry_dsn_here
```

### Optional (Add Later)
```
PRINTFUL_API_KEY=your_printful_api_key
STRIPE_API_KEY=sk_live_your_stripe_key
OPENAI_API_KEY=sk-your_openai_key
CANVA_API_KEY=your_canva_key
CANVA_BRAND_TEMPLATE_ID=your_template_id
```

---

## 🎯 How to Add in Vercel Dashboard

1. Go to: https://vercel.com/jerzii-ais-projects/automated-profit-system/settings/environment-variables

2. Click **"Add New"**

3. For each variable:
   - **Name:** Enter variable name (e.g., `JWT_SECRET`)
   - **Value:** Enter the value (e.g., the long JWT secret)
   - **Environments:** Check all three boxes (Production, Preview, Development)
   - Click **"Save"**

4. Repeat for each variable

5. After adding all required variables:
   - Go to **Deployments** tab
   - Click **"..."** on latest deployment
   - Click **"Redeploy"**
   - Wait 60 seconds

---

## ✅ Verification

After redeployment, test:
```
https://automated-profit-system.vercel.app/api/health
```

**Should return:**
```json
{
  "success": true,
  "message": "API is healthy and online",
  "environment": "production",
  "checks": {
    "server": { "status": "healthy" }
  }
}
```

---

## 🚨 Troubleshooting

**If you still get 500 error:**
- Check Vercel deployment logs for which variable is missing
- Make sure JWT_SECRET is at least 32 characters
- Verify all required variables are added
- Ensure you redeployed after adding variables

**If you get "Missing required environment variables":**
- The error message will tell you which one
- Add that variable and redeploy
