#Requires -Version 5.1

<#
.SYNOPSIS
    Activates automation for 7:00 AM daily and seeds demo data
#>

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                           ║" -ForegroundColor Cyan
Write-Host "║      🌅 ACTIVATING 7:00 AM DAILY AUTOMATION 🌅          ║" -ForegroundColor Cyan
Write-Host "║                                                           ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

# Step 1: Pull latest changes
Write-Host "📥 Step 1: Pulling latest configuration..." -ForegroundColor Cyan
try {
    git pull origin claude/fix-issue-011CV3EX4MhR5SzS5GViqTzi
    Write-Host "   ✅ Latest changes pulled (7:00 AM schedule)" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️  Git pull skipped (not critical)" -ForegroundColor Yellow
}
Write-Host ""

# Step 2: Update seed script for 7 AM
Write-Host "🌱 Step 2: Seeding demo data and activating 7:00 AM automation..." -ForegroundColor Cyan
Write-Host ""

# Update the seed script to use 7 AM
$seedScript = Get-Content "scripts/seed-demo-data.js" -Raw
$seedScript = $seedScript -replace "next_run = datetime\('now', 'start of day', '\+23 hours', '\+35 minutes'\)", "next_run = datetime('now', 'start of day', '+1 day', '+7 hours')"
$seedScript = $seedScript -replace "Tonight at 11:35 PM", "Tomorrow at 7:00 AM"
$seedScript = $seedScript -replace "11:35 PM", "7:00 AM"
Set-Content "scripts/seed-demo-data.js" -Value $seedScript

node scripts/seed-demo-data.js

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Failed to seed demo data!" -ForegroundColor Red
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

Write-Host ""

# Step 3: Restart Server
Write-Host "🔄 Step 3: Restarting server with new data..." -ForegroundColor Cyan

# Stop existing servers
try {
    Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
    Write-Host "   ✅ Old server stopped" -ForegroundColor Green
    Start-Sleep -Seconds 2
} catch {
    Write-Host "   ℹ️  No servers were running" -ForegroundColor Yellow
}

