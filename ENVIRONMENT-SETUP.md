# 🔧 Environment Setup & Validation Guide

This guide ensures your system always has the right configuration data.

## ✅ **Automatic Validation**

The system now **automatically validates** your environment on startup:

- ✅ Checks all required variables
- ✅ Validates API key formats
- ✅ Warns about missing configurations
- ✅ Shows helpful error messages
- ✅ Exits in production if critical variables missing

---

## 🚀 **Quick Start**

### **1. Check Your Current Configuration**

```bash
# Check all environment variables
npm run check:env

# Check only required variables
npm run check:env:required

# Check production readiness
npm run check:env:production

# Show environment information
npm run check:env:info
```

### **2. Generate .env Template**

```bash
npm run generate:env
```

This creates `.env.example` with all available variables.

### **3. Configure Your Environment**

```bash
# Copy example to .env
cp .env.example .env

# Edit with your values
nano .env
# or
code .env
```

---

## 📋 **Required Environment Variables**

These **MUST** be configured for the app to work:

### **Payment Processing (Stripe)**
```bash
STRIPE_SECRET_KEY=sk_test_...           # Required
STRIPE_WEBHOOK_SECRET=whsec_...         # Required
STRIPE_PUBLISHABLE_KEY=pk_test_...      # Optional
```

**Where to get:**
- https://dashboard.stripe.com/apikeys

---

### **AI Features (OpenAI)**
```bash
OPENAI_API_KEY=sk-...                   # Required
```

**Where to get:**
- https://platform.openai.com/api-keys

---

### **POD Integration (Printful)**
```bash
PRINTFUL_API_KEY=your_key_here          # Required
```

**Where to get:**
- https://www.printful.com/dashboard/store
- Settings → API

---

### **Email Notifications (SMTP)**
```bash
SMTP_HOST=smtp.gmail.com                # Required
SMTP_PORT=587                           # Default: 587
SMTP_USER=your@email.com                # Required
SMTP_PASS=your_app_password             # Required
SMTP_FROM=noreply@yoursite.com          # Optional
```

**For Gmail:**
1. Enable 2FA on your Google account
2. Generate App Password: https://support.google.com/accounts/answer/185833
3. Use the app password as `SMTP_PASS`

---

## 🏭 **Production Requirements**

For production/Vercel deployment:

### **Cloud Database (Required)**

Choose ONE:

**Option 1: Vercel Postgres** (Recommended)
```bash
POSTGRES_URL=postgresql://...
```

**Option 2: Supabase**
```bash
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=...
```

**Option 3: MongoDB Atlas**
```bash
MONGODB_URI=mongodb+srv://...
```

---

### **Production Stripe Keys**

Replace test keys with live keys:
```bash
STRIPE_SECRET_KEY=sk_live_...           # NOT sk_test_
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## 🛠️ **npm Commands Reference**

All available environment commands:

```bash
# Validation
npm run check:env                    # Full validation
npm run check:env:required           # Required vars only
npm run check:env:production         # Production readiness
npm run check:env:info               # Environment info

# Generation
npm run generate:env                 # Create .env.example

# Server
npm start                            # Start with validation
npm run dev                          # Dev mode with validation
```

---

## ✅ **Validation Features**

### **On Server Startup**

When you run `npm start`, the server automatically:

1. ✅ Validates all environment variables
2. ✅ Checks API key formats
3. ✅ Warns about missing configurations
4. ✅ Shows helpful error messages
5. ✅ Exits if critical errors in production

### **Manual Validation**

Run anytime:
```bash
npm run check:env
```

**Output Example:**
```
✅ STRIPE_SECRET_KEY: Valid
✅ OPENAI_API_KEY: Valid
❌ PRINTFUL_API_KEY: MISSING (required)
⚠️  SMTP_HOST: Not configured (optional)
```

---

## 🎯 **Production Deployment Checklist**

Before deploying to Vercel:

```bash
# 1. Check production readiness
npm run check:env:production

# 2. Verify all required variables
npm run check:env:required

# 3. Check environment info
npm run check:env:info
```

**What to verify:**

- [ ] All required variables configured
- [ ] Cloud database configured
- [ ] Using production Stripe keys (sk_live_)
- [ ] Email configuration working
- [ ] All API keys valid

---

## 🔍 **Validation Rules**

The system validates:

### **API Key Formats**

- **Stripe Secret**: Must start with `sk_`
- **Stripe Webhook**: Must start with `whsec_`
- **OpenAI**: Must start with `sk-`
- **Email**: Must contain `@`
- **URLs**: Must start with `http`

### **Production Checks**

- ⚠️ Warns if using test Stripe keys in production
- ❌ Requires cloud database for Vercel/production
- ✅ Validates all critical services configured

---

## 📊 **Environment Information**

View your current environment:

```bash
npm run check:env:info
```

**Shows:**
- Node.js version
- Platform (Windows/Linux/Mac)
- Environment (development/production)
- Configured services
- Database status

---

## 🐛 **Troubleshooting**

### **"Missing required variable: STRIPE_SECRET_KEY"**

**Solution:**
1. Copy `.env.example` to `.env`
2. Add your Stripe key
3. Restart the server

---

### **"Invalid format" warnings**

**Solution:**
Check the example format in the error message:
```
⚠️  STRIPE_SECRET_KEY: Invalid format
   Expected format: sk_test_...
```

---

### **"No cloud database configured for production"**

**Solution:**
For Vercel deployment:
1. Create Vercel Postgres database
2. Add `POSTGRES_URL` to environment variables
3. See `VERCEL-DEPLOYMENT.md` for details

---

## 💡 **Best Practices**

### **Development**

```bash
# Use test keys for development
STRIPE_SECRET_KEY=sk_test_...
```

### **Production**

```bash
# Use live keys for production
STRIPE_SECRET_KEY=sk_live_...

# Use cloud database
POSTGRES_URL=postgresql://...
```

### **Security**

- ✅ **NEVER** commit `.env` to git
- ✅ **ALWAYS** use `.env.example` for templates
- ✅ Use different keys for dev and production
- ✅ Rotate keys regularly

---

## 📚 **Related Documentation**

- **Deployment**: See `VERCEL-DEPLOYMENT.md`
- **Quick Start**: See `QUICK-DEPLOY.md`
- **All Features**: See `ALL-PHASES-COMPLETE.md`

---

## 🎉 **Benefits**

With automatic environment validation:

✅ **No More Silent Failures** - Know immediately if config is wrong
✅ **Clear Error Messages** - Helpful guidance to fix issues
✅ **Production Safety** - Prevents deploying with bad config
✅ **Time Savings** - Catch errors before they cause problems
✅ **Documentation** - Built-in reference for all variables

---

## 🆘 **Need Help?**

```bash
# Show all validation commands
node scripts/check-env.js help

# Check your configuration
npm run check:env

# View environment info
npm run check:env:info
```

---

**Your system now ensures all environment data is always correct!** ✅
