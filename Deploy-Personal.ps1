#!/usr/bin/env pwsh
# Quick Personal Deployment Script
# Forces deployment to personal Vercel account

Write-Host "`n🚀 Personal Account Deployment`n" -ForegroundColor Cyan

# Remove old Vercel config
Write-Host "→ Cleaning old Vercel config..." -ForegroundColor Yellow
Remove-Item -Recurse -Force .\.vercel -ErrorAction SilentlyContinue

# Set environment to bypass Git checks
$env:VERCEL_ORG_ID = ""
$env:VERCEL_PROJECT_ID = ""

Write-Host "→ Deploying to your personal account..." -ForegroundColor Yellow
Write-Host "   (When prompted, select your personal account, NOT the team)`n" -ForegroundColor Gray

# Deploy with explicit scope to personal account
vercel deploy --prod --scope unkownartificialintelligence-1296

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Deployment Successful!`n" -ForegroundColor Green
    Write-Host "🌐 Your health monitoring system is now live!" -ForegroundColor Cyan
    Write-Host "`nTest your endpoints:" -ForegroundColor White
    Write-Host "  • /api/health - Health dashboard" -ForegroundColor Gray
    Write-Host "  • /api/printful/store - Printful stats" -ForegroundColor Gray
    Write-Host "  • /api/printful/products - Product catalog`n" -ForegroundColor Gray
} else {
    Write-Host "`n❌ Deployment failed. Error code: $LASTEXITCODE`n" -ForegroundColor Red
    Write-Host "Try manual deployment:" -ForegroundColor Yellow
    Write-Host "  vercel deploy --prod`n" -ForegroundColor Gray
}
