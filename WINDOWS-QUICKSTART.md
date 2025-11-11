# Windows PowerShell Quick Start

You're on Windows! Use these PowerShell scripts instead of the bash scripts.

## ✅ All Scripts Ready for Windows

### Test APIs (Check what's working)
```powershell
.\test-apis.ps1
```

### Quick Start (Test with 1 product)
```powershell
.\quick-start-windows.ps1
```

### Run Full Automation (3 products)
```powershell
.\run-automation-windows.ps1
```

### Run with Custom Number
```powershell
.\run-automation-windows.ps1 10  # Process 10 products
```

### Check & Fix APIs
```powershell
.\setup-apis-windows.ps1
```

### Update API Keys
```powershell
.\update-api-key-windows.ps1 PRINTFUL your_token_here
.\update-api-key-windows.ps1 CANVA your_key_here
```

---

## 🔧 Your Current Issue: Printful API 401

**Error**: Printful API returns 401 (Unauthorized)

**Why**: Your API token type changed or is invalid

**Fix** (15 minutes):

1. **Run the setup checker**:
   ```powershell
   .\setup-apis-windows.ps1
   ```

2. **Follow the Printful fix instructions shown**

3. **Or manually fix**:
   - Go to https://www.printful.com/dashboard
   - Settings → Stores → Create "Manual Order Platform / API"
   - Go to https://developers.printful.com/
   - Create API Client → Generate Private Token
   - Copy the token
   - Run: `.\update-api-key-windows.ps1 PRINTFUL your_new_token`
   - Restart: `.\deploy.sh`

---

## 📊 What Each Script Does

### `test-apis.ps1`
- Tests all API endpoints
- Shows what's working and what needs fixing
- Reports Printful API status (currently showing 401 error)
- **Use this first** to diagnose issues

### `quick-start-windows.ps1`
- Runs automation on top 1 product
- Fast test (30 seconds)
- Shows current automation level (50%, 75%, or 100%)

### `run-automation-windows.ps1`
- Full automation pipeline
- Default: 3 products
- Can specify custom number
- Shows detailed results

### `setup-apis-windows.ps1`
- Checks current API configuration
- Provides step-by-step fix instructions
- Shows automation level (50%, 75%, 100%)
- **Use this to get to 100% automation**

### `update-api-key-windows.ps1`
- Safely updates API keys
- Backs up .env before changes
- Tests API immediately
- Shows next steps

---

## 🎯 Quick Fix for Your Current Error

The JSON parsing errors you're seeing are because PowerShell's `curl` doesn't work like Unix curl.

**Before (doesn't work on Windows)**:
```powershell
curl http://localhost:3003/api/health | python3 -m json.tool  # ❌ Error
```

**After (works on Windows)**:
```powershell
.\test-apis.ps1  # ✅ Works perfectly
```

---

## 🚀 Your Next Steps

### 1. Test Current System (1 minute)
```powershell
.\test-apis.ps1
```

### 2. Fix Printful API (15 minutes)
```powershell
.\setup-apis-windows.ps1
# Follow instructions shown
```

### 3. Run Automation (30 seconds)
```powershell
.\run-automation-windows.ps1
```

---

## 💡 Pro Tips

1. **Always use the .ps1 scripts** on Windows (not the .sh scripts)
2. **If you get "execution policy" error**, run:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```
3. **To see all available scripts**, run: `ls *.ps1`
4. **Server restart command stays the same**: `.\deploy.sh`

---

## 📁 Windows vs Linux Scripts

| Task | Windows | Linux |
|------|---------|-------|
| Test APIs | `.\test-apis.ps1` | `./setup-apis.sh` |
| Quick Start | `.\quick-start-windows.ps1` | `./quick-start.sh` |
| Full Automation | `.\run-automation-windows.ps1` | `./run-automation.sh` |
| API Setup | `.\setup-apis-windows.ps1` | `./setup-apis.sh` |
| Update Keys | `.\update-api-key-windows.ps1` | `./update-api-key.sh` |

---

## ✅ Next Command

Run this NOW to see what needs fixing:
```powershell
.\test-apis.ps1
```

This will show you exactly what's wrong and how to fix it.

---

**All scripts are committed and ready to use!**
