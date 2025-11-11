# 🚀 GET STARTED: Personal Printful Account Setup

## Your Complete Onboarding Guide - Start Making Profits NOW!

This guide will get your personal Printful account connected and start the automated profit system in **under 15 minutes**.

⚠️ **IMPORTANT**: You must add ALL 7 environment variables in Step 2 & 3 for the system to work. Missing even one critical variable will cause deployment failures.

---

## 📋 STEP-BY-STEP SETUP CHECKLIST

### ✅ STEP 1: Get Your Printful API Key (2 minutes)

1. **Login to Printful**:
   - Go to: https://www.printful.com/dashboard
   - Log in with your account

2. **Navigate to API Settings**:
   - Click on your **Store name** (top right)
   - Select **Settings** → **API**
   - Or go directly to: https://www.printful.com/dashboard/store

3. **Create API Key**:
   - Click **"Create API Key"**
   - Name it: `Automated Profit System`
   - **Copy the API key** (starts with `pk_...` or similar)
   - ⚠️ Save it immediately - you can't see it again!

---

### ✅ STEP 2: Add Required Environment Variables to Vercel (3 minutes)

1. **Open Vercel Environment Variables**:
   ```
   https://vercel.com/jerzii-ais-projects/automated-profit-system/settings/environment-variables
   ```

2. **Add CRITICAL Variables (REQUIRED for app to start)**:

   **Variable 1: JWT_SECRET**
   - Click **"Add New"**
   - Name: `JWT_SECRET`
   - Value: `f13d8aee2ff0a947c6d77ca34c326894ee987fdc384c3d37577a39f4851df48a`
   - Check: ✓ Production  ✓ Preview  ✓ Development
   - Click **"Save"**

   **Variable 2: NODE_ENV**
   - Click **"Add New"**
   - Name: `NODE_ENV`
   - Value: `production`
   - Check: ✓ Production  ✓ Preview  ✓ Development
   - Click **"Save"**

   **Variable 3: ALLOWED_ORIGINS**
   - Click **"Add New"**
   - Name: `ALLOWED_ORIGINS`
   - Value: `https://automated-profit-system-git-main-jerzii-ais-projects.vercel.app`
   - Check: ✓ Production  ✓ Preview  ✓ Development
   - Click **"Save"**

3. **Add Printful API Key**:
   - Click **"Add New"**
   - Name: `PRINTFUL_API_KEY`
   - Value: [paste your Printful API key from Step 1]
   - Check: ✓ Production  ✓ Preview  ✓ Development
   - Click **"Save"**

4. **Vercel will auto-redeploy** (~60-90 seconds)

---

### ✅ STEP 3: Set Up Your Personal Account Authentication (2 minutes)

You need to create your login credentials to access the system.

**3a. Generate Password Hash**:

Open your terminal (PowerShell/Command Prompt) and run:

```bash
node -e "console.log(require('bcryptjs').hashSync('YourPassword123', 10))"
```

**Replace `YourPassword123` with your desired password.**
Copy the entire output (starts with `$2a$10$...`)

**3b. Add to Vercel**:

Go to the same environment variables page and add these 3 more variables:

**Variable 5: ADMIN_EMAIL**
- Name: `ADMIN_EMAIL`
- Value: `your@email.com` (your actual email)
- Check: ✓ Production  ✓ Preview  ✓ Development
- Click **"Save"**

**Variable 6: ADMIN_PASSWORD_HASH**
- Name: `ADMIN_PASSWORD_HASH`
- Value: [paste the hash from step 3a]
- Check: ✓ Production  ✓ Preview  ✓ Development
- Click **"Save"**

**Variable 7: ADMIN_NAME (Optional)**
- Name: `ADMIN_NAME`
- Value: `Your Name`
- Check: ✓ Production  ✓ Preview  ✓ Development
- Click **"Save"**

---

### ✅ STEP 4: Wait for Deployment (1-2 minutes)

After adding all environment variables:

1. Vercel will automatically redeploy
2. Go to: https://vercel.com/jerzii-ais-projects/automated-profit-system
3. Wait for the **green checkmark** (Ready)
4. Check deployment time - wait until it says "Just now" or recent timestamp

---

### ✅ STEP 5: Test Your Connection (1 minute)

**Test Printful Connection**:

Open this URL in your browser:
```
https://automated-profit-system-git-main-jerzii-ais-projects.vercel.app/api/printful/store
```

**Expected Response**:
```json
{
  "success": true,
  "store": {
    "id": 123456,
    "name": "Your Store Name",
    "currency": "USD"
  }
}
```

✅ **Success** = Printful is connected!
❌ **Error** = Check your API key is correct

**Test Login**:

Use Postman, Thunder Client, or curl:

```bash
POST https://automated-profit-system-git-main-jerzii-ais-projects.vercel.app/api/auth/login

Body:
{
  "email": "your@email.com",
  "password": "YourPassword123"
}
```

**Expected Response**:
```json
{
  "success": true,
  "token": "eyJhbGc...",
  "user": {
    "email": "your@email.com",
    "name": "Your Name",
    "role": "admin"
  }
}
```

