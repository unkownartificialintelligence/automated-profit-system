# Windows Startup Guide - Fix "Unable to Connect" Error

## Quick Fix - Get Your Server Running in 3 Steps

### Step 1: Open PowerShell in Project Folder

1. Press `Windows Key + E` to open File Explorer
2. Navigate to: `C:\Users\jerzi\automated-profit-system\automated-profit-system`
3. Click in the address bar at the top
4. Type `powershell` and press Enter

**OR** Right-click in the folder while holding Shift, select "Open PowerShell window here"

### Step 2: Pull Latest Changes

```powershell
git pull
```

This will download the new startup scripts I just created.

### Step 3: Start the Server

```powershell
.\START-PROFIT-SYSTEM.ps1
```

**If you get an execution policy error**, run this first:
```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy Bypass -Force
.\START-PROFIT-SYSTEM.ps1
```

---

## What You'll See When It Works

```
╔═══════════════════════════════════════════════════════════╗
║       🚀 AUTOMATED PROFIT SYSTEM - STARTING 🚀           ║
╚═══════════════════════════════════════════════════════════╝

📁 Working Directory: C:\Users\jerzi\automated-profit-system\...
✅ Node.js v20.x.x installed
✅ Dependencies ready
✅ Port 3000 cleared
✅ Server starting...
✅ Server is online!

╔═══════════════════════════════════════════════════════════╗
║          ✅ AUTOMATED PROFIT SYSTEM READY! ✅            ║
╚═══════════════════════════════════════════════════════════╝

🌐 ACCESS:
   Dashboard: http://localhost:3000

👤 LOGIN CREDENTIALS:
   Email:    owner@jerzii.ai
   Password: Owner@2025
```

Browser will open automatically!

---

## Common Issues & Solutions

### Issue 1: "Cannot find path"

**Problem:** PowerShell opened in wrong directory

**Solution:**
```powershell
cd C:\Users\jerzi\automated-profit-system\automated-profit-system
.\START-PROFIT-SYSTEM.ps1
```

### Issue 2: "Execution Policy" Error

**Full Error:**
```
.\START-PROFIT-SYSTEM.ps1 : File START-PROFIT-SYSTEM.ps1 cannot be loaded because running scripts is disabled on this system.
```

**Solution:**
```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy Bypass -Force
.\START-PROFIT-SYSTEM.ps1
```

### Issue 3: "Node not found" or "npm not found"

**Problem:** Node.js not installed

**Solution:**
1. Download Node.js: https://nodejs.org/en/download/
2. Install LTS version (Long Term Support)
3. Restart PowerShell
4. Try again

**Verify Node.js:**
```powershell
node --version
npm --version
```

Should show version numbers like `v20.11.0` and `10.2.4`

### Issue 4: Port 3000 Already in Use

**Error in server console:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:**
```powershell
.\STOP-PROFIT-SYSTEM.ps1
Start-Sleep -Seconds 2
.\START-PROFIT-SYSTEM.ps1
```

### Issue 5: "git pull" Fails

**Error:**
```
error: Your local changes to the following files would be overwritten by merge
```

**Solution - Stash your changes:**
```powershell
git stash
git pull
.\START-PROFIT-SYSTEM.ps1
```

### Issue 6: Server Starts But Browser Shows "Unable to Connect"

**Problem:** Server is starting but not ready yet

**Solution:** Wait 10-15 seconds for server to fully start, then manually go to:
```
http://localhost:3000
```

**Check if server is actually running:**
```powershell
# Open a new PowerShell window and run:
Invoke-RestMethod -Uri "http://localhost:3000/api/health"
```

Should return:
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

### Issue 7: Dependencies Not Installing

**Error:**
```
npm ERR! code EACCES
```

**Solution - Run as Administrator:**
1. Close PowerShell
2. Right-click PowerShell icon
3. Select "Run as Administrator"
4. Navigate to folder and run script again

---

