# 🧹 VERCEL ENVIRONMENT VARIABLES CLEANUP GUIDE

## ✅ KEEP ONLY THESE 10 VARIABLES

Your automated profit system needs EXACTLY these 10 environment variables (no more, no less):

---

## Required Variables (Production Environment)

### 1. JWT_SECRET
```
Value: f64c1c7ec382d75018167264a66955b68cc9b889a100aa145e443403b7728295
Purpose: User authentication and session management
KEEP: ✅ YES
```

### 2. CRON_SECRET
```
Value: f9b766f815e103e27070abcc62198ab084a114f3d7bab6b19eefdbe24c2ef608
Purpose: Secure automation endpoint (prevents unauthorized triggers)
KEEP: ✅ YES
```

### 3. PRINTFUL_API_KEY
```
Value: UoNNmC4bEyqNuFMyAdtBby2YlVtORc7piy2I9UOS
Purpose: Create products on Printful
KEEP: ✅ YES
```

### 4. AUTOMATION_SCHEDULE
```
Value: 0 7 * * *
Purpose: Daily automation at 7:00 AM UTC
KEEP: ✅ YES
```

### 5. MAX_PRODUCTS
```
Value: 10
Purpose: Number of products to create per automation run
KEEP: ✅ YES
```

### 6. GENERATE_DESIGNS
```
Value: true
Purpose: Enable automatic design generation
KEEP: ✅ YES
```

### 7. CREATE_LISTINGS
```
Value: true
Purpose: Enable automatic listing creation
KEEP: ✅ YES
```

### 8. GENERATE_MARKETING
```
Value: true
Purpose: Enable marketing content generation
KEEP: ✅ YES
```

### 9. GLOBAL_TRENDING
```
Value: true
Purpose: Enable global trending keyword monitoring
KEEP: ✅ YES
```

### 10. TRENDING_REGIONS
```
Value: US,GB,CA,AU,DE,FR,JP,BR,IN,MX
Purpose: Countries to monitor for trends
KEEP: ✅ YES
```

---

## ❌ DELETE THESE IF YOU SEE THEM

Remove any variables NOT in the list above. Common unnecessary variables to delete:

- NODE_ENV (Vercel sets this automatically)
- PORT (Vercel handles this)
- Any duplicate variables
- Any variables with empty values
- Any test/development variables
- STRIPE_API_KEY (optional, not needed for basic operation)
- STRIPE_SECRET_KEY (optional, not needed for basic operation)
- OPENAI_API_KEY (optional, not needed for basic operation)
- CANVA_API_KEY (optional, not needed for basic operation)
- SENTRY_DSN (optional, for error monitoring)

---

## 🧹 HOW TO CLEAN UP (Step-by-Step)

### Step 1: Go to Environment Variables
1. Open: https://vercel.com/dashboard
2. Click: Your "automated-profit-system" project
3. Click: Settings → Environment Variables

### Step 2: Verify Each Variable
For each variable you see:
- ✅ If it's in the "KEEP" list above → Leave it
- ❌ If it's NOT in the "KEEP" list → Delete it

### Step 3: Delete Unnecessary Variables
For each variable to delete:
1. Click the three dots (...) next to the variable
2. Click "Remove"
3. Confirm deletion

### Step 4: Verify You Have All 10
Check that you have EXACTLY these 10 variables:
- [ ] JWT_SECRET
- [ ] CRON_SECRET
- [ ] PRINTFUL_API_KEY
- [ ] AUTOMATION_SCHEDULE
- [ ] MAX_PRODUCTS
- [ ] GENERATE_DESIGNS
- [ ] CREATE_LISTINGS
- [ ] GENERATE_MARKETING
- [ ] GLOBAL_TRENDING
- [ ] TRENDING_REGIONS

### Step 5: Add Any Missing Variables
If any of the 10 are missing:
1. Click "Add New"
2. Enter the Name and Value from the list above
3. Select "Production" environment
4. Click "Save"

---

## ✅ FINAL CHECKLIST

After cleanup, you should have:
- ✅ Exactly 10 environment variables
- ✅ All marked as "Production"
- ✅ No duplicate variables
- ✅ No empty values
- ✅ All values match the list above exactly

---

## 🚀 AFTER CLEANUP: REDEPLOY

Once your variables are cleaned up:

1. Go to: Deployments tab
2. Click: Three dots on latest deployment
3. Click: "Redeploy"
4. Wait: 2-3 minutes

Then your system will:
- ✅ Use ONLY the correct variables
- ✅ Run faster (no extra config to load)
- ✅ Avoid conflicts from duplicate vars
- ✅ Be properly secured

---

## 📊 WHAT EACH VARIABLE DOES

| Variable | Purpose | Required? |
|----------|---------|-----------|
| JWT_SECRET | Login security | ✅ Critical |
| CRON_SECRET | Automation security | ✅ Critical |
| PRINTFUL_API_KEY | Create products | ✅ Critical |
| AUTOMATION_SCHEDULE | When to run | ✅ Critical |
| MAX_PRODUCTS | How many products | ✅ Critical |
| GENERATE_DESIGNS | Auto-design | ✅ Critical |
| CREATE_LISTINGS | Auto-list products | ✅ Critical |
| GENERATE_MARKETING | Auto-marketing | ✅ Critical |
| GLOBAL_TRENDING | Find trends | ✅ Critical |
| TRENDING_REGIONS | Which countries | ✅ Critical |

---

## 🆘 TROUBLESHOOTING

**"I see duplicate variables"**
→ Delete the older one (check the date added)

**"I deleted something by accident"**
→ Just add it back from the list above

**"Variables won't save"**
→ Make sure "Production" is selected before clicking Save

**"After cleanup, deployment fails"**
→ Check you have all 10 variables with correct values

---

## ⏱️ TIME ESTIMATE

- Review variables: 1 minute
- Delete unnecessary ones: 1 minute
- Verify all 10 are correct: 1 minute
- Redeploy: 3 minutes

**Total: ~6 minutes to clean environment!**

---

## 💡 PRO TIP

After cleanup, take a screenshot of your environment variables page. This way you have a backup of what's configured!

---

**Ready to clean up? Start with Step 1 and let me know how many variables you currently see!** 🧹
