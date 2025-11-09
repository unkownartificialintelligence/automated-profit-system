# API Keys Quick Reference Guide

## 🖼️ 1. Printful API Key (Print-on-Demand)

### What it's for:
Product fulfillment, inventory management, order processing

### How to get it:

1. **Go to:** https://www.printful.com/dashboard/store
2. **Login/Sign up** to your Printful account
3. Click on **Settings** → **API**
4. Click **Generate API Key**
5. **Copy the key** (starts with something like `sk_live_...` or similar)

### Add to .env:
```bash
PRINTFUL_API_KEY=your_actual_printful_key_here
```

---

## 💳 2. Stripe API Key (Payment Processing)

### What it's for:
Processing customer payments, managing subscriptions

### How to get it:

1. **Go to:** https://dashboard.stripe.com/register
2. **Create account** or login
3. Click **Developers** → **API keys**
4. For **DEVELOPMENT/TESTING:**
   - Copy the **"Secret key" from Test Data** (starts with `sk_test_...`)
5. For **PRODUCTION:**
   - Toggle to **Live mode**
   - Copy the **"Secret key"** (starts with `sk_live_...`)

### Add to .env:
```bash
# For testing:
STRIPE_API_KEY=sk_test_your_test_key_here

# For production (later):
STRIPE_API_KEY=sk_live_your_live_key_here
```

### Optional - Webhook Secret:
1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select events you want to listen for
5. Copy the **Signing secret** (starts with `whsec_...`)

```bash
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

---

## 🤖 3. OpenAI API Key (AI Features)

### What it's for:
AI-powered product descriptions, profit optimization, content generation

### How to get it:

1. **Go to:** https://platform.openai.com/signup
2. **Create account** or login
3. Click your profile → **View API keys**
4. Click **Create new secret key**
5. **Name it** (e.g., "Automated Profit System")
6. **Copy the key** (starts with `sk-...`)
   - ⚠️ **IMPORTANT:** You can only see this once!

### Add to .env:
```bash
OPENAI_API_KEY=sk-your_openai_key_here
```

### Cost Management:
- Set usage limits at: https://platform.openai.com/account/billing/limits
- Monitor usage at: https://platform.openai.com/usage
- **Recommended:** Start with $5-10 limit for testing

---

## ✅ Quick Checklist

- [ ] Printful account created
- [ ] Printful API key copied
- [ ] Stripe account created
- [ ] Stripe TEST key copied (for development)
- [ ] OpenAI account created
- [ ] OpenAI API key copied
- [ ] OpenAI usage limit set

---

## 📝 Next Steps

Once you have all the API keys:

1. Paste them in the `.env` file
2. Restart the server
3. Test the health endpoint
4. All checks should show "healthy" ✅

---

## 🔒 Security Reminders

- ✅ Never commit API keys to git
- ✅ Use test keys for development
- ✅ Switch to live keys only in production
- ✅ Rotate keys every 90 days
- ✅ Set spending limits on all services

---

## 💡 Pro Tips

**Printful:**
- Start with sample products to test fulfillment
- Check shipping rates for your target markets
- Enable automatic order confirmation

**Stripe:**
- Use test mode extensively before going live
- Set up webhook endpoint for payment notifications
- Enable fraud detection features

**OpenAI:**
- Start with GPT-3.5-turbo (cheaper)
- Cache common responses to save costs
- Monitor token usage daily

---

**Ready to add your keys?** Let me know when you have them and I'll help you configure everything!