## Manual Startup (If Script Fails)

If the script doesn't work, you can start manually:

### Terminal 1 - Start Server:
```powershell
cd C:\Users\jerzi\automated-profit-system\automated-profit-system
npm install
node server.js
```

Server should show:
```
🚀 Server listening on port 3000
```

### Open Browser:
Go to: http://localhost:3000

---

## Verify Everything Works

### 1. Check Server Health:
Open PowerShell and run:
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/health"
```

Should return:
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

### 2. Test Login:
```powershell
$body = @{
    email = "owner@jerzii.ai"
    password = "Owner@2025"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -Body $body -ContentType "application/json"
```

Should return user info and a token.

### 3. Check Automation Status:
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/automation/status"
```

Should return:
```json
{
  "active": 1,
  "frequency": "daily",
  "products_created": 0,
  "next_run": "..."
}
```

---

## Stop the Server

When you're done:

```powershell
.\STOP-PROFIT-SYSTEM.ps1
```

Or manually:
1. Find the server console window (titled "Automated Profit System - Server")
2. Press `Ctrl + C`
3. Type `Y` and press Enter

Or use Task Manager:
1. Press `Ctrl + Shift + Esc`
2. Find "Node.js JavaScript Runtime"
3. Right-click → End Task

---

## Automation Schedule

Your system is now set to run automation at **3:00 AM daily**.

- **Products created:** Up to 10 per day
- **Profit margins:** 65-85%
- **Trending regions:** 10 countries
- **Next run:** Tonight at 3:00 AM (if server is running)

**Important:** The server must be running for automation to execute!

### Keep Server Running 24/7:

**Option 1 - Leave PC On:**
- Start server before bed
- Leave PC running overnight
- Automation runs at 3:00 AM

**Option 2 - Windows Task Scheduler:**
Create a scheduled task to start server automatically:
1. Open Task Scheduler
2. Create Basic Task
3. Trigger: At system startup
4. Action: Start a program
5. Program: `powershell.exe`
6. Arguments: `-ExecutionPolicy Bypass -File "C:\Users\jerzi\automated-profit-system\automated-profit-system\START-PROFIT-SYSTEM.ps1"`

**Option 3 - Deploy to Cloud:**
Deploy to Vercel/Render for 24/7 uptime (see Deploy-Complete.ps1)

---

## System Status After Startup

Once running, you should see:

✅ **Server:** http://localhost:3000
✅ **Database:** SQLite with 6 users
✅ **Authentication:** JWT enabled
✅ **Automation:** Active (3:00 AM daily)
✅ **Profit Margins:** 65-85% configured
✅ **Trending:** 10 countries monitored

---

## Need Help?

### Check Logs:
Server logs appear in the server console window.

### Test Connection:
```powershell
Test-NetConnection -ComputerName localhost -Port 3000
```

Should show: `TcpTestSucceeded : True`

### Firewall Issue:
If Windows Firewall blocks it:
1. Windows Security → Firewall & network protection
2. Allow an app through firewall
3. Find "Node.js JavaScript Runtime"
4. Check both Private and Public
5. Click OK

### Still Not Working?

Run this diagnostic:
```powershell
# Check if Node.js is installed
node --version
npm --version

# Check if port is free
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue

# Check if dependencies are installed
Test-Path "node_modules"

# Try to reach server
Test-NetConnection -ComputerName localhost -Port 3000
```

Send me the output and I'll help debug!

---

## Quick Reference

### Start Server:
```powershell
.\START-PROFIT-SYSTEM.ps1
```

### Stop Server:
```powershell
.\STOP-PROFIT-SYSTEM.ps1
```

### Change Password:
```powershell
node scripts/change-owner-password.js
```

### Check Status:
```powershell
Invoke-RestMethod http://localhost:3000/api/health
```

### View Logs:
Check the "Automated Profit System - Server" console window

---

**You're all set! Start the server and begin generating profits!** 🚀💰
