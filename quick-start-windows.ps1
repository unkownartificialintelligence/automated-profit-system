# PowerShell Quick Start Script for Windows
# Tests automation with top 1 product

Write-Host "=================================" -ForegroundColor Cyan
Write-Host "  QUICK START TEST" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Testing with top 1 product..." -ForegroundColor Yellow
Write-Host ""

try {
    $body = @{
        use_todays_products = $true
        max_products = 1
    } | ConvertTo-Json

    $result = Invoke-RestMethod -Uri "http://localhost:3003/api/full-automation/quick-start" `
                                 -Method Post `
                                 -ContentType "application/json"

    Write-Host "✅ QUICK START COMPLETE!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Product Tested:" -ForegroundColor Cyan
    Write-Host "  Name: $($result.pipeline.products.data[0].product_name)" -ForegroundColor White
    Write-Host "  Time: $($result.pipeline.summary.total_time_seconds) seconds" -ForegroundColor White
    Write-Host "  Automation Level: $($result.pipeline.summary.automation_level)%" -ForegroundColor Yellow
    Write-Host ""

    if ($result.pipeline.summary.automation_level -lt 100) {
        Write-Host "⚠️  Running in SEMI-AUTOMATED mode" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "To get 100% automation:" -ForegroundColor Cyan
        Write-Host "  Run: .\setup-apis-windows.ps1" -ForegroundColor White
        Write-Host ""
    }

} catch {
    Write-Host "❌ QUICK START FAILED!" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Is the server running? Check with: .\test-apis.ps1" -ForegroundColor Yellow
}
