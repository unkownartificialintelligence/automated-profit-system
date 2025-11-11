Write-Host "`n🚀 Launching Jerzii AI Automated Profit System..." -ForegroundColor Cyan

# --- Kill any ports in use (3000 backend / 5173 frontend) ---
$ports = @(3000, 5173)
foreach ($p in $ports) {
    $pid = (Get-NetTCPConnection -LocalPort $p -ErrorAction SilentlyContinue).OwningProcess
    if ($pid) {
        Write-Host "⚠️  Port $p in use — killing PID $pid..." -ForegroundColor Yellow
        Stop-Process -Id $pid -Force
    }
}

# --- Verify .env and Printful key ---
$envFile = ".env"
if (Test-Path $envFile) {
    $apiKey = (Get-Content $envFile | Where-Object { $_ -match "^PRINTFUL_API_KEY=" }) -replace "PRINTFUL_API_KEY=", ""
    if ([string]::IsNullOrWhiteSpace($apiKey)) {
        Write-Host "❌ Missing PRINTFUL_API_KEY in .env!" -ForegroundColor Red
    } else {
        Write-Host "🔑 Printful API key detected." -ForegroundColor Green
    }
} else {
    Write-Host "⚠️  .env not found — backend may fail Printful requests." -ForegroundColor Yellow
}

# --- Launch backend ---
Write-Host "`n🖥️  Starting backend server on port 3000..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "npm run dev" -WorkingDirectory "." 

# --- Launch frontend ---
Write-Host "🌐 Starting frontend dashboard on port 5173..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "npm run dev" -WorkingDirectory "frontend"

# --- Health check after short delay ---
Start-Sleep -Seconds 6
try {
    $health = Invoke-WebRequest http://localhost:3000/api/health -UseBasicParsing
    Write-Host "✅ Backend health: $($health.Content)" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend health check failed — verify API running." -ForegroundColor Red
}

# --- Auto-open the dashboard ---
Start-Sleep -Seconds 2
Start-Process "http://localhost:5173"

Write-Host "`n🎯 System online! Frontend + Backend are running live." -ForegroundColor Cyan
