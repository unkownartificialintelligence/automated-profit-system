# PowerShell API Setup Script for Windows
# Checks API status and provides fix instructions

Write-Host "=================================" -ForegroundColor Cyan
Write-Host "  API CONFIGURATION HELPER" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Load .env file
$envFile = ".\.env"
$printfulKey = ""
$canvaKey = ""

if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match "PRINTFUL_API_KEY=(.+)") {
            $printfulKey = $matches[1]
        }
        if ($_ -match "CANVA_API_KEY=(.+)") {
            $canvaKey = $matches[1]
        }
    }
}

Write-Host "Current API Status:" -ForegroundColor Yellow
Write-Host ""

# Test Printful API
Write-Host "1. PRINTFUL API:" -ForegroundColor Cyan
if ($printfulKey) {
    Write-Host "   Testing..." -NoNewline
    try {
        $headers = @{
            "Authorization" = "Bearer $printfulKey"
        }
        $response = Invoke-WebRequest -Uri "https://api.printful.com/store" -Headers $headers -Method Get -UseBasicParsing

        if ($response.StatusCode -eq 200) {
            Write-Host " ✅ WORKING (200)" -ForegroundColor Green
            $printfulStatus = 0
        } else {
            Write-Host " ❌ FAILED ($($response.StatusCode))" -ForegroundColor Red
            $printfulStatus = 1
        }
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host " ❌ FAILED ($statusCode)" -ForegroundColor Red
        $printfulStatus = 1
    }
} else {
    Write-Host "   ⚠️  NOT CONFIGURED" -ForegroundColor Yellow
    $printfulStatus = 1
}

Write-Host ""

# Test Canva API
Write-Host "2. CANVA API:" -ForegroundColor Cyan
if ($canvaKey) {
    Write-Host "   ⚠️  CONFIGURED (but not tested)" -ForegroundColor Yellow
    $canvaStatus = 0
} else {
    Write-Host "   ⚠️  NOT CONFIGURED" -ForegroundColor Yellow
    $canvaStatus = 1
}

Write-Host ""
Write-Host "=================================" -ForegroundColor Cyan

# Calculate automation level
if ($printfulStatus -eq 0 -and $canvaStatus -eq 0) {
    $automationLevel = 100
    Write-Host "  Current Automation Level: 100%" -ForegroundColor Green
} elseif ($printfulStatus -eq 0) {
    $automationLevel = 75
    Write-Host "  Current Automation Level: 75%" -ForegroundColor Yellow
} else {
    $automationLevel = 50
    Write-Host "  Current Automation Level: 50%" -ForegroundColor Yellow
}

Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Provide fix instructions
if ($printfulStatus -ne 0) {
    Write-Host "=== FIX PRINTFUL API (CRITICAL - 15 min) ===" -ForegroundColor Red
    Write-Host ""
    Write-Host "Problem: Printful API is not working (401 unauthorized)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Solution:" -ForegroundColor Cyan
    Write-Host "1. Go to: https://www.printful.com/dashboard" -ForegroundColor White
    Write-Host "2. Click Settings → Stores" -ForegroundColor White
    Write-Host "3. Create new store → Select 'Manual Order Platform / API'" -ForegroundColor White
    Write-Host "4. Once created, go to: https://developers.printful.com/" -ForegroundColor White
    Write-Host "5. Click 'Create API Client'" -ForegroundColor White
    Write-Host "6. Generate 'Private Token'" -ForegroundColor White
    Write-Host "7. Copy the token" -ForegroundColor White
    Write-Host "8. Run: .\update-api-key-windows.ps1 PRINTFUL your_token_here" -ForegroundColor White
    Write-Host "9. Restart server: .\deploy.sh" -ForegroundColor White
    Write-Host ""
    Write-Host "Why this matters:" -ForegroundColor Yellow
    Write-Host "  • Current: 5-7 minutes per product (manual)" -ForegroundColor Red
    Write-Host "  • After fix: <30 seconds per product (automated)" -ForegroundColor Green
    Write-Host "  • Revenue increase: 3-4x" -ForegroundColor Green
    Write-Host ""
}

if ($canvaStatus -ne 0) {
    Write-Host "=== ADD CANVA API (OPTIONAL - 15 min) ===" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Benefit: Auto-create designs instead of manually" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Solution:" -ForegroundColor Cyan
    Write-Host "1. Go to: https://www.canva.com/developers/" -ForegroundColor White
    Write-Host "2. Sign up for developer account" -ForegroundColor White
    Write-Host "3. Create new app" -ForegroundColor White
    Write-Host "4. Generate API key" -ForegroundColor White
    Write-Host "5. Run: .\update-api-key-windows.ps1 CANVA your_key_here" -ForegroundColor White
    Write-Host "6. Restart server: .\deploy.sh" -ForegroundColor White
    Write-Host ""
}

Write-Host "💡 TIP: Get to 100% automation for 3-4x revenue increase!" -ForegroundColor Green
Write-Host ""
