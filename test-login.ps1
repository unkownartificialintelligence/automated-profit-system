##############################################
# Automated Profit System - Login Tester
# Tests your login credentials
##############################################

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "TESTING LOGIN" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$baseUrl = "https://automated-profit-system-git-main-jerzii-ais-projects.vercel.app"

# Your credentials
$email = "unkownartificialIntelligence@gmail.com"
$password = "The!main1987"

Write-Host "Testing login for: $email" -ForegroundColor Yellow
Write-Host "URL: $baseUrl/api/auth/login`n" -ForegroundColor Gray

# Create login request
$body = @{
    email = $email
    password = $password
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 10

    Write-Host "✅✅✅ LOGIN SUCCESSFUL! ✅✅✅" -ForegroundColor Green
    Write-Host "`nYour Details:" -ForegroundColor Green
    Write-Host "  Email: $($response.user.email)" -ForegroundColor White
    Write-Host "  Name: $($response.user.name)" -ForegroundColor White
    Write-Host "  Role: $($response.user.role)" -ForegroundColor White

    Write-Host "`nYour Access Token:" -ForegroundColor Yellow
    Write-Host "  $($response.token)" -ForegroundColor White

    # Save token for next test
    $global:authToken = $response.token

    Write-Host "`n✅ Authentication is working!" -ForegroundColor Green
    Write-Host "`nNext: Test Printful connection (test-printful.ps1)" -ForegroundColor Yellow

} catch {
    Write-Host "❌ LOGIN FAILED" -ForegroundColor Red

    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "Status Code: $statusCode" -ForegroundColor Red

        if ($statusCode -eq 401) {
            Write-Host "`nIssue: Invalid credentials" -ForegroundColor Yellow
            Write-Host "Possible causes:" -ForegroundColor Yellow
            Write-Host "  1. ADMIN_EMAIL doesn't match: $email" -ForegroundColor White
            Write-Host "  2. ADMIN_PASSWORD_HASH is incorrect" -ForegroundColor White
            Write-Host "  3. Password doesn't match the hash" -ForegroundColor White
        } elseif ($statusCode -eq 500) {
            Write-Host "`nIssue: Server error" -ForegroundColor Yellow
            Write-Host "Possible causes:" -ForegroundColor Yellow
            Write-Host "  1. ADMIN_EMAIL or ADMIN_PASSWORD_HASH not set" -ForegroundColor White
            Write-Host "  2. JWT_SECRET not configured" -ForegroundColor White
        }
    } else {
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    }

    Write-Host "`nTo fix:" -ForegroundColor Yellow
    Write-Host "  1. Verify environment variables in Vercel" -ForegroundColor White
    Write-Host "  2. Check ADMIN_EMAIL = $email" -ForegroundColor White
    Write-Host "  3. Regenerate password hash if needed" -ForegroundColor White
}

Write-Host "`n========================================`n" -ForegroundColor Cyan

Read-Host "Press Enter to exit"
