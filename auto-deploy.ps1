# ===============================
# MJ Jerzii - Auto Deploy Script
# ===============================

Write-Host "
?? Starting Automated Deployment..." -ForegroundColor Cyan

# Ensure we’re in the project directory
Set-Location ""

# Check for Git initialization
if (-not (Test-Path ".git")) {
    Write-Host "Initializing new Git repository..." -ForegroundColor Yellow
    git init
}

# Pull latest changes if remote exists
if (git remote) {
    Write-Host "?? Pulling latest changes from remote..." -ForegroundColor Yellow
    git pull origin main --rebase
}

# Stage and commit all changes
Write-Host "?? Staging changes..." -ForegroundColor Yellow
git add .
git commit -m "Automated deployment from PowerShell on 2025-11-08 07:44:38" | Out-Null

# Push to GitHub if remote exists
if (git remote) {
    Write-Host "??  Pushing updates to GitHub..." -ForegroundColor Yellow
    git push origin main
}

# Deploy to Vercel
Write-Host "?? Deploying to Vercel..." -ForegroundColor Cyan
vercel --prod --yes

Write-Host "
? Deployment complete!" -ForegroundColor Green
