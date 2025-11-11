##############################################
# Automated Profit System - Deployment Tester
# This script tests your Vercel deployment
##############################################

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "TESTING VERCEL DEPLOYMENT" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# URLs to test
$mainUrl = "https://automated-profit-system-git-main-jerzii-ais-projects.vercel.app"
$oldUrl = "https://automated-profit-system-git-claude-l-d608d3-jerzii-ais-projects.vercel.app"

##############################################
# TEST 1: Main Deployment (Production)
##############################################
Write-Host "[TEST 1] Testing MAIN deployment (with all fixes)..." -ForegroundColor Yellow
Write-Host "URL: $mainUrl/api/health`n" -ForegroundColor Gray

try {
    $response = Invoke-RestMethod -Uri "$mainUrl/api/health" -Method GET -TimeoutSec 10
    Write-Host "✅ SUCCESS! Main deployment is WORKING!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 5
    Write-Host "`n✅ YOUR DEPLOYMENT IS LIVE AND WORKING!" -ForegroundColor Green
    Write-Host "Use this URL: $mainUrl" -ForegroundColor Green
    $mainWorking = $true
} catch {
    Write-Host "❌ FAILED! Main deployment is NOT working" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    $mainWorking = $false
}

Write-Host "`n----------------------------------------`n"

##############################################
# TEST 2: Old Deployment (Preview Branch)
##############################################
Write-Host "[TEST 2] Testing OLD deployment (preview branch)..." -ForegroundColor Yellow
Write-Host "URL: $oldUrl/api/health`n" -ForegroundColor Gray

try {
    $response = Invoke-RestMethod -Uri "$oldUrl/api/health" -Method GET -TimeoutSec 10
    Write-Host "✅ Old deployment is working" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 5
    $oldWorking = $true
} catch {
    Write-Host "❌ Old deployment is NOT working" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    $oldWorking = $false
}

Write-Host "`n----------------------------------------`n"

##############################################
# TEST 3: Root Endpoint (Main)
##############################################
Write-Host "[TEST 3] Testing MAIN root endpoint..." -ForegroundColor Yellow
Write-Host "URL: $mainUrl/`n" -ForegroundColor Gray

try {
    $response = Invoke-WebRequest -Uri "$mainUrl/" -Method GET -TimeoutSec 10 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Root endpoint working! Status: $($response.StatusCode)" -ForegroundColor Green
        Write-Host "Content-Type: $($response.Headers.'Content-Type')" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Root endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "SUMMARY" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

if ($mainWorking) {
    Write-Host "✅✅✅ MAIN DEPLOYMENT IS WORKING! ✅✅✅" -ForegroundColor Green
    Write-Host "`nYour API is live at:" -ForegroundColor Green
    Write-Host "  $mainUrl" -ForegroundColor White
    Write-Host "`nYou can now:" -ForegroundColor Green
    Write-Host "  1. Login to your account" -ForegroundColor White
    Write-Host "  2. Connect to Printful" -ForegroundColor White
    Write-Host "  3. Start using automation" -ForegroundColor White
    Write-Host "`nNext step: Test login (see test-login.ps1)" -ForegroundColor Yellow
} else {
    Write-Host "❌ MAIN DEPLOYMENT IS NOT WORKING" -ForegroundColor Red
    Write-Host "`nPossible issues:" -ForegroundColor Yellow
    Write-Host "  1. Deployment still in progress (wait 60 seconds)" -ForegroundColor White
    Write-Host "  2. Environment variables not in Production" -ForegroundColor White
    Write-Host "  3. New errors after BOM fix" -ForegroundColor White
    Write-Host "`nTo fix:" -ForegroundColor Yellow
    Write-Host "  1. Go to Vercel dashboard" -ForegroundColor White
    Write-Host "  2. Click Deployments → Latest" -ForegroundColor White
    Write-Host "  3. Click Runtime Logs" -ForegroundColor White
    Write-Host "  4. Copy the error and tell Claude" -ForegroundColor White
}

Write-Host "`n========================================`n" -ForegroundColor Cyan

# Pause so user can read results
Read-Host "Press Enter to exit"
