#Requires -Version 5.1

<#
.SYNOPSIS
    Automatically adds all environment variables to Vercel
#>

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "   ⚙️  VERCEL ENVIRONMENT VARIABLES SETUP" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

# Check if Vercel CLI is installed
Write-Host "🔍 Checking Vercel CLI..." -ForegroundColor Cyan
try {
    $vercelVersion = vercel --version 2>&1 | Select-Object -First 1
    Write-Host "   ✅ Vercel CLI found: $vercelVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Vercel CLI not found" -ForegroundColor Red
    Write-Host "   📦 Installing Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
    Write-Host "   ✅ Vercel CLI installed" -ForegroundColor Green
}
Write-Host ""

# Check if user is logged in
Write-Host "🔐 Checking Vercel authentication..." -ForegroundColor Cyan
try {
    $vercelUser = vercel whoami 2>&1 | Select-Object -Last 1
    Write-Host "   ✅ Logged in as: $vercelUser" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️  Not logged in to Vercel" -ForegroundColor Yellow
    Write-Host "   🔐 Opening Vercel login..." -ForegroundColor Cyan
    vercel login
    $vercelUser = vercel whoami 2>&1 | Select-Object -Last 1
    Write-Host "   ✅ Logged in as: $vercelUser" -ForegroundColor Green
}
Write-Host ""

# Environment variables to set
Write-Host "⚙️  Adding environment variables to Vercel..." -ForegroundColor Cyan
Write-Host "-----------------------------------------------------------" -ForegroundColor Gray

$envVars = @{
    "JWT_SECRET" = "f64c1c7ec382d75018167264a66955b68cc9b889a100aa145e443403b7728295"
    "CRON_SECRET" = "f9b766f815e103e27070abcc62198ab084a114f3d7bab6b19eefdbe24c2ef608"
    "PRINTFUL_API_KEY" = "UoNNmC4bEyqNuFMyAdtBby2YlVtORc7piy2I9UOS"
    "AUTOMATION_SCHEDULE" = "0 7 * * *"
    "MAX_PRODUCTS" = "10"
    "GENERATE_DESIGNS" = "true"
    "CREATE_LISTINGS" = "true"
    "GENERATE_MARKETING" = "true"
    "GLOBAL_TRENDING" = "true"
    "TRENDING_REGIONS" = "US,GB,CA,AU,DE,FR,JP,BR,IN,MX"
}

$count = 0
foreach ($key in $envVars.Keys) {
    Write-Host "   ⚙️  Setting: $key" -ForegroundColor Yellow
    try {
        echo $envVars[$key] | vercel env add $key production --force 2>&1 | Out-Null
        Write-Host "   ✅ Added: $key" -ForegroundColor Green
        $count++
    } catch {
        Write-Host "   ⚠️  Issue with $key (may already exist)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "-----------------------------------------------------------" -ForegroundColor Gray
Write-Host "✅ Added $count environment variables to Vercel!" -ForegroundColor Green
Write-Host ""

Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                                                           ║" -ForegroundColor Green
Write-Host "║     ✅ ENVIRONMENT VARIABLES CONFIGURED! ✅             ║" -ForegroundColor Green
Write-Host "║                                                           ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "🚀 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Deploy to production: .\START-NOW-DEPLOY-VERCEL.ps1" -ForegroundColor White
Write-Host "   2. Or run: vercel --prod --yes" -ForegroundColor White
Write-Host ""

Write-Host "💡 Your environment variables are now configured on Vercel!" -ForegroundColor Green
Write-Host "   The next deployment will use these settings automatically." -ForegroundColor White
Write-Host ""

Write-Host "Press any key to continue..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
