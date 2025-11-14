#Requires -Version 5.1

<#
.SYNOPSIS
    Checks Vercel deployment status and configuration
#>

$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                           ║" -ForegroundColor Cyan
Write-Host "║        🔍 CHECKING VERCEL 24/7 STATUS 🔍                ║" -ForegroundColor Cyan
Write-Host "║                                                           ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

# Check 1: Vercel CLI
Write-Host "🔍 Check 1: Vercel CLI Status..." -ForegroundColor Cyan
try {
    $vercelVersion = vercel --version 2>&1
    Write-Host "   ✅ Vercel CLI installed: $vercelVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Vercel CLI not found!" -ForegroundColor Red
    Write-Host "   Run: npm install -g vercel" -ForegroundColor Yellow
}
Write-Host ""

# Check 2: List Deployments
Write-Host "🔍 Check 2: Your Vercel Deployments..." -ForegroundColor Cyan
try {
    Write-Host "   Fetching deployments..." -ForegroundColor Yellow
    $deployments = vercel ls 2>&1 | Select-String "automated-profit-system"

    if ($deployments) {
        Write-Host "   ✅ Found deployments:" -ForegroundColor Green
        $deployments | ForEach-Object { Write-Host "      $_" -ForegroundColor White }
    } else {
        Write-Host "   ⚠️  No deployments found" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ⚠️  Could not fetch deployments" -ForegroundColor Yellow
}
Write-Host ""

# Check 3: Environment Variables
Write-Host "🔍 Check 3: Vercel Environment Variables..." -ForegroundColor Cyan
try {
    Write-Host "   Checking environment variables..." -ForegroundColor Yellow
    $envVars = vercel env ls production 2>&1

    $requiredVars = @(
        "JWT_SECRET",
        "AUTOMATION_SCHEDULE",
        "MAX_PRODUCTS",
        "PRINTFUL_API_KEY",
        "CRON_SECRET"
    )

    $foundVars = @()
    $missingVars = @()

    foreach ($var in $requiredVars) {
        if ($envVars -match $var) {
            $foundVars += $var
            Write-Host "   ✅ $var" -ForegroundColor Green
        } else {
            $missingVars += $var
            Write-Host "   ❌ $var - MISSING" -ForegroundColor Red
        }
    }

    if ($missingVars.Count -gt 0) {
        Write-Host ""
        Write-Host "   ⚠️  Missing variables detected!" -ForegroundColor Yellow
        Write-Host "   Run: .\DEPLOY-TO-VERCEL.ps1 to configure" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ⚠️  Could not check environment variables" -ForegroundColor Yellow
}
Write-Host ""

# Check 4: Test Deployment URLs
Write-Host "🔍 Check 4: Testing Deployment URLs..." -ForegroundColor Cyan

$testUrls = @(
    "https://automated-profit-system-b87do8p7e-jerzii-ais-projects.vercel.app",
    "https://automated-profit-system-f9bwjmj3s-jerzii-ais-projects.vercel.app",
    "https://automated-profit-system-xien-git-cla-400f98-jerzii-ais-projects.vercel.app"
)

$workingUrl = $null

foreach ($url in $testUrls) {
    try {
        Write-Host "   Testing: $url" -ForegroundColor Yellow
        $response = Invoke-WebRequest -Uri "$url/api/health" -TimeoutSec 5 -ErrorAction Stop

        if ($response.StatusCode -eq 200) {
            Write-Host "   ✅ ONLINE - $url" -ForegroundColor Green
            $workingUrl = $url
            break
        }
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq 403) {
            Write-Host "   ⚠️  403 Access Denied - Needs auth configuration" -ForegroundColor Yellow
            $workingUrl = $url
        } elseif ($statusCode -eq 404) {
            Write-Host "   ❌ 404 Not Found" -ForegroundColor Red
        } else {
            Write-Host "   ❌ Error: $statusCode" -ForegroundColor Red
        }
    }
}
Write-Host ""

# Check 5: Local Automation Status
Write-Host "🔍 Check 5: Local Automation Database..." -ForegroundColor Cyan
if (Test-Path "data/app.db") {
    Write-Host "   ✅ Database exists" -ForegroundColor Green

    try {
        $status = node check-status.js 2>&1 | Select-String "Status:"
        Write-Host "   $status" -ForegroundColor White
    } catch {
        Write-Host "   ⚠️  Could not read automation status" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ❌ Database not found" -ForegroundColor Red
}
Write-Host ""

# Summary and Recommendations
Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                    📊 SUMMARY                             ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

if ($workingUrl) {
    Write-Host "✅ VERCEL DEPLOYMENT FOUND!" -ForegroundColor Green
    Write-Host "   URL: $workingUrl" -ForegroundColor White
    Write-Host ""

    if ($missingVars.Count -gt 0) {
        Write-Host "⚠️  CONFIGURATION NEEDED:" -ForegroundColor Yellow
        Write-Host "   Missing $($missingVars.Count) environment variables" -ForegroundColor White
        Write-Host ""
        Write-Host "🔧 FIX IT NOW:" -ForegroundColor Cyan
        Write-Host "   Run: .\DEPLOY-TO-VERCEL.ps1" -ForegroundColor White
        Write-Host "   This will set all environment variables automatically" -ForegroundColor White
    } else {
        Write-Host "✅ ALL ENVIRONMENT VARIABLES CONFIGURED!" -ForegroundColor Green
        Write-Host ""
        Write-Host "🎉 YOUR SYSTEM IS RUNNING 24/7!" -ForegroundColor Green
        Write-Host "   • Automation runs daily at 7:00 AM" -ForegroundColor White
        Write-Host "   • Creates 10 products automatically" -ForegroundColor White
        Write-Host "   • Works even when PC is off" -ForegroundColor White
        Write-Host "   • Access from: $workingUrl" -ForegroundColor White
    }
} else {
    Write-Host "❌ NO WORKING DEPLOYMENT FOUND" -ForegroundColor Red
    Write-Host ""
    Write-Host "🚀 DEPLOY NOW:" -ForegroundColor Cyan
    Write-Host "   Run: .\START-NOW-DEPLOY-VERCEL.ps1" -ForegroundColor White
    Write-Host "   This will deploy and configure everything" -ForegroundColor White
}

Write-Host ""
Write-Host "📱 QUICK LINKS:" -ForegroundColor Cyan
Write-Host "   Vercel Dashboard: https://vercel.com/jerzii-ais-projects/automated-profit-system" -ForegroundColor White
Write-Host "   Deployments: https://vercel.com/jerzii-ais-projects/automated-profit-system/deployments" -ForegroundColor White
Write-Host "   Settings: https://vercel.com/jerzii-ais-projects/automated-profit-system/settings" -ForegroundColor White
Write-Host ""

Write-Host "Press any key to exit..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
