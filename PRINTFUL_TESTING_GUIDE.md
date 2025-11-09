# 🧪 Printful Testing Guide

## Testing Your Personal Printful Account

This guide will walk you through testing the complete automation system with your actual Printful account.

---

## 📋 Pre-Testing Checklist

Before you start, make sure you have:
- [ ] Printful account created (free at printful.com)
- [ ] Printful API key generated
- [ ] Server running on port 3003
- [ ] Sample design image ready (or use our generated HTML template)

---

## 🔑 Step 1: Get Your Printful API Key

### 1.1 Login to Printful

Go to: https://www.printful.com/dashboard

### 1.2 Navigate to API Settings

1. Click your profile icon (top right)
2. Select "Settings"
3. Click "API" in the left sidebar

### 1.3 Enable API Access

1. Click "Enable API Access"
2. Copy your API key (starts with "pk_...")
3. Store it securely

---

## 🔧 Step 2: Configure the System

### 2.1 Set Up API Key

**Method 1: Using the API (Recommended)**

```bash
curl -X POST http://localhost:3003/api/automation/setup/printful-key \
  -H "Content-Type: application/json" \
  -d '{
    "api_key": "YOUR_PRINTFUL_API_KEY_HERE"
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "✅ Printful API key configured successfully!",
  "automation_ready": true
}
```

**Method 2: Manual .env File**

```bash
echo "PRINTFUL_API_KEY=YOUR_KEY_HERE" >> .env
echo "PORT=3003" >> .env
echo "NODE_ENV=production" >> .env
```

Then restart server:
```bash
pkill -f "node src/server.js"
PORT=3003 node src/server.js &
```

### 2.2 Verify API Key

```bash
curl http://localhost:3003/api/automation/setup/test
```

Expected response should show:
```json
{
  "success": true,
  "printful_connection": "✅ Connected (X products)",
  "automation_ready": true
}
```

---

## 🎨 Step 3: Test Design Generation

### 3.1 Generate a Design

```bash
curl -X POST http://localhost:3003/api/full-automation/generate-design \
  -H "Content-Type: application/json" \
  -d '{
    "design_id": 2,
    "custom_text": "Test Design - Sleigh All Day"
  }' | python3 -m json.tool > design_output.json
```

### 3.2 Create Design from Template

**Option A: Use HTML Template**

1. Open `design_output.json`
2. Copy the `html_design` content
3. Save as `test-design.html`
4. Open in browser
5. Screenshot at high resolution (4500x5400px recommended)
6. Save as `test-design.png`

**Option B: Use Canva (if you prefer)**

1. From the JSON, copy the `canva_link`
2. Open in browser
3. Customize the design
4. Download as PNG with transparent background

### 3.3 Upload Design to Cloud

**Quick Upload to Imgur (No account needed):**

1. Go to https://imgur.com/upload
2. Upload your `test-design.png`
3. Right-click the image → "Copy image address"
4. You should have a URL like: `https://i.imgur.com/XXXXX.png`

**Save this URL - you'll need it for the next step!**

---

## 📦 Step 4: Test Product Creation

### 4.1 Create Test Product on Printful

```bash
curl -X POST http://localhost:3003/api/full-automation/auto-list \
  -H "Content-Type: application/json" \
  -d '{
    "design_id": 2,
    "product_name": "TEST - Sleigh All Day Christmas Shirt",
    "design_url": "YOUR_IMGUR_URL_HERE",
    "printful_api_key": "YOUR_PRINTFUL_API_KEY",
    "retail_price": 24.99
  }' | python3 -m json.tool
```

### 4.2 Verify Product Created

**Check the response:**
```json
{
  "success": true,
  "message": "🎉 Product auto-listed successfully!",
  "printful": {
    "product_id": 123456,
    "name": "TEST - Sleigh All Day Christmas Shirt",
    "variants": 5,
    "status": "Created on Printful"
  },
  "etsy_listing_template": {
    // Complete Etsy listing ready to copy
  }
}
```

**Verify in Printful Dashboard:**

1. Go to https://www.printful.com/dashboard/products
2. You should see your "TEST - Sleigh All Day Christmas Shirt"
3. Click to view - should have 5 sizes (S-2XL)
4. Each variant should have your design applied

### 4.3 Test Product Preview

In Printful dashboard:
1. Click on your test product
2. Click "Preview" to see mockups
3. Verify design looks good on all sizes
4. Check pricing is set correctly ($24.99)

---

## 📢 Step 5: Test Promotion Campaign

### 5.1 Generate Marketing Campaign

```bash
curl -X POST http://localhost:3003/api/full-automation/auto-promote \
  -H "Content-Type: application/json" \
  -d '{
    "product_name": "Sleigh All Day Christmas Shirt",
    "shop_url": "https://your-etsy-shop.com",
    "design_id": 2,
    "discount_code": "TEST10"
  }' | python3 -m json.tool > promotion_campaign.json
```

### 5.2 Review Campaign Output

Check `promotion_campaign.json` for:
- ✅ 7-day daily schedule
- ✅ Platform-specific messages (Facebook, Instagram, Email, Twitter)
- ✅ All copy ready to use
- ✅ Posting time recommendations

### 5.3 Test Social Media Post (Optional)

Pick one message from the campaign and:
1. Post to your personal Facebook/Instagram
2. Tag it as #TestPost
3. Verify formatting looks good
4. Delete after testing (if desired)

---

## 💰 Step 6: Test Profit Tracking

### 6.1 Record a Test Sale

```bash
curl -X POST http://localhost:3003/api/personal/sales \
  -H "Content-Type: application/json" \
  -d '{
    "product_name": "TEST - Sleigh All Day Shirt",
    "platform": "Printful Test",
    "sale_amount": 24.99,
    "printful_cost": 15.44,
    "platform_fees": 1.50,
    "transaction_fees": 0.80,
    "notes": "Test sale for verification"
  }'
```

