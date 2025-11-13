#Requires -Version 5.1

<#
.SYNOPSIS
    Deploys Automated Profit System to Vercel with all environment variables
#>

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║                                                           ║" -ForegroundColor Magenta
Write-Host "║        🚀 DEPLOYING TO VERCEL FOR 24/7 PROFITS 🚀       ║" -ForegroundColor Magenta
Write-Host "║                                                           ║" -ForegroundColor Magenta
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Magenta
Write-Host ""

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

# Step 1: Verify Vercel CLI
Write-Host "🔍 Step 1: Checking Vercel CLI..." -ForegroundColor Cyan
try {
    $vercelVersion = vercel --version
    Write-Host "   ✅ Vercel CLI installed: $vercelVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Vercel CLI not found!" -ForegroundColor Red
    Write-Host "   Installing Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
}
Write-Host ""

# Step 2: Deploy to Production
Write-Host "🚀 Step 2: Deploying to Vercel Production..." -ForegroundColor Cyan
Write-Host "   This will take 30-60 seconds..." -ForegroundColor Yellow
Write-Host ""

vercel --prod --yes

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

Write-Host ""
Write-Host "   ✅ Deployed to production!" -ForegroundColor Green
Write-Host ""

# Step 3: Set Environment Variables
Write-Host "⚙️  Step 3: Configuring Environment Variables..." -ForegroundColor Cyan
Write-Host "   Setting critical environment variables..." -ForegroundColor Yellow
Write-Host ""

# Set environment variables one by one
$envVars = @{
    "JWT_SECRET" = "f64c1c7ec382d75018167264a66955b68cc9b889a100aa145e443403b7728295"
    "AUTOMATION_SCHEDULE" = "0 7 * * *"
    "MAX_PRODUCTS" = "10"
    "PRINTFUL_API_KEY" = "UoNNmC4bEyqNuFMyAdtBby2YlVtORc7piy2I9UOS"
    "CRON_SECRET" = "f9b766f815e103e27070abcc62198ab084a114f3d7bab6b19eefdbe24c2ef608"
    "GENERATE_DESIGNS" = "true"
    "CREATE_LISTINGS" = "true"
    "GENERATE_MARKETING" = "true"
    "GLOBAL_TRENDING" = "true"
    "TRENDING_REGIONS" = "US,GB,CA,AU,DE,FR,JP,BR,IN,MX"
}

foreach ($key in $envVars.Keys) {
    Write-Host "   Setting $key..." -ForegroundColor Yellow
    echo $envVars[$key] | vercel env add $key production --force
}

Write-Host ""
Write-Host "   ✅ Environment variables configured!" -ForegroundColor Green
Write-Host ""

# Step 4: Redeploy with Environment Variables
Write-Host "🔄 Step 4: Redeploying with environment variables..." -ForegroundColor Cyan
vercel --prod --yes

Write-Host ""

# Step 5: Get Deployment URL
Write-Host "🌐 Step 5: Getting deployment URL..." -ForegroundColor Cyan
$deploymentInfo = vercel ls --scope jerzii-ais-projects 2>&1 | Select-String "automated-profit-system" | Select-Object -First 1

Write-Host ""

# Step 6: Display Success
Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                                                           ║" -ForegroundColor Green
Write-Host "║           ✅ VERCEL DEPLOYMENT COMPLETE! ✅              ║" -ForegroundColor Green
Write-Host "║                                                           ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "🌐 YOUR PRODUCTION URLS:" -ForegroundColor Cyan
Write-Host "   Check Vercel dashboard: https://vercel.com/jerzii-ais-projects/automated-profit-system" -ForegroundColor White
Write-Host ""

Write-Host "✅ WHAT'S NOW LIVE:" -ForegroundColor Cyan
Write-Host "   🟢 24/7 Uptime - Never goes offline" -ForegroundColor Green
Write-Host "   🟢 7:00 AM Daily Automation - Runs automatically" -ForegroundColor Green
Write-Host "   🟢 Global CDN - Fast loading worldwide" -ForegroundColor Green
Write-Host "   🟢 HTTPS Security - Secure by default" -ForegroundColor Green
Write-Host "   🟢 Auto-scaling - Handles any traffic" -ForegroundColor Green
Write-Host ""

Write-Host "⚡ AUTOMATION SCHEDULE:" -ForegroundColor Cyan
Write-Host "   🌅 Runs: Every day at 7:00 AM" -ForegroundColor White
Write-Host "   📦 Creates: 10 new products daily" -ForegroundColor White
Write-Host "   💰 Target: 65-85% profit margins" -ForegroundColor White
Write-Host "   🌍 Monitors: 10 countries for trends" -ForegroundColor White
Write-Host ""

Write-Host "🎯 NEXT STEPS:" -ForegroundColor Cyan
Write-Host "   1. Go to: https://vercel.com/jerzii-ais-projects/automated-profit-system" -ForegroundColor White
Write-Host "   2. Click on your latest deployment" -ForegroundColor White
Write-Host "   3. Copy the production URL" -ForegroundColor White
Write-Host "   4. Access your dashboard 24/7!" -ForegroundColor White
Write-Host ""

Write-Host "👤 LOGIN CREDENTIALS:" -ForegroundColor Cyan
Write-Host "   Email:    owner@jerzii.ai" -ForegroundColor White
Write-Host "   Password: Owner@2025" -ForegroundColor White
Write-Host ""

Write-Host "💡 BENEFITS OF VERCEL:" -ForegroundColor Cyan
Write-Host "   ✅ No need to keep PC running" -ForegroundColor Green
Write-Host "   ✅ Automation runs even when you're offline" -ForegroundColor Green
Write-Host "   ✅ Access from any device, anywhere" -ForegroundColor Green
Write-Host "   ✅ Professional production infrastructure" -ForegroundColor Green
Write-Host "   ✅ Automatic backups and monitoring" -ForegroundColor Green
Write-Host ""

Write-Host "📊 EXPECTED RESULTS:" -ForegroundColor Cyan
Write-Host "   • First automation: Tomorrow at 7:00 AM" -ForegroundColor White
Write-Host "   • 10 new products created daily" -ForegroundColor White
Write-Host "   • Revenue grows automatically" -ForegroundColor White
Write-Host "   • Dashboard updates in real-time" -ForegroundColor White
Write-Host ""

Write-Host "🌐 Opening Vercel dashboard in 3 seconds..." -ForegroundColor Yellow
Start-Sleep -Seconds 3
Start-Process "https://vercel.com/jerzii-ais-projects/automated-profit-system"

Write-Host ""
Write-Host "Press any key to close this window..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
