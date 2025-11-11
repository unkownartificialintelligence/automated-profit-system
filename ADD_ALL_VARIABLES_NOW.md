# ⚡ ADD ALL ENVIRONMENT VARIABLES NOW

## 🎯 Direct Link to Vercel Dashboard
**Click here to add variables:**
```
https://vercel.com/jerzii-ais-projects/automated-profit-system/settings/environment-variables
```

---

## 📋 REQUIRED VARIABLES (7 Total)

Copy and paste these EXACTLY as shown. For each variable:
1. Click **"Add New"**
2. Copy the **Key** (variable name)
3. Copy the **Value**
4. Check **ALL THREE** environment boxes: ✓ Production  ✓ Preview  ✓ Development
5. Click **"Save"**
6. Repeat for next variable

---

### ✅ VARIABLE 1: JWT_SECRET

**Key:** (copy this)
```
JWT_SECRET
```

**Value:** (copy this)
```
f13d8aee2ff0a947c6d77ca34c326894ee987fdc384c3d37577a39f4851df48a
```

**Why:** Required for authentication tokens. Server will crash without this.

**Environments:** ✓ Production  ✓ Preview  ✓ Development

---

### ✅ VARIABLE 2: NODE_ENV

**Key:** (copy this)
```
NODE_ENV
```

**Value:** (copy this)
```
production
```

**Why:** Tells the server it's running in production mode. Server will crash without this.

**Environments:** ✓ Production  ✓ Preview  ✓ Development

---

### ✅ VARIABLE 3: ALLOWED_ORIGINS

**Key:** (copy this)
```
ALLOWED_ORIGINS
```

**Value:** (copy this)
```
https://automated-profit-system-git-main-jerzii-ais-projects.vercel.app
```

**Why:** Controls which domains can access your API (CORS security).

**Environments:** ✓ Production  ✓ Preview  ✓ Development

---

### ✅ VARIABLE 4: PRINTFUL_API_KEY

**Key:** (copy this)
```
PRINTFUL_API_KEY
```

