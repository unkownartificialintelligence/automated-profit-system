# ===============================
# Quick Deploy - One Command Solution
# ===============================

# This is a simplified version for quick deployments
# For full features, use Deploy-AutomatedProfitSystem.ps1

Write-Host "`n🚀 Quick Deploy - Automated Profit System`n" -ForegroundColor Cyan

# Configure Git (fixes the Vercel access issue)
Write-Host "⚙️  Configuring Git..." -ForegroundColor Yellow
git config user.name "MJ Jerzii"
git config user.email "mj@jerzii.com"

# Stage and commit changes
$changes = git status --porcelain
if ($changes) {
    Write-Host "📦 Committing changes..." -ForegroundColor Yellow
    git add .
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    git commit -m "Quick deploy: $timestamp"
    
    Write-Host "⬆️  Pushing to GitHub..." -ForegroundColor Yellow
    git push origin main
}
else {
    Write-Host "✓ No changes to commit" -ForegroundColor Green
}

# Deploy to Vercel (personal account)
Write-Host "🌐 Deploying to Vercel..." -ForegroundColor Yellow

# Remove old config and link fresh
if (Test-Path ".\.vercel") {
    Remove-Item -Recurse -Force .\.vercel
}

# Link and deploy to personal account (avoiding team access issue)
vercel link --yes
vercel --prod --yes

Write-Host "`n✅ Deployment Complete!`n" -ForegroundColor Green
