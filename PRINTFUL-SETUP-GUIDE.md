# 📦 Printful Setup & Upload Guide

Complete guide for setting up Printful and uploading your designs.

---

## 🎯 Overview

Printful is your print-on-demand fulfillment partner. They:
- ✅ Print your designs on products
- ✅ Package and ship to customers
- ✅ Handle customer service
- ✅ Integrate with Etsy/Shopify
- ✅ No upfront costs (you pay per order)

**Cost:** Free to set up, ~$12.95 per t-shirt (you sell for $24.99 = $12 profit)

---

## 🚀 Part 1: Create Printful Account

### Step 1: Sign Up

1. Go to [printful.com](https://www.printful.com)
2. Click "Sign up" (top right)
3. Enter email and create password
4. Verify your email
5. Complete profile setup

**Time: 5 minutes**

### Step 2: Connect Your Store

**Option A: Etsy (Recommended for Beginners)**

1. In Printful dashboard, click "Stores"
2. Click "Add Store" → "Etsy"
3. Click "Connect to Etsy"
4. Log into your Etsy account
5. Allow Printful access
6. Done! Your stores are connected

**Option B: Shopify**

1. Click "Add Store" → "Shopify"
2. Enter your Shopify store URL
3. Install Printful app from Shopify App Store
4. Authorize connection
5. Done!

**Option C: Manual (No Marketplace)**

1. Skip store connection
2. Use Printful's built-in store
3. Share direct links to customers
4. Process orders manually

**Time: 10 minutes**

### Step 3: Set Up Payment Method

1. Go to "Settings" → "Billing"
2. Add credit/debit card
3. Or connect PayPal

**Note:** You're only charged when an order is placed. No monthly fees!

---

## 📤 Part 2: Upload Your Designs

### For Each of Your 7 Products:

#### Product 1: Cat Dad T-Shirt (START HERE - Easiest!)

**Step-by-Step:**

1. **Go to Products**
   - Click "Product templates" in left sidebar
   - Click "Create product template"

2. **Choose Product**
   - Search "Bella Canvas 3001"
   - Select "Bella+Canvas 3001 Unisex Jersey Short Sleeve Tee"
   - Click "Continue to design"

3. **Upload Your Design**
   - Click "Upload" button
   - Select your cat-dad.png file
   - Wait for upload (10-20 seconds)

4. **Position Your Design**
   - Design will appear on shirt preview
   - Click and drag to center
   - Resize if needed (recommended: 12" x 16")
   - Ensure it's centered vertically and horizontally

5. **Select Colors**
   - Check these colors (best sellers):
     - ✅ Black
     - ✅ White
     - ✅ Navy
     - ✅ Heather Gray
     - ✅ Dark Heather Gray
   - Click on each color to see preview
   - Design should look good on all

6. **Set Sizes**
   - Check all available sizes:
     - ✅ S, M, L, XL, 2XL, 3XL

7. **Set Your Retail Price**
   - Click "Proceed to pricing"
   - Printful cost: ~$12.95
   - Your retail price: **$24.99**
   - Your profit: **$12.04** per sale
   - Click "Confirm"

8. **Save Product Template**
   - Give it a name: "Cat Dad T-Shirt"
   - Add to your store (if connected)
   - Click "Save"

**Time: 15 minutes for first product, 5 minutes for subsequent**

---

## 💰 Pricing Strategy

### Recommended Prices:

| Your Cost | Retail Price | Your Profit | Margin |
|-----------|--------------|-------------|---------|
| $12.95 | $24.99 | $12.04 | 48% |
| $12.95 | $22.99 | $10.04 | 44% |
| $12.95 | $27.99 | $15.04 | 54% |

**Recommended: $24.99** - Sweet spot for profitability and competitiveness

### Competitive Analysis:

- **Etsy average:** $18-28
- **Amazon:** $15-25
- **Your store:** $24.99 ✅

**Why $24.99 works:**
- Not too cheap (signals quality)
- Not too expensive (still affordable)
- Nice round number (psychological)
- Good profit margin (48%)

---

## 🎨 Design Placement Guide

### T-Shirt Design Specs:

**Front Center (Recommended for all your products):**
- Position: Center chest
- Size: 12" x 16" (or slightly smaller)
- Placement: 3-4" from collar

**Back (Optional for future):**
- Full back: 12" x 16"
- Upper back: 9" x 12"

**Sleeve (Advanced):**
- Left sleeve: 2.5" x 4"
- Right sleeve: 2.5" x 4"

### Pro Tips:

1. **Always preview on multiple colors**
   - Some designs look great on white, terrible on black
   - Solution: Create separate files for light/dark shirts

2. **Don't go too small**
   - Minimum 10" width for visibility
   - Recommended: 12" width

3. **Leave margins**
   - Don't go edge-to-edge
   - Leave 2-3" on all sides

---

## 🔄 Bulk Upload (After First Product)

Once you've done Cat Dad, the rest are faster:

1. **Duplicate Template**
   - Find your Cat Dad template
   - Click "⋮" → "Duplicate"
   - Upload new design
   - Change product name
   - Save

2. **Use Same Settings**
   - Same colors (Black, White, Navy, Gray)
   - Same sizes (S-3XL)
   - Same price ($24.99)
   - Just swap the design file

**Time savings:** 5 minutes per product instead of 15!

---

## 🛍️ Part 3: Sync to Marketplace

### Etsy Sync:

1. **After saving product template**
   - Click "Push to store"
   - Select your Etsy shop
   - Product will appear as draft in Etsy

2. **Complete Etsy Listing**
   - Go to Etsy Seller Dashboard
   - Find draft listing
   - Add photos (use Printful mockups!)
   - Add title, description, tags (use your automation output!)
   - Publish

### Shopify Sync:

1. **Auto-sync enabled**
   - Products appear in Shopify automatically
   - Edit product page in Shopify admin
   - Add mockup images
   - Publish to store

---

## 📸 Mockup Images (Free!)

Printful generates free mockup images:

1. **Get Mockups**
   - Go to your product template
   - Click "Mockups" tab
   - Download all angles:
     - Front view
     - Back view (if applicable)
     - Lifestyle shots
     - Flat lay

2. **Use on Etsy/Shopify**
   - Upload 5-8 mockups per listing
   - Use variety of angles
   - Include lifestyle shots
   - Show on multiple models

**Printful's mockups are high-quality and free!**

---

## ⚙️ Part 4: Configure API Key (Optional but Recommended)

This enables full automation features:

### Get Your API Key:

1. Go to Printful Dashboard
2. Click "Settings" → "Stores"
3. Click your store name
4. Click "API" tab
5. Click "Enable API Access"
6. Copy your API key

### Add to Your System:

**Method 1: Via API**

```bash
curl -X POST http://localhost:3000/api/automation/setup/printful-key \
  -H "Content-Type: application/json" \
  -d '{"api_key":"YOUR_API_KEY_HERE"}'
```

**Method 2: Manual .env File**

1. Open `.env` file in your project
2. Add line:
   ```
   PRINTFUL_API_KEY=your_api_key_here
   ```
3. Save file
4. Restart server

**What this enables:**
- Automated product creation from automation pipeline
- Bulk operations
- Advanced integrations

---

## ✅ Upload Checklist

For each of your 7 products:

### Cat Dad (START HERE)
- [ ] Design file ready (cat-dad.png)
- [ ] Uploaded to Printful
- [ ] Colors selected (Black, White, Navy, Gray)
- [ ] Sizes selected (S-3XL)
- [ ] Price set ($24.99)
- [ ] Mockups generated
- [ ] Synced to Etsy/Shopify
- [ ] Listing published

### Introvert Club (NEXT - Simple design)
- [ ] Design file ready
- [ ] Uploaded to Printful
- [ ] Colors selected
- [ ] Sizes selected
- [ ] Price set
- [ ] Mockups generated
- [ ] Synced to store
- [ ] Listing published

### Holiday Gift Ideas (URGENT - Seasonal)
- [ ] Design file ready
- [ ] Uploaded to Printful
- [ ] Colors selected
- [ ] Sizes selected
- [ ] Price set
- [ ] Mockups generated
- [ ] Synced to store
- [ ] Listing published

### Dog Mom
- [ ] Complete checklist above

### Plant Mom
- [ ] Complete checklist above

### Christmas Sweater
- [ ] Complete checklist above

### Sarcastic Quotes
- [ ] Complete checklist above

---

## 🎯 Upload Order (Recommended)

**Week 1 (Launch these first):**
1. Cat Dad - Low competition, high profit
2. Introvert Club - Simple, relatable
3. Holiday Gift Ideas - Seasonal urgency

**Week 2 (Follow up):**
4. Dog Mom - High demand
5. Plant Mom - Growing trend
6. Christmas Sweater - Holiday
7. Sarcastic Quotes - Evergreen

**Why this order:**
- Start with easiest/highest ROI
- Build momentum
- Test the system
- Holiday items while season is hot

---

## 💡 Pro Tips

### 1. Quality Control

Before publishing, verify:
- Design is centered properly
- No pixelation or blurriness
- Colors look good on all shirt colors
- Text is readable
- No spelling errors

### 2. Mockup Best Practices

Use these mockups for best conversion:
1. Front view on white background
2. Model wearing (male and/or female)
3. Flat lay styled shot
4. Detail/close-up of design
5. Lifestyle scene (person in environment)

### 3. Product Descriptions

Use the automation-generated descriptions:
1. Go to `/data/full-automation-log.json`
2. Find your product's Etsy listing
3. Copy title, description, tags
4. Paste into Etsy/Shopify
5. Customize if needed

### 4. Shipping Settings

In Printful:
- Standard shipping: 2-7 business days
- Free shipping threshold: $35+
- International: Enable for more sales

---

## 🚨 Common Issues & Solutions

**"My design is cut off"**
- Design is too large
- Reduce to 12" x 16" or smaller
- Leave 2" margin on all sides

**"Colors look different on different shirts"**
- Normal! Design will adapt
- Test on multiple colors before publishing
- Consider separate files for light/dark

**"File upload failed"**
- File too large (max 25 MB)
- Compress PNG using tinypng.com
- Or reduce dimensions slightly

**"Can't find Bella+Canvas 3001"**
- Search "3001" in product search
- Look under "Men's T-shirts"
- Select "Unisex Jersey Short Sleeve Tee"

**"Product won't sync to Etsy"**
- Reconnect Etsy in Printful settings
- Ensure Etsy shop is active
- Check that you have listing slots available

---

## 📊 Expected Timeline

**Day 1: Setup**
- Create Printful account: 10 min
- Connect Etsy/Shopify: 10 min
- Total: 20 minutes

**Days 2-3: First 3 Products**
- Upload and configure: 15 min each
- Generate mockups: 5 min each
- Total: 60 minutes

**Week 2: Remaining 4 Products**
- Upload (now faster): 10 min each
- Total: 40 minutes

**Total Time Investment: ~2 hours for all 7 products**

---

## 🎉 Next Steps

After all products are uploaded:

1. ✅ Products live on Printful
2. ✅ Synced to Etsy/Shopify
3. ✅ Mockups generated
4. 📢 **Go to MARKETING-STRATEGY.md** for launch plan
5. 💰 **Go to SALES-TRACKING-GUIDE.md** to track profits

---

## 🆘 Need Help?

**Printful Support:**
- Email: support@printful.com
- Live chat: In dashboard (bottom right)
- Help center: printful.com/help
- Response time: 1-4 hours

**Common questions:**
- "How do I get paid?" → Customers pay you, you pay Printful
- "When do I pay?" → Only when an order is placed
- "Can I order samples?" → Yes! Order at cost for testing
- "What if customer returns?" → Printful has return policy

**You've got this! 🚀**