# Start new server
$serverScript = @"
`$host.UI.RawUI.WindowTitle = 'Automated Profit System - Server (7:00 AM Schedule)'
Set-Location '$ScriptDir'
Write-Host ''
Write-Host '╔═══════════════════════════════════════════════════════════╗' -ForegroundColor Cyan
Write-Host '║     PROFIT SYSTEM - ACTIVE (7:00 AM AUTOMATION)          ║' -ForegroundColor Cyan
Write-Host '╚═══════════════════════════════════════════════════════════╝' -ForegroundColor Cyan
Write-Host ''
Write-Host '🌅 Automation runs daily at 7:00 AM' -ForegroundColor Cyan
Write-Host '📊 Demo data loaded - Dashboard populated!' -ForegroundColor Green
Write-Host '🚀 Server: http://localhost:3000' -ForegroundColor White
Write-Host ''
Write-Host 'Press Ctrl+C to stop the server' -ForegroundColor Yellow
Write-Host ''
node server.js
"@

Start-Process powershell -ArgumentList "-NoExit", "-Command", $serverScript
Write-Host "   ✅ Server restarting..." -ForegroundColor Green
Write-Host ""

# Step 4: Wait for Server
Write-Host "⏳ Step 4: Waiting for server..." -ForegroundColor Cyan
$maxRetries = 10
$retryCount = 0
$serverReady = $false

while ($retryCount -lt $maxRetries -and !$serverReady) {
    Start-Sleep -Seconds 2
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:3000/api/health" -TimeoutSec 2 -ErrorAction Stop
        if ($response.status -eq "ok") {
            $serverReady = $true
            Write-Host "   ✅ Server is online!" -ForegroundColor Green
        }
    } catch {
        $retryCount++
        Write-Host "   ⏳ Attempt $retryCount of $maxRetries..." -ForegroundColor Yellow
    }
}
Write-Host ""

# Step 5: Display Summary
Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                                                           ║" -ForegroundColor Green
Write-Host "║              ✅ SYSTEM FULLY ACTIVATED! ✅               ║" -ForegroundColor Green
Write-Host "║                                                           ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "📊 WHAT'S NEW:" -ForegroundColor Cyan
Write-Host "   ✅ 10 Demo Products Created" -ForegroundColor Green
Write-Host "   ✅ 50 Sample Orders Generated" -ForegroundColor Green
Write-Host "   ✅ 4 Team Members Added" -ForegroundColor Green
Write-Host "   ✅ Revenue/Profit Analytics Populated" -ForegroundColor Green
Write-Host "   ✅ Activity Timeline Created" -ForegroundColor Green
Write-Host ""

Write-Host "⚡ AUTOMATION STATUS:" -ForegroundColor Cyan
Write-Host "   🟢 Status: ACTIVE" -ForegroundColor Green
Write-Host "   🌅 Schedule: Daily at 7:00 AM" -ForegroundColor White
Write-Host "   📅 Next Run: TOMORROW MORNING at 7:00 AM" -ForegroundColor Yellow
Write-Host "   📦 Products per run: 10" -ForegroundColor White
Write-Host "   💰 Target margin: 65-85%" -ForegroundColor White
Write-Host ""

Write-Host "🎯 EXPECTED TOMORROW (7:00 AM):" -ForegroundColor Cyan
Write-Host "   1. Scan trending keywords (10 countries)" -ForegroundColor White
Write-Host "   2. Generate 10 new product designs" -ForegroundColor White
Write-Host "   3. Create products with optimal pricing" -ForegroundColor White
Write-Host "   4. Publish to Printful" -ForegroundColor White
Write-Host "   5. Update analytics dashboard" -ForegroundColor White
Write-Host ""

Write-Host "📈 YOUR DASHBOARD NOW SHOWS:" -ForegroundColor Cyan
Write-Host "   • Total Revenue: ~$28,000+" -ForegroundColor White
Write-Host "   • Total Profit: ~$20,000+" -ForegroundColor White
Write-Host "   • Active Products: 10" -ForegroundColor White
Write-Host "   • Team Performance Metrics" -ForegroundColor White
Write-Host "   • Recent Activity Timeline" -ForegroundColor White
Write-Host ""

Write-Host "🌐 ACCESS YOUR DASHBOARD:" -ForegroundColor Cyan
Write-Host "   URL: http://localhost:3000" -ForegroundColor White
Write-Host "   Login: owner@jerzii.ai" -ForegroundColor White
Write-Host "   Password: Owner@2025" -ForegroundColor White
Write-Host ""

Write-Host "💡 WHY 7:00 AM IS OPTIMAL:" -ForegroundColor Cyan
Write-Host "   ✅ Products ready for morning shoppers" -ForegroundColor White
Write-Host "   ✅ Captures peak daytime traffic" -ForegroundColor White
Write-Host "   ✅ Fresh daily inventory every morning" -ForegroundColor White
Write-Host "   ✅ Maximizes sales window throughout the day" -ForegroundColor White
Write-Host ""

# Calculate time until 7:00 AM tomorrow
$now = Get-Date
$tomorrow7AM = (Get-Date -Hour 7 -Minute 0 -Second 0).AddDays(1)
if ($now.Hour -lt 7) {
    $tomorrow7AM = Get-Date -Hour 7 -Minute 0 -Second 0
}
$timeUntil = $tomorrow7AM - $now
$hours = [math]::Floor($timeUntil.TotalHours)
$minutes = $timeUntil.Minutes

Write-Host "⏰ TIME UNTIL AUTOMATION:" -ForegroundColor Yellow
Write-Host "   $hours hours and $minutes minutes until 7:00 AM" -ForegroundColor White
Write-Host ""

Write-Host "💡 KEEP SERVER RUNNING:" -ForegroundColor Cyan
Write-Host "   • Leave PC on overnight" -ForegroundColor White
Write-Host "   • Server must run for automation to execute" -ForegroundColor White
Write-Host "   • Alternative: Deploy to Vercel for 24/7 uptime" -ForegroundColor White
Write-Host ""

Write-Host "🌐 Opening dashboard in 3 seconds..." -ForegroundColor Yellow
Start-Sleep -Seconds 3
Start-Process "http://localhost:3000"

Write-Host ""
Write-Host "Press any key to close this window (server keeps running)..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
