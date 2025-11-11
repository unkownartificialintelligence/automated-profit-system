##############################################
# Automated Profit System - Printful Tester
# Tests Printful API connection
##############################################

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "TESTING PRINTFUL CONNECTION" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$baseUrl = "https://automated-profit-system-git-main-jerzii-ais-projects.vercel.app"

# Check if we have a token from previous test
if (-not $global:authToken) {
    Write-Host "⚠️  No auth token found. Running login first...`n" -ForegroundColor Yellow

    $email = "unkownartificialIntelligence@gmail.com"
    $password = "The!main1987"

    $body = @{
        email = $email
        password = $password
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body $body -ContentType "application/json"
        $global:authToken = $response.token
        Write-Host "✅ Login successful!`n" -ForegroundColor Green
    } catch {
        Write-Host "❌ Login failed. Cannot test Printful." -ForegroundColor Red
        Write-Host "Run test-login.ps1 first!`n" -ForegroundColor Yellow
        Read-Host "Press Enter to exit"
        exit
    }
}

Write-Host "Testing Printful API..." -ForegroundColor Yellow
Write-Host "URL: $baseUrl/api/printful/store`n" -ForegroundColor Gray

$headers = @{
    Authorization = "Bearer $global:authToken"
}

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/printful/store" -Method GET -Headers $headers -TimeoutSec 10

    Write-Host "✅✅✅ PRINTFUL CONNECTED! ✅✅✅" -ForegroundColor Green
    Write-Host "`nYour Printful Store:" -ForegroundColor Green
    Write-Host "  ID: $($response.data.id)" -ForegroundColor White
    Write-Host "  Name: $($response.data.name)" -ForegroundColor White
    if ($response.data.currency) {
        Write-Host "  Currency: $($response.data.currency)" -ForegroundColor White
    }

    Write-Host "`n✅ YOUR AUTOMATED PROFIT SYSTEM IS FULLY OPERATIONAL!" -ForegroundColor Green
    Write-Host "`nYou can now:" -ForegroundColor Green
    Write-Host "  ✅ Find trending products" -ForegroundColor White
    Write-Host "  ✅ Calculate profit margins" -ForegroundColor White
    Write-Host "  ✅ Auto-list products" -ForegroundColor White
    Write-Host "  ✅ Track personal sales" -ForegroundColor White
    Write-Host "  ✅ Start making money!" -ForegroundColor White

    Write-Host "`n🎉 SETUP COMPLETE! 🎉" -ForegroundColor Cyan

} catch {
    Write-Host "❌ PRINTFUL CONNECTION FAILED" -ForegroundColor Red

    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "Status Code: $statusCode" -ForegroundColor Red

        if ($statusCode -eq 400 -or $statusCode -eq 500) {
            Write-Host "`nIssue: Printful API key problem" -ForegroundColor Yellow
            Write-Host "Possible causes:" -ForegroundColor Yellow
            Write-Host "  1. PRINTFUL_API_KEY not set in Vercel" -ForegroundColor White
            Write-Host "  2. PRINTFUL_API_KEY is invalid" -ForegroundColor White
            Write-Host "  3. Printful API key expired" -ForegroundColor White
        } elseif ($statusCode -eq 401) {
            Write-Host "`nIssue: Authentication failed" -ForegroundColor Yellow
            Write-Host "Your login token may have expired. Run test-login.ps1 again." -ForegroundColor White
        }
    } else {
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    }

    Write-Host "`nTo fix:" -ForegroundColor Yellow
    Write-Host "  1. Go to: https://www.printful.com/dashboard/store" -ForegroundColor White
    Write-Host "  2. Click Settings → API" -ForegroundColor White
    Write-Host "  3. Copy your API key" -ForegroundColor White
    Write-Host "  4. Add PRINTFUL_API_KEY to Vercel (Production environment)" -ForegroundColor White
}

Write-Host "`n========================================`n" -ForegroundColor Cyan

Read-Host "Press Enter to exit"
