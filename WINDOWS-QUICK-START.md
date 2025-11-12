# 🪟 Windows Quick Start Guide

## Deploy to Vercel & Render from Windows PowerShell

### ⚡ Super Quick Start (5 Minutes)

```powershell
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login to Vercel
vercel login

# 3. Setup environment
cp .env.example .env
notepad .env  # Edit with your API keys

# 4. Deploy to BOTH platforms
.\deploy-unified.ps1
```

**Done!** 🎉

---

## 📋 Prerequisites

### Required Software
- ✅ **Git** - [Download here](https://git-scm.com/download/win)
- ✅ **Node.js** - [Download here](https://nodejs.org)
- ✅ **PowerShell** - Built into Windows

### Verify Installation
```powershell
git --version
node --version
npm --version
```

---

## 🚀 Deployment Commands

### Deploy to Both Platforms
```powershell
.\deploy-unified.ps1
```

### Deploy to Vercel Only
```powershell
.\deploy-unified.ps1 -Platform vercel
```

### Deploy to Render Only
```powershell
.\deploy-unified.ps1 -Platform render
```

### Show Help
```powershell
.\deploy-unified.ps1 -Help
```

---

## ⚙️ Environment Setup

### 1. Create .env File

```powershell
# Copy example file
cp .env.example .env

# Edit in Notepad
notepad .env
```

### 2. Generate Secrets

```powershell
# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate CRON_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Required Variables

Add these to `.env`:
```
JWT_SECRET=<generated-secret-here>
CRON_SECRET=<generated-secret-here>
NODE_ENV=production
```

### 4. Optional Variables

```
PRINTFUL_API_KEY=your-key
CANVA_API_KEY=your-key
STRIPE_API_KEY=your-key
MAX_PRODUCTS=5
TRENDING_REGIONS=US,GB,CA,AU,DE,FR,JP,BR,IN,MX
```

---

## 🤖 Run Automation Locally

### Run Once
```powershell
node master-automation.js --immediate
```

### Run as Background Service
```powershell
node master-automation.js --daemon
```

### Check Status
```powershell
node master-automation.js --status
```

### View Logs
```powershell
# View log file
Get-Content data\master-automation.log

# Watch logs in real-time
Get-Content data\master-automation.log -Wait -Tail 50
```

---

## 📊 Platform Dashboards

### Vercel Dashboard
1. Visit: https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add all variables from `.env`

**Critical Variables:**
```
JWT_SECRET=<your-secret>
CRON_SECRET=<your-secret>
NODE_ENV=production
PRINTFUL_API_KEY=<your-key>
```

### Render Dashboard
1. Visit: https://dashboard.render.com
2. Select your service
3. Go to **Environment** tab
4. Add all variables from `.env`

---

## 🚨 Common Issues & Fixes

### Issue: "Execution Policy" Error

**Error:**
```
cannot be loaded because running scripts is disabled on this system
```

**Fix:**
```powershell
# Run PowerShell as Administrator, then:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Issue: "Git not found"

**Fix:**
1. Install Git from: https://git-scm.com/download/win
2. Restart PowerShell
3. Verify: `git --version`

### Issue: "Vercel CLI not found"

**Fix:**
```powershell
npm install -g vercel
vercel login
```

### Issue: "Node not found"

**Fix:**
1. Install Node.js from: https://nodejs.org
2. Restart PowerShell
3. Verify: `node --version`

### Issue: Deployment Fails

**Check:**
```powershell
# View recent git commits
git log --oneline -5

# Check git status
git status

# View Vercel logs
vercel logs
```

---

## 🎯 Step-by-Step First Deployment

### Step 1: Install Prerequisites (10 min)

```powershell
# Download and install:
# 1. Git: https://git-scm.com/download/win
# 2. Node.js: https://nodejs.org (LTS version)

# Verify installations
git --version
node --version
npm --version
```

### Step 2: Setup Project (5 min)

```powershell
# Navigate to project
cd C:\Users\YourName\automated-profit-system

# Install dependencies
npm install

# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login
```

### Step 3: Configure Environment (5 min)

```powershell
# Create .env from example
cp .env.example .env

# Generate secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Copy output to JWT_SECRET

node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Copy output to CRON_SECRET

# Edit .env file
notepad .env
```

**In .env, set at minimum:**
```
JWT_SECRET=<paste-generated-secret>
CRON_SECRET=<paste-generated-secret>
NODE_ENV=production
```

### Step 4: Test Locally (2 min)

```powershell
# Test automation locally
node master-automation.js --immediate

# Check status
node master-automation.js --status
```

### Step 5: Deploy! (5 min)

```powershell
# Deploy to both platforms
.\deploy-unified.ps1
```

### Step 6: Configure Platform Variables (10 min)

**Vercel:**
1. Go to https://vercel.com/dashboard
2. Click your project
3. Settings → Environment Variables
4. Add: `JWT_SECRET`, `CRON_SECRET`, `NODE_ENV`
5. Save and redeploy

**Render:**
1. Go to https://dashboard.render.com
2. Click your service
3. Environment tab
4. Add same variables
5. Save (auto-redeploys)

### Step 7: Verify (5 min)

```powershell
# Check Vercel deployment
# Visit your Vercel URL + /api/health

# Check Render deployment
# Visit your Render URL + /api/health

# Check automation status
node master-automation.js --status
```

**Done!** 🎉

---

## 📱 Daily Usage

### Deploy Updates
```powershell
# Make your changes, then:
.\deploy-unified.ps1
```

### Check Automation Status
```powershell
node master-automation.js --status
```

### View Logs
```powershell
Get-Content data\master-automation.log -Wait -Tail 50
```

### Manual Automation Run
```powershell
node master-automation.js --immediate
```

---

## 💡 Pro Tips for Windows Users

### 1. Use Windows Terminal
Better than default PowerShell:
- Install from Microsoft Store: "Windows Terminal"
- Prettier output, better colors
- Multiple tabs support

### 2. Use VS Code
Great editor with integrated terminal:
- Download from: https://code.visualstudio.com
- Open project: `code .`
- Built-in PowerShell terminal

### 3. Setup Git Bash (Alternative)
If you prefer bash commands:
- Install Git for Windows
- Use Git Bash instead of PowerShell
- Run: `./deploy-unified.sh` instead

### 4. Task Scheduler for Automation
Schedule local automation runs:
```powershell
# Create scheduled task
$action = New-ScheduledTaskAction -Execute "node" -Argument "master-automation.js --immediate"
$trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Monday -At 9am
Register-ScheduledTask -Action $action -Trigger $trigger -TaskName "AutomationSystem"
```

### 5. Quick Aliases
Add to PowerShell profile:
```powershell
# Edit profile
notepad $PROFILE

# Add these lines:
function deploy { .\deploy-unified.ps1 }
function automate { node master-automation.js --immediate }
function status { node master-automation.js --status }
function logs { Get-Content data\master-automation.log -Wait -Tail 50 }

# Save and reload:
. $PROFILE
```

Now you can just type:
- `deploy` - Deploy to both platforms
- `automate` - Run automation
- `status` - Check status
- `logs` - View logs

---

## 🎊 Summary

You now have a complete Windows-compatible deployment system!

**Quick Commands:**
```powershell
.\deploy-unified.ps1                     # Deploy to both
.\deploy-unified.ps1 -Platform vercel    # Vercel only
.\deploy-unified.ps1 -Platform render    # Render only
node master-automation.js --immediate    # Run automation
node master-automation.js --status       # Check status
Get-Content data\master-automation.log   # View logs
```

**Resources:**
- 📖 Full Guide: `UNIFIED-DEPLOYMENT-GUIDE.md`
- ⚡ Quick Start: `QUICK-START-UNIFIED.md`
- 🪟 This Guide: `WINDOWS-QUICK-START.md`
- 🛠️ Script: `deploy-unified.ps1`

**Need Help?**
- Check logs: `Get-Content data\master-automation.log`
- View status: `node master-automation.js --status`
- Test locally: `node master-automation.js --immediate`

Happy automating on Windows! 🚀💰
