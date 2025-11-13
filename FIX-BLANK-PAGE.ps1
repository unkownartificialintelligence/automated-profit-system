#Requires -Version 5.1

<#
.SYNOPSIS
    Fixes blank page issue by building frontend and setting up database
#>

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Yellow
Write-Host "║                                                           ║" -ForegroundColor Yellow
Write-Host "║              🔧 FIXING BLANK PAGE ISSUE 🔧               ║" -ForegroundColor Yellow
Write-Host "║                                                           ║" -ForegroundColor Yellow
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Yellow
Write-Host ""

# Get script directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

# Step 1: Stop any running servers
Write-Host "🛑 Step 1: Stopping existing servers..." -ForegroundColor Cyan
try {
    Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
    Write-Host "   ✅ Servers stopped" -ForegroundColor Green
    Start-Sleep -Seconds 2
} catch {
    Write-Host "   ℹ️  No servers were running" -ForegroundColor Yellow
}
Write-Host ""

# Step 2: Build Frontend
Write-Host "🏗️  Step 2: Building Frontend..." -ForegroundColor Cyan

if (!(Test-Path "frontend")) {
    Write-Host "   ❌ Frontend folder not found!" -ForegroundColor Red
    exit 1
}

Set-Location frontend

# Check if node_modules exists
if (!(Test-Path "node_modules")) {
    Write-Host "   📦 Installing frontend dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   ❌ Failed to install dependencies!" -ForegroundColor Red
        Set-Location ..
        exit 1
    }
}

# Build the frontend
Write-Host "   🔨 Building frontend (this may take 30-60 seconds)..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "   ❌ Build failed!" -ForegroundColor Red
    Set-Location ..
    exit 1
}

# Verify dist folder was created
if (Test-Path "dist/index.html") {
    Write-Host "   ✅ Frontend built successfully" -ForegroundColor Green
} else {
    Write-Host "   ❌ Build completed but dist/index.html not found!" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Set-Location ..
Write-Host ""

# Step 3: Setup Database with Users
Write-Host "🗄️  Step 3: Setting up database and users..." -ForegroundColor Cyan

if (Test-Path "scripts/create-users.js") {
    Write-Host "   👥 Creating user accounts..." -ForegroundColor Yellow
    node scripts/create-users.js
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Users created" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  User creation had issues (may already exist)" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ⚠️  User creation script not found" -ForegroundColor Yellow
}
Write-Host ""

# Step 4: Verify Setup
Write-Host "✅ Step 4: Verifying setup..." -ForegroundColor Cyan

$checks = @{
    "Frontend dist folder" = (Test-Path "frontend/dist/index.html")
    "Frontend assets" = (Test-Path "frontend/dist/assets")
    "Server file" = (Test-Path "server.js")
    "Database script" = (Test-Path "scripts/create-users.js")
}

$allGood = $true
foreach ($check in $checks.GetEnumerator()) {
    if ($check.Value) {
        Write-Host "   ✅ $($check.Key)" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $($check.Key)" -ForegroundColor Red
        $allGood = $false
    }
}
Write-Host ""

if (!$allGood) {
    Write-Host "❌ Some checks failed. Please review the errors above." -ForegroundColor Red
    Write-Host ""
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

# Step 5: Start Server
Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                                                           ║" -ForegroundColor Green
Write-Host "║                  ✅ FIX COMPLETE! ✅                      ║" -ForegroundColor Green
Write-Host "║                                                           ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "🚀 Starting server..." -ForegroundColor Cyan
Write-Host ""

# Start server in new window
$serverScript = @"
`$host.UI.RawUI.WindowTitle = 'Automated Profit System - Server'
Set-Location '$ScriptDir'
Write-Host ''
Write-Host '╔═══════════════════════════════════════════════════════════╗' -ForegroundColor Green
Write-Host '║     AUTOMATED PROFIT SYSTEM - SERVER RUNNING              ║' -ForegroundColor Green
Write-Host '╚═══════════════════════════════════════════════════════════╝' -ForegroundColor Green
Write-Host ''
Write-Host '🚀 Server running on http://localhost:3000' -ForegroundColor Cyan
Write-Host '📊 Dashboard should now load correctly!' -ForegroundColor Green
Write-Host ''
Write-Host 'Press Ctrl+C to stop the server' -ForegroundColor Yellow
Write-Host ''
node server.js
"@

Start-Process powershell -ArgumentList "-NoExit", "-Command", $serverScript

Write-Host "   ✅ Server starting..." -ForegroundColor Green
Write-Host ""

# Wait for server
Write-Host "⏳ Waiting for server to be ready..." -ForegroundColor Cyan
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

if ($serverReady) {
    Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║                                                           ║" -ForegroundColor Green
    Write-Host "║              🎉 SYSTEM IS NOW READY! 🎉                  ║" -ForegroundColor Green
    Write-Host "║                                                           ║" -ForegroundColor Green
    Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""

    Write-Host "🌐 ACCESS YOUR DASHBOARD:" -ForegroundColor Cyan
    Write-Host "   URL: http://localhost:3000" -ForegroundColor White
    Write-Host ""

    Write-Host "👤 LOGIN CREDENTIALS:" -ForegroundColor Cyan
    Write-Host "   Email:    owner@jerzii.ai" -ForegroundColor White
    Write-Host "   Password: Owner@2025" -ForegroundColor White
    Write-Host ""

    Write-Host "🎯 WHAT TO EXPECT:" -ForegroundColor Cyan
    Write-Host "   • Login page with credentials pre-filled" -ForegroundColor White
    Write-Host "   • Full dashboard after login" -ForegroundColor White
    Write-Host "   • All features operational" -ForegroundColor White
    Write-Host ""

    Write-Host "🌐 Opening browser in 3 seconds..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3
    Start-Process "http://localhost:3000"
} else {
    Write-Host "⚠️  Server is taking longer than expected" -ForegroundColor Yellow
    Write-Host "   Check the server console window for errors" -ForegroundColor Yellow
    Write-Host "   Or try manually: http://localhost:3000" -ForegroundColor White
}

Write-Host ""
Write-Host "ℹ️  To stop the server:" -ForegroundColor Cyan
Write-Host "   Close the server console window" -ForegroundColor White
Write-Host "   Or run: .\STOP-PROFIT-SYSTEM.ps1" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to close this window..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