**Copy your token** - you'll need it for authenticated requests!

---

## 🎯 WHAT YOU CAN DO NOW

### 1. **Find Trending Products**

```
GET /api/products/trending
Authorization: Bearer YOUR_TOKEN
```

Discover hot products that are selling right now.

### 2. **Get Product Recommendations**

```
GET /api/products/recommendations
Authorization: Bearer YOUR_TOKEN
```

AI-powered product suggestions based on current trends.

### 3. **Calculate Profits**

```
POST /api/products/profit-calculator
Authorization: Bearer YOUR_TOKEN

Body:
{
  "cost": 15.00,
  "sellingPrice": 29.99,
  "quantity": 100
}
```

See your potential profit margins instantly.

### 4. **List Products on Printful**

```
POST /api/printful/products
Authorization: Bearer YOUR_TOKEN

Body:
{
  "name": "Awesome T-Shirt",
  "description": "Best shirt ever",
  "variant_id": 4011,
  "retail_price": "29.99"
}
```

Automatically list products to your Printful store.

### 5. **Track Personal Sales**

```
GET /api/personal
Authorization: Bearer YOUR_TOKEN
```

Monitor your personal sales (no team revenue share - keep 100%!).

---

## 🔥 QUICK START: Your First Automated Product

**Full automation pipeline in 3 API calls:**

**1. Find a trending product:**
```bash
GET /api/products/trending
Authorization: Bearer YOUR_TOKEN
```

**2. Calculate your profit:**
```bash
POST /api/products/profit-calculator
Body: { "cost": 15, "sellingPrice": 29.99, "quantity": 50 }
```

**3. List it on Printful:**
```bash
POST /api/automation/auto-list
Authorization: Bearer YOUR_TOKEN
Body: {
  "productName": "Trending Motivational Tee",
  "category": "t-shirts",
  "targetProfit": 14.99
}
```

**Done!** Your product is live and ready to sell.

---

## 📚 NEXT STEPS - MAXIMIZE PROFITS

### **Read These Guides:**

1. **GET_FIRST_SALE_GUIDE.md** - Strategies to get your first sale
2. **AUTOMATION_GUIDE.md** - Full automation setup
3. **FULL_AUTOMATION_GUIDE.md** - Complete hands-off system
4. **TEAM_PROFIT_SHARING_GUIDE.md** - Scale with team members

### **Advanced Features:**

- **Auto-Launch System**: Automatically discover, design, and list products
- **Canva Integration**: AI-generated designs
- **Performance Analytics**: Track what's selling
- **Team Management**: Share profits with team members

---

## 🆘 TROUBLESHOOTING

### "Function Invocation Failed" or "500 Internal Server Error"
**MOST COMMON ISSUE** - This means critical environment variables are missing:
- Check that ALL 7 environment variables from Steps 2 & 3 are added in Vercel
- **CRITICAL**: JWT_SECRET, NODE_ENV, and ALLOWED_ORIGINS must be present
- Go to: https://vercel.com/jerzii-ais-projects/automated-profit-system/settings/environment-variables
- Verify all 7 variables are listed:
  1. JWT_SECRET
  2. NODE_ENV
  3. ALLOWED_ORIGINS
  4. PRINTFUL_API_KEY
  5. ADMIN_EMAIL
  6. ADMIN_PASSWORD_HASH
  7. ADMIN_NAME (optional)
- After adding missing variables, wait 90 seconds for auto-redeploy

### "Invalid API Key" Error
- Double-check your Printful API key in Vercel env vars
- Make sure there are no extra spaces
- Try regenerating the key in Printful dashboard

### "Authentication not configured"
- Verify ADMIN_EMAIL and ADMIN_PASSWORD_HASH are in Vercel
- Check you redeployed after adding variables
- Wait 90 seconds after adding variables

### "No products found"
- Your Printful store might be empty (this is normal for new accounts)
- Use the automation endpoints to add products

### Can't login
- Verify your email matches ADMIN_EMAIL exactly (case-sensitive)
- Make sure you're using the original password, not the hash
- Check the password hash was generated correctly

---

## 💰 START MAKING MONEY!

You're all set! Your automated profit system is:

✅ Connected to Printful
✅ Authentication working
✅ All automation features ready
✅ Trending product discovery active
✅ Profit tracking enabled

**Time to start listing products and generating sales!** 🚀

---

## 📞 QUICK REFERENCE

**Your Deployment URL:**
```
https://automated-profit-system-git-main-jerzii-ais-projects.vercel.app
```

**Key Endpoints:**
- `/api/auth/login` - Login
- `/api/printful/store` - Check Printful connection
- `/api/products/trending` - Find hot products
- `/api/automation/auto-list` - Auto-list products
- `/api/personal` - Track your sales

**Documentation:**
- Full API docs: `/api-docs`
- Health check: `/api/health`

---

**Need help?** Check the guides in your repository or the API documentation!

Happy profit-making! 💰🚀
