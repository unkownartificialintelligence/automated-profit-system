# ===============================
# TEAM DEPLOYMENT SCRIPT
# For: Jerzii AI Team Projects
# ===============================

Write-Host "`n╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║              JERZII AI - TEAM DEPLOYMENT                    ║" -ForegroundColor Magenta
Write-Host "╚══════════════════════════════════════════════════════════════╝`n" -ForegroundColor Magenta

$TeamConfig = @{
    TeamName    = "jerzii-ai"
    TeamScope   = "jerzii-ai"
    ProjectName = "automated-profit-system"
}

Write-Host "🏢 Team: $($TeamConfig.TeamName)" -ForegroundColor Cyan
Write-Host "📦 Project: $($TeamConfig.ProjectName)`n" -ForegroundColor Cyan

# Check team access
Write-Host "🔐 Verifying team access..." -ForegroundColor Yellow
$whoami = vercel whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ✗ Not logged into Vercel!" -ForegroundColor Red
    Write-Host "  → Run: vercel login" -ForegroundColor Yellow
    exit 1
}
Write-Host "  ✓ Logged in as: $whoami" -ForegroundColor Green

# Configure Git
Write-Host "`n⚙️  Configuring Git..." -ForegroundColor Yellow
git config user.name "Jerzii AI Team"
git config user.email "team@jerzii.com"
Write-Host "  ✓ Git configured" -ForegroundColor Green

# Check for changes
Write-Host "`n📥 Checking for changes..." -ForegroundColor Yellow
$status = git status --porcelain

if ($status) {
    $proceed = Read-Host "  Commit and deploy changes? (yes/no)"
    if ($proceed -eq "yes") {
        git add .
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        git commit -m "Team deploy: $timestamp"
        git push origin main
        Write-Host "  ✓ Changes committed" -ForegroundColor Green
    }
} else {
    Write-Host "  ✓ No changes to commit" -ForegroundColor Green
}

# Deploy to team
Write-Host "`n🚀 Deploying to Team Account..." -ForegroundColor Yellow

if (Test-Path ".\.vercel") {
    Remove-Item -Recurse -Force .\.vercel
}

Write-Host "  → Linking to team project...`n" -ForegroundColor Cyan
vercel link --yes --scope $TeamConfig.TeamScope

Write-Host "`n  → Deploying to production...`n" -ForegroundColor Cyan
vercel --prod --yes --scope $TeamConfig.TeamScope

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║            TEAM DEPLOYMENT SUCCESSFUL                       ║" -ForegroundColor Green
    Write-Host "╚══════════════════════════════════════════════════════════════╝`n" -ForegroundColor Green
} else {
    Write-Host "`n❌ Team deployment failed" -ForegroundColor Red
    Write-Host "💡 Try using Deploy-OWNER.ps1 for personal deployment instead`n" -ForegroundColor Yellow
}