### 6.2 Verify Dashboard Updates

```bash
curl http://localhost:3003/api/personal/dashboard | python3 -m json.tool
```

Should show:
```json
{
  "success": true,
  "summary": {
    "all_time": {
      "sales": 1,
      "profit": "7.25",
      "revenue": "24.99"
    }
  }
}
```

### 6.3 Test Quick Sale Entry

```bash
curl -X POST http://localhost:3003/api/personal/quick-sale \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 24.99,
    "product": "TEST Product"
  }'
```

---

## 🧪 Step 7: Complete Workflow Test

### 7.1 Run End-to-End Automation

```bash
curl -X POST http://localhost:3003/api/full-automation/profit-in-one-click \
  -H "Content-Type: application/json" \
  -d '{
    "design_id": 2,
    "printful_api_key": "YOUR_KEY"
  }' | python3 -m json.tool > complete_workflow.json
```

### 7.2 Verify Complete Output

Check `complete_workflow.json` contains:
- ✅ Design generation complete
- ✅ Product listing ready (pending design upload)
- ✅ Promotion campaign generated
- ✅ Timeline provided
- ✅ Next actions clearly listed

---

## ✅ Verification Checklist

After testing, verify:

**API Integration:**
- [ ] Printful API key configured
- [ ] Connection to Printful verified
- [ ] Can query Printful products

**Design Automation:**
- [ ] HTML design template generated
- [ ] Design created and saved
- [ ] Design uploaded to cloud (Imgur/etc)
- [ ] Design URL accessible

**Product Creation:**
- [ ] Product created on Printful
- [ ] All 5 sizes configured
- [ ] Design applied to all variants
- [ ] Pricing set correctly
- [ ] Product visible in Printful dashboard

**Marketing:**
- [ ] 7-day campaign generated
- [ ] All platform messages created
- [ ] Discount codes included
- [ ] Posting schedule provided

**Profit Tracking:**
- [ ] Test sale recorded
- [ ] Dashboard shows correct data
- [ ] Profit calculated correctly
- [ ] API endpoints working

**Complete Workflow:**
- [ ] One-click workflow executed
- [ ] All components functioning
- [ ] Output properly formatted
- [ ] No errors encountered

---

## 🐛 Troubleshooting

### Issue: "Invalid Printful API key"

**Solution:**
1. Verify key copied correctly (no extra spaces)
2. Check key starts with "pk_"
3. Regenerate key in Printful dashboard if needed
4. Re-configure using setup endpoint

### Issue: "Design URL not accessible"

**Solution:**
1. Verify Imgur link is direct image link (ends with .png)
2. Test link in browser (should show just the image)
3. Try alternative: Dropbox, Google Drive (make sure link is public)
4. Use "Direct Link" option from cloud provider

### Issue: "Product creation failed"

**Solution:**
1. Check design URL is valid and accessible
2. Verify Printful API key is correct
3. Ensure design meets Printful requirements:
   - Min resolution: 1800x1800px
   - Format: PNG
   - Color mode: RGB
4. Check Printful error message in response

### Issue: "Profit tracking not working"

**Solution:**
1. Verify server is running: `curl http://localhost:3003/api/health`
2. Check database exists: `ls database.db`
3. Rebuild database: `npm run setup:team-profits`
4. Restart server

### Issue: "Rate limited by Printful"

**Solution:**
1. Wait 60 seconds between API calls
2. Printful limits: 120 requests per minute
3. For bulk testing, add delays:
   ```bash
   curl ... && sleep 2 && curl ...
   ```

---

## 📊 Testing Results Template

After testing, document your results:

```
TEST SESSION: [Date]
TESTER: [Your Name]

✅ API Key Setup: [PASS/FAIL]
✅ Design Generation: [PASS/FAIL]
✅ Product Creation: [PASS/FAIL]
✅ Marketing Campaign: [PASS/FAIL]
✅ Profit Tracking: [PASS/FAIL]
✅ Complete Workflow: [PASS/FAIL]

ISSUES FOUND:
1. [Issue description]
2. [Issue description]

NOTES:
- [Any observations]
- [Suggestions for improvement]

PRINTFUL PRODUCT IDs CREATED:
- Test Product 1: [ID]
- Test Product 2: [ID]

RECOMMENDATION: [APPROVED FOR PRODUCTION / NEEDS FIXES]
```

---

## 🚀 Next Steps After Testing

Once all tests pass:

1. **Clean Up Test Data**
   ```bash
   # Delete test products in Printful dashboard
   # Clear test sales from dashboard
   ```

2. **Document Any Issues**
   - Log bugs in issue tracker
   - Note any UX improvements
   - Share with development team

3. **Prepare for Production**
   - Review deployment guide
   - Set up production environment
   - Configure monitoring

4. **Create First Real Product**
   - Use Christmas design #2 (highest profit)
   - Follow tested workflow
   - List on Etsy
   - Start promoting!

---

## 📞 Support

**If you encounter issues:**

1. Check troubleshooting section above
2. Review API logs: `tail -f /tmp/server.log`
3. Test individual endpoints separately
4. Contact support: support@yourcompany.com

---

## 🎯 Success Criteria

Testing is successful when:
- ✅ All 6 major workflows complete without errors
- ✅ Test product visible in Printful dashboard
- ✅ Profit tracking accurately records sales
- ✅ Marketing campaign generates all content
- ✅ No API key issues or rate limiting
- ✅ System ready for real product creation

---

**Once testing is complete and successful, you're ready to:**
1. Create your first real Christmas product
2. List on Etsy
3. Start making money!

**Good luck! 🚀💰**
