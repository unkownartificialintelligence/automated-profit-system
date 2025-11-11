# PowerShell API Test Script for Windows
# Run this to test all APIs on Windows

Write-Host "=================================" -ForegroundColor Cyan
Write-Host "  API HEALTH CHECK" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Health Check
Write-Host "1. Testing Health API..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3003/api/health" -Method Get
    Write-Host "   ✅ Health API: " -NoNewline -ForegroundColor Green
    if ($health.checks.printful.status -eq "healthy") {
        Write-Host "Printful OK" -ForegroundColor Green
    } else {
        Write-Host "Printful ERROR ($($health.checks.printful.status))" -ForegroundColor Red
        Write-Host "   📌 Status: $($health.checks.printful.message)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ Health API Failed: $_" -ForegroundColor Red
}

Write-Host ""

# Test 2: Christmas Products
Write-Host "2. Testing Christmas Products API..." -ForegroundColor Yellow
try {
    $christmas = Invoke-RestMethod -Uri "http://localhost:3003/api/christmas/today" -Method Get
    Write-Host "   ✅ Christmas API: Found $($christmas.data.products.Count) products" -ForegroundColor Green
    Write-Host "   📦 Today's top product: $($christmas.data.products[0].product_name)" -ForegroundColor Cyan
} catch {
    Write-Host "   ❌ Christmas API Failed: $_" -ForegroundColor Red
}

Write-Host ""

# Test 3: Full Automation Status
Write-Host "3. Testing Full Automation Status..." -ForegroundColor Yellow
try {
    $automation = Invoke-RestMethod -Uri "http://localhost:3003/api/full-automation/status" -Method Get
    Write-Host "   ✅ Automation Status: $($automation.total_runs) runs completed" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Automation Status Failed: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "  TEST COMPLETE" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Show next steps
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. If Printful shows ERROR, run: .\setup-apis-windows.ps1" -ForegroundColor White
Write-Host "2. To run automation, use: .\run-automation-windows.ps1" -ForegroundColor White
Write-Host ""
