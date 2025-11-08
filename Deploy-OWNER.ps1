# ===============================
# PERSONAL OWNER DEPLOYMENT SCRIPT
# For: MJ Jerzii Personal Account
# Full Control - No Team Restrictions
# ===============================

Write-Host "`n╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║           MJ JERZII - PERSONAL OWNER DEPLOYMENT             ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════════════════════╝`n" -ForegroundColor Green

$OwnerConfig = @{
    OwnerName           = "MJ Jerzii"
    OwnerEmail          = "mj@jerzii.com"
    PersonalProjectName = "automated-profit-system-personal"
}

Write-Host "👤 Owner: $($OwnerConfig.OwnerName)" -ForegroundColor Cyan
Write-Host "📦 Project: $($OwnerConfig.PersonalProjectName)" -ForegroundColor Cyan
Write-Host "🔐 Full Control: YES`n" -ForegroundColor Green

# Configure Git
Write-Host "⚙️  Configuring Git..." -ForegroundColor Yellow
git config user.name "$($OwnerConfig.OwnerName)"
git config user.email "$($OwnerConfig.OwnerEmail)"
Write-Host "  ✓ Git configured" -ForegroundColor Green

# Check for changes
Write-Host "`n📥 Checking for changes..." -ForegroundColor Yellow
$status = git status --porcelain

if ($status) {
    Write-Host "  → Found uncommitted changes" -ForegroundColor Cyan
    
    $proceed = Read-Host "  Commit and deploy? (yes/no)"
    if ($proceed -eq "yes") {
        git add .
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        git commit -m "Personal deploy: $timestamp"
        git push origin main
        Write-Host "  ✓ Changes committed and pushed" -ForegroundColor Green
    }
} else {
    Write-Host "  ✓ No changes to commit" -ForegroundColor Green
}

# Deploy
Write-Host "`n🚀 Deploying to YOUR Personal Account..." -ForegroundColor Yellow
Write-Host "  🔐 Full Owner Control - No Team Restrictions`n" -ForegroundColor Green

# Remove old config
if (Test-Path ".\.vercel") {
    Remove-Item -Recurse -Force .\.vercel
}

# Deploy with specific project name
Write-Host "  → Creating deployment...`n" -ForegroundColor Cyan
vercel --prod --yes --name $OwnerConfig.PersonalProjectName

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║         PERSONAL DEPLOYMENT SUCCESSFUL                      ║" -ForegroundColor Green
    Write-Host "╚══════════════════════════════════════════════════════════════╝`n" -ForegroundColor Green
    
    Write-Host "✅ Deployed to: YOUR Personal Account" -ForegroundColor Green
    Write-Host "✅ Project: $($OwnerConfig.PersonalProjectName)" -ForegroundColor Green
    Write-Host "✅ Full Control: YES`n" -ForegroundColor Green
} else {
    Write-Host "`n❌ Deployment failed`n" -ForegroundColor Red
}
