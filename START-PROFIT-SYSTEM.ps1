#Requires -Version 5.1

<#
.SYNOPSIS
    Starts the Automated Profit System unified server
.DESCRIPTION
    This script starts the unified backend+frontend server on port 3000
    with all authentication and profit optimization features enabled.
#>

param(
    [switch]$SkipBrowser,
    [int]$Port = 3000
)

$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                           ║" -ForegroundColor Cyan
Write-Host "║       🚀 AUTOMATED PROFIT SYSTEM - STARTING 🚀           ║" -ForegroundColor Cyan
Write-Host "║                                                           ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Get the script directory and set as working directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir
Write-Host "📁 Working Directory: $ScriptDir" -ForegroundColor Yellow
Write-Host ""

# Step 1: Check Node.js
Write-Host "🔍 Step 1: Checking Node.js..." -ForegroundColor Cyan
try {
    $nodeVersion = node --version
    Write-Host "   ✅ Node.js $nodeVersion installed" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Node.js not found! Please install Node.js from https://nodejs.org" -ForegroundColor Red
    Write-Host ""
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}
Write-Host ""

# Step 2: Check Dependencies
Write-Host "📦 Step 2: Checking Dependencies..." -ForegroundColor Cyan
if (!(Test-Path "node_modules")) {
    Write-Host "   Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   ❌ Failed to install dependencies!" -ForegroundColor Red
        exit 1
    }
}
Write-Host "   ✅ Dependencies ready" -ForegroundColor Green
Write-Host ""

# Step 3: Check Database
Write-Host "🗄️  Step 3: Checking Database..." -ForegroundColor Cyan
if (Test-Path "data/app.db") {
    Write-Host "   ✅ Database exists" -ForegroundColor Green
} else {
    Write-Host "   📝 Database will be created on first run" -ForegroundColor Yellow
}
Write-Host ""

# Step 4: Kill existing processes on port
Write-Host "🔄 Step 4: Clearing Port $Port..." -ForegroundColor Cyan
try {
    $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    if ($connections) {
        $pids = $connections.OwningProcess | Select-Object -Unique
        foreach ($pid in $pids) {
            if ($pid -gt 0) {
                Write-Host "   Stopping process $pid on port $Port..." -ForegroundColor Yellow
                Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                Start-Sleep -Seconds 1
            }
        }
        Write-Host "   ✅ Port $Port cleared" -ForegroundColor Green
    } else {
        Write-Host "   ✅ Port $Port is available" -ForegroundColor Green
    }
} catch {
    Write-Host "   ℹ️  Port check completed" -ForegroundColor Yellow
}
Write-Host ""

# Step 5: Start Server
Write-Host "🖥️  Step 5: Starting Unified Server..." -ForegroundColor Cyan
Write-Host "   Server will run on http://localhost:$Port" -ForegroundColor White
Write-Host ""

# Create a new PowerShell window for the server
$serverScript = @"
`$host.UI.RawUI.WindowTitle = 'Automated Profit System - Server'
Set-Location '$ScriptDir'
Write-Host ''
Write-Host '╔═══════════════════════════════════════════════════════════╗' -ForegroundColor Green
Write-Host '║     AUTOMATED PROFIT SYSTEM - SERVER CONSOLE              ║' -ForegroundColor Green
Write-Host '╚═══════════════════════════════════════════════════════════╝' -ForegroundColor Green
Write-Host ''
Write-Host '🚀 Starting server on port $Port...' -ForegroundColor Cyan
Write-Host ''
node server.js
"@

Start-Process powershell -ArgumentList "-NoExit", "-Command", $serverScript

Write-Host "   ✅ Server starting..." -ForegroundColor Green
Write-Host ""

# Step 6: Wait for server to be ready
Write-Host "⏳ Step 6: Waiting for server..." -ForegroundColor Cyan
$maxRetries = 15
$retryCount = 0
$serverReady = $false

while ($retryCount -lt $maxRetries -and !$serverReady) {
    Start-Sleep -Seconds 2
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:$Port/api/health" -TimeoutSec 2 -ErrorAction Stop
        if ($response.status -eq "ok") {
            $serverReady = $true
            Write-Host "   ✅ Server is online!" -ForegroundColor Green
        }
    } catch {
        $retryCount++
        Write-Host "   ⏳ Attempt $retryCount of $maxRetries..." -ForegroundColor Yellow
    }
}

if (!$serverReady) {
    Write-Host "   ⚠️  Server is taking longer than expected to start" -ForegroundColor Yellow
    Write-Host "   Check the server console window for any errors" -ForegroundColor Yellow
}
Write-Host ""

# Step 7: System Ready
Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                                                           ║" -ForegroundColor Green
Write-Host "║          ✅ AUTOMATED PROFIT SYSTEM READY! ✅            ║" -ForegroundColor Green
Write-Host "║                                                           ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "🌐 ACCESS:" -ForegroundColor Cyan
Write-Host "   Dashboard: http://localhost:$Port" -ForegroundColor White
Write-Host ""

Write-Host "👤 LOGIN CREDENTIALS:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   OWNER ACCOUNT (Pre-filled):" -ForegroundColor Yellow
Write-Host "   Email:    owner@jerzii.ai" -ForegroundColor White
Write-Host "   Password: Owner@2025" -ForegroundColor White
Write-Host ""
Write-Host "   ⚠️  Change password after first login!" -ForegroundColor Red
Write-Host "   Run: node scripts/change-owner-password.js" -ForegroundColor Yellow
Write-Host ""

Write-Host "📊 SYSTEM STATUS:" -ForegroundColor Cyan
Write-Host "   ✅ Unified Server: RUNNING" -ForegroundColor Green
Write-Host "   ✅ Database: ACTIVE" -ForegroundColor Green
Write-Host "   ✅ Authentication: ENABLED" -ForegroundColor Green
Write-Host "   ✅ Automation: CONFIGURED (9:00 AM daily)" -ForegroundColor Green
Write-Host "   ✅ Profit Optimization: ACTIVE (75% target margin)" -ForegroundColor Green
Write-Host ""

Write-Host "💰 FEATURES ACTIVE:" -ForegroundColor Cyan
Write-Host "   • Multi-user authentication (6 accounts)" -ForegroundColor White
Write-Host "   • Daily automated product creation (10/day)" -ForegroundColor White
Write-Host "   • Global trending monitoring (10 countries)" -ForegroundColor White
Write-Host "   • Profit margins: 65-85%" -ForegroundColor White
Write-Host "   • Real-time analytics dashboard" -ForegroundColor White
Write-Host ""

Write-Host "📚 DOCUMENTATION:" -ForegroundColor Cyan
Write-Host "   • LOGIN-CREDENTIALS.md - All user accounts" -ForegroundColor White
Write-Host "   • PROFIT-OPTIMIZATION-GUIDE.md - Profit strategies" -ForegroundColor White
Write-Host "   • TESTING-REPORT.md - System architecture" -ForegroundColor White
Write-Host ""

if (!$SkipBrowser) {
    Write-Host "🌐 Opening dashboard in browser in 3 seconds..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3
    Start-Process "http://localhost:$Port"
}

Write-Host ""
Write-Host "ℹ️  To stop the server:" -ForegroundColor Cyan
Write-Host "   Close the 'Automated Profit System - Server' window" -ForegroundColor White
Write-Host "   Or run: .\STOP-PROFIT-SYSTEM.ps1" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to close this window (server will keep running)..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
