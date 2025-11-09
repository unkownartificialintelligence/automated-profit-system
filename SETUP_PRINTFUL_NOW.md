# ⚡ SETUP YOUR PRINTFUL API KEY - 2 MINUTE SETUP

## 🎯 What This Does

This will automatically:
- ✅ Validate your Printful API key
- ✅ Save it to the `.env` file
- ✅ Test the connection to Printful
- ✅ Enable all automation features
- ✅ Get you ready to create products via API

---

## 🚀 STEP 1: Get Your Printful API Key (90 seconds)

### Option A: I'll Guide You (Easiest)

**1. Open Printful Settings**
   - Go to: https://www.printful.com/dashboard/settings
   - If you don't have an account, create one (free!)

**2. Enable API Access**
   - Click **"API"** in the left sidebar
   - Click the **"Enable API Access"** button
   - Your API key will appear (looks like: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

**3. Copy Your API Key**
   - Click the **copy button** next to your API key
   - Or select and copy the entire key

✅ **Done! You now have your API key copied**

---

## ⚡ STEP 2: Configure It Automatically (30 seconds)

### Method 1: Use the API Endpoint (Recommended)

Run this command (replace `YOUR_API_KEY` with your actual key):

```bash
curl -X POST http://localhost:3003/api/automation/setup/printful-key \
  -H "Content-Type: application/json" \
  -d '{"api_key":"YOUR_ACTUAL_API_KEY_HERE"}'
```

**What happens:**
1. ✅ Validates your API key with Printful
2. ✅ Saves it to `.env` file automatically
3. ✅ Enables it for current session
4. ✅ Shows you next steps

**Example Response:**
```json
{
  "success": true,
  "message": "✅ Printful API key configured successfully!",
  "validation": "Connected to Printful successfully! You have 0 products.",
  "configuration": {
    "api_key_masked": "12345678...abcd",
    "saved_to": ".env file"
  },
  "next_steps": [
    "1. Your API key is now saved and active",
    "2. Test with: curl http://localhost:3003/api/automation/setup/test",
    "3. Discover products: curl http://localhost:3003/api/automation/discover/trending-products"
  ],
  "automation_ready": true
}
```

---

### Method 2: Use the Shell Script

```bash
./setup-printful-simple.sh
```

Then paste your API key when prompted.

---

### Method 3: Manual Setup

Edit the `.env` file:

```bash
# Replace this line:
PRINTFUL_API_KEY=your_printful_api_key_here

# With your actual key:
PRINTFUL_API_KEY=12345678-1234-1234-1234-123456789abc
```

Then restart the server:
```bash
npm start
```

---

## ✅ STEP 3: Test Everything (10 seconds)

Run this to test all automation features:

```bash
curl http://localhost:3003/api/automation/setup/test
```

**Expected Response:**
```json
{
  "success": true,
  "message": "🎉 All automation features working!",
  "tests": {
    "printful_api_configured": true,
    "printful_connection": "✅ Connected (0 products)",
    "trending_products": "✅ Working (14 products found)",
    "email_templates": "✅ Working",
    "automation_ready": true
  },
  "ready_for_automation": true
}
```

---

## 🎉 YOU'RE DONE!

Your Printful automation is now configured and ready!

---

## 🚀 What You Can Do Now

### 1. Check Your Status
```bash
curl http://localhost:3003/api/automation/setup/status
```

### 2. Discover Trending Products
```bash
curl http://localhost:3003/api/automation/discover/trending-products
```

**You'll see:**
- 14 trending products ranked by profit potential
- Competition analysis (Low/Medium/High)
- Profit potential ratings

**Top picks right now:**
- 🏆 Cat Dad (Trend: 78, Competition: LOW, Profit: VERY HIGH)
- 🏆 Dog Mom (Trend: 85, Competition: MEDIUM, Profit: HIGH)
- 🏆 Corgi Lover (Trend: 72, Competition: LOW, Profit: HIGH)

### 3. Get Email Templates
```bash
curl -X POST http://localhost:3003/api/automation/outreach/email-template \
  -H "Content-Type: application/json" \
  -d '{"product_name":"Cat Dad T-Shirt","shop_url":"https://etsy.com/shop/yourshop"}'
```

**You'll get:**
- Email templates (initial launch + follow-up)
- Facebook post templates
- Instagram captions
- Twitter posts

### 4. Create Product on Printful (When You Have a Design)

```bash
curl -X POST http://localhost:3003/api/automation/printful/create-product \
  -H "Content-Type: application/json" \
  -d '{
    "product_name": "Cat Dad T-Shirt",
    "design_url": "https://your-design-url.com/design.png",
    "printful_api_key": "YOUR_KEY",
    "retail_price": 24.99
  }'
```

**Note:** Design URL must be publicly accessible (use Imgur.com or Dropbox public link)

---

## 🔥 Quick Start Workflow

Now that you're configured, here's your path to first sale:

**1. Discover Trending Product (1 min)**
```bash
curl http://localhost:3003/api/automation/discover/trending-products
```
Pick "Cat Dad" (best opportunity!)

**2. Create Design (15 min)**
- Go to Canva.com
- Search "cat dad t-shirt"
- Customize design
- Download PNG
- Upload to Imgur.com (get public URL)

**3. Auto-Create on Printful (2 min)**
```bash
curl -X POST http://localhost:3003/api/automation/printful/create-product \
  -H "Content-Type: application/json" \
  -d '{
    "product_name": "Cat Dad T-Shirt",
    "design_url": "YOUR_IMGUR_URL",
    "printful_api_key": "YOUR_KEY",
    "retail_price": 24.99
  }'
```

**4. Sync to Etsy (10 min)**
- Go to Printful dashboard
- Find product
- Click "Push to Store" → Etsy

**5. Get Outreach Templates (1 min)**
```bash
curl -X POST http://localhost:3003/api/automation/outreach/email-template \
  -H "Content-Type: application/json" \
  -d '{"product_name":"Cat Dad T-Shirt"}'
```

**6. Launch Outreach (30 min)**
- Email 10 cat owner friends
- Post on social media
- Join cat lover groups

**Expected:** First sale in 24-48 hours! 🎉

---

## 🆘 Troubleshooting

### "Invalid Printful API key"
- Double-check you copied the full key
- Make sure there are no extra spaces
- Get a new key from https://www.printful.com/dashboard/settings

### "Could not connect to Printful"
- Check your internet connection
- Verify server is running: `curl http://localhost:3003/api/health`
- Try the test endpoint: `curl http://localhost:3003/api/automation/setup/test`

### "API key not configured"
- Run the setup command again
- Check `.env` file exists and has PRINTFUL_API_KEY
- Restart server: `npm start`

---

## 📊 Available Setup Endpoints

### Check Status
```bash
GET /api/automation/setup/status
```
Shows current configuration

### Configure API Key
```bash
POST /api/automation/setup/printful-key
Body: {"api_key": "YOUR_KEY"}
```
Validates and saves your API key

### Test Everything
```bash
GET /api/automation/setup/test
```
Tests all automation features

---

## 🎯 Next Steps After Setup

1. **Read the automation guide:** `cat AUTOMATION_GUIDE.md`
2. **Discover trending products:** Start with `/api/automation/discover/trending-products`
3. **Create your first design:** Use Canva.com
4. **Launch your first product:** Follow the quick start workflow above

---

## 💰 What's Automated For You

Once configured, you can:
- ✅ Find trending products in 5 minutes
- ✅ Create Printful products in 2 minutes (via API)
- ✅ Get outreach templates instantly
- ✅ Track all sales automatically
- ✅ Manage team profit sharing
- ✅ Monitor profit margins

**Total time saved: 3+ hours per product!**

---

## 🚀 Ready to Automate!

Your Printful API is configured. Time to make sales!

**Start here:**
```bash
curl http://localhost:3003/api/automation/discover/trending-products
```

Pick a product and launch! 💰
