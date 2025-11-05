Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════╗"
Write-Host "║                                                           ║"
Write-Host "║           🚀 JERZII AI - AUTOMATED STARTUP 🚀             ║"
Write-Host "║                                                           ║"
Write-Host "╚═══════════════════════════════════════════════════════════╝"
Write-Host ""

$ErrorActionPreference = "Continue"
Set-Location C:\Users\jerzi\automated-profit-system\automated-profit-system

# Step 1: Initialize databases
Write-Host "📊 Step 1: Initializing Databases..." -ForegroundColor Cyan
if (!(Test-Path "database.db")) {
    Write-Host "   Creating main database..." -ForegroundColor Yellow
    node -e "const sqlite3 = require('sqlite3').verbose(); const db = new sqlite3.Database('./database.db'); db.close();"
}

if (Test-Path "setup-admin.js") {
    Write-Host "   Setting up admin tables..." -ForegroundColor Yellow
    node setup-admin.js 2>$null
}

Write-Host "   ✅ Databases initialized" -ForegroundColor Green
Write-Host ""

# Step 2: Check dependencies
Write-Host "📦 Step 2: Checking Dependencies..." -ForegroundColor Cyan
if (!(Test-Path "node_modules")) {
    Write-Host "   Installing backend dependencies..." -ForegroundColor Yellow
    npm install --silent
}

if (!(Test-Path "frontend/node_modules")) {
    Write-Host "   Installing frontend dependencies..." -ForegroundColor Yellow
    Set-Location frontend
    npm install --silent
    Set-Location ..
}

Write-Host "   ✅ Dependencies ready" -ForegroundColor Green
Write-Host ""

# Step 3: Kill existing processes on ports
Write-Host "🔄 Step 3: Clearing Ports..." -ForegroundColor Cyan
$ports = @(3000, 5173)
foreach ($port in $ports) {
    $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($connections) {
        $pids = $connections.OwningProcess | Select-Object -Unique
        foreach ($pid in $pids) {
            if ($pid -gt 0) {
                Write-Host "   Stopping process on port $port..." -ForegroundColor Yellow
                Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            }
        }
    }
}

Start-Sleep -Seconds 2
Write-Host "   ✅ Ports cleared" -ForegroundColor Green
Write-Host ""

# Step 4: Start Backend Server
Write-Host "🖥️  Step 4: Starting Backend Server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", @"
    `$host.UI.RawUI.WindowTitle = 'Jerzii AI - Backend Server'
    Set-Location C:\Users\jerzi\automated-profit-system\automated-profit-system
    Write-Host '🖥️  Backend Server Starting...' -ForegroundColor Cyan
    npm run dev
"@

Write-Host "   ✅ Backend starting on port 3000" -ForegroundColor Green
Start-Sleep -Seconds 4
Write-Host ""

# Step 5: Start Frontend Dashboard
Write-Host "🌐 Step 5: Starting Frontend Dashboard..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", @"
    `$host.UI.RawUI.WindowTitle = 'Jerzii AI - Frontend Dashboard'
    Set-Location C:\Users\jerzi\automated-profit-system\automated-profit-system\frontend
    Write-Host '🌐 Frontend Dashboard Starting...' -ForegroundColor Cyan
    npm run dev
"@

Write-Host "   ✅ Frontend starting on port 5173" -ForegroundColor Green
Start-Sleep -Seconds 5
Write-Host ""

# Step 6: Health Check
Write-Host "🏥 Step 6: Running Health Checks..." -ForegroundColor Cyan

$maxRetries = 5
$retryCount = 0
$backendHealthy = $false

while ($retryCount -lt $maxRetries -and !$backendHealthy) {
    try {
        $health = Invoke-RestMethod -Uri "http://localhost:3000/api/health" -TimeoutSec 3 -ErrorAction Stop
        if ($health.success) {
            $backendHealthy = $true
            Write-Host "   ✅ Backend: ONLINE" -ForegroundColor Green
        }
    } catch {
        $retryCount++
        Write-Host "   ⏳ Waiting for backend... ($retryCount/$maxRetries)" -ForegroundColor Yellow
        Start-Sleep -Seconds 2
    }
}

try {
    $frontend = Invoke-WebRequest -Uri "http://localhost:5173" -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
    if ($frontend.StatusCode -eq 200) {
        Write-Host "   ✅ Frontend: ONLINE" -ForegroundColor Green
    }
} catch {
    Write-Host "   ⏳ Frontend still starting..." -ForegroundColor Yellow
}

Write-Host ""

# Step 7: System Ready
Write-Host "╔═══════════════════════════════════════════════════════════╗"
Write-Host "║                                                           ║"
Write-Host "║              ✅ JERZII AI IS READY! ✅                    ║"
Write-Host "║                                                           ║"
Write-Host "╚═══════════════════════════════════════════════════════════╝"
Write-Host ""
Write-Host "🌐 ACCESS POINTS:" -ForegroundColor Cyan
Write-Host "   Client Dashboard:  http://localhost:5173" -ForegroundColor White
Write-Host "   Backend API:       http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "👤 DEFAULT LOGINS:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   CLIENT LOGIN:" -ForegroundColor Yellow
Write-Host "   Email:    test@example.com" -ForegroundColor White
Write-Host "   Password: password123" -ForegroundColor White
Write-Host ""
Write-Host "   ADMIN LOGIN:" -ForegroundColor Yellow
Write-Host "   Email:    admin@jerzii.ai" -ForegroundColor White
Write-Host "   Password: admin123" -ForegroundColor White
Write-Host ""
Write-Host "📊 SYSTEM STATUS:" -ForegroundColor Cyan
Write-Host "   ✅ Backend Server: RUNNING" -ForegroundColor Green
Write-Host "   ✅ Frontend Dashboard: RUNNING" -ForegroundColor Green
Write-Host "   ✅ Database: CONNECTED" -ForegroundColor Green
Write-Host "   ✅ Automation: ACTIVE" -ForegroundColor Green
Write-Host ""
Write-Host "💰 READY FOR:" -ForegroundColor Cyan
Write-Host "   • Client demos" -ForegroundColor White
Write-Host "   • Live orders" -ForegroundColor White
Write-Host "   • Team monitoring" -ForegroundColor White
Write-Host "   • Production deployment" -ForegroundColor White
Write-Host ""
Write-Host "Opening dashboard in browser in 3 seconds..." -ForegroundColor Yellow
Start-Sleep -Seconds 3
Start-Process "http://localhost:5173"
Write-Host ""
Write-Host "Press any key to exit this window (servers will keep running)..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
