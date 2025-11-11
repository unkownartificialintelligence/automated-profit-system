# ⚡ COPY-PASTE ALL VARIABLES (DO THIS NOW)

## 🔗 OPEN THIS LINK FIRST:
```
https://vercel.com/jerzii-ais-projects/automated-profit-system/settings/environment-variables
```

---

## ✅ ADD THESE 7 VARIABLES

For each variable below:
1. Click **"Add New"** button in Vercel
2. Copy the Key → paste in Name field
3. Copy the Value → paste in Value field
4. Check all 3 boxes: ✓ Production ✓ Preview ✓ Development
5. Click **"Save"**
6. Move to next variable

---

### VARIABLE 1 of 7

**Key:**
```
JWT_SECRET
```

**Value:**
```
f13d8aee2ff0a947c6d77ca34c326894ee987fdc384c3d37577a39f4851df48a
```

✓ Production  ✓ Preview  ✓ Development → **SAVE**

---

### VARIABLE 2 of 7

**Key:**
```
NODE_ENV
```

**Value:**
```
production
```

✓ Production  ✓ Preview  ✓ Development → **SAVE**

---

### VARIABLE 3 of 7

**Key:**
```
ALLOWED_ORIGINS
```

**Value:**
```
https://automated-profit-system-git-main-jerzii-ais-projects.vercel.app
```

✓ Production  ✓ Preview  ✓ Development → **SAVE**

---

### VARIABLE 4 of 7

**Key:**
```
PRINTFUL_API_KEY
```

**Value:** → **GET FROM PRINTFUL FIRST** (instructions below)

✓ Production  ✓ Preview  ✓ Development → **SAVE**

#### HOW TO GET PRINTFUL API KEY:
1. Open: https://www.printful.com/dashboard/store
2. Click "Settings" (left sidebar)
3. Click "API" tab
4. Click "Generate API Access" or "Show API Key"
5. Copy the key
6. Paste above

---

### VARIABLE 5 of 7

**Key:**
```
ADMIN_EMAIL
```

**Value:** (YOUR EMAIL ADDRESS)
```
your@email.com
```

✓ Production  ✓ Preview  ✓ Development → **SAVE**

---

### VARIABLE 6 of 7

**Key:**
```
ADMIN_PASSWORD_HASH
```

**Value:** → **GENERATE FIRST** (instructions below)

✓ Production  ✓ Preview  ✓ Development → **SAVE**

#### HOW TO GENERATE PASSWORD HASH:
Open PowerShell or Terminal and run:
```bash
node -e "console.log(require('bcryptjs').hashSync('YourPassword123', 10))"
```

**CHANGE "YourPassword123" TO YOUR ACTUAL PASSWORD**

Copy the output (starts with $2a$10$...) and paste as Value above.

---

### VARIABLE 7 of 7

**Key:**
```
ADMIN_NAME
```

**Value:** (YOUR NAME)
```
Your Name
```

✓ Production  ✓ Preview  ✓ Development → **SAVE**

---

## ⏰ WAIT 90 SECONDS

After adding the last variable, Vercel will auto-deploy. Wait 90 seconds.

---

## ✅ TEST IT

Open this link:
```
https://automated-profit-system-git-main-jerzii-ais-projects.vercel.app/api/health
```

**You should see:**
```json
{
  "success": true,
  "message": "API is healthy"
}
```

**✅ SUCCESS! Your system is live!**

---

## 🆘 IF IT DOESN'T WORK

1. Count your variables in Vercel - should be 7 total
2. Check each has all 3 environments checked
3. Check for typos (case-sensitive)
4. Force redeploy: Deployments → latest → ... → Redeploy
5. Wait another 90 seconds

---

## 📋 QUICK CHECKLIST

After adding all variables, verify in Vercel:

- [ ] JWT_SECRET (64 characters long)
- [ ] NODE_ENV (says "production")
- [ ] ALLOWED_ORIGINS (has your deployment URL)
- [ ] PRINTFUL_API_KEY (from Printful dashboard)
- [ ] ADMIN_EMAIL (your email)
- [ ] ADMIN_PASSWORD_HASH (starts with $2a$10$)
- [ ] ADMIN_NAME (your name)

All 7 should show 3 checkmarks each.

---

**START NOW!** Open the Vercel link at the top and add Variable 1! ⬆️