**Value:** (Get from: https://www.printful.com/dashboard/store)
```
YOUR_PRINTFUL_API_KEY_HERE
```

**How to get your Printful API key:**
1. Go to: https://www.printful.com/dashboard/store
2. Click **"Settings"** (left menu)
3. Click **"API"** tab
4. Click **"Generate API Access"** or **"Show API Key"**
5. Copy the key (starts with something like `abcd1234...`)
6. Paste it in the Value field above

**Why:** Required to connect to your Printful store and automate products.

**Environments:** ✓ Production  ✓ Preview  ✓ Development

---

### ✅ VARIABLE 5: ADMIN_EMAIL

**Key:** (copy this)
```
ADMIN_EMAIL
```

**Value:** (use YOUR email)
```
your@email.com
```

**Why:** Your login email for the system.

**Environments:** ✓ Production  ✓ Preview  ✓ Development

---

### ✅ VARIABLE 6: ADMIN_PASSWORD_HASH

**Key:** (copy this)
```
ADMIN_PASSWORD_HASH
```

**Value:** (Generate using command below)

**FIRST - Generate your password hash:**

Open PowerShell/Terminal and run:
```bash
node -e "console.log(require('bcryptjs').hashSync('YourPassword123', 10))"
```

**Replace `YourPassword123` with your desired password!**

This will output something like:
```
$2a$10$abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOP
```

**Copy that entire string** and paste it as the Value.

**Why:** Your password (hashed for security) for logging into the system.

**Environments:** ✓ Production  ✓ Preview  ✓ Development

---

### ✅ VARIABLE 7: ADMIN_NAME

**Key:** (copy this)
```
ADMIN_NAME
```

**Value:** (your name)
```
Your Name
```

**Why:** Your display name in the system (optional but nice to have).

**Environments:** ✓ Production  ✓ Preview  ✓ Development

---

## 🔧 OPTIONAL VARIABLES (Recommended)

These are not required but add useful features:

---

### ⚪ OPTIONAL: SENTRY_DSN

**Key:**
```
SENTRY_DSN
```

**Value:** (Get from: https://sentry.io - free account)
```
https://your-sentry-dsn-here@sentry.io/project-id
```

**Why:** Monitors errors in production. Get notified when something breaks.

**How to get:**
1. Create free account at https://sentry.io
2. Create new project (choose "Express.js")
3. Copy the DSN from project settings
4. Add it here

**Environments:** ✓ Production  ✓ Preview  ✓ Development

---

### ⚪ OPTIONAL: LOG_LEVEL

**Key:**
```
LOG_LEVEL
```

**Value:**
```
info
```

**Options:** `debug`, `info`, `warn`, `error`

**Why:** Controls how much logging you see. Use "info" for production, "debug" for troubleshooting.

**Environments:** ✓ Production  ✓ Preview  ✓ Development

---

## ✅ VERIFICATION CHECKLIST

After adding all variables, verify you have:

**CRITICAL (Required):**
- [ ] JWT_SECRET (64 characters)
- [ ] NODE_ENV (value: "production")
- [ ] ALLOWED_ORIGINS (your deployment URL)

**Authentication (Required for login):**
- [ ] ADMIN_EMAIL (your email)
- [ ] ADMIN_PASSWORD_HASH (starts with $2a$10$...)
- [ ] ADMIN_NAME (your name)

**API Integration (Required for Printful):**
- [ ] PRINTFUL_API_KEY (from Printful dashboard)

**Optional:**
- [ ] SENTRY_DSN (if you want error monitoring)
- [ ] LOG_LEVEL (if you want custom logging)

---

## 🔄 AFTER ADDING ALL VARIABLES

### Step 1: Verify All Are Added
Go to your Vercel environment variables page and count them. You should see **7 variables** (or more if you added optional ones).

### Step 2: Verify Each Has All Environments Checked
Each variable should have 3 checkmarks:
- ✓ Production
- ✓ Preview
- ✓ Development

### Step 3: Wait for Auto-Deploy
After adding the last variable:
1. Vercel will automatically trigger a deployment
2. Wait **90 seconds** for it to complete
3. Look for green "Ready" status in Deployments tab

### Step 4: Test Your Deployment

Open this URL:
```
https://automated-profit-system-git-main-jerzii-ais-projects.vercel.app/api/health
```

**Expected Response:**
```json
{
  "success": true,
  "message": "API is healthy",
  "uptime": "15s",
  "timestamp": "2024-XX-XX...",
  "environment": "production"
}
```

✅ **Success!** Your deployment is working!

---

## 🚀 WHAT'S NEXT?

Once your deployment is working (Step 4 test passed), you can:

### 1. Login to Your Account

Use Postman, Thunder Client, or curl:

```bash
POST https://automated-profit-system-git-main-jerzii-ais-projects.vercel.app/api/auth/login

Body (JSON):
{
  "email": "your@email.com",
  "password": "YourPassword123"
}

Response:
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

**Save that token!** You'll need it for authenticated requests.

---

### 2. Test Printful Connection

```bash
GET https://automated-profit-system-git-main-jerzii-ais-projects.vercel.app/api/printful/store

Headers:
Authorization: Bearer YOUR_TOKEN_HERE

Response:
{
  "success": true,
  "data": {
    "id": 12345,
    "name": "Your Store Name",
    ...
  }
}
```

---

### 3. Start Using Automation Features

**Find Trending Products:**
```
GET /api/products/trending
```

**Calculate Profit Margins:**
```
POST /api/products/calculate-profit
```

**Auto-List Products:**
```
POST /api/automation/auto-list
```

**Track Personal Sales:**
```
GET /api/personal/stats
```

---

## 🆘 TROUBLESHOOTING

### Still seeing "FUNCTION_INVOCATION_FAILED"?

**Check these common issues:**

1. **Missing Variables**
   - Count your variables in Vercel dashboard
   - Should have at least 7 variables
   - Each variable should have all 3 environments checked

2. **Typos**
   - Variable names are case-sensitive
   - JWT_SECRET (correct) vs jwt_secret (wrong)
   - No extra spaces in variable names or values

3. **JWT_SECRET Too Short**
   - Must be at least 32 characters
   - The one provided above is 64 characters (perfect)
   - Don't create your own - use the one above

4. **Wrong Password Hash**
   - Should start with `$2a$10$`
   - Generated using bcryptjs with cost factor 10
   - Run the command exactly as shown above

5. **Deployment Not Complete**
   - Wait a full 90 seconds after adding last variable
   - Check Deployments tab for green "Ready" status
   - Look for latest deployment timestamp

6. **Force Redeploy**
   - Go to Deployments tab
   - Click on latest deployment
   - Click three dots "..."
   - Click "Redeploy"
   - Wait 90 seconds

---

## 📊 SUMMARY

**Total Required Variables:** 7
- JWT_SECRET
- NODE_ENV
- ALLOWED_ORIGINS
- PRINTFUL_API_KEY
- ADMIN_EMAIL
- ADMIN_PASSWORD_HASH
- ADMIN_NAME

**Total Optional Variables:** 2
- SENTRY_DSN (error monitoring)
- LOG_LEVEL (logging verbosity)

**Time to Add:** 10-15 minutes
**Result:** Fully functional automated profit system ready to make money! 💰

---

## 🎯 QUICK START AFTER SETUP

1. **Login** → Get your auth token
2. **Test Printful** → Verify connection
3. **Find Products** → Use trending API
4. **Start Automating** → Let the system work for you
5. **Track Profits** → Watch your earnings grow

---

**Ready? Start adding variables now!** ⬆️ Scroll to the top and follow Variable 1!
