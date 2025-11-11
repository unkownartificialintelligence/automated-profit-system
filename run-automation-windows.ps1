# PowerShell Automation Script for Windows
# Usage: .\run-automation-windows.ps1 [max_products]
# Example: .\run-automation-windows.ps1 3

param(
    [int]$MaxProducts = 3
)

Write-Host "=================================" -ForegroundColor Cyan
Write-Host "  FULL AUTOMATION PIPELINE" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Processing: $MaxProducts products" -ForegroundColor Yellow
Write-Host ""

try {
    $body = @{
        use_todays_products = $true
        max_products = $MaxProducts
    } | ConvertTo-Json

    $result = Invoke-RestMethod -Uri "http://localhost:3003/api/full-automation/run" `
                                 -Method Post `
                                 -Body $body `
                                 -ContentType "application/json"

    # Display results
    Write-Host "✅ AUTOMATION COMPLETE!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Summary:" -ForegroundColor Cyan
    Write-Host "  Products Processed: $($result.pipeline.summary.total_products_processed)" -ForegroundColor White
    Write-Host "  Designs Created: $($result.pipeline.summary.designs_created)" -ForegroundColor White
    Write-Host "  Products Listed: $($result.pipeline.summary.products_listed)" -ForegroundColor White
    Write-Host "  Campaigns Generated: $($result.pipeline.summary.campaigns_generated)" -ForegroundColor White
    Write-Host "  Total Time: $($result.pipeline.summary.total_time_seconds) seconds" -ForegroundColor White
    Write-Host "  Automation Level: $($result.pipeline.summary.automation_level)%" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Revenue Potential:" -ForegroundColor Cyan
    Write-Host "  Estimated Daily: $($result.pipeline.summary.estimated_daily_revenue)" -ForegroundColor Green
    Write-Host ""

    # Show next steps
    if ($result.pipeline.summary.next_steps) {
        Write-Host "Next Steps:" -ForegroundColor Yellow
        foreach ($step in $result.pipeline.summary.next_steps) {
            Write-Host "  • $step" -ForegroundColor White
        }
    }

    Write-Host ""

} catch {
    Write-Host "❌ AUTOMATION FAILED!" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "1. Check if server is running: .\deploy.sh" -ForegroundColor White
    Write-Host "2. Check API health: .\test-apis.ps1" -ForegroundColor White
    Write-Host "3. View server logs" -ForegroundColor White
}
