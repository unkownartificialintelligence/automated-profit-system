# 🚀 Automated Profit System - Deployment Scripts

## ✅ Installation Complete!

You've successfully installed the quick deployment tools. Here's what was created:

### ✓ Files Created:
- Quick-Deploy.ps1 (Fast deployment script)
- Vercel-AccountSwitcher.ps1 (Account management)

### 📥 Manual Download Required:
Visit the chat to download these larger files:
- Deploy-AutomatedProfitSystem.ps1 (Main deployment script)
- Diagnose-Deployment.ps1 (Troubleshooting tool)

## 🚀 Quick Start

### For Daily Updates:
```powershell
.\Quick-Deploy.ps1
```

### Fix Team Access Errors:
```powershell
.\Vercel-AccountSwitcher.ps1 -Mode personal
```

### Check Configuration:
```powershell
.\Vercel-AccountSwitcher.ps1 -Mode status
```

## 📋 What Each Script Does

**Quick-Deploy.ps1**
- Fastest deployment option
- Automatically configures Git
- Commits and pushes changes
- Deploys to Vercel personal account

**Vercel-AccountSwitcher.ps1**
- Switch between personal/team accounts
- Fix "must have access to team" errors
- Check current configuration status

**Deploy-AutomatedProfitSystem.ps1** (Download separately)
- Full-featured deployment with pre-flight checks
- Comprehensive error handling
- Supports both personal and team accounts
- Best for production deployments

**Diagnose-Deployment.ps1** (Download separately)
- Troubleshooting and diagnostics
- Auto-fix capabilities
- Environment validation

## ❌ Common Issues & Quick Fixes

### "must have access to team Jerzii AI"
```powershell
.\Vercel-AccountSwitcher.ps1 -Mode personal
.\Quick-Deploy.ps1
```

### "Git not found"
Install Git from: https://git-scm.com/download/win

### "Vercel CLI not found"
```powershell
npm install -g vercel
```

### "Not logged into Vercel"
```powershell
vercel login
```

## 🎯 Recommended Workflow

1. **First Time Setup**
   ```powershell
   # Login to Vercel
   vercel login
   
   # Configure for personal account
   .\Vercel-AccountSwitcher.ps1 -Mode personal
   ```

2. **Daily Development**
   ```powershell
   # Make your changes, then:
   .\Quick-Deploy.ps1
   ```

3. **When Issues Occur**
   ```powershell
   # Check status
   .\Vercel-AccountSwitcher.ps1 -Mode status
   
   # Switch to personal if needed
   .\Vercel-AccountSwitcher.ps1 -Mode personal
   ```

## 🔧 Configuration

Both scripts use these default settings:
- **Git Name:** MJ Jerzii
- **Git Email:** mj@jerzii.com
- **GitHub Repo:** https://github.com/unkownartificialintelligence/automated-profit-system.git
- **Vercel Team:** jerzii-ai

To change these, edit the scripts directly.

## 💡 Pro Tips

- Use Quick-Deploy.ps1 for speed
- Use Deploy-AutomatedProfitSystem.ps1 for safety
- Always check status before switching accounts
- Personal account deployment avoids team permission issues

## 📞 Need More Help?

Download the complete documentation from the chat:
- DEPLOYMENT-GUIDE.md (Detailed instructions)
- OPTIMIZATION-SUMMARY.md (Technical details)
- QUICK-REFERENCE.txt (Cheat sheet)

---

**Project:** Automated Profit System  
**Author:** MJ Jerzii  
**Team:** Jerzii AI  
**Version:** 2.0
